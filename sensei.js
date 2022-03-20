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

const {REST}                            = require('@discordjs/rest');
const {Routes}                          = require('discord-api-types/v9');
const {Client, Intents, MessageEmbed}   = require('discord.js');
const {Configuration, OpenAIApi}        = require('openai');
const {encode}                          = require('gpt-3-encoder');
const {readFile, writeFile, appendFile} = require('fs');

// Emotes from my ServerHelper bot discord
let emotes = {
    approve: '<:approve:667547836719824931>',
    caution: '<:caution:667547836749185036>',
    information: '<:information:667547836467904523>',
    dash: '<:dash:774145605449547797>',
    deny: '<:deny:667547837017489409>'
}

// Load devs and testers
let devs = [];
readFile("./config/devs.txt", (err, data) => {
    if (err) 
        return console.error(err);

    devs = data.toString().split(/ +/g);
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
    let guild = message.guild;
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
    
    // Dev commands
    if (!devs.includes(message.author.id))
        return;

    let args = message.content.split(/ +/g);
    let cmd = args.shift().toLowerCase();

    let prefix = "cs";
    if (cmd.substring(0, prefix.length) !== prefix)
        return;

    let devGuild = message.guild.id == process.env.DEV_SERVER ? message.guild : await client.guilds.fetch(process.env.DEV_SERVER);

    switch(cmd) {
        case `${prefix}addtester`: {
            let id = args.shift();
            if (testers.includes(id)) 
                return message.reply(`${emotes.deny} Already a tester.`);

            let member;
            try {
                member = await devGuild.members.fetch(id);
            } catch (err) {
                message.reply(`${emotes.deny} Unable to find member on dev server.`);
            }

            if (member) 
                member.roles.add(process.env.TESTER_ROLE).then(member => {
                    testers.push(member.id);
                    writeFile("./config/testers.txt", testers.join(' '), err => message.reply(err ? `${emotes.deny} Failed to save tester file.\`\`\`\n${err.stack}\`\`\`` : `${emotes.approve} Success!`));
                }).catch(err => message.reply(`${emotes.deny} Failed to assign tester role.\`\`\`\n${err.stack}\`\`\``));
            else 
                message.reply(`${emotes.deny} Unable to find member on dev server.`);
        } break;

        case `${prefix}removetester`: {
            let id = args.shift();
            if (!testers.includes(id))
                return message.reply(`${emotes.deny} Not currently a tester.`);

                let member;
                try {
                    member = await devGuild.members.fetch(id);
                } catch (err) {
                    message.reply(`${emotes.deny} Unable to find member on dev server.`);
                }
    
                if (member) 
                    member.roles.remove(process.env.TESTER_ROLE).then(member => {
                        for (let i = 0; i < testers.length; i++) 
                            if (testers[i] === member.id)
                                testers.splice(i, 1);

                        writeFile("./config/testers.txt", testers.join(' '), err => message.reply(err ? `${emotes.deny} Failed to save tester file.\`\`\`\n${err.stack}\`\`\`` : `${emotes.approve} Success!`));
                    }).catch(err => message.reply(`${emotes.deny} Failed to remove tester role.\`\`\`\n${err.stack}\`\`\``));
                else 
                    message.reply(`${emotes.deny} Unable to find member on dev server.`);
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
        name: "userlookup",
        description: "Looks up some stuff on a user who has engaged with Code Sensei.",
        options: [{
            type: 6, // User
            name: "user",
            description: "The user to lookup."
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
    }
];

client.on('interactionCreate', interaction => {
    if (!interaction.isCommand()) return; 

    switch (interaction.commandName) {
        case "chat": {
            // Currently tester only. We need to verify :)
            if (!testers.includes(interaction.user.id) && !devs.includes(interaction.user.id))
                return interaction.reply(`${emotes.deny} I am currently only available to testers.`);

            let opts = interaction.options._hoistedOptions;
            if (!opts[0])
                return interaction.reply(`${emotes.deny} Please fill in the \`message\` argument.`);
            let input = opts[0].value;

            if (input.length > 500)
                return interaction.reply(`${emotes.deny} Please keep your messages to a length of 500! Your message was ${message.content.length} characters long.`);

            appendFile(`./config/transcripts/${interaction.user.id}.txt`, `\nUser: ${input}`, err => {if (err) console.error(err);});

            // interaction.channel.sendTyping().catch(console.error);

            let prompt = `${AI_Behavior}\n\nUser: ${input}\nCode Sensei:`;

            openai.createCompletion("text-davinci-002", {
                prompt: prompt,
                max_tokens: 100,
                stop: ['User:', 'Code Sensei:'],
                user: interaction.user.id
            }).then(completion => {
                let response = completion.data.choices[0].text;

                let behaviorTokens = encode(prompt).length;
                let answerTokens = encode(response).length;
                let total = behaviorTokens + answerTokens;

                let statsEmbed = new MessageEmbed();
                // statsEmbed.setTitle("Response");
                statsEmbed.setColor(0x0096ff);
                statsEmbed.setDescription(`${emotes.information} Tokens: __${behaviorTokens}__ for input, __${answerTokens}__ for answer (__${total}__ total).\n${emotes.approve} You've used **${total}**/0 of your token quota.`);

                // statsEmbed.addField("Input:", input);
                // statsEmbed.addField("Response:", response);

                interaction.reply({content: response, embeds: [statsEmbed]});
                appendFile(`./config/transcripts/${interaction.user.id}.txt`, `\nCode Sensei: ${response}`, err => {if (err) console.error(err)});
            }).catch(error => {
                console.log(error);
                interaction.reply(`${emotes.deny} Failed to process your request.`);
            });

        } break;
    
        case "userlookup": {
            let target = interaction.user.id;

            let opts = interaction.options._hoistedOptions;
            if (opts.length > 0) 
                target = opts[0].value;

            if (typeof target !== "string") {
                interaction.reply("Failed to get the user you specified.");
            } else {
                interaction.guild.members.fetch(target).then(member => {
                    // Stuff to display on a user
                    // Account access (standard, supporter, tester, developer)
                    // Watchlist status (none, on watchlist, blacklisted)

                    let embed = new MessageEmbed();
                    embed.setAuthor({name: member.displayName, iconURL: member.displayAvatarURL({dynamic: true})});
                    embed.setDescription(`Displaying user information for ${member.user.tag} (${member.user.id})`);

                    embed.addField("Access:", "standard | supporter | tester | developer");
                    embed.addField("Watchlist:", "Not on it. | On watchlist. | Blacklisted.")
                    
                    interaction.reply({embeds: [embed]});
                }).catch(err => {
                    interaction.reply("Failed to get the user you specified.");
                });
            }

        } break;
    }
});

client.on('ready', () => {
    bootTime = Date.now() - startupTime;
    console.log(`Connected to Discord! Took ${bootTime}ms`);
});