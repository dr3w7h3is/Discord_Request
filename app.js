const Discord = require('discord.js');
const request = require('request');
require('dotenv').config();

const token = process.env.token;
const ombi = process.env.reqAPI;

function main() {
    var client = new Discord.Client();
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
            message.channel.send('I\'m up and running!');
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
}

function reqMovie(message, args) {
    message.channel.send('Checking for: ' + args);
    request({
        headers: {
            'ApiKey': ombi
        },
        uri: 'http://request.franken-tech.com/api/v1/Search/movie/' + args,
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
            uri: 'http://request.franken-tech.com/api/v1/Request/movie/',
            method: 'POST',
            json: movieData
        }), function (err, res, body) {
            console.log(res);
        }    
        message.channel.send("Making request for: " + movie[0].title);
    });
}

function reqTV(message, args) {
    message.channel.send('Checking for: ' + args);
    request({
        headers: {
            'ApiKey': ombi
        },
        uri: 'http://request.franken-tech.com/api/v1/Search/tv/' + args,
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
            uri: 'http://request.franken-tech.com/api/v1/Request/tv/',
            method: 'POST',
            json: showData
        })  
        message.channel.send("Making request for: " + show[0].title);
    });
}

function checkMovie(message, args) {
    var MVID = "";
    message.channel.send('Checking for: ' + args);
    request({
        headers: {
            'ApiKey': ombi
        },
        uri: 'http://request.franken-tech.com/api/v1/Search/movie/' + args,
        method: 'GET'
    }, function (err, res, body) {
        var movie = JSON.parse(body);
        if (movie.length > 1) {
            message.channel.send("Multiple similar title where found enter the number for the correct show.");
            var msqQ = [];
            for (var i=0; i<movie.length; i++) {
                var line = "";
                line = (i + 1) + ") " + movie[i].title
                msqQ.push(line);
            }
            message.channel.send(msqQ);
            var res = new Discord.Client();
            res.on('message', input => {
                if (message.author.id == input.author.id) {
                    var choice = input.content - 1;
                    if (MVID != null) {
                        moviePassID(message, choice, movie);
                        res.destroy()
            }}});
            res.login(token);
        } else if (movie.length == 1) {
            choice = 0;
            moviePassID(message, choice, movie);
        } else {
            message.channel.send("An error has occurred looking up title, please contact Administrator");
        }     
    });
}

function checkTV(message, args) {
    var TVID = "";
    message.channel.send('Checking for: ' + args); 
    request({
        headers: {
            'ApiKey': ombi
        },
        uri: 'http://request.franken-tech.com/api/v1/Search/tv/' + args,
        method: 'GET'
    }, function (err, res, body) {
        var show = JSON.parse(body);
        if (show.length > 1) {
            message.channel.send("Multiple similar title where found enter the number for the correct show.");
            var msqQ = [];
            for (var i=0; i<show.length; i++) {
                var line = "";
                line = (i + 1) + ") " + show[i].title
                msqQ.push(line);
            }
            message.channel.send(msqQ);
            var res = new Discord.Client();
            res.on('message', input => {
                if (message.author.id == input.author.id) {
                    var choice = input.content - 1;
                    TVID = show[choice].id;
                    if (TVID != null) {
                        tvPassID(message, TVID);
                        res.destroy()
            }}});
            res.login(token);
        } else if (show.length == 1) {
            TVID = show[0].id;
            tvPassID(message, TVID);
        } else {
            message.channel.send("An error has occurred looking up title, please contact Administrator");
        }
    });
}

function tvPassID(message, TVID) {
    request({
        headers: {
            'ApiKey': ombi
        },
        uri: 'http://request.franken-tech.com/api/v1/Search/tv/info/' + TVID,
        method: 'GET'
    }, function (err, res, body) {
        var newShow = JSON.parse(body);
        if (newShow.fullyAvailable) {
            message.channel.send("This show is fully available on Plex");
        } else if (newShow.partlyAvailable) {
            message.channel.send("This show is on Plex with missing episodes");
        } else if (!available) {
            message.channel.send("This show is not currently available on Plex");
        } else {
            message.channel.send("An error occured gathering information, please contact Administrator!");
        }
    });
}

function moviePassID(message, choice, movie) {
    if (movie[choice].available) {
        message.channel.send("This movie is currently available on Plex");
    } else if (!movie[choice].available) {
        message.channel.send("This movie is currently available on Plex");
    } else {
        message.channel.send("An error occured gathering information, please contact Administrator!");
    }
}

main();
