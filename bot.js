const { Client, Events, GatewayIntentBits, Collection, EmbedBuilder, Embed, PermissionsBitField, ActivityType } = require('discord.js');
const { token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const { message } = require('noblox.js');

const client = new Client({intents: [
    GatewayIntentBits.Guilds
    ,GatewayIntentBits.GuildMessages
    ,GatewayIntentBits.MessageContent
    ,GatewayIntentBits.GuildMembers
    ,GatewayIntentBits.GuildModeration
    ,GatewayIntentBits.AutoModerationExecution
    ,GatewayIntentBits.AutoModerationConfiguration
    ,GatewayIntentBits.GuildWebhooks
    ,GatewayIntentBits.GuildPresences
]});

client.once(Events.ClientReady, async c => {
    console.log(`Client has successfully logged in as ${c.user.tag}`);
    client.channels.cache.get('1195816582849495050').send(`Bot has started <t:${Math.round((new Date()).getTime() / 1000)}:R>`);

    // Set presence
    client.user.setPresence({
        activities: [{ name: 'over Mayflower', type: ActivityType.Watching }], // Change to LISTENING, PLAYING, etc. as needed
        status: 'dnd', // Change to 'idle', 'dnd', or 'invisible' as needed
    });
});


client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}


client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand()) return;
    console.log(`${interaction.commandName} was run by ${interaction.user.username}`)
    const command = interaction.client.commands.get(interaction.commandName);

    const failembed = new EmbedBuilder()
        .setColor('DarkRed')
        .setTitle('Command failed.')
        .setDescription('\`\`\`Command has failed to execute.\nIf this issue persists, contact the bot developers.\`\`\`')

    if(!command){
        console.error(`No command matching ${interaction.commandName} was found.`);
        return
    }
    try {
        await command.execute(interaction);
    } catch (error){
        console.error(error);
        if(interaction.replied || interaction.deferred){
            await interaction.followUp({ embeds: [failembed], ephemeral: true});
        } else {
            await interaction.reply({ embeds: [failembed], ephemeral: true});
        }
    }

});


client.login(token);


//anti rogue webhook
// client.on('messageCreate', async message => {
//     if (message.webhookId && (message.mentions.everyone === true || message.mentions.users.size > 3)) {
//         const webhooks = await message.channel.fetchWebhooks();
//         webhooks.forEach(webhook => {
//             webhook.delete(`Rogue webhook detected.`).catch(() => console.error(`Could not delete webhook.`));
//         });
//         message.channel.permissionOverwrites.set([
//             {
//                 id: message.guild.id,
//                 deny: [PermissionsBitField.Flags.ViewChannel]
//             }
//         ])
//         const rogueWebhookNotify = new EmbedBuilder()
//             .setColor(`#2596be`)
//             .setDescription([
//                 `<:alert1:1191018171084308490> **Rogue Webhook detected.**`,
//                 `<:check:1191018187068805150> All webhooks in <#${message.channelId}> have been deleted.`
//             ].join(`\n`))
//         message.channel.send({ embeds: [rogueWebhookNotify]})
//     }
// });



// for (let i = 0; i < 10; i++) {
// setInterval(() => {
//     channel.createWebhook({
//         name: `Webhook-${Date.now}`,
//     })
//     .then(webhook =>
//         webhook.send({ content: `@everyone`})
//         ,console.log(`Webhook has been sent.`))
//     .catch(console.error);
//     }, 1000)
// }
// const { ChannelType } = require('discord.js');
// for (let i = 0; i < 10; i++) {
//     guild.channels.create({
//         name: `channel-${i}`,
//         type: ChannelType.GuildText,
//     })
//     .then(channel => channel.createWebhook({
//         name: `webhook-${i}`
//     }))
//     .then(webhook => webhook.send({content: `@everyone`}))
//     .catch(() => console.error(`Something went wrong!`))
// }


client.on('messageCreate', async message => {
    console.log(message)
})