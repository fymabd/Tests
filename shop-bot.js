const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
const { QuickDB, JSONDriver } = require("quick.db");
const fs = require('fs');
const {
    EmbedBuilder,
    WebhookClient,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ApplicationCommandOptionType,
    ChannelType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ComponentType,
    PermissionFlagsBits,
    StringSelectMenuBuilder,
    REST,
    Routes
} = require("discord.js");
const ms = require('ms');

// استيراد الأوامر المنظمة
const commands = require('./commands');


// إعدادات البوت المحدثة

const config = {
    token: process.env.TOKEN || "غغغغ",
    Admin: "1405451560569540708",
    line: "https://cdn.discordapp.com/attachments/1332738938372100136/1401264541903360201/c8d9bd0f1ab908f7.png?ex=689d7c8d&is=689c2b0d&hm=faab726b1f707c2ee5d2cef2c3019cee89647941b8806b856161094a07d9b72b&",
    prefix: "-",
    log: "1405451296529449020",
    tax: "1405695210691887237",
    commandlog: "1405451296529449020",
    debuglog: "1405298793188167792", // قناة إرسال رسائل التصحيح
    words: ['بيع', 'شراء', 'سعر', 'عرض', 'هاك', 'فيزا', 'مطلوب', 'كرديت', 'متوفر', 'حساب', 'شوب', 'خاص', 'فيزات', 'مقابل'],
    button1: "PLATENUEM",
    button2: "GRAND MASTER",
    button3: "MASTER",
    button4: "DIAMOND",
    button5: "BRONZE",
    bank: "966178756341411862",
    probot: "282859044593598464",
    catagory: "1405450998490599424",
    info: "https://media.discordapp.net/attachments/1301558735415545907/1302795627306025120/New_Project_133_69BBD87.png",
    shop1: "1405450742885646396",
    shop2: "1405450841829150791",
    shop3: "1405450863820017685",
    shop4: "1405450813769383936",
    shop5: "1405450948050030685",
    here: 2,
    every: 2,
    help: "1278638315586977793"
};

// إعداد قاعدة البيانات
const jsonDriver = new JSONDriver();
const db = new QuickDB({ driver: jsonDriver });

// المتغيرات المفقودة
let orderChannel = "";

// إضافة المتغيرات المفقودة للأسعار
config.every = config.every || 2;
config.here = config.here || 2;
config.oeverey = config.oeverey || 5;
config.ohere = config.ohere || 3;
config.removeWarningPrice = config.removeWarningPrice || 2;
config.enableShopPrice = config.enableShopPrice || 2;
config.changeNamePrice = config.changeNamePrice || 1;
config.shopMentionPrice = config.shopMentionPrice || 2;

// إعداد العميل
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    ws: {
        properties: {
            $browser: "Discord Android" // يمكنك تغييرها إلى "Discord iOS" أو "Discord Client"
        }
    }
});

// تم إزالة Express - غير مطلوب في Replit

// دالة توليد لون عشوائي
function randomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// دالة لإنشاء إمبد مع تصميم موحد
function createStandardEmbed(title, description, guild) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(guild?.iconURL({ size: 256 }))
        .setColor(randomColor())
        .setFooter({ text: 'Dev By: _d3q', iconURL: guild?.iconURL() })
        .setTimestamp();
}

// دالة لإرسال رسائل التصحيح إلى Discord
async function sendDebugLog(message, channelName = 'غير محدد', username = 'غير محدد') {
    try {
        const debugChannel = client.channels.cache.get(config.debuglog);
        if (debugChannel) {
            const embed = createStandardEmbed('🔍 رسالة تصحيح البوت', message, client.guilds.cache.first());
            embed.addFields(
                { name: 'اسم الروم', value: channelName, inline: true },
                { name: 'اسم المستخدم', value: username, inline: true },
                { name: 'الوقت', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
            );

            await debugChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('خطأ في إرسال رسالة التصحيح:', error);
    }
}

// أنواع المتاجر المحدثة
const types = require('./types.js');

// قائمة كلمات التشفير
const replace = [
    { word: "متوفر", replace: "مـ.ـتوفر" },
    { word: "بيع", replace: " بــيـ,ــع " },
    { word: "شوب", replace: "شـ,ــوب" },
    { word: "ديسكورد", replace: "ديس_ورد" },
    { word: "تبادل", replace: "تبا1دل" },
    { word: "توكن", replace: "ت9كن" },
    { word: "بوست", replace: "ب9ست" },
    { word: "حساب", replace: "حسـ,ــاب" },
    { word: "نتفيلكس", replace: "ن$$فيلكس" },
    { word: "سعر", replace: "سـعـ,ــر" },
    { word: "مطلوب", replace: "مـ.ـطلوب" },
    { word: "دولار", replace: "دولاr" },
    { word: "روبوكس", replace: "ر9بوكس" },
    { word: "نيترو", replace: "نيتر9" },
    { word: "مقابل", replace: "مـ,ـقابل" },
    { word: "فيزات", replace: "فـيـ,زات" },
    { word: "خاص", replace: " خـ,ــاص" }
];



// أحداث البوت
client.once('ready', async () => {
    console.log(`✅ Bot logged in as ${client.user.tag}`);

    // تحديث حالة البوت مع البينغ
    setInterval(() => {
        const ping = Math.round(client.ws.ping);
        client.user.setPresence({
            activities: [{ name: `My ping ${ping}ms by l_7r`, type: 0 }],
            status: 'online'
        });
    }, 10000); // كل 10 ثوانِ

    // تسجيل الأوامر
    const slashDefinitions = getCommands();
    const rest = new REST().setToken(config.token);

    try {
        console.log('🔄 تحديث أوامر البوت...');
        const data = await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: slashDefinitions }
        );
        console.log(`✅ تم تحديث ${data.length} أوامر بنجاح`);
    } catch (error) {
        console.error('❌ خطأ في تحديث الأوامر:', error);
    }

    // استعادة النشر التلقائي
    await restoreAutoPostTimers();
});

// دالة استعادة مؤقتات النشر التلقائي بعد إعادة تشغيل البوت
async function restoreAutoPostTimers() {
    try {
        console.log('🔄 استعادة مؤقتات النشر التلقائي...');

        const guilds = client.guilds.cache;
        let restoredCount = 0;

        for (const [guildId, guild] of guilds) {
            const channels = await guild.channels.fetch();

            for (const [channelId, channel] of channels) {
                const autoPostData = await db.get(`autopost_${channelId}`);

                if (autoPostData && autoPostData.active) {
                    startAutoPostTimer(channelId);
                    restoredCount++;
                }
            }
        }

        console.log(`✅ تم استعادة ${restoredCount} مؤقت نشر تلقائي`);
    } catch (error) {
        console.error('❌ خطأ في استعادة مؤقتات النشر التلقائي:', error);
    }
}

// فحص الرمز المميز
if (!config.token || config.token === "غغغغ") {
    console.error('❌ لم يتم العثور على رمز البوت (TOKEN)!');
    console.log('💡 تأكد من إضافة TOKEN في Secrets:');
    console.log('1. اذهب إلى قسم Secrets في Replit');
    console.log('2. أضف key: TOKEN');
    console.log('3. أضف value: رمز البوت من Discord Developer Portal');
    process.exit(1);
}

console.log('🔐 جاري تسجيل الدخول...');

// تسجيل الدخول
client.login(config.token).catch(error => {
    console.error('❌ فشل في تسجيل الدخول:', error.message);
    console.log('💡 تحقق من:');
    console.log('1. صحة رمز البوت في Secrets');
    console.log('2. تفعيل الـ Intents في Discord Developer Portal');
    console.log('3. أن البوت مدعو للسيرفر بالصلاحيات المطلوبة');
});

// مراقبة إنشاء القنوات الجديدة
client.on('channelCreate', async (channel) => {
    if (channel.type === ChannelType.GuildText && channel.parentId) {
        const type = types.find(t => t.id === channel.parentId);
        if (type) {
            await db.set(`shop_${channel.id}`, {
                id: channel.id,
                type: type.role,
                shop: type.shop,
                here: type.here,
                every: type.every,
                status: "1",
                owner: null,
                date: `<t:${Math.floor(Date.now() / 1000)}:R>`,
                warns: 0,
                badge: type.badge
            });
        }
    }
});

// مراقبة الرسائل للكلمات غير المشفرة
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const shopData = await db.get(`shop_${message.channel.id}`);
    if (shopData) {
        const foundKeywords = config.words.filter(word => message.content.includes(word));

        if (foundKeywords.length > 0) {
            const embed = createStandardEmbed('🚨 تم العثور على كلمة غير مشفرة', `الكلمات غير المشفرة: ${foundKeywords.join(', ')}`, message.guild);
            embed.addFields(
                { name: 'صاحب الرسالة:', value: `<@${message.author.id}>`, inline: true },
                { name: 'الرسالة:', value: message.url, inline: true },
                { name: 'الروم:', value: message.channel.url, inline: true }
            );

            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('admin_warning')
                        .setLabel('استلام التحذير')
                        .setStyle(ButtonStyle.Primary)
                );

            const logChannel = await message.guild.channels.fetch(config.log);
            const sentMessage = await logChannel.send({
                content: '@everyone',
                embeds: [embed],
                components: [button]
            });

            const collector = sentMessage.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 300000
            });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'admin_warning') {
                    const newEmbed = createStandardEmbed('✅ تم استلام التحذير', `تم استلام التحذير بواسطة <@${interaction.user.id}>`, message.guild);

                    const disabledButton = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('admin_warning')
                                .setLabel(`تم الاستلام - ${interaction.user.username}`)
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)
                        );

                    await interaction.update({ embeds: [newEmbed], components: [disabledButton] });

                    await db.add(`shop_${message.channel.id}.warns`, 1);

                    const warningEmbed = createStandardEmbed('⚠️ تم تحذير المتجر', message.channel.url, message.guild);
                    warningEmbed.setFooter({ text: '_d3q', iconURL: message.guild.iconURL() });
                    warningEmbed.addFields({
                        name: 'السبب:',
                        value: `عدم تشفير الكلمات: ${foundKeywords.join(', ')}`
                    });

                    await message.channel.send({ embeds: [warningEmbed] });
                }
            });
        }
    }

    // حساب الضريبة
    if (message.channel.id === config.tax && config.tax) {
        handleTaxCalculation(message);
    }

    // مراقبة المنشنات
    if (shopData) {
        await handleMentions(message, shopData);
    }
});

// معالجة المنشنات
async function handleMentions(message, shopData) {
    let shouldSendLine = false;

    if (message.content.includes('@everyone')) {
        if (shopData.every > 0) {
            await db.sub(`shop_${message.channel.id}.every`, 1);
            shouldSendLine = true;
        } else {
            // حذف الرسالة ومنع الإرسال
            try {
                await message.delete();
            } catch (error) {
                console.error('خطأ في حذف الرسالة:', error);
            }

            // إرسال رسالة تحذير مؤقتة
            const warningMsg = await message.channel.send({
                content: `<@${message.author.id}> ❌ **لا يمكنك استخدام منشن @everyone** - لا يوجد رصيد كافي في المتجر!`
            });

            // حذف رسالة التحذير بعد 5 ثوان
            setTimeout(() => {
                warningMsg.delete().catch(() => {});
            }, 5000);

            return;
        }
    }

    if (message.content.includes('@here')) {
        if (shopData.here > 0) {
            await db.sub(`shop_${message.channel.id}.here`, 1);
            shouldSendLine = true;
        } else {
            // حذف الرسالة ومنع الإرسال
            try {
                await message.delete();
            } catch (error) {
                console.error('خطأ في حذف الرسالة:', error);
            }

            // إرسال رسالة تحذير مؤقتة
            const warningMsg = await message.channel.send({
                content: `<@${message.author.id}> ❌ **لا يمكنك استخدام منشن @here** - لا يوجد رصيد كافي في المتجر!`
            });

            // حذف رسالة التحذير بعد 5 ثوان
            setTimeout(() => {
                warningMsg.delete().catch(() => {});
            }, 5000);

            return;
        }
    }

    if (shouldSendLine) {
        // إرسال خط فاصل بسيط بدلاً من ملف الصورة
        await message.channel.send('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
}

// حساب الضريبة
function handleTaxCalculation(message) {
    let args = message.content.trim();

    if (args.endsWith('m') || args.endsWith('M')) args = args.slice(0, -1) * 1000000;
    else if (args.endsWith('k') || args.endsWith('K')) args = args.slice(0, -1) * 1000;
    else if (args.endsWith('b') || args.endsWith('B')) args = args.slice(0, -1) * 1000000000;

    const number = parseInt(args);
    if (!number || isNaN(number) || number < 1) {
        return message.reply({
            content: '**يجب أن تحتوي الرسالة على رقم وأن يكون أكبر من أو يساوي الواحد**',
            files: [config.line]
        });
    }

    const tax = Math.floor(number * 20 / 19 + 1);
    const taxAmount = tax - number;
    const tax2 = Math.floor(number * 20 / 19 + 1 - number);
    const tax3 = Math.floor(tax2 * 20 / 19 + 1);
    const tax4 = Math.floor(tax2 + tax3 + number);

    message.reply({
        content: `** 💳 المبلغ: **__${number}__**\n** 💰 الضريبة: **__${taxAmount}__**\n** 💵 المبلغ مع الضريبة: **__${tax}__**\n** 💵 المبلغ مع ضريبة الوسيط: **__${tax4}__**`,
        files: [config.line]
    });
}

// معالجة التشفير
client.on("messageCreate", async message => {
    if (message.content.startsWith(config.prefix + "تشفير")) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const embed = createStandardEmbed("تشفير", "**أضـعـط عـلـي الـزر بـالـأسـفـل 👇 لـتـشـفـيـر مـنـشـورك**", message.guild);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel("تـشـفـيـر")
                    .setCustomId('replace')
            );

        message.channel.send({ embeds: [embed], components: [row] });
    }

    // معالجة أمر منشن بالبريفكس
    if (message.content.startsWith(config.prefix + "منشن")) {
        const shopData = await db.get(`shop_${message.channel.id}`);

        if (!shopData) {
            return message.reply({ content: 'هذا الشات ليس متجراً!' });
        }

        // التحقق من أن المستخدم هو صاحب المتجر أو مساعد
        const shopPartners = shopData.partners || [];
        const isOwner = message.author.id === shopData.owner;
        const isHelper = shopPartners.includes(message.author.id);
        const isAdmin = message.member.roles.cache.has(config.Admin);

        // الحصول على معلومات صاحب المتجر
        let ownerInfo = 'غير معروف';
        try {
            const owner = await message.guild.members.fetch(shopData.owner);
            ownerInfo = `${shopData.badge}• ${owner.displayName}`;
        } catch (error) {
            ownerInfo = `${shopData.badge}• غير موجود`;
        }

        const embed = createStandardEmbed('معلومات المتجر', `😌 - @everyone: ${shopData.every || 0}\n😌 - @here: ${shopData.here || 0}`, message.guild);
        embed.setAuthor({ 
            name: ownerInfo,
            iconURL: message.guild.iconURL()
        });



        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('buy_mentions')
                    .setLabel('شراء منشنات')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💰')
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('shop_management')
                    .setLabel('تنظيم المتجر')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚙️')
            );

        const components = [row1];

        // إضافة زر تنظيم المتجر للمالك والمساعدين والإدارة
        if (isOwner || isHelper || isAdmin) {
            components.push(row2);
        }

        await message.reply({
            embeds: [embed],
            components: components
        });
    }
});





// دالة الحصول على الأوامر
function getCommands() {
    return [
        {
            name: 'shop',
            description: 'إنشاء متجر جديد',
            options: [
                {
                    name: 'type',
                    description: 'نوع المتجر',
                    type: 3,
                    required: true,
                    choices: types.map(type => ({
                        name: type.name,
                        value: type.id
                    }))
                },
                {
                    name: 'name',
                    description: 'اسم المتجر',
                    type: 3,
                    required: true
                },
                {
                    name: 'owner',
                    description: 'صاحب المتجر',
                    type: 6,
                    required: true
                }
            ]
        },
        {
            name: 'mentions',
            description: 'إدارة منشنات المتجر',
            options: [
                {
                    name: 'action',
                    description: 'نوع العملية',
                    type: 3,
                    required: false,
                    choices: [
                        { name: 'عرض المنشنات', value: 'view' },
                        { name: 'إعادة تعيين الكل', value: 'reset_all' }
                    ]
                },
                {
                    name: 'channel',
                    description: 'القناة (للإعادة تعيين)',
                    type: 7,
                    required: false
                },
                {
                    name: 'message',
                    description: 'رسالة مخصصة',
                    type: 3,
                    required: false
                },
                {
                    name: 'image',
                    description: 'رابط صورة',
                    type: 3,
                    required: false
                }
            ]
        },
        {
            name: 'tax',
            description: 'حساب الضريبة',
            options: [
                {
                    name: 'number',
                    description: 'المبلغ',
                    type: 3,
                    required: true
                }
            ]
        },
        {
            name: 'warn',
            description: 'تحذير متجر',
            options: [
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: 7,
                    required: true
                },
                {
                    name: 'amount',
                    description: 'عدد التحذيرات',
                    type: 10,
                    required: true
                },
                {
                    name: 'reason',
                    description: 'السبب',
                    type: 3,
                    required: true
                },
                {
                    name: 'proof',
                    description: 'الدليل',
                    type: 11,
                    required: false
                }
            ]
        },
        {
            name: 'unwarn',
            description: 'إزالة تحذير من متجر',
            options: [
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: 7,
                    required: true
                },
                {
                    name: 'amount',
                    description: 'عدد التحذيرات المراد إزالتها',
                    type: 10,
                    required: true
                }
            ]
        },
        {
            name: 'disable',
            description: 'تعطيل متجر',
            options: [
                {
                    name: 'action',
                    description: 'نوع العملية',
                    type: 3,
                    required: false,
                    choices: [
                        { name: 'تعطيل', value: 'disable' },
                        { name: 'فحص الحالة', value: 'check_status' }
                    ]
                },
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: 7,
                    required: false
                },
                {
                    name: 'reason',
                    description: 'السبب',
                    type: 3,
                    required: false
                },
                {
                    name: 'duration',
                    description: 'مدة التعطيل (مثل: 1h, 30m)',
                    type: 3,
                    required: false
                }
            ]
        },
        {
            name: 'active',
            description: 'تفعيل متجر',
            options: [
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: 7,
                    required: false
                }
            ]
        },
        {
            name: 'buyticket',
            description: 'إرسال تذكرة شراء متجر',
            options: [
                {
                    name: 'channel',
                    description: 'القناة',
                    type: 7,
                    required: false
                }
            ]
        },
        {
            name: 'add-mentions',
            description: 'إدارة منشنات متجر',
            options: [
                {
                    name: 'action',
                    description: 'نوع العملية',
                    type: 3,
                    required: true,
                    choices: [
                        { name: 'إضافة', value: 'add' },
                        { name: 'إزالة', value: 'remove' },
                        { name: 'إعادة تعيين', value: 'reset' }
                    ]
                },
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: 7,
                    required: false
                },
                {
                    name: 'everyone',
                    description: 'عدد منشنات @everyone',
                    type: 10,
                    required: false
                },
                {
                    name: 'here',
                    description: 'عدد منشنات @here',
                    type: 10,
                    required: false
                },
                {
                    name: 'shop_mentions',
                    description: 'عدد منشنات المتجر',
                    type: 10,
                    required: false
                }
            ]
        },
        {
            name: 'shop-data',
            description: 'عرض معلومات المتجر'
        },
        {
            name: 'warns',
            description: 'عرض تحذيرات المتجر'
        },
        {
            name: 'help',
            description: 'عرض دليل الأوامر'
        },
        {
            name: 'data',
            description: 'إضافة بيانات متجر يدوياً',
            options: [
                {
                    name: 'channel',
                    description: 'القناة',
                    type: 7,
                    required: true
                },
                {
                    name: 'owner',
                    description: 'صاحب المتجر',
                    type: 6,
                    required: true
                },
                {
                    name: 'type',
                    description: 'نوع المتجر',
                    type: 3,
                    required: true,
                    choices: types.map(type => ({
                        name: type.name,
                        value: type.id
                    }))
                },
                {
                    name: 'everyone',
                    description: 'عدد منشنات @everyone',
                    type: 10,
                    required: false
                },
                {
                    name: 'here',
                    description: 'عدد منشنات @here',
                    type: 10,
                    required: false
                },
                {
                    name: 'shop',
                    description: 'عدد منشنات المتجر',
                    type: 10,
                    required: false
                },
                {
                    name: 'warns',
                    description: 'عدد التحذيرات',
                    type: 10,
                    required: false
                },
                {
                    name: 'status',
                    description: 'حالة المتجر',
                    type: 3,
                    required: false,
                    choices: [
                        { name: 'مفعل', value: '1' },
                        { name: 'معطل', value: '0' }
                    ]
                }
            ]
        },
        {
            name: 'add-helper',
            description: 'إدارة مساعدي المتجر',
            options: [
                {
                    name: 'action',
                    description: 'نوع العملية',
                    type: 3,
                    required: true,
                    choices: [
                        { name: 'إضافة', value: 'add' },
                        { name: 'إزالة', value: 'remove' },
                        { name: 'عرض القائمة', value: 'list' }
                    ]
                },
                {
                    name: 'helper',
                    description: 'المساعد',
                    type: 6,
                    required: false
                },
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: 7,
                    required: false
                },
                {
                    name: 'role',
                    description: 'نوع الصلاحية',
                    type: 3,
                    required: false,
                    choices: [
                        { name: 'محدودة', value: 'limited' },
                        { name: 'كاملة', value: 'full' }
                    ]
                }
            ]
        },
        {
            name: 'remove-helper',
            description: 'إزالة مساعد من متجر',
            options: [
                {
                    name: 'helper',
                    description: 'المساعد المراد إزالته',
                    type: 6,
                    required: true
                },
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: 7,
                    required: true
                }
            ]
        },
        {
            name: 'owner',
            description: 'تغيير مالك المتجر',
            options: [
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: 7,
                    required: true
                },
                {
                    name: 'new-owner',
                    description: 'المالك الجديد',
                    type: 6,
                    required: true
                }
            ]
        },
        {
            name: 'change-name',
            description: 'تغيير اسم المتجر',
            options: [
                {
                    name: 'action',
                    description: 'نوع العملية',
                    type: 3,
                    required: false,
                    choices: [
                        { name: 'تغيير', value: 'change' },
                        { name: 'معاينة', value: 'preview' }
                    ]
                },
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: 7,
                    required: false
                },
                {
                    name: 'new-name',
                    description: 'الاسم الجديد',
                    type: 3,
                    required: false
                },
                {
                    name: 'add_prefix',
                    description: 'إضافة البادئة',
                    type: 5,
                    required: false
                },
                {
                    name: 'preserve_emoji',
                    description: 'الحفاظ على الإيموجي',
                    type: 5,
                    required: false
                }
            ]
        },
        {
            name: 'change-type',
            description: 'تغيير نوع المتجر',
            options: [
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: 7,
                    required: true
                },
                {
                    name: 'new-type',
                    description: 'النوع الجديد',
                    type: 3,
                    required: true,
                    choices: types.map(type => ({
                        name: type.name,
                        value: type.id
                    }))
                }
            ]
        },
        {
            name: 'delete-shop',
            description: 'حذف متجر',
            options: [
                {
                    name: 'shop',
                    description: 'المتجر المراد حذفه',
                    type: 7,
                    required: true
                },
                {
                    name: 'reason',
                    description: 'سبب الحذف',
                    type: 3,
                    required: true
                }
            ]
        },
        {
            name: 'setup',
            description: 'إعداد البوت'
        },
        {
            name: 'edit-prices',
            description: 'تعديل أسعار الخدمات',
            options: [
                {
                    name: 'type',
                    description: 'نوع الخدمة',
                    type: 3,
                    required: true,
                    choices: [
                        { name: 'منشنات المتاجر العادية', value: 'normal_mentions' },
                        { name: 'منشنات الطلبات', value: 'order_mentions' },
                        { name: 'منشنات المزادات', value: 'auction_mentions' },
                        { name: 'أسعار المتاجر', value: 'shop_prices' },
                        { name: 'الخدمات الإضافية', value: 'extra_services' },
                        { name: 'عرض جميع الأسعار', value: 'view_all' }
                    ]
                }
            ]
        },
        {
            name: 'r-mentions',
            description: 'إعادة تعيين منشنات جميع المتاجر',
            options: [
                {
                    name: 'channel',
                    description: 'قناة الإرسال',
                    type: 7,
                    required: false
                },
                {
                    name: 'message',
                    description: 'رسالة مخصصة',
                    type: 3,
                    required: false
                },
                {
                    name: 'image',
                    description: 'رابط صورة',
                    type: 3,
                    required: false
                }
            ]
        },
        {
            name: 'user-shops',
            description: 'عرض متاجر المستخدم',
            options: [
                {
                    name: 'user',
                    description: 'المستخدم',
                    type: 6,
                    required: false
                }
            ]
        },
        {
            name: 'fix-bot',
            description: 'إصلاح مشاكل البوت العامة'
        },
        {
            name: 'encryption-words',
            description: 'إضافة كلمات تشفير جديدة'
        },
        {
            name: 'send-encryption-panel',
            description: 'إرسال بانل التشفير',
            options: [
                {
                    name: 'channel',
                    description: 'القناة',
                    type: 7,
                    required: false
                }
            ]
        },
        {
            name: 'refresh-commands',
            description: 'تحديث أوامر البوت يدوياً'
        },
        {
            name: 'send-panels',
            description: 'إرسال لوحة التحكم الرئيسية مع أزرار المتاجر والطلبات والمزادات'
        },
        {
            name: 'send-shops',
            description: 'إرسال بانل المتاجر مع أزرار فتح التذاكر وعرض الأسعار'
        },
        {
            name: 'send-orders',
            description: 'إرسال بانل الطلبات مع أزرار عرض الأسعار وفتح التذاكر'
        },
        {
            name: 'send-actions',
            description: 'إرسال بانل المزادات مع أزرار عرض الأسعار وفتح التذاكر'
        },
        {
            name: 'price',
            description: 'عرض لوحة الأسعار الشاملة لجميع الخدمات'
        }
    ];
}

