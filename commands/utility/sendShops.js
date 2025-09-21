const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async function sendShops(interaction, db, config, types, createStandardEmbed) {
    // التحقق من صلاحيات الإدارة
    if (!interaction.member.roles.cache.has(config.Admin)) {
        return interaction.reply({ content: 'ليس لديك صلاحية لاستخدام هذا الأمر!', ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setTitle('🏪 بانل المتاجر')
        .setDescription('إدارة المتاجر والخدمات المتعلقة بها')
        .setColor('#0099FF')
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp()
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('open_shop_ticket')
                .setLabel('🎫 فتح تذكرة متجر')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('view_shop_prices')
                .setLabel('💰 أسعار المتاجر')
                .setStyle(ButtonStyle.Secondary)
        );

    try {
        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ تم إرسال بانل المتاجر!', ephemeral: true });
    } catch (error) {
        console.error('خطأ في إرسال بانل المتاجر:', error);
        await interaction.reply({ content: '❌ حدث خطأ أثناء إرسال البانل!', ephemeral: true });
    }
};