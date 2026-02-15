const {
  Client,
  GatewayIntentBits,
  Partials,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  PermissionsBitField
} = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel]
});

// ================= SLASH COMMANDS =================

const commands = [
  new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Shows the server rules'),

  new SlashCommandBuilder()
    .setName('server')
    .setDescription('Shows server information'),

  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason').setRequired(false)),

  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason').setRequired(false)),

  new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to mute').setRequired(true))
    .addIntegerOption(option =>
      option.setName('minutes').setDescription('Duration in minutes').setRequired(true)),

  new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason').setRequired(true)),

  new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Blacklist a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User').setRequired(true))
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Blacklist type')
        .setRequired(true)
        .addChoices(
          { name: 'Media', value: 'media' },
          { name: 'Staff', value: 'staff' }
        ))
].map(cmd => cmd.toJSON());

// ================= REGISTER COMMANDS =================

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('Slash commands registered.');
  } catch (err) {
    console.error(err);
  }
})();

// ================= INTERACTION HANDLER =================

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // ================= RULES =================
  if (commandName === 'rules') {
    const embed = new EmbedBuilder()
      .setTitle('📜 Server Rules')
      .setColor('Blue')
      .setDescription(`
1. Chat Conduct
Use respectful language at all times. Abusive messages, inappropriate jokes, harassment, or spreading false information are not allowed.
Do not flood the chat with repeated or similar messages, long texts, non-English characters, or excessive use of ALL CAPS. Spam of any kind is not permitted. Attempting to bypass the chat filter will lead to a harsher punishment.
Extreme toxicity, including death threats or other malicious comments, is not tolerated. If you’re unsure whether something crosses the line, don’t say it.

2. Unfair Gameplay
Any form of hacks, macros, X-ray packs, autoclickers, minimaps, inventory checkers, bug abuse, exploiting, duping, Litematica Easyplace, health indicators, or other disallowed modifications are prohibited. Final judgement on unfair advantages rests with staff.
Evading punishments through alternate accounts, usernames, or similar methods is forbidden.
EasyMC accounts are STRICTLY prohibited. Associating your account with one can result in a permanent ban.

3. Inappropriate Content & Discrimination
Discussions around sexual, hateful, or highly political topics are not welcome here.
Building inappropriate structures, or using offensive team names, usernames, skins, capes, items, pets, or signs is not allowed
Discrimination of any kind - whether based on age, gender, race, religion, disability, sex, or sexual orientation - will not be tolerated.
Sexism, racism, homophobia, and similar behaviour will result in serious punishment.

4. Advertising
Self-promotion and advertising other Minecraft/Discord servers is forbidden.
Item trading requests are allowed but cannot be publicly broadcast.
YouTube or stream links must be EuropeMC-related, shared no more than once every 5 minutes via /live, or posted in the media channel. We encourage you to make content about the server!

5. Scamming & Trading
Scamming involving items from the EuropeMC store or materials outside the server is not allowed.
In-game item scamming is permitted - so be careful who you trust.
Real money trading (IRL deals) is strictly forbidden and will lead to a permanent ban.
Scamming ranks is also a permanent ban offence with no appeal.

6. Threats
Doxing, DDoSing, harassment, blackmail, swatting, IP grabbing, malicious links, or any related threats will result in an instant network blacklist.
Sharing someone’s personal information is not allowed, regardless of whether it’s true.
Many of these actions are illegal. “Jokes” will be treated as seriously as real attempts.
Providing false or misleading information in appeals will extend your punishment.

7. Refunds Policy
Due to the intangible nature of our goods, items listed on our store are exempt from the Consumer Rights Act 2015. By purchasing an item on our store, you explicitly agree that our goods fall under the “computer software” and “personalised or custom made items”
categories which exempt you from a Right of Return. You also agree to indemnify EuropeMC for legal costs that arise from pursuing a refund externally.
      `);

    return interaction.reply({ embeds: [embed] });
  }

 // ================= SERVER =================
if (commandName === 'server') {
  const embed = new EmbedBuilder()
    .setTitle('🌍 EuropeMC Server Information')
    .setColor('Blue')
    .addFields(
      { name: 'Server IP', value: 'europemc.eu', inline: true },
      { name: 'Port', value: '19132', inline: true },
      { name: 'Version', value: '1.21+', inline: true },
      { name: 'Store', value: 'https://store.europemc.eu/', inline: false }
    )
    .setFooter({ text: 'Join now and start playing!' })
    .setTimestamp();

  return interaction.reply({ embeds: [embed] });
}

  // ================= BAN =================
  if (commandName === 'ban') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return interaction.reply({ content: 'No permission.', ephemeral: true });

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    await interaction.guild.members.ban(user.id, { reason });
    return interaction.reply(`🔨 ${user.tag} has been banned.`);
  }

  // ================= KICK =================
  if (commandName === 'kick') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return interaction.reply({ content: 'No permission.', ephemeral: true });

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(user.id);
    await member.kick(reason);
    return interaction.reply(`👢 ${user.tag} has been kicked.`);
  }

  // ================= MUTE =================
  if (commandName === 'mute') {
    const user = interaction.options.getUser('user');
    const minutes = interaction.options.getInteger('minutes');

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member)
      return interaction.reply({ content: 'User not found.', ephemeral: true });

    await member.timeout(minutes * 60 * 1000);
    return interaction.reply(`🔇 ${user.tag} muted for ${minutes} minutes.`);
  }

  // ================= WARN =================
  if (commandName === 'warn') {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    return interaction.reply(`⚠️ ${user.tag} warned. Reason: ${reason}`);
  }

  // ================= BLACKLIST =================
  if (commandName === 'blacklist') {
    const user = interaction.options.getUser('user');
    const type = interaction.options.getString('type');

    const roleName = type === 'media'
      ? 'Media Blacklist'
      : 'Staff Blacklist';

    const role = interaction.guild.roles.cache.find(r => r.name === roleName);
    if (!role)
      return interaction.reply({ content: `Role "${roleName}" not found.`, ephemeral: true });

    const member = await interaction.guild.members.fetch(user.id);
    await member.roles.add(role);

    return interaction.reply(`🚫 ${user.tag} blacklisted (${type}).`);
  }
});

client.login(TOKEN);

