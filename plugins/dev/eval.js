exports.type = "devCommand";
exports.name = "eval";

exports.onCall = (message, args) => {
    if (!args.length) return message.reply(`${emotes.deny} You must provide code to evaluate.`);
    let code = args.join(" ");
    try {
        let result = eval(code);
        if (result === undefined || result === null) return message.reply(`${emotes.approve} Evaluated successfully, no output.`);

        if (result instanceof Object || result instanceof Array) result = JSON.stringify(result, null, 2);
        else if (typeof result !== "string" && result !== undefined) result = result.toString();

        if (result.length > 1900) {
            let buffer = Buffer.from(result);
            message.reply({content: `${emotes.approve} Evaluated without error.`, files: [{attachment: buffer, name: "result.txt"}]});
        } else {
            message.reply(`${emotes.approve} Evaluated without error.\`\`\`\n${result}\`\`\``);
        }
    } catch (err) {
        message.reply(`${emotes.deny} An error occured while evaluating that code.\`\`\`\n${err.stack}\`\`\``);
    }
}