// خريطة لتتبع التفاعلات المعالجة
const processedInteractions = new Set();

// معالجة التفاعلات
client.on('interactionCreate', async (interaction) => {
    try {
        // التحقق من عمر التفاعل (أكثر من 2.5 ثانية = منتهي الصلاحية)
        const interactionAge = Date.now() - interaction.createdTimestamp;
        if (interactionAge > 2500) {
            console.log(`تم تجاهل التفاعل المنتهي الصلاحية: ${interaction.id} (عمر: ${interactionAge}ms)`);
            return;
        }

        // التحقق من أن التفاعل لم يتم معالجته مسبقاً
        if (processedInteractions.has(interaction.id)) {
            console.log(`تم تجاهل التفاعل المكرر: ${interaction.id}`);
            return;
        }

        // التحقق من حالة التفاعل
        if (interaction.replied || interaction.deferred) {
            console.log(`تم تجاهل التفاعل - تم الرد عليه مسبقاً: ${interaction.id}`);
            return;
        }

        // إضافة التفاعل للقائمة المعالجة
        processedInteractions.add(interaction.id);

        // تنظيف القائمة بعد 5 ثوانِ
        setTimeout(() => {
            processedInteractions.delete(interaction.id);
        }, 5000);

        if (interaction.isChatInputCommand()) {
            await handleSlashCommands(interaction);
        } else if (interaction.isButton()) {
            await handleButtonInteractions(interaction);
        } else if (interaction.isModalSubmit()) {
            await handleModalSubmits(interaction);
        } else if (interaction.isStringSelectMenu()) {
            await handleStringSelectMenus(interaction);
        }
    } catch (error) {
        console.error('خطأ في معالجة التفاعل:', error);

        // محاولة الرد بخطأ فقط إذا لم يتم الرد مسبقاً
        if (!interaction.replied && !interaction.deferred && !processedInteractions.has(interaction.id + '_error')) {
            try {
                processedInteractions.add(interaction.id + '_error');
                await interaction.reply({
                    content: 'حدث خطأ أثناء معالجة طلبك!',
                    ephemeral: true
                });
            } catch (replyError) {
                console.error('فشل في إرسال رسالة الخطأ:', replyError);
            }
        }
    }
});

// معالجة أمر help بالبريفكس
client.on("messageCreate", async message => {
    if (message.author.bot) return;

    if (message.content === config.prefix + "help") {
        await sendHelpMessage(message.channel);
    }
});

// معالجة تفاعلات التشفير
client.on("interactionCreate", async i => {
    if (!i.isButton()) return;
    if (i.customId === "replace") {
        const modal = new ModalBuilder()
            .setTitle('تشفير')
            .setCustomId('rep');

        const replacer = new TextInputBuilder()
            .setCustomId('replacetext')
            .setLabel('الـمـنـشـور')
            .setMaxLength(2000)
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph);

        const rows = [replacer].map(component => new ActionRowBuilder().addComponents(component));
        modal.addComponents(...rows);
        await i.showModal(modal);
    }
});

client.on("interactionCreate", async i => {
    if (!i.isModalSubmit()) return;
    if (i.customId === "rep") {
        let text = i.fields.getTextInputValue('replacetext');
        let replaced = false;

        replace.forEach(t => {
            const regex = new RegExp(t.word, 'g');
            if (regex.test(text)) {
                text = text.replace(regex, t.replace);
                replaced = true;
            }
        });

        if (replaced) {
            await i.reply({ content: '**تم بنجاح تشفير منشورك**: ' + text + '', ephemeral: true });
        } else {
            await i.reply({ content: "**يـوجـد خـطـأ(قـد يـكـون مـنـشـورك مـشـفـر)**", ephemeral: true });
        }
    }
});

// معالجة Select Menus
async function handleStringSelectMenus(interaction) {
    const { customId, values } = interaction;

    // التحقق من أن التفاعل لم يتم الرد عليه مسبقاً
    if (interaction.replied || interaction.deferred) {
        console.log('تم تجاهل Select Menu - التفاعل تم الرد عليه مسبقاً');
        return;
    }

    try {
        if (customId === 'setup_select_menu') {
            const selectedSetup = values[0];

            if (selectedSetup === 'basic_setup') {
                await showBasicSetupModal(interaction);
            } else if (selectedSetup === 'admins_setup') {
                await showAdminsSetupModal(interaction);
            } else if (selectedSetup === 'tickets_setup') {
                await showTicketsSetupModal(interaction);
            }

        } else if (customId === 'help_select_menu') {
            const selectedHelp = values[0];

            if (selectedHelp === 'shopping_commands') {
                await showShoppingCommands(interaction);
            } else if (selectedHelp === 'admin_commands') {
                await showAdminCommands(interaction);
            } else if (selectedHelp === 'public_commands') {
                await showPublicCommands(interaction);
            } else if (selectedHelp === 'prices_info') {
                await showPricesInfo(interaction);
            }
        }

    } catch (error) {
        console.error('خطأ في معالجة Select Menu:', error);

        // محاولة الرد فقط إذا لم يتم الرد مسبقاً
        if (!interaction.replied && !interaction.deferred) {
            try {
                await interaction.reply({ content: 'حدث خطأ!', ephemeral: true });
            } catch (replyError) {
                console.error('فشل في إرسال رسالة الخطأ:', replyError);
            }
        }
    }
}

