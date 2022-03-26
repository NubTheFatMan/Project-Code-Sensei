client.on('interactionCreate', interaction => {
    if (!interaction.isCommand()) return;

    let data = getUserData(interaction.user.id);
    if (data.blacklist) return interaction.reply(`${emotes.deny} You are blacklisted from using commands.`);

    if (!testers.includes(interaction.user.id) && !devs.includes(interaction.user.id)) 
        return interaction.reply(`${emotes.deny} I am currently only available to testers. Interested? DM <@${devs.join('> <@')}>.`);

    let ran = false;
    
    for (let cmd of commands) {
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