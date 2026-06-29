require("dotenv").config();
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const clientId = process.env.CLIENT_ID || process.env.clientId;
const guildId = process.env.GUILD_ID || process.env.guildId;
const token = process.env.TOKEN || process.env.token;

console.log('Deploy Debug:');
console.log('CLIENT_ID:', clientId ? 'Set' : 'Undefined');
console.log('GUILD_ID:', guildId ? 'Set' : 'Undefined');
console.log('TOKEN:', token ? 'Set' : 'Undefined');

if (!clientId || !guildId || !token) {
    console.error('Error: Missing required environment variables. Please check your .env file.');
    console.error('Required: CLIENT_ID, GUILD_ID, TOKEN');
    process.exit(1);
}

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
	await rest.put(
	    Routes.applicationGuildCommands(clientId, guildId),
	    { body: commands },
	);

	console.log(`Berhasil mendaftarkan '${commandFiles}' ke slash commands`);
	} catch (error) {
	    console.error(error);
	}   

})();