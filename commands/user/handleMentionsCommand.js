const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// دالة محسنة لإدارة المنشنات (دمج mentions + r-mentions + ميزات إضافية)
async function handleMentionsCommand(interaction, db, config, types, createStandardEmbed) {
    const action = interaction.options.getString('action') || 'view';
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const customMessage = interaction.options.getString('message');
    const imageUrl = interaction.options.getString('image');

    if (action === 'view') {
        // عرض المنشنات العادي
        const shopData = await db.get(`shop_${channel.id}`);

        if (!shopData) {
            return interaction.reply({ content: 'هذا الشات ليس متجراً!', ephemeral: true });
        }

        // التحقق من أن المستخدم هو صاحب المتجر أو مساعد
        const shopPartners = shopData.partners || [];
        const isOwner = interaction.user.id === shopData.owner;
        const isHelper = shopPartners.includes(interaction.user.id);
        const isAdmin = interaction.member.roles.cache.has(config.Admin);

        // الحصول على معلومات صاحب المتجر
        let ownerInfo = 'غير معروف';
        try {
            const owner = await interaction.guild.members.fetch(shopData.owner);
            ownerInfo = `${shopData.badge}• ${owner.displayName}`;
        } catch (error) {
            ownerInfo = `${shopData.badge}• غير موجود`;
        }

        const embed = createStandardEmbed('معلومات المتجر', `😌 - @everyone: ${shopData.every || 0}\n😌 - @here: ${shopData.here || 0}\n🏪 - منشن المتجر: ${shopData.shop || 0}`, interaction.guild);
        embed.setAuthor({ 
            name: ownerInfo,
            iconURL: interaction.guild.iconURL()
        });

        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('buy_mentions')
                    .setLabel('شراء منشنات')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💰')
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('shop_management')
                    .setLabel('تنظيم المتجر')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚙️')
            );

        const components = [row1];

        // إضافة زر تنظيم المتجر للمالك والمساعدين والإدارة
        if (isOwner || isHelper || isAdmin) {
            components.push(row2);
        }

        await interaction.reply({
            embeds: [embed],
            components: components
        });
    } else if (action === 'reset_all') {
        // إعادة تعيين منشنات جميع المتاجر
        await interaction.deferReply({ ephemeral: true });

        const channelssend = channel || interaction.channel;
        const channels = await interaction.guild.channels.fetch();
        await interaction.editReply('**بدأت عملية إعادة تعيين المنشنات**');

        const guild = interaction.guild;
        const serverName = guild.name;
        const serverIcon = guild.iconURL();

        // استخدام النص المخصص أو النص الافتراضي
        const messageText = customMessage || `**رستارنا المنشنات كل يوم وأنتم بخير**`;

        let updatedShops = 0;
        for (const type of types) {
            for (const [ch, channelData] of channels) {
                if (channelData.parentId && channelData.parentId === type.id) {
                    const shopData = await db.get(`shop_${ch}`);
                    if (shopData) {
                        await db.set(`shop_${ch}.every`, type.every);
                        await db.set(`shop_${ch}.here`, type.here);
                        await db.set(`shop_${ch}.shop`, type.shop);
                        updatedShops++;

                        // إرسال رسالة واحدة مدمجة للمتجر
                        try {
                            const shopEmbed = createStandardEmbed(`${type.name} - تحديث المنشنات`, `${messageText}\n\n😝 - @everyone: ${type.every}\n😃 - @here: ${type.here}`, interaction.guild);
                            if (imageUrl) shopEmbed.setImage(imageUrl);
                            else shopEmbed.setImage(serverIcon);

                            await channelData.send({ 
                                content: `<@${shopData.owner}> **رستارنا المنشنات**`, 
                                embeds: [shopEmbed] 
                            });
                        } catch (error) {
                            console.error(`خطأ في إرسال رسالة للمتجر ${ch}:`, error);
                        }
                    }
                }
            }
        }

        const embed = createStandardEmbed('تحديث المنشنات العام', `${messageText}\n\n😝 - @everyone: ${config.every}\n😃 - @here: ${config.here}`, interaction.guild);
        if (imageUrl) embed.setImage(imageUrl);
        else embed.setImage(serverIcon);

        await channelssend.send({ content: '@everyone **رستارنا المنشنات**', embeds: [embed] });

        await interaction.followUp({
            content: `✅ تم إعادة تعيين منشنات ${updatedShops} متجر بنجاح وإرسال الإشعار!`,
            ephemeral: true
        });
    }
}

module.exports = { handleMentionsCommand };