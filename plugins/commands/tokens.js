exports.type = "command";

exports.structure = {
    name: "tokens",
    description: "Code Sensei will complete the snippet you provide."
}

exports.onCall = (interaction, data) => {
    let embed = new Discord.MessageEmbed();
    embed.setColor(0x0096ff);
    embed.setDescription(`${emotes.information} Your last question, that was asked <t:${Math.round(data.lastAskedTimestamp / 1000)}:R>, used **${data.lastTokensUsed}** tokens. You have __${data.tokens}__ tokens remaining.\nWant more? Visit [the token shop](${tokenShop}) to buy more, or wait till <t:${Math.round(resetTime.getTime() / 1000)}> when they're reset!\nOverall, you have spent **${data.spentTokens}** tokens. Accumulatively, you have had **${data.totalTokens}** tokens total.`);

    interaction.reply({embeds: [embed]});
}