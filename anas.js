
import WebSocket from 'ws';
import { EventEmitter } from 'events';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const blackListedEvents = ["CHANNEL_UNREAD_UPDATE", "CONVERSATION_SUMMARY_UPDATE", "SESSIONS_REPLACE"];
const GATEWAY_URL = 'wss://gateway.discord.gg/?v=10&encoding=json';
const statusList = ["online", "idle", "dnd", "invisible", "offline"];

// ========== Voice Client Class ==========
class voiceClient extends EventEmitter {
    ws = null;
    heartbeatInterval;
    sequenceNumber = null;
    firstLoad = true;
    reconnectAttempts = 0;
    ignoreReconnect = false;
    reconnectTimeout;
    invalidSession = false;
    token;
    guildId;
    channelId;
    selfMute;
    selfDeaf;
    autoReconnect;
    presence;
    user_id = null;

    constructor(config) {
        super();
        if (!config.token) {
            throw new Error('token, guildId, and channelId are required');
        }
        this.token = config.token;
        this.guildId = config?.serverId;
        this.channelId = config?.channelId;
        this.selfMute = config.selfMute ?? true;
        this.selfDeaf = config.selfDeaf ?? true;
        this.autoReconnect = {
            enabled: config.autoReconnect.enabled ?? false,
            delay: (config.autoReconnect.delay ?? 1) * 1000,
            maxRetries: config.autoReconnect?.maxRetries ?? 9999,
        };
        if (config?.presence?.status) {
            this.presence = config.presence;
        }
    }

    connect() {
        if (this.invalidSession) return;
        this.ws = new WebSocket(GATEWAY_URL, {
            skipUTF8Validation: true,
        });
        this.setMaxListeners(5);
        this.ws.on('open', () => {
            this.emit('connected');
            this.emit('debug', '🌐 Connected to Discord Gateway');
        });
        this.ws.on('message', (data) => {
            const payload = JSON.parse(data.toString());
            const { t: eventType, s: seq, op, d } = payload;
            const isBlackListed = blackListedEvents.includes(eventType);
            if (isBlackListed) return;
            if (seq !== null) this.sequenceNumber = seq;
            switch (op) {
                case 10:
                    this.emit('debug', 'Received Hello (op 10)');
                    this.startHeartbeat(d.heartbeat_interval);
                    this.identify();
                    break;
                case 11:
                    this.emit('debug', 'Heartbeat acknowledged');
                    break;
                case 9:
                    this.emit('debug', 'Invalid session. Reconnecting...');
                    this.invalidSession = true;
                    if (this.ws) {
                        this.ws.terminate();
                    }
                    this.cleanup();
                    break;
                case 0:
                    if (eventType === 'READY') {
                        this.emit('ready', {
                            username: d.user.username,
                            discriminator: d.user.discriminator
                        });
                        this.emit('debug', `🎉 Logged in as ${d.user.username}#${d.user.discriminator}`);
                        this.user_id = d.user.id;
                        this.joinVoiceChannel();
                        this.sendStatusUpdate();
                    }
                    else if (eventType === 'VOICE_STATE_UPDATE') {
                        if (d.user_id === this.user_id && d.channel_id === this.channelId && d?.guild_id === this.guildId && this.firstLoad) {
                            this.emit('voiceReady');
                            console.log('Voice channel joined successfully');
                            this.emit('debug', 'Successfully joined voice channel');
                            this.firstLoad = false;
                        }
                        else if (d.user_id === this.user_id && (this.guildId && this.channelId && d?.channel_id !== this.channelId || d?.guild_id !== this.guildId)) {
                            if (this.autoReconnect.enabled) {
                                console.log('Received VOICE_STATE_UPDATE event, attempting to reconnect');
                                if (this.ignoreReconnect) {
                                    console.log('Already reconnected, ignoring this event');
                                    return;
                                }
                                this.reconnectAttempts++;
                                if (this.reconnectAttempts < this.autoReconnect.maxRetries) {
                                    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
                                    this.emit('debug', `Reconnecting... (${this.reconnectAttempts}/${this.autoReconnect.maxRetries})`);
                                    this.ignoreReconnect = true;
                                    this.reconnectTimeout = setTimeout(() => {
                                        this.joinVoiceChannel();
                                    }, this.autoReconnect.delay);
                                }
                                else {
                                    this.emit('debug', 'Max reconnect attempts reached. Stopping.');
                                    this.cleanup();
                                }
                            }
                        }
                    }
                    break;
            }
        });
        this.ws.on('close', () => {
            this.emit('disconnected');
            this.emit('debug', '❌ Disconnected. Reconnecting...');
            this.cleanup();
            if (this.firstLoad) {
                console.log(`Bad token or invalid channelId/guildId`);
                return;
            }
            setTimeout(() => this.connect(), 5000);
        });
        this.ws.on('error', (err) => {
            this.emit('error', err);
            this.emit('debug', `WebSocket error: ${err.message}`);
        });
    }

