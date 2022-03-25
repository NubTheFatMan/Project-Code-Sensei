exports.type = "command";

exports.structure = {
    name: "tokens",
    description: "View your tokens."
}

exports.onCall = (interaction, data) => {
    let embed = new Discord.MessageEmbed();
    embed.setColor(0x0096ff);
    embed.setTitle("Tokens");
    embed.setDescription(`You have **${data.tokens}** tokens.`);

    embed.addField("⏱️ Last Question:", 
        data.lastAskedTimestamp > 0 ? 
        `Your last question was asked <t:${Math.round(data.lastAskedTimestamp / 1000)}:R>. It used **${data.lastTokensUsed}** tokens.` : 
        "You have never asked a question before! Try asking one!"
    );

    embed.addField("🔻 Spent Tokens:",
        data.spentTokens > 0 ?
        `You have spent **${data.spentTokens}** tokens.` :
        "You have never spent tokens before! Use commands that use OpenAI to spend tokens!"
    );

    embed.addField("🔺 Accumulated Tokens:", `You have earned **${data.totalTokens}** tokens.`);

    embed.addField("💰 Want more tokens?", `Visit [the token shop](${tokenShop}) to buy more, or wait till <t:${Math.round(resetTime.getTime() / 1000)}> when they're reset!`);

    interaction.reply({embeds: [embed]});
}