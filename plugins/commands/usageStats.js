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

        let totalCoins = result[0].totalCoins;

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

            let todayCoins = result[0].totalCoins;

            let month = new Date();
            month.setDate(1);
            month.setHours(0);
            month.setMinutes(0);
            month.setSeconds(0);
            month.setMilliseconds(0);

            database.query("SELECT SUM(`amountCoins`) AS `totalCoins` FROM `transactions` WHERE `type` = 'cmd' AND `timestamp` >= " + month.getTime(), (err, result) => {
                if (err) {
                    interaction.reply(`${emotes.error} An error occurred while retrieving usage stats.`);
                    return;
                }

                let monthCoins = result[0].totalCoins;

                let embed = new Discord.MessageEmbed();
                embed.setColor(0x48ca7d);
                embed.setTitle('Usage Stats');
                embed.setDescription(`${emotes.coin} **${tokensToCoins(totalCoins)}**  total coins ($__${tokensToUSD(totalCoins)}__ USD) have been used in Code Sensei's lifetime.\n\n⏱️ **${tokensToCoins(todayCoins)}** coins ($__${tokensToUSD(todayCoins)}__ USD) have been used today.\n📅 **${tokensToCoins(monthCoins)}** coins ($__${tokensToUSD(monthCoins)}__ USD) have been used this month.`);

                interaction.reply({embeds: [embed]});
            });
        });
    });
}