exports.type = "command";

exports.structure = {
    name: "ask",
    description: "Code Sensei will complete the snippet you provide. Great for asking questions.",
    options: [{
        name: "question",
        description: "The snippet to complete. Can't exceed 1000 characters in length.",
        type: 3,
        required: true
    }]
}

exports.onCall = (interaction, data, generated) => {
    if (data.tokens < 1) {
        return interaction.reply(noTokens());
    }

    if (Date.now() - data.lastAskedTimestamp < 1000) {
        interaction.reply(`${emotes.deny} You're asking too fast! Please don't spam me.`);
        data.lastAskedTimestamp = Date.now();
        return;
    }

    let snippet = interaction.options.get("question");
    if (!snippet) {
        interaction.reply(`${emotes.deny} You must provide a snippet to complete!`);
        return;
    }

    snippet = snippet.value;

    if (snippet.length > 1000) {
        interaction.reply(`${emotes.deny} Snippet is too long!`);
        return;
    }

    interaction.reply(emotes.process).then(() => {
        // OpenAI requires me to pass the user input through a content filter.
        // https://beta.openai.com/docs/engines/content-filter
        openai.createCompletion("content-filter-alpha", {
            prompt: `<|endoftext|>${snippet}\n--\nLabel:`,
            temperature: 0,
            max_tokens: 1,
            top_p: 0,
            logprobs: 10
        }).then(response => {
            let filter = contentFilterCheck(response.data);

            if (filter > 0) {
                interaction.editReply(`${emotes.deny} Your snippet has been flagged as inappropriate and won't be completed. Coins have not been deducted.`);

                if (data.updatesChannel && data.onWatchlist) {
                    client.channels.fetch(data.updatesChannel).then(channel => {
                        channel.send(`${emotes.deny} ${interaction.user.tag} has triggered the content filter.\n\nInput: ${snippet}`).catch(logToServer);
                    }).catch(logToServer);
                }

                // Using the lastAskedTimestamp, remove 1 from cft for every hour passed
                let timeDiff = interaction.createdTimestamp - data.lastAskedTimestamp;
                let hours = Math.floor(timeDiff / (1000 * 60 * 60));
                let cft = Math.max(0, data.cft - hours);
                
                cft++;

                if (cft >= 3 && !data.onWatchlist) {
                    let msg = `${emotes.information} Due to repeated content filter triggers, you have been added to a watchlist. Any further questions you ask will be monitored by a developer.\nIf you continue to trigger the content filter, you will be blacklisted until a developer has a chance to review your account.\nIf this was a mistake, you will be removed from the blacklist.`;

                    interaction.user.send(msg).catch(() => {
                        interaction.channel.send(msg).catch(() => {});
                    });

                    client.channels.fetch(process.env.WATCHLIST_CATEGORY).then(category => {
                        category.createChannel(`${interaction.user.id}`).then(channel => {
                            channel.send(`User **${interaction.user.tag}** (${interaction.user.id}) <@${interaction.user.id}> has been added to the watchlist for repeatedly triggering the content filter.\nLatest input trigger: ${snippet}`).then(msg => {
                                msg.pin().catch(() => {
                                    channel.send(`${emotes.deny} I was unable to pin the message.`);
                                });
                            }).catch(logToServer);

                            database.query(
                                "UPDATE `users` SET `onWatchlist` = 1, `watchlistReason` = 'Content Filter Trigger', `cft` = ?, `lastAskedTimestamp` = ?, `updatesChannel` = ? WHERE `userid` = ?", 
                                [cft, interaction.createdTimestamp, channel.id.toString(), interaction.user.id.toString()]
                            );
                        }).catch(logToServer);
                    }).catch(logToServer);

                    database.query(
                        'INSERT INTO `restrictionHistory` (`userid`, reason, timestamp, type) VALUES (?, ?, ?, 0)', 
                        [interaction.user.id.toString(), `Content filter trigger`, interaction.createdTimestamp]
                    );
                } else if (cft >= 5 && data.onWatchlist) {
                    // Since they have been warned but continue, blacklist them
                    database.query(
                        'UPDATE `users` SET `blacklisted` = 1, `blacklistReason` = \'Content Filter Trigger\', `cft` = ?, `lastAskedTimestamp` = ?, WHERE `userid` = ?', 
                        [cft, interaction.createdTimestamp, interaction.user.id.toString()]
                    );

                    let msg = `${emotes.deny} You have been blacklisted until a developer has a chance to review your account. If this was a mistake, you will be removed from the blacklist.`;

                    interaction.user.send(msg).catch(() => {
                        interaction.channel.send(msg).catch(() => {});
                    });

                    if (data.updatesChannel) {
                        client.channels.fetch(data.updatesChannel).then(channel => {
                            channel.send(`User **${interaction.user.tag}** (${interaction.user.id}) <@${interaction.user.id}> has been blacklisted for repeatedly triggering the content filter.\nLatest input trigger: ${snippet}`).catch(logToServer);
                        }).catch(logToServer);
                    }

                    database.query(
                        'INSERT INTO `restrictionHistory` (`userid`, reason, timestamp, type) VALUES (?, ?, ?, 1)', 
                        [interaction.user.id.toString(), `Content filter trigger`, interaction.createdTimestamp]
                    );
                } else {
                    let query = generated ?
                        'INSERT INTO `users` (`cft`, `timestamp`, `userid`) VALUES (?, ?, ?)' : 
                        'UPDATE `users` SET `cft` = ?, `timestamp` = ? WHERE `userid` = ?';

                    let queryArray = [cft, interaction.createdTimestamp, interaction.user.id.toString()];

                    database.query(query, queryArray);
                }

                database.query(
                    'INSERT INTO `contentFilterTriggers` (`userid`, `input`, `timestamp`) VALUES (?, ?, ?)',
                    [interaction.user.id.toString(), snippet, interaction.createdTimestamp]
                );
            } else {
                let prompt = `${aiBehavior}\n\nUser: ${snippet}\nCode Sensei:`;
                openai.createCompletion("text-davinci-002", {
                    prompt: prompt,
                    max_tokens: 250,
                    stop: ['User:', 'Code Sensei:'],
                    user: interaction.user.id
                }).then(completion => {
                    let response = completion.data.choices[0].text;
    
                    let beforeTokens = data.tokens;
    
                    let behaviorTokens = gptEncode(prompt).length;
                    let answerTokens = gptEncode(response).length;
                    let total = behaviorTokens + answerTokens;
    
                    data.tokens -= total;
                    let credited = 0;
                    if (data.tokens < 0) {
                        credited -= data.tokens;
                        data.tokens += credited;
                        data.totalTokens += credited;
                    }
    
                    data.spentTokens += total;
                    data.lastTokensUsed = total;
                    data.lastAskedTimestamp = Date.now();

                    let changed = {
                        tokens: data.tokens,
                        spentTokens: data.spentTokens,
                        totalTokens: data.totalTokens,
                        lastAskedTimestamp: data.lastAskedTimestamp,
                        lastTokensUsed: data.lastTokensUsed
                    };
    
                    interaction.editReply(response);

                    if (beforeTokens >= 1000 && data.tokens < 1000) {
                        let embed = new Discord.MessageEmbed();
                        embed.setTitle("Running low on coins!");
                        embed.setDescription(`You are running low on coins. You currently have ${emotes.coin} ${tokensToCoins(data.tokens)}. If you would like more now, visit [the shop](${tokenShop}) to buy more. Otherwise, your coins will be reset <t:${Math.round(resetTime.getTime() / 1000)}:R>!`);
                        embed.setColor(0xff9e3d);

                        interaction.user.send({embeds: [embed]}).catch(() => {
                            interaction.channel.send({content: `Looks like you have DMs disabled!`, embeds: [embed]});
                        });
                    }
                    
                    if (data.firstTimeDM != 1) {
                        let msg = `Thank you for using Code Sensei!\nIn case you weren't aware, Code Sensei is a chatbot powered by OpenAI that is designed to help you with math, coding, or computer science related questions. Code Sensei is not perfect, and will sometimes decline to answer questions it thinks aren't related to the topics stated before, when it may actually be.\n\nThe question you asked, "${snippet}" used ${emotes.coin} ${tokensToCoins(total)} of your ${emotes.coin} ${tokensToCoins(beforeTokens)} Sense Coins, you now have ${emotes.coin} __${tokensToCoins(data.tokens)}__ coins remaining. In general, shorter questions use fewer tokens, so be as concise as you can!\nThis is the only time I will message you about this, with the exception of letting you know that you're running low. You can always use \`/balance\` to see how many you have left, or how many were used by your last question.\nYou can find more information about coins from ${faqPage}`;
                        interaction.user.send(msg).catch(err => {
                            interaction.channel.send(`<@${interaction.user.id}>, Looks like you have DM's disabled! Here is what I wanted to send to you:\n${msg}`);
                        });

                        data.firstTimeDM = 1;
                        changed.firstTimeDM = 1;
                    }

                    // build query based on changed properties. If generated, it should insert to the database. Otherwise, it should update the database.
                    let query = generated ? 'INSERT INTO `users` (' : 'UPDATE `users` SET ';
                    let build = [];

                    if (!generated) {
                        for (let [key, value] of Object.entries(changed)) {
                            let b = `\`${key}\` = `;
                            if (typeof value === 'string') {
                                b += `'${value}'`;
                            } else {
                                b += value.toString();
                            }
                            build.push(b);
                        }
                        build = build.join(', ');
                        build += ` WHERE \`userid\` = ${interaction.user.id}`;
                    } else {
                        changed.userid = interaction.user.id;
                        let keys = [];
                        let values = [];
                        for (let [key, value] of Object.entries(changed)) {
                            keys.push(`\`${key}\``);

                            let b = typeof value === "string" ? `'${value}'` : value.toString();
                            values.push(b);
                        }

                        build = keys.join(', ') + ') VALUES (' + values.join(', ') + ')';
                    }

                    query += build;

                    database.query(query, err => {
                        if (err) {
                            console.log(err);
                            interaction.channel.send(`${emotes.deny} An error occurred while saving your data.`);
                        }
                    })

                    if (credited > 0) {
                        let msg = `${emotes.information} Oh no! Looks like you ran out of Sense Coins on your last question. You have been credited ${emotes.coin} ${tokensToCoins(credited)} to complete the snippet, and are now left with ${emotes.coin} ${tokensToCoins(data.tokens)} coins. Coins will be reset on <t:${Math.round(resetTime.getTime() / 1000)}>. If you want more coins now, visit ${tokenShop}`;
                        interaction.user.send(msg).catch(err => {
                            interaction.channel.send(`<@${interaction.user.id}>, Looks like you have DM's disabled! Here is what I wanted to send to you:\n${msg}`);
                        });
                    }

                    database.query(
                        "INSERT INTO `transactions` (`userid`, `type`, `amountCoins`, `aiIn`, `aiOut`, `timestamp`) VALUES (?, 'cmd', ?, ?, ?, ?)", 
                        [interaction.user.id, total, snippet, response.trim(), Date.now()], 
                        err => {
                            if (err) {
                                console.log(err);
                                logToServer(`Error saving transaction for ${interaction.user.id}\n${err}`);
                                interaction.channel.send(`${emotes.deny} An error occurred while saving your transaction. It won't appear in your history.`);
                            }
                    });

                    if (data.onWatchlist && data.updatesChannel) {
                        client.channels.fetch(data.updatesChannel).then(channel => {
                            channel.send(`${emotes.information} ${interaction.user.tag} has asked a question:\n\nInput: ${snippet}\n\nAI Response: ${string.Trim(response)}`).catch(logToServer)
                        }).catch(logToServer);
                    }
                }).catch(error => {
                    console.error(error);
                    logToServer(`Failed to process snippet for ${interaction.user.tag} (${interaction.user.id}):\nInput: ${snippet}\n${error.stack}`);
                    interaction.editReply(`${emotes.deny} Failed to process your request. Tokens have not been deducted.`);
                });
            }
        }).catch(err => {
            interaction.editReply(`${emotes.deny} Failed to pass your snippet through the content filter!\`\`\`\n${err.stack}\`\`\``);
        });

    }).catch(() => {}); // Catch is there so console doesn't say "Uncaught Promise Rejection". Should only run if no message perms
};