// دالة محسنة لإدارة المنشنات (دمج add-mentions + إضافة ميزات)
async function handleAddMentionsCommand(interaction, db, config, types, createStandardEmbed) {
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

module.exports = { handleAddMentionsCommand };