exports.type = "command";

exports.structure = {
    name: "balance",
    description: "View your Sense Coin balance."
}

exports.onCall = (interaction, data) => {
    let embed = new Discord.MessageEmbed();
    embed.setColor(0x0096ff);
    embed.setTitle("Sense Wallet");
    embed.setDescription(`You have ${emotes.coin} ${tokensToCoins(data.tokens)}.`);

    embed.addField("⏱️ Last Question:", 
        data.lastAskedTimestamp > 0 ? 
        `Your last question was asked <t:${Math.round(data.lastAskedTimestamp / 1000)}:R>. It used ${emotes.coin} ${tokensToCoins(data.lastTokensUsed)}.` : 
        "You have never asked a question before! Try asking one!"
    );

    embed.addField("📉 Spent Sense Coins:",
        data.spentTokens > 0 ?
        `You have spent ${emotes.coin} ${tokensToCoins(data.spentTokens)}.` :
        "You have never spent tokens before! Use commands that use OpenAI to spend tokens!"
    );

    embed.addField("📈 Accumulated Sense Coins:", `You have earned ${emotes.coin} ${tokensToCoins(data.totalTokens)}.`);

    embed.addField("💰 Want more coins?", `Visit [the coin shop](${tokenShop}) to buy more, or wait till <t:${Math.round(resetTime.getTime() / 1000)}> when they're reset!`);

    interaction.reply({embeds: [embed]});
}