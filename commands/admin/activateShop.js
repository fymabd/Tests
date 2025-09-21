// دالة تفعيل المتاجر
async function activateShop(interaction, db, createStandardEmbed) {
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

module.exports = { activateShop };