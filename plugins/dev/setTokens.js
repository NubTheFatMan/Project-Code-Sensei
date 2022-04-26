exports.type = "devCommand";
exports.name = "settokens";

let validMethods = ["+", "-", "r"];

exports.onCall = (message, args) => {
    let target = args.shift();
    let amount = args.shift();

    database.query(`SELECT * FROM \`users\` WHERE \`userid\` = '${target}'`, (err, result) => {
        if (err) 
            return message.reply(`${emotes.deny} An error occured while executing that command.\`\`\`\n${err.stack}\`\`\``);

        if (result.length === 0) 
            return message.reply(`${emotes.deny} That user does not exist in the database.`);

        let data = result[0];

        let method = amount[0];
        
        amount = Number(validMethods.includes(method) ? amount.slice(1) : amount);

        if (isNaN(amount)) {
            message.reply(`${emotes.deny} Invalid amount.`);
            return;
        }

        switch (method) {
            case "+": {
                data.tokens += amount;
                data.totalTokens += amount;
            } break;
            
            case "-": {
                data.tokens -= amount;
                data.spentTokens += amount;
            } break;

            case "r": {
                data.tokens = baseUserData.tokens;
                if (testers.includes(target)) data.tokens += testerTokenBonus;
                if (devs.includes(target)) data.tokens += devTokenBonus;

                data.spentTokens = 0;
                data.totalTokens = data.tokens;
                data.lastTokensUsed = 0;
            } break;

            default: {
                data.tokens = amount;
                data.totalTokens = amount + data.spentTokens;
            } break;
        }

        database.query(`UPDATE \`users\` SET \`tokens\` = '${data.tokens}', \`spentTokens\` = '${data.spentTokens}', \`totalTokens\` = '${data.totalTokens}' WHERE \`userid\` = '${target}'`, err => {    
            if (err)
                return message.reply(`${emotes.deny} An error occured while saving user to database.\`\`\`\n${err.stack}\`\`\``);
        });

        message.reply(`${emotes.approve} User now has **${data.tokens}** tokens!`);
    });
}