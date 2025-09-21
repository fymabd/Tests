const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// دالة تحذير المتاجر
async function warnShop(interaction, db, config, createStandardEmbed) {
    await interaction.deferReply({ ephemeral: true });
    const shop = interaction.options.getChannel('shop');
    const amount = interaction.options.getNumber('amount');
    const reason = interaction.options.getString('reason');
    const proof = interaction.options.getAttachment('proof');

    if (amount === 0) return interaction.editReply({ content: `لا يمكن إضافة 0 تحذيرات` });

    const data = await db.get(`shop_${shop.id}`);
    if (!data) {
        return interaction.editReply({ content: `** هـصة الـروم لـيـسـت مـتـجـرا **` });
    }

    await db.add(`shop_${shop.id}.warns`, amount);
    const newWarns = (data.warns || 0) + amount;

    const embed = createStandardEmbed(`تـم تـحـذيـر الـمـتـجـر`, `الـمـسـؤول: <@${interaction.user.id}>`, interaction.guild);
    embed.addFields(
        { name: 'عـدد الـتـحـذيـرات الـكـامـل:', value: newWarns.toString(), inline: true },
        { name: 'سـبـب الـتـحـذيـر:', value: reason, inline: true },
        { name: 'عـدم تـشـفـيـر الـكـلـمـات النـاتـجـة:', value: 'خـاص', inline: true },
        { name: 'الـمـسـؤول:', value: 'تـلـقـائـي', inline: true },
        { name: 'الـوقـت:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
    );
    embed.setImage(proof?.url || null);
    embed.setColor('#FF0000');

    const removeButton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`remove_warning_${shop.id}_${amount}`)
                .setLabel('إزالة التحذير')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('💰')
        );

    await shop.send({ content: `<@${data.owner}>`, embeds: [embed], components: [removeButton] });

    // فحص إذا وصلت التحذيرات لـ 5 أو أكثر
    if (newWarns >= 7) {
        // حذف المتجر نهائياً
        const deleteEmbed = createStandardEmbed('🗑️ تم حذف المتجر نهائياً', `**تم حذف المتجر بسبب وصول التحذيرات إلى 7 تحذيرات**`, interaction.guild);
        deleteEmbed.addFields(
            { name: 'عدد التحذيرات:', value: newWarns.toString() },
            { name: 'المالك:', value: `<@${data.owner}>` },
            { name: 'اسم المتجر:', value: shop.name }
        );
        deleteEmbed.setColor('#8B0000');

        // إرسال إشعار للوج
        const logChannel = interaction.guild.channels.cache.get(config.log);
        if (logChannel) {
            await logChannel.send({
                content: '@everyone',
                embeds: [deleteEmbed]
            });
        }

        // حذف بيانات المتجر من قاعدة البيانات
        await db.delete(`shop_${shop.id}`);

        // حذف القناة
        await shop.delete();

    } else if (newWarns >= 5) {
        // قفل المتجر
        await shop.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            ViewChannel: false,
        });

        await db.set(`shop_${shop.id}.status`, "0");

        const lockEmbed = createStandardEmbed('🔒 تم إغلاق المتجر', `**تم إغلاق المتجر بسبب وصول التحذيرات إلى 5 تحذيرات**`, interaction.guild);
        lockEmbed.addFields(
            { name: 'عدد التحذيرات:', value: newWarns.toString() },
            { name: 'المالك:', value: `<@${data.owner}>` },
            { name: 'تحذير:', value: 'عند وصول التحذيرات إلى 7 سيتم حذف المتجر نهائياً' }
        );
        lockEmbed.setColor('#8B0000');

        await shop.send({ content: `<@${data.owner}>`, embeds: [lockEmbed] });

        // إرسال إشعار للوج
        const logChannel = interaction.guild.channels.cache.get(config.log);
        if (logChannel) {
            await logChannel.send({
                content: '@everyone',
                embeds: [lockEmbed]
            });
        }
    }

    await interaction.editReply({ content: `**تـم تـحـذيـر الـمـتـجـر ${shop} بـنـجـاح - التحذيرات الآن: ${newWarns}**` });

    // إرسال لوج
    const logg = interaction.guild.channels.cache.get(config.commandlog);
    if (logg) {
        const embedlog = createStandardEmbed(`تـم تـحـذيـر مـتـجـر`, `الـمـسـؤول : <@${interaction.user.id}>`, interaction.guild);
        embedlog.addFields(
            { name: 'المـتـجـر:', value: `<#${shop.id}>`, inline: true },
            { name: 'عـدد الـتـحـذيـرات الـجـديـدة', value: amount.toString(), inline: true },
            { name: 'إجـمـالـي الـتـحـذيـرات', value: newWarns.toString(), inline: true },
            { name: 'سـبـب الـتـحـذيـر', value: reason, inline: true }
        );
        embedlog.setImage(proof?.url || null);

        await logg.send({ embeds: [embedlog] });
    }
}

module.exports = { warnShop };