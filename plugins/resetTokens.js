setInterval(() => {
    if (Date.now() >= resetTime.getTime()) {
        resetTime.setMonth(resetTime.getMonth() + 1);

        database.query('SELECT * FROM `users`', (err, rows) => {
            for (let i = 0; i < rows.length; i++) {
                let data = rows[i];

                let minTokens = baseUserData.tokens;
                if (testers.includes(data.userid)) minTokens += testerTokenBonus;
                if (devs.includes(data.userid)) minTokens += devTokenBonus;

                if (data.tokens < minTokens) {
                    let credited = minTokens - data.tokens;
                    data.tokens = minTokens;
                    data.totalTokens += credited;

                    database.query(`UPDATE \`users\` SET \`tokens\` = ${data.tokens}, \`totalTokens\` = ${data.totalTokens} WHERE \`userid\` = ${data.userid}`, err => {
                        if (err) {
                            logToServer(`[ERROR] An error occurred while resetting coins for user ${data.userid}\n${err}`);
                            client.users.fetch(data.userid).then(user => {
                                user.send(`${emotes.deny} An error occurred while resetting your coins. Developers have already been contacted.`).catch(console.error);
                            }).catch(console.error);

                            for (let x = 0; x < devs.length; x++) {
                                client.users.fetch(devs[x]).then(user => {
                                    user.send(`${emotes.deny} An error occurred while resetting coins for user ${data.userid}\n${err}`).catch(console.error);
                                }).catch(console.error);
                            }
                        } else {
                            client.users.fetch(data.userid).then(user => {
                                user.send(`${emotes.approve} New month, more coins! You have been credited **${tokensToCoins(credited)}** ${emotes.coin}, you now have **${tokensToCoins(data.tokens)}** ${emotes.coin}.`).catch(console.error);
                            }).catch(console.error);
                        }
                    });
                }
            }
        });

    }
}, 60000);