exports.type = "devCommand";
exports.name = "hotload";

exports.onCall = (message, args) => {
    if (args.length === 0) {
        message.reply(`${emotes.deny} Invalid syntax.`);
        return;
    }

    let plugin = args.shift();

    if (plugin === "*") {
        let loaded = requireAll("./plugins");
        if (loaded > 0) {
            message.reply(`${emotes.approve} Reloaded **${loaded}** plugin${loaded > 1 ? "s" : ""}.`);
        }
    } else {
        try {
            let plug = loadFile(plugin);
            switch (plug.type) {
                case "command": 
                    message.reply(`${emotes.approve} Hot-loaded slash command __${plug.structure.name}__!`);
                break;
                
                case "devCommand": 
                    message.reply(`${emotes.approve} Hot-loaded dev command __${plug.name}__!`);
                break;

                default:
                    message.reply(`${emotes.information} Hot-loaded file, however didn't have a command structure.`);
                break;
            }
        } catch (err) {
            message.reply(`${emotes.deny} Failed to hot-load plugin.\`\`\`\n${err.stack}\`\`\``);
        }
    }
};