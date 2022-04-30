exports.type = "command";
exports.structure = {
    name: "usagestats",
    description: "Get stats about how much Code Sensei is used."
}

exports.onCall = async (interaction, data) => {
    database.query("SELECT SUM(`amountCoins`) AS `totalCoins` FROM `transactions` WHERE `type` = 'cmd'", (err, result) => {
        if (err) {
            interaction.reply(`${emotes.error} An error occurred while retrieving usage stats.`);
            return;
        }

        let totalCoins = tokensToCoins(result[0].totalCoins);

        let date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        database.query("SELECT SUM(`amountCoins`) AS `totalCoins` FROM `transactions` WHERE `type` = 'cmd' AND `timestamp` >= " + date.getTime(), (err, result) => {
            if (err) {
                interaction.reply(`${emotes.error} An error occurred while retrieving usage stats.`);
                return;
            }

            let todayCoins = tokensToCoins(result[0].totalCoins);

            let embed = new Discord.MessageEmbed();
            embed.setColor(0x48ca7d);
            embed.setTitle('Usage Stats');
            embed.setDescription(`${emotes.coin} **${totalCoins}** total coins have been used in Code Sensei's lifetime.\n⏱️ **${todayCoins}** coins have been used today.`);

            interaction.reply({embeds: [embed]});
        });
    })
}