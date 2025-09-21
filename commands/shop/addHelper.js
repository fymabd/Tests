// دالة إضافة وإدارة المساعدين
async function addHelper(interaction, db, config, createStandardEmbed) {
    await interaction.deferReply();

    const action = interaction.options.getString('action');
    const helper = interaction.options.getUser("helper");
    const shop = interaction.options.getChannel("shop");
    const role = interaction.options.getString("role");

    const data = await db.get(`shop_${shop.id}`);
    if (!data) return interaction.editReply("هذه القناة ليست متجر مسجل");

    const existingPartners = data.partners || [];

    if (action === 'add') {
        if (existingPartners.includes(helper.id)) {
            return interaction.editReply("**هذا العضو مساعد بالفعل في هذا المتجر**");
        }

        const shopChannel = await interaction.guild.channels.fetch(shop.id);

        // تحديد الصلاحيات حسب نوع المساعد
        let permissions = {
            ViewChannel: true,
            SendMessages: true,
            EmbedLinks: true,
            AttachFiles: true
        };

        if (role === 'full') {
            permissions.MentionEveryone = true;
            permissions.ManageMessages = true;
        }

        await shopChannel.permissionOverwrites.edit(helper.id, permissions);
        existingPartners.push(helper.id);
        await db.set(`shop_${shop.id}.partners`, existingPartners);

        // إضافة رتبة المساعد
        const helperRole = interaction.guild.roles.cache.get(config.help);
        if (helperRole) {
            await helper.roles.add(helperRole);
        }

        // حفظ نوع المساعد
        const helpersData = await db.get(`shop_${shop.id}.helpersData`) || {};
        helpersData[helper.id] = {
            type: role,
            addedBy: interaction.user.id,
            addedAt: Date.now()
        };
        await db.set(`shop_${shop.id}.helpersData`, helpersData);

        await interaction.editReply(`**تم إضافة ${helper} كمساعد ${role === 'full' ? 'بصلاحيات كاملة' : 'بصلاحيات محدودة'} للمتجر ${shop}**`);

        const addEmbed = createStandardEmbed('✅ تم إضافة مساعد جديد', `تم إضافة ${helper} كمساعد للمتجر`, interaction.guild);
        addEmbed.addFields(
            { name: 'المساعد:', value: `<@${helper.id}>`, inline: true },
            { name: 'نوع الصلاحية:', value: role === 'full' ? 'كاملة' : 'محدودة', inline: true },
            { name: 'أضيف بواسطة:', value: `<@${interaction.user.id}>`, inline: true }
        );
        await shopChannel.send({ embeds: [addEmbed] });

    } else if (action === 'remove') {
        if (!existingPartners.includes(helper.id)) {
            return interaction.editReply("**هذا العضو ليس مساعد في هذا المتجر**");
        }

        const shopChannel = await interaction.guild.channels.fetch(shop.id);
        await shopChannel.permissionOverwrites.delete(helper.id);

        const updatedPartners = existingPartners.filter(partnerId => partnerId !== helper.id);
        await db.set(`shop_${shop.id}.partners`, updatedPartners);

        // إزالة بيانات المساعد
        const helpersData = await db.get(`shop_${shop.id}.helpersData`) || {};
        delete helpersData[helper.id];
        await db.set(`shop_${shop.id}.helpersData`, helpersData);

        // إزالة رتبة المساعد إذا لم يكن مساعد في متاجر أخرى
        const helperRole = interaction.guild.roles.cache.get(config.help);
        if (helperRole) {
            // التحقق من المتاجر الأخرى
            const channels = await interaction.guild.channels.fetch();
            let isHelperElsewhere = false;

            for (const [channelId, channel] of channels) {
                const otherShopData = await db.get(`shop_${channelId}`);
                if (otherShopData && otherShopData.partners && otherShopData.partners.includes(helper.id)) {
                    isHelperElsewhere = true;
                    break;
                }
            }

            if (!isHelperElsewhere) {
                await helper.roles.remove(helperRole);
            }
        }

        await interaction.editReply(`**تم إزالة ${helper} من مساعدي المتجر ${shop}**`);
        await shopChannel.send(`**تم إزالة ${helper} من مساعدي المتجر**`);

    } else if (action === 'list') {
        if (existingPartners.length === 0) {
            return interaction.editReply("**هذا المتجر لا يحتوي على مساعدين**");
        }

        const helpersData = await db.get(`shop_${shop.id}.helpersData`) || {};
        let helpersList = '';

        for (let i = 0; i < existingPartners.length; i++) {
            const helperId = existingPartners[i];
            const helperData = helpersData[helperId] || {};
            const helperType = helperData.type === 'full' ? '🔥 كاملة' : '⚡ محدودة';
            const addedDate = helperData.addedAt ? `<t:${Math.floor(helperData.addedAt / 1000)}:R>` : 'غير معروف';

            helpersList += `**${i + 1}.** <@${helperId}> - ${helperType} - ${addedDate}\n`;
        }

        const listEmbed = createStandardEmbed(`👥 مساعدي المتجر (${existingPartners.length})`, helpersList, interaction.guild);
        listEmbed.addFields(
            { name: 'المالك:', value: `<@${data.owner}>`, inline: true },
            { name: 'عدد المساعدين:', value: existingPartners.length.toString(), inline: true }
        );

        await interaction.editReply({ embeds: [listEmbed] });
    }
}

module.exports = { addHelper };