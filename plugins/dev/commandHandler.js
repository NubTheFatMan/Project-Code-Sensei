client.on('messageCreate', (message) => {
    if (!devs.includes(message.author.id)) return;

    let prefix = "cs";
    if (process.env.TEST_MODE) prefix += "-test";

    if (!message.content.startsWith(prefix)) return;

    let args = message.content.slice(prefix.length).trim().split(/ +/g);
    let cmd = args.shift().toLowerCase();

    for (let cmd of devCommands) {
        if (cmd.name === cmd) {
            try {
                cmd.onCall(message, args);
            } catch (err) {
                console.error(err);
                message.reply(`${emotes.deny} An error occured while executing that command.\`\`\`\n${err.stack}\`\`\``);
            }
            return;
        }
    }
});