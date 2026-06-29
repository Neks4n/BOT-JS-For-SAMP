const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonStyle,
	ButtonBuilder
} = require('discord.js');

const { clean } = require("../function/utils");
const sampQuery = require("samp-query");

const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = {
	name: 'messageCreate',
	description: 'Untuk mendeteksi text yang ditulis',
	async execute(message) {
		const cmdxe = message.content.toLowerCase();

		if (message.author.bot) return;

		if (message.content.startsWith(">") && message.author.id == process.env.OWNER) {
			const args = message.content.slice(1).trim().split(/ +/);
			const code = args.join(" ");
			try {
				const evaled = eval(code);
				const cleaned = await clean(message.client, evaled);
				message.channel.send(`\`\`\`js\n${cleaned}\n\`\`\``);
			} catch (err) {
				message.channel.send(`\`ERROR\` \`\`\`xl\n${err}\n${code}\`\`\``);
			}
		}

		//Prefix command untuk owner prefixnya kalau mau ubah ganti saja yang "n!"
		const prefix = "n!";
		const prefixRegex = new RegExp(`^(<@!?${message.client.user.id}>|${escapeRegex(prefix)})\\s*`);
		if (!prefixRegex.test(message.content)) return;

		const [, matchedPrefix] = message.content.match(prefixRegex);
		const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
		const command = args.shift().toLowerCase();

		if (message.author.id != process.env.OWNER) return;

		//commadn untuk memangil embed panel account menggunakan "n!initucp"
		if (command === 'initucp') {
			const embed = new EmbedBuilder()
				.setTitle("Neksan Roleplay | Pembuatan Account")
				.setDescription("Channel ini merupakan tempat dimana anda dapat membuat dan mengatur akun UCP anda sendiri. Terdapat beberapa hal yang harus anda ketahui, diantaranya:")
				.setColor("#00ffaa")
				.addFields([
					{ "name": '\u2006', "value": '\u2006' },
					{
						"name": `__🧾Buat UCP__`,
						"value": `> Jika anda belum pernah membuat UCP, silakan ambil dan buat UCP anda.`
					},
					{ "name": '\u2006', "value": '\u2006' },
					{
						"name": `__📍Cek UCP__`,
						"value": `> Kamu dapat melihat status account apakah sudah terverifikasi ataukah belum, anda juga dapat melihat informasi kode verifikasi melalui ini jikalau anda belum menerima DM dari BOT sebelumnya.`
					},
					{ "name": '\u2006', "value": '\u2006' },
					{
						"name": `__❓Reset Password__`,
						"value": `> Sesuai dengan namanya, tombol ini merupakan tempat apabila anda lupa kata sandi atau ingin mengganti kata sandi.`
					},
					{ "name": '\u2006', "value": '\u2006' },
					{
						"name": `__♻️Refund Role__`,
						"value": `> Apabila anda sudah pernah mendaftarkan UCP sebelumnya lalu anda keluar dari discord kami maka anda dapat mengambil kembali role dengan tombol ini.`
					}
				])
				.setImage('https://cdn.discordapp.com/attachments/1400185624497098835/1518640858340130926/Reverie.png?ex=6a4339c3&is=6a41e843&hm=4c0b540f0d41853284c01723a6a1acc40964221fdc14d0a61cee8c1f864c7cd0')
				.setTimestamp();

			const row = new ActionRowBuilder()
				.addComponents([
					new ButtonBuilder()
						.setLabel("Buat UCP")
						.setCustomId("RegisterBTN")
						.setStyle(ButtonStyle.Success)
						.setEmoji("🧾"),
					new ButtonBuilder()
						.setCustomId("ReverifBTN")
						.setLabel("Cek UCP")
						.setStyle(ButtonStyle.Primary)
						.setEmoji("📍"),
					new ButtonBuilder()
						.setCustomId("ChangePWBTN")
						.setLabel("Reset Password")
						.setStyle(ButtonStyle.Danger)
						.setEmoji("❓"),
					new ButtonBuilder()
						.setCustomId("ReAssignBTN")
						.setLabel("Refund Role")
						.setStyle(ButtonStyle.Secondary)
						.setEmoji("♻️")
				]);

			message.channel.send({ embeds: [embed], components: [row] });
		}

		//eval command
		else if (command === "eval") {
			const code = args.join(" ");
			try {
				const evaled = eval(code);
				const cleaned = await clean(evaled);
				message.channel.send(`\`\`\`js\n${cleaned}\n\`\`\``);
			} catch (err) {
				message.channel.send(`\`ERROR\` \`\`\`xl\n${err}\n${code}\`\`\``);
			}
		}
	}
};
