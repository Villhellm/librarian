const fs = require('fs');
const Mailer = require('./mailer.js');
const commands_file = '/.store/commands.json';
const configuration_file = '/.store/configuration.yaml';
const default_configuration_file = 'configuration.yaml.default';
const kindle_emails_file = '/.store/emails.json';
const current_download_file = '/.store/current_download'
const { exec } = require('child_process');
var commands = [];
var emails = [];
var start_time = new Date();

function plural(interval) {
    return interval > 1 ? 's' : '';
}

function timeSince(date) {
    var returnString = "";
    var seconds = Math.floor((new Date() - date) / 1000);
    var unit = 31536000;
    var interval = Math.floor(seconds / unit);

    if (interval >= 1) {
        returnString = `${returnString} ${interval} year${plural(interval)}`;
        seconds = seconds - (interval * unit);
    }
    unit = 2592000;
    interval = Math.floor(seconds / unit);
    if (interval >= 1) {
        returnString = `${returnString} ${interval} month${plural(interval)}`;
        seconds = seconds - (interval * unit);
    }
    unit = 86400;
    interval = Math.floor(seconds / unit);
    if (interval >= 1) {
        returnString = `${returnString} ${interval} day${plural(interval)}`;
        seconds = seconds - (interval * unit);
    }
    unit = 3600;
    interval = Math.floor(seconds / unit);
    if (interval >= 1) {
        returnString = `${returnString} ${interval} hours${plural(interval)}`;
        seconds = seconds - (interval * unit);
    }
    unit = 60;
    interval = Math.floor(seconds / unit);
    if (interval >= 1) {
        returnString = `${returnString} ${interval} minute${plural(interval)}`;
        seconds = seconds - (interval * unit);
    }
    if (!returnString.includes('day')) {
        returnString = returnString + ' ' + Math.floor(seconds) + " seconds";
    }
    return returnString;
}

function getCurrentDownload(){
    try{
        return fs.readFileSync(current_download_file).toString();
    }
    catch{
        return null;
    }
}

module.exports = {
    Initialize: function () {
        try {
            fs.readFileSync(configuration_file);
        } catch (err) {
            fs.copyFileSync(default_configuration_file, configuration_file)
            console.log("Creating default configuration.yaml file. Please fill it with the necessary information and restart the docker container.");
        }
    },

    ReadCommands: function () {
        try {
            commands = JSON.parse(fs.readFileSync(commands_file));
        } catch (err) {
            commands = [];
            console.log("No commands.json found");
        }
    },

    ReadEmails: function () {
        try {
            emails = JSON.parse(fs.readFileSync(kindle_emails_file));
        } catch (err) {
            emails = [];
            console.log("No kindle_emails.json found");
        }
    },

    AddCommand: function (new_command) {
        commands.push(new_command);
        fs.writeFileSync(commands_file, JSON.stringify(commands));
    },

    AddEmail: function (user_id, email) {
        this.DeleteEmail(user_id, false);
        emails.push({ user: user_id, email: email });
        fs.writeFileSync(kindle_emails_file, JSON.stringify(emails));
    },

    DeleteEmail: function (user_id, write = true) {
        emails = emails.filter(em => em.user !== user_id);
        if (write) {
            fs.writeFileSync(kindle_emails_file, JSON.stringify(emails));
        }
    },

    CheckEmail: function (user_id) {
        return emails.filter(em => em.user === user_id)[0];
    },

    SendEmailAll: function (attachment_url) {
        var current = getCurrentDownload();
        attachment_url = attachment_url === 'current'  && current ? current : attachment_url;
        if (attachment_url.includes('http') && attachment_url.includes('mobi')) {
            emails.forEach(user => {
                Mailer.SendEmail(user.email, attachment_url);
            });
        }
        else {
            console.log('Email attachment invalid: ' + attachment_url);
        }
    },

    SendEmail: function (recipient, attachment_url) {
        var current = getCurrentDownload();
        attachment_url = attachment_url === 'current'  && current ? current : attachment_url;
        if (attachment_url.includes('http') && attachment_url.includes('mobi')) {
            Mailer.SendEmail(recipient, attachment_url);
        }
        else {
            console.log('Email attachment invalid: ' + attachment_url);
        }
    },

    EditCommand: function (command) {
        commands = commands.filter(item => !(item.name === command.name));
        commands.push(command);
        fs.writeFileSync(commands_file, JSON.stringify(commands));
    },

    DeleteCommand: function (command_name) {
        commands = commands.filter(item => !(item.name === command_name));
        fs.writeFileSync(commands_file, JSON.stringify(commands));
    },

    FindCommand: function (command_name) {
        return commands.find(function (command) {
            if (command_name === command.name) {
                return command;
            }
        })
    },

    Uptime: function () {
        return timeSince(start_time);
    },

    RestartService: function (command) {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(stdout);
        });
    },

    KindleEmail: function () {
        return `To have the bot automatically send the current club book to your kindle, follow these instructions:\nStep 1: Go to the [Manage Your Content and Devices](https://www.amazon.com/myk) and log into your Amazon account\nStep 2: Click on the preferences tab`
    },

    SaveCurrentDownload: function (link) {
        fs.writeFileSync(current_download_file, link)
    },

    ListCommands: function () {
        var command_data = [];
        commands.forEach(command => {
            command_data.push({ name: command.name, value: command.value + '\nExample: `!' + command.name + '`' });
        });
        return command_data;
    },

    Spoiler: function () {
        return `You can add spoilers to a message by wrapping the spoiler text in pairs of vertical lines\nExample: \\|\\| spoiler text here \\|\\| will become ||spoiler text here||\n(you have to click on the black box to reveal it)`;
    }
}