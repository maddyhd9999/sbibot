const { SlashCommandBuilder, MessageEmbed, EmbedBuilder } = require("discord.js");
const noblox = require("noblox.js");
const fs = require('fs');
const users = require(`../../blacklistedusers.json`)


module.exports = {
    data: new SlashCommandBuilder()
        .setName('getuserfriends')
        .setDescription('Get user\'s friends.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Input ROBLOX username')
                .setRequired(true)
                .setMaxLength(25)),
    async execute(interaction) {
        if(users.blacklisted.includes(`${interaction.user.id}`)) return
        try {
            console.log('Command executed!');

            const suspectsData = fs.readFileSync('commands/administration/suspects.json', 'utf8');
            const suspects = JSON.parse(suspectsData).suspects;

            let user = interaction.options.getString('username');
            const userId = await noblox.getIdFromUsername(user);
            const robloxuser = await noblox.getUsernameFromId([`${userId}`]);
            const userFriends = await noblox.getFriends(userId);


            if (typeof userFriends === 'object' && userFriends.data) {
                const friendsData = userFriends.data;
                let description = 'List of friends:\n';
                let suspectCount = 0;
                let totalCount = 0;

                for (const friendId in friendsData) {
                    const friend = friendsData[friendId];
                    const name = friend.name;

                    totalCount++;

                    if (suspects.includes(name)) {
                        description += `\`\` *** ${name} ***\`\`\n`; // Highlight the suspect username
                        suspectCount++;
                    } else {
                        description += `${name}\n`;
                    }
                }

                const loadingembed = new EmbedBuilder()
                        .setColor('012553')
                        .setTitle('Fetching data!') 
                        .setAuthor({
                            iconURL: 'https://media.discordapp.net/attachments/1180544573177602129/1287381340601454664/536b8957e628215c0baefb55c08e3d34.png?ex=66f156cd&is=66f0054d&hm=04690382c8d288a2694237385fc795c5c3b73a384426df390e942f90c65baddd&=&format=webp&quality=lossless&width=537&height=537', 
                            name: 'State Bureau of Investigations'
                        })
                        .setDescription(` > Fetching **${robloxuser}\'s** friends. This may take a while...`)
                        .setFooter({text: 'Do not close this message, do not run a different command.'})
                await interaction.reply({embeds: [ loadingembed ], ephemeral: true})

                const suspectPercentage = (suspectCount / totalCount) * 100;
                const embed = new EmbedBuilder()
                    .setColor('012553')
                    .setTitle(`${robloxuser} (${userId})\'s friend list`)
                    .setAuthor({
                        iconURL: 'https://media.discordapp.net/attachments/1180544573177602129/1287381340601454664/536b8957e628215c0baefb55c08e3d34.png?ex=66f156cd&is=66f0054d&hm=04690382c8d288a2694237385fc795c5c3b73a384426df390e942f90c65baddd&=&format=webp&quality=lossless&width=537&height=537', 
                        name: 'State Bureau of Investigations'
                    })
                    .setDescription(description)
                    .addFields(
                        {name: 'Percentage of \'criminals\' among friends:', value: `${suspectPercentage.toFixed(2)}%`}
                    )
                // Reply to the interaction with the embed
                await interaction.editReply({ embeds: [embed] });
            } else {
                console.log('Invalid or unexpected userFriends object structure.');
                // Handle the unexpected data structure here
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
};