const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('To delete a message')
        .addIntegerOption(option => option.setName('amount')
        .setDescription('Amount 1-300')
        .setRequired(true)),
    async execute(interaction) {
        const amount = await interaction.options.getInteger('amount');
        
        if(!interaction.member.permissions.has('ADMINISTRATOR')) return await interaction.reply({content: `\`\`\`\nYou are not admin, you can't use this command\`\`\``, ephemeral: true}); 
        
        if(amount < 1 || amount > 300){
            await interaction.reply('```\nDelete can only be 1-300```');
            setTimeout(async () => {
                await interaction.deleteReply();
            }, 3000)
        }

        else if(amount <= 100) {
            interaction.channel.bulkDelete(amount, true)
            await interaction.reply({content: `\`\`\`\nYou have successfully deleted ${amount} message\`\`\``, ephemeral: true})
        } 
                
        else if(amount <= 200) {
            interaction.channel.bulkDelete(100, true)
            let left = amount - 100
            setTimeout(async () => {
                interaction.channel.bulkDelete(left, true)
                await interaction.reply({content: `\`\`\`\nYou have successfully deleted ${amount} message\`\`\``, ephemeral: true})
            }, 1000)
        }

        else if(amount <= 300) {
            interaction.channel.bulkDelete(100, true)
            setTimeout(() => { 
                interaction.channel.bulkDelete(100, true)
            }, 1000)
                
            let left = amount - 200
            setTimeout(async () => {
                interaction.channel.bulkDelete(left, true)
                await interaction.reply({content: `\`\`\`\nYou have successfully deleted ${amount} message\`\`\``, ephemeral: true})
            }, 1000)
        }
    },
};