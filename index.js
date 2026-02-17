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

  new SlashCommandBuilder().setName('ping').setDescription('Show bot latency'),

  new SlashCommandBuilder().setName('help').setDescription('List all commands'),

  new SlashCommandBuilder().setName('rules').setDescription('Show server rules'),

  new SlashCommandBuilder().setName('server').setDescription('Show Minecraft server info'),

  new SlashCommandBuilder().setName('serverinfo').setDescription('Show Discord server info'),

  new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Show user info')
    .addUserOption(o =>
      o.setName('user').setDescription('Select user').setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('setupwelcome')
    .setDescription('Set welcome channel')
    .addChannelOption(o =>
      o.setName('channel').setDescription('Channel').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick member')
    .addUserOption(o =>
      o.setName('user').setDescription('User').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers),

  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban member')
    .addUserOption(o =>
      o.setName('user').setDescription('User').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers),

  new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban user')
    .addStringOption(o =>
      o.setName('userid').setDescription('User ID').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers),

  new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout member')
    .addUserOption(o =>
      o.setName('user').setDescription('User').setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName('minutes').setDescription('Minutes').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),

  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete messages')
    .addIntegerOption(o =>
      o.setName('amount').setDescription('Amount').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

  new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock channel')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),

  new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock channel')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),

  new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send announcement')
    .addStringOption(o =>
      o.setName('message').setDescription('Message').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

  new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Blacklist user')
    .addUserOption(o =>
      o.setName('user').setDescription('User').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('type')
        .setDescription('Blacklist type')
        .setRequired(true)
        .addChoices(
          { name: 'Media', value: 'Media Blacklist' },
          { name: 'Staff', value: 'Staff Blacklist' }
        )
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)

].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(clientId, guildId),
    { body: commands }
  );
})();

// PREFIX COMMANDS 

client.on('messageCreate', message => {
  if (message.author.bot) return;

  if (message.content === '!ip')
    return message.reply('IP: EuropeMC.eu\nPort: 19132\nVersion: 1.21+');

  if (message.content === '!rynx')
    return message.reply('Yeah you are correct rynx made this bot');
});

// INTERACTIONS 

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {

    const name = interaction.commandName;

    if (name === 'ping')
      return interaction.reply(`🏓 Pong! ${client.ws.ping}ms`);

    if (name === 'help') {
      const embed = new EmbedBuilder()
        .setColor('#2b6cff')
        .setTitle('📜 EuropeMC Commands')
        .setDescription(`
**General**
/ping
/help
/rules
/server
/userinfo
/serverinfo

**Moderation**
/kick
/ban
/unban
/timeout
/clear
/lock
/unlock
/announce
/blacklist

        `);
      return interaction.reply({ embeds: [embed] });
    }

    if (name === 'rules') {
      const embed = new EmbedBuilder()
        .setColor('#2b6cff')
        .setTitle('📖 Server Rules')
        .setDescription(`
**EUROPEMC NETWORK RULES!**

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
        `);
      return interaction.reply({ embeds: [embed] });
    }

    if (name === 'server') {
      const embed = new EmbedBuilder()
        .setColor('#2b6cff')
        .setTitle('🌍 EuropeMC Server Information')
        .addFields(
          { name: 'Server IP', value: 'europemc.eu', inline: true },
          { name: 'Port', value: '19132', inline: true },
          { name: 'Version', value: '1.21+', inline: true },
          { name: 'Store', value: 'https://store.europemc.eu/' }
        )
        .setFooter({ text: 'Join now and start playing!' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (name === 'serverinfo') {
      const embed = new EmbedBuilder()
        .setColor('#2b6cff')
        .setTitle('🏠 Discord Server Information')
        .addFields(
          { name: 'Server Name', value: interaction.guild.name, inline: true },
          { name: 'Members', value: `${interaction.guild.memberCount}`, inline: true },
          { name: 'Owner', value: `<@${interaction.guild.ownerId}>`, inline: true }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (name === 'userinfo') {
      const user = interaction.options.getUser('user') || interaction.user;
      const member = interaction.guild.members.cache.get(user.id);

      const embed = new EmbedBuilder()
        .setColor('#2b6cff')
        .setTitle('👤 User Information')
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: 'Username', value: user.tag, inline: true },
          { name: 'Joined', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
          { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (name === 'setupwelcome') {
      const channel = interaction.options.getChannel('channel');
      welcomeChannelId = channel.id;
      return interaction.reply(`✅ Welcome channel set to ${channel}`);
    }

    if (name === 'kick') {
      const member = interaction.options.getMember('user');
      await member.kick();
      return interaction.reply('👢 Member kicked.');
    }

    if (name === 'ban') {
      const member = interaction.options.getMember('user');
      await member.ban();
      return interaction.reply('🔨 Member banned.');
    }

    if (name === 'unban') {
      const id = interaction.options.getString('userid');
      await interaction.guild.members.unban(id);
      return interaction.reply('✅ User unbanned.');
    }

    if (name === 'timeout') {
      const member = interaction.options.getMember('user');
      const minutes = interaction.options.getInteger('minutes');
      await member.timeout(minutes * 60000);
      return interaction.reply(`⏳ Timed out for ${minutes} minutes.`);
    }

    if (name === 'clear') {
      const amount = interaction.options.getInteger('amount');
      await interaction.channel.bulkDelete(amount, true);
      return interaction.reply({ content: `🗑 Deleted ${amount} messages.`, ephemeral: true });
    }

    if (name === 'lock') {
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        { SendMessages: false }
      );
      return interaction.reply('🔒 Channel locked.');
    }

    if (name === 'unlock') {
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        { SendMessages: true }
      );
      return interaction.reply('🔓 Channel unlocked.');
    }

    if (name === 'announce') {
      const msg = interaction.options.getString('message');
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('📢 Announcement')
        .setDescription(msg)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (name === 'blacklist') {
      const member = interaction.options.getMember('user');
      const roleName = interaction.options.getString('type');
      const role = interaction.guild.roles.cache.find(r => r.name === roleName);

      if (!role)
        return interaction.reply({ content: '❌ Blacklist role not found.', ephemeral: true });

      await member.roles.add(role);
      return interaction.reply(`🚫 ${member.user.tag} has been blacklisted from (${roleName}).`);
    }

  } catch (err) {
    console.error(err);
    if (!interaction.replied)
      interaction.reply({ content: '❌ Something went wrong.', ephemeral: true });
  }
});

// WELCOME SYSTEM 

client.on('guildMemberAdd', member => {
  if (!welcomeChannelId) return;

  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor('#2b6cff')
    .setTitle('👋 Welcome to EuropeMC!')
    .setDescription(`
**Version:** 1.21+ • Premium Java & Bedrock  
**IP:** EuropeMC.eu  
**Port:** 19132
    `)
    .setFooter({ text: 'EuropeMC Network' })
    .setTimestamp();

  channel.send({
    content: `🎉 Welcome ${member}!`,
    embeds: [embed]
  });
});

client.login(token);
