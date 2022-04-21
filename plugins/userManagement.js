global.tokensToCoins = tokens => {
    return (tokens / 100).toFixed(2);
}

global.noTokens = () => {
    let embed = new Discord.MessageEmbed();
    embed.setTitle(`${emotes.deny} You don't have enough tokens!`);
    embed.setDescription(`Visit [${tokenShop}](the token shop) to buy more, or wait till <t:${Math.round(resetTime.getTime() / 1000)}> when they're reset!`);
    embed.setColor(0xff6262);
    return {embeds: [embed]};
}

global.isDev = data => {
    if (data.access === 3) return true;
    return false;
}
global.isTester = data => {
    if (data.access === 1) return true;
    return false;
}