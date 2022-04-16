client.on('messageCreate', (message) => {
    let prefix = "-cs";
    if (testMode) prefix += "-test";

    if (message.content.startsWith(prefix)) {
        if (!devs.includes(message.author.id))
            return message.reply('no lol');

        let args = message.content.slice(prefix.length).trim().split(/ +/g);
        let command = args.shift().toLowerCase();
    
        for (let cmd of devCommands.values()) {
            if (cmd.name === command) {
                try {
                    cmd.onCall(message, args);
                } catch (err) {
                    console.error(err);
                    message.reply(`${emotes.deny} An error occured while executing that command.\`\`\`\n${err.stack}\`\`\``);
                }
                return;
            }
        }
    }
});