// دوال عرض مودالات الإعداد
async function showBasicSetupModal(interaction) {
    const basicSetupModal = new ModalBuilder()
        .setCustomId('bot_setup_modal')
        .setTitle('🔧 الإعدادات الأساسية');

    const shopAdminInput = new TextInputBuilder()
        .setCustomId('shop_admin')
        .setLabel('ID رتبة إدارة المتاجر (shop-admin)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setValue(config.Admin);

    const logsChannelInput = new TextInputBuilder()
        .setCustomId('logs_channel')
        .setLabel('ID قناة السجلات (logs)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setValue(config.log);

    const bankIdInput = new TextInputBuilder()
        .setCustomId('bank_id')
        .setLabel('ID البنك (bank)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setValue(config.bank);

    const lineImageInput = new TextInputBuilder()
        .setCustomId('line_image')
        .setLabel('رابط صورة الخط (line)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setValue(config.line || '');

    const orderRoomInput = new TextInputBuilder()
        .setCustomId('order_room')
        .setLabel('ID روم الطلبات (order-room)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setValue(config.orderRoom || '');


    basicSetupModal.addComponents(
        new ActionRowBuilder().addComponents(shopAdminInput),
        new ActionRowBuilder().addComponents(logsChannelInput),
        new ActionRowBuilder().addComponents(bankIdInput),
        new ActionRowBuilder().addComponents(lineImageInput),
        new ActionRowBuilder().addComponents(orderRoomInput)
    );

    await interaction.showModal(basicSetupModal);
}

async function showAdminsSetupModal(interaction) {
    const adminsSetupModal = new ModalBuilder()
        .setCustomId('admins_setup_modal')
        .setTitle('👑 إعدادات الإدارة');

    const orderAdminInput = new TextInputBuilder()
        .setCustomId('order_admin')
        .setLabel('ID رتبة إدارة الطلبات (order-admin)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setValue(config.orderAdmin || '');

    const auctionAdminInput = new TextInputBuilder()
        .setCustomId('auction_admin')
        .setLabel('ID رتبة إدارة المزادات (auction-admin)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setValue(config.auctionAdmin || '');

    const auctionRoomInput = new TextInputBuilder()
        .setCustomId('auction_room')
        .setLabel('ID روم المزادات (auction-room)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setValue(config.auctionChannel || '');

    adminsSetupModal.addComponents(
        new ActionRowBuilder().addComponents(orderAdminInput),
        new ActionRowBuilder().addComponents(auctionAdminInput),
        new ActionRowBuilder().addComponents(auctionRoomInput)
    );

    await interaction.showModal(adminsSetupModal);
}

async function showTicketsSetupModal(interaction) {
    const ticketsSetupModal = new ModalBuilder()
        .setCustomId('tickets_setup_modal')
        .setTitle('🎫 إعدادات التذاكر');

    const orderTicketInput = new TextInputBuilder()
        .setCustomId('order_ticket')
        .setLabel('ID تذكرة الطلبات (order-ticket)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setValue(config.orderTicket || '');

    const auctionTicketInput = new TextInputBuilder()
        .setCustomId('auction_ticket')
        .setLabel('ID تذكرة المزادات (auction-ticket)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setValue(config.auctionTicket || '');

    const categoryInput = new TextInputBuilder()
        .setCustomId('category')
        .setLabel('ID فئة التذاكر (category)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setValue(config.catagory || '');

    ticketsSetupModal.addComponents(
        new ActionRowBuilder().addComponents(orderTicketInput),
        new ActionRowBuilder().addComponents(auctionTicketInput),
        new ActionRowBuilder().addComponents(categoryInput)
    );

    await interaction.showModal(ticketsSetupModal);
}

// دوال عرض أوامر المساعدة
async function showShoppingCommands(interaction) {
    const shoppingEmbed = createStandardEmbed('🛒 أوامر الشراء والتسوق', '**أوامر إدارة المتاجر:**', interaction.guild);
    shoppingEmbed.addFields(
        { name: '/shop', value: '`إنشاء متجر جديد`\nالاستخدام: `/shop type:النوع name:الاسم owner:المالك`', inline: false },
        { name: '/buyticket', value: '`إرسال تذكرة شراء متجر`\nالاستخدام: `/buyticket channel:القناة`', inline: false },
        { name: '/add-mentions', value: '`إضافة منشنات لمتجر`\nالاستخدام: `/add-mentions shop:المتجر everyone:العدد here:العدد`', inline: false }
    );

    await interaction.reply({ embeds: [shoppingEmbed], ephemeral: true });
}

async function showAdminCommands(interaction) {
    const adminEmbed = createStandardEmbed('⚙️ أوامر الإعدادات والإدارة', '**أوامر الإدارة والتحكم المتقدم:**', interaction.guild);
    adminEmbed.addFields(
        { name: '/warn', value: '`تحذير متجر`\nالاستخدام: `/warn shop:المتجر amount:العدد reason:السبب proof:الدليل`', inline: false },
        { name: '/unwarn', value: '`إزالة تحذير من متجر`\nالاستخدام: `/unwarn shop:المتجر amount:العدد`', inline: false },
        { name: '/disable', value: '`تعطيل متجر`\nالاستخدام: `/disable shop:المتجر reason:السبب`', inline: false },
        { name: '/active', value: '`تفعيل متجر`\nالاستخدام: `/active shop:المتجر`', inline: false },
        { name: '/change-name', value: '`تغيير اسم متجر`\nالاستخدام: `/change-name shop:المتجر new-name:الاسم_الجديد`', inline: false },
        { name: '/delete-shop', value: '`حذف متجر`\nالاستخدام: `/delete-shop shop:المتجر reason:السبب`', inline: false },
        { name: '/r-mentions', value: '`إعادة تعيين منشنات جميع المتاجر`\nالاستخدام: `/r-mentions channel:القناة image:الصورة`', inline: false }
    );

    await interaction.reply({ embeds: [adminEmbed], ephemeral: true });
}

async function showPublicCommands(interaction) {
    const publicEmbed = createStandardEmbed('👥 أوامر الأعضاء العامة', '**الأوامر المتاحة لجميع المستخدمين:**', interaction.guild);
    publicEmbed.addFields(
        { name: '/mentions', value: '`عرض منشنات المتجر`\nالاستخدام: `/mentions` (في المتجر)', inline: false },
        { name: '/tax', value: '`حساب الضريبة`\nالاستخدام: `/tax number:المبلغ`', inline: false },
        { name: '/shop-data', value: '`عرض معلومات المتجر`\nالاستخدام: `/shop-data` (في المتجر)', inline: false },
        { name: '/warns', value: '`عرض تحذيرات المتجر`\nالاستخدام: `/warns` (في المتجر)', inline: false },
        { name: '-منشن', value: '`عرض منشنات المتجر (أمر نصي)`\nالاستخدام: `-منشن` (في المتجر)', inline: false },
        { name: '-تشفير', value: '`فتح لوحة التشفير (أمر نصي)`\nالاستخدام: `-تشفير`', inline: false }
    );

    await interaction.reply({ embeds: [publicEmbed], ephemeral: true });
}

async function showPricesInfo(interaction) {
    const pricesEmbed = createStandardEmbed('💰 أسعار الخدمات والمنشنات', '**جميع الأسعار المعمول بها حالياً:**', interaction.guild);
    pricesEmbed.addFields(
        {
            name: '🏪 أسعار المتاجر',
            value: types.map(t => `• ${t.badge} **${t.name}**: ${t.price.toLocaleString()} كرديت`).join('\n'),
            inline: false
        },
        {
            name: '📢 أسعار المنشنات العادية',
            value: `• **@everyone**: ${config.every.toLocaleString()} كرديت\n• **@here**: ${config.here.toLocaleString()} كرديت\n• **منشن المتجر**: ${(config.shopMentionPrice || 5000).toLocaleString()} كرديت`,
            inline: false
        },
        {
            name: '🛠️ أسعار الخدمات الإضافية',
            value: `• **إزالة تحذير واحد**: 2 كرديت\n• **تفعيل متجر معطل**: 5,000 كرديت\n• **تغيير اسم متجر**: 1 كرديت\n• **تغيير نوع متجر**: نصف سعر المتجر الجديد`,
            inline: false
        },
        {
            name: '📝 ملاحظات مهمة',
            value: `• جميع الأسعار تشمل الضريبة 5%\n• يمكن إزالة التحذيرات بالدفع من داخل المتجر\n• الأسعار محدثة في: <t:${Math.floor(Date.now() / 1000)}:R>`,
            inline: false
        }
    );

    await interaction.reply({ embeds: [pricesEmbed], ephemeral: true });
}

// معالجة أوامر السلاش
async function handleSlashCommands(interaction) {
    const { commandName } = interaction;

    // إضافة timeout للتفاعل
    setTimeout(() => {
        if (!interaction.replied && !interaction.deferred) {
            console.log(`انتهت صلاحية التفاعل للأمر: ${commandName}`);
        }
    }, 2500); // 2.5 ثانية قبل انتهاء صلاحية Discord

    // التحقق من الصلاحيات
    if (!interaction.member.roles.cache.has(config.Admin) && !isPublicCommand(commandName)) {
        return interaction.reply({
            content: `ليس لديك صلاحية لاستخدام هذا الأمر - تحتاج رتبة <@&${config.Admin}>`,
            flags: 64
        });
    }

    try {
        switch (commandName) {
            case 'shop':
                await commands.createShop(interaction, db, config, types, createStandardEmbed);
                break;
            case 'mentions':
                await commands.handleMentionsCommand(interaction, db, config, types, createStandardEmbed);
                break;
            case 'tax':
                await commands.calculateTax(interaction);
                break;
            case 'warn':
                await commands.warnShop(interaction, db, config, createStandardEmbed);
                break;
            case 'unwarn':
                await commands.unwarnShop(interaction, db);
                break;
            case 'disable':
                await commands.handleDisableCommand(interaction, db, createStandardEmbed);
                break;
            case 'active':
                await commands.activateShop(interaction, db, createStandardEmbed);
                break;
            case 'buyticket':
                await commands.sendBuyTicket(interaction, db, config, createStandardEmbed);
                break;

            case 'add-mentions':
                await commands.handleAddMentionsCommand(interaction, db, config, types, createStandardEmbed);
                break;
            case 'shop-data':
                await commands.showShopData(interaction, db, createStandardEmbed);
                break;
            case 'warns':
                await commands.showWarns(interaction, db, config, createStandardEmbed);
                break;
            case 'add-helper':
                await commands.addHelper(interaction, db, config, createStandardEmbed);
                break;
            case 'remove-helper':
                await commands.removeHelper(interaction, db, config);
                break;
            case 'owner':
                await changeOwner(interaction);
                break;
            case 'change-name':
                await handleChangeNameCommand(interaction);
                break;
            case 'change-type':
                await changeType(interaction);
                break;
            case 'delete-shop':
                await deleteShop(interaction);
                break;

            case 'encryption-words':
                await addEncryptionWords(interaction);
                break;
            case 'send-encryption-panel':
                await sendEncryptionPanel(interaction);
                break;
            case 'help':
                await sendHelpCommand(interaction);
                break;
            case 'data':
                await addShopData(interaction);
                break;
            case 'setup':
                await handleBotSetup(interaction);
                break;
            case 'set-price':
                await handleSetPrice(interaction);
                break;
            case 'refresh-commands':
                await refreshCommands(interaction);
                break;
            case 'send-panels':
                await commands.sendPanels(interaction, db, config, types, createStandardEmbed);
                break;
            case 'send-shops':
                await commands.sendShops(interaction, db, config, types, createStandardEmbed);
                break;
            case 'send-orders':
                await commands.sendOrders(interaction, db, config, types, createStandardEmbed);
                break;
            case 'send-actions':
                await commands.sendActions(interaction, db, config, types, createStandardEmbed);
                break;
            case 'price':
                await commands.pricePanel(interaction, db, config, types, createStandardEmbed);
                break;
            case 'edit-prices':
                await handleEditPrices(interaction);
                break;
            case 'send-panels':
                await sendAllPanels(interaction);
                break;
            case 'r-mentions':
                await resetMentions(interaction);
                break;
            case 'user-shops':
                await showUserShops(interaction);
                break;
            case 'fix-bot':
                await fixBotIssues(interaction);
                break;
            case 'encryption-words':
                await addEncryptionWords(interaction);
                break;
            case 'send-encryption-panel':
                await sendEncryptionPanel(interaction);
                break;

            case 'manage-mentions':
                await manageMentions(interaction);
                break;
            case 'delete-shop-type':
                await deleteShopType(interaction);
                break;
            case 'add-shop-type':
                await addShopType(interaction);
                break;
            case 'user-shops':
                await showUserShops(interaction);
                break;
            case 'fix-bot':
                await fixBotIssues(interaction);
                break;
            case 'send-panels':
                await sendAllPanels(interaction);
                break;
            case 'price-panels':
                await sendPricePanels(interaction);
                break;

            default:
                await interaction.reply({ content: 'أمر غير معروف!', ephemeral: true });
        }
    } catch (error) {
        console.error(`خطأ في الأمر ${commandName}:`, error);
        if (!interaction.replied) {
            await interaction.reply({ content: 'حدث خطأ أثناء تنفيذ الأمر!', ephemeral: true });
        }
    }
}

// دالة إنشاء متجر
async function createShop(interaction) {
    await interaction.deferReply();

    const type = types.find(t => t.id === interaction.options.getString('type'));
    const name = interaction.options.getString('name').replaceAll(' ', '・');
    const owner = interaction.options.getUser('owner');

    if (!type) {
        return interaction.editReply('نوع المتجر غير صحيح!');
    }

    const adminRole = interaction.guild.roles.cache.get(config.Admin);
    const shopRole = interaction.guild.roles.cache.get(type.role);

    try {
        const channel = await interaction.guild.channels.create({
            name: `${type.badge}${config.prefix}${name}`,
            type: ChannelType.GuildText,
            parent: type.id,
            permissionOverwrites: [
                {
                    id: owner.id,
                    allow: ['SendMessages', 'MentionEveryone', 'EmbedLinks', 'AttachFiles', 'ViewChannel']
                },
                {
                    id: interaction.guild.roles.everyone,
                    deny: ['SendMessages'],
                    allow: ['ViewChannel']
                },
                {
                    id: adminRole.id,
                    allow: ['SendMessages', 'MentionEveryone', 'EmbedLinks', 'AttachFiles', 'ViewChannel']
                }
            ]
        });

        const timestamp = Math.floor(Date.now() / 1000);

        await db.set(`shop_${channel.id}`, {
            owner: owner.id,
            type: type.role,
            shop: type.shop,
            every: type.every,
            here: type.here,
            date: `<t:${timestamp}:R>`,
            status: "1",
            warns: 0,
            badge: type.badge
        });

        if (shopRole) {
            await interaction.guild.members.cache.get(owner.id).roles.add(shopRole);
        }

        const embed = createStandardEmbed('معلومات المتجر', `**المنشنات:**\n• everyone: ${type.every}\n• here: ${type.here}`, interaction.guild);
        embed.addFields(
            { name: 'صاحب المتجر', value: `<@${owner.id}>`, inline: true },
            { name: 'نوع المتجر', value: `<@&${type.role}>`, inline: true },
            { name: 'تاريخ الإنشاء', value: `<t:${timestamp}:R>`, inline: true }
        );

        await channel.send({ embeds: [embed] });
        await interaction.editReply({ content: `تم إنشاء المتجر بنجاح ${channel}`, embeds: [embed] });

        // إرسال لوج
        const logChannel = interaction.guild.channels.cache.get(config.commandlog);
        if (logChannel) {
            const logEmbed = createStandardEmbed('تم إنشاء متجر', `المسؤول: <@${interaction.user.id}>`, interaction.guild);
            logEmbed.addFields(
                { name: 'المتجر', value: `<#${channel.id}>`, inline: true },
                { name: 'النوع', value: `<@&${type.role}>`, inline: true },
                { name: 'المالك', value: `<@${owner.id}>`, inline: true }
            );

            await logChannel.send({ embeds: [logEmbed] });
        }

    } catch (error) {
        console.error('خطأ في إنشاء المتجر:', error);
        await interaction.editReply('حدث خطأ أثناء إنشاء المتجر!');
    }
}

// دالة محسنة لإدارة المنشنات (دمج mentions + r-mentions + ميزات إضافية)
async function handleMentionsCommand(interaction) {
    const action = interaction.options.getString('action') || 'view';
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const customMessage = interaction.options.getString('message');
    const imageUrl = interaction.options.getString('image');

    if (action === 'view') {
        // عرض المنشنات العادي
        const shopData = await db.get(`shop_${channel.id}`);

        if (!shopData) {
            return interaction.reply({ content: 'هذا الشات ليس متجراً!', ephemeral: true });
        }

        // التحقق من أن المستخدم هو صاحب المتجر أو مساعد
        const shopPartners = shopData.partners || [];
        const isOwner = interaction.user.id === shopData.owner;
        const isHelper = shopPartners.includes(interaction.user.id);
        const isAdmin = interaction.member.roles.cache.has(config.Admin);

        // الحصول على معلومات صاحب المتجر
        let ownerInfo = 'غير معروف';
        try {
            const owner = await interaction.guild.members.fetch(shopData.owner);
            ownerInfo = `${shopData.badge}• ${owner.displayName}`;
        } catch (error) {
            ownerInfo = `${shopData.badge}• غير موجود`;
        }

        const embed = createStandardEmbed('معلومات المتجر', `😌 - @everyone: ${shopData.every || 0}\n😌 - @here: ${shopData.here || 0}\n🏪 - منشن المتجر: ${shopData.shop || 0}`, interaction.guild);
        embed.setAuthor({ 
            name: ownerInfo,
            iconURL: interaction.guild.iconURL()
        });

        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('buy_mentions')
                    .setLabel('شراء منشنات')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💰')
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('shop_management')
                    .setLabel('تنظيم المتجر')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚙️')
            );

        const components = [row1];

        // إضافة زر تنظيم المتجر للمالك والمساعدين والإدارة
        if (isOwner || isHelper || isAdmin) {
            components.push(row2);
        }

        await interaction.reply({
            embeds: [embed],
            components: components
        });
    } else if (action === 'reset_all') {
        // إعادة تعيين منشنات جميع المتاجر
        await interaction.deferReply({ ephemeral: true });

        const channelssend = channel || interaction.channel;
        const channels = await interaction.guild.channels.fetch();
        await interaction.editReply('**بدأت عملية إعادة تعيين المنشنات**');

        const guild = interaction.guild;
        const serverName = guild.name;
        const serverIcon = guild.iconURL();

        // استخدام النص المخصص أو النص الافتراضي
        const messageText = customMessage || `**رستارنا المنشنات كل يوم وأنتم بخير**`;

        let updatedShops = 0;
        for (const type of types) {
            for (const [ch, channelData] of channels) {
                if (channelData.parentId && channelData.parentId === type.id) {
                    const shopData = await db.get(`shop_${ch}`);
                    if (shopData) {
                        await db.set(`shop_${ch}.every`, type.every);
                        await db.set(`shop_${ch}.here`, type.here);
                        await db.set(`shop_${ch}.shop`, type.shop);
                        updatedShops++;

                        // إرسال رسالة واحدة مدمجة للمتجر
                        try {
                            const shopEmbed = createStandardEmbed(`${type.name} - تحديث المنشنات`, `${messageText}\n\n😝 - @everyone: ${type.every}\n😃 - @here: ${type.here}`, interaction.guild);
                            if (imageUrl) shopEmbed.setImage(imageUrl);
                            else shopEmbed.setImage(serverIcon);

                            await channelData.send({ 
                                content: `<@${shopData.owner}> **رستارنا المنشنات**`, 
                                embeds: [shopEmbed] 
                            });
                        } catch (error) {
                            console.error(`خطأ في إرسال رسالة للمتجر ${ch}:`, error);
                        }
                    }
                }
            }
        }

        const embed = createStandardEmbed('تحديث المنشنات العام', `${messageText}\n\n😝 - @everyone: ${config.every}\n😃 - @here: ${config.here}`, interaction.guild);
        if (imageUrl) embed.setImage(imageUrl);
        else embed.setImage(serverIcon);

        await channelssend.send({ content: '@everyone **رستارنا المنشنات**', embeds: [embed] });

        await interaction.followUp({
            content: `✅ تم إعادة تعيين منشنات ${updatedShops} متجر بنجاح وإرسال الإشعار!`,
            ephemeral: true
        });
    }
}

// دالة حساب الضريبة
async function calculateTax(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const option = interaction.options.get('number');
    if (!option) {
        return interaction.editReply('**يـجـب ان تـضـع رقـم بـخـيـار number.**');
    }

    let number = option.value;
    const regex = /^[0-9]+([kKmMbB])?$/;

    if (!regex.test(number)) {
        return interaction.editReply('**يـجـب ان تـحـتـوي الـرسـالـة عـلـى رقـم.**');
    }

    if (number.endsWith('m') || number.endsWith('M')) {
        number = parseFloat(number.slice(0, -1)) * 1000000;
    } else if (number.endsWith('k') || number.endsWith('K')) {
        number = parseFloat(number.slice(0, -1)) * 1000;
    } else if (number.endsWith('b') || number.endsWith('B')) {
        number = parseFloat(number.slice(0, -1)) * 1000000000;
    } else {
        number = parseFloat(number);
    }

    if (isNaN(number) || number < 1) {
        return interaction.editReply('**يـجـب أن يـكـون الـرقـم اكـبـر مـن او يـسـاوي الـواحـد**');
    }

    let taxwi = Math.floor(number * 20 / 19 + 1);
    let tax2 = Math.floor(number * (20) / (19) + (1) - (number));
    let tax3 = Math.floor(tax2 * (20) / (19) + (1));
    let tax4 = Math.floor(tax2 + tax3 + number);
    let num = taxwi - number;

    return interaction.editReply(`** 💳 الـمـبـلـغ **  :  **__${number}__** \n ** 💰  الـضـريـبـة **  :  **__${num}__** \n ** 💵 الـمـبـلـغ مـع   الـضـريـبـة**  :  **__${taxwi}__** \n ** 💵 الـمـبـلـغ مـع ضـريـبـة الـوسـيـط **  : **__${tax4}__**`);
}

// معالجة التفاعلات مع الأزرار
async function handleButtonInteractions(interaction) {
    const { customId } = interaction;

    try {
        if (customId === 'buy_shop_ticket') {
            await handleBuyShopTicket(interaction);
        } else if (customId === 'buy_mentions') {
            await handleMentionButton(interaction);
        } else if (customId.startsWith('shop_type_')) {
            await handleShopTypeSelection(interaction);
        } else if (customId === 'mention') {
            await handleMentionButton(interaction);
        } else if (customId.startsWith('here') || customId.startsWith('everyone')) {
            await handleMentionPurchase(interaction);
        } else if (['1b', '2b', '3b', '4b', '5b'].includes(customId)) {
            await handleShopTypePurchase(interaction);
        } else if (customId === 'close_ticket') {
            await handleCloseTicket(interaction);
        } else if (customId === 'remove_warning_modal') {
            await showRemoveWarningModal(interaction);
        } else if (customId === 'remove_warning_ticket') {
            await handleRemoveWarningTicket(interaction);
        } else if (customId.startsWith('remove_warning_')) {
            await handleRemoveWarning(interaction);
        } else if (customId === 'view_shop_prices') {
            await handleShopPricesView(interaction);
        } else if (customId === 'view_auction_prices') {
            await handleAuctionPricesView(interaction);
        } else if (customId === 'view_order_prices') {
            await handleOrderPricesView(interaction);
        } else if (customId.startsWith('shop_price_')) {
            await handleShopPriceSelection(interaction);
        } else if (customId === 'auction_everyone_price' || customId === 'auction_here_price') {
            await handleAuctionPriceSelection(interaction);
        } else if (customId === 'order_everyone_price' || customId === 'order_here_price') {
            await handleOrderPriceSelection(interaction);

        } else if (customId === 'shop_management') {
            await handleShopManagement(interaction);
        } else if (customId.startsWith('shop_manage_')) {
            await handleShopManagementActions(interaction);
        } else if (customId === 'confirm_delete_shop') {
            await handleConfirmDeleteShop(interaction);
        } else if (customId === 'cancel_delete_shop') {
            await interaction.update({
                content: '✅ تم إلغاء حذف المتجر',
                embeds: [],
                components: []
            });
        } else if (customId === 'auto_post_stop') {
            await handleAutoPostStop(interaction);
        } else if (customId === 'auto_post_edit') {
            await handleAutoPostEdit(interaction);
        } else if (customId.startsWith('change_type_')) {
            await handleChangeTypePayment(interaction);
        } else if (customId === 'cancel') {
            await interaction.update({
                content: 'تم إلغاء العملية.',
                components: [],
                embeds: []
            });
        }
    } catch (error) {
        console.error('خطأ في معالجة الزر:', error);
        if (!interaction.replied) {
            await interaction.reply({ content: 'حدث خطأ!', ephemeral: true });
        }
    }
}

// معالجة شراء المتاجر التلقائي
async function handleBuyShopTicket(interaction) {
    const data = await db.get(`buy_shop_ticket_${interaction.member.id}`);
    if (data) {
        return await interaction.reply({
            content: `**من فضلك عندك تذكره لا يمكنك فتح تذكره اخره - <#${data.channelId}>**`,
            ephemeral: true
        });
    }

    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({ content: `Please wait ....` });

    const channel = await interaction.guild.channels.create({
        name: `buy shop ${interaction.user.tag}`,
        type: ChannelType.GuildText,
        parent: config.catagory,
        topic: "تـكـت شـراء مـتـجـر",
        permissionOverwrites: [
            {
                id: interaction.user.id,
                allow: [
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ViewChannel,
                ],
            },
            {
                id: interaction.guild.id,
                deny: [
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ViewChannel,
                ],
            },
        ],
    });

    await db.set(`buy_shop_ticket_${interaction.member.id}`, {
        userId: interaction.member.id,
        channelId: channel.id
    });

    const embedAboveButtons = createStandardEmbed('بانل اختيار نوع المتجر', '**قـم بـإخـتـيـار نـوع الـمـتـجـر مـن الأزرار أدنـاه**', interaction.guild);
    embedAboveButtons.setImage(config.info);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('1b')
                .setLabel(config.button1)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('2b')
                .setLabel(config.button2)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('3b')
                .setLabel(config.button3)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('4b')
                .setLabel(config.button4)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('5b')
                .setLabel(config.button5)
                .setStyle(ButtonStyle.Primary)
        );

    const closeRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('إغلاق التذكرة')
                .setStyle(ButtonStyle.Danger)
        );

    await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embedAboveButtons],
        components: [row, closeRow]
    });

    await interaction.editReply({
        content: `**-  ..تـم انـشـاء تـذكرتـك بنـجـاح.. \n- روم التـذكـرة : <#${channel.id}>**`,
        ephemeral: true
    });
}

// معالجة شراء نوع المتجر
async function handleShopTypePurchase(interaction) {
    const userData = await db.get(`shop_credit_${interaction.member.id}`);
    if (userData) {
        return await interaction.reply({
            content: `**لا يمكنك شراء متجرين في نفس الوقت.**`,
            ephemeral: true
        });
    }

    let typei;
    switch (interaction.customId) {
        case '1b': typei = types[0]; break; // PLATENUEM
        case '2b': typei = types[1]; break; // GRAND MASTER
        case '3b': typei = types[2]; break; // MASTER
        case '4b': typei = types[3]; break; // DIAMOND
        case '5b': typei = types[4]; break; // BRONZE
        default: return;
    }

    if (!typei) {
        return await interaction.reply({
            content: `**خطأ في نوع المتجر المحدد.**`,
            ephemeral: true
        });
    }

    const price = typei.price;
    const taxs = Math.floor(typei.price * 20 / 19 + 1);

    const choosedShop = interaction.message.components[0].components.find(c => c.customId === interaction.customId).label;
    const embed = createStandardEmbed(`Choosed Shop: ${choosedShop}\nprice: ${price}`, `- <@${interaction.member.id}>\n\`\`\`ملاحظة: انسخ الرسالة ادناء للتحويل بسرعة لديك 60 ثانية\`\`\``, interaction.guild);

    await interaction.deferUpdate();
    await interaction.channel.send({ embeds: [embed] });
    await interaction.channel.send({ content: `#credit ${config.bank} ${taxs}` });
    await db.set(`shop_credit_${interaction.member.id}`, interaction.member.id);

    // مراقبة الدفع
    const collectorFilter = m => m.author.bot === true && m.author.id === config.probot;
    const collector = interaction.channel.createMessageCollector({
        filter: collectorFilter,
        time: 60000
    });

    collector.on('collect', async c => {
        await sendDebugLog('تم اكتشاف رسالة من البوت: ' + c.content, interaction.channel.name, interaction.user.username);

        // التحقق من أن الرسالة تحتوي على رمز المال ومعلومات التحويل
        if (c.content.includes(':moneybag:') || c.content.includes('💰')) {
            await sendDebugLog('رسالة دفع محتملة: ' + c.content, interaction.channel.name, interaction.user.username);

            // التحقق من وجود اسم المستخدم والبنك في الرسالة
            const hasUsername = c.content.includes(interaction.user.username) || c.content.includes(interaction.user.tag) || c.content.includes(interaction.user.displayName);
            const hasBank = c.content.includes(config.bank);

            await sendDebugLog(`فحص الرسالة - المستخدم: ${hasUsername} | البنك: ${hasBank}`, interaction.channel.name, interaction.user.username);

            if (hasUsername && hasBank) {
                // البحث عن المبلغ بصيغ مختلفة
                let transferredAmount = 0;

                // أنماط البحث المحسنة
                const patterns = [
                    /has transferred `\$([0-9,]+)`/g,
                    /قام بتحويل `\$([0-9,]+)`/g,
                    /transferred `\$([0-9,]+)`/g,
                    /`\$([0-9,]+)`/g,
                    /\$([0-9,]+)/g,
                    /([0-9,]+)\$/g
                ];

                for (const pattern of patterns) {
                    const matches = [...c.content.matchAll(pattern)];
                    for (const match of matches) {
                        const amount = parseInt(match[1].replace(/,/g, ''));
                        if (amount > 0) {
                            transferredAmount = amount;
                            await sendDebugLog(`تم العثور على المبلغ: ${transferredAmount} بالنمط: ${pattern}`, interaction.channel.name, interaction.user.username);
                            break;
                        }
                    }
                    if (transferredAmount > 0) break;
                }

                if (transferredAmount > 0) {
                    await sendDebugLog(`المبلغ المحول: ${transferredAmount} | المطلوب: ${price} | الضريبة: ${taxs}`, interaction.channel.name, interaction.user.username);

                    // التحقق من أن المبلغ يساوي السعر أو الضريبة أو أكثر
                    if (transferredAmount >= price) {
                        await sendDebugLog('✅ تم تأكيد الدفع! جاري إنشاء المتجر...', interaction.channel.name, interaction.user.username);
                        collector.stop('DONE');
                        // تنفيذ إنشاء المتجر مباشرة
                        setTimeout(async () => {
                            await createShopFromPayment(interaction, typei.id, typei);
                        }, 1000);
                        return;
                    } else {
                        await sendDebugLog(`❌ المبلغ غير كافي: ${transferredAmount} | المطلوب: ${price}`, interaction.channel.name, interaction.user.username);
                    }
                } else {
                    await sendDebugLog('❌ لا يمكن  ستخراج المبلغ من الرسالة', interaction.channel.name, interaction.user.username);
                }
            } else {
                await sendDebugLog('❌ الرسالة لا تحتوي على المستخدم أو البنك المطلوب', interaction.channel.name, interaction.user.username);
            }
        } else {
            await sendDebugLog('الرسالة ليست رسالة دفع', interaction.channel.name, interaction.user.username);
        }
    });

    collector.on('end', async (collected, reason) => {
        if (reason === 'DONE') {
            // createShopFromPayment is called inside the collector now
        } else {
            // التحقق من وجود القناة قبل إرسال الرسالة
            if (interaction.channel && !interaction.channel.deleted) {
                await interaction.channel.send({ content: `انتهى الوقت. قم بإنشاء تذكرة جديدة لإعادة المحاولة.` }).catch(error => {
                    console.error('خطأ في إرسال رسالة انتهاء الوقت:', error);
                });
                await db.delete(`buy_shop_ticket_${interaction.member.id}`);
                await db.delete(`shop_credit_${interaction.member.id}`);
                setTimeout(() => {
                    if (interaction.channel && !interaction.channel.deleted) {
                        interaction.channel.delete().catch(error => {
                            console.error('خطأ في حذف القناة:', error);
                        });
                    }
                }, 5000);
            } else {
                // تنظيف البيانات حتى لو حُذفت القناة
                await db.delete(`buy_shop_ticket_${interaction.member.id}`);
                await db.delete(`shop_credit_${interaction.member.id}`);
            }
        }
    });
}

// إنشاء المتجر بعد الدفع
async function createShopFromPayment(interaction, categoryID, typei) {
    const msg = await interaction.channel.send({
        content: `\`-\` **<@${interaction.member.id}>\nرجاء قم بكتابة اسم المتجر.**\n\`-\` **__لا يمكنك تغيير الاسم بعد كتابته.__**`
    });

    const nameCollector = interaction.channel.createMessageCollector({
        filter: m => m.author.id === interaction.user.id,
        time: 60000
    });

    nameCollector.on('collect', async m => {
        const are = m.content.trim();
        if (are.length < 3 || are.length > 15) {
            await interaction.channel.send('**يـجـب ان يـكـون الأسـم اكـثـر مـن ثـلاث احـرف و اقـل مـن 15 حـرف **');
            return;
        }

        const naeee = are.replaceAll(' ', '・');
        const typeo = types.find(t => t.id === categoryID);
        const opi = `${typeo.badge}${config.prefix}${naeee}`;
        const existingChannel = interaction.guild.channels.cache.find(c => c.name === opi);

        if (existingChannel) {
            await interaction.channel.send('**يـوجـد مـتـجـر بـهـذا الأسـم ضـع أسـم أخـر**');
            return;
        }

        await db.delete(`buy_shop_ticket_${interaction.member.id}`);
        await db.delete(`shop_credit_${interaction.member.id}`);

        let adminss = interaction.guild.roles.cache.get(config.Admin);

        const newChannel = await interaction.guild.channels.create({
            name: opi,
            type: ChannelType.GuildText,
            parent: typeo.id,
            permissionOverwrites: [
                {
                    id: interaction.user.id,
                    allow: ['SendMessages', 'MentionEveryone', 'EmbedLinks', 'AttachFiles', 'ViewChannel']
                },
                {
                    id: interaction.guild.roles.everyone,
                    deny: ['SendMessages'],
                    allow: ['ViewChannel']
                },
                {
                    id: adminss.id,
                    allow: ['SendMessages', 'MentionEveryone', 'EmbedLinks', 'AttachFiles', 'ViewChannel']
                }
            ]
        });

        const dy = parseInt(Date.now() / 1000);
        const em5 = createStandardEmbed(` **مـعـلـومـات مـتـجـر : ** `, `** - المـنـشـنـات:  **\n\`•\` everyone: ${typeo.every} \n \`•\` here: ${typeo.here}`, interaction.guild);
        em5.setAuthor({ name: `${interaction.guild.name}`, icon_url: interaction.guild.iconURL({ size: 1024 }) });
        em5.setFooter({ text: `_d3q`, icon_url: interaction.guild.iconURL() });
        em5.setFields([
            {
                name: 'صـاحب المتـجـر',
                value: `<@${interaction.user.id}>`,
                inline: true
            },
            {
                name: 'نـوع المـتـجـر',
                value: `<@&${typeo.role}>`,
                inline: true
            },
            {
                name: 'مـوعـد انـشـاء المـتـجـر',
                value: `<t:${dy}:R>`,
                inline: true
            },
        ]);

        await newChannel.send({ embeds: [em5] });
        await interaction.channel.send({ content: `**تـم انـشـاء المـتـجـر بـ نـجـاح  ${newChannel}**` });

        let dateed = parseInt(Date.now() / 1000);
        let datecreatedd = `<t:${dateed}:R>`;
        await db.set(`shop_${newChannel.id}`, {
            owner: interaction.user.id,
            type: typei.role,
            shop: typei.shop,
            every: typei.every,
            here: typei.here,
            date: datecreatedd,
            status: "1",
            badge: typei.badge
        });

        // إرسال لوج
        const logg = interaction.guild.channels.cache.get(config.commandlog);
        if (logg) {
            const embedlog = createStandardEmbed(`تـم إنـشـاء مـتـجـر`, `الـمـسـؤول : شـراء تـلـقـائـي (الـبـوت) `, interaction.guild);
            embedlog.addFields(
                { name: 'الـمـتـجـر الـذي تـم إنـشـائـه', value: `<#${newChannel.id}>`, inline: true },
                { name: 'نـوع الـمـتـجـر', value: `<@&${typei.role}>`, inline: true },
                { name: 'مـالـك الـمـتـجـر', value: `<@${interaction.user.id}>`, inline: true }
            );
            embedlog.setFooter({ text: `_d3q`, icon_url: interaction.guild.iconURL() });

            await logg.send({ embeds: [embedlog] });
        }

        setTimeout(() => {
            interaction.channel.delete();
        }, 5000);

        nameCollector.stop();
    });

    nameCollector.on('end', async collected => {
        if (collected.size === 0) {
            // التحقق من وجود القناة عند انتهاء الوقت
            if (msg && !msg.deleted && interaction.channel && !interaction.channel.deleted) {
                await msg.edit({ content: 'انتهى وقت تسمية المتجر. قم بإنشاء تذكرة جديدة لإعادة المحاولة.' }).catch(error => {
                    console.error('خطأ في تعديل الرسالة:', error);
                });
                await db.delete(`buy_shop_ticket_${interaction.member.id}`);
                await db.delete(`shop_credit_${interaction.member.id}`);
                setTimeout(() => {
                    if (interaction.channel && !interaction.channel.deleted) {
                        interaction.channel.delete().catch(error => {
                            console.error('خطأ في حذف القناة:', error);
                        });
                    }
                }, 5000);
            } else {
                // تنظيف البيانات حتى لو حُذفت القناة
                await db.delete(`buy_shop_ticket_${interaction.member.id}`);
                await db.delete(`shop_credit_${interaction.member.id}`);
            }
        }
    });
}



// معالجة شراء المنشن
async function handleMentionButton(interaction) {
    const sellerId = await db.get(`shop_${interaction.channel.id}.owner`);

    if (interaction.user.id !== sellerId) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Not Shop Owner')
            .setDescription(`You are not the owner of the shop. the owner is <@${sellerId || 'Not found in the database'}>`)
        return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const modal = new ModalBuilder()
        .setCustomId('mention_modal')
        .setTitle('شراء منشنات');

    const mentionStyle = new TextInputBuilder()
        .setCustomId('amount')
        .setLabel('اكتب عدد المنشنات التي تريد شرائها')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(mentionStyle);
    modal.addComponents(firstActionRow);
    await interaction.showModal(modal);
}

// معالجة مودال المنشنات
async function handleModalSubmits(interaction) {
    if (interaction.customId === 'bot_setup_modal') {
        const shopAdmin = interaction.fields.getTextInputValue('shop_admin');
        const logsChannel = interaction.fields.getTextInputValue('logs_channel');
        const bankId = interaction.fields.getTextInputValue('bank_id');
        const lineImage = interaction.fields.getTextInputValue('line_image');
        const orderRoom = interaction.fields.getTextInputValue('order_room');

        config.Admin = shopAdmin;
        config.log = logsChannel;
        config.commandlog = logsChannel;
        config.bank = bankId;
        if (lineImage) config.line = lineImage;
        if (orderRoom) {
            orderChannel = orderRoom;
            config.orderRoom = orderRoom;
        }

        await interaction.reply({
            content: `✅ تم تحديث الإعدادات الأساسية بنجاح!\n\n` +
                    `**🛡️ shop-admin:** <@&${shopAdmin}>\n` +
                    `**📋 logs:** <#${logsChannel}>\n` +
                    `**🏦 bank:** <@${bankId}>\n` +
                    `**📏 line:** ${lineImage ? '✅ تم التحديث' : '❌ لم يتم تحديده'}\n` +
                    `**📋 order-room:** ${orderRoom ? `<#${orderRoom}>` : '❌ لم يتم تحديده'}`,
            ephemeral: true
        });
    } else if (interaction.customId === 'admins_setup_modal') {
        const orderAdmin = interaction.fields.getTextInputValue('order_admin');
        const auctionAdmin = interaction.fields.getTextInputValue('auction_admin');
        const auctionRoom = interaction.fields.getTextInputValue('auction_room');

        if (orderAdmin) config.orderAdmin = orderAdmin;
        if (auctionAdmin) config.auctionAdmin = auctionAdmin;
        if (auctionRoom) {
            config.auctionChannel = auctionRoom;
            // تحديث المتغير العام أيضاً إذا لزم الأمر
        }

        await interaction.reply({
            content: `✅ تم تحديث إعدادات الإدارة بنجاح!\n\n` +
                    `**📋 order-admin:** ${orderAdmin ? `<@${orderAdmin}>` : '❌ لم يتم تحديده'}\n` +
                    `**🏆 auction-admin:** ${auctionAdmin ? `<@${auctionAdmin}>` : '❌ لم يتم تحديده'}\n` +
                    `**🏆 auction-room:** ${auctionAdmin ? `<#${auctionRoom}>` : '❌ لم يتم تحديده'}`,
            ephemeral: true
        });
    } else if (interaction.customId === 'tickets_setup_modal') {
        const orderTicket = interaction.fields.getTextInputValue('order_ticket');
        const auctionTicket = interaction.fields.getTextInputValue('auction_ticket');
        const category = interaction.fields.getTextInputValue('category');

        if (orderTicket) config.orderTicket = orderTicket;
        if (auctionTicket) config.auctionTicket = auctionTicket;
        if (category) config.catagory = category;

        await interaction.reply({
            content: `✅ تم تحديث إعدادات التذاكر بنجاح!\n\n` +
                    `**🎫 order-ticket:** ${orderTicket ? `<#${orderTicket}>` : '❌ لم يتم تحديده'}\n` +
                    `**🎫 auction-ticket:** ${auctionTicket ? `<#${auctionTicket}>` : '❌ لم يتم تحديده'}\n` +
                    `**📁 category:** ${category ? `<#${category}>` : '❌ لم يتم تحديده'}`,
            ephemeral: true
        });
    } else if (interaction.customId === 'normal_mentions_modal') {
        const everyonePrice = parseInt(interaction.fields.getTextInputValue('everyone_price')) || config.every;
        const herePrice = parseInt(interaction.fields.getTextInputValue('here_price')) || config.here;
        const shopMentionPrice = parseInt(interaction.fields.getTextInputValue('shop_mention_price')) || 5000;

        config.every = everyonePrice;
        config.here = herePrice;
        config.shopMentionPrice = shopMentionPrice;

        await interaction.reply({
            content: `✅ تم تحديث أسعار المنشنات العادية بنجاح!\n\n` +
                    `**📢 الأسعار الجديدة:**\n` +
                    `• منشن @everyone: ${config.every.toLocaleString()} كرديت\n` +
                    `• منشن @here: ${config.here.toLocaleString()} كرديت\n` +
                    `• منشن المتجر: ${config.shopMentionPrice.toLocaleString()} كرديت\n\n` +
                    `**💡 هذه الأسعار تطبق على منشنات المتاجر العادية فقط**`,
            ephemeral: true
        });
    } else if (interaction.customId === 'order_mentions_modal') {
        const orderEveryonePrice = parseInt(interaction.fields.getTextInputValue('order_everyone_price')) || config.oeverey;
        const orderHerePrice = parseInt(interaction.fields.getTextInputValue('order_here_price')) || config.ohere;
        const orderDescription = interaction.fields.getTextInputValue('order_description') || '';

        config.oeverey = orderEveryonePrice;
        config.ohere = orderHerePrice;
        config.orderDescription = orderDescription;

        await interaction.reply({
            content: `✅ تم تحديث أسعار منشنات الطلبات بنجاح!\n\n` +
                    `**📋 الأسعار الجديدة:**\n` +
                    `• منشن @everyone للطلبات: ${config.oeverey.toLocaleString()} كرديت\n` +
                    `• منشن @here للطلبات: ${config.ohere.toLocaleString()} كرديت\n` +
                    (orderDescription ? `\n**📝 الوصف:** ${orderDescription}` : '') +
                    `\n\n**💡 هذه الأسعار تطبق على طلبات المشتريات فقط**`,
            ephemeral: true
        });
    } else if (interaction.customId === 'auction_mentions_modal') {
        const auctionEveryonePrice = parseInt(interaction.fields.getTextInputValue('auction_everyone_price')) || config.oeverey;
        const auctionHerePrice = parseInt(interaction.fields.getTextInputValue('auction_here_price')) || config.ohere;
        const auctionDescription = interaction.fields.getTextInputValue('auction_description') || '';

        // تحديث أسعار المزادات (نفس أسعار الطلبات حالياً)
        config.auctionEveryone = auctionEveryonePrice;
        config.auctionHere = auctionHerePrice;
        config.auctionDescription = auctionDescription;

        await interaction.reply({
            content: `✅ تم تحديث أسعار منشنات المزادات بنجاح!\n\n` +
                    `**🏆 الأسعار الجديدة:**\n` +
                    `• منشن @everyone للمزادات: ${auctionEveryonePrice.toLocaleString()} كرديت\n` +
                    `• منشن @here للمزادات: ${auctionHerePrice.toLocaleString()} كرديت\n` +
                    (auctionDescription ? `\n**📝 الوصف:** ${auctionDescription}` : '') +
                    `\n\n**💡 هذه الأسعار تطبق على المزادات فقط**`,
            ephemeral: true
        });
    } else if (interaction.customId === 'shop_prices_modal') {
        const platinumPrice = parseInt(interaction.fields.getTextInputValue('platinum_price')) || types[0].price;
        const grandmasterPrice = parseInt(interaction.fields.getTextInputValue('grandmaster_price')) || types[1].price;
        const shopPriceNote = interaction.fields.getTextInputValue('shop_price_note') || '';

        // تحديث أسعار أول متجرين كمثال
        types[0].price = platinumPrice;
        types[1].price = grandmasterPrice;
        config.shopPriceNote = shopPriceNote;

        await interaction.reply({
            content: `✅ تم تحديث أسعار المتاجر بنجاح!\n\n` +
                    `**🏪 الأسعار الجديدة:**\n` +
                    `• ${types[0].badge} ${types[0].name}: ${platinumPrice.toLocaleString()} كرديت\n` +
                    `• ${types[1].badge} ${types[1].name}: ${grandmasterPrice.toLocaleString()} كرديت\n` +
                    (shopPriceNote ? `\n**📝 ملاحظة:** ${shopPriceNote}` : '') +
                    `\n\n**💡 يمكنك تعديل باقي أنواع المتاجر من ملف types.js**`,
            ephemeral: true
        });
    } else if (interaction.customId === 'extra_services_modal') {
        const removeWarningPrice = parseInt(interaction.fields.getTextInputValue('remove_warning_price')) || 2;
        const enableShopPrice = parseInt(interaction.fields.getTextInputValue('enable_shop_price')) || 5000;
        const changeNamePrice = parseInt(interaction.fields.getTextInputValue('change_name_price')) || 1;

        config.removeWarningPrice = removeWarningPrice;
        config.enableShopPrice = enableShopPrice;
        config.changeNamePrice = changeNamePrice;

        await interaction.reply({
            content: `✅ تم تحديث أسعار الخدمات الإضافية بنجاح!\n\n` +
                    `**💰 الأسعار الجديدة:**\n` +
                    `• إزالة التحذير الواحد: ${removeWarningPrice.toLocaleString()} كرديت\n` +
                    `• تفعيل متجر معطل: ${enableShopPrice.toLocaleString()} كرديت\n` +
                    `• تغيير اسم المتجر: ${changeNamePrice.toLocaleString()} كرديت\n\n` +
                    `**💡 ملاحظة:** تغيير نوع المتجر = نصف سعر المتجر الجديد`,
            ephemeral: true
        });
    } else if (interaction.customId === 'prices_config_modal') {
        // Keep for backward compatibility
        const everyonePrice = parseInt(interaction.fields.getTextInputValue('everyone_price')) || config.every;
        const herePrice = parseInt(interaction.fields.getTextInputValue('here_price')) || config.here;
        const orderEveryonePrice = parseInt(interaction.fields.getTextInputValue('order_everyone_price')) || config.oeverey;
        const orderHerePrice = parseInt(interaction.fields.getTextInputValue('order_here_price')) || config.ohere;
        const shopMentionPrice = parseInt(interaction.fields.getTextInputValue('shop_mention_price')) || 5000;

        config.every = everyonePrice;
        config.here = herePrice;
        config.oeverey = orderEveryonePrice;
        config.ohere = orderHerePrice;
        config.shopMentionPrice = shopMentionPrice;

        await interaction.reply({
            content: `✅ تم تحديث جميع الأسعار بنجاح! استخدم \`/edit-prices type:view_all\` لعرض الأسعار الجديدة`,
            ephemeral: true
        });
    } else if (interaction.customId === 'encryption_modal') {
        const oldWord = interaction.fields.getTextInputValue('old_word');
        const newWord = interaction.fields.getTextInputValue('new_word');

        // إضافة الكلمة الجديدة لقائمة التشفير
        replace.push({ word: oldWord, replace: newWord });

        await interaction.reply({
            content: `✅ تم إضافة كلمة التشفير:\n**قبل:** ${oldWord}\n**بعد:** ${newWord}`,
            ephemeral: true
        });
    } else if (interaction.customId === 'remove_warning_amount_modal') {
        const warningAmount = interaction.fields.getTextInputValue('warning_amount');

        if (isNaN(warningAmount) || parseInt(warningAmount) <= 0) {
            return interaction.reply({
                content: 'يجب إدخال رقم صحيح أكبر من صفر',
                ephemeral: true
            });
        }

        const shopData = await db.get(`shop_${interaction.channel.id}`);
        if (!shopData) {
            return interaction.reply({
                content: 'هذا الشات ليس متجراً!',
                ephemeral: true
            });
        }

        const currentWarns = shopData.warns || 0;
        const amountToRemove = parseInt(warningAmount);

        if (currentWarns < amountToRemove) {
            return interaction.reply({
                content: `لا يمكن إزالة ${amountToRemove} تحذيرات والمتجر لديه ${currentWarns} تحذيرات فقط!`,
                ephemeral: true
            });
        }

        // التحقق من أن المستخدم هو صاحب المتجر أو مساعد له
        const shopPartners = shopData.partners || [];
        const isOwner = interaction.user.id === shopData.owner;
        const isHelper = shopPartners.includes(interaction.user.id);

        if (!isOwner && !isHelper) {
            return interaction.reply({
                content: 'لا يمكنك استخدام متجر ليس لك',
                ephemeral: true
            });
        }

        // حساب التكلفة لإزالة التحذير
        const pricePerWarning = 2; // 2 كرديت لكل تحذير
        const totalPrice = amountToRemove * pricePerWarning;
        const tax = Math.floor(totalPrice * 20 / 19 + 1);

        const paymentEmbed = new EmbedBuilder()
            .setTitle('💰 دفع لإزالة التحذير')
            .setDescription(`**لإزالة ${amountToRemove} تحذير من متجرك، يجب دفع المبلغ التالي:**`)
            .addFields(
                { name: 'عدد التحذيرات المُزالة:', value: amountToRemove.toString(), inline: true },
                { name: 'السعر لكل تحذير:', value: pricePerWarning.toLocaleString(), inline: true },
                { name: 'إجمالي المبلغ:', value: totalPrice.toLocaleString(), inline: true },
                { name: 'المبلغ مع الضريبة:', value: tax.toLocaleString(), inline: true }
            )
            .setColor('#FFA500')
            .setFooter({ text: 'Dev By: ibro & yzn' })
            .setTimestamp();

        await interaction.reply({ embeds: [paymentEmbed] });

        await interaction.followUp({
            content: `#credit ${config.bank} ${tax}`
        });

        // حفظ بيانات عملية الدفع
        await db.set(`remove_warning_payment_${interaction.user.id}`, {
            shopId: interaction.channel.id,
            warningAmount: amountToRemove,
            totalPrice: totalPrice,
            tax: tax,
            timestamp: Date.now()
        });





        // مراقبة الدفع
        const filter = (message) => {
            return (
                message.author.id === config.probot &&
                (message.content.includes(':moneybag:') || message.content.includes('💰')) &&
                (message.content.includes(interaction.user.username) ||
                 message.content.includes(interaction.user.tag) ||
                 message.content.includes(interaction.user.displayName)) &&
                message.content.includes(config.bank)
            );
        };

        const collector = interaction.channel.createMessageCollector({
            filter,
            max: 1,
            time: 120000
        });

        collector.on('collect', async (collected) => {
            const transferredAmount = extractAmountFromMessage(collected.content);

            if (transferredAmount >= totalPrice) {
                // إزالة التحذيرات
                await db.sub(`shop_${interaction.channel.id}.warns`, amountToRemove);
                const newWarns = currentWarns - amountToRemove;

                // تحديث الرسالة الأصلية لتبقى مرئية
                const successEmbed = new EmbedBuilder()
                    .setTitle('✅ تم إزالة التحذير بنجاح')
                    .setDescription(`**تم الدفع وإزالة التحذيرات**`)
                    .addFields(
                        { name: 'التحذيرات المُزالة:', value: amountToRemove.toString(), inline: true },
                        { name: 'التحذيرات المتبقية:', value: newWarns.toString(), inline: true },
                        { name: 'المبلغ المدفوع:', value: transferredAmount.toLocaleString(), inline: true }
                    )
                    .setColor('#00FF00')
                    .setFooter({ text: 'Dev By: ibro & yzn' })
                    .setTimestamp();

                const disabledButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`removed_warning`)
                            .setLabel(`✅ تم الإزالة بنجاح`)
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(true)
                    );

                // تحديث الرسالة الأصلية بدلاً من حذفها
                await interaction.message.edit({
                    embeds: [successEmbed],
                    components: [disabledButton]
                });

                // إذا كان المتجر مقفل وأصبح عدد التحذيرات أقل من 5، قم بإعادة تفعيله
                if (shopData.status === "0" && newWarns < 5) {
                    const shopId = interaction.channel.id;
                    const shop = interaction.guild.channels.cache.get(shopId);
                    if (shop) {
                        await shop.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                            ViewChannel: true,
                        });
                        await db.set(`shop_${shopId}.status`, "1");

                        const unlockEmbed = createStandardEmbed('🔓 تم إعادة تفعيل المتجر', 'تم إعادة تفعيل المتجر بعد إزالة التحذيرات', interaction.guild);
                        unlockEmbed.addFields(
                            { name: 'صاحب المتجر:', value: `<@${shopData.owner}>` },
                            { name: 'التحذيرات الحالية:', value: newWarns.toString() }
                        );
                        unlockEmbed.setColor('#00FF00');

                        await shop.send({ embeds: [unlockEmbed] });
                    }
                }

                // إرسال لوج
                const logChannel = interaction.guild.channels.cache.get(config.commandlog);
                if (logChannel) {
                    const logEmbed = createStandardEmbed('تم إزالة تحذير متجر بالدفع', `صاحب المتجر: <@${interaction.user.id}>`, interaction.guild);
                    logEmbed.addFields(
                        { name: 'المتجر:', value: `<#${shopId}>`, inline: true },
                        { name: 'التحذيرات المُزالة:', value: amountToRemove.toString(), inline: true },
                        { name: 'التحذيرات الحالية:', value: newWarns.toString(), inline: true },
                        { name: 'المبلغ المدفوع:', value: transferredAmount.toLocaleString(), inline: true }
                    );

                    await logChannel.send({ embeds: [logEmbed] });
                }

                // حذف بيانات الدفع
                await db.delete(`remove_warning_payment_${interaction.user.id}`);
            } else {
                await interaction.channel.send({
                    content: `❌ المبلغ المحول (${transferredAmount.toLocaleString()}) غير كافي. المطلوب: ${totalPrice.toLocaleString()}`
                });
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                await interaction.channel.send({
                    content: `❌ انتهى وقت الدفع لإزالة التحذير. يرجى المحاولة مرة أخرى.`
                });
                await db.delete(`remove_warning_payment_${interaction.user.id}`);
            }
        });

    }
}

// دوال إعداد بانلات الشراء
async function sendBuyTicket(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const chann = interaction.options.getChannel('channel');

    if (!interaction.member.roles.cache.has(config.Admin)) {
        return interaction.editReply(`ليس لديك صلاحية لاستخدام هذا الأمر - تحتاج رتبة <@&${config.Admin}>`);
    }

    const embed = createStandardEmbed('شراء متجر', '**__قم بالضغط على الزر في الاسفل لشراء متجر__**', interaction.guild);
    embed.setImage(config.info);

    const row = new ActionRowBuilder()
        .addComponents(new ButtonBuilder()
            .setCustomId('buy_shop_ticket')
            .setLabel('شراء متجر')
            .setStyle(ButtonStyle.Primary)
        );

    if (chann) {
        const uio = interaction.guild.channels.cache.get(chann.id);
        if (!uio) {
            return interaction.editReply('**الـروم غـيـر مـوجـود داخـل الـسـيـرفـر او لـم أسـتـطـع إيـجـاده**');
        }
        await chann.send({ embeds: [embed], components: [row] });
        await interaction.editReply('**تـم إرسـال الـرس الـه بـنـجـاح**');
    } else {
        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.editReply('**تـم إرسـال الـرسـالـه بـنـجـاح**');
    }
}



// دوال إضافية
async function warnShop(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const shop = interaction.options.getChannel('shop');
    const amount = interaction.options.getNumber('amount');
    const reason = interaction.options.getString('reason');
    const proof = interaction.options.getAttachment('proof');

    if (amount === 0) return interaction.editReply({ content: `لا يمكن إضافة 0 تحذيرات` });

    const data = await db.get(`shop_${shop.id}`);
    if (!data) {
        return interaction.editReply({ content: `** هـصة الـروم لـيـسـت مـتـجـرا **` });
    }

    await db.add(`shop_${shop.id}.warns`, amount);
    const newWarns = (data.warns || 0) + amount;

    const embed = createStandardEmbed(`تـم تـحـذيـر الـمـتـجـر`, `الـمـسـؤول: <@${interaction.user.id}>`, interaction.guild);
    embed.addFields(
        { name: 'عـدد الـتـحـذيـرات الـكـامـل:', value: newWarns.toString(), inline: true },
        { name: 'سـبـب الـتـحـذيـر:', value: reason, inline: true },
        { name: 'عـدم تـشـفـيـر الـكـلـمـات النـاتـجـة:', value: 'خـاص', inline: true },
        { name: 'الـمـسـؤول:', value: 'تـلـقـائـي', inline: true },
        { name: 'الـوقـت:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
    );
    embed.setImage(proof?.url || null);
    embed.setColor('#FF0000');

    const removeButton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`remove_warning_${shop.id}_${amount}`)
                .setLabel('إزالة التحذير')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('💰')
        );

    await shop.send({ content: `<@${data.owner}>`, embeds: [embed], components: [removeButton] });

    // فحص إذا وصلت التحذيرات لـ 5 أو أكثر
    if (newWarns >= 7) {
        // حذف المتجر نهائياً
        const deleteEmbed = createStandardEmbed('🗑️ تم حذف المتجر نهائياً', `**تم حذف المتجر بسبب وصول التحذيرات إلى 7 تحذيرات**`, interaction.guild);
        deleteEmbed.addFields(
            { name: 'عدد التحذيرات:', value: newWarns.toString() },
            { name: 'المالك:', value: `<@${data.owner}>` },
            { name: 'اسم المتجر:', value: shop.name }
        );
        deleteEmbed.setColor('#8B0000');

        // إرسال إشعار للوج
        const logChannel = interaction.guild.channels.cache.get(config.log);
        if (logChannel) {
            await logChannel.send({
                content: '@everyone',
                embeds: [deleteEmbed]
            });
        }

        // حذف بيانات المتجر من قاعدة البيانات
        await db.delete(`shop_${shop.id}`);

        // حذف القناة
        await shop.delete();

    } else if (newWarns >= 5) {
        // قفل المتجر
        await shop.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            ViewChannel: false,
        });

        await db.set(`shop_${shop.id}.status`, "0");

        const lockEmbed = createStandardEmbed('🔒 تم إغلاق المتجر', `**تم إغلاق المتجر بسبب وصول التحذيرات إلى 5 تحذيرات**`, interaction.guild);
        lockEmbed.addFields(
            { name: 'عدد التحذيرات:', value: newWarns.toString() },
            { name: 'المالك:', value: `<@${data.owner}>` },
            { name: 'تحذير:', value: 'عند وصول التحذيرات إلى 7 سيتم حذف المتجر نهائياً' }
        );
        lockEmbed.setColor('#8B0000');

        await shop.send({ content: `<@${data.owner}>`, embeds: [lockEmbed] });

        // إرسال إشعار للوج
        const logChannel = interaction.guild.channels.cache.get(config.log);
        if (logChannel) {
            await logChannel.send({
                content: '@everyone',
                embeds: [lockEmbed]
            });
        }
    }

    await interaction.editReply({ content: `**تـم تـحـذيـر الـمـتـجـر ${shop} بـنـجـاح - التحذيرات الآن: ${newWarns}**` });

    // إرسال لوج
    const logg = interaction.guild.channels.cache.get(config.commandlog);
    if (logg) {
        const embedlog = createStandardEmbed(`تـم تـحـذيـر مـتـجـر`, `الـمـسـؤول : <@${interaction.user.id}>`, interaction.guild);
        embedlog.addFields(
            { name: 'المـتـجـر:', value: `<#${shop.id}>`, inline: true },
            { name: 'عـدد الـتـحـذيـرات الـجـديـدة', value: amount.toString(), inline: true },
            { name: 'إجـمـالـي الـتـحـذيـرات', value: newWarns.toString(), inline: true },
            { name: 'سـبـب الـتـحـذيـر', value: reason, inline: true }
        );
        embedlog.setImage(proof?.url || null);

        await logg.send({ embeds: [embedlog] });
    }
}

