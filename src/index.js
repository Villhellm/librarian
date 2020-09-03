const Discord = require('discord.js');
const Book = require('./book.js');
const Embeds = require('./embeds.js');
const Commands = require('./commands.js');
const Constant = require('./const.js');

const bot = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

bot.on('ready', () => onReady());
bot.on('message', async message => onMessage(message));
bot.on('messageReactionAdd', async (reaction, user) => onReactionAdd(reaction, user));
if (Constant.BotToken && Constant.BotToken != '') {
  try {
    bot.login(Constant.BotToken);
  }
  catch{
    console.log('Invalid bot token found. Please update your configuration.yaml');
  }
}
else {
  console.log('No bot token found. Please update your configuration.yaml');
  Commands.Initialize();
}

function onReady() {
  Commands.ReadCommands();
  Commands.ReadEmails();
  bot.channels.fetch(Constant.ChannelSpam).then(channel => channel.send(`Clocking in!`).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) }));
  console.log('The library is now open!');
}

async function onMessage(message) {
  if (message.author.bot || !message.guild || !Constant.Prefixes.some(pref => message.content[0] == pref)) return;
  const prefix = message.content[0];
  const args = message.content.slice(1).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (message.deletable) message.delete();

  var found_command = Commands.FindCommand(cmd);

  if (found_command) {
    message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, found_command.value));
    return;
  }

  potential_command_name = args[0];
  found_command = Commands.FindCommand(potential_command_name);

  var is_admin = userHasRole(message.author.id, Constant.RoleNameAdmin);

  switch (cmd) {
    case 'list':
      message.channel.send(Embeds.ListEmbed(prefix + cmd, message, is_admin, Commands.ListCommands()));
      break;
    case 'help':
      message.channel.send(Embeds.ListEmbed(prefix + cmd, message, is_admin));
      break;
    case 'spoiler':
      message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, Commands.Spoiler()));
      break;
    case 'lookup':
      var book_result = await Book.BookInfo(args);
      if (book_result) {
        var book_embed = await Embeds.BookEmbed(prefix + cmd + ' ' + args.join(' '), message, book_result, null, args.join(' '));
        message.channel.send(book_embed);
      }
      else {
        message.channel.send(`There was an error retrieving results`).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      }
      break;
    case 'uptime':
      message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, Commands.Uptime(), 'Uptime'));
      break;
    case '🏓':
    case 'ping':
      message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'Pong! 🏓'));
      break;
    case 'kindle':
      message.channel.send(Embeds.KindleSendEmbed(prefix + cmd, message, Constant.LibrarianEmail));
      break;
    case 'addemail':
      try {
        Commands.AddEmail(message.author.id, args[0]);
        Commands.SendCurrentBookEmail(args[0]);
        message.channel.send(`Email added`).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      }
      catch (e) {
        console.log('Error adding email');
        message.channel.send(`Error adding command ${e}`);
      }
      break;
    case 'delemail':
      try {
        Commands.DeleteEmail(message.author.id);
        message.channel.send(`Email deleted`).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      }
      catch (e) {
        console.log('Error adding command');
        message.channel.send(`Error adding command ${e}`);
      }
      break;
    case 'checkemail':
      try {
        var email = Commands.CheckEmail(message.author.id);
        if (email) {
          message.author.send(`The current email we have on file is \`${email.email}\``)
        }
        else {
          message.author.send('We have no current email on file')
        }
      }
      catch (e) {
        console.log('Error adding command');
        message.channel.send(`Error adding command ${e}`);
      }
      break;
    case 'suggest':
      var channel = await bot.channels.fetch(Constant.ChannelBookSuggestions);
      var messages = await channel.messages.fetch({ limit: 10 });
      var valid = true;
      messages.forEach(suggestion_message => {
        if (suggestion_message.embeds && suggestion_message.embeds[0]) {
          suggestion_message.embeds[0].fields.forEach(field => {
            if (field.name == 'Suggestor') {
              if (field.value.includes(message.author.id)) {
                valid = false;
              }
            }
          });
        }
      });
      if (valid) {
        var book_result = await Book.BookInfo(args);
        if (book_result) {
          var user_fields = [{ name: 'Suggestor', value: '<@' + message.author.id + '>' }];
          var book_embed = Embeds.BookEmbed(prefix + cmd + ' ' + args.join(' '), message, book_result, user_fields, args.join(' '));
          channel.send(book_embed);
        }
        else {
          message.channel.send(`There was an error retrieving results`).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
        }
      }
      else {
        message.channel.send(`I'm sorry, you already have a suggestion listed for this round`).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      }
      break;
    case 'addcom':
      args.shift();
      if (found_command || !is_admin) return;
      try {
        Commands.AddCommand({ name: potential_command_name, value: args.join(' ') });
        message.channel.send(`Command ${potential_command_name} added`).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      }
      catch (e) {
        console.log('Error adding command');
        message.channel.send(`Error adding command ${e}`);
      }
      break;
    case 'delcom':
      if (!found_command || !is_admin) return;
      Commands.DeleteCommand(potential_command_name);
      message.channel.send(`Command ${potential_command_name} deleted`).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      break;
    case 'editcom':
      args.shift();
      if (!found_command || !is_admin) return;
      Commands.EditCommand({ name: potential_command_name, value: args.join(' ') });
      message.channel.send(`Command ${potential_command_name} updated`).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      break;
    case 'selectbook':
      if (is_admin) selectBook(args ? args.join(' ') : null);
      break;
    case 'setdownload':
      var valid = is_admin && args[0].includes('http') && args[0].includes('mobi');
      if (valid) Commands.SaveCurrentDownload(args[0]);
      message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, valid ? 'Current download updated' : 'Something went wrong')).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      break;
    case 'sendemail':
      if (!is_admin) return;
      var recipient = args.shift();
      var attachment = args.shift();
      if (recipient.includes('@') && attachment.includes('http')) {
        try {
          Commands.SendEmail(recipient, attachment);
          message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'Email sent')).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
        }
        catch{
          message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'Something went wrong with sending email')).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
        }
      }
      else {
        message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'Email not sent. Could not verify arguments.')).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      }
      break;
    case 'sendemailall':
      if (!is_admin) return;
      var attachment = args.shift();
      if (attachment.includes('http')) {
        try {
          Commands.SendEmailAll(attachment);
          message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'Emails sent')).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
        }
        catch{
          message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'Something went wrong with sending email')).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
        }
      }
      else {
        message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'Emails not sent. Could not verify arguments.')).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      }
      break;
    case 'sendemailcurrentbook':
      if (!is_admin) return;
      var recipient = args.shift();
      if (recipient.includes('@')) {
        try {
          Commands.SendEmail(recipient, 'current');
          message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'Email sent')).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
        }
        catch{
          message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'Something went wrong with sending email')).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
        }
      }
      else {
        message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'Emails not sent. Could not verify arguments.')).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      }
      break;
    case 'sendemailcurrentbookall':
      if (!is_admin) return;
      try {
        Commands.SendEmailAll('current');
        message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'Email sent')).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      }
      catch{
        message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'Something went wrong with sending email')).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      }
      break;
    case 'sendmailmanual':
      if (!is_admin) return;
      var attachment = args[0];
      if (attachment.includes('http')) {
        Commands.SendBookToEmailList(attachment);
        message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'Emails sent')).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      }
      else {
        message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'Emails not sent. Could not verify attachment.')).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      }
      break;
    case 'sendmailall':
      if (!is_admin) return;
      var attachment = args[0];
      if (attachment.includes('http')) {
        Commands.SendBookToEmailList(attachment);
        message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'Emails sent')).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      }
      else {
        message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'Emails not sent. Could not verify attachment.')).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      }
      break;
    case 'react':
      if (!is_admin) return;
      var msg_id = args.shift();
      try {
        message.channel.messages.fetch(msg_id).then(msg => msg.react(args[0]));
      }
      catch{
        message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'Something went wrong...')).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      }
      break;
    case 'restart':
      if (is_admin) {
        message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'Restarting...')).then(msg => { msg.delete({ timeout: 2000 }) });
        console.log(Constant.RestartCommand);
        Commands.RestartService(Constant.RestartCommand);
      }
      else {
        message.channel.send(Embeds.SimpleEmbed(prefix + cmd, message, 'You are not authorized to use this command')).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      }
      break;
    default:
      message.channel.send(`Command not found`).then(msg => { msg.delete({ timeout: Constant.TempMessageTimeout }) });
      break;
  }
}

