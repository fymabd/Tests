const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async function sendOrders(interaction, db, config, types, createStandardEmbed) {
    // التحقق من صلاحيات الإدارة
    if (!interaction.member.roles.cache.has(config.Admin)) {
        return interaction.reply({ content: 'ليس لديك صلاحية لاستخدام هذا الأمر!', ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setTitle('📋 بانل الطلبات')
        .setDescription('إدارة الطلبات والخدمات المتعلقة بها')
        .setColor('#00FF00')
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp()
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('view_order_prices')
                .setLabel('💰 أسعار الطلبات')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('open_orders_ticket')
                .setLabel('🎫 فتح تذكرة طلب')
                .setStyle(ButtonStyle.Success)
        );

    try {
        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ تم إرسال بانل الطلبات!', ephemeral: true });
    } catch (error) {
        console.error('خطأ في إرسال بانل الطلبات:', error);
        await interaction.reply({ content: '❌ حدث خطأ أثناء إرسال البانل!', ephemeral: true });
    }
};