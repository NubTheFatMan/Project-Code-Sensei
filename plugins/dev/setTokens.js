exports.type = "devCommand";
exports.name = "settokens";

let validMethods = ["+", "-"];

exports.onCall = (message, args) => {
    let target = args.shift();
    let amount = args.shift();

    let data = getUserData(target);

    if (data) {
        let method = amount[0];
        
        amount = Number(validMethods.includes(method) ? amount.slice(1) : amount);

        if (isNaN(amount)) {
            message.reply(`${emotes.deny} Invalid amount.`);
            return;
        }

        switch (method) {
            case "+": {
                data.tokens += amount;
                data.totalTokens += amount;
            } break;
            
            case "-": {
                data.tokens -= amount;
                data.spentTokens += amount;
            } break;

            default: {
                data.tokens = amount;
            } break;
        }
        
        if (!userData.has(target)) {
            userData.set(target, data);
        }

        saveUser(target);

        message.reply(`${emotes.approve} User now has **${data.tokens}** tokens!`);
    }
}