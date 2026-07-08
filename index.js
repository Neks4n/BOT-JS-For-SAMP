require("dotenv").config();
const fs = require('fs');
const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');

const client = new Client({
    presence: {
        status: 'dnd',
        afk: false
    },
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildPresences,
    ]
});

client.commands = new Collection();

//Load Slahs command
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    console.log("[Command] : Load Command", file);
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

require('./deploy.js');

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    console.log("[Event] : Load Event", file);
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.once('ready', () => {
    console.log(`[READY] Logged in as ${client.user.tag}`);
    
    client.user.setActivity(`Neksan Roleplay`, {
        type: ActivityType.Playing
    });
});

client.login(process.env.TOKEN_BOT);