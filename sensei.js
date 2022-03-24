// Used for tracking bot init time
let startupTime = Date.now();
let bootTime = null;

// Coding the AI :^)
const AI_Behavior = `Code Sensei is a Discord bot that's good and answering coding and math related questions. 
Code Sensei responds in polite and complete sentences. 
If they are asked a question that isn't relevant to math, coding, or computer science, they politely decline to answer. 
If the user asks an unclear question, Code Sensei asks for them to restate their question in more reasonable detail.
Code Sensei was created by NubTheFatMan#6969, however the actual AI was created by OpenAI. 
Code Sensei was written in JavaScript using node.js.`;

// Load environment variables
require('dotenv').config();

const {REST}                                          = require('@discordjs/rest');
const {Routes}                                        = require('discord-api-types/v9');
const {Client, Intents, MessageEmbed}                 = require('discord.js');
const {Configuration, OpenAIApi}                      = require('openai');
const {encode}                                        = require('gpt-3-encoder');
const {readFile, writeFile, appendFile, readFileSync} = require('fs');

// Emotes from my ServerHelper bot discord
let emotes = {
    approve: '<:approve:667547836719824931>',
    caution: '<:caution:667547836749185036>',
    information: '<:information:667547836467904523>',
    dash: '<:dash:774145605449547797>',
    deny: '<:deny:667547837017489409>',
    link: '<:link:776234610317066261>',
    process: '<a:senseiprocess:955224936400699462>'
}

// Load devs and testers
let devs = [];
readFile("./config/devs.txt", (err, data) => {
    if (err) 
        return console.error(err);

    devs = data.toString().split(/ +/g);
});

let nolimits = [];
readFile("./config/nolimits.txt", (err, data) => {
    if (err) 
        return console.error(err);

    nolimits = data.toString().split(/ +/g);
});

let testers = [];
readFile("./config/testers.txt", (err, data) => {
    if (err) 
        return console.error(err);

    testers = data.toString().split(/ +/g);
});

// OpenAI
const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(config);

// Discord
let intents = [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGES
];

let client = new Client({intents: intents});

client.login(process.env.DISCORD_BOT_TOKEN);

// Slash commands / messages
const rest = new REST({version: '9'}).setToken(process.env.DISCORD_BOT_TOKEN);

let refreshed = new Set();

client.on('guildCreate', async guild => {
    // Create the slash commands
    if (!refreshed.has(guild.id)) {
        try {
            console.log(`Refreshing slash commands for guild ${guild.id}.`);
            await rest.put(
                Routes.applicationGuildCommands(client.application.id, guild.id),
                {body: Commands}
            );
            console.log(`Successfully refreshed slash commands for ${guild.id}`);
            refreshed.add(guild.id);
        } catch (err) {
            console.error(err);
        }
    }
});

