const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const users = require(`../../blacklistedusers.json`)


module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('say some silly stuff')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message you want the bot to say')
                .setRequired(true)),
    async execute(interaction){
        const msg = interaction.options.getString(`message`)
        const channel = interaction.channel
        channel.send(msg)
        interaction.reply({ content: `message sent`, ephemeral: true})
    }
}