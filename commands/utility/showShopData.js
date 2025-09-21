// دالة عرض بيانات المتجر
async function showShopData(interaction, db, createStandardEmbed) {
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

module.exports = { showShopData };