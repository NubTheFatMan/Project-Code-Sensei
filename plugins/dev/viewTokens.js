exports.type = "devCommand";
exports.name = "tokens";

exports.onCall = (message, args) => {
    let target = args.shift();

    database.query(`SELECT * FROM \`users\` WHERE \`userid\` = '${target}'`, (err, result) => {
        if (err) 
            return message.reply(`${emotes.deny} An error occured while executing that command.\`\`\`\n${err.stack}\`\`\``);

        if (result.length === 0) 
            return message.reply(`${emotes.deny} That user does not exist in the database.`);

        let data = result[0];

        message.reply(`${emotes.approve} User has **${data.tokens}** tokens!`);
    });
}