    startHeartbeat(interval) {
        this.heartbeatInterval = setInterval(() => {
            this.ws?.send(JSON.stringify({ op: 1, d: this.sequenceNumber }));
            this.emit('debug', 'Sending heartbeat');
        }, interval);
    }

    identify() {
        const payload = {
            op: 2,
            d: {
                token: this.token,
                intents: 128,
                properties: {
                    os: 'Windows',
                    browser: 'Chrome',
                    device: ''
                },
            }
        };
        this.ws?.send(JSON.stringify(payload));
        this.emit('debug', 'Sending identify payload');
    }

    joinVoiceChannel() {
        if (!this.guildId || !this.channelId) return;
        const voiceStateUpdate = {
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: this.channelId,
                self_mute: this.selfMute,
                self_deaf: this.selfDeaf
            }
        };
        this.ws?.send(JSON.stringify(voiceStateUpdate));
        this.emit('debug', '🎤 Sent voice channel join request');
        setTimeout(() => {
            this.ignoreReconnect = false;
        }, 1000);
    }

    cleanup() {
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
        this.ws = null;
        this.sequenceNumber = null;
    }

    sendStatusUpdate() {
        const status = this?.presence?.status?.toLowerCase();
        if (!status || !statusList.includes(status)) return;
        const payload = {
            "op": 3,
            "d": {
                status: this.presence.status,
                activities: [],
                since: Math.floor(Date.now() / 1000) - 10,
                afk: true
            }
        };
        this.ws?.send(JSON.stringify(payload));
        this.emit('debug', `Status updated to ${this.presence.status}`);
    }

    disconnect() {
        this.cleanup();
        this.emit('debug', 'Client manually disconnected');
    }
}

// ========== Tokens Configuration ==========
const tokens = [
    {
        channelId: "1420514054023417980",
        serverId: "1411299081040691213",
        token: process.env.anas || "",
        selfDeaf: false,
        autoReconnect: {
            enabled: true,
            delay: 5,
            maxRetries: 5,
        },
        presence: {
            status: "idle",
        },
        selfMute: true,
    },
];

// ========== Express Server Setup ==========
const app = express();
const port = 3000;
let url = "";
let uptimeDate = Date.now();
let requests = 0;
let response = null;

app.use((req, res, next) => {
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];
    const domain = hostname.replace(`${subdomain}.`, '');
    req.subdomain = subdomain;
    req.domain = domain;
    url = `https://${subdomain}.${domain}/`;
    next();
});

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening at ${url}`));

// ========== Error Handling ==========
process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// ========== Keep-Alive Ping ==========
setInterval(async () => {
    console.log(url);
    try {
        response = await fetch(url, { method: 'HEAD' });
        requests += 1;
        console.log(`Request done with status ${response.status} ${requests}`);
    } catch (error) {
        if (error.response) {
            requests += 1;
            console.log(`Response status: ${error.response.status}${requests}`);
        }
    } finally {
        response = null;
    }
}, 15000);

// ========== Start Voice Clients ==========
const cleanTokens = tokens.reduce((acc, token) => {
    const isValid = token?.token?.length > 30;
    const isDuplicate = acc.some(t => t.token === token.token);
    if (isValid && !isDuplicate) {
        acc.push(token);
    }
    else {
        console.warn('Invalid or duplicate token configuration:', token);
    }
    return acc;
}, []);

for (const token of cleanTokens) {
    const client = new voiceClient(token);
    client.on('ready', (user) => {
        console.log(`Logged in as ${user.username}#${user.discriminator}`);
    });
    client.on('connected', () => {
        console.log('Connected to Discord');
    });
    client.on('disconnected', () => {
        console.log('Disconnected from Discord');
    });
    client.on('voiceReady', () => {
        console.log('Voice is ready');
    });
    client.on('error', (error) => {
        console.error('Error:', error);
    });
    client.on('debug', (message) => {
        console.debug(message);
    });
    client.connect();
}
