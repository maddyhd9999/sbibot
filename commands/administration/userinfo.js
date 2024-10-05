const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const noblox = require("noblox.js");
const users = require(`../../blacklistedusers.json`)


module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get information about a user.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Input ROBLOX username')
                .setRequired(true)
                .setMaxLength(25)),
    async execute(interaction){
        if(users.blacklisted.includes(`${interaction.user.id}`)) return
        let user = interaction.options.getString('username');
        const userid = await noblox.getIdFromUsername([`${user}`]);

        if(!userid){
            const invaliduserembed = new EmbedBuilder()
                .setColor('DarkRed')
                .setTitle('Failed to fetch Roblox user.')
                .setDescription(`> Please enter a valid Roblox username.`)
                await interaction.reply({embeds: [ invaliduserembed ], fetchReply: true, ephemeral: true})
                return
            }
        const robloxuser = await noblox.getUsernameFromId([`${userid}`]);
        const playerinfo = await noblox.getPlayerInfo([`${userid}`]);
        const avatarUrl = await noblox.getPlayerThumbnail(userid, '150x150', 'png', false, 'Headshot');
        let oldname = playerinfo.oldNames
        let userdesc = playerinfo.blurb
        if(oldname.length > 0){console.log('yay it fucking works')} else {oldname = "None"}
        if(userdesc.length > 0){userdesc = playerinfo.blurb} else {userdesc = "Description is not available."}
        const embed = new EmbedBuilder()
            .setColor('012553')
            .setAuthor({
                iconURL: 'https://media.discordapp.net/attachments/1180544573177602129/1287381340601454664/536b8957e628215c0baefb55c08e3d34.png?ex=66f156cd&is=66f0054d&hm=04690382c8d288a2694237385fc795c5c3b73a384426df390e942f90c65baddd&=&format=webp&quality=lossless&width=537&height=537', 
                name: 'State Bureau of Investigations'
            })
            .setTitle('Roblox Data!')
            .setDescription(`> Fetching userinfo data...`)
        const reply1 = await interaction.reply({embeds: [ embed ], fetchReply: true, ephemeral: true})
        const embed2 = new EmbedBuilder()
            .setColor('012553')
            .setTitle(`${robloxuser} (${userid})`)
            .setAuthor({
                iconURL: 'https://media.discordapp.net/attachments/1180544573177602129/1287381340601454664/536b8957e628215c0baefb55c08e3d34.png?ex=66f156cd&is=66f0054d&hm=04690382c8d288a2694237385fc795c5c3b73a384426df390e942f90c65baddd&=&format=webp&quality=lossless&width=537&height=537', 
                name: 'State Bureau of Investigations'
            })
            .addFields(
                {name: 'Username', value: `\`\`\`${robloxuser}\`\`\``, inline: true},
                {name: 'Display Name', value: `\`\`\`${playerinfo.displayName}\`\`\``, inline: true},
                {name: 'User ID', value: `\`\`\`${userid}\`\`\``, inline: true},
                {name: 'Account Age', value: `\`\`\`${playerinfo.age}\`\`\``, inline: true},
                {name: 'Creation Date', value: `\`\`\`${playerinfo.joinDate}\`\`\``},
                {name: 'Friends', value: `\`\`\`${playerinfo.friendCount}\`\`\``, inline: true},
                {name: 'Followers', value: `\`\`\`${playerinfo.followerCount}\`\`\``, inline: true},
                {name: 'Following', value: `\`\`\`${playerinfo.followingCount}\`\`\``, inline: true},
                {name: 'Description', value: `\`\`\`${userdesc}\`\`\``},
                {name: 'Past Usernames', value: `\`\`\`${oldname}\`\`\``},
            )
            .setThumbnail(`${avatarUrl[0].imageUrl}`)
            await interaction.editReply({embeds: [ embed2 ], ephemeral: true})
    } 
} 
