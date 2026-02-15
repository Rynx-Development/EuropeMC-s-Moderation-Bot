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
const CLIENT_ID = process.env.CLIENT_ID; // we will set this in Railway
const GUILD_ID = process.env.GUILD_ID;   // we will set this too

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel]
});


// ================= COMMANDS =================

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
      option.setName('user')
        .setDescription('User to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for ban')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for kick')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to mute')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('minutes')
        .setDescription('Mute duration in minutes')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for warning')
        .setRequired(true)),

  if (commandName === 'blacklist') {
  const user = interaction.options.getUser('user');
  const type = interaction.options.getString('type');

  let roleName;

  if (type === 'media') roleName = 'Media Blacklist';
  if (type === 'staff') roleName = 'Staff Blacklist';

  const role = interaction.guild.roles.cache.find(r => r.name === roleName);
  if (!role) return interaction.reply({ content: `Role "${roleName}" not found.`, ephemeral: true });

  const member = await interaction.guild.members.fetch(user.id);
  await member.roles.add(role);

  await interaction.reply(`🚫 ${user.tag} has been blacklisted (${type}).`);
}


].map(command => command.toJSON());


// ================= REGISTER COMMANDS =================

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Registering slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    console.log('Slash commands registered.');
  } catch (error) {
    console.error(error);
  }
})();


// ================= INTERACTIONS =================

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // /rules
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

3. Inappropriate Content &  Discrimination
Discussions around sexual, hateful, or highly political topics are not welcome here.
Building inappropriate structures, or using offensive team names, usernames, skins, capes, items, pets, or signs is not allowed.
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
Due to the intangible nature of our goods, items listed on our store are exempt from the Consumer Rights Act 2015. By purchasing an item on our store, you explicitly agree that our goods fall under the “computer software” and “personalised or custom made items” categories which exempt you from a Right of Return. You also agree to indemnify EuropeMC for legal costs that arise from pursuing a refund externally.

      `);

    await interaction.reply({ embeds: [embed] });
  }

  // /server
  if (commandName === 'server') {
    const embed = new EmbedBuilder()
      .setTitle('🌍 Server Information')
      .setColor('Green')
      .addFields(
        { name: 'IP', value: '**europemc.eu**', inline: true },
        { name: 'Port', value: '**19132**', inline: true },
        { name: 'How to Join', value: 'Open Minecraft → Add Server → Enter IP & Port' }
      );

    await interaction.reply({ embeds: [embed] });
  }

  // MODERATION COMMANDS

  if (commandName === 'ban') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return interaction.reply({ content: 'No permission.', ephemeral: true });

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    await interaction.guild.members.ban(user.id, { reason });
    await interaction.reply(`🔨 ${user.tag} has been banned.`);
  }

  if (commandName === 'kick') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return interaction.reply({ content: 'No permission.', ephemeral: true });

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(user.id);
    await member.kick(reason);

    await interaction.reply(`👢 ${user.tag} has been kicked.`);
  }

if (commandName === 'mute') {
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
    return interaction.reply({ content: 'No permission.', ephemeral: true });

  const user = interaction.options.getUser('user');
  const minutes = interaction.options.getInteger('minutes');

  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (!member)
    return interaction.reply({ content: 'User not found.', ephemeral: true });

  if (!member.moderatable)
    return interaction.reply({ content: 'I cannot mute this user. Check role hierarchy.', ephemeral: true });

  try {
    await member.timeout(minutes * 60 * 1000);
    await interaction.reply(`🔇 ${user.tag} muted for ${minutes} minutes.`);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'Failed to mute user.', ephemeral: true });
  }
}

  }

  if (commandName === 'warn') {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    await interaction.reply(`⚠️ ${user.tag} has been warned. Reason: ${reason}`);
  }
new SlashCommandBuilder()
  .setName('blacklist')
  .setDescription('Blacklist a user')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('User to blacklist')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('type')
      .setDescription('Blacklist type')
      .setRequired(true)
      .addChoices(
        { name: 'Media', value: 'media' },
        { name: 'Staff', value: 'staff' }
      ))

  }

});

client.login(TOKEN);
