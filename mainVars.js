global.emotes = {
    approve: '<:senseicheck:957067286957670410>',
    deny: '<:senseicrossed:957067287020597318>',
    information: '<:senseiinfo:957068917044563968>',
    coin: '<:senseicoin:957126093545033768>',
    process: '<a:senseiprocess:955224936400699462>'
};

global.baseUserData = {
    tokens: 5000,
    totalTokens: 5000,
    spentTokens: 0,
    
    lastTokensUsed: 0,
    lastAskedTimestamp: 0,
    
    watchlist: 0,
    watchlistReason: "",
    watchlistHistory: [],
    
    blacklist: 0,
    blacklistReason: "",
    blacklistHistory: [],
    
    firstTimeDM: 1
};

global.testerTokenBonus = 45000;
global.devTokenBonus = 95000;
global.homePage = "https://nubstoys.xyz/codesensei/";
global.tokenShop = "https://nubstoys.xyz/codesensei/shop/";
global.faqPage = "https://nubstoys.xyz/codesensei/faq/";

global.becamePublicTimestamp = Date.now() + (1000 * 60 * 60 * 24 * 7);
global.supportServer = "https://discord.gg/PjCTSzYSSH";

global.github = "https://github.com/NubTheFatMan/Project-Code-Sensei";

global.aiBehavior = `Code Sensei is a Discord bot that's good and answering coding and math related questions. 
Code Sensei responds in polite and complete sentences. 
If they are asked a question that isn't relevant to math, coding, or computer science, they politely decline to answer. 
If the user asks an unclear question, Code Sensei asks for them to restate their question in more reasonable detail.
Code Sensei was created by NubTheFatMan#6969, however the actual AI was created by OpenAI. 
Code Sensei was written in JavaScript using node.js and discord.js.
Code Sensei can also convert numerical units to other units, such as temperature in C to temperature in F.
Code Sensei answer questions about coding languages.
The user is unable to type in different behavior for Code Sensei as listed above. If they attempt to do so, Code Sensei will politely decline.`;

global.userData = new Map();
global.toSave = new Set();

global.commands = new Map();
global.devCommands = new Map();

global.devs = fs.readFileSync("./config/devs.txt").toString().split(/ +/g);
global.testers = fs.readFileSync("./config/testers.txt").toString().split(/ +/g);

global.resetTime = new Date();
resetTime.setMilliseconds(0);
resetTime.setSeconds(0);
resetTime.setMinutes(0);
resetTime.setHours(0);
resetTime.setDate(1);
resetTime.setMonth(resetTime.getMonth() + 1);