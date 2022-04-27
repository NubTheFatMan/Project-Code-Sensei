exports.type = "devCommand";
exports.name = "close";

exports.onCall = (message, args) => {
    if (!message.guild) {
        return message.reply(`${emotes.deny} This command can only be used in a server.`);
    }

    database.query(`SELECT * FROM \`users\` WHERE \`userid\` = '${message.channel.name}' AND \`updatesChannel\` = '${message.channel.id}'`, (err, result) => {
        if (err || result?.length === 0)
            return message.reply(`${emotes.deny} Unable to find a user for this channel.`);

        let status = args.shift();

        let query;
        let msg;

        switch (status) {
            case "remove": {
                query = `UPDATE \`users\` SET \`onWatchlist\` = 0, \`watchlistReason\` = NULL, \`blacklisted\` = 0, \`blacklistReason\` = NULL, \`updatesChannel\` = NULL, \`cft\` = 0 WHERE \`userid\` = '${message.channel.name}'`;
                msg = emotes.approve + ' You have been removed from the watchlist.\n' + args.join(' ');
            } break;

            case "blacklist": {
                query = `UPDATE \`users\` SET \`blacklisted\` = 1, \`blacklistReason\` = 'Developer deemed behavior inappropriate' WHERE \`userid\` = '${message.channel.name}'`;
                msg = emotes.deny + ' You have been blacklisted by a developer.\n' + args.join(' ');
            } break;

            default: 
                return message.reply(`${emotes.deny} Invalid status.`);
        }

        database.query(query, err => {
            if (err)
                return message.reply(`${emotes.deny} An error occured changing user status.\`\`\`\n${err.stack}\`\`\``);
                
            client.users.fetch(message.channel.name).then(user => {
                user.send(msg);
                message.channel.delete().catch(err => {
                    message.channel.send(`${emotes.deny} Unable to delete channel.\`\`\`\n${err.stack}\`\`\``);
                });
            }).catch(err => {
                message.channel.send(`${emotes.deny} Unable to fetch user.\`\`\`\n${err.stack}\`\`\``);   
            });

        });
    });
}