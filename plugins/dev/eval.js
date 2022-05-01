exports.type = "devCommand";
exports.name = "eval";

let logs = [];
function log() {
    logs.push(
        Array.from(arguments)
            .join(" ")
            .replace(process.env.OPENAI_API_KEY, 'HIDDEN')
            .replace(process.env.DISCORD_BOT_TOKEN, "HIDDEN")
            .replace(process.env.TEST_BOT_TOKEN, "HIDDEN")
    );
}
let oldLog = console.log;

exports.onCall = (message, args) => {
    if (!args.length) return message.reply(`${emotes.deny} You must provide code to evaluate.`);

    let code = args.join(" ").replace('```js', '').replace('```', '');
    console.log = log;
    try {
        let start = new Stopwatch();
        let result = eval(code);
        let time = start.stop().toString();

        let msgObj = {};

        if (logs.length > 0) {
            let buffer = Buffer.from(logs.join("\n"));
            msgObj.files = [{attachment: buffer, name: "console.txt"}];
        }

        if (result === undefined || result === null) msgObj.content = `${emotes.approve} Evaluated successfully, no output.\n⏱️ Took \`${time}\``;
        else if (result instanceof Object || result instanceof Array) result = JSON.stringify(result, null, 2);
        else if (typeof result !== "string") result = result !== undefined ? result.toString() : "";

        if (!msgObj.content) {
            if (result.length > 1900) {
                let buffer = Buffer.from(
                    result.replace(process.env.OPENAI_API_KEY, 'HIDDEN')
                    .replace(process.env.DISCORD_BOT_TOKEN, "HIDDEN")
                    .replace(process.env.TEST_BOT_TOKEN, "HIDDEN")
                );
                msgObj.content = `${emotes.approve} Evaluated without error.\n⏱️ Took \`${time}\``;

                if (!msgObj.files) msgObj.files = [{attachment: buffer, name: "result.txt"}];
                else msgObj.files.push({attachment: buffer, name: "result.txt"});
            } else {
                msgObj.content = `${emotes.approve} Evaluated without error.\n⏱️ Took \`${time}\`\n\`\`\`\n${result}\`\`\``;
            }
        }

        msgObj.content = msgObj.content
            .replace(process.env.OPENAI_API_KEY, 'HIDDEN')
            .replace(process.env.DISCORD_BOT_TOKEN, "HIDDEN")
            .replace(process.env.TEST_BOT_TOKEN, "HIDDEN");

        message.reply(msgObj).catch(err => {
            message.reply(`${emotes.deny} Output too large but unable to attach file. Evaluated without error.\n⏱️ Took \`${time}\`\n\`${err.toString().replace('DiscordAPIError: ', '')}\``).catch(console.error);
        });
    } catch (err) {
        message.reply(`${emotes.deny} An error occured while evaluating that code.\`\`\`\n${err.stack}\`\`\``).catch(console.error);
    }
    console.log = oldLog;
}