const ms = require('ms');

// دالة محسنة لتعطيل المتاجر (مع خيارات متقدمة)
async function handleDisableCommand(interaction, db, createStandardEmbed) {
    await interaction.deferReply({ ephemeral: true });

    const action = interaction.options.getString('action') || 'disable';
    const shop = interaction.options.getChannel('shop') || interaction.channel;
    const reason = interaction.options.getString('reason');
    const duration = interaction.options.getString('duration');

    const datap = await db.get(`shop_${shop.id}`);
    if (!datap) {
        return interaction.editReply('**هذا الروم ليس متجر**');
    }

    if (action === 'disable') {
        if (datap.status === "0") {
            return interaction.editReply('**هذا الروم معطل بالفعل**');
        }

        await shop.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            ViewChannel: false,
        });

        await db.set(`shop_${shop.id}.status`, "0");

        // إضافة تاريخ التعطيل ومدة التعطيل إذا تم تحديدها
        if (duration) {
            const disableUntil = Date.now() + ms(duration);
            await db.set(`shop_${shop.id}.disableUntil`, disableUntil);
        }

        const embedlog = createStandardEmbed(`تم تعطيل المتجر`, `المسؤول: <@${interaction.user.id}>`, interaction.guild);
        embedlog.addFields(
            { name: 'السبب', value: reason || 'لم يتم تحديد سبب', inline: true },
            { name: 'المدة', value: duration ? `${duration} (سيتم التفعيل تلقائياً)` : 'غير محددة', inline: true }
        );

        await shop.send({ content: `<@${datap.owner}>`, embeds: [embedlog] });
        await interaction.editReply('**تم تعطيل المتجر بنجاح**');

        // جدولة التفعيل التلقائي إذا تم تحديد مدة
        if (duration) {
            setTimeout(async () => {
                try {
                    await shop.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                        ViewChannel: true,
                    });
                    await db.set(`shop_${shop.id}.status`, "1");
                    await db.delete(`shop_${shop.id}.disableUntil`);

                    const autoEnableEmbed = createStandardEmbed('تم تفعيل المتجر تلقائياً', 'انتهت مدة التعطيل وتم تفعيل المتجر تلقائياً', interaction.guild);
                    await shop.send({ content: `<@${datap.owner}>`, embeds: [autoEnableEmbed] });
                } catch (error) {
                    console.error('خطأ في التفعيل التلقائي:', error);
                }
            }, ms(duration));
        }
    } else if (action === 'check_status') {
        const status = datap.status === "1" ? "مفعل ✅" : "معطل ❌";
        const disableUntil = await db.get(`shop_${shop.id}.disableUntil`);

        const statusEmbed = createStandardEmbed('حالة المتجر', `**الحالة الحالية:** ${status}`, interaction.guild);

        if (disableUntil && disableUntil > Date.now()) {
            statusEmbed.addFields({
                name: 'سيتم التفعيل في:',
                value: `<t:${Math.floor(disableUntil / 1000)}:R>`,
                inline: true
            });
        }

        await interaction.editReply({ embeds: [statusEmbed] });
    }
}

module.exports = { handleDisableCommand };