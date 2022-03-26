exports.type = "command";

exports.structure = {
    name: "complete",
    description: "Code Sensei will complete the snippet you provide. Great for asking questions.",
    options: [{
        name: "snippet",
        description: "The snippet to complete.",
        type: 3
    }]
}

exports.onCall = (interaction, data) => {
    if (data.tokens < 1) {
        let embed = new Discord.MessageEmbed();
        embed.setTitle(`${emotes.deny} You don't have enough tokens!`);
        embed.setDescription(`Visit [${tokenShop}](the token shop) to buy more, or wait till <t:${Math.round(resetTime.getTime() / 1000)}> when they're reset!`);
        embed.setColor(0xff6262);

        interaction.reply({embeds: [embed]});
        return;
    }

    let snippet = interaction.options.get("snippet");
    if (!snippet) {
        interaction.reply(`${emotes.deny} You must provide a snippet to complete!`);
        return;
    }

    if (snippet.length > 500) {
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
                interaction.editReply(`${emotes.deny} Your snippet has been flagged as inappropriate, and won't be completed.`);
            } else {
                let prompt = `${aiBehavior}\n\nUser: ${snippet}\nCode Sensei:`;
                openai.createCompletion("text-davinci-002", {
                    prompt: prompt,
                    max_tokens: 300,
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
    
                    saveUser(interaction.user.id);
    
                    interaction.editReply(response);
                    
                    if (!data.firstTimeDM) {
                        let msg = `Thank you for using ${client.user.username}!\nThe question you asked, "*${snippet}*" used **${total}** of your **${beforeTokens}** tokens, you now have __${data.tokens}__ tokens remaining. In general, shorter questions use fewer tokens, so be as concise as you can!\nThis is the only time I will message you about this, with the exception of letting you know that you're running low. You can always use \`/tokens\` to see how many you have left, or how many were used by your last question.\nYou can find more information about tokens from [link not available yet]`;
                        interaction.user.send(msg).catch(err => {
                            interaction.channel.send(`<@${interaction.user.id}>, Looks like you have DM's disabled! Here is what I wanted to send to you:\n${msg}`);
                        });
                        data.firstTimeDM = true;
                    }

                    if (credited > 0) {
                        let msg = `${emotes.information} Oh no! Looks like you ran out of tokens on your last question. You have been credited **${credited}** to complete the snippet, and are now left with **${data.tokens}** tokens. Tokens will be reset on <t:${Math.round(resetTime.getTime() / 1000)}>`;
                        interaction.user.send(msg).catch(err => {
                            interaction.channel.send(`<@${interaction.user.id}>, Looks like you have DM's disabled! Here is what I wanted to send to you:\n${msg}`);
                        });
                    }
    
                    fs.appendFile(`./config/transcripts/${interaction.user.id}.txt`, `\nCode Sensei: ${response.trim()}`, err => {
                        if (err) {
                            console.error(err);
                            logToServer(`Failed to save transcript for ${interaction.user.id}.json\n${err.stack}`);
                        }
                    });
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