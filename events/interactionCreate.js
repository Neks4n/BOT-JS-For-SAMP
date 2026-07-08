const wait = require('node:timers/promises').setTimeout;
const {
    ModalBuilder,
    TextInputBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    TextInputStyle,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    MessageFlags
} = require("discord.js");

const con = require("../function/mysql");

module.exports = {
    name: 'interactionCreate',
    description: 'Untuk mendeteksi jika ada interaksi yang dilakukan oleh user',
    async execute(interaction) {
        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                console.error(`'${interaction.user.tag}' Menggunakan Command '${command.data.name}'`);
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                return interaction.reply({ content: 'Command masih dalam pengembangan', flags: MessageFlags.Ephemeral });
            }
        }
        else if (interaction.isButton()) {
            switch (interaction.customId) {
                case "RegisterBTN": {
                    const modal = new ModalBuilder()
                        .setCustomId('AccRegisterModal')
                        .setTitle('Pendaftaran');

                    const Username = new TextInputBuilder()
                        .setCustomId('Username')
                        .setLabel('Nama UCP')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('Masukkan nama UCP anda')
                        .setRequired(true);

                    const firstActionRow = new ActionRowBuilder().addComponents(Username);
                    modal.addComponents(firstActionRow);

                    await interaction.showModal(modal);
                    console.log(`'${interaction.user.tag}' Registering Account`);
                    return;
                }

                case "ReverifBTN": {
                    await interaction.reply({ content: `:ok: Permintaan sedang diproses, mohon tunggu!`, flags: MessageFlags.Ephemeral });

                    mysqlConnection.getConnection(async function (err, con) {
                        try {
                            let [row, field] = await con.promise().query(`SELECT ucp, verify FROM \`whitelists\` WHERE discordid = ?;`, [interaction.member.user.id]);
                            if (row.length < 1) {
                                await wait(4000);

                                const embedda = new EmbedBuilder()
                                    .setTitle("Cek Account | Neksan Roleplay")
                                    .setDescription(`**:x: Error!**\n> Sepertinya anda belum pernah membuat UCP!`)
                                    .setColor("#00ffaa")
                                    .setTimestamp();

                                await interaction.editReply({ content: ``, embeds: [embedda], flags: MessageFlags.Ephemeral });
                                con.release();
                                return;
                            }

                            let InfoEmbed;

                            if (row[0].verify == -1) {
                                InfoEmbed = new EmbedBuilder()
                                    .setTitle("Cek Account | Neksan Roleplay")
                                    .setDescription(`**:white_check_mark: Berhasil!**\nBerikut adalah detail dari UCP anda:`)
                                    .addFields({ name: "Nama UCP", value: row[0].ucp })
                                    .addFields({ name: "Status", value: "Terverifikasi" })
                                    .addFields({ name: "Note", value: "Jangan beritahu informasi ini kepada orang lain!" })
                                    .setColor("#00ffaa")
                                    .setTimestamp();
                            }
                            else if (row[0].verify != -1) {
                                InfoEmbed = new EmbedBuilder()
                                    .setTitle("Cek Account | Neksan Roleplay")
                                    .setDescription(`**:white_check_mark: Berhasil!**\nBerikut adalah detail dari akun UCP anda:`)
                                    .addFields({ name: "Nama UCP", value: row[0].ucp })
                                    .addFields({ name: "Status", value: "Tidak Terverifikasi" })
                                    .addFields({ name: "Code", value: row[0].verify.toString() })
                                    .addFields({ name: "Note", value: "Jangan beritahu informasi ini kepada orang lain!" })
                                    .setColor("#00ffaa")
                                    .setTimestamp();
                            }

                            let DontSent = false;

                            await interaction.user.send({ content: ``, embeds: [InfoEmbed] }).catch(() => {
                                const embeddb = new EmbedBuilder()
                                    .setTitle("Cek Account | Neksan Roleplay")
                                    .setDescription(`**:x: Error!**\n> Sepertinya anda tidak bisa menerima DM dari bot ini!\n> Pergi ke pengaturan akun Discord kamu -> Privacy & Settings -> Allow DM from Server Members (centang)`)
                                    .setColor("#00ffaa")
                                    .setTimestamp();

                                interaction.editReply({ content: ``, embeds: [embeddb], flags: MessageFlags.Ephemeral });
                                DontSent = true;
                            });

                            if (DontSent == false) {
                                const embeddc = new EmbedBuilder()
                                    .setTitle("Cek Account | Neksan Roleplay")
                                    .setDescription(`**:white_check_mark: Berhasil!**\n> Kami telah mengirimkan DM kepada anda, silahkan dibuka!`)
                                    .setColor("#00ffaa")
                                    .setTimestamp();

                                await interaction.editReply({ content: ``, embeds: [embeddc], flags: MessageFlags.Ephemeral });
                            }

                            con.release();
                        } catch (e) {
                            console.log(e);
                            con.release();
                            return;
                        }
                    });

                    console.log(`'${interaction.user.tag}' Cek UCP Called`);
                    return;
                }

                case "ChangePWBTN": {
                    const row = new ActionRowBuilder().setComponents(
                        new ButtonBuilder()
                            .setCustomId("cancel")
                            .setLabel("Batal")
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setLabel('Ya')
                            .setCustomId('confirm')
                            .setStyle(ButtonStyle.Danger)
                    );

                    const confirmMsg = await interaction.reply({
                        content: "Apakah anda yakin ingin melanjutkan?",
                        components: [row],
                        fetchReply: true,
                        flags: MessageFlags.Ephemeral
                    });

                    const collector = confirmMsg.createMessageComponentCollector({
                        filter: i => i.user.id === interaction.user.id,
                        componentType: ComponentType.Button,
                        time: 15000
                    });

                    collector.on('collect', async i => {
                        if (i.customId === 'cancel') {
                            await interaction.followUp({ content: ":ok: Berhasil dibatalkan!", flags: MessageFlags.Ephemeral });
                            return;
                        }
                        else if (i.customId === 'confirm') {
                            await i.reply({ content: ":ok: Mohon tunggu kami sedang memprosesnya...", flags: MessageFlags.Ephemeral });

                            mysqlConnection.getConnection(async (err, connection) => {
                                if (err) throw err;

                                let [rows, fields] = await connection.promise().query(
                                    "SELECT * FROM `whitelists` WHERE `discordid`=? LIMIT 1",
                                    [interaction.user.id]
                                );

                                if (rows.length == 0) {
                                    const embedbagong = new EmbedBuilder()
                                        .setTitle("Reset Password | Neksan Roleplay")
                                        .setDescription(`**:x: Error!**\n> Anda tidak memiliki UCP!`)
                                        .setColor("#00ffaa")
                                        .setTimestamp();

                                    interaction.followUp({ content: ``, embeds: [embedbagong], flags: MessageFlags.Ephemeral });
                                    return;
                                }

                                let code = Math.floor(Math.random() * 99999) + 10000;

                                await connection.promise().query(
                                    "UPDATE `whitelists` SET `recovery` = ? WHERE `discordid` = ?",
                                    [code, interaction.user.id]
                                );

                                let embedrol = new EmbedBuilder()
                                    .setTitle("Reset Password | Neksan Roleplay")
                                    .setDescription(`**:warning: Peringatan!**\nAnda telah meminta layanan lupa password.\nJika ini bukan permintaan anda, maka abaikan saja pesan ini!`)
                                    .addFields([
                                        { name: "Kode Pemulihan:", value: '```' + code + '```Masuklah ke server dan masukkan Kode Pemulihan untuk membuat ulang kata sandi!' }
                                    ])
                                    .setColor("#00ffaa");

                                interaction.user.send({ content: ``, embeds: [embedrol] }).catch(() => {
                                    const embedtot = new EmbedBuilder()
                                        .setTitle("Reset Password | Neksan Roleplay")
                                        .setDescription(`**:x: Error!**\n> Sepertinya anda tidak bisa menerima DM dari bot ini!\n> Pergi ke pengaturan akun discord kamu -> Privacy & Settings -> Allow DM from Server Members (centang)`)
                                        .setColor("#00ffaa")
                                        .setTimestamp();

                                    interaction.followUp({ content: ``, embeds: [embedtot], flags: MessageFlags.Ephemeral });
                                });

                                const embedol = new EmbedBuilder()
                                    .setTitle("Reset Password | Neksan Roleplay")
                                    .setDescription(`**:white_check_mark: Berhasil!**\n> Kami telah mengirimkan DM kepada anda, silahkan dibuka!`)
                                    .setColor("#00ffaa")
                                    .setTimestamp();

                                interaction.followUp({ content: ``, embeds: [embedol], flags: MessageFlags.Ephemeral });
                            });

                            return;
                        }
                    });

                    console.log(`'${interaction.user.tag}' Forget Pass Called`);
                    return;
                }

                case "ReAssignBTN": {
                    await interaction.reply({ content: `:ok: Permintaan sedang diproses, mohon tunggu!`, flags: MessageFlags.Ephemeral });

                    mysqlConnection.getConnection(async function (err, con) {
                        try {
                            let [row, field] = await con.promise().query(`SELECT ucp, verify FROM \`whitelists\` WHERE discordid = ?;`, [interaction.member.user.id]);
                            if (row.length < 1) {
                                await wait(4000);

                                const embedda = new EmbedBuilder()
                                    .setTitle("Cek Account | Neksan Roleplay")
                                    .setDescription(`**:x: Error!**\n> Anda belum pernah mendaftarkan UCP!`)
                                    .setColor("#00ffaa")
                                    .setTimestamp();

                                await interaction.editReply({ content: ``, embeds: [embedda], flags: MessageFlags.Ephemeral });
                                con.release();
                                return;
                            }

interaction.member.roles.add(process.env.ROLE_REFUND_ID).catch(() => {
                                console.log(`Cannot Add Role`);
                            });

                            interaction.member.setNickname(`Warga | ${row[0].ucp.toString()}`).catch(() => {
                                console.log(`Cannot change nickname to ${row[0].ucp}`);
                            });

                            await interaction.editReply({
                                content: `:white_check_mark: UCP anda adalah **${row[0].ucp}** dan proses refund role telah berhasil!`,
                                flags: MessageFlags.Ephemeral
                            });

                            con.release();
                        } catch (e) {
                            if (err) console.log(err);
                            console.log(e);
                            con.release();
                            return;
                        }
                    });

                    console.log(`'${interaction.user.tag}' Refund Role Called`);
                    return;
                }
            }
        }
        else if (interaction.isModalSubmit()) {
            switch (interaction.customId) {
                case "AccRegisterModal": {
                    await interaction.reply({ content: `:ok: Pendaftaran sedang diproses, mohon tunggu!`, flags: MessageFlags.Ephemeral });
                    console.error(`'${interaction.user.tag}' Register Modal Called`);

                    let username = interaction.fields.getTextInputValue('Username');
                    if (username.length < 4 || username.length > 24) {
                        await wait(4000);
                        const embedmek = new EmbedBuilder()
                            .setTitle("Buat UCP | Neksan Roleplay")
                            .setDescription(`**:x: Error!**\n> Nama UCP anda harus 4 s/d 24 karakter!`)
                            .setColor("#00ffaa")
                            .setTimestamp();

                        await interaction.editReply({ content: ``, embeds: [embedmek], flags: MessageFlags.Ephemeral });
                        return;
                    }

                    if (!/^[a-zA-Z0-9]*$/gi.test(username) || username.includes(" ")) {
                        await wait(4000);
                        const embemem = new EmbedBuilder()
                            .setTitle("Buat UCP | Neksan Roleplay")
                            .setDescription(`**:x: Error!**\n> Nama UCP anda hanya dapat huruf dan angka tidak boleh simbol atau spasi!`)
                            .setColor("#00ffaa")
                            .setTimestamp();

                        await interaction.editReply({ content: ``, embeds: [embemem], flags: MessageFlags.Ephemeral });
                        return;
                    }

                    mysqlConnection.getConnection(async function (err, con) {
                        if (err) throw err;

                        let Blocker = false;

                        try {
                            let [row, field] = await con.promise().query(
                                `SELECT * FROM \`whitelists\` WHERE discordid = ?;`,
                                [interaction.member.user.id]
                            );

                            if (row.length > 0) {
                                Blocker = true;
                                await wait(4000);
                                const embedito = new EmbedBuilder()
                                    .setTitle("Buat UCP | Neksan Roleplay")
                                    .setDescription(`**:x: Error!**\n> Anda sudah mendaftarkan UCP dan tidak dapat melakukannya lagi!`)
                                    .setColor("#00ffaa")
                                    .setTimestamp();

                                await interaction.editReply({ content: ``, embeds: [embedito], flags: MessageFlags.Ephemeral });
                                con.release();
                                return;
                            }
                        } catch (e) {
                            Blocker = true;
                            console.log(e);
                            con.release();
                            return;
                        }

                        if (Blocker == true) return;

                        try {
                            let [row, field] = await con.promise().query(
                                `SELECT * FROM \`whitelists\` WHERE ucp = ?;`,
                                [username]
                            );

                            if (row.length > 0) {
                                Blocker = true;
                                await wait(4000);
                                const embedoj = new EmbedBuilder()
                                    .setTitle("Buat UCP | Neksan Roleplay")
                                    .setDescription(`**:x: Error!**\n> Nama UCP ${username} tersebut sudah terdaftar di database kami, mohon gunakan nama yang lain!`)
                                    .setColor("#00ffaa")
                                    .setTimestamp();

                                await interaction.editReply({ content: ``, embeds: [embedoj], flags: MessageFlags.Ephemeral });
                                con.release();
                                return;
                            }
                        } catch (e) {
                            Blocker = true;
                            console.log(e);
                            con.release();
                            return;
                        }

                        if (Blocker == true) return;

                        try {
                            let randomCode = Math.floor(Math.random() * 99999) + 10000;

                            let [row, field] = await con.promise().query(
                                `INSERT INTO \`whitelists\` (\`ucp\`, \`nickadmin\`, \`adutyname\`, \`verify\`, \`date\`, \`discordid\`) VALUES (?, 'Bot', 'Bot', ?, CURRENT_TIMESTAMP(), ?);`,
                                [username, randomCode, interaction.member.user.id]
                            );

                            if (row.affectedRows > 0) {
                                await wait(4000);
                                await interaction.editReply({
                                    content: `:white_check_mark: UCP ${username} telah berhasil didaftarkan!`,
                                    flags: MessageFlags.Ephemeral
                                });

                                const embeol = new EmbedBuilder()
                                    .setTitle("Neksan Roleplay")
                                    .setDescription(`Yang terhormat, **${interaction.user.tag}**.\n\nSelamat, pembuatan UCP berhasil dilakukan!\nGunakan UCP untuk memasuki Gerbang Kota.\n\nMasukkan kode verifikasi di bawah ini ketika login!`)
                                    .setColor(0x000000)
                                    .addFields(
                                        { name: "**UCP:**", value: '```' + username + '```' },
                                        { name: "**Verification Code:**", value: '```' + randomCode.toString() + '```' },
                                        { name: "**IP Address:**", value: "```123.456.789.10```", inline: true },
                                        { name: "**Port:**", value: "```7777```", inline: true }
                                    )
                                    .setImage('https://cdn.discordapp.com/attachments/1400185624497098835/1518640858340130926/Reverie.png?ex=6a4339c3&is=6a41e843&hm=4c0b540f0d41853284c01723a6a1acc40964221fdc14d0a61cee8c1f864c7cd0');

                                interaction.member.send({ content: ``, embeds: [embeol] }).catch(() => {
                                    const embebek = new EmbedBuilder()
                                        .setTitle("Cek Account | Neksan Roleplay")
                                        .setDescription(`**:x: Error!**\n> Sepertinya anda tidak bisa menerima DM dari bot ini!\n> Pergi ke pengaturan akun Discord kamu -> Privacy & Settings -> Allow DM from Server Members (centang)`)
                                        .setColor("#00ffaa")
                                        .setTimestamp();

                                    interaction.editReply({ content: ``, embeds: [embebek], flags: MessageFlags.Ephemeral });
                                });

interaction.member.roles.add(process.env.ROLE_REGISTER_ID).catch(() => {});
                                interaction.member.roles.add(process.env.ROLE_REFUND_ID).catch(() => {});
                                interaction.member.setNickname(`Warga | ${username}`).catch(() => {});

                                con.release();

                                const embediots = new EmbedBuilder()
                                    .setTitle("Buat UCP | Neksan Roleplay")
                                    .setDescription(`**:white_check_mark: Berhasil!**\n> Kami telah mengirimkan DM kepada anda, silahkan dibuka!`)
                                    .setColor("#00ffaa")
                                    .setTimestamp();

                                await interaction.editReply({ content: ``, embeds: [embediots], flags: MessageFlags.Ephemeral });
                                return;
                            }
                        } catch (e) {
                            console.log(e);
                            con.release();
                            return;
                        }
                    });

                    break;
                }
            }
        }
    }
};

