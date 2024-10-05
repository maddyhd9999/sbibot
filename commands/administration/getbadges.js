const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const noblox = require("noblox.js");
const users = require(`../../blacklistedusers.json`);

const MAX_EMBED_SIZE = 4096; // Discord embed field value size limit

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getbadges')
        .setDescription('Get badge information about a user.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Input ROBLOX username')
                .setRequired(true)
                .setMaxLength(25)),
    async execute(interaction) {
        if (users.blacklisted.includes(`${interaction.user.id}`)) return;

        let user = interaction.options.getString('username');

        const embed = new EmbedBuilder()
            .setColor('012553')
            .setTitle('Fetching data!')
            .setAuthor({
                iconURL: 'https://media.discordapp.net/attachments/1180544573177602129/1287381340601454664/536b8957e628215c0baefb55c08e3d34.png',
                name: 'State Bureau of Investigations'
            })
            .setDescription(` > Fetching badges. This may take a while...`)
            .setFooter({ text: 'Do not close this message, do not run a different command.' });

        await interaction.reply({ embeds: [embed], ephemeral: true });

        try {
            const userid = await noblox.getIdFromUsername(user);
            const robloxuser = await noblox.getUsernameFromId(userid);
        
            // Fetch user's badges
            const response = await axios.get(`https://badges.roblox.com/v1/users/${userid}/badges?limit=25&sortOrder=Desc`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        
            const badges = response.data.data;
        
            // Extract badge IDs
            const badgeIds = badges.map(badge => badge.id).join(',');
        
            // Fetch awarded dates for badges
            const awardedDateResponse = await axios.get(`https://badges.roblox.com/v1/users/${userid}/badges/awarded-dates?badgeIds=${badgeIds}`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        
            // Debugging: Log the awarded date response
            console.log("Awarded Dates Response:", awardedDateResponse.data);
        
            if (awardedDateResponse.data && Array.isArray(awardedDateResponse.data)) {
                // Create a map of awarded dates
                const awardedDatesMap = new Map();
                awardedDateResponse.data.forEach(badge => {
                    awardedDatesMap.set(badge.badgeId, badge.awardedDate);
                });
        
                let badgeInfo = '';
                badges.forEach((badge) => {
                    // Find the awarded date for this badge using the map
                    const awardedDate = awardedDatesMap.has(badge.id)
                        ? new Date(awardedDatesMap.get(badge.id)).toLocaleDateString()
                        : "Not Awarded";
            
                    badgeInfo += `**Badge Name**: ${badge.name}\n`;
                    badgeInfo += `**Awarded Count**: \`${badge.awardedCount}\`\n`;
                    badgeInfo += `**Awarded Date**: *\`${awardedDate}\`*\n\n`;
                });

                const badgeChunks = badgeInfo.match(new RegExp(`(.|\\n){1,${MAX_EMBED_SIZE}}`, 'g')) || [];
                const badgeEmbed = new EmbedBuilder()
                    .setColor('012553')
                    .setTitle(`${robloxuser} (${userid})`)
                    .setAuthor({
                        iconURL: 'https://media.discordapp.net/attachments/1180544573177602129/1287381340601454664/536b8957e628215c0baefb55c08e3d34.png?ex=66f156cd&is=66f0054d&hm=04690382c8d288a2694237385fc795c5c3b73a384426df390e942f90c65baddd&=&format=webp&quality=lossless&width=537&height=537', 
                        name: 'State Bureau of Investigations'
                    })
                    .addFields({
                        name: 'Badges fetched:',
                        value: `\`\`\`${badges.length} badges. Please check inventory for possible badgewalks.\`\`\``
                    });
            
        
                await interaction.editReply({ embeds: [badgeEmbed], ephemeral: true });

                for (const chunk of badgeChunks) {
                    const badgeListEmbed = new EmbedBuilder()
                        .setColor('012553')
                        .setTitle('Badge Details')
                        .setAuthor({
                            iconURL: 'https://media.discordapp.net/attachments/1180544573177602129/1287381340601454664/536b8957e628215c0baefb55c08e3d34.png?ex=66f156cd&is=66f0054d&hm=04690382c8d288a2694237385fc795c5c3b73a384426df390e942f90c65baddd&=&format=webp&quality=lossless&width=537&height=537', 
                            name: 'State Bureau of Investigations'
                        })
                        .setDescription(chunk);
                    await interaction.followUp({ embeds: [badgeListEmbed], ephemeral: true });
                }
            } else {
                console.error('Awarded dates response is not in the expected format:', awardedDateResponse.data);
                const errorEmbed = new EmbedBuilder()
                    .setColor('DarkRed')
                    .setTitle('Invalid Response')
                    .setDescription('The awarded dates response is not in the expected format.');
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            }
        
        } catch (error) {
            console.error('Error fetching badge data:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('DarkRed')
                .setTitle('Failed to fetch badge data')
                .setDescription('An error occurred while trying to fetch the user or badge data.');
            await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        }
        
        
    }
};
