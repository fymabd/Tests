const { ChannelType } = require('discord.js');

// دالة إنشاء متجر
async function createShop(interaction, db, config, types, createStandardEmbed) {
    await interaction.deferReply();

    const type = types.find(t => t.id === interaction.options.getString('type'));
    const name = interaction.options.getString('name').replaceAll(' ', '・');
    const owner = interaction.options.getUser('owner');

    if (!type) {
        return interaction.editReply('نوع المتجر غير صحيح!');
    }

    const adminRole = interaction.guild.roles.cache.get(config.Admin);
    const shopRole = interaction.guild.roles.cache.get(type.role);

    try {
        const channel = await interaction.guild.channels.create({
            name: `${type.badge}${config.prefix}${name}`,
            type: ChannelType.GuildText,
            parent: type.id,
            permissionOverwrites: [
                {
                    id: owner.id,
                    allow: ['SendMessages', 'MentionEveryone', 'EmbedLinks', 'AttachFiles', 'ViewChannel']
                },
                {
                    id: interaction.guild.roles.everyone,
                    deny: ['SendMessages'],
                    allow: ['ViewChannel']
                },
                {
                    id: adminRole.id,
                    allow: ['SendMessages', 'MentionEveryone', 'EmbedLinks', 'AttachFiles', 'ViewChannel']
                }
            ]
        });

        const timestamp = Math.floor(Date.now() / 1000);

        await db.set(`shop_${channel.id}`, {
            owner: owner.id,
            type: type.role,
            shop: type.shop,
            every: type.every,
            here: type.here,
            date: `<t:${timestamp}:R>`,
            status: "1",
            warns: 0,
            badge: type.badge
        });

        if (shopRole) {
            await interaction.guild.members.cache.get(owner.id).roles.add(shopRole);
        }

        const embed = createStandardEmbed('معلومات المتجر', `**المنشنات:**\n• everyone: ${type.every}\n• here: ${type.here}`, interaction.guild);
        embed.addFields(
            { name: 'صاحب المتجر', value: `<@${owner.id}>`, inline: true },
            { name: 'نوع المتجر', value: `<@&${type.role}>`, inline: true },
            { name: 'تاريخ الإنشاء', value: `<t:${timestamp}:R>`, inline: true }
        );

        await channel.send({ embeds: [embed] });
        await interaction.editReply({ content: `تم إنشاء المتجر بنجاح ${channel}`, embeds: [embed] });

        // إرسال لوج
        const logChannel = interaction.guild.channels.cache.get(config.commandlog);
        if (logChannel) {
            const logEmbed = createStandardEmbed('تم إنشاء متجر', `المسؤول: <@${interaction.user.id}>`, interaction.guild);
            logEmbed.addFields(
                { name: 'المتجر', value: `<#${channel.id}>`, inline: true },
                { name: 'النوع', value: `<@&${type.role}>`, inline: true },
                { name: 'المالك', value: `<@${owner.id}>`, inline: true }
            );

            await logChannel.send({ embeds: [logEmbed] });
        }

    } catch (error) {
        console.error('خطأ في إنشاء المتجر:', error);
        await interaction.editReply('حدث خطأ أثناء إنشاء المتجر!');
    }
}

module.exports = { createShop };