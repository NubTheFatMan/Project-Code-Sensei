global.Stopwatch = require('@sapphire/stopwatch').Stopwatch;

let startupTime = new Stopwatch();
global.initTime = null;

global.testMode = false;

console.log("starting...");

// Load environment variables
require('dotenv').config();

global.Discord   = require('discord.js');
global.OpenAI    = require('openai');
global.gptEncode = require('gpt-3-encoder').encode;
global.fs        = require('fs');
global.Jimp      = require('jimp');
global.mysql     = require('mysql');

// Load main variables
require("./mainVars.js");

// OpenAI
global.aiConfig = new OpenAI.Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

global.openai = new OpenAI.OpenAIApi(aiConfig);

// Discord
global.client = new Discord.Client({intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGES
]});

global.applyGlobalCommands = () => {
    if (!client.isReady()) return;

    let commandTree = [];
    for (let [name, command] of commands) {
        commandTree.push(command.structure);
    }

    client.application.commands.set(commandTree);
}

client.on('ready', () => {
    applyGlobalCommands();
    
    initTime = startupTime.stop().toString();
    console.log(`Connected to Discord! Took ${initTime}`);
    logToServer(`Connected to Discord! Took ${initTime}`);
});

global.loadFile = file => {
    if (require.cache[require.resolve(file)]) 
        delete require.cache[require.resolve(file)];

    let plugin = require(file);

    if (plugin.type === "command") {
        commands.set(plugin.structure.name, plugin);
    } else if (plugin.type === "devCommand") {
        devCommands.set(plugin.name, plugin);
    }

    return plugin;
}

global.requireAll = dir => {
    let required = 0;
    fs.readdirSync(dir).forEach(file => {
        let path = `${dir}/${file}`;
        if (fs.statSync(path).isDirectory()) {
            requireAll(path);
        } else if (path.endsWith(".js")) {
            loadFile(path);
            required++;
        }
    });
    return required;
}
requireAll("./plugins");

client.login(testMode ? process.env.TEST_BOT_TOKEN : process.env.DISCORD_BOT_TOKEN);