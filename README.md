# The Librarian Discord Bot
The Librarian is a Discord bot designed to help book club communities. With features like book information lookup, ebook email list, and a suggestion/selection function, this bot should make your book club admin experience much simpler.

# `Initial Setup`

## Step 1
Create a `configuration.yaml` file in the same directory as `index.js` with the following information:
| Name | Description
| ---- | -----------
| token | The Discord bot token for your bot
| user_bot | The user id for the bot
| channel_current_book | The channel id for the channel in which the current book selection will be stored. The bot should have exclusive write permissions to this channel.
| channel_upcoming_book | The channel id for the channel in which the upcoming book selection will be stored. The bot should have exclusive write permissions to this channel.
| channel_past_book | The channel id for the channel in which old selections will be archived. The bot should have exclusive write permissions to this channel.
| channel_book_suggestions | The channel id for the channel in which the current suggestion pool will be stored. The bot should have exclusive write permissions to this channel.
| channel_spam | The channel id for the channel in which the bot can send it's current status and other non-essential information.
| server_id | The server id for the book clud server
| role_admin_name | The name of the role in your server that carries admin privileges. This will be used to check whether a user has permission to call certain commands
| librarian_email | The gmail account email for the bot to send ebooks to subscribers
| librarian_email_password | The [app password](https://support.google.com/accounts/answer/185833?hl=en) for the bot gmail account
| restart_command | The shell command to restart the bot
| prefixes | A list of character prefixes you would like the bot to respond to

### `Blank Template`
```yaml
token:
user_bot:
channel_current_book:
channel_upcoming_book:
channel_past_book:
channel_book_suggestions:
channel_spam:
server_id:
role_admin_name:
librarian_email:
librarian_email_password:
restart_command:
prefixes:
  - '.'
  - '!'
  - '~'
```

## Step 2

From within the repository directory run the command `npm install`. This will install all the required dependencies.

## Step 3
Enter the `src` directory and run the command `node index.js` to start the bot (ctrl+c will stop the bot)

# Running in Docker
Included in this repository are a Dockerfile and a docker-compose.yml file. From the root of the directory run the command `docker build -t librarian .` to create the image. Then use the command `docker-compose up -d` to run the bot in the background.