const Discord = require('discord.js');
const Constant = require('./const.js');

function commandObject(command_name, description, additional_args = null) {
    return { name: command_name, value: `${description}\nExample:\`!${command_name} ${additional_args ? additional_args : ''}\`` };
}

module.exports = {
    BookEmbed: function (command, message, book_info, extra_fields = null) {
        var author = book_info.authors.join(', ');
        var title = book_info.title;
        var subtitle = book_info.subtitle;
        var description = book_info.description;
        var cover = book_info.imageLinks.thumbnail;
        var page_count = book_info.pageCount;
        var genre = book_info.categories ? book_info.categories.join(', ') : 'Not specified';

        var embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(title)
            .setURL(book_info.infoLink)
            .setDescription(subtitle ? subtitle : '')
            .addField('Author', author ? author : 'none')
            .addField('Description', description ? description.length > 500 ? description.substring(0, 499) + '...' : description : 'none')
            .addField('Genre', genre)
            .addField('Length', page_count + ' pages')
            .setImage(cover)
            .setTimestamp()
            .setFooter(`${message.author.username} invoked command \`${command}\``, message.author.avatarURL());
        if (extra_fields) {
            embed.addFields(extra_fields);
        }
        return embed;
    },

    ListEmbed: function (command, message, is_admin = false, list = null) {
        var commands_json = [];
        commands_json.push(commandObject('list', 'List all available simple commands'));
        commands_json.push(commandObject('spolier', 'Instructions on how to use the spoiler markdown in Discord'));
        commands_json.push(commandObject('lookup', 'Search a book name, author, or other identifying information', 'the lord of the rings'));
        commands_json.push(commandObject('uptime', 'Current bot uptime'));
        commands_json.push(commandObject('ping', 'Check the bot\'s online status'));
        commands_json.push(commandObject('kindle', 'Instructions on how to allow the bot to send books directly to your kindle'));
        commands_json.push(commandObject('addemail', 'Add your email to recieve the club\'s selected book as an E-Book', 'your-email-here'));
        commands_json.push(commandObject('delemail', 'Delete your email from the E-Book recipient list'));
        commands_json.push(commandObject('checkemail', 'Have the bot DM you the email we have on file for you'));
        commands_json.push(commandObject('suggest', `Add your suggestion to the current pool. You can only add one suggestion, so use this command wisely. If you wish to delete your suggestion go to the <#${Constant.ChannelBookSuggestions}> channel and react to *your* suggestion with a ❌ emoji`, 'the hunger games'));

        if (is_admin) {
            commands_json.push(commandObject('addcom', 'Add a simple command', 'command-name command-value'));
            commands_json.push(commandObject('editcom', 'Edit a simple command', 'command-name command-value'));
            commands_json.push(commandObject('delcom', 'Delete a simple command', 'command-name'));
            commands_json.push(commandObject('selectbook', 'Select the current book selection', 'month-name(optional)'));
            commands_json.push(commandObject('setdownload', 'Set the current download that will be sent to the email list recipients (this will not actually send any mail on its own)', 'download-link'));
            commands_json.push(commandObject('sendemail', 'Send an attachment to a specified email address', 'email-recipient download-link'));
            commands_json.push(commandObject('sendemailall', 'Send an attachment to entire email list', 'download-link'));
            commands_json.push(commandObject('sendemailcurrentbook', 'Send current download to a specified email address', 'recipient-email'));
            commands_json.push(commandObject('sendemailcurrentbookall', 'Send current download to a entire email list'));
            commands_json.push(commandObject('restart', 'Restart bot instance'));
            commands_json.push(commandObject('react', 'React to a message', 'message-id emoji'));
        }

        var embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle((list ? 'Simple ' : '') + 'Commands List')
            .setDescription(`All commands are prefaced with *one* of the following characters (you choose which one): \`${Constant.Prefixes.join('\`,  \`')}\``)
            .addFields(list ? list : commands_json)
            .setTimestamp()
            .setFooter(`${message.author.username} invoked command \`${command}\``, message.author.avatarURL());
        return embed;
    },
    
    SimpleEmbed: function (command, message, content, title = null) {
        var embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setDescription(content)
            .setTimestamp()
            .setFooter(`${message.author.username} invoked command \`${command}\``, message.author.avatarURL());
        if (title) {
            embed.setTitle(title);
        }
        return embed;
    },
    KindleSendEmbed: function (command, message, bot_email) {
        var embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('To have the bot automatically send the current club book to your Kindle, follow these instructions (click the image for a visual representation of the instructions):')
            .addField('Step 1', 'Go to the [Manage Your Content and Devices](https://www.amazon.com/myk) and log into your Amazon account')
            .addField('Step 2', 'Click on the preferences tab and scroll down to \'Personal Document Settings\'')
            .addField('Step 3', 'Find the Kindle you would like to have books delivered to and edit the email address to something unique, but memorable. This will allow the bot to send books to your Kindle directly.')
            .addField('Step 4', `Scroll a bit further down to the 'Approved Personal Document E-mail List' Section and click 'Add a new approved e-mail address'\nThe email you will add here is \`${bot_email}\``)
            .addField('Step 5', 'Let the bot know your Kindle E-Mail address by using the command `!addemail <your-kindle-email-address-here>`')
            .addField('Notes', 'If you need to change the saved email use the add command again\nTo delete it entirely use the command `!delemail`\nTo Check the current email we have on file use the command `!checkemail` to have the information sent to you in a direct message')
            .setImage('https://i.imgur.com/nUhyJI5.png')
            .setTimestamp()
            .setFooter(`${message.author.username} invoked command \`${command}\``, message.author.avatarURL());
        return embed;
    }
}