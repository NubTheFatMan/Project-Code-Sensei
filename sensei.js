// Used for tracking bot init time
let startupTime = Date.now();
let bootTime = null;

// Coding the AI :^)
const AI_Behavior = `Code Sensei is a Discord bot that's good and answering coding and math related questions. Code Sensei responds in polite and complete sentences. If they are asked a question that isn't relevant to math, coding, programming, or computer science, they politely decline to answer.

User: What should I eat tonight?
Code Sensei: Unfortunely, I cannot answer that. I am designed to help you with math, coding, or things relating to computer science.

User: What is 2 + 2?
Code Sensei: 2 + 2 equals 4.`;
// The user: and code sensei: dialogue is examples of how it should behave (it learns from it being passed to OpenAI)

let baseTokenCount = AI_Behavior.length / 4;
let baseCost = (baseTokenCount / 1000) * 0.06; // OpenAI charges 6 cents per 1000 tokens

// Load environment variables
require('dotenv').config();

const {REST}                          = require('@discordjs/rest');
const {Routes}                        = require('discord-api-types/v9');
const {Client, Intents, MessageEmbed} = require('discord.js');
const {Configuration, OpenAIApi}      = require('openai');
const {readFile, writeFile, write}           = require('fs');

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
    if (!refreshed.has(message.guild.id)) {
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
                return message.reply('Already a tester.');

            let member;
            try {
                member = await devGuild.members.fetch(id);
            } catch (err) {
                message.reply(`Unable to find member on dev server.`);
            }

            if (member) 
                member.roles.add(process.env.TESTER_ROLE).then(member => {
                    testers.push(member.id);
                    writeFile("./config/testers.txt", testers.join(' '), err => message.reply(err ? `Failed to save tester file.\`\`\`\n${err.stack}\`\`\`` : "Success!"));
                }).catch(err => message.reply(`Failed to assign tester role.\`\`\`\n${err.stack}\`\`\``));
            else 
                message.reply('Unable to find member on dev server.');
        } break;

        case `${prefix}removetester`: {
            let id = args.shift();
            if (!testers.includes(id))
                return message.reply('Not a tester.');

                let member;
                try {
                    member = await devGuild.members.fetch(id);
                } catch (err) {
                    message.reply(`Unable to find member on dev server.`);
                }
    
                if (member) 
                    member.roles.remove(process.env.TESTER_ROLE).then(member => {
                        for (let i = 0; i < testers.length; i++) 
                            if (testers[i] === member.id)
                                testers.splice(i, 1);

                        writeFile("./config/testers.txt", testers.join(' '), err => message.reply(err ? `Failed to save tester file.\`\`\`\n${err.stack}\`\`\`` : "Success!"));
                    }).catch(err => message.reply(`Failed to remove tester role.\`\`\`\n${err.stack}\`\`\``));
                else 
                    message.reply('Unable to find member on dev server.');
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
        description: "Code Sensei will start listening to your messages. Your messages must be 400 characters or less."
    },
    {
        name: "stop",
        description: "Lets Code Sensei know you no longer wish to chat. It will send a transcription of the conversation."
    },
    {
        name: "userlookup",
        description: "Looks up some stuff on a user who has engaged with Code Sensei.",
        options: [{
            type: 6, // User
            name: "user",
            description: "The user to lookup."
        }]
    }
];

client.on('interactionCreate', interaction => {
    if (!interaction.isCommand()) return; 

    switch (interaction.commandName) {
        case "chat": 
            interaction.reply("Hello! How may I be of assistance to you?");
            console.log(`Chatting with ${interaction.user.tag} (${interaction.user.id}).`);
            let filter = m => m.author.id === interaction.user.id && m.content !== "/stop";
            let collector = interaction.channel.createMessageCollector({filter: filter, idle: 60000});

            collector.on('collect', message => {
                message.channel.sendTyping().catch(console.error);

                let prompt = `${AI_Behavior}\n\nCode Sensei: Hello! How may I be of assistance to you?\nUser: ${message.content}\nCode Sensei:`;

                openai.createCompletion("text-davinci-002", {
                    prompt: prompt,
                    max_tokens: 500,
                    stop: ['User:', 'Code Sensei:']
                }).then(completion => {
                    message.channel.send(completion.data.choices[0].text);
                }).catch(error => {
                    console.log(error);
                });
            });
            collector.on('end', collected => {

            });
        break;
    
        case "userlookup":
            let target = interaction.user.id;

            let opts = interaction.options._hoistedOptions;
            if (opts.length > 0) 
                target = opts[0].value;

            if (typeof target !== "string") {
                interaction.reply("Failed to get the user you specified.");
            } else {
                interaction.guild.members.fetch(target).then(member => {
                    let embed = new MessageEmbed();
                    embed.setAuthor({name: member.displayName, iconURL: member.displayAvatarURL({dynamic: true})});
                    embed.setDescription(`Displaying user information for ${member.user.tag} (${member.user.id})`);

                    embed.addField("Access:", "standard");
                    
                    interaction.reply({embeds: [embed]});
                }).catch(err => {
                    interaction.reply("Failed to get the user you specified.");
                });
            }

        break;
    }
});

client.on('ready', () => {
    bootTime = Date.now() - startupTime;
    console.log(`Connected to Discord! Took ${bootTime}ms`);
});