// exports.type = "command";
// This command is unused since I don't have access yet. Maybe I will when I switch from a trial OpenAI account to a paid one.

exports.structure = {
    name: "edit",
    description: "Code Sensei will edit your input following your instructions. Great for translating.",
    options: [{
        name: "input",
        description: "The source to modify. (max length 500",
        type: 3,
        required: true
    }, 
    {
        name: "instructions",
        description: "What to do with the input. (max length 100)",
        type: 3,
        required: true
    }]
}

exports.onCall = (interaction, data) => {
    if (data.tokens < 1) {
        return interaction.reply(noTokens());
    }

    let input = interaction.options.get("input");
    if (!input) {
        interaction.reply(`${emotes.deny} You must provide an input to edit!`);
        return;
    }

    input = input.value;

    if (input.length > 500) {
        interaction.reply(`${emotes.deny} Input is too long!`);
        return;
    }

    let instructions = interaction.options.get("instructions");
    if (!instructions) {
        interaction.reply(`${emotes.deny} You must provide instructions on how to handle the input!`);
        return;
    }

    instructions = instructions.value;

    if (instructions.length > 100) {
        interaction.reply(`${emotes.deny} Instructions are too long!`);
        return;
    }

    interaction.reply(emotes.process).then(() => {
        openai.createEdit("text-davinci-002", {
            input: input,
            instruction: instructions
        }).then(edit => {
            let response = edit.data.choices[0].text;

            interaction.editReply(response);
        }).catch(err => {
            interaction.editReply(`${emotes.deny} An error occurred while editing your input.\n${err}`);
        });
    });
}