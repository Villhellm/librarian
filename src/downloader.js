
const rp = require('request-promise');
const $ = require('cheerio');

module.exports = {
    check: async function (book) {
        const base_url = 'https://b-ok.cc'
        const resp = await rp(`${base_url}/s/${book.replace(/ /g, '%20')}/?language=english&extension=mobi`);
        var first_result = $('.resItemTable > tbody > tr > td:nth-child(2) > table > tbody > tr > td > h3 > a', resp)[0].attribs.href;
        return `${base_url}${first_result}`;
    }
}
