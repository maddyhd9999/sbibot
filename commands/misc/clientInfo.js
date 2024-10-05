const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")
const users = require(`../../blacklistedusers.json`)


module.exports = {
    data: new SlashCommandBuilder()
        .setName('clientinfo')
        .setDescription('Get information about the bot\'s client.'),
    async execute(interaction){
        if(users.blacklisted.includes(`${interaction.user.id}`)) return
        const embed = new EmbedBuilder()
            .setColor('012553')
            .setTitle('Bot latency!')
            .setAuthor({
                iconURL: 'https://media.discordapp.net/attachments/1180544573177602129/1287381340601454664/536b8957e628215c0baefb55c08e3d34.png?ex=66f156cd&is=66f0054d&hm=04690382c8d288a2694237385fc795c5c3b73a384426df390e942f90c65baddd&=&format=webp&quality=lossless&width=537&height=537', 
                name: 'State Bureau of Investigations'
            })
            .setDescription(`> Pinging...`)
        const reply1 = await interaction.reply({embeds: [ embed ], fetchReply: true, ephemeral: true})
        const embed2 = new EmbedBuilder()
            .setColor('012553')
            .setTitle('Bot latency')
            .setAuthor({
                iconURL: 'https://media.discordapp.net/attachments/1180544573177602129/1287381340601454664/536b8957e628215c0baefb55c08e3d34.png?ex=66f156cd&is=66f0054d&hm=04690382c8d288a2694237385fc795c5c3b73a384426df390e942f90c65baddd&=&format=webp&quality=lossless&width=537&height=537', 
                name: 'State Bureau of Investigations'
            })
            .addFields(
                {name: 'Bot uptime', value: `\`\`\`${Math.round(interaction.client.uptime / 6000)}s\`\`\``, inline: true},
                {name: 'Client latency', value: `\`\`\`${reply1.createdTimestamp - interaction.createdTimestamp}ms\`\`\``, inline: true},
                {name: 'Websocket Heartbeat', value: `\`\`\`${interaction.client.ws.ping}ms\`\`\``, inline: true},
            );
        await interaction.editReply({embeds: [ embed2 ], ephemeral: true})
    }
}   