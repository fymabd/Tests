// دالة إزالة المساعدين
async function removeHelper(interaction, db, config) {
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

module.exports = { removeHelper };