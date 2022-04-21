exports.type = "command";
exports.structure = {
    name: "ping",
    description: "Get details about Code Sensei's response time."
}

exports.onCall = (interaction, data) => {
    interaction.reply(`${emotes.information} Ping to Discord: \`${client.ws.ping}ms\``).catch(() => {});
}