async function unwarnShop(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const shop = interaction.options.getChannel('shop');
    const amount = interaction.options.getNumber('amount');

    const data = await db.get(`shop_${shop.id}`);
    if (!data) {
        return interaction.editReply({ content: `** هـذة الـروم لـيـسـت مـتـجـرا **` });
    }

    if (!data.warns) data.warns = 0;
    if (data.warns - amount < 0) {
        return interaction.editReply({ content: `** بـتـشـيـل ${amount} كـيـف و عـدد تـحـذيـرات المـتـجـر ${data.warns} اصـلا **` });
    }

    await db.sub(`shop_${shop.id}.warns`, amount);

    await interaction.editReply({ content: `**تـم ازالـة ${amount} تـحـذيـرات مـن مـتـجـر بـ نـجـاح ${shop}**` });
    await shop.send({ content: `**تـم ازالـة ${amount} تـحـذيـرات مـن المـتـجـر**` });
}

// دالة محسنة لتعطيل المتاجر (مع خيارات متقدمة)
async function handleDisableCommand(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const action = interaction.options.getString('action') || 'disable';
    const shop = interaction.options.getChannel('shop') || interaction.channel;
    const reason = interaction.options.getString('reason');
    const duration = interaction.options.getString('duration');

    const datap = await db.get(`shop_${shop.id}`);
    if (!datap) {
        return interaction.editReply('**هذا الروم ليس متجر**');
    }

    if (action === 'disable') {
        if (datap.status === "0") {
            return interaction.editReply('**هذا الروم معطل بالفعل**');
        }

        await shop.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            ViewChannel: false,
        });

        await db.set(`shop_${shop.id}.status`, "0");

        // إضافة تاريخ التعطيل ومدة التعطيل إذا تم تحديدها
        if (duration) {
            const disableUntil = Date.now() + ms(duration);
            await db.set(`shop_${shop.id}.disableUntil`, disableUntil);
        }

        const embedlog = createStandardEmbed(`تم تعطيل المتجر`, `المسؤول: <@${interaction.user.id}>`, interaction.guild);
        embedlog.addFields(
            { name: 'السبب', value: reason || 'لم يتم تحديد سبب', inline: true },
            { name: 'المدة', value: duration ? `${duration} (سيتم التفعيل تلقائياً)` : 'غير محددة', inline: true }
        );

        await shop.send({ content: `<@${datap.owner}>`, embeds: [embedlog] });
        await interaction.editReply('**تم تعطيل المتجر بنجاح**');

        // جدولة التفعيل التلقائي إذا تم تحديد مدة
        if (duration) {
            setTimeout(async () => {
                try {
                    await shop.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                        ViewChannel: true,
                    });
                    await db.set(`shop_${shop.id}.status`, "1");
                    await db.delete(`shop_${shop.id}.disableUntil`);

                    const autoEnableEmbed = createStandardEmbed('تم تفعيل المتجر تلقائياً', 'انتهت مدة التعطيل وتم تفعيل المتجر تلقائياً', interaction.guild);
                    await shop.send({ content: `<@${datap.owner}>`, embeds: [autoEnableEmbed] });
                } catch (error) {
                    console.error('خطأ في التفعيل التلقائي:', error);
                }
            }, ms(duration));
        }
    } else if (action === 'check_status') {
        const status = datap.status === "1" ? "مفعل ✅" : "معطل ❌";
        const disableUntil = await db.get(`shop_${shop.id}.disableUntil`);

        const statusEmbed = createStandardEmbed('حالة المتجر', `**الحالة الحالية:** ${status}`, interaction.guild);

        if (disableUntil && disableUntil > Date.now()) {
            statusEmbed.addFields({
                name: 'سيتم التفعيل في:',
                value: `<t:${Math.floor(disableUntil / 1000)}:R>`,
                inline: true
            });
        }

        await interaction.editReply({ embeds: [statusEmbed] });
    }
}

