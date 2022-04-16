client.on('interactionCreate', interaction => {
    if (!interaction.isCommand()) return;

    database.query(`SELECT * FROM \`users\` WHERE \`userid\` = '${interaction.user.id}'`, (err, result) => {
        if (err) throw err;

        if (result.length === 0) {
            database.query(`INSERT INTO \`users\` (\`userid\`) VALUES ('${interaction.user.id}')`, err => {
                if (err) throw err;
            });
        }

        let data = result[0];

        if (data.blacklisted) return interaction.reply(`${emotes.deny} You are blacklisted from using commands.`);

        if (!testers.includes(interaction.user.id) && !devs.includes(interaction.user.id)) {
            return interaction.reply(`${emotes.deny} I am currently only available to testers. Interested? DM <@${devs.join('> <@')}>.`);
        }

        let ran = false;
        
        for (let cmd of commands.values()) {
            if (cmd.structure.name === interaction.commandName) {
                try {
                    cmd.onCall(interaction, data);
                    ran = true;
                } catch (err) {
                    console.error(err);
                    interaction.reply(`${emotes.deny} An error occured while executing that command.\`\`\`\n${err.stack}\`\`\``);
                    logToServer(`${interaction.user.tag} used command ${interaction.commandName} but an error occured:\n${err.stack}`);
                }
                return;
            }
        }

        if (!ran) interaction.reply(`${emotes.deny} That command does not exist. *How did you get here??*`);
    });    
});