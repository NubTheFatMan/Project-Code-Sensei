// Used for tracking bot init time
let startupTime = Date.now();
let bootTime = null;

// Coding the AI :^)
const AI_Behavior = "Code Sensei is a Discord bot that's good and answering coding and math related questions. Code Sensei delivers quick but helpful responses in a polite manor. If they are asked a question that isn't relevant to math, coding, programming, or computer science, they politely decline to answer.";
let baseTokenCount = AI_Behavior.length / 4;
let baseCost = (baseTokenCount / 1000) * 0.06; // OpenAI charges 6 cents per 1000 tokens

// Load environment variables
require('dotenv').config();

const {REST}                      = require('@discordjs/rest');
const {Routes}                    = require('discord-api-types/v9');
const {Client, Intents}           = require('discord.js');
const {Configuration, OpenAIApi}  = require('openai');

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
    }
];

client.on('messageCreate', async message => {
    // Refresh slash commands
    if (message.guild && !refreshed.has(message.guild.id)) {
        try {
            console.log(`Refreshing slash commands for guild ${message.guild.id}.`);
            await rest.put(
                Routes.applicationGuildCommands(client.application.id, message.guild.id),
                {body: Commands}
            );
            console.log(`Successfully refreshed slash commands for ${message.guild.id}`);
            refreshed.add(message.guild.id);
        } catch (err) {
            console.error(err);
        }
    }

    // Sending messages to OpenAI
});

client.on('interactionCreate', interaction => {
    if (!interaction.isCommand()) return; 

    switch (interaction.commandName) {
        case "chat": 
            interaction.reply("I'm listening! How may I be of assistance?");
            break;
    }
});

client.on('ready', () => {
    // The await rest.put errors since it's not top level :yahuh:
    // client.guilds.cache.forEach((guild, id) => {
    //     try {
    //         console.log(`Refreshing slash commands for guild ${id}.`);
    //         await rest.put(
    //             Routes.applicationGuildCommands(client.application.id, id),
    //             {body: Commands}
    //         );
    //         console.log(`Successfully refreshed slash commands for ${id}`);
    //         refreshed.add(id);
    //     } catch (err) {
    //         console.error(err);
    //     }
    // });

    bootTime = Date.now() - startupTime;
    console.log(`Connected to Discord! Took ${bootTime}ms`);
});