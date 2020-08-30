const nodemailer = require('nodemailer');
const Constant = require('./const.js');

module.exports = {
    SendEmail: function (recipient_email, attachment_url) {
        var transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: Constant.LibrarianEmail,
                pass: Constant.LibrarianEmailPassword
            }
        });

        var message = {
            from: Constant.LibrarianEmail,
            to: recipient_email,
            text: `Book club book!`,
            html: "<p>Book club book!</p>",
            attachments: [
                {
                    href: attachment_url
                }
            ]
        }
        console.log(`sending email to ${recipient_email}`)
        transport.sendMail(message, function (err) {
            if (err) {
                console.log(err);
            }
        });

    }
}