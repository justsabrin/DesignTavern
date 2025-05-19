require('dotenv').config();  // Brug .env til at beskytte dine tokens

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

// Læs challenges én gang ved opstart
let challenges = [];

try {
    const data = fs.readFileSync('challenges.json', 'utf-8');
    challenges = JSON.parse(data);
    console.log('Challenges indlæst:', challenges.length);
} catch (err) {
    console.error('Fejl ved indlæsning af challenges.json:', err);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ]
});

// Slash-kommandoer
const commands = [
    {
        name: 'tavern',
        description: 'Får en besked om Design Tavern!',
    },
    {
        name: 'challenge',
        description: 'Får en design challenge!',
    },
];

client.once('ready', async () => {
    console.log('Klar!');

    const { REST } = require('@discordjs/rest');
    const { Routes } = require('discord-api-types/v9');

    const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('Registrerer slash commands...');
        await rest.put(Routes.applicationCommands(client.user.id), {
            body: commands,
        });
        console.log('Slash kommandoer registreret!');
    } catch (error) {
        console.error('Fejl ved registrering:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    switch (commandName) {
        case 'tavern':
            const embed = new EmbedBuilder()
                .setTitle("The Designer's Tavern")
                .setDescription("Velkommen, rejsende, til Designer's Tavern. Skriv `/challenge` for at få en designopgave!")
                .setColor(0xf5c518)
                .setImage("https://i.imgur.com/rVw6bLv.png")
                .setFooter({ text: "Tavernen åbner langsomt sine døre – vi finjusterer stadig!" });

            await interaction.reply({ embeds: [embed] });
            break;

        case 'challenge':
            try {
                if (challenges.length === 0) {
                    await interaction.reply("Der er ingen challenges tilgængelige endnu!");
                    return;
                }

                const challenge = challenges[Math.floor(Math.random() * challenges.length)];

                await interaction.reply(`
✨ **Design Challenge: ${challenge.title}**

**Beskrivelse:** ${challenge.description}
**Målgruppe:** ${challenge.targetAudience}
**Call to Action:** ${challenge.callToAction}
                `);
            } catch (error) {
                console.error('Fejl ved håndtering af challenge:', error);
                await interaction.reply("Noget gik galt med at hente din challenge.");
            }
            break;

        default:
            await interaction.reply({ content: 'Ukendt kommando.', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN).catch(console.error);
