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
        // Condition to catch if variables are passed
        if ((str == 'req.movie' || str == 'req.tv' || str == 'check.movie' || str == 'check.tv') && args == '') {
            message.channel.send("No arguments were passed, please try again!");
        } else {
            switch (primaryCommand) {
                case 'plex.help': helpInfo(message);
                    break;
                case 'plex.status': message.channel.send('I\'m up and running!');
                    break;
                case 'req.movie': reqMovie(message, args);
                    break;
                case 'req.tv': reqTV(message, args);
                    break;
                case 'check.movie': checkMovie(message, args);
                    break;
                case 'check.tv': checkTV(message, args);
                    break;
                case 'req.login': loginSetup(message);
                    break;
            }
        }
    });
    client.login(token);
}
// Function to send list of commands to channel
function helpInfo(message) {
    // Sends list of all commands to discord channel
    message.channel.send('Valid commands\n' + 
        '```!check.tv [argument]           Checks to see if TV show is available on Plex\n Example: !check.tv Archer```' +
        '```!check.movie [argument]        Checks to see if Movie is available on Plex\n Example: !check.movie Up!```' +
        '```!req.tv [argument]             Sends request to download TV show\n Example: !req.tv Archer```' +
        '```!req.movie [argument]          Sends request to downlaod Movie\n Example: !req.movie Up!```');
}
// Function to make requests for movies
function reqMovie(message, args) {
    message.channel.send('Checking for: ' + args);
    request({
        headers: {'ApiKey': ombi},
        uri: 'Search/movie/' + args,
        method: 'GET'
    }, function (err, res, body) {
        var movie = JSON.parse(body);
        var movieData = {"theMovieDbId": movie[0].id}
        reqMoviePost(movieData); 
        message.channel.send("Making request for: " + movie[0].title);
    });
}
// Function to handle HTTP POST of formatted request data
function reqMoviePost(movieData) {
    request({
        headers: {'ApiKey': ombi},
        uri: base + 'Request/movie/',
        method: 'POST',
        json: movieData
    });
}
// Function to make request for TV shows
function reqTV(message, args) {
    message.channel.send('Checking for: ' + args);
    request({
        headers: {'ApiKey': ombi},
        uri: base + 'Search/tv/' + args,
        method: 'GET'
    }, function (err, res, body) {
            var show = JSON.parse(body); 
            var showData = {
                "requestAll": true,
                "latestSeason": true,
                "firstSeason": true,
                "tvDbId": show[0].id,
                "seasons": [{"seasonNumber": 0,"episodes": [{"episodeNumber": 0}]}]
            }
            reqTVPost(showData);  
            message.channel.send("Making request for: " + show[0].title);
    });
}
// Function to handle HTTP POST of formatted request data
function reqTVPost(showData) {
    request({
        headers: {'ApiKey': ombi},
        uri: base + 'Request/tv/',
        method: 'POST',
        json: showData
    });
}
// Function to check if a Movie is available
function checkMovie(message, args) {
    var MVID = "";
    message.channel.send('Checking for: ' + args);
    request({
        headers: {'ApiKey': ombi},
        uri: base +'Search/movie/' + args,
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
// Function to handle response data of Movie availability
function moviePassID(message, choice, movie) {
    if (movie[choice].available) {message.channel.send("This movie is currently available on Plex");} 
    else if (!movie[choice].available) {message.channel.send("This movie is currently available on Plex");} 
    else {message.channel.send("An error occured gathering information, please contact Administrator!");}
}
// Function to check if TV show is available
function checkTV(message, args) {
    var TVID = "";
    message.channel.send('Checking for: ' + args); 
    request({
        headers: {'ApiKey': ombi},
        uri: base + 'Search/tv/' + args,
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
            tvPassID(message, TVID);} 
        else {message.channel.send("An error has occurred looking up title, please contact Administrator");}
    });
}
// Function to handle response data of TV show availability
function tvPassID(message, TVID) {
    request({
        headers: {'ApiKey': ombi},
        uri: base + 'Search/tv/info/' + TVID,
        method: 'GET'
    }, function (err, res, body) {
        var newShow = JSON.parse(body);
        if (newShow.fullyAvailable) {message.channel.send("This show is fully available on Plex");} 
        else if (newShow.partlyAvailable) {message.channel.send("This show is on Plex with missing episodes");} 
        else if (!available) {message.channel.send("This show is not currently available on Plex");} 
        else {message.channel.send("An error occured gathering information, please contact Administrator!");}
    });
}
// Call main
main();