setInterval(() => {
    for (let user of toSave) {
        if (!userData.has(user)) continue;
        fs.writeFile(`./config/users/${user}.json`, JSON.stringify(userData.get(user)), err => {
            if (err) console.error(err);
        });   
    }
    
    if (toSave.size > 0){
        console.log(`Saved ${toSave.size} users.`);
        toSave.clear();
    }
}, 30000);

global.saveUser = id => {
    if (!userData.has(id)) return;
    toSave.add(id);
}

global.getUserData = id => {
    if (!userData.has(id)) {
        try {
            userData.set(id, JSON.parse(fs.readFileSync(`./config/users/${id}.json`)));
        } catch (err) {
            let data = {};
            Object.assign(data, baseUserData);

            if (testers.includes(id)) {
                data.tokens += testerTokenBonus;
                data.totalTokens += testerTokenBonus;
            }

            userData.set(id, data);
            saveUser(id);
        }
    }
    
    return userData.get(id);
}