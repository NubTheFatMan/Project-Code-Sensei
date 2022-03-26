let logChannel;

global.logToServer = (log) => {
    if (testMode) return;

    if (!(logChannel instanceof Discord.TextChannel)) {
        client.channels.fetch(process.env.DEV_CONSOLE_CHANNEL).then(channel => {
            logChannel = channel;
            logToServer(log);
        });
        return;
    }

    if (log instanceof Object || log instanceof Array) log = JSON.stringify(log, null, 2);
    else if (typeof log !== "string") log = log.toString();

    if (log.length >= 2000) {
        let buffer = Buffer.from(log);
        logChannel.send({files: [{attachment: buffer, name: "log.txt"}]});
    } else {
        logChannel.send(`\`\`\`\n${log}\`\`\``);
    }
}