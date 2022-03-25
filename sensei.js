// Used for tracking bot init time
let startupTime = Date.now();
global.initTime = null;

console.log("starting...");

// Load environment variables
require('dotenv').config();

global.Discord   = require('discord.js');
global.OpenAI    = require('openai');
global.gptEncode = require('gpt-3-encoder').encode;
global.fs        = require('fs');

// Load devs and testers
global.devs = fs.readFileSync("./config/devs.txt").toString().split(/ +/g);
global.testers = fs.readFileSync("./config/testers.txt").toString().split(/ +/g);

// Load main variables
require("./mainVars.js");

global.userData = new Map();
global.toSave = new Set();

global.plugins = [];
global.commands = [];
global.devCommands = [];

// OpenAI
let aiConfig = new OpenAI.Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

global.openai = new OpenAI.OpenAIApi(aiConfig);

// Discord
global.client = new Discord.Client({intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGES
]});

let commandTree = [];
let storedCommandTree = fs.readFileSync("./config/commandTree.json");
client.on('ready', () => {
    if (commandTree !== storedCommandTree) {
        client.application.commands.set(commandTree);
        fs.writeFile("./config/commandTree.json", JSON.stringify(commandTree), err => {
            if (err) console.error(err);    
        });
    }
    
    initTime = Date.now() - startupTime;
    console.log(`Connected to Discord! Took ${initTime}ms`);
});

global.requireAll = dir => {
    fs.readdirSync(dir).forEach(file => {
        let path = `${dir}/${file}`;
        if (fs.statSync(path).isDirectory()) {
            requireAll(path);
        } else if (path.endsWith(".js")) {
            if (require.cache[require.resolve(path)]) 
                delete require.cache[require.resolve(path)];
            
            let plugin = require(path);
            plugins.push(plugin);
            
            if (plugin.type === "command") {
                if (process.env.TEST_MODE) plugin.structure.name = "test-" + plugin.structure.name;
                commands.push(plugin);
                commandTree.push(plugin.structure);
            } else if (plugin.type === "devCommand") {
                devCommands.push(plugin);
            }
        }
    });
}
requireAll("./plugins");

client.login(process.env.TEST_MODE ? process.env.TEST_BOT_TOKEN : process.env.DISCORD_BOT_TOKEN);