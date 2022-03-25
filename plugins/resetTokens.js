global.resetTime = new Date();
resetTime.setMonth(resetTime.getMonth() + 1);
resetTime.setDate(1);
resetTime.setHours(0);
resetTime.setMinutes(0);
resetTime.setSeconds(0);
resetTime.setMilliseconds(0);

setInterval(() => {
    if (Date.now() >= resetTime.getTime()) {
        resetTime.setMonth(resetTime.getMonth() + 1);

        fs.readdir("./config/users", (err, files) => {
            if (err) console.error(err);
            else {
                for (let file of files) {
                    let data = JSON.parse(fs.readFileSync(`./config/users/${file}`));
                    
                    let id = file.slice(0, -5); // remove .json
                    let minTokens = baseUserData.tokens;
                    if (testers.includes(id)) minTokens += testerTokenBonus;

                    if (data.tokens < minTokens) {
                        let credited = minTokens - data.tokens;
                        data.tokens = minTokens;
                        data.totalTokens += credited;

                        client.users.fetch(id).then(user => {
                            user.send(`${emotes.approve} New month, more tokens! You have been credited **${credited}** tokens, you now have **${data.tokens}**.`).catch(console.error);
                        }).catch(console.error);

                        fs.writeFile(`./config/users/${file}`, JSON.stringify(data), err => {
                            if (err) console.error(err);
                        });
                    }
                    
                }
            }
        });
    }
}, 60000);