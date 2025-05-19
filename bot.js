require('dotenv').config();  // Brug dotenv til at beskytte dine tokens

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');
const serviceAccount = require(process.env.FIREBASE_KEY_PATH);

// Firebase initialisering
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Opretter en Discord klient med de nødvendige intents
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

// Når botten er klar, registreres kommandoerne
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

// Håndtering af slash commands
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
                // Hent alle challenges fra Firestore
                const snapshot = await db.collection('challenges').get();
                const challenges = snapshot.docs.map(doc => doc.data());

                if (challenges.length === 0) {
                    await interaction.reply("Der er ingen challenges tilgængelige endnu!");
                    return;
                }

                // Vælg en tilfældig challenge
                const challenge = challenges[Math.floor(Math.random() * challenges.length)];

                await interaction.reply(`
✨ **Design Challenge: ${challenge.title}**

**Beskrivelse:** ${challenge.description}
**Målgruppe:** ${challenge.targetAudience}
**Call to Action:** ${challenge.callToAction}
                `);
            } catch (error) {
                console.error('Fejl ved hentning af challenge:', error);
                await interaction.reply("Noget gik galt med at hente din challenge.");
            }
            break;

        default:
            await interaction.reply({ content: 'Ukendt kommando.', ephemeral: true });
    }
});

// Logger botten ind
client.login(process.env.DISCORD_TOKEN).catch(console.error);
