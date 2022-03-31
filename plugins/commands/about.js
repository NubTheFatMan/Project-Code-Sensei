exports.type = "command";
exports.structure = {
    name: "about",
    description: "Learn more about Code Sensei."
}

exports.onCall = (interaction, data) => {
    let embed = new Discord.MessageEmbed();
    embed.setColor(0x0096ff);
    embed.setTitle('About Code Sensei');
    embed.setDescription(`Code Sensei is a Discord bot that uses OpenAI's GPT-3 text completion engine to answer any math, coding, or computer science questions.`);
    embed.addField('❔ Support Server', `[Invitation link](${supportServer})`, true);
    embed.addField('💰 Coin Shop', `[Support me!](${tokenShop})`, true);
    embed.addField('🤔 Curious how I work?', `[View on GitHub](${github})`, true);
    embed.addField('⏱️ Coin Reset Time', `<t:${Math.round(resetTime.getTime() / 1000)}>`, true);
    embed.addField('📅 Became Available', `<t:${Math.round(becamePublicTimestamp / 1000)}>`, true);
    embed.addField('🟢 Online Since', `<t:${Math.round((Date.now() - client.uptime) / 1000)}>`, true);

    interaction.reply({embeds: [embed]});
}