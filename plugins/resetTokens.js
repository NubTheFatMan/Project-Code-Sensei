setInterval(() => {
    if (Date.now() >= resetTime.getTime()) {
        resetTime.setMonth(resetTime.getMonth() + 1);

        fs.readdir("./config/users", (err, files) => {
            if (err) console.error(err);
            else {
                for (let file of files) {
                    let id = file.slice(0, -5); // remove .json

                    let data;
                    if (userData.has(id)) {
                        data = userData.get(id);
                    } else {
                        data = JSON.parse(fs.readFileSync(`./config/users/${file}`));
                    }
                    
                    let minTokens = baseUserData.tokens;
                    if (testers.includes(id)) minTokens += testerTokenBonus;

                    if (data.tokens < minTokens) {
                        let credited = minTokens - data.tokens;
                        data.tokens = minTokens;
                        data.totalTokens += credited;

                        client.users.fetch(id).then(user => {
                            user.send(`${emotes.approve} New month, more tokens! You have been credited **${credited}** tokens, you now have **${data.tokens}**.`).catch(console.error);
                        }).catch(console.error);

                        if (userData.has(id)) {
                            saveUser(id);
                        } else {
                            fs.writeFile(`./config/users/${file}`, JSON.stringify(data), err => {
                                if (err) console.error(err);
                            });
                        }
                    }
                    
                }
            }
        });
    }
}, 60000);