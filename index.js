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

app.post('/sms', function(req, res) {
    let author = req.body.author;
    let message = req.body.message;

    if (!numberIsNaN(author)) {
        let country = countryPrefix(author);
        if (country) {
            author = `${country.name} 0${author.slice(country.prefix.length).match(/.{1,3}/g).join('-')}`;
        }
    }

    let guild = client.guilds.get(conf.guildId);
    if (guild) {
        let channel = guild.channels.find(c => c.type === 'text' && c.name.toLowerCase() === conf.channel.toLowerCase());
        if (channel) {
            let embed = new Discord.RichEmbed()
                .setTitle(`${author} | ${new Date(Date.now() + conf.hours).toUTCString()}`)
                .setDescription(message)
                .setColor(conf.embed.color.main);
            channel.send(embed);
        }
    }

    res.end();
});

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

function numberIsNaN(num) {
    return isNaN(num.slice(1));
}

const port = 3000;
http.createServer(app).listen(port, function () {
    console.log('Running server on port %s', port);
});

client.login(require('./token.json').token);