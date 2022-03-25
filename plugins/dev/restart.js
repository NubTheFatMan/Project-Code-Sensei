exports.type = "devCommand";
exports.name = "restart";

exports.onCall = (message, args) => { 
    message.reply(`${emotes.approve} Restarting...`).then(() => {
        client.destroy();
        process.exit(0);
    });
}