const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async function sendActions(interaction, db, config, types, createStandardEmbed) {
    // التحقق من صلاحيات الإدارة
    if (!interaction.member.roles.cache.has(config.Admin)) {
        return interaction.reply({ content: 'ليس لديك صلاحية لاستخدام هذا الأمر!', ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setTitle('🔨 بانل المزادات')
        .setDescription('إدارة المزادات والخدمات المتعلقة بها')
        .setColor('#FF0000')
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp()
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('view_auction_prices')
                .setLabel('💰 أسعار المزاد')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('open_auction_ticket')
                .setLabel('🎫 تذكرة مزاد')
                .setStyle(ButtonStyle.Danger)
        );

    try {
        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ تم إرسال بانل المزادات!', ephemeral: true });
    } catch (error) {
        console.error('خطأ في إرسال بانل المزادات:', error);
        await interaction.reply({ content: '❌ حدث خطأ أثناء إرسال البانل!', ephemeral: true });
    }
};