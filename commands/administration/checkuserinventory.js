const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const noblox = require("noblox.js");
const fs = require('fs');
const users = require(`../../blacklistedusers.json`);

async function getUserInventory(specifiedUser) {
    try {
        return await noblox.getInventory({ userId: specifiedUser, assetTypes: ["Shirt"], sortOrder: "Asc" });
    } catch (error) {
        console.log(error.message);
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkuserinventory')
        .setDescription('Check user\'s inventory.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Input ROBLOX username')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(20)),
    async execute(interaction) {
        if (users.blacklisted.includes(`${interaction.user.id}`)) return;

        // Get the username from the interaction
        const user = interaction.options.getString('username');

        // Fetch user ID
        let userid;
        try {
            userid = await noblox.getIdFromUsername(user);
        } catch (error) {
            const invaliduserembed = new EmbedBuilder()
                .setColor('DarkRed')
                .setTitle('Failed to fetch Roblox user.')
                .setDescription(`> Please enter a valid Roblox username.`);
            await interaction.reply({ embeds: [invaliduserembed], ephemeral: true });
            return;
        }

        // Fetch inventory
        const checkshirts = await getUserInventory(userid);

        if (!checkshirts) {
            const closedinvembed = new EmbedBuilder()
                .setColor('DarkRed')
                .setTitle('Command unable to execute.')
                .setDescription(`**${user}\'s** inventory is closed.`);
            await interaction.reply({ embeds: [closedinvembed], ephemeral: true });
            return;
        }

        // Fetch the Roblox username from the user ID
        const robloxuser = await noblox.getUsernameFromId(userid);

        // Loading embed while processing the inventory
        const loadingembed = new EmbedBuilder()
                        .setColor('012553')
                        .setTitle('Fetching data!') 
                        .setAuthor({
                            iconURL: 'https://media.discordapp.net/attachments/1180544573177602129/1287381340601454664/536b8957e628215c0baefb55c08e3d34.png?ex=66f156cd&is=66f0054d&hm=04690382c8d288a2694237385fc795c5c3b73a384426df390e942f90c65baddd&=&format=webp&quality=lossless&width=537&height=537', 
                            name: 'State Bureau of Investigations'
                        })
                        .setDescription(` > Fetching **${robloxuser}\'s** friends. This may take a while...`)
                        .setFooter({text: 'Do not close this message, do not run a different command.'})
        await interaction.reply({ embeds: [loadingembed], ephemeral: true });

        // Read and parse blacklisted items JSON
        const data = fs.readFileSync('commands/administration/blacklisteditems.json', 'utf8');
        const shirtsJSON = JSON.parse(data);

        // Check for blacklisted shirts
        let gangclothing = false;
        let itemLink = '';

        for (const shirt of checkshirts) {
            const currentAssetId = shirt.assetId.toString(); // Ensure it's a string
            if (shirtsJSON.blacklistedshirts.includes(currentAssetId)) {
                gangclothing = true;
                console.log('gangclothing:', gangclothing);
                console.log('Blacklisted shirt ID:', currentAssetId);
                itemLink = `https://www.roblox.com/catalog/${currentAssetId}`;
                break; // Exit the loop once a blacklisted shirt is found
            }
        }

        // Final embed with results
        const finishedembed = new EmbedBuilder()
            .setColor('012553')
            .setTitle(`${robloxuser} (${userid})`)
            .setAuthor({
                iconURL: 'https://media.discordapp.net/attachments/1180544573177602129/1287381340601454664/536b8957e628215c0baefb55c08e3d34.png?ex=66f156cd&is=66f0054d&hm=04690382c8d288a2694237385fc795c5c3b73a384426df390e942f90c65baddd&=&format=webp&quality=lossless&width=537&height=537', 
                name: 'State Bureau of Investigations'
            })
            .addFields({
                name: 'Gang Uniforms',
                value: gangclothing ? `> User has [gang clothing](${itemLink}) in their inventory.` : '> User is clear.'
            });

        await interaction.editReply({ embeds: [finishedembed], ephemeral: true });
    }
};
