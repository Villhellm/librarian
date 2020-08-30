const https = require('https');

module.exports = {
    BookInfo: function (query) {
        return new Promise((resolve, reject) => {
            var search = `https://www.googleapis.com/books/v1/volumes?q=${query.join('+')}`;
            https.get(search, (resp) => {
                let data = '';

                resp.on('data', (chunk) => {
                    data += chunk;
                });

                resp.on('end', () => {
                    var book_result = JSON.parse(data).items[0].volumeInfo;
                    resolve(book_result)
                });

            }).on('error', (err) => {
                console.log('Error: ' + err.message);
                reject(null);
            });
        });
    }
}