exports.type = "devCommand";
exports.name = "setflags";

let flags = {
    watchlist: {
        name: "onWatchlist",
        reason: "watchlistReason"
    },
    blacklist: {
        name: "blacklisted",
        reason: "blacklistReason"
    }
}

exports.onCall = (message, args) => {
    let target = args.shift();
    let flag = args.shift();
    let active = args.shift();
    let reason = args.join(' ');

    if (!target)
        return message.reply(`${emotes.deny} Missing target.`);

    if (!flag)
        return message.reply(`${emotes.deny} Missing flag.`);

    if (!flags[flag])
        return message.reply(`${emotes.deny} Invalid flag.`);

    flag = flags[flag];

    if (!["0", "1"].includes(active))
        return message.reply(`${emotes.deny} Missing 0 or 1.`);

    let query = `UPDATE \`users\` SET \`${flag.name}\` = ${active}`;

    if (reason)
        query += `, \`${flag.reason}\` = '${reason}'`;
    
    query += ` WHERE \`userid\` = '${target}'`;

    database.query(query, err => {
        if (err)
            return message.reply(`${emotes.deny} An error occured changing user status.\`\`\`\n${err.stack}\`\`\``);

        message.reply(`${emotes.approve} Successfully changed user status.`);
    });
}