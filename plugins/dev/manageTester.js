exports.type = "devCommand";
exports.name = "tester";

let validMethods = ["add", "remove", "+", "-"];

exports.onCall = (message, args) => {
    if (args.length < 2) {
        message.channel.send(`${emotes.deny} You must specify a user to add or remove from the testers list.`);
        return;
    }

    let method = args.shift().toLowerCase();
    if (!validMethods.includes(method)) {
        message.channel.send(`${emotes.deny} Invalid method. Valid methods are: ${validMethods.join(", ")}`);
        return;
    }

    let id = args.shift();
    
    switch (method) {
        case "add": case "+": {
            if (testers.includes(id)) return message.reply(`${emotes.deny} Already a tester.`);
            testers.push(id);
        } break; 
        
        case "remove": case "-": {
            if (!testers.includes(id)) return message.reply(`${emotes.deny} Not a tester.`);
            testers.splice(testers.indexOf(id), 1);
        } break;
    }

    fs.writeFile("./config/testers.txt", testers.join(' '), err => message.reply(err ? `${emotes.deny} Failed to save tester file.\`\`\`\n${err.stack}\`\`\`` : `${emotes.approve} Success!`));
}