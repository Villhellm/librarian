const fs = require('fs');
const YAML = require('yaml');
const Constants = YAML.parse(fs.readFileSync('configuration.yaml', 'utf8'));

module.exports = {
    TempMessageTimeout: 12000,
    MonthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    Prefixes: Constants.prefixes,
    BotToken: Constants.token,
    ServerId: Constants.server_id,
    ChannelCurrentBook: Constants.channel_current_book,
    ChannelUpcomingBook: Constants.channel_upcoming_book,
    ChannelPastBooks: Constants.channel_past_book,
    ChannelBookSuggestions: Constants.channel_book_suggestions,
    ChannelSpam: Constants.channel_spam,
    UserBot: Constants.user_bot,
    RoleNameAdmin: Constants.role_admin_name,
    LibrarianEmail: Constants.librarian_email,
    LibrarianEmailPassword: Constants.librarian_email_password,
    RestartCommand: Constants.restart_command
}