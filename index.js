const Discord = require('discord.js');
const request = require('request');
require('dotenv').config();
const client = new Discord.Client();
const token = process.env.token;
const ombi = process.env.reqAPI;

client.on('message', message => {
    client.user.setActivity("Being a POS");
    let fullCommand = message.content.substr(1);
    let splitCommand = fullCommand.split(" ");
    let primaryCommand = splitCommand[0].toLowerCase(); 
    var args = fullCommand;
    var str = primaryCommand;
    args = args.replace(str, '');

    switch (primaryCommand) {
        case 'plex.help':
            message.channel.send('help info');
            break;
        case 'plex.status':
            message.channel.send('status info');
            break;
        case 'req.movie':
            reqMovie(message, args);
            break;
        case 'req.tv':
            reqTV(message, args);
            break;
        case 'check.movie':
            checkMovie(message, args);
            break;
        case 'check.tv':
            checkTV(message, args);
            break;
    }
});
client.login(token);

function reqMovie(message, args) {
    message.channel.send('Checking for: ' + args);
    request({
        headers: {
            'ApiKey': ombi
        },
        uri: 'http://192.168.0.100:5000/api/v1/Search/movie/' + args,
        method: 'GET'
    }, function (err, res, body) {
        var movie = JSON.parse(body);
        var movieData = {
            "theMovieDbId": movie[0].id
        }
        request({
            headers: {
                'ApiKey': ombi
            },
            uri: 'http://192.168.0.100:5000/api/v1/Request/movie/',
            method: 'POST',
            json: movieData
        }), function (err, res, body) {}    
            message.channel.send("Making request for: " + movie[0].title);
    });
}

function reqTV(message, args) {
    message.channel.send('Checking for: ' + args);
    request({
        headers: {
            'ApiKey': ombi
        },
        uri: 'http://192.168.0.100:5000/api/v1/Search/tv/' + args,
        method: 'GET'
    }, function (err, res, body) {
        var show = JSON.parse(body);
        var showData = {
            "requestAll": true,
            "latestSeason": true,
            "firstSeason": true,
            "tvDbId": show[0].id,
            "seasons": [
                {
                    "seasonNumber": 0,
                    "episodes": [
                        {
                            "episodeNumber": 0
                        }
                    ]
                }
            ]
        }
        request({
            headers: {
                'ApiKey': ombi
            },
            uri: 'http://192.168.0.100:5000/api/v1/Request/tv/',
            method: 'POST',
            json: showData
        }), function (err, res, body) {}    
            message.channel.send("Making request for: " + movie[0].title);
    });
}

function checkMovie(message, args) {
    message.channel.send('Checking for: ' + args);
    request({
        headers: {
            'ApiKey': ombi
        },
        uri: 'http://192.168.0.100:5000/api/v1/Search/movie/' + args,
        method: 'GET'
    }, function (err, res, body) {
        var movie = JSON.parse(body);
        if (movie.length == 1) {
            if (movie[0].available){
                message.channel.send(movie[0].title + " is availble to view on plex");
            } else if (movie[0].requested) {
                message.channel.send(movie[0].title + " is unavailable but is already requested");
            } else {
                message.channel.send(movie[0].title + " is unavailable on plex");
            } 
        } else {
            message.channel.send("Multiple similar title where found enter the number for the correct movie.");
            var i;
            for (i = 0; i < movie.length; i++) {
                message.channel.send((i + 1) + ") " + movie[i].title + " (" + movie[i].releaseDate.substring(0, 4) + ")");
            }
            var res = new Discord.Client();
            res.on('message', input => {
                if (message.author.id == input.author.id) {
                    var choice = input.content - 1;
                    input.channel.send("Looking up your choice: " + movie[choice].title + " (" + movie[choice].releaseDate.substring(0, 4) + ")" );
                    if (movie[0].available){
                        input.channel.send(movie[0].title + " is availble to view on plex");
                    } else if (movie[0].requested) {
                        input.channel.send(movie[0].title + " is unavailable but is already requested");
                    } else {
                        input.channel.send(movie[0].title + " is unavailable on plex");
                    } 
                }
            })
            res.login(token);
        }      
    });
}

function checkTV(message, args) {
    message.channel.send('Checking for: ' + args); 
    request({
        headers: {
            'ApiKey': ombi
        },
        uri: 'http://192.168.0.100:5000/api/v1/Search/tv/' + args,
        method: 'GET'
    }, function (err, res, body) {
        var show = JSON.parse(body);
        if (show.length == 1) {
            if (show[0].fullyAvailable){
                message.channel.send(show[0].title + " is availble to view on plex");
            } else if (show[0].partlyAvailable) {
                message.channel.send(show[0].title + " has limited episodes on plex");
            } else {
                message.channel.send(show[0].title + " is unavailable on plex");
            }
        } else {
            message.channel.send("Multiple similar title where found enter the number for the correct TV show.");
            var i;
            for (i = 0; i < show.length; i++) {
                message.channel.send((i + 1) + ") " + show[i].title + " (" + show[i].firstAired.substring(0, 4) + ")");
            }
            var res = new Discord.Client();
            res.on('message', input => {
                if (message.author.id == input.author.id) {
                    var choice = input.content - 1;
                    input.channel.send("Looking up your choice: " + show[choice].title + " (" + show[choice].firstAired.substring(0, 4) + ")");
                    if (show[0].fullyAvailable){
                        message.channel.send(show[0].title + " is availble to view on plex");
                    } else if (show[0].partlyAvailable) {
                        message.channel.send(show[0].title + " has limited episodes on plex");
                    } else {
                        message.channel.send(show[0].title + " is unavailable on plex");
                    } 
                }
            })
            res.login(token);
        }      
    });
}