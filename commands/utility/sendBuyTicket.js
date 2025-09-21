const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// دالة إرسال تذكرة شراء متجر  
async function sendBuyTicket(interaction, db, config, createStandardEmbed) {
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
                .setEmoji('🔒')
        );

    await channel.send({ embeds: [embedAboveButtons], components: [row, closeRow] });

    await interaction.editReply({
        content: `**تـم إنـشـاء تـكـت شـراء مـتـجـر بـ نـجـاح** ${channel}`
    });
}

module.exports = { sendBuyTicket };