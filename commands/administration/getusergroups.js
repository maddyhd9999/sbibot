const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const noblox = require("noblox.js");
const users = require(`../../blacklistedusers.json`)


module.exports = {
    data: new SlashCommandBuilder()
        .setName('getusergroups')
        .setDescription('Get groups a user is in.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Input ROBLOX username')
                .setRequired(true)
                .setMaxLength(25)),
    async execute(interaction) {
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
        const groups = await noblox.getGroups(userid);
        const robloxuser = await noblox.getUsernameFromId([`${userid}`]);

        const fields = groups.map((group) => {
            const groupName = group.Name;
            const role = String(group.Role);
            const groupId = String(group.Id);
            const memberCount = String(group.MemberCount);

            return {
                name: `**${groupName}**`,
                value: `\n \`\`Rank:\`\` ${role}\n \`\`Link:\`\` [Group Link](https://www.roblox.com/groups/${groupId}) \n \`\`Group membercount:\`\` ${memberCount}`,
                inline: true,
            };
        });

        const chunkSize = 25;
        const fieldChunks = [];
        for (let i = 0; i < fields.length; i += chunkSize) {
            fieldChunks.push(fields.slice(i, i + chunkSize));
        }

        const processingembed = new EmbedBuilder()
            .setColor('012553')
            .setAuthor({
                iconURL: 'https://media.discordapp.net/attachments/1180544573177602129/1287381340601454664/536b8957e628215c0baefb55c08e3d34.png?ex=66f156cd&is=66f0054d&hm=04690382c8d288a2694237385fc795c5c3b73a384426df390e942f90c65baddd&=&format=webp&quality=lossless&width=537&height=537', 
                name: 'State Bureau of Investigations'
            })
            .setTitle('Roblox Group Data!')
            .setDescription(`\`\`\`Fetching usergroup\'s data...\`\`\``)
        const reply = await interaction.reply({ embeds: [processingembed] , ephemeral: true });

        for (const [index, chunk] of fieldChunks.entries()) {
            const embed = new EmbedBuilder()
                .setColor('012553')
                .setTitle(`${robloxuser} (${userid})'s group information (Part ${index + 1})`)
                .addFields(chunk)
                .setFooter({ iconURL: 'https://media.discordapp.net/attachments/1180544573177602129/1287381340601454664/536b8957e628215c0baefb55c08e3d34.png?ex=66f156cd&is=66f0054d&hm=04690382c8d288a2694237385fc795c5c3b73a384426df390e942f90c65baddd&=&format=webp&quality=lossless&width=537&height=537', text: 'State Bureau of Investigations' });

            if (index === 0) {
                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.followUp({ embeds: [embed], ephemeral: true });
            }
        }
    }
};