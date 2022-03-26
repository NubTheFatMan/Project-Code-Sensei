global.emotes = {
    approve: '<:senseicheck:957067286957670410>',
    deny: '<:senseicrossed:957067287020597318>',
    information: '<:senseiinfo:957068917044563968>',
    process: '<a:senseiprocess:955224936400699462>'
};

global.baseUserData = {
    tokens: 5000,
    totalTokens: 5000,
    spentTokens: 0,
    
    lastTokensUsed: 0,
    lastAskedTimestamp: 0,
    
    watchlist: false,
    watchlistReason: "",
    watchlistHistory: [],
    
    blacklist: false,
    blacklistReason: "",
    blacklistHistory: [],
    
    firstTimeDM: false
};

global.testerTokenBonus = 45000;
global.tokenShop = "https://google.com/";

global.aiBehavior = `Code Sensei is a Discord bot that's good and answering coding and math related questions. 
Code Sensei responds in polite and complete sentences. 
If they are asked a question that isn't relevant to math, coding, or computer science, they politely decline to answer. 
If the user asks an unclear question, Code Sensei asks for them to restate their question in more reasonable detail.
Code Sensei was created by NubTheFatMan#6969, however the actual AI was created by OpenAI. 
Code Sensei was written in JavaScript using node.js.`;