"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

bot.dialog('/', [

function (session) {
    builder.Prompts.text(session, "Hello, and welcome to QnA Factbot! What's your name?");
},

function (session, results) {

    session.userData.name = results.response;
    builder.Prompts.number(session, "Hi " + results.response + ", how many years have you been writing code?"); 
},

function (session, results) {

    session.userData.yearsCoding = results.response;
    builder.Prompts.choice(session, "What language do you love the most?", ["C#", "JavaScript", "TypeScript", "Visual FoxPro"]);
},

function (session, results) {

    session.userData.language = results.response.entity;   

    session.send("Okay, " + session.userData.name + ", I think I've got it:" +
                " You've been writing code for " + session.userData.yearsCoding + " years," +
                " and prefer to use " + session.userData.language + ".");
}]);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpoint at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}