async function onReactionAdd(reaction, user) {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.log('Something went wrong when fetching the message: ', error);
      return;
    }
  }
  var is_admin = userHasRole(user.id, Constant.RoleNameAdmin);

  switch (reaction.emoji.name) {
    case '❌':
      var del = false;
      if (reaction.message.channel.id == Constant.ChannelBookSuggestions) {
        if (reaction.message.embeds && reaction.message.embeds[0]) {
          reaction.message.embeds[0].fields.forEach(field => {
            if (field.name == 'Suggestor') {
              if (field.value.includes(user.id)) {
                var bot_reaction = reaction.message.reactions.cache.filter(reaction_filter => reaction_filter.me);
                del = reaction.message.author.id == Constant.UserBot && is_admin;
                if (!bot_reaction.get('✅')) {
                  del = true;
                }
                else {
                  del = false;
                }
              }
            }
          });
        }
      }
      else {
        del = reaction.message.author.id == Constant.UserBot && is_admin;
      }
      if (del) {
        reaction.message.delete();
      }
      break;
    //forward the upcoming book to the current book channel, archive previous current book
    case '▶️':
      if (reaction.message.channel.id == Constant.ChannelUpcomingBook && is_admin) {
        if (reaction.message.embeds && reaction.message.embeds[0]) {
          bot.channels.fetch(Constant.ChannelCurrentBook).then(channel => {
            channel.messages.fetch({ limit: 1 }).then(message => {
              var current_book_message = message.values().next().value;
              if (current_book_message) {
                bot.channels.fetch(Constant.ChannelPastBooks).then(channel => channel.send(current_book_message.embeds[0]));
                current_book_message.delete();
              }
            });
            channel.send(reaction.message.embeds[0])
          });
          var next_month = Constant.MonthNames.indexOf(reaction.message.embeds[0].fields.filter(field => field.name === 'Monthly Selection')[0].value) + 1;
          selectBook(Constant.MonthNames[next_month > 11 ? 0 : next_month]);
          reaction.message.delete();
        }
      }
      break;
  }
}

function userHasRole(user_id, role_name) {
  return bot.guilds.cache.get(Constant.ServerId).members.cache.get(user_id).roles.cache.some(role => role.name === role_name);
}

async function selectBook(month_override = null) {
  var channel = await bot.channels.fetch(Constant.ChannelBookSuggestions);
  var messages = await channel.messages.fetch({ limit: 10 });
  messages = messages.filter(message_f => !message_f.reactions.cache.filter(reaction_filter => reaction_filter.me).get('✅'))
  var message_keys = Array.from(messages.keys());
  channel = await bot.channels.fetch(Constant.ChannelUpcomingBook);
  if (message_keys.length == 0) {
    channel.send('Uh-oh! All out of suggestions, time for another round!');
  }
  else {
    var selection = message_keys[Math.floor(Math.random() * message_keys.length)];
    var today = new Date();
    messages.get(selection).react('✅');
    channel.send(messages.get(selection).embeds[0].addField('Monthly Selection', month_override ? month_override : Constant.MonthNames[today.getMonth()]));
  }
}