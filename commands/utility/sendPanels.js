const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async function sendPanels(interaction, db, config, types, createStandardEmbed) {
    // التحقق من صلاحيات الإدارة
    if (!interaction.member.roles.cache.has(config.Admin)) {
        return interaction.reply({ content: 'ليس لديك صلاحية لاستخدام هذا الأمر!', ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setTitle('🏪 لوحة التحكم الرئيسية')
        .setDescription('اختر الخدمة التي تريدها:')
        .setColor('#0099FF')
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp()
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('open_shop_ticket')
                .setLabel('🏪 متجر')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('open_orders_ticket')
                .setLabel('📋 طلبات')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('open_auction_ticket')
                .setLabel('🔨 مزاد')
                .setStyle(ButtonStyle.Danger)
        );

    try {
        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ تم إرسال لوحة التحكم الرئيسية!', ephemeral: true });
    } catch (error) {
        console.error('خطأ في إرسال البانل:', error);
        await interaction.reply({ content: '❌ حدث خطأ أثناء إرسال البانل!', ephemeral: true });
    }
};