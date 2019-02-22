// Libraries
const Discord = require('discord.js');
const client = new Discord.Client();
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

// Local JSONs
const conf = require('./default.json');

// Local libraries
const countries = require ('./libs/PhonePrefixes/main.json');

let app = express();
app.use(bodyParser.urlencoded({extended: false}));

/**
 * @desc Post route for the sms receiver.
 */
app.post('/sms', function(req, res) {
    let author = req.body.author;
    let message = req.body.message;

    // Checks if the author is a number or a company/person name.
    if (!numberIsNaN(author)) {
        // Gets the country prefix, name and code.
        let country = countryPrefix(author);
        if (country) {
            // Sets the author to a more detailed string.
            author = `${country.name} 0${author.slice(country.prefix.length).match(/.{1,3}/g).join('-')}`;
        }
    }

    // Gets guild
    let guild = client.guilds.get(conf.guildId);
    if (guild) {
        // Gets channel
        let channel = guild.channels.find(c => c.type === 'text' && c.name.toLowerCase() === conf.channel.toLowerCase());
        if (channel) {
            // Sends embed
            let embed = new Discord.RichEmbed()
                .setTitle(`${author} | ${new Date(Date.now() + conf.hours).toUTCString()}`)
                .setDescription(message)
                .setColor(conf.embed.color.main);
            channel.send(embed);
        }
    }

    res.end();
});

/**
 * @desc Returns an object including the country code, prefix and country name by the entered phone number.
 * @param {String} num - The author phone number.
 * @return {{code: String, prefix: String, name: String}}
 */
function countryPrefix(num) {
    let prefix = num.slice(0, -(num.length - 4));
    let countryPrefix;
    for (const country of countries) {
        if (country.dial_code === prefix) {
            countryPrefix = {code: country.code, name: country.name, prefix: prefix};
            break;
        }
    }
    return countryPrefix;
}

/**
 * @desc Checks if the number is a name or an actual phone number.
 * @param {String} num - The author phone number.
 * @return {boolean}
 */
function numberIsNaN(num) {
    return isNaN(num.slice(1));
}

// Sets port and creates a new http server.
const port = 3000;
http.createServer(app).listen(port, function () {
    console.log('Running server on port %s', port);
});

// Logs in the Discord client.
client.login(require('./token.json').token);