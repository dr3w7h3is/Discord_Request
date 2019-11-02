const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
require('dotenv').config();

const token = process.env.token;
const ombi = process.env.reqAPI;

client.on('message', message => {
    client.user.setActivity("Being a POS");
    let fullCommand = message.content.substr(1);
    let splitCommand = fullCommand.split(" ");
    let primaryCommand = splitCommand[0]; 
    var args = fullCommand;
    var str = '!' + primaryCommand;
    args = args.replace(str, '');
    
	if (primaryCommand === 'plex.help') {
        message.channel.send('Shit dude I\'m fucking lazy nothing works yet, but....' + 
        '\n!plex.help - Shows Commands' + 
        '\n!req.movie (Movie Title)' + 
        '\n!req.tv (Show Name)' +
        '\n!check.movie (Movie Title)' +
        '\n!check.tv (Show Name)');
    } else if (primaryCommand === 'plex.status') {
        message.channel.send('I am still up and working!');
    } else if (primaryCommand  === 'req.movie') {
        if (!args.length) {
            return message.channel.send('You didn\'t provide a Movie title!');
        }
        args = args.replace("req.movie", "");
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
            }), function (err, res, body) {  
            }    
            message.channel.send("Making request for: " + movie[0].title);
        });
    } else if (primaryCommand  === 'req.tv') {
        if (!args.length) {
            return message.channel.send('You didn\'t provide a show name!');
        }
        message.channel.send('Checking for: ' + argus);
    } else if (primaryCommand  === 'check.movie') {
        if (!args.length) {
            return message.channel.send('You didn\'t provide a Movie title!');
        }
        args = args.replace("check.movie", "");
        message.channel.send('Checking for: ' + args);
        request({
            headers: {
                'ApiKey': ombi
            },
            uri: 'http://192.168.0.100:5000/api/v1/Search/movie/' + args,
            method: 'GET'
        }, function (err, res, body) {
            var movie = JSON.parse(body);
            if (movie[0].available){
                message.channel.send(movie[0].title + " is availble to view on plex");
            } else if (movie[0].requested) {
                message.channel.send(movie[0].title + " is unavailable but is already requested");
            } else {
                message.channel.send(movie[0].title + " is unavailable on plex");
            }      
        });  
    } else if (primaryCommand  === 'check.tv') {
        if (!args.length) {
            return message.channel.send('You didn\'t provide a show name!');
        }
        args = args.replace("check.tv", "");  
        message.channel.send('Checking for: ' + args); 
        request({
            headers: {
                'ApiKey': ombi
            },
            uri: 'http://192.168.0.100:5000/api/v1/Search/tv/' + args,
            method: 'GET'
        }, function (err, res, body) {
            var show = JSON.parse(body);
            if (show[0].fullyAvailable){
                message.channel.send(show[0].title + " is availble to view on plex");
            } else if (show[0].partlyAvailable) {
                message.channel.send(show[0].title + " has limited episodes on plex");
            } else {
                message.channel.send(show[0].title + " is unavailable on plex");
            }      
        });   
    }
});
client.login(token);