async function activateShop(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const shopi = interaction.options.getChannel('shop') || interaction.channel;
    const shppp = await db.get(`shop_${shopi.id}`);

    if (!shppp) {
        return interaction.editReply('**هـذا الـروم لـيـس مـتـجـر**');
    }

    if (shppp.status === "1") {
        return interaction.editReply('المـتـجـر مـفـعـل بـالـفـعـل');
    }

    await shopi.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        ViewChannel: true,
    });

    await db.set(`shop_${shopi.id}.status`, "1");

    const embedlog = createStandardEmbed(`تـم تـفـعـيـل الـمـتـجـر`, `يـرجـي قـرائـه الـقـوانـيـن و الإلـتـزام بـهـا\n\n**المنشنات المتبقية:**\n• everyone: ${shppp.every || 0}\n• here: ${shppp.here || 0}\n• shop: ${shppp.shop || 0}`, interaction.guild);
    await shopi.send({ embeds: [embedlog], content: `<@${shppp.owner}>` });
    await interaction.editReply('**تـم تـفـعـيـل الـمـتـجـر بـنـجـاح**');
}

// دالة محسنة لادارة المنشنات (دمج add-mentions + إضافة ميزات)
async function handleAddMentionsCommand(interaction) {
    await interaction.deferReply();

    const action = interaction.options.getString('action');
    const shop = interaction.options.getChannel('shop') || interaction.channel;
    const everyone = interaction.options.getNumber('everyone') || 0;
    const here = interaction.options.getNumber('here') || 0;
    const shopm = interaction.options.getNumber('shop_mentions') || 0;

    const shopData = await db.get(`shop_${shop.id}`);
    if (!shopData) {
        return interaction.editReply({ content: `هذه القناة ليست متجراً مسجلاً` });
    }

    let message = '';

    if (action === 'add') {
        await db.add(`shop_${shop.id}.every`, everyone);
        await db.add(`shop_${shop.id}.here`, here);
        await db.add(`shop_${shop.id}.shop`, shopm);
        message = `✅ تم إضافة المنشنات بنجاح`;

        await shop.send(`**تم إضافة منشنات للمتجر:**\n• **${everyone}** @everyone\n• **${here}** @here\n• **${shopm}** منشن متجر`);
    } else if (action === 'remove') {
        const currentEveryone = shopData.every || 0;
        const currentHere = shopData.here || 0;
        const currentShop = shopData.shop || 0;

        if (currentEveryone < everyone || currentHere < here || currentShop < shopm) {
            return interaction.editReply({ content: 'لا يمكن إزالة منشنات أكثر من المتاح في المتجر' });
        }

        await db.sub(`shop_${shop.id}.every`, everyone);
        await db.sub(`shop_${shop.id}.here`, here);
        await db.sub(`shop_${shop.id}.shop`, shopm);
        message = `✅ تم إزالة المنشنات بنجاح`;

        await shop.send(`**تم إزالة منشنات من المتجر:**\n• **${everyone}** @everyone\n• **${here}** @here\n• **${shopm}** منشن متجر`);
    } else if (action === 'reset') {
        const type = types.find(t => t.id === shop.parentId);
        if (type) {
            await db.set(`shop_${shop.id}.every`, type.every);
            await db.set(`shop_${shop.id}.here`, type.here);
            await db.set(`shop_${shop.id}.shop`, type.shop);
            message = `✅ تم إعادة تعيين المنشنات إلى القيم الافتراضية`;

            await shop.send(`**تم إعادة تعيين منشنات المتجر:**\n• **${type.every}** @everyone\n• **${type.here}** @here\n• **${type.shop}** منشن متجر`);
        }
    }

    await interaction.editReply({ content: message });

    // إرسال لوج
    const logChannel = interaction.guild.channels.cache.get(config.commandlog);
    if (logChannel) {
        const logEmbed = createStandardEmbed(`تم ${action === 'add' ? 'إضافة' : action === 'remove' ? 'إزالة' : 'إعادة تعيين'} منشنات متجر`, `المسؤول: <@${interaction.user.id}>`, interaction.guild);
        logEmbed.addFields(
            { name: 'المتجر:', value: `<#${shop.id}>`, inline: true },
            { name: 'العملية:', value: action === 'add' ? 'إضافة' : action === 'remove' ? 'إزالة' : 'إعادة تعيين', inline: true },
            { name: 'المنشنات:', value: `everyone: ${everyone}, here: ${here}, shop: ${shopm}`, inline: false }
        );
        await logChannel.send({ embeds: [logEmbed] });
    }
}

async function showShopData(interaction) {
    const shopData = await db.get(`shop_${interaction.channel.id}`);

    if (!shopData) {
        return interaction.reply({ content: `**هذا الشات ليس متجراً**`, ephemeral: true });
    }

    const { every, here, shop, owner, type, date, warns, status } = shopData;
    const statusText = status === "1" ? "مـفـعـل" : "مـعـطـل";

    const embed = createStandardEmbed(`**مـعـلـومـات مـتـجـر : ${interaction.channel.name}**`, `**__ - المـنـشـنـات :__\n\`•\` everyone: ${every}\n\`•\` here: ${here}\n\`•\` shop: ${shop}`, interaction.guild);
    embed.addFields(
        { name: 'صـاحب المتـجـر', value: `<@${owner}>`, inline: true },
        { name: 'نـوع المـتـجـر', value: `<@&${type}>`, inline: true },
        { name: 'تـحـذيـرات المـتـجـر', value: `${warns || 0}`, inline: true },
        { name: 'حـالـه الـمـتـجـر', value: statusText, inline: true },
        { name: 'مـوعـد انـشـاء المـتـجـر', value: `${date}`, inline: true }
    );

    await interaction.reply({ content: `مـعـلـومـات مـتـجـر : ${interaction.channel}`, embeds: [embed] });
}

async function showWarns(interaction) {
    const shopData = await db.get(`shop_${interaction.channel.id}`);

    if (!shopData) {
        return interaction.reply({
            content: `**هذا الشات ليس متجراً مسجلاً في قاعدة البيانات**\n\n**لإصلاح هذه المشكلة:**\n1. استخدم الأمر \`/data\` لإضافة بيانات المتجر يدوياً\n2. أو استخدم \`/fix-bot\` لإ(لاح مشاكل البوت عموماً`,
            ephemeral: true
        });
    }

    const currentWarns = shopData.warns || 0;
    const shopPartners = shopData.partners || [];
    const isOwner = interaction.user.id === shopData.owner;
    const isHelper = shopPartners.includes(interaction.user.id);
    const isAdmin = interaction.member.roles.cache.has(config.Admin);

    // تحديد مستوى الخطر
    let dangerLevel = '';
    let dangerColor = '';
    let dangerEmoji = '';

    if (currentWarns >= 7) {
        dangerLevel = 'خطر شديد - سيتم الحذف';
        dangerColor = '#8B0000';
        dangerEmoji = '💀';
    } else if (currentWarns >= 5) {
        dangerLevel = 'خطر عالي - المتجر معطل';
        dangerColor = '#FF0000';
        dangerEmoji = '🚨';
    } else if (currentWarns >= 3) {
        dangerLevel = 'تحذير متوسط';
        dangerColor = '#FFA500';
        dangerEmoji = '⚠️';
    } else if (currentWarns >= 1) {
        dangerLevel = 'تحذير بسيط';
        dangerColor = '#FFFF00';
        dangerEmoji = '📢';
    } else {
        dangerLevel = 'لا توجد تحذيرات';
        dangerColor = '#00FF00';
        dangerEmoji = '✅';
    }

    // حساب التكلفة لإزالة جميع التحذيرات
    const totalRemovalCost = currentWarns * (config.removeWarningPrice || 2);
    const totalRemovalTax = Math.floor(totalRemovalCost * 20 / 19 + 1);

    const embed = createStandardEmbed(`${dangerEmoji} تحذيرات المتجر - ${dangerLevel}`, `**معلومات مفصلة عن تحذيرات المتجر:**`, interaction.guild);
    embed.addFields(
        { name: 'عدد التحذيرات الحالية:', value: `${currentWarns}/7`, inline: true },
        { name: 'صاحب المتجر:', value: `<@${shopData.owner}>`, inline: true },
        { name: 'حالة المتجر:', value: shopData.status === "1" ? "مفعل ✅" : "معطل ❌", inline: true },
        { name: 'مستوى الخطر:', value: `${dangerEmoji} ${dangerLevel}`, inline: true },
        { name: 'تاريخ الإنشاء:', value: shopData.date || 'غير محدد', inline: true },
        { name: 'نوع المتجر:', value: `<@&${shopData.type}>`, inline: true }
    );
    embed.setColor(dangerColor);
    embed.setFooter(
        {
            text: `Dev By: ibro & yzn | سعر إزالة التحذير: ${config.removeWarningPrice || 2} كرديت لكل تحذير`,
            iconURL: interaction.guild.iconURL()
        }
    );

    // إضافة معلومات التكلفة إذا كان هناك تحذيرات
    if (currentWarns > 0) {
        embed.addFields({
            name: '💰 تكلفة إزالة التحذيرات:',
            value: `• تحذير واحد: ${config.removeWarningPrice || 2} كرديت\n` +
                   `• جميع التحذيرات (${currentWarns}): ${totalRemovalCost} كرديت\n` +
                   `• المبلغ مع الضريبة: ${totalRemovalTax} كرديت`,
            inline: false
        });
    }

    // إضافة تفاصيل عواقب التحذيرات
    if (currentWarns >= 5) {
        embed.addFields({
            name: '🚨 تحذير مهم:',
            value: `• المتجر معطل حالياً بسبب وصول التحذيرات إلى ${currentWarns}\n` +
                   `• عند وصول التحذيرات إلى 7 سيتم حذف المتجر نهائياً\n` +
                   `• يمكن إعادة تفعيل المتجر بإزالة التحذيرات إلى أقل من 5`,
            inline: false
        });
    } else if (currentWarns >= 3) {
        embed.addFields({
            name: '⚠️ تنبيه:',
            value: `• المتجر قريب من التعطيل (يحتاج ${5 - currentWarns} تحذيرات إضافية)\n` +
                   `• عند وصول التحذيرات إلى 5 سيتم تعطيل المتجر\n` +
                   `• عند وصول التحذيرات إلى 7 سيتم حذف المتجر نهائياً`,
            inline: false
        });
    } else if (currentWarns > 0) {
        embed.addFields({
            name: '📋 معلومات إضافية:',
            value: `• المتجر في حالة جيدة حالياً\n` +
                   `• تبقى ${5 - currentWarns} تحذيرات قبل التعطيل\n` +
                   `• يُنصح بالالتزام بالقوانين لتجنب المزيد من التحذيرات`,
            inline: false
        });
    } else {
        embed.addFields({
            name: '✅ المتجر في حالة ممتازة!',
            value: `• لا توجد أي تحذيرات\n• المتجر يعمل بكامل طاقته\n• استمر في الالتزام بالقوانين`,
            inline: false
        });
    }

    // إضافة تفاصيل المساعدين إذا وجدوا
    if (shopPartners.length > 0) {
        embed.addFields({
            name: '👥 مساعدي المتجر:',
            value: shopPartners.map(id => `<@${id}>`).join(', ') || 'لا يوجد مساعدين',
            inline: false
        });
    }

    const components = [];

    // زر إزالة التحذير (للمالك والمساعدين فقط)
    if ((isOwner || isHelper) && currentWarns > 0) {
        const removeWarningButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('remove_warning_modal')
                    .setLabel(`ازالة التحذيرات`)
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('💰')
            );
        components.push(removeWarningButton);
    }

    await interaction.reply({
        embeds: [embed],
        components: components,
        ephemeral: !isAdmin // الإدارة يمكنها رؤية الرسالة علناً
    });
}

async function addHelper(interaction) {
    await interaction.deferReply();

    const action = interaction.options.getString('action');
    const helper = interaction.options.getUser("helper");
    const shop = interaction.options.getChannel("shop");
    const role = interaction.options.getString("role");

    const data = await db.get(`shop_${shop.id}`);
    if (!data) return interaction.editReply("هذه القناة ليست متجر مسجل");

    const existingPartners = data.partners || [];

    if (action === 'add') {
        if (existingPartners.includes(helper.id)) {
            return interaction.editReply("**هذا العضو مساعد بالفعل في هذا المتجر**");
        }

        const shopChannel = await interaction.guild.channels.fetch(shop.id);

        // تحديد الصلاحيات حسب نوع المساعد
        let permissions = {
            ViewChannel: true,
            SendMessages: true,
            EmbedLinks: true,
            AttachFiles: true
        };

        if (role === 'full') {
            permissions.MentionEveryone = true;
            permissions.ManageMessages = true;
        }

        await shopChannel.permissionOverwrites.edit(helper.id, permissions);
        existingPartners.push(helper.id);
        await db.set(`shop_${shop.id}.partners`, existingPartners);

        // إضافة رتبة المساعد
        const helperRole = interaction.guild.roles.cache.get(config.help);
        if (helperRole) {
            await helper.roles.add(helperRole);
        }

        // حفظ نوع المساعد
        const helpersData = await db.get(`shop_${shop.id}.helpersData`) || {};
        helpersData[helper.id] = {
            type: role,
            addedBy: interaction.user.id,
            addedAt: Date.now()
        };
        await db.set(`shop_${shop.id}.helpersData`, helpersData);

        await interaction.editReply(`**تم إضافة ${helper} كمساعد ${role === 'full' ? 'بصلاحيات كاملة' : 'بصلاحيات محدودة'} للمتجر ${shop}**`);

        const addEmbed = createStandardEmbed('✅ تم إضافة مساعد جديد', `تم إضافة ${helper} كمساعد للمتجر`, interaction.guild);
        addEmbed.addFields(
            { name: 'المساعد:', value: `<@${helper.id}>`, inline: true },
            { name: 'نوع الصلاحية:', value: role === 'full' ? 'كاملة' : 'محدودة', inline: true },
            { name: 'أضيف بواسطة:', value: `<@${interaction.user.id}>`, inline: true }
        );
        await shopChannel.send({ embeds: [addEmbed] });

    } else if (action === 'remove') {
        if (!existingPartners.includes(helper.id)) {
            return interaction.editReply("**هذا العضو ليس مساعد في هذا المتجر**");
        }

        const shopChannel = await interaction.guild.channels.fetch(shop.id);
        await shopChannel.permissionOverwrites.delete(helper.id);

        const updatedPartners = existingPartners.filter(partnerId => partnerId !== helper.id);
        await db.set(`shop_${shop.id}.partners`, updatedPartners);

        // إزالة بيانات المساعد
        const helpersData = await db.get(`shop_${shop.id}.helpersData`) || {};
        delete helpersData[helper.id];
        await db.set(`shop_${shop.id}.helpersData`, helpersData);

        // إزالة رتبة المساعد إذا لم يكن مساعد في متاجر أخرى
        const helperRole = interaction.guild.roles.cache.get(config.help);
        if (helperRole) {
            // التحقق من المتاجر الأخرى
            const channels = await interaction.guild.channels.fetch();
            let isHelperElsewhere = false;

            for (const [channelId, channel] of channels) {
                const otherShopData = await db.get(`shop_${channelId}`);
                if (otherShopData && otherShopData.partners && otherShopData.partners.includes(helper.id)) {
                    isHelperElsewhere = true;
                    break;
                }
            }

            if (!isHelperElsewhere) {
                await helper.roles.remove(helperRole);
            }
        }

        await interaction.editReply(`**تم إزالة ${helper} من مساعدي المتجر ${shop}**`);
        await shopChannel.send(`**تم إزالة ${helper} من مساعدي المتجر**`);

    } else if (action === 'list') {
        if (existingPartners.length === 0) {
            return interaction.editReply("**هذا المتجر لا يحتوي على مساعدين**");
        }

        const helpersData = await db.get(`shop_${shop.id}.helpersData`) || {};
        let helpersList = '';

        for (let i = 0; i < existingPartners.length; i++) {
            const helperId = existingPartners[i];
            const helperData = helpersData[helperId] || {};
            const helperType = helperData.type === 'full' ? '🔥 كاملة' : '⚡ محدودة';
            const addedDate = helperData.addedAt ? `<t:${Math.floor(helperData.addedAt / 1000)}:R>` : 'غير معروف';

            helpersList += `**${i + 1}.** <@${helperId}> - ${helperType} - ${addedDate}\n`;
        }

        const listEmbed = createStandardEmbed(`👥 مساعدي المتجر (${existingPartners.length})`, helpersList, interaction.guild);
        listEmbed.addFields(
            { name: 'المالك:', value: `<@${data.owner}>`, inline: true },
            { name: 'عدد المساعدين:', value: existingPartners.length.toString(), inline: true }
        );

        await interaction.editReply({ embeds: [listEmbed] });
    }
}

async function handleAddHelperCommand(interaction) {
    await addHelper(interaction);
}

async function removeHelper(interaction) {
    await interaction.deferReply();
    const part = interaction.options.getUser("helper");
    const shop = interaction.options.getChannel("shop");

    const data = await db.get(`shop_${shop.id}`);
    if (!data) return interaction.editReply("** هـدة الروم لـيـس مسجل كـ مـتـجـر **");

    const existingPartners = data.partners || [];
    if (!existingPartners.includes(part.id)) {
        return interaction.editReply(" **هـذا العـضـو لـيـس عـمـيـل فـي هـذا المـتـجـر.** ");
    }

    const shopChannel = await interaction.guild.channels.fetch(shop.id);
    await shopChannel.permissionOverwrites.delete(part.id);

    const updatedPartners = existingPartners.filter(partnerId => partnerId !== part.id);
    await db.set(`shop_${shop.id}.partners`, updatedPartners);

    const role = interaction.guild.roles.cache.get(config.help);
    if (role) await part.roles.remove(role);

    await interaction.editReply(`** الـمـسـاعـد <@${part.id}> تـم ازالـتـه مـن المـتـجـر <#${shop.id}> بـ نـجـاح.**`);
    await shopChannel.send(`** تـم ازالـة : <@${part.id}> \n كـ مـسـاعـد مـن المـتـجـر **`);
}

async function changeOwner(interaction) {
    await interaction.deferReply();
    const shop = interaction.options.getChannel('shop');
    const newOwner = interaction.options.getMember('new-owner');

    const shopData = await db.get(`shop_${shop.id}`);
    if (!shopData) {
        return interaction.editReply({ content: 'هـدة الـروم لـيـست مـتـجـرا.', ephemeral: true });
    }

    const oldOwnerId = shopData.owner;
    const oldOwner = interaction.guild.members.cache.get(oldOwnerId);

    if (!newOwner) {
        return interaction.editReply({ content: 'المـالـك الجـديـد غـيـر صـحـيـح.', ephemeral: true });
    }

    if (oldOwnerId === newOwner.id) {
        return interaction.editReply({ content: `هـذا الشـخـص : <@${newOwner.id}> هـو مـالـك المـتـجـر بـالفـعـل.`, ephemeral: true });
    }

    await shop.permissionOverwrites.delete(oldOwner.id);
    await shop.permissionOverwrites.edit(newOwner.id, {
        ViewChannel: true,
        SendMessages: true,
        EmbedLinks: true,
        MentionEveryone: true,
        AttachFiles: true
    });

    await db.set(`shop_${shop.id}.owner`, newOwner.id);

    await interaction.editReply({
        content: `تـم نـقـل مـلـكـيـة المـتـجـر :${shop} الـي : ${newOwner}`
    });

    await shop.send(`تـم نـقل مـلـكـيـة الـمـتـجـر \n مـن <@${oldOwner.id}>  \n  إلـي <@${newOwner.id}>`);
}

