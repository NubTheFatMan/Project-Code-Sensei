exports.type = "command";

exports.structure = {
    name: "balance",
    description: "View your Sense Coin balance."
}

let card;
let pfpMask;
let font;

Jimp.read("./config/images/sense_card_slim.png", (err, image) => {
    if (err) throw err;

    card = image;  
});

Jimp.read("./config/images/pfpmask.png", (err, image) => {
    if (err) throw err;

    pfpMask = image;  
});

Jimp.loadFont("./config/retron2000.fnt", (err, ft) => {
    if (err) throw err;

    font = ft;
});

exports.onCall = (interaction, data) => {
    new Jimp(card, (err, image) => {
        if (err) {
            console.error(err); 

            return interaction.reply("An error occurred while trying to create your card!");
        }

        Jimp.read(interaction.user.displayAvatarURL({format: 'png', size: 96}), (err, avatar) => {
            if (err) {
                console.error(err);

                return interaction.reply("An error occurred while trying to create your card!");
            }

            avatar.resize(70, 70);
            avatar.mask(pfpMask, 0, 0);

            image.blit(avatar, 12, 12);

            image.print(font, 120, 9,  tokensToCoins(data.tokens));
            image.print(font, 120, 49, tokensToCoins(data.lastTokensUsed));

            image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
                if (err) {
                    console.error(err); 
                    
                    return interaction.reply("An error occurred while trying to create your card!");
                }

                let row = new Discord.MessageActionRow();
                row.type = "ACTION_ROW";           

                let faqLink = new Discord.MessageButton({label: "FAQ", url: faqPage, style: "LINK"});
                let shopLink = new Discord.MessageButton({label: "Coin Shop", url: tokenShop, style: "LINK"});

                row.setComponents([faqLink, shopLink]);

                interaction.reply({files: [{attachment: buffer, name: "sense_card.png"}], components: [row]});
            });
        });
    });
}