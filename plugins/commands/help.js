exports.type = "command";
exports.structure = {
    name: "help",
    description: "Get links to FAQ and support server."
}

exports.onCall = (interaction, data) => {
    let embed = new Discord.MessageEmbed();
    embed.setColor(0x0096ff);
    embed.setTitle('Links');
    embed.addField('❔ FAQ', `[Help!](${faqPage})`, true);
    embed.addField('🔗 Support Server', `[Speak to a Dev](${supportServer})`, true);

    interaction.reply({embeds: [embed]});
}