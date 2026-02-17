const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionsBitField,
  REST,
  Routes
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;


let welcomeChannelId = null;

// SLASH COMMANDS 

const commands = [

  new SlashCommandBuilder().setName('ping').setDescription('Ping Pong'),

  new SlashCommandBuilder().setName('help').setDescription('List all commands'),

  new SlashCommandBuilder().setName('rules').setDescription('Show server rules'),

  new SlashCommandBuilder().setName('server').setDescription('Minecraft server info'),

  new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Show user info')
    .addUserOption(o =>
      o.setName('user').setDescription('User').setRequired(false)
    ),

  new SlashCommandBuilder().setName('serverinfo').setDescription('Server details'),

  new SlashCommandBuilder()
    .setName('setupwelcome')
    .setDescription('Set welcome channel')
    .addChannelOption(o =>
      o.setName('channel').setDescription('Channel').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user')
    .addUserOption(o =>
      o.setName('user').setDescription('User').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user')
    .addUserOption(o =>
      o.setName('user').setDescription('User').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user')
    .addStringOption(o =>
      o.setName('userid').setDescription('User ID').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout user')
    .addUserOption(o =>
      o.setName('user').setDescription('User').setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName('minutes').setDescription('Minutes').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear messages')
    .addIntegerOption(o =>
      o.setName('amount').setDescription('Amount').setRequired(true)
    ),

  new SlashCommandBuilder().setName('lock').setDescription('Lock channel'),
  new SlashCommandBuilder().setName('unlock').setDescription('Unlock channel'),

  new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send announcement')
    .addStringOption(o =>
      o.setName('message').setDescription('Message').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Blacklist user')
    .addUserOption(o =>
      o.setName('user').setDescription('User').setRequired(true)
    )

].map(cmd => cmd.toJSON());

//  REGISTER 

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(clientId, guildId),
    { body: commands }
  );
  console.log("Slash commands registered.");
})();

// READY 
client.once('ready', () => {
  console.log(`${client.user.tag} is online.`);
});

// WELCOME 

client.on('guildMemberAdd', async member => {
  if (!welcomeChannelId) return;

  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor('#2b6cff')
    .setTitle('👋 Welcome!')
    .setDescription(`Welcome ${member} to the server!`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: `Member #${member.guild.memberCount}` })
    .setTimestamp();

  channel.send({ embeds: [embed] });
});

// PREFIX

client.on('messageCreate', message => {
  if (message.author.bot) return;

  if (message.content === '!ip')
    message.reply('🌍 Server IP: **EuropeMC.eu**');

  if (message.content === '!rynx')
    message.reply('Yeah you are correct rynx made this bot');
});

// SLASH HANDLER 

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {

    if (commandName === 'ping')
      return interaction.reply('🏓 Pong!');

    if (commandName === 'help')
      return interaction.reply('/ping /rules /server /userinfo /kick /ban /timeout /clear /lock /unlock /announce /blacklist');

    if (commandName === 'rules') {
      const embed = new EmbedBuilder()
        .setColor('#2b6cff')
        .setTitle('📜 EuropeMC Network Rules')
        .setDescription(`
**EuropeMC Network Rules**

Chat Conduct

Use respectful language at all times. Abusive messages, inappropriate jokes, harassment, or spreading false information are not allowed.
Do not flood the chat with repeated or similar messages, long texts, non-English characters, or excessive use of ALL CAPS. Spam of any kind is not permitted. Attempting to bypass the chat filter will lead to a harsher punishment.
Extreme toxicity, including death threats or other malicious comments, is not tolerated. If you’re unsure whether something crosses the line, don’t say it.

Unfair Gameplay

Any form of hacks, macros, X-ray packs, autoclickers, minimaps, inventory checkers, bug abuse, exploiting, duping, Litematica Easyplace, health indicators, or other disallowed modifications are prohibited. Final judgement on unfair advantages rests with staff.
Evading punishments through alternate accounts, usernames, or similar methods is forbidden.
EasyMC accounts are STRICTLY prohibited. Associating your account with one can result in a permanent ban.

Inappropriate Content

Discussions around sexual, hateful, or highly political topics are not welcome here.
Building inappropriate structures, or using offensive team names, usernames, skins, capes, items, pets, or signs is not allowed.

Discrimination

Discrimination of any kind - whether based on age, gender, race, religion, disability, sex, or sexual orientation - will not be tolerated.
Sexism, racism, homophobia, and similar behaviour will result in serious punishment.

Advertising

Self-promotion and advertising other Minecraft/Discord servers is forbidden.
Item trading requests are allowed but cannot be publicly broadcast.
YouTube or stream links must be EuropeMC-related, shared no more than once every 5 minutes via /live, or posted in the media channel. We encourage you to make content about the server!

Scamming & Trading

Scamming involving items from the EuropeMC store or materials outside the server is not allowed.
In-game item scamming is permitted - so be careful who you trust.
Real money trading (IRL deals) is strictly forbidden and will lead to a permanent ban.
Scamming ranks is also a permanent ban offence with no appeal.

Threats

Doxing, DDoSing, harassment, blackmail, swatting, IP grabbing, malicious links, or any related threats will result in an instant network blacklist.
Sharing someone’s personal information is not allowed, regardless of whether it’s true.
Many of these actions are illegal. “Jokes” will be treated as seriously as real attempts.
Providing false or misleading information in appeals will extend your punishment.

Mega Farms

While our economy is spawner-based, EuropeMC may remove farms that cause lag - without prior warning. If you’re unsure about your farm design, open a ticket and staff will help you.

Refunds Policy

Due to the intangible nature of our goods, items listed on our store are exempt from the Consumer Rights Act 2015.
By purchasing an item on our store, you explicitly agree that our goods fall under the “computer software” and “personalised or custom made items” categories which exempt you from a Right of Return. You also agree to indemnify EuropeMC for legal costs that arise from pursuing a refund externally.
        `)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

if (commandName === 'server') {
  return interaction.reply(`🔵 EuropeMC.eu
Version 1.21+
Java & Bedrock
Port: 19132`);
}

    if (commandName === 'userinfo') {
      const user = interaction.options.getUser('user') || interaction.user;
      return interaction.reply(`User: ${user.tag}\nID: ${user.id}`);
    }

    if (commandName === 'serverinfo')
      return interaction.reply(`Server: ${interaction.guild.name}\nMembers: ${interaction.guild.memberCount}`);

    if (commandName === 'setupwelcome') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({ content: 'No permission.', ephemeral: true });

      const channel = interaction.options.getChannel('channel');
      welcomeChannelId = channel.id;
      return interaction.reply(`Welcome channel set to ${channel}`);
    }

    if (commandName === 'kick') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers))
        return interaction.reply({ content: 'No permission.', ephemeral: true });

      const user = interaction.options.getUser('user');
      const member = await interaction.guild.members.fetch(user.id);
      await member.kick();
      return interaction.reply(`${user.tag} has been kicked.`);
    }

    if (commandName === 'ban') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers))
        return interaction.reply({ content: 'No permission.', ephemeral: true });

      const user = interaction.options.getUser('user');
      await interaction.guild.members.ban(user.id);
      return interaction.reply(`${user.tag} has been banned.`);
    }

    if (commandName === 'unban') {
      const id = interaction.options.getString('userid');
      await interaction.guild.members.unban(id);
      return interaction.reply(`User ${id} has been unbanned.`);
    }

    if (commandName === 'timeout') {
      const user = interaction.options.getUser('user');
      const minutes = interaction.options.getInteger('minutes');
      const member = await interaction.guild.members.fetch(user.id);
      await member.timeout(minutes * 60000);
      return interaction.reply(`${user.tag} has been timed out for ${minutes} minutes.`);
    }

    if (commandName === 'clear') {
      const amount = interaction.options.getInteger('amount');
      await interaction.channel.bulkDelete(amount, true);
      return interaction.reply({ content: `Deleted ${amount} messages.`, ephemeral: true });
    }

    if (commandName === 'lock') {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false
      });
      return interaction.reply('🔒 Channel locked.');
    }

    if (commandName === 'unlock') {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: true
      });
      return interaction.reply('🔓 Channel unlocked.');
    }

    if (commandName === 'announce') {
      const msg = interaction.options.getString('message');
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('📢 Announcement')
        .setDescription(msg)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'blacklist') {
      const user = interaction.options.getUser('user');
      const member = await interaction.guild.members.fetch(user.id);
      const role = interaction.guild.roles.cache.find(r => r.name === "Blacklisted");
      if (role) await member.roles.add(role);
      return interaction.reply(`${user.tag} blacklisted.`);
    }

  } catch (err) {
    console.error(err);
    interaction.reply({ content: 'Error occurred.', ephemeral: true });
  }

});

client.login(token);
