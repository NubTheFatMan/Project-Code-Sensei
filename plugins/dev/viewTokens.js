exports.type = "devCommand";
exports.name = "tokens";

exports.onCall = (message, args) => {
    let target = args.shift();

    let data = getUserData(target);

    if (data) {
        message.reply(`${emotes.information} User currently has **${data.tokens}** tokens.\nThey have spent **${data.spentTokens}** tokens.\nThey have had **${data.totalTokens}** tokens total.`);
    }
}