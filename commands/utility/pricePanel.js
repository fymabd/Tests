const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

module.exports = async function pricePanel(
    interaction,
    db,
    config,
    types,
    createStandardEmbed,
) {
    // التحقق من صلاحيات الإدارة
    if (!interaction.member.roles.cache.has(config.Admin)) {
        return interaction.reply({
            content: "ليس لديك صلاحية لاستخدام هذا الأمر!",
            ephemeral: true,
        });
    }

    // جلب الأسعار من قاعدة البيانات
    const prices = (await db.get("prices")) || {};

    const embed = new EmbedBuilder()
        .setTitle("💰 لوحة الأسعار")
        .setDescription("عرض جميع أسعار الخدمات")
        .setColor("#FFD700")
        .addFields(
            {
                name: "🔨 أسعار المزاد",
                value: `Everyone: ${prices.auction_everyone || "غير محدد"}\nHere: ${prices.auction_here || "غير محدد"}`,
                inline: true,
            },
            {
                name: "📋 أسعار الطلبات",
                value: `Everyone: ${prices.orders_everyone || "غير محدد"}\nHere: ${prices.orders_here || "غير محدد"}`,
                inline: true,
            },
            { name: "🏪 أسعار المتاجر", value: `حسب النوع`, inline: true },
            {
                name: "⚠️ إزالة التحذير",
                value: `${prices.remove_warning || "غير محدد"}`,
                inline: true,
            },
            {
                name: "💬 شراء المنشنات",
                value: `${prices.buy_mentions || "غير محدد"}`,
                inline: true,
            },
            {
                name: "🔄 الإرسال التلقائي",
                value: `${prices.auto_send || "غير محدد"}`,
                inline: true,
            },
        )
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp()
        .setFooter({
            text: interaction.guild.name,
            iconURL: interaction.guild.iconURL(),
        });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("view_auction_prices_detailed")
            .setLabel("🔨 أسعار المزاد")
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId("view_order_prices_detailed")
            .setLabel("📋 أسعار الطلبات")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId("view_shop_prices_detailed")
            .setLabel("🏪 أسعار المتاجر")
            .setStyle(ButtonStyle.Primary),
    );

    try {
        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({
            content: "✅ تم إرسال لوحة الأسعار!",
            ephemeral: true,
        });
    } catch (error) {
        console.error("خطأ في إرسال لوحة الأسعار:", error);
        await interaction.reply({
            content: "❌ حدث خطأ أثناء إرسال البانل!",
            ephemeral: true,
        });
    }
};
