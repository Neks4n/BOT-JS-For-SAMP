const wait = require('node:timers/promises').setTimeout;
const { 
    ModalBuilder, 
    TextInputBuilder,
    EmbedBuilder, 
    ActionRowBuilder,
    TextInputStyle,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require("discord.js");

const con = require("../function/mysql");

module.exports = {
    name: 'interactionCreate',
    description: 'Untuk mendeteksi jika ada interaksi yang dilakukan oleh user',
	async execute(interaction) {
        if(interaction.isCommand())
        {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                console.error(`'${interaction.user.tag}' Menggunakan Command '${command.data.name}'`);
                await command.execute(interaction); 
            } catch (error) {
                console.error(error);
                return interaction.reply({ content: 'Command masih dalam pengembangan', ephemeral: true });
            }
        }
        else if (interaction.isButton())
        {
            switch(interaction.customId)
            {
                // Account Category
                case "RegisterBTN":
                {
                    const modal = new ModalBuilder()
                        .setCustomId('AccRegisterModal')
                        .setTitle('Pendaftaran');
                    // Add components to modal
                    // Create the text input components
                    const Username = new TextInputBuilder()
                        .setCustomId('Username')
                        .setLabel('Nama UCP')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('Masukkan nama UCP anda')
                        .setRequired(true);
                    const firstActionRow = new ActionRowBuilder().addComponents(Username);
                    // Add inputs to the modal
                    modal.addComponents(firstActionRow);
                    // Show the modal to the user
                    await interaction.showModal(modal);
                    console.log(`'${interaction.user.tag}' Registering Account`);
                    return;
                }
                case "ReverifBTN":
                {
                    //await interaction.deferReply({ephemeral: true});
                    interaction.reply({ content: `:ok: Permintaan sedang diproses, mohon tunggu!`, ephemeral : true});
                    mysqlConnection.getConnection(async function (err, con) {
                        try {
                            let [row, field] = await con.promise().query(`SELECT ucp, verify FROM \`whitelists\` WHERE discordid = ?;`, [interaction.member.user.id]);
                            if(row.length < 1)
                            {
                                await wait(4000);

                                const embedda = new EmbedBuilder()
                                .setTitle("Cek Account | Neksan Roleplay")
                                .setDescription(`**:x: Error!**
                                > Sepertinya anda belum mempunyai UCP!`)
                                .setColor("#00ffaa")
                                .setTimestamp()
                                .addFields({ name: '#ATLS:RP', value: '~ *Server kebanggaan kita semuanya* ~' })
                                
                                await interaction.editReply({ content: ``, embeds: [embedda], ephemeral : true});
                                con.release();
                                return;
                            }

                            let InfoEmbed;

                            if(row[0].verify == -1)
                            {
                                InfoEmbed = new EmbedBuilder()
                                .setTitle("Cek Account | Neksan Roleplay")
                                .setDescription(`**:white_check_mark: Berhasil!**\nBerikut adalah detail dari akun UCP anda:`)
                                .addFields({ name: "Nama UCP", value: row[0].ucp })
                                .addFields({ name: "Status", value: "Terverifikasi" })
                                .addFields({ name: "Note", value: "Jangan beritahu informasi ini kepada orang lain!" })
                                .setColor("#00ffaa")
                                .setTimestamp()
                            }
                            else if(row[0].verify != -1)
                            {
                                InfoEmbed = new EmbedBuilder()
                                .setTitle("Cek Account | Neksan Roleplay")
                                .setDescription(`**:white_check_mark: Berhasil!**\nBerikut adalah detail dari akun UCP anda:`)
                                .addFields({ name: "Nama UCP", value: row[0].ucp })
                                .addFields({ name: "Status", value: "Tidak Terverifikasi" })
                                .addFields({ name: "Code", value: row[0].verify.toString() })
                                .addFields({ name: "Note", value: "Jangan beritahu informasi ini kepada orang lain!" })
                                .setColor("#00ffaa")
                                .setTimestamp()
                            }

                            await interaction.user.send({ content : ``, embeds: [InfoEmbed] }).catch(() => {
                                const embeddb = new EmbedBuilder()
                                    .setTitle("Cek Account | Neksan Roleplay")
                                    .setDescription(`**:x: Error!**
                                    > Sepertinya anda tidak bisa menerima DM dari bot ini!
                                    > Pergi ke pengaturan akun Discord kamu -> Privacy & Settings -> Allow DM from Server Members (centang)`)
                                    .setColor("#00ffaa")
                                    .addFields({ name: '#ATLS:RP', value: '~ *Server kebanggaan kita semuanya* ~' })
                                    .setTimestamp()
                                interaction.editReply({ content: ``, embeds: [embeddb], ephemeral: true});
                                return;
                            });
                            const embeddc = new EmbedBuilder()
                            .setTitle("Cek Account | Neksan Roleplay")
                            .setDescription(`**:white_check_mark: Berhasil!**\n> Kami telah mengirimkan DM kepada anda, silahkan dibuka!`)
                            .setColor("#00ffaa")
                            .addFields({ name: '#ATLS:RP', value: '~ *Server kebanggaan kita semua* ~' })
                            .setTimestamp()
                            await interaction.editReply({content : ``, embeds: [embeddc], ephemeral : true});

                            con.release();
                        } catch(e) {
                            if(err) console.log(err);
                            console.log(e);
                            con.release();
                            return;
                        }

                    })
                    return;
                }

                case "ChangePWBTN":
                {
                    const row = new ActionRowBuilder()
                    .setComponents(
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
                        content : "Apakah anda yakin ingin melanjutkan?",
                        components : [row],
                        fetchReply : true,
                        ephemeral : true
                    })
                    confirmMsg.createMessageComponentCollector({
                        filter : i => i.user.id === interaction.user.id,
                        componentType: ComponentType.Button,
                        time: 15000
                    }).on('collect', async i => {
                        if(i.customId === 'cancel')
                        {
                            await interaction.followUp({ content : ":ok: Berhasil dibatalkan!", ephemeral : true});
                            return;
                        }
                        else if(i.customId === 'confirm')
                        {
                            i.reply({ content : ":ok: Mohon tunggu kami sedang memprosesnya...", ephemeral : true});
                            mysqlConnection.getConnection(async (err, connection) => {
                                if(err) throw err;
                                
                                let [rows, fields] = await connection.promise().query("SELECT * FROM `whitelists` WHERE `discordid`=? LIMIT 1", [interaction.user.id]);
                                if(rows.length == 0)
                                {
                                    const embedbagong = new EmbedBuilder()
                                        .setTitle("Pemulihan Akun | Neksan Roleplay")
                                        .setDescription(`**:x: Error!**
                                        > Sepertinya anda belum mempunyai UCP!`)
                                        .setColor("#00ffaa")
                                        .setTimestamp()
                                        .addFields([
                                            { "name": '#ATLS:RP', "value": '~ *Server kebanggaan kita semuanya* ~' }
                                        ])

                                    interaction.followUp({content: ``, embeds: [embedbagong], ephemeral: true});
                                    return;
                                }
                    
                                let code = Math.floor(Math.random() * 99999) + 10000;
                                
                                await connection.promise().query("UPDATE `whitelists` SET `recovery` = ? WHERE `discordid` = ?", [code, interaction.user.id]);
                    
                                let embedrol = new EmbedBuilder()
                                    .setTitle("Pemulihan Akun | Neksan Roleplay")
                                    .setDescription(`**:warning: Peringatan!**\nAnda telah meminta layanan lupa password.\nJika ini bukan permintaan anda, maka abaikan saja pesan ini!`)
                                    .addFields([
                                        { name: "Kode Pemulihan:", value: '```'+code+'```Masuklah ke server dan masukkan Kode Pemulihan untuk membuat ulang kata sandi!'},
                                        { name: "#ATLS:RP", value: "~ *Server kebanggaan kita semuanya* ~" }
                                    ])
                                    .setColor("#00ffaa")
                                
                                interaction.user.send({ content : ``, embeds: [embedrol] }).catch(() => {
                                    const embedtot = new EmbedBuilder()
                                        .setTitle("Pemulihan Akun | Neksan Roleplay")
                                        .setDescription(`**:x: Error!**
                                        > Sepertinya anda tidak bisa menerima DM dari bot ini!
                                        > Pergi ke pengaturan akun discord kamu -> Privacy & Settings -> Allow DM from Server Members (centang)`)
                                        .setColor("#00ffaa")
                                        .setTimestamp()
                                        .addFields([
                                            { "name": '#ATLS:RP', "value": '~ *Server kebanggaan kita semuanya* ~' }
                                        ])
                                        .setFooter({ text : "Gerbang Kota #1", iconURL: "https://cdn.discordapp.com/attachments/1400185624497098835/1518640858340130926/Reverie.png?ex=6a4339c3&is=6a41e843&hm=4c0b540f0d41853284c01723a6a1acc40964221fdc14d0a61cee8c1f864c7cd0" });
                                    interaction.followUp({ content: ``, embeds: [embedtot], ephemeral: true});
                                });
                                const embedol = new EmbedBuilder()
                                    .setTitle("Pemulihan Akun | Neksan Roleplay")
                                    .setDescription(`**:white_check_mark: Berhasil!**\n> Kami telah mengirimkan DM kepada anda, silahkan dibuka!`)
                                    .setColor("#00ffaa")
                                    .setTimestamp()
                                    .addFields([
                                        { "name": '#ATLS:RP', "value": '~ *Server kebanggaan kita semuanya* ~' }
                                    ])
                                interaction.followUp({ content: ``, embeds: [embedol], ephemeral: true });
                            })
                            return;
                        }
                    })
                    return;
                }
                // Report Category
            }
        }
        else if (interaction.isModalSubmit())
        {
            switch(interaction.customId)
            {
                case "AccRegisterModal":
                {
                    console.error(`'${interaction.user.tag}' Register Modal Called`);
                    //await interaction.deferReply({ ephemeral: true });
                    interaction.reply({ content: `:ok: Pendaftaran sedang diproses, mohon tunggu!`, ephemeral : true});
                    let username = interaction.fields.getTextInputValue('Username');
                    if(username.length < 4 || username.length > 24) 
                    {
                        await wait(4000);
                        const embedmek = new EmbedBuilder()
                            .setTitle("Pendaftaran Akun | Neksan Roleplay")
                            .setDescription(`**:x: Error!**
                            > Nama UCP anda harus 4 s/d 24 karakter!`)
                            .setColor("#00ffaa")
                            .setTimestamp()
                            .addFields([
                                { "name": '#ATLS:RP', "value": '~ *Server kebanggaan kita semuanya* ~' }
                            ])
                        await interaction.editReply({ content: ``, embeds: [embedmek], ephemeral : true});
                        return;
                    }

                    if(!/^[a-zA-Z0-9]*$/gi.test(username) || username.includes(" "))
                    {
                        await wait(4000);
                        const embemem = new EmbedBuilder()
                            .setTitle("Pendaftaran Akun | Neksan Roleplay")
                            .setDescription(`**:x: Error!**
                            > Nama UCP anda hanya dapat huruf dan angka tidak boleh simbol atau spasi!`)
                            .setColor("#00ffaa")
                            .setTimestamp()
                            .addFields([
                                { "name": '#ATLS:RP', "value": '~ *Server kebanggaan kita semuanya* ~' }
                            ])
                        await interaction.editReply({ content: ``, embeds: [embemem], ephemeral : true});
                        return;
                    }

                    mysqlConnection.getConnection(async function (err, con) {

                        if (err) throw err;

                        let Blocker = false;
                        
                        try {
                            let [row, field] = await con.promise().query(`SELECT * FROM \`whitelists\` WHERE discordid = ?;` , [ interaction.member.user.id ]);
            
                            if(row.length > 0)
                            {
                                Blocker = true;
                                await wait(4000);
                                const embedito = new EmbedBuilder()
                                    .setTitle("Pendaftaran Akun | Neksan Roleplay")
                                    .setDescription(`**:x: Error!**\n> Anda sudah pernah mendaftar dan tidak bisa lagi mengBuat UCP!`)
                                    .setColor("#00ffaa")
                                    .setTimestamp()
                                    .addFields([
                                        { "name": '#ATLS:RP', "value": '~ *Server kebanggaan kita semuanya* ~' }
                                    ])
                                    .setFooter({ text : "Gerbang Kota #1", iconURL: "https://cdn.discordapp.com/attachments/1400185624497098835/1518640858340130926/Reverie.png?ex=6a4339c3&is=6a41e843&hm=4c0b540f0d41853284c01723a6a1acc40964221fdc14d0a61cee8c1f864c7cd0" });
                                await interaction.editReply({ content: ``, embeds: [embedito], ephemeral : true});
                                con.release();
                                return;
                            }
            
                        } catch(e) {
                            Blocker = true;
                            console.log(e);
                            con.release();
                            return;
                        }
            
                        if(Blocker == true)
                            return;
            
                        try {
                            let [row, field] = await con.promise().query(`SELECT * FROM \`whitelists\` WHERE ucp = ?;` , [ username ]);
            
                            if(row.length > 0)
                            {
                                Blocker = true;
                                await wait(4000);
                                const embedoj = new EmbedBuilder()
                                    .setTitle("Pendaftaran Akun | Neksan Roleplay")
                                    .setDescription(`**:x: Error!**
                                    > Nama UCP ${username} tersebut sudah terdaftar di database kami, mohon gunakan nama yang lain!`)
                                    .setColor("#00ffaa")
                                    .setTimestamp()
                                    .addFields([
                                        { "name": '#ATLS:RP', "value": '~ *Server kebanggaan kita semuanya* ~' }
                                    ])
                                await interaction.editReply({ content: ``, embeds: [embedoj], ephemeral : true});
                                con.release();
                                return;
                            }
                        } catch(e) {
                            Blocker = true;
                            console.log(e);
                            con.release();
                            return;
                        }
            
                        if(Blocker == true)
                            return;
            
                        try {
                            let randomCode = Math.floor(Math.random() * 99999) + 10000;
            
                            let [row, field] = await con.promise().query(`INSERT INTO \`whitelists\` (\`ucp\`, \`nickadmin\`, \`adutyname\`, \`verify\`, \`date\`, \`discordid\`) VALUES (?, 'Bot', 'Bot', ?, CURRENT_TIMESTAMP(), ?);` , [ username, randomCode, interaction.member.user.id ]);
            
                            if(row.affectedRows > 0)
                            {
                                await wait(4000);
                                await interaction.editReply({ content: `:white_check_mark: UCP ${username} telah berhasil didaftarkan!`, ephemeral : true});
                                const embeol = new EmbedBuilder()
                                    .setTitle("Neksan Roleplay")
                                    .setDescription(`Yang terhormat, **${interaction.user.tag}**.\n\nMohon perhatian anda, pengambilan Akun UCP berhasil dilakukan.\nGunakan UCP untuk login ke dalam server!\n\nSegera masuk melalui Gerbang Kota #1 **(login in-game)** dan masukkan kode verifikasi di bawah!`)
                                    .setColor(0xFFCB01)
                                    .addFields(
                                        {name : "**UCP:**", value : '```'+username+'```'},
                                        {name : "**Verification Code:**", value : '```'+(randomCode).toString()+'```'},
                                        {name : "**IP Address:**", value : "```104.234.180.139```", inline : true},
                                        {name : "**Port:**", value : "```7777```", inline : true}
                                    )
            
                                interaction.member.send({ content: ``, embeds: [embeol] }).catch(() => {
                                    const embebek = new EmbedBuilder()
                                    .setTitle("Cek Account | Neksan Roleplay")
                                    .setDescription(`**:x: Error!**
                                    > Sepertinya anda tidak bisa menerima DM dari bot ini!
                                    > Pergi ke pengaturan akun Discord kamu -> Privacy & Settings -> Allow DM from Server Members (centang)`)
                                    .setColor("#00ffaa")
                                    .addFields({ name: '#ATLS:RP', value: '~ *Server kebanggaan kita semuanya* ~' })
                                    .setTimestamp()

                                    interaction.editReply({ content: ``, embeds: [embebek], ephemeral: true});
                                });
        
                                interaction.member.roles.remove("1439631380337131560").catch(() => {
                                    console.log(`Cannot Remove Role`);
                                });

                                interaction.member.roles.add("1439631380337131560").catch(() => {
                                    console.log(`Cannot Add Role`);
                                });

                                interaction.member.roles.add("1439631380337131560").catch(() => {
                                    console.log(`Cannot Add Role`);
                                });

                                interaction.member.setNickname("Warga | "+username).catch(() => {
                                    console.log(`Cannot Use ChangeName to Warga | ${username}`);
                                });
                                con.release();
                                const embediots = new EmbedBuilder()
                                    .setTitle("Pendaftaran Akun | Neksan Roleplay")
                                    .setDescription(`**:white_check_mark: Berhasil!**\n> Kami telah mengirimkan DM kepada anda, silahkan dibuka!`)
                                    .setColor("#00ffaa")
                                    .setTimestamp()
                                    .addFields([
                                        { "name": '#ATLS:RP', "value": '~ *Server kebanggaan kita semuanya* ~' }
                                    ])
                                interaction.editReply({ content: ``, embeds: [embediots], ephemeral: true});
                                return;
                            }
                        } catch(e) {
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