//selfbot you status
/*
const { Client } = require('discord.js-selfbot-v13');
const client = new Client({ checkUpdate: false });

client.on('ready', async () => {
  console.log(`${client.user.username} is Ready For Working 24/7!`);
  client.user.setActivity('Your Stream Title', {
    type: 'STREAMING',
    url: 'https://twitch.tv/mogg' 
  });
});

client.login(process.env.token);

*/
//manger you status  

const Discord = require('discord.js-selfbot-v13');
const client = new Discord.Client({
  readyStatus: false,
  checkUpdate: false,
  syncStatus: false
});
//environment
require('dotenv').config()

process.on('uncaughtException', (err) => {
  if (err.message && err.message.includes('friend_source_flags')) {
    return;
  }
  if (err.message && err.message.includes("Cannot read properties")) {
    if (err.stack && err.stack.includes("ClientUserSettingManager")) {
      return;
    }
  }
  if (err.message && err.message.includes("ClientUserSettingManager")) {
    return;
  }
  if (err.message && err.message.includes("locale")) {
    return;
  }
  if (err.message && err.message.includes("guild_folders")) {
    return;
  }
  if (err.message && err.message.includes("localeObject")) {
    return;
  }
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  const errorStr = String(reason);
  if (errorStr.includes('friend_source_flags') || 
      errorStr.includes('ClientUserSettingManager') ||
      errorStr.includes('locale') ||
      errorStr.includes('guild_folders')) {
    return;
  }
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

function formatTime() { 
  const date = new Date();
  const options = {
    timeZone: 'America/New_York', 
    hour12: true,
    hour: 'numeric',
    minute: 'numeric'
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
}
const express = require("express")
const app = express();
var listener = app.listen(process.env.PORT || 3101, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
app.get('/', (req, res) => {
  res.send(`
  <body>
  <center><h1>Bot 24H ON!</h1></center
  </body>`)
});
client.on('ready', async () => {
  console.clear();
  console.log(`${client.user.tag} - rich presence started!`);

  const r = new Discord.RichPresence(client)
    .setApplicationId('1436126675828998274')
    .setType('WATCHING')
    .setURL('https://www.twitch.tv/apparentlyjack_rl') 
//    .setState('هنا ايش ')
    .setName('Qaeda tul jihad')
//    .setDetails(`هنا هم ايش`)
    .setStartTimestamp(Date.now())
 .setAssetsLargeImage('https://cdn.discordapp.com/attachments/1332738938372100136/1436819546546901084/IMG-3861.jpg?ex=6910fdfa&is=690fac7a&hm=94e3d69e93e128c1d894a0dc8d4b187529328b52178f03d01b34474afcf064cb&')
    .setAssetsLargeText('jihad') 
    .setAssetsSmallImage('https://cdn.discordapp.com/attachments/1332738938372100136/1436819528922435624/IMG-4908.jpg?ex=6910fdf6&is=690fac76&hm=ac9d8e91de3e1d95070d2ef3d09d0f43dd718247f3c7617128a4a427b7ea4b0b&')
    .setAssetsSmallText('Small')
    .addButton('Don\'t click', 'https://media.discordapp.net/attachments/1182328760641527858/1415501614491500614/audio.put.replace-1-1.mov?ex=6911389b&is=690fe71b&hm=e8a4821bc0eea4d9b9dd736c8c8d4299b39d9b86f63a0e7b94a8da60999bc39a&');

  client.user.setActivity(r);
  client.user.setPresence({ status: "dnd" }); //dnd, online, idle, offline

});

const mySecret = process.env['TOKEN'];
client.login("MTM1NjY1NTQ2MDI0MTExMzA5OA.GOVaX-.vFvrW_kSSWRv5cBcUyNXGb-tgTt3t3SaGdyHkA");

setTimeout(() => {
  if (client.user) {
    console.log(`${client.user.tag} - Bot is working!`);
  } else {
    console.log('Bot is connecting...');
  }
}, 10000);