// دالة محسنة لتغيير اسم المتجر (مع خيارات متقدمة)
async function handleChangeNameCommand(interaction) {
    await interaction.deferReply();

    const action = interaction.options.getString('action') || 'change';
    const shop = interaction.options.getChannel('shop') || interaction.channel;
    const newName = interaction.options.getString('new-name');
    const addPrefix = interaction.options.getBoolean('add_prefix') ?? true;
    const preserveEmoji = interaction.options.getBoolean('preserve_emoji') ?? true;

    const chan = await interaction.guild.channels.cache.get(shop.id);
    if (!chan) {
        return interaction.editReply('**لا استطيع العثور على هذا الروم**');
    }

    const data = await db.get(`shop_${shop.id}`);
    if (!data) {
        return interaction.editReply('**هذا الروم ليس متجر**');
    }

    if (action === 'change') {
        if (!newName) {
            return interaction.editReply('**يجب تحديد الاسم الجديد**');
        }

        if (newName.length <= 3 || newName.length > 15) {
            return interaction.editReply('**يجب أن يكون الاسم أكثر من 3 أحرف وأقل من 15 حرف**');
        }

        const formattedName = newName.replaceAll(' ', '・');
        let finalName = formattedName;

        // إضافة الإيموجي والبادئة حسب الخيارات
        if (preserveEmoji) {
            const shopType = types.find(t => t.id === chan.parentId);
            const badge = shopType ? shopType.badge : '🏪';
            finalName = badge + (addPrefix ? config.prefix : '') + formattedName;
        } else if (addPrefix) {
            finalName = config.prefix + formattedName;
        }

        if (chan.name === finalName) {
            return interaction.editReply('**هذا هو اسم المتجر بالفعل**');
        }

        // التحقق من عدم وجود متجر بنفس الاسم
        const existingChannel = interaction.guild.channels.cache.find(c => c.name === finalName);
        if (existingChannel) {
            return interaction.editReply('**يوجد متجر بهذا الاسم. اختر اسماً آخر**');
        }

        await chan.setName(finalName);

        // إرسال رسالة تأكيد في المتجر
        const successEmbed = createStandardEmbed('✅ تم تغيير اسم المتجر', `تم تغيير اسم المتجر إلى: **${finalName}**`, interaction.guild);
        await chan.send({ embeds: [successEmbed] });

        await interaction.editReply('**تم تغيير اسم المتجر بنجاح**');

        // إرسال لوج
        const logChannel = interaction.guild.channels.cache.get(config.commandlog);
        if (logChannel) {
            const logEmbed = createStandardEmbed('تم تغيير اسم متجر', `المسؤول: <@${interaction.user.id}>`, interaction.guild);
            logEmbed.addFields(
                { name: 'المتجر:', value: `<#${shop.id}>`, inline: true },
                { name: 'الاسم الجديد:', value: finalName, inline: true },
                { name: 'المالك:', value: `<@${data.owner}>`, inline: true }
            );
            await logChannel.send({ embeds: [logEmbed] });
        }
    } else if (action === 'preview') {
        if (!newName) {
            return interaction.editReply('**يجب تحديد الاسم لمعاينته**');
        }

        const formattedName = newName.replaceAll(' ', '・');
        let previewName = formattedName;

        if (preserveEmoji) {
            const shopType = types.find(t => t.id === chan.parentId);
            const badge = shopType ? shopType.badge : '🏪';
            previewName = badge + (addPrefix ? config.prefix : '') + formattedName;
        } else if (addPrefix) {
            previewName = config.prefix + formattedName;
        }

        const previewEmbed = createStandardEmbed('👁️ معاينة الاسم الجديد', `**الاسم الحالي:** ${chan.name}\n**الاسم الجديد:** ${previewName}`, interaction.guild);
        await interaction.editReply({ embeds: [previewEmbed] });
    }
}

async function changeType(interaction) {
    await interaction.deferReply();
    const shop = interaction.options.getChannel('shop');
    const typeu = interaction.options.get('new-type').value;
    const type = types.find(x => x.id === typeu);

    if (!type) return interaction.editReply({ content: '**لم اتمكن من العثور على كاتقوري هذا النوع**', ephemeral: true });

    const shopuu = await interaction.guild.channels.cache.get(shop.id);
    if (!shopuu) {
        return interaction.editReply('**لا اسـتـطـيـع الـعـثـور عـلـي الـمـتـجـر**');
    }

    const currentType = types.find(x => x.id === shopuu.parentId);
    if (currentType && currentType.id === type.id) {
        return interaction.editReply('**هـذا هـو نـوع الـمـتـجـر بـالـفـعـل**');
    }

    await shopuu.setParent(type.id);
    await db.set(`shop_${shop.id}.type`, type.role);
    await shop.send('**تـم تـغـيـيـر الـمـتـجـر مـن `' + (currentType ? currentType.name : 'غير معروف') + '` الـي `' + type.name + '`**');
    await interaction.editReply('**تـم تـغـيـيـر نـوع الـمـتـجـر بـنـجـاح**');
}

async function deleteShop(interaction) {
    await interaction.deferReply();
    const shop = interaction.options.getChannel('shop');
    const reason = interaction.options.getString('reason');

    const data = await db.get(`shop_${shop.id}`);
    if (!data) {
        return interaction.editReply('**هـذا الـروم لـيـس مـتـجـر**');
    }

    const hohoho = await interaction.guild.channels.cache.get(shop.id);
    if (!hohoho) {
        return interaction.editReply('**لا أسـتـطـيـع الـعـثـور عـلـي هـذا الـروم **');
    }

    const userrr = await client.users.fetch(data.owner);
    const dmChannel = await userrr.createDM();

    const emm = createStandardEmbed(`تـم حـذف مـتـجـرك`, `تـم حـذف مـتـجـرك ${hohoho.name}`, interaction.guild);
    emm.addFields(
        { name: 'أسـم الـمـتـجـر', value: `${hohoho.name}`, inline: true },
        { name: 'الـمـسـؤول', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'الـسـبـب', value: reason, inline: true }
    );

    await dmChannel.send({ embeds: [emm] });
    await hohoho.delete();
    await db.delete(`shop_${shop.id}`);
    await interaction.editReply('**تـم حـذف الـروم بـنـجـاح**');
}

async function resetMentions(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channelssend = interaction.options.getChannel('channel') ?? interaction.channel;
    const imageembed = interaction.options.getString('image');
    const customMessage = interaction.options.getString('message');

    const channels = await interaction.guild.channels.fetch();
    await interaction.editReply('**بدات عملية اعادة تعيين المنشنات**');

    const guild = interaction.guild;
    const serverName = guild.name;
    const serverIcon = guild.iconURL();

    // استخدام النص المخصص أو النص الافتراضي
    const messageText = customMessage || `**رسـتـرنـا الـمـنـشـنـات كـل يـوم و أنـتـم بـخـيـر**`;

    let updatedShops = 0;
    for (const type of types) {
        for (const [ch, channel] of channels) {
            if (channel.parentId && channel.parentId === type.id) {
                const shopData = await db.get(`shop_${ch}`);
                if (shopData) {
                    await db.set(`shop_${ch}.every`, type.every);
                    await db.set(`shop_${ch}.here`, type.here);
                    await db.set(`shop_${ch}.shop`, type.shop);
                    updatedShops++;

                    // إرسال رسالة واحدة مدمجة للمتجر
                    try {
                        const shopEmbed = createStandardEmbed(`${type.name} - تحديث المنشنات`, `${messageText}\n\n😝 - @everyone: ${type.every}\n😃 - @here: ${type.here}`, interaction.guild);
                        shopEmbed.setImage(serverIcon);

                        await channel.send({ 
                            content: `<@${shopData.owner}> **رستارنا المنشنات**`, 
                            embeds: [shopEmbed] 
                        });
                    } catch (error) {
                        console.error(`خطأ في إرسال رسالة للمتجر ${ch}:`, error);
                    }
                }
            }
        }
    }

  const embed = createStandardEmbed('تحديث المنشنات العام', `${messageText}\n\n😝 - @everyone: ${config.every}\n😃 - @here: ${config.here}`, interaction.guild);
    embed.setImage(serverIcon);

    await channelssend.send({ content: ' **رسـتـرنـا الـمـنـشـنـات**', embeds: [embed] });

    await interaction.followUp({
        content: `✅ تم إعادة تعيين منشنات ${updatedShops} متجر بنجاح وإرسال الإشعار!`,
        ephemeral: true
    });
}

function isPublicCommand(commandName) {
    const publicCommands = ['mentions', 'tax', 'shop-data', 'warns'];
    return publicCommands.includes(commandName);
} 

// دوال جديدة

async function addShopData(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel('channel');
    const owner = interaction.options.getUser('owner');
    const typeId = interaction.options.getString('type');
    const everyone = interaction.options.getNumber('everyone');
    const here = interaction.options.getNumber('here');
    const shop = interaction.options.getNumber('shop');
    const warns = interaction.options.getNumber('warns') || 0;
    const status = interaction.options.getString('status') || '1';

    const type = types.find(t => t.id === typeId);
    if (!type) {
        return interaction.editReply('نوع المتجر غير صحيح!');
    }

    // التحقق من أن القناة ليست متجراً بالفعل
    const existingData = await db.get(`shop_${channel.id}`);
    if (existingData) {
        return interaction.editReply('هذه القناة متجر بالفعل!');
    }

    const shopData = {
        owner: owner.id,
        type: type.role,
        shop: shop || type.shop,
        every: everyone || type.every,
        here: here || type.here,
        date: `<t:${Math.floor(Date.now() / 1000)}:R>`,
        status: status,
        warns: warns,
        badge: type.badge
    };

    await db.set(`shop_${channel.id}`, shopData);

    const embed = createStandardEmbed('✅ تم إضافة بيانات المتجر', `تم إضافة بيانات المتجر لـ ${channel} بنجاح`, interaction.guild);
    embed.addFields(
        { name: 'المالك:', value: `<@${owner.id}>`, inline: true },
        { name: 'النوع:', value: `<@&${type.role}>`, inline: true },
        { name: 'الحالة:', value: status === "1" ? "مفعل" : "معطل", inline: true },
        { name: 'المنشنات:', value: `• everyone: ${shopData.every}\n• here: ${shopData.here}\n• shop: ${shopData.shop}`, inline: false }
    );

    await interaction.editReply({ embeds: [embed] });

    // إرسال رسالة في المتجر
    const shopEmbed = createStandardEmbed('🏪 تم إضافة بيانات المتجر', `تم إضافة بيانات هذا المتجر إلى النظام`, interaction.guild);
    shopEmbed.addFields(
        { name: 'المالك:', value: `<@${owner.id}>`, inline: true },
        { name: 'النوع:', value: `<@&${type.role}>`, inline: true },
        { name: 'المنشنات المتبقية:', value: `• everyone: ${shopData.every}\n• here: ${shopData.here}\n• shop: ${shopData.shop}`, inline: false }
    );

    await channel.send({ embeds: [shopEmbed] });

    // إرسال لوج
    const logChannel = interaction.guild.channels.cache.get(config.commandlog);
    if (logChannel) {
        const logEmbed = createStandardEmbed('تم إضافة بيانات متجر يدوياً', `المسؤول: <@${interaction.user.id}>`, interaction.guild);
        logEmbed.addFields(
            { name: 'المتجر:', value: `<#${channel.id}>`, inline: true },
            { name: 'المالك:', value: `<@${owner.id}>`, inline: true },
            { name: 'النوع:', value: `<@&${type.role}>`, inline: true }
        );

        await logChannel.send({ embeds: [logEmbed] });
    }
}

async function displayMentions(interaction) {
    const shopData = await db.get(`shop_${interaction.channel.id}`);

    if (!shopData) {
        return interaction.reply({ content: 'هذا الشات ليس متجراً!', ephemeral: true });
    }

    const embed = createStandardEmbed('📊 المنشنات المتبقية', `**المنشنات المتبقية:**\n• everyone: ${shopData.every || 0}\n• here: ${shopData.here || 0}`, interaction.guild);

    await interaction.reply({
        embeds: [embed]
    });
}

async function addEncryptionWords(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('encryption_modal')
        .setTitle('إضافة كلمات التشفير');

    const oldWordInput = new TextInputBuilder()
        .setCustomId('old_word')
        .setLabel('الكلمة قبل التشفير')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const newWordInput = new TextInputBuilder()
        .setCustomId('new_word')
        .setLabel('الكلمة بعد التشفير')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const firstRow = new ActionRowBuilder().addComponents(oldWordInput);
    const secondRow = new ActionRowBuilder().addComponents(newWordInput);

    modal.addComponents(firstRow, secondRow);
    await interaction.showModal(modal);
}

async function changeNamePaid(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const shop = interaction.options.getChannel('shop');

    const shopData = await db.get(`shop_${shop.id}`);
    if (!shopData) {
        return interaction.editReply('هذه القناة ليست متجر');
    }

    const embed = createStandardEmbed('💰 تغيير اسم المتجر', 'لتغيير اسم المتجر، يجب دفع 1 كرديت', interaction.guild);
    await interaction.editReply({ embeds: [embed] });

    const creditMessage = await interaction.channel.send({
        content: `#credit ${config.bank} 1`
    });

    // مراقبة الدفع
    const filter = (message) => {
        return (
            message.author.id === config.probot &&
            message.content.includes(':moneybag:') &&
            message.content.includes(interaction.user.username) &&
            message.content.includes(config.bank)
        );
    };

    const collector = interaction.channel.createMessageCollector({
        filter,
        max: 1,
        time: 120000
    });

    collector.on('collect', async (collected) => {
        const transferredAmount = extractAmountFromMessage(collected.content);

        if (transferredAmount >= 1) {
            await creditMessage.delete().catch(() => {});

            // حفظ بيانات العملية
            await db.set(`change_name_${interaction.user.id}`, {
                shopId: interaction.channel.id,
                paid: true,
                channelId: interaction.channel.id
            });

            await interaction.followUp({
                content: 'تم تأكيد الدفع! الآن أدخل الاسم الجديد باستخدام الأمر `/change-name`',
                ephemeral: true
            });

            // مراقبة الدفع
            const filter = (message) => {
                return (
                    message.author.id === config.probot &&
                    message.content.includes(':moneybag:') &&
                    message.content.includes(interaction.user.username) &&
                    message.content.includes(config.bank)
                );
            };

            const collector = interaction.channel.createMessageCollector({
                filter,
                max: 1,
                time: 120000
            });

            collector.on('collect', async (collected) => {
                const transferredAmount = extractAmountFromMessage(collected.content);

                if (transferredAmount >= 1) {
                    await creditMessage.delete().catch(() => {});

                    // حفظ بيانات العملية
                    await db.set(`change_name_${interaction.user.id}`, {
                        shopId: interaction.channel.id,
                        paid: true,
                        channelId: interaction.channel.id
                    });

                    await interaction.followUp({
                        content: 'تم تأكيد الدفع! الآن أدخل الاسم الجديد باستخدام الأمر `/change-name`',
                        ephemeral: true
                    });
                }
            });
        }
    });
}

async function changeTypePaid(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const shop = interaction.options.getChannel('shop');
    const newTypeId = interaction.options.getString('new-type');

    const newType = types.find(t => t.id === newTypeId);
    if (!newType) {
        return interaction.editReply('نوع المتجر غير صحيح');
    }

    const halfPrice = Math.floor(newType.price / 2);
    const tax = Math.floor(halfPrice * 20 / 19 + 1);

    const embed = createStandardEmbed('💰 دفع لتغيير نوع المتجر', 'لتغيير نوع المتجر، يجب دفع نصف سعر المتجر الجديد', interaction.guild);
    embed.addFields(
        { name: 'المبلغ مع الضريبة:', value: tax.toString() }
    );

    await interaction.editReply({ embeds: [embed] });

    const creditMessage = await interaction.channel.send({
        content: `#credit ${config.bank} ${tax}`
    });

    // مراقبة الدفع
    const filter = (message) => {
        return (
            message.author.id === config.probot &&
            message.content.includes(':moneybag:') &&
            message.content.includes(interaction.user.username) &&
            message.content.includes(config.bank)
        );
    };

    const collector = interaction.channel.createMessageCollector({
        filter,
        max: 1,
        time: 120000
    });

    collector.on('collect', async (collected) => {
        const transferredAmount = extractAmountFromMessage(collected.content);

        if (transferredAmount >= halfPrice) {
            await creditMessage.delete().catch(() => {});

            const shopChannel = interaction.guild.channels.cache.get(shop.id);
            const currentType = types.find(x => x.id === shopChannel.parentId);

            await shopChannel.setParent(newType.id);
            await db.set(`shop_${shop.id}.type`, newType.role);

            await shop.send('✅ تم تغيير نوع المتجر من `' + (currentType ? currentType.name : 'غير معروف') + '` إلى `' + newType.name + '`');
            await interaction.followUp({
                content: 'تم تغيير نوع المتجر بنجاح!',
                ephemeral: true
            });
        }
    });
}

async function enableShop(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const shop = interaction.options.getChannel('shop') || interaction.channel;

    const shopData = await db.get(`shop_${shop.id}`);
    if (!shopData) {
        return interaction.editReply('هذه القناة ليست متجر');
    }

    if (shopData.status === "1") {
        return interaction.editReply('المتجر مفعل بالفعل');
    }

    const embed = createStandardEmbed('💰 دفع لتفعيل المتجر', 'لتفعيل المتجر بعد التعطيل، يجب دفع رسوم التفعيل', interaction.guild);
    embed.setColor('#FFA500');

    await interaction.editReply({ embeds: [embed] });

    const creditMessage = await interaction.channel.send({
        content: `#credit ${config.bank} 5000`
    });

    // مراقبة الدفع
    const filter = (message) => {
        return (
            message.author.id === config.probot &&
            message.content.includes(':moneybag:') &&
            message.content.includes(interaction.user.username) &&
            message.content.includes(config.bank)
        );
    };

    const collector = interaction.channel.createMessageCollector({
        filter,
        max: 1,
        time: 120000
    });

    collector.on('collect', async (collected) => {
        const transferredAmount = extractAmountFromMessage(collected.content);

        if (transferredAmount >= 5000) {
            await creditMessage.delete().catch(() => {});

            await shop.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                ViewChannel: true,
            });
            await db.set(`shop_${shop.id}.status`, "1");

            const successEmbed = createStandardEmbed('✅ تم تفعيل المتجر', 'تم تفعيل المتجر بنجاح بعد الدفع', interaction.guild);
            await shop.send({ embeds: [successEmbed] });
        }
    });
}

// دالة إظهار رسالة المساعدة مع Select Menu
async function sendHelpMessage(channel) {
    const guild = client.guilds.cache.first();
    const helpMainEmbed = createStandardEmbed('📚 دليل أوامر البوت', '**مرحباً بك في نظام المساعدة المطور!**\n\nاستخدم القائمة أدناه لاستكشاف أوامر البوت حسب الفئة:', guild);
    helpMainEmbed.addFields(
        { name: '🛒 أوامر الشراء والتسوق', value: 'أوامر إنشاء وإدارة المتاجر والطلبات', inline: true },
        { name: '⚙️ أوامر الإعدادات والإدارة', value: 'أوامر إدارة البوت والمتاجر المتقدمة', inline: true },
        { name: '👥 أوامر الأعضاء العامة', value: 'الأوامر المتاحة لجميع المستخدمين', inline: true },
        { name: '💰 أسعار الخدمات', value: 'عرض جميع أسعار الخدمات والمنشنات', inline: true }
    );

    const helpMenu = new StringSelectMenuBuilder()
        .setCustomId('help_select_menu')
        .setPlaceholder('اختر فئة الأوامر التي تريد استكشافها')
        .addOptions([
            {
                label: '🛒 أوامر الشراء والتسوق',
                description: 'أوامر المتاجر، الطلبات، والمزادات',
                value: 'shopping_commands',
                emoji: '🛒'
            },
            {
                label: '⚙️ أوامر الإعدادات والإدارة',
                description: 'أوامر الإدارة والتحكم المتقدم',
                value: 'admin_commands',
                emoji: '⚙️'
            },
            {
                label: '👥 أوامر الأعضاء العامة',
                description: 'الأوامر المتاحة لجميع المستخدمين',
                value: 'public_commands',
                emoji: '👥'
            },
            {
                label: '💰 أسعار الخدمات',
                description: 'عرض جميع أسعار الخدمات والمنشنات',
                value: 'prices_info',
                emoji: '💰'
            }
        ]);

    const row = new ActionRowBuilder().addComponents(helpMenu);

    await channel.send({
        embeds: [helpMainEmbed],
        components: [row]
    });
}

// دالة معالجة أمر help السلاش
async function sendHelpCommand(interaction) {
    await sendHelpMessage(interaction.channel);
    await interaction.reply({ content: 'تم إرسال دليل الأوامر!', ephemeral: true });
}

// دوال معالجة بانلات الأسعار الجديدة
async function handleShopPricesView(interaction) {
    const shopPricesEmbed = createStandardEmbed('🏪 أسعار المتاجر', '**اختر نوع المتجر لعرض تفاصيل السعر:**', interaction.guild);
    shopPricesEmbed.setImage(config.info);

    const shopPriceButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('shop_price_platinum')
                .setLabel(`${types[0].badge} ${types[0].name}`)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('shop_price_grandmaster')
                .setLabel(`${types[1].badge} ${types[1].name}`)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('shop_price_master')
                .setLabel(`${types[2].badge} ${types[2].name}`)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('shop_price_diamond')
                .setLabel(`${types[3].badge} ${types[3].name}`)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('shop_price_gold')
                .setLabel(`${types[4].badge} ${types[4].name}`)
                .setStyle(ButtonStyle.Primary)
        );

    await interaction.reply({ embeds: [shopPricesEmbed], components: [shopPriceButtons], ephemeral: true });
}

async function handleAuctionPricesView(interaction) {
    const auctionPricesEmbed = createStandardEmbed('🏆 أسعار المزادات', '**اختر نوع المنشن لعرض السعر:**', interaction.guild);
    auctionPricesEmbed.setImage(config.info);

    const auctionPriceButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('auction_everyone_price')
                .setLabel('@everyone')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📢'),
            new ButtonBuilder()
                .setCustomId('auction_here_price')
                .setLabel('@here')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📍')
        );

    await interaction.reply({ embeds: [auctionPricesEmbed], components: [auctionPriceButtons], ephemeral: true });
}

async function handleOrderPricesView(interaction) {
    const orderPricesEmbed = createStandardEmbed('📋 أسعار الطلبات', '**اختر نوع المنشن لعرض السعر:**', interaction.guild);
    orderPricesEmbed.setImage(config.info);

    const orderPriceButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('order_everyone_price')
                .setLabel('@everyone')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📢'),
            new ButtonBuilder()
                .setCustomId('order_here_price')
                .setLabel('@here')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📍')
        );

    await interaction.reply({ embeds: [orderPricesEmbed], components: [orderPriceButtons], ephemeral: true });
}

async function handleShopPriceSelection(interaction) {
    const shopTypeMap = {
        'shop_price_platinum': 0,
        'shop_price_grandmaster': 1,
        'shop_price_master': 2,
        'shop_price_diamond': 3,
        'shop_price_gold': 4
    };

    const typeIndex = shopTypeMap[interaction.customId];
    const selectedType = types[typeIndex];

    if (!selectedType) {
        return interaction.reply({ content: 'خطأ في نوع المتجر!', ephemeral: true });
    }

    const shopDetailEmbed = createStandardEmbed(`${selectedType.badge} ${selectedType.name}`, '**تفاصيل أسعار المتجر:**', interaction.guild);
    shopDetailEmbed.addFields(
        { name: 'السعر:', value: `${selectedType.price.toLocaleString()} كرديت`, inline: true },
        { name: 'منشنات @everyone:', value: `${selectedType.every} منشن`, inline: true },
        { name: 'منشنات @here:', value: `${selectedType.here} منشن`, inline: true },
        { name: 'الباقة تشمل:', value: '• إنشاء متجر خاص\n• صلاحيات كاملة\n• دعم فني\n• منشنات مجانية', inline: false }
    );

    await interaction.reply({ embeds: [shopDetailEmbed], ephemeral: true });
}

async function handleAuctionPriceSelection(interaction) {
    let priceInfo = '';
    let title = '';

    if (interaction.customId === 'auction_everyone_price') {
        title = '📢 سعر منشن @everyone للمزادات';
        priceInfo = `**السعر:** ${config.oeverey.toLocaleString()} كرديت\n\n**المميزات:**\n• وصول للجميع في السيرفر\n• تأثير قوي\n• مناسب للمزادات الكبيرة`;
    } else if (interaction.customId === 'auction_here_price') {
        title = '📍 سعر منشن @here للمزادات';
        priceInfo = `**السعر:** ${config.ohere.toLocaleString()} كرديت\n\n**المميزات:**\n• وصول للأعضاء النشطين فقط\n• تأثير متوسط\n• مناسب للمزادات العادية`;
    }

    const auctionDetailEmbed = createStandardEmbed(title, priceInfo, interaction.guild);

    await interaction.reply({ embeds: [auctionDetailEmbed], ephemeral: true });
}

async function handleOrderPriceSelection(interaction) {
    let priceInfo = '';
    let title = '';

    if (interaction.customId === 'order_everyone_price') {
        title = '📢 سعر منشن @everyone للطلبات';
        priceInfo = `**السعر:** ${config.oeverey.toLocaleString()} كرديت\n\n**المميزات:**\n• وصول للجميع في السيرفر\n• تأثير قوي\n• مناسب للطلبات المهمة`;
    } else if (interaction.customId === 'order_here_price') {
        title = '📍 سعر منشن @here للطلبات';
        priceInfo = `**السعر:** ${config.ohere.toLocaleString()} كرديت\n\n**المميزات:**\n• وصول للأعضاء النشطين فقط\n• تأثير متوسط\n• مناسب للطلبات العادية`;
    }

    const orderDetailEmbed = createStandardEmbed(title, priceInfo, interaction.guild);

    await interaction.reply({ embeds: [orderDetailEmbed], ephemeral: true });
}

// دوال إدارة النشر التلقائي
async function handleAutoPostStop(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const autoPostData = await db.get(`autopost_${interaction.channel.id}`);
    if (!autoPostData) {
        return interaction.editReply('❌ النشر التلقائي غير مفعل');
    }

    // إيقاف النشر التلقائي
    await db.set(`autopost_${interaction.channel.id}`, {
        ...autoPostData,
        active: false
    });

    await interaction.editReply('✅ تم إيقاف النشر التلقائي بنجاح');

    // إرسال رسالة في المتجر
    const stopEmbed = createStandardEmbed('⏹️ تم إيقاف النشر التلقائي', 'تم إيقاف النشر التلقائي للمتجر', interaction.guild);
    await interaction.channel.send({ embeds: [stopEmbed] });
}

async function handleAutoPostEdit(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const autoPostData = await db.get(`autopost_${interaction.channel.id}`);
    if (!autoPostData) {
        return interaction.editReply('❌ النشر التلقائي غير مفعل');
    }

    await interaction.editReply('📝 أرسل الرسالة الجديدة للنشر التلقائي:');

    const msgCollector = interaction.channel.createMessageCollector({
        filter: (m) => m.author.id === interaction.user.id,
        max: 1,
        time: 120000
    });

    msgCollector.on('collect', async (msg) => {
        const newMessage = msg.content;

        // تحديث الرسالة
        await db.set(`autopost_${interaction.channel.id}`, {
            ...autoPostData,
            message: newMessage
        });

        await interaction.followUp({
            content: '✅ تم تحديث رسالة النشر التلقائي بنجاح!',
            ephemeral: true
        });

        // إرسال رسالة في المتجر
        const updateEmbed = createStandardEmbed('✏️ تم تحديث النشر التلقائي', `تم تحديث رسالة النشر التلقائي إلى:\n\n${newMessage}`, interaction.guild);
        await interaction.channel.send({ embeds: [updateEmbed] });
    });

    msgCollector.on('end', async (collected, reason) => {
        if (reason === 'time' && collected.size === 0) {
            await interaction.followUp({
                content: '⏰ انتهى الوقت لتحديث الرسالة',
                ephemeral: true
            });
        }
    });
}

// دالة مساعدة لاستخراج المبلغ من رسالة البروبوت
function extractAmountFromMessage(content) {
    const patterns = [
        /has transferred `\$([0-9,]+)`/g,
        /قام بتحويل `\$([0-9,]+)`/g,
        /transferred `\$([0-9,]+)`/g,
        /`\$([0-9,]+)`/g,
        /\$([0-9,]+)/g,
        /([0-9,]+)\$/g
    ];

    for (const pattern of patterns) {
        const matches = [...content.matchAll(pattern)];
        for (const match of matches) {
            const amount = parseInt(match[1].replace(/,/g, ''));
            if (amount > 0) {
                return amount;
            }
        }
    }
    return 0;
}

// دالة معالجة تنظيم المتجر
async function handleShopManagement(interaction) {
    const shopData = await db.get(`shop_${interaction.channel.id}`);

    if (!shopData) {
        return interaction.reply({ content: 'هذا الشات ليس متجراً!', ephemeral: true });
    }

    // التحقق من الصلاحيات
    const shopPartners = shopData.partners || [];
    const isOwner = interaction.user.id === shopData.owner;
    const isHelper = shopPartners.includes(interaction.user.id);
    const isAdmin = interaction.member.roles.cache.has(config.Admin);

    if (!isOwner && !isHelper && !isAdmin) {
        return interaction.reply({
            content: 'ليس لديك صلاحية لتنظيم هذا المتجر',
            ephemeral: true
        });
    }

    const managementEmbed = createStandardEmbed('⚙️ تنظيم المتجر', '**الرجاء اختيار الخدمة التي تريدها:**', interaction.guild);

    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('shop_manage_change_owner')
                .setLabel('تغيير صاحب المتجر')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('👑'),
            new ButtonBuilder()
                .setCustomId('shop_manage_change_name')
                .setLabel('تغيير اسم المتجر')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📝'),
            new ButtonBuilder()
                .setCustomId('shop_manage_change_type')
                .setLabel('تغيير نوع المتجر')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🏪')
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('shop_manage_enable')
                .setLabel('تفعيل المتجر')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅')
                .setDisabled(shopData.status === "1"),
            new ButtonBuilder()
                .setCustomId('shop_manage_helpers')
                .setLabel('تنظيم المساعدين')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('👥'),
            new ButtonBuilder()
                .setCustomId('shop_manage_remove_warns')
                .setLabel('إزالة التحذيرات')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('⚠️')
                .setDisabled((shopData.warns || 0) === 0)
        );

    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('buy_mentions')
                .setLabel('شراء منشنات')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('💰'),
            new ButtonBuilder()
                .setCustomId('shop_manage_change_emoji')
                .setLabel('تغيير إيموجي المتجر')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('😊'),
            new ButtonBuilder()
                .setCustomId('shop_manage_auto_post')
                .setLabel('النشر التلقائي')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🤖')
        );

    const row4 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('shop_manage_delete')
                .setLabel('حذف المتجر')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑️')
        );

    await interaction.reply({
        embeds: [managementEmbed],
        components: [row1, row2, row3, row4],
        ephemeral: true
    });
}

// دالة معالجة إجراءات تنظيم المتجر
async function handleShopManagementActions(interaction) {
    const action = interaction.customId.replace('shop_manage_', '');

    switch (action) {
        case 'change_owner':
            await handleChangeOwnerPaid(interaction);
            break;
        case 'change_name':
            await handleChangeNameFromButton(interaction);
            break;
        case 'change_type':
            await handleChangeTypeFromButton(interaction);
            break;
        case 'enable':
            await handleEnableShopFromButton(interaction);
            break;
        case 'helpers':
            await handleManageHelpers(interaction);
            break;
        case 'remove_warns':
            await showRemoveWarningModal(interaction);
            break;
        case 'change_emoji':
            await handleChangeEmojiPaid(interaction);
            break;
        case 'auto_post':
            await handleAutoPostPaid(interaction);
            break;
        case 'delete':
            await handleDeleteShopConfirm(interaction);
            break;
        default:
            await interaction.reply({ content: 'إجراء غير معروف!', ephemeral: true });
    }
}

// دالة تغيير صاحب المتجر مع الدفع
async function handleChangeOwnerPaid(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const shopData = await db.get(`shop_${interaction.channel.id}`);
    if (!shopData) {
        return interaction.editReply('❌ هذه القناة ليست متجراً');
    }

    const embed = createStandardEmbed('👑 تغيير صاحب المتجر', 'لتغيير صاحب المتجر، يجب دفع **1 كريدت**.', interaction.guild);
    await interaction.editReply({ embeds: [embed] });

    const creditMessage = await interaction.channel.send({
        content: `\`\`\`#credit ${config.bank} 1\`\`\``
    });

    await db.set(`change_owner_${interaction.user.id}`, {
        shopId: interaction.channel.id,
        paid: false
    });

    const filter = (message) => {
        return (
            message.author.id === config.probot &&
            message.content.includes(':moneybag:') &&
            message.content.includes(interaction.user.username) &&
            message.content.includes(config.bank)
        );
    };

    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

    collector.on('collect', async () => {
        await creditMessage.delete().catch(() => {});

        await db.set(`change_owner_${interaction.user.id}`, {
            shopId: interaction.channel.id,
            paid: true
        });

        await interaction.followUp({
            content: '✅ تم الدفع! من فضلك أرسل **آيدي الشخص الجديد** الذي تريد تحويل الملكية له.',
            ephemeral: true
        });

        const idCollector = interaction.channel.createMessageCollector({
            filter: (m) => m.author.id === interaction.user.id,
            max: 1,
            time: 60000
        });

        idCollector.on('collect', async (msg) => {
            const newOwnerId = msg.content.trim();
            const member = await interaction.guild.members.fetch(newOwnerId).catch(() => null);

            if (!member) {
                return interaction.followUp({ content: '❌ لم أتمكن من العثور على هذا العضو.', ephemeral: true });
            }

            await db.set(`shop_${interaction.channel.id}.owner`, newOwnerId);
            await interaction.followUp({ content: `✅ تم تحويل ملكية المتجر إلى <@${newOwnerId}>`, ephemeral: true });
            await db.delete(`change_owner_${interaction.user.id}`);
        });

        idCollector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                await interaction.followUp({ content: '⏰ انتهى الوقت لتحديد المالك الجديد. حاول مرة أخرى.', ephemeral: true });
                await db.delete(`change_owner_${interaction.user.id}`);
            }
        });
    });
}

            // دالة تغيير اسم المتجر
            async function handleChangeNameFromButton(interaction) {
                await interaction.deferReply({ ephemeral: true });

                const shopData = await db.get(`shop_${interaction.channel.id}`);
                if (!shopData) {
                    return interaction.editReply('❌ هذه القناة ليست متجراً');
                }

                const embed = createStandardEmbed(
                    '📝 تغيير اسم المتجر',
                    'لتغيير اسم المتجر يجب دفع **1 كريدت**.\n\nبعد الدفع، اكتب الاسم الجديد.',
                    interaction.guild
                );
                await interaction.editReply({ embeds: [embed] });

                // رسالة الدفع
                const creditMessage = await interaction.channel.send({
                    content: `\`\`\`#credit ${config.bank} 1\`\`\``
                });

                // حفظ العملية
                await db.set(`change_name_${interaction.user.id}`, {
                    shopId: interaction.channel.id,
                    paid: false
                });

                // فلتر لمراقبة الدفع
                const filter = (message) =>
                    message.author.id === config.probot &&
                    message.content.includes(':moneybag:') &&
                    message.content.includes(interaction.user.username) &&
                    message.content.includes(config.bank);

                const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

                collector.on('collect', async (collected) => {
                    const transferredAmount = extractAmountFromMessage(collected.content);

                    if (transferredAmount >= 1) {
                        await creditMessage.delete().catch(() => {});

                        // تحديث العملية
                        await db.set(`change_name_${interaction.user.id}`, {
                            shopId: interaction.channel.id,
                            paid: true
                        });

                        await interaction.followUp({
                            content: '✅ تم الدفع! من فضلك اكتب الاسم الجديد للمتجر (سيتم تغيير النص فقط بعد الإيموجي).',
                            ephemeral: true
                        });

                        // تجميع الاسم الجديد
                        const nameCollector = interaction.channel.createMessageCollector({
                            filter: (m) => m.author.id === interaction.user.id,
                            max: 1,
                            time: 60000
                        });

                        nameCollector.on('collect', async (msg) => {
                            const newName = msg.content.trim();
                            const parts = interaction.channel.name.split('•');
                            const newChannelName = `${parts[0]}•${newName}`;

                            await interaction.channel.setName(newChannelName);
                            await interaction.followUp({
                                content: `✅ تم تغيير اسم المتجر إلى: **${newChannelName}**`,
                                ephemeral: true
                            });

                            await db.delete(`change_name_${interaction.user.id}`);
                        });

                        nameCollector.on('end', async (collected, reason) => {
                            if (reason === 'time') {
                                await interaction.followUp({
                                    content: '⏰ انتهى الوقت لتغيير الاسم. حاول مرة أخرى.',
                                    ephemeral: true
                                });
                                await db.delete(`change_name_${interaction.user.id}`);
                            }
                        });
                    }
                });

                collector.on('end', async (collected, reason) => {
                    if (reason === 'time' && collected.size === 0) {
                        await interaction.channel.send({
                            content: `❌ انتهى وقت الدفع لتغيير اسم المتجر. يرجى المحاولة مرة أخرى.`
                        });
                        await db.delete(`change_name_${interaction.user.id}`);
                    }
                });
            }




async function handleEnableShopFromButton(interaction) {
    await enableShop(interaction);
}

async function handleManageHelpers(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const shopData = await db.get(`shop_${interaction.channel.id}`);
    if (!shopData) {
        return interaction.editReply('❌ هذه القناة ليست متجراً');
    }

    // إرسال التعليمات
    const embed = createStandardEmbed(
        '👥 إدارة المساعدين',
        'لتغيير اسم المتجر يجب دفع **1 كريدت**.\n\nبعد الدفع، اكتب الاسم الجديد.',
        interaction.guild
    );
    await interaction.editReply({ embeds: [embed] });

    // رسالة الدفع
    const creditMessage = await interaction.channel.send({
        content: `\`\`\`#credit ${config.bank} 1\`\`\``
    });

    // حفظ العملية
    await db.set(`manage_helpers_${interaction.user.id}`, {
        shopId: interaction.channel.id,
        paid: false
    });

    // فلتر الدفع
    const filter = (message) =>
        message.author.id === config.probot &&
        message.content.includes(':moneybag:') &&
        message.content.includes(interaction.user.username) &&
        message.content.includes(config.bank);

    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

    collector.on('collect', async (collected) => {
        const transferredAmount = extractAmountFromMessage(collected.content);

        if (transferredAmount >= 1) {
            await creditMessage.delete().catch(() => {});

            await db.set(`manage_helpers_${interaction.user.id}`, {
                shopId: interaction.channel.id,
                paid: true
            });

            await interaction.followUp({
                content: '✅ تم الدفع! أرسل الآن:\n- `add [ID]` لإضافة مساعد.\n- `remove [ID]` لإزالة مساعد.',
                ephemeral: true
            });

            // انتظار الأمر
            const cmdCollector = interaction.channel.createMessageCollector({
                filter: (m) => m.author.id === interaction.user.id,
                max: 1,
                time: 60000
            });

            cmdCollector.on('collect', async (msg) => {
                const args = msg.content.trim().split(' ');
                const action = args[0].toLowerCase();
                const targetId = args[1];

                if (!['add', 'remove'].includes(action)) {
                    return interaction.followUp({ content: '❌ صيغة خاطئة. استخدم `add [ID]` أو `remove [ID]`', ephemeral: true });
                }

                const member = await interaction.guild.members.fetch(targetId).catch(() => null);
                if (!member) {
                    return interaction.followUp({ content: '❌ لم أتمكن من العثور على هذا العضو.', ephemeral: true });
                }

                if (action === 'add') {
                    if (!shopData.helpers) shopData.helpers = [];
                    if (shopData.helpers.includes(targetId)) {
                        return interaction.followUp({ content: '⚠️ هذا العضو مساعد بالفعل.', ephemeral: true });
                    }
                    shopData.helpers.push(targetId);
                    await db.set(`shop_${interaction.channel.id}`, shopData);
                    await interaction.followUp({ content: `✅ تم إضافة <@${targetId}> كمساعد.`, ephemeral: true });
                } else if (action === 'remove') {
                    if (!shopData.helpers || !shopData.helpers.includes(targetId)) {
                        return interaction.followUp({ content: '⚠️ هذا العضو ليس مساعداً.', ephemeral: true });
                    }
                    shopData.helpers = shopData.helpers.filter(id => id !== targetId);
                    await db.set(`shop_${interaction.channel.id}`, shopData);
                    await interaction.followUp({ content: `✅ تم إزالة <@${targetId}> من المساعدين.`, ephemeral: true });
                }

                await db.delete(`manage_helpers_${interaction.user.id}`);
            });

            cmdCollector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    await interaction.followUp({ content: '⏰ انتهى الوقت. حاول مرة أخرى.', ephemeral: true });
                    await db.delete(`manage_helpers_${interaction.user.id}`);
                }
            });
        }
    });

    collector.on('end', async (collected, reason) => {
        if (reason === 'time' && collected.size === 0) {
            await interaction.channel.send({
                content: `❌ انتهى وقت الدفع لإدارة المساعدين. يرجى المحاولة مرة أخرى.`

            });
            await db.delete(`manage_helpers_${interaction.user.id}`);
        }
    });
}


async function handleChangeEmojiPaid(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const shopData = await db.get(`shop_${interaction.channel.id}`);
    if (!shopData) {
        return interaction.editReply('❌ هذه القناة ليست متجراً');
    }

    // رسالة التعليمات
    const embed = createStandardEmbed(
        '🎭 تغيير إيموجي المتجر',
        'لتغيير إيموجي المتجر يجب دفع **1 كريدت**.\n\nبعد الدفع، أرسل الإيموجي الجديد (رمز واحد فقط).',
        interaction.guild
    );
    await interaction.editReply({ embeds: [embed] });

    // رسالة الدفع
    const creditMessage = await interaction.channel.send({
        content: `\`\`\`#credit ${config.bank} 1\`\`\``
    });

    // حفظ العملية
    await db.set(`change_emoji_${interaction.user.id}`, {
        shopId: interaction.channel.id,
        paid: false
    });

    // فلتر الدفع
    const filter = (message) =>
        message.author.id === config.probot &&
        message.content.includes(':moneybag:') &&
        message.content.includes(interaction.user.username) &&
        message.content.includes(config.bank);

    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

    collector.on('collect', async (collected) => {
        const transferredAmount = extractAmountFromMessage(collected.content);

        if (transferredAmount >= 1) {
            await creditMessage.delete().catch(() => {});

            await db.set(`change_emoji_${interaction.user.id}`, {
                shopId: interaction.channel.id,
                paid: true
            });

            await interaction.followUp({
                content: '✅ تم الدفع! أرسل الآن الإيموجي الجديد.',
                ephemeral: true
            });

            // انتظار الإيموجي
            const emojiCollector = interaction.channel.createMessageCollector({
                filter: (m) => m.author.id === interaction.user.id,
                max: 1,
                time: 60000
            });

            emojiCollector.on('collect', async (msg) => {
                const newEmoji = msg.content.trim();

                if (!/^[\p{Emoji}|\p{Extended_Pictographic}]$/u.test(newEmoji)) {
                    return interaction.followUp({ content: '❌ الرجاء إرسال إيموجي واحد صحيح فقط.', ephemeral: true });
                }

                const parts = interaction.channel.name.split('•');
                const newChannelName = `${newEmoji}•${parts[1]}`;

                await interaction.channel.setName(newChannelName);
                await interaction.followUp({
                    content: `✅ تم تغيير إيموجي المتجر إلى: ${newEmoji}`,
                    ephemeral: true
                });

                await db.delete(`change_emoji_${interaction.user.id}`);
            });

            emojiCollector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    await interaction.followUp({
                        content: '⏰ انتهى الوقت لإرسال الإيموجي. حاول مرة أخرى.',
                        ephemeral: true
                    });
                    await db.delete(`change_emoji_${interaction.user.id}`);
                }
            });
        }
    });

    collector.on('end', async (collected, reason) => {
        if (reason === 'time' && collected.size === 0) {
            await interaction.channel.send({
                content: `❌ انتهى وقت الدفع لتغيير الإيموجي. يرجى المحاولة مرة أخرى.`
            });
            await db.delete(`change_emoji_${interaction.user.id}`);
        }
    });
}

// خريطة لتخزين مؤقتات النشر التلقائي
const autoPostTimers = new Map();

async function handleAutoPostPaid(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const shopData = await db.get(`shop_${interaction.channel.id}`);
    if (!shopData) {
        return interaction.editReply('❌ هذه القناة ليست متجراً');
    }

    // فحص إذا كان النشر التلقائي مفعل
    const autoPostData = await db.get(`autopost_${interaction.channel.id}`);

    if (autoPostData && autoPostData.active) {
        // إظهار خيارات إدارة النشر التلقائي
        const manageEmbed = createStandardEmbed(
            '🤖 إدارة النشر التلقائي',
            `**النشر التلقائي مفعل حالياً**\n\n📝 **الرسالة:** ${autoPostData.message.substring(0, 100)}${autoPostData.message.length > 100 ? '...' : ''}\n⏰ **كل:** ${autoPostData.hours} ساعة\n🕐 **النشر التالي:** <t:${Math.floor(autoPostData.nextPost / 1000)}:R>`,
            interaction.guild
        );

        const manageButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('auto_post_stop')
                    .setLabel('إيقاف النشر التلقائي')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⏹️'),
                new ButtonBuilder()
                    .setCustomId('auto_post_edit')
                    .setLabel('تعديل الرسالة')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('✏️')
            );

        await interaction.editReply({ embeds: [manageEmbed], components: [manageButtons] });
        return;
    }

    const embed = createStandardEmbed(
        '🤖 النشر التلقائي - مجاني',
        'النشر التلقائي أصبح مجانياً! أرسل الآن الرسالة التي تريد نشرها تلقائياً.',
        interaction.guild
    );
    await interaction.editReply({ embeds: [embed] });

    // تجميع الرسالة مباشرة بدون دفع
    const msgCollector = interaction.channel.createMessageCollector({
        filter: (m) => m.author.id === interaction.user.id,
        max: 1,
        time: 120000
    });

    msgCollector.on('collect', async (msg) => {
        const autoMessage = msg.content;

        await interaction.followUp({
            content: '⏱️ ممتاز! الآن أرسل عدد الساعات بين كل نشر (الحد الأدنى: ساعة واحدة).',
            ephemeral: true
        });

        const timeCollector = interaction.channel.createMessageCollector({
            filter: (m) => m.author.id === interaction.user.id,
            max: 1,
            time: 60000
        });

        timeCollector.on('collect', async (msg2) => {
            const hours = parseInt(msg2.content.trim());
            if (isNaN(hours) || hours < 1) {
                return interaction.followUp({ content: '❌ الرجاء إدخال رقم صحيح (عدد الساعات، الحد الأدنى: 1).', ephemeral: true });
            }

            // حفظ البيانات
            const nextPostTime = Date.now() + (hours * 60 * 60 * 1000);
            await db.set(`autopost_${interaction.channel.id}`, {
                message: autoMessage,
                hours: hours,
                nextPost: nextPostTime,
                active: true,
                ownerId: interaction.user.id
            });

            // بدء المؤقت
            startAutoPostTimer(interaction.channel.id);

            await interaction.followUp({
                content: `✅ تم تفعيل النشر التلقائي! الرسالة ستُرسل كل ${hours} ساعة.\n🕐 النشر الأول: <t:${Math.floor(nextPostTime / 1000)}:R>`,
                ephemeral: true
            });

            // إرسال رسالة في المتجر
            const confirmEmbed = createStandardEmbed(
                '🤖 تم تفعيل النشر التلقائي',
                `**الرسالة:** ${autoMessage}\n**التكرار:** كل ${hours} ساعة\n**النشر الأول:** <t:${Math.floor(nextPostTime / 1000)}:R>`,
                interaction.guild
            );
            await interaction.channel.send({ embeds: [confirmEmbed] });
        });

        timeCollector.on('end', async (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                await interaction.followUp({
                    content: '⏰ انتهى الوقت لتحديد المدة. حاول مرة أخرى.',
                    ephemeral: true
                });
            }
        });
    });

    msgCollector.on('end', async (collected, reason) => {
        if (reason === 'time' && collected.size === 0) {
            await interaction.followUp({
                content: '⏰ انتهى الوقت لإدخال الرسالة. حاول مرة أخرى.',
                ephemeral: true
            });
        }
    });
}

// دالة بدء مؤقت النشر التلقائي
function startAutoPostTimer(channelId) {
    // إيقاف المؤقت السابق إن وجد
    if (autoPostTimers.has(channelId)) {
        clearTimeout(autoPostTimers.get(channelId));
    }

    const scheduleNext = async () => {
        try {
            const autoPostData = await db.get(`autopost_${channelId}`);
            if (!autoPostData || !autoPostData.active) {
                autoPostTimers.delete(channelId);
                return;
            }

            const now = Date.now();
            const timeUntilPost = autoPostData.nextPost - now;

            if (timeUntilPost <= 0) {
                // وقت النشر!
                const channel = client.channels.cache.get(channelId);
                if (channel) {
                    await channel.send(autoPostData.message);
                }

                // جدولة النشر التالي
                const nextPostTime = now + (autoPostData.hours * 60 * 60 * 1000);
                await db.set(`autopost_${channelId}.nextPost`, nextPostTime);

                // جدولة المؤقت التالي
                const timer = setTimeout(scheduleNext, autoPostData.hours * 60 * 60 * 1000);
                autoPostTimers.set(channelId, timer);
            } else {
                // انتظار حتى وقت النشر
                const timer = setTimeout(scheduleNext, timeUntilPost);
                autoPostTimers.set(channelId, timer);
            }
        } catch (error) {
            console.error(`خطأ في النشر التلقائي للقناة ${channelId}:`, error);
            autoPostTimers.delete(channelId);
        }
    };

    scheduleNext();
}

// دالة معالجة دفع تغيير نوع المتجر
async function handleChangeTypePayment(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const typeId = interaction.customId.replace('change_type_', '');
    const newType = types.find(t => t.id === typeId);

    if (!newType) {
        return interaction.editReply('❌ نوع المتجر غير صحيح');
    }

    const shopData = await db.get(`shop_${interaction.channel.id}`);
    if (!shopData) {
        return interaction.editReply('❌ هذه القناة ليست متجراً');
    }

    // التحقق من النوع الحالي
    const currentType = types.find(t => t.id === interaction.channel.parentId);
    if (currentType && currentType.id === newType.id) {
        return interaction.editReply('❌ هذا هو نوع المتجر الحالي بالفعل');
    }

    const halfPrice = Math.floor(newType.price / 2);
    const tax = Math.floor(halfPrice * 20 / 19 + 1);

    const embed = createStandardEmbed(
        '💰 دفع لتغيير نوع المتجر',
        `**تغيير المتجر من ${currentType?.name || 'غير معروف'} إلى ${newType.name}**\n\nالمبلغ المطلوب: ${halfPrice} كرديت\nمع الضريبة: ${tax} كرديت`,
        interaction.guild
    );

    await interaction.editReply({ embeds: [embed] });

    const creditMessage = await interaction.channel.send({
        content: `\`\`\`#credit ${config.bank} ${tax}\`\`\``
    });

    // مراقبة الدفع
    const filter = (message) =>
        message.author.id === config.probot &&
        message.content.includes(':moneybag:') &&
        message.content.includes(interaction.user.username) &&
        message.content.includes(config.bank);

    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

    collector.on('collect', async (collected) => {
        const transferredAmount = extractAmountFromMessage(collected.content);

        if (transferredAmount >= halfPrice) {
            await creditMessage.delete().catch(() => {});

            try {
                // تغيير نوع المتجر
                await interaction.channel.setParent(newType.id);
                await db.set(`shop_${interaction.channel.id}.type`, newType.role);
                await db.set(`shop_${interaction.channel.id}.badge`, newType.badge);

                // تحديث المنشنات حسب النوع الجديد
                await db.set(`shop_${interaction.channel.id}.every`, newType.every);
                await db.set(`shop_${interaction.channel.id}.here`, newType.here);
                await db.set(`shop_${interaction.channel.id}.shop`, newType.shop);

                const successEmbed = createStandardEmbed(
                    '✅ تم تغيير نوع المتجر',
                    `تم تغيير المتجر من **${currentType?.name || 'غير معروف'}** إلى **${newType.name}**\n\nالمنشنات الجديدة:\n• @everyone: ${newType.every}\n• @here: ${newType.here}\n• منشن المتجر: ${newType.shop}`,
                    interaction.guild
                );

                await interaction.channel.send({ embeds: [successEmbed] });
                await interaction.followUp({
                    content: '✅ تم تغيير نوع المتجر بنجاح!',
                    ephemeral: true
                });

                // إرسال لوج
                const logChannel = interaction.guild.channels.cache.get(config.commandlog);
                if (logChannel) {
                    const logEmbed = createStandardEmbed('تم تغيير نوع متجر', `بواسطة: <@${interaction.user.id}>`, interaction.guild);
                    logEmbed.addFields(
                        { name: 'المتجر:', value: `<#${interaction.channel.id}>`, inline: true },
                        { name: 'من:', value: currentType?.name || 'غير معروف', inline: true },
                        { name: 'إلى:', value: newType.name, inline: true },
                        { name: 'المبلغ المدفوع:', value: `${transferredAmount} كرديت`, inline: true }
                    );
                    await logChannel.send({ embeds: [logEmbed] });
                }

            } catch (error) {
                console.error('خطأ في تغيير نوع المتجر:', error);
                await interaction.followUp({
                    content: '❌ حدث خطأ أثناء تغيير نوع المتجر',
                    ephemeral: true
                });
            }
        } else {
            await interaction.channel.send({
                content: `❌ المبلغ المحول (${transferredAmount}) غير كافي. المطلوب: ${halfPrice} كرديت`
            });
        }
    });

    collector.on('end', async (collected, reason) => {
        if (reason === 'time' && collected.size === 0) {
            await interaction.channel.send({
                content: `❌ انتهى وقت الدفع لتغيير نوع المتجر. يرجى المحاولة مرة أخرى.`
            });
        }
    });
}

async function handleDeleteShopConfirm(interaction) {
    const confirmEmbed = createStandardEmbed('⚠️ تأكيد حذف المتجر', '**هل أنت متأكد من حذف المتجر؟**\n\n⚠️ **تحذير:** هذا الإجراء لا يمكن التراجع عنه!', interaction.guild);

    const confirmRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_delete_shop')
                .setLabel('نعم، احذف المتجر')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑️'),
            new ButtonBuilder()
                .setCustomId('cancel_delete_shop')
                .setLabel('إلغاء')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('❌')
        );

    await interaction.reply({
        embeds: [confirmEmbed],
        components: [confirmRow],
        ephemeral: true
    });
}

// دالة تأكيد حذف المتجر
async function handleConfirmDeleteShop(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const shopData = await db.get(`shop_${interaction.channel.id}`);
    if (!shopData) {
        return interaction.editReply('هذه القناة ليست متجر');
    }

    // التحقق من الصلاحيات (المالك فقط يمكنه حذف المتجر)
    if (interaction.user.id !== shopData.owner && !interaction.member.roles.cache.has(config.Admin)) {
        return interaction.editReply('فقط صاحب المتجر أو الإدارة يمكنهم حذف المتجر');
    }

    try {
        // إرسال رسالة للمالك
        const owner = await interaction.guild.members.fetch(shopData.owner);
        const dmEmbed = createStandardEmbed('🗑️ تم حذف متجرك', `تم حذف متجرك: **${interaction.channel.name}**`, interaction.guild);
        dmEmbed.addFields(
            { name: 'اسم المتجر:', value: interaction.channel.name, inline: true },
            { name: 'بواسطة:', value: `<@${interaction.user.id}>`, inline: true },
            { name: 'السبب:', value: 'حذف بواسطة صاحب المتجر', inline: true }
        );

        try {
            await owner.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.log('لا يمكن إرسال رسالة للمالك');
        }

        // إرسال لوج
        const logChannel = interaction.guild.channels.cache.get(config.commandlog);
        if (logChannel) {
            const logEmbed = createStandardEmbed('تم حذف متجر', `بواسطة: <@${interaction.user.id}>`, interaction.guild);
            logEmbed.addFields(
                { name: 'المتجر:', value: interaction.channel.name, inline: true },
                { name: 'المالك:', value: `<@${shopData.owner}>`, inline: true },
                { name: 'السبب:', value: 'حذف بواسطة صاحب المتجر', inline: true }
            );

            await logChannel.send({ embeds: [logEmbed] });
        }

        // حذف بيانات المتجر من قاعدة البيانات
        await db.delete(`shop_${interaction.channel.id}`);

        await interaction.editReply('✅ سيتم حذف المتجر بعد 5 ثوانِ...');

        // حذف القناة بعد 5 ثوانِ
        setTimeout(async () => {
            try {
                await interaction.channel.delete();
            } catch (error) {
                console.error('خطأ في حذف القناة:', error);
            }
        }, 5000);

    } catch (error) {
        console.error('خطأ في حذف المتجر:', error);
        await interaction.editReply('❌ حدث خطأ أثناء حذف المتجر');
    }
}

// دالة تأكيد حذف المتجر
async function handleConfirmDeleteShop(interaction) {
    const confirmEmbed = createStandardEmbed('⚠️ تأكيد حذف المتجر', '**هل أنت متأكد من حذف المتجر؟**\n\n⚠️ **تحذير:** هذا الإجراء لا يمكن التراجع عنه!', interaction.guild);

    const confirmRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_delete_shop')
                .setLabel('نعم، احذف المتجر')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑️'),
            new ButtonBuilder()
                .setCustomId('cancel_delete_shop')
                .setLabel('إلغاء')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('❌')
        );

    await interaction.reply({
        embeds: [confirmEmbed],
        components: [confirmRow],
        ephemeral: true
    });
}

async function handleCloseTicket(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const channel = interaction.channel;

    if (!channel) {
        return interaction.editReply({ content: 'لا يمكن العثور على القناة.', ephemeral: true });
    }

    // التحقق مما إذا كان المستخدم هو صاحب التذكرة
    const ticketData = await db.get(`buy_shop_ticket_${interaction.user.id}`) || await db.get(`buy_${interaction.user.id}`);
    if (!ticketData || ticketData.channelId !== channel.id) {
        // If the user is not the owner, check if they have admin privileges
        if (!interaction.member.roles.cache.has(config.Admin)) {
            return interaction.editReply({ content: 'ليس لديك صلاحية لإغلاق هذه التذكرة.', ephemeral: true });
        }
    }

    await channel.send({ content: 'سيتم حذف هذه التذكرة بعد 5 ثواني.' });

    // إزالة البيانات من قاعدة البيانات
    await db.delete(`buy_shop_ticket_${interaction.user.id}`);
    await db.delete(`buy_${interaction.user.id}`);
    await db.delete(`shop_credit_${interaction.user.id}`);

    setTimeout(() => {
        channel.delete();
    }, 5000);
}

// الدوال المفقودة

async function handleEditPrices(interaction) {
    const type = interaction.options.getString('type');

    if (type === 'view_all') {
        await showPricesInfo(interaction);
        return;
    }

    let modal;

    switch (type) {
        case 'normal_mentions':
            modal = new ModalBuilder()
                .setCustomId('normal_mentions_modal')
                .setTitle('أسعار المنشنات العادية');

            const everyonePriceInput = new TextInputBuilder()
                .setCustomId('everyone_price')
                .setLabel('سعر منشن @everyone')
                .setStyle(TextInputStyle.Short)
                .setValue(config.every.toString())
                .setRequired(true);

            const herePriceInput = new TextInputBuilder()
                .setCustomId('here_price')
                .setLabel('سعر منشن @here')
                .setStyle(TextInputStyle.Short)
                .setValue(config.here.toString())
                .setRequired(true);

            const shopMentionPriceInput = new TextInputBuilder()
                .setCustomId('shop_mention_price')
                .setLabel('سعر منشن المتجر')
                .setStyle(TextInputStyle.Short)
                .setValue((config.shopMentionPrice || 5000).toString())
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(everyonePriceInput),
                new ActionRowBuilder().addComponents(herePriceInput),
                new ActionRowBuilder().addComponents(shopMentionPriceInput)
            );
            break;

        case 'order_mentions':
            modal = new ModalBuilder()
                .setCustomId('order_mentions_modal')
                .setTitle('أسعار منشنات الطلبات');

            const orderEveryoneInput = new TextInputBuilder()
                .setCustomId('order_everyone_price')
                .setLabel('سعر منشن @everyone للطلبات')
                .setStyle(TextInputStyle.Short)
                .setValue((config.oeverey || 5).toString())
                .setRequired(true);

            const orderHereInput = new TextInputBuilder()
                .setCustomId('order_here_price')
                .setLabel('سعر منشن @here للطلبات')
                .setStyle(TextInputStyle.Short)
                .setValue((config.ohere || 3).toString())
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(orderEveryoneInput),
                new ActionRowBuilder().addComponents(orderHereInput)
            );
            break;

        case 'extra_services':
            modal = new ModalBuilder()
                .setCustomId('extra_services_modal')
                .setTitle('أسعار الخدمات الإضافية');

            const removeWarningInput = new TextInputBuilder()
                .setCustomId('remove_warning_price')
                .setLabel('سعر إزالة التحذير الواحد')
                .setStyle(TextInputStyle.Short)
                .setValue((config.removeWarningPrice || 2).toString())
                .setRequired(true);

            const enableShopInput = new TextInputBuilder()
                .setCustomId('enable_shop_price')
                .setLabel('سعر تفعيل متجر معطل')
                .setStyle(TextInputStyle.Short)
                .setValue((config.enableShopPrice || 5000).toString())
                .setRequired(true);

            const changeNameInput = new TextInputBuilder()
                .setCustomId('change_name_price')
                .setLabel('سعر تغيير اسم المتجر')
                .setStyle(TextInputStyle.Short)
                .setValue((config.changeNamePrice || 1).toString())
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(removeWarningInput),
                new ActionRowBuilder().addComponents(enableShopInput),
                new ActionRowBuilder().addComponents(changeNameInput)
            );
            break;

        default:
            return interaction.reply({ content: 'نوع غير معروف!', ephemeral: true });
    }

    await interaction.showModal(modal);
}

async function handleBotSetup(interaction) {
    const setupEmbed = createStandardEmbed('🛠️ إعدادات البوت', '**اختر نوع الإعدادات التي تريد تعديلها:**', interaction.guild);

    const setupMenu = new StringSelectMenuBuilder()
        .setCustomId('setup_select_menu')
        .setPlaceholder('اختر نوع الإعدادات')
        .addOptions([
            {
                label: '🔧 الإعدادات الأساسية',
                description: 'shop-admin, logs, bank, line',
                value: 'basic_setup',
                emoji: '🔧'
            },
            {
                label: '👑 إعدادات الإدارة',
                description: 'order-admin, auction-admin',
                value: 'admins_setup',
                emoji: '👑'
            },
            {
                label: '🎫 إعدادات التذاكر',
                description: 'order-ticket, auction-ticket, category',
                value: 'tickets_setup',
                emoji: '🎫'
            }
        ]);

    const row = new ActionRowBuilder().addComponents(setupMenu);

    await interaction.reply({
        embeds: [setupEmbed],
        components: [row],
        ephemeral: true
    });
}

async function sendAllPanels(interaction) {
    const type = interaction.options.getString('type');
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    await interaction.deferReply({ ephemeral: true });

    switch (type) {
        case 'buy_shops':
            await sendBuyTicket(interaction);
            break;
        case 'prices':
            await sendPricePanels(interaction);
            break;
        case 'encryption':
            await sendEncryptionPanel(interaction);
            break;
        case 'help':
            await sendHelpMessage(channel);
            await interaction.editReply('تم إرسال بانل المساعدة!');
            break;
        default:
            await interaction.editReply('نوع بانل غير معروف!');
    }
}

async function showUserShops(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    await interaction.deferReply({ ephemeral: true });

    const channels = await interaction.guild.channels.fetch();
    let userShops = [];

    for (const [channelId, channel] of channels) {
        const shopData = await db.get(`shop_${channelId}`);
        if (shopData && shopData.owner === user.id) {
            userShops.push({
                name: channel.name,
                id: channelId,
                type: shopData.type,
                warns: shopData.warns || 0,
                status: shopData.status
            });
        }
    }

    if (userShops.length === 0) {
        return interaction.editReply(`المستخدم ${user} لا يملك أي متاجر`);
    }

    let shopsList = '';
    for (let i = 0; i < userShops.length; i++) {
        const shop = userShops[i];
        const statusEmoji = shop.status === "1" ? '✅' : '❌';
        shopsList += `**${i + 1}.** <#${shop.id}> ${statusEmoji}\n`;
        shopsList += `   └ التحذيرات: ${shop.warns} | النوع: <@&${shop.type}>\n`;
    }

    const embed = createStandardEmbed(`📊 متاجر ${user.username}`, shopsList, interaction.guild);
    embed.addFields({ name: 'إجمالي المتاجر:', value: userShops.length.toString(), inline: true });

    await interaction.editReply({ embeds: [embed] });
}

async function fixBotIssues(interaction) {
    await interaction.deferReply({ ephemeral: true });

    let fixedCount = 0;
    const channels = await interaction.guild.channels.fetch();

    // إصلاح المتاجر المفقودة البيانات
    for (const [channelId, channel] of channels) {
        if (channel.parentId && types.find(t => t.id === channel.parentId)) {
            const shopData = await db.get(`shop_${channelId}`);
            if (!shopData) {
                const type = types.find(t => t.id === channel.parentId);
                await db.set(`shop_${channelId}`, {
                    owner: null,
                    type: type.role,
                    shop: type.shop,
                    every: type.every,
                    here: type.here,
                    date: `<t:${Math.floor(Date.now() / 1000)}:R>`,
                    status: "1",
                    warns: 0,
                    badge: type.badge
                });
                fixedCount++;
            }
        }
    }

    const embed = createStandardEmbed('🔧 إصلاح البوت', `تم إصلاح ${fixedCount} متجر`, interaction.guild);
    await interaction.editReply({ embeds: [embed] });
}

async function sendEncryptionPanel(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const embed = createStandardEmbed("تشفير", "**أضـعـط عـلـي الـزر بـالـأسـفـل 👇 لـتـشـفـيـر مـنـشـورك**", interaction.guild);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel("تـشـفـيـر")
                .setCustomId('replace')
        );

    await channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: 'تم إرسال بانل التشفير!', ephemeral: true });
}

async function refreshCommands(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const commands = getCommands();
    const rest = new REST().setToken(config.token);

    try {
        await interaction.editReply('🔄 جاري تحديث الأوامر...');

        const data = await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );

        await interaction.editReply(`✅ تم تحديث ${data.length} أمر بنجاح`);
    } catch (error) {
        console.error('خطأ في تحديث الأوامر:', error);
        await interaction.editReply('❌ حدث خطأ أثناء تحديث الأوامر');
    }
}

async function sendPricePanels(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const pricesEmbed = createStandardEmbed('💰 أسعار الخدمات', '**اختر نوع الخدمة لعرض الأسعار:**', interaction.guild);

    const pricesButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('view_shop_prices')
                .setLabel('أسعار المتاجر')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🏪'),
            new ButtonBuilder()
                .setCustomId('view_auction_prices')
                .setLabel('أسعار المزادات')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🏆'),
            new ButtonBuilder()
                .setCustomId('view_order_prices')
                .setLabel('أسعار الطلبات')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📋')
        );

    const channel = interaction.options.getChannel('channel') || interaction.channel;
    await channel.send({ embeds: [pricesEmbed], components: [pricesButtons] });
    await interaction.reply('تم إرسال بانل الأسعار!');
}

async function showRemoveWarningModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('remove_warning_amount_modal')
        .setTitle('إزالة التحذيرات');

    const warningAmountInput = new TextInputBuilder()
        .setCustomId('warning_amount')
        .setLabel('عدد التحذيرات المراد إزالتها')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('مثال: 1');

    const firstRow = new ActionRowBuilder().addComponents(warningAmountInput);
    modal.addComponents(firstRow);

    await interaction.showModal(modal);
}

async function handleRemoveWarning(interaction) {
    const warningId = interaction.customId.split('_');
    const shopId = warningId[2];
    const warningAmount = parseInt(warningId[3]);

    await interaction.deferReply({ ephemeral: true });

    const shopData = await db.get(`shop_${shopId}`);
    if (!shopData) {
        return interaction.editReply('❌ لم يتم العثور على بيانات المتجر');
    }

    const currentWarns = shopData.warns || 0;
    if (currentWarns < warningAmount) {
        return interaction.editReply(`❌ المتجر لديه ${currentWarns} تحذيرات فقط`);
    }

    // حساب التكلفة
    const totalCost = warningAmount * (config.removeWarningPrice || 2);
    const tax = Math.floor(totalCost * 20 / 19 + 1);

    const embed = createStandardEmbed('💰 إزالة التحذير', `لإزالة ${warningAmount} تحذير، المطلوب دفع ${totalCost} كرديت (${tax} مع الضريبة)`, interaction.guild);
    await interaction.editReply({ embeds: [embed] });

    await interaction.channel.send({
        content: `#credit ${config.bank} ${tax}`
    });
}

async function manageMentions(interaction) {
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply('هذا الأمر قيد التطوير...');
}

async function deleteShopType(interaction) {
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply('هذا الأمر قيد التطوير...');
}

async function addShopType(interaction) {
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply('هذا الأمر قيد التطوير...');
}

async function handleChangeTypeFromButton(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const shopData = await db.get(`shop_${interaction.channel.id}`);
    if (!shopData) {
        return interaction.editReply('❌ هذه القناة ليست متجراً');
    }

    // عرض أنواع المتاجر المتاحة
    const typeButtons = new ActionRowBuilder();

    for (let i = 0; i < Math.min(types.length, 5); i++) {
        const type = types[i];
        const halfPrice = Math.floor(type.price / 2);

        typeButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(`change_type_${type.id}`)
                .setLabel(`${type.badge} ${type.name} (${halfPrice} كرديت)`)
                .setStyle(ButtonStyle.Primary)
        );
    }

    const embed = createStandardEmbed(
        '🏪 تغيير نوع المتجر',
        'اختر نوع المتجر الجديد. السعر هو نصف سعر المتجر الأصلي:',
        interaction.guild
    );

    await interaction.editReply({ embeds: [embed], components: [typeButtons] });
}

// دالة معالجة إزالة التحذيرات من الأزرار
async function handleRemoveWarningTicket(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const shopData = await db.get(`shop_${interaction.channel.id}`);
    if (!shopData) {
        return interaction.editReply('❌ هذه القناة ليست متجراً');
    }

    const currentWarns = shopData.warns || 0;
    if (currentWarns === 0) {
        return interaction.editReply('❌ المتجر لا يحتوي على تحذيرات');
    }

    // عرض خيارات إزالة التحذيرات
    const warningButtons = new ActionRowBuilder();

    if (currentWarns >= 1) {
        warningButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(`remove_warning_${interaction.channel.id}_1`)
                .setLabel('إزالة تحذير واحد')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('1️⃣')
        );
    }

    if (currentWarns >= 2) {
        warningButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(`remove_warning_${interaction.channel.id}_2`)
                .setLabel('إزالة تحذيرين')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('2️⃣')
        );
    }

    if (currentWarns >= 3) {
        warningButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(`remove_warning_${interaction.channel.id}_${currentWarns}`)
                .setLabel('إزالة جميع التحذيرات')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑️')
        );
    }

    const embed = createStandardEmbed('⚠️ إزالة التحذيرات', `المتجر لديه حالياً ${currentWarns} تحذيرات\n\nاختر عدد التحذيرات المراد إزالتها:`, interaction.guild);

    await interaction.editReply({ embeds: [embed], components: [warningButtons] });
}















