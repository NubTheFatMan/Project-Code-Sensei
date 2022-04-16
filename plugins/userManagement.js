// setInterval(() => {
//     for (let user of toSave) {
//         if (!userData.has(user)) continue;
//         fs.writeFile(`./config/users/${user}.json`, JSON.stringify(userData.get(user)), err => {
//             if (err) console.error(err);
//         });   
//     }
    
//     if (toSave.size > 0){
//         console.log(`Saved ${toSave.size} users.`);
//         // logToServer(`Saved ${toSave.size} users.`);
//         toSave.clear();
//     }
// }, 30000);

// global.saveUser = id => {
//     if (!userData.has(id)) return;
//     if (!toSave.has(id)) toSave.add(id);
// }

global.tokensToCoins = tokens => {
    return (tokens / 100).toFixed(2);
}

// global.getUserData = id => {
//     if (!userData.has(id)) {
//         try {
//             userData.set(id, JSON.parse(fs.readFileSync(`./config/users/${id}.json`)));
//         } catch (err) {
//             let data = {};
//             Object.assign(data, baseUserData);

//             if (testers.includes(id)) {
//                 data.tokens += testerTokenBonus;
//             }

//             if (devs.includes(id)) {
//                 data.tokens += devTokenBonus;
//             }
            
//             data.totalTokens = data.tokens;

//             userData.set(id, data);
//             saveUser(id);
//         }
//     }
    
//     return userData.get(id);
// }

global.noTokens = () => {
    if (!client.isReady()) return;

    let embed = new Discord.MessageEmbed();
    embed.setTitle(`${emotes.deny} You don't have enough tokens!`);
    embed.setDescription(`Visit [${tokenShop}](the token shop) to buy more, or wait till <t:${Math.round(resetTime.getTime() / 1000)}> when they're reset!`);
    embed.setColor(0xff6262);
    return {embeds: [embed]};
}