client.on('messageCreate', async message => {
    // Refresh slash commands. Will be removed when bot commands are about final
    // if (message.guild) {
    //     let guild = message.guild;
    //     if (!refreshed.has(guild.id)) {
    //         try {
    //             console.log(`Refreshing slash commands for guild ${guild.id}.`);
    //             await rest.put(
    //                 Routes.applicationGuildCommands(client.application.id, guild.id),
    //                 {body: Commands}
    //             );
    //             console.log(`Successfully refreshed slash commands for ${guild.id}`);
    //             refreshed.add(guild.id);
    //         } catch (err) {
    //             console.error(err);
    //         }
    //     }
    // }
    
    // Dev commands
    if (!devs.includes(message.author.id))
        return;

    let args = message.content.split(/ +/g);
    let cmd = args.shift().toLowerCase();

    let prefix = "cs";
    if (cmd.substring(0, prefix.length) !== prefix)
        return;

    switch(cmd) {
        case `${prefix}addtester`: {
            let id = args.shift();
            if (testers.includes(id)) 
                return message.reply(`${emotes.deny} Already a tester.`);

            testers.push(id);
            writeFile("./config/testers.txt", testers.join(' '), err => message.reply(err ? `${emotes.deny} Failed to save tester file.\`\`\`\n${err.stack}\`\`\`` : `${emotes.approve} Success!`));
        } break;

        case `${prefix}removetester`: {
            let id = args.shift();
            if (!testers.includes(id))
                return message.reply(`${emotes.deny} Not currently a tester.`);

            for (let i = 0; i < testers.length; i++) {
                if (testers[i] === id) {
                    testers.splice(i, 1);
                    break;
                }
            }

            writeFile("./config/testers.txt", testers.join(' '), err => message.reply(err ? `${emotes.deny} Failed to save tester file.\`\`\`\n${err.stack}\`\`\`` : `${emotes.approve} Success!`));
    
        } break;

        case `${prefix}nolimits`: {
            let id = args.shift();
            if (nolimits.includes(id)) 
                return message.reply(`${emotes.deny} Already a tester.`);

            nolimits.push(id);
            writeFile("./config/nolimits.txt", nolimits.join(' '), err => message.reply(err ? `${emotes.deny} Failed to save file.\`\`\`\n${err.stack}\`\`\`` : `${emotes.approve} Success!`));
        } break;

        case `${prefix}limit`: {
            let id = args.shift();
            if (!nolimits.includes(id))
                return message.reply(`${emotes.deny} Not currently a tester.`);

            for (let i = 0; i < nolimits.length; i++) {
                if (nolimits[i] === id) {
                    nolimits.splice(i, 1);
                    break;
                }
            }

            writeFile("./config/nolimits.txt", nolimits.join(' '), err => message.reply(err ? `${emotes.deny} Failed to save file.\`\`\`\n${err.stack}\`\`\`` : `${emotes.approve} Success!`));
    
        } break;

        case `${prefix}settokens`: {
            let id = args.shift();

            let data;
            if (userdata.has(id)) {
                data = userdata.get(id);
            } else {
                try {
                    let file = readFileSync(`./config/users/${id}.json`);
                    data = JSON.parse(file);
                } catch (err) {
                    message.reply(`${emotes.deny} No user found.`);
                }
            }

            if (data) {
                let value = args.shift();

                let method = value[0];
                value = Number(["+", "-"].includes(method) ? value.substring(1) : value);

                if (typeof value !== 'number')
                    return message.reply(`${emotes.deny} Invalid number`);

                switch (method) {
                    case "+": 
                        data.tokens += value;
                    break;

                    case "-": 
                        data.tokens -= value;
                    break;

                    default: 
                        data.tokens = value;
                    break;
                }

                if (!userdata.has(id))
                    userdata.set(id, data);

                saveUser(id);

                message.reply(`${emotes.approve} User now has **${data.tokens}** tokens.`);
            }
        } break;

        case `${prefix}tokens`: {
            let id = args.shift();

            let data;
            if (userdata.has(id)) {
                data = userdata.get(id);
            } else {
                try {
                    let file = readFileSync(`./config/users/${id}.json`);
                    data = JSON.parse(file);
                } catch (err) {
                    message.reply(`${emotes.deny} No user found.`);
                }
            }

            if (data) {
                message.reply(`${emotes.approve} User has **${data.tokens}** tokens.`);
            }
        } break;
    }
});

const Commands = [
    {
        name: "about",
        description: "Learn more about Code Sensei."
    },
    {
        name: "chat",
        description: "Code Sensei will start listening to your messages. Your messages must be 400 characters or less.",
        options: [{
            type: 3,
            name: "message",
            description:"What to have the bot help you with."
        }]
    },
    {
        name: "feedback",
        description: "Leave feedback for Code Sensei.",
        options: [{
            type: 3,
            name: "message",
            description:"Any issues or suggestions."
        }]
    },
    {
        name: "tokens",
        description: "See how many tokens you have."
    }
];

let userdata = new Map();

let baseUserData = {
    tokens: 10000,
    totalEarned: 10000,
    spentTokens: 0,
    lastTokensUsed: 0,
    watchlist: false,
    blacklist: false,
    blacklistReason: "",
    firstTimeDM: false,
};

let testerBonus = 40000; // Testers get an extra 40k, for a total of 50k tokens
let costPerThousandTokens = 0.06; // Used to calculate how much money someone has spent :^)

let toSave = new Set();
function saveUser(id) {
    if (!userdata.has(id)) return;
    if (!toSave.has(id)) toSave.add(id);
}

setInterval(() => {
    // Save info every 30 seconds
    toSave.forEach(id => {
        if (userdata.has(id))
            writeFile(`./config/users/${id}.json`, JSON.stringify(userdata.get(id)), err => {if (err) console.error(err);});
    });
    toSave.clear();
}, 30000);

let toxicThreshold = -0.355;
function contentFilter(res) {
    let label = res.choices[0].text;

    if (label === "2") {
        let logprobs = res.choices[0].logprobs.top_logprobs[0];

        if (logprobs["2"] < toxicThreshold) {
            let lp0 = logprobs["0"];
            let lp1 = logprobs["1"];

            if (lp0 !== undefined && lp1 !== undefined) {
                if (lp0 >= lp1) label = "0";
                else label = "1";
            } else if (lp0 !== undefined) label = "0";
            else if (lp1 !== undefined) label = "1";
        }
    }

    if (label < 0 || label > 2) label = "2"; // So glad strings can act like numbers :^)

    return label;
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return; 

    switch (interaction.commandName) {
        case "chat": {
            // Verify user data
            let userid = interaction.user.id;
            let data;
            if (!userdata.get(userid)) {
                try {
                    let file = readFileSync(`./config/users/${userid}.json`);
                    data = JSON.parse(file.toString()); 

                    userdata.set(userid, data);
                } catch (err) {
                    // The readfile should only error if the file doesn't exist, so we'll make new data
                    data = {};
                    
                    Object.assign(data, baseUserData);
            
                    // If they are a tester, add some more tokens
                    if (testers.includes(userid))
                        data.tokens += testerBonus;
            
                    userdata.set(userid, data);
                    
                    writeFile(`./config/users/${userid}.json`, JSON.stringify(data), err => {if (err) console.error(err)});
                }
            } else {
                data = userdata.get(userid);
            }

            if (data.blacklist)
                return interaction.reply(`${emotes.deny} You are blacklisted from using me.`);

            // Currently tester only. We need to verify :)
            if (!testers.includes(interaction.user.id) && !devs.includes(interaction.user.id))
                return interaction.reply(`${emotes.deny} I am currently only available to testers.`);

            if (data.tokens <= 0) {
                let bonusTime = new Date();
                bonusTime.setMonth(bonusTime.getMonth() + 1);
                bonusTime.setDate(1);
                bonusTime.setHours(0);
                bonusTime.setMinutes(0);
                bonusTime.setSeconds(0);
                bonusTime.setMilliseconds(0);

                let embed = new MessageEmbed();
                embed.setDescription(`${emotes.deny} Looks like you're out of tokens. You can go [here](https://google.com/) and support ${client.user.username} for more, or wait till <t:${bonusTime.getTime() / 1000}> to receive some more.`);
                embed.setColor(0xff6262);

                interaction.reply({embeds: [embed]});

                return;
            }

            let opts = interaction.options._hoistedOptions;
            if (!opts[0])
                return interaction.reply(`${emotes.deny} Please fill in the \`message\` argument.`);
            let input = opts[0].value;

            if (input.length > 500)
                return interaction.reply(`${emotes.deny} Please keep your messages to a length of 500! Your message was ${message.content.length} characters long.`);

            appendFile(`./config/transcripts/${interaction.user.id}.txt`, `\nUser: ${input}`, err => {if (err) console.error(err);});

            let canSend = true;
            try {
                await interaction.reply(emotes.process);
            } catch (err) { canSend = false; }
            if (!canSend) return;

            let prompt = `${AI_Behavior}\n\nUser: ${input}\nCode Sensei:`;

            // OpenAI requires me to pass the user input through a content filter.
            // https://beta.openai.com/docs/engines/content-filter
            openai.createCompletion("content-filter-alpha", {
                prompt: `<|endoftext|>${input}\n--\nLabel:`,
                temperature: 0,
                max_tokens: 1,
                top_p: 0,
                logprobs: 10
            }).then(filterResults => {
                let content = contentFilter(filterResults.data);

                if (content > 0) {
                    interaction.editReply(`${emotes.deny} Your message has not passed the content filture. It has been determined to be against OpenAI's content policies.`);
                } else {
                    openai.createCompletion("text-davinci-002", {
                        prompt: prompt,
                        max_tokens: 300,
                        stop: ['User:', 'Code Sensei:'],
                        user: interaction.user.id
                    }).then(completion => {
                        let response = completion.data.choices[0].text;
        
                        if (devs.includes(interaction.user.id) || nolimits.includes(interaction.user.id))
                            data.tokens = 1000000;
        
                        let beforeTokens = data.tokens;
        
                        let behaviorTokens = encode(prompt).length;
                        let answerTokens = encode(response).length;
                        let total = behaviorTokens + answerTokens;
        
                        data.tokens -= total;
                        let credited = 0;
                        if (data.tokens < 0) {
                            credited -= data.tokens;
                            data.tokens += credited;
                        }
        
                        data.spentTokens += total;
                        data.lastTokensUsed = total;
        
                        saveUser(interaction.user.id);
        
                        interaction.editReply(response);
                        
                        if (!data.firstTimeDM) {
                            let msg = `Thank you for using ${client.user.username}!\nThe question you asked, "*${input}*" used **${total}** of your **${beforeTokens}** tokens, you now have __${data.tokens}__ tokens remaining. In general, shorter questions use fewer tokens, so be as concise as you can!\nThis is the only time I will message you about this, with the exception of letting you know that you're running low. You can always use \`/tokens\` to see how many you have left, or how many were used by your last question.\nYou can find more information about tokens from [link not available yet]`;
                            interaction.user.send(msg).catch(err => {
                                interaction.channel.send(`<@${interaction.user.id}>, Looks like you have DM's disabled! Here is what I wanted to send to you:\n${msg}`);
                            });
                            data.firstTimeDM = true;
                        }

                        if (credited > 0) {
                            let bonusTime = new Date();
                            bonusTime.setMonth(bonusTime.getMonth() + 1);
                            bonusTime.setDate(1);
                            bonusTime.setHours(0);
                            bonusTime.setMinutes(0);
                            bonusTime.setSeconds(0);
                            bonusTime.setMilliseconds(0);
                            let msg = `${emotes.information} Oh no! Looks like you ran out of tokens on your last question. You have been credited **${credited}** to complete the message, and are now left with **0** tokens. Tokens will be reset <t:${Math.round(bonusTime.getTime() / 1000)}>`;
                            interaction.user.send(msg).catch(err => {
                                interaction.channel.send(`<@${interaction.user.id}>, Looks like you have DM's disabled! Here is what I wanted to send to you:\n${msg}`);
                            });
                        }
        
                        appendFile(`./config/transcripts/${interaction.user.id}.txt`, `\nCode Sensei: ${response.trim()}`, err => {if (err) console.error(err)});
                    }).catch(error => {
                        console.log(error);
                        interaction.editReply(`${emotes.deny} Failed to process your request. Tokens have not been deducted.`);
                    });
                }
            }).catch(err => {
                console.error(err);
                interaction.editReply(`${emotes.deny} Unable to process your message through the content filter.`);
            });
        } break;
    
        case "tokens": {
            if (!userdata.has(interaction.user.id))
                return interaction.reply(`${emotes.information} Looks like you haven't used me before! You have **${baseUserData.tokens}** tokens.`);
            
            let data = userdata.get(interaction.user.id);

            let embed = new MessageEmbed();
            embed.setColor(0x0096ff);
            embed.setDescription(`${emotes.information} Your last question used **${data.lastTokensUsed}** tokens. You have __${data.tokens}__ tokens remaining.`);

            interaction.reply({embeds: [embed]});
        } break;
    }
});

client.on('ready', () => {
    bootTime = Date.now() - startupTime;
    console.log(`Connected to Discord! Took ${bootTime}ms`);
});