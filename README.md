# The Librarian Discord Bot
The Librarian is a Discord bot designed to help book club communities. With features like book information lookup, ebook email list, and a suggestion/selection function, this bot should make your book club admin experience much simpler. It is designed to be run in Docker, specifically with docker-compose.

# `Initial Setup`

## Step 1
Clone this repository

## Step 2
Enter the repository and run `npm install`. This will install all the required dependencies.

## Step 3
Edit the `docker-compose.yml` file.

Replace `<your-repository-location>` with the full path to your repository.

Replace `<your-config-location>` with the directory in which you would like to store your configuration.

Replace `<your-timezone>` with your timezone.

## Step 4
Run the command `docker build -t librarian .` and then `docker-compose up -d`

This will create a blank `configuration.yaml` file in your defined config directory for you to fill in.

Here is the required information:

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

## Step 5

After filling in the necessary information in `configuration.yaml` restart the docker container. You should be up and running.