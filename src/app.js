//Load packages required for program
const mongodb = require('mongodb');
const path = require('path');
const express = require('express');
const hbs = require('hbs');


//Set up MongoDB
const MongoClient = mongodb.MongoClient;

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'Bulk Uploader';

MongoClient.connect(connectionURL, {}, (error, client) => {
    if(error){
        return console.log('Unable to connect to Database')
    }

    console.log('Goood!');
})

//start express
const app = express();


//set views and partials directory
const viewsPath = path.join(__dirname, '../templates/views');
const partialsPath = path.join(__dirname, '../templates/partials');
const publicDirectoryPath = path.join(__dirname, '../public');


//set engine and paths
app.set('view engine', 'hbs');
app.set('views', );
hbs.registerPartials(partialsPath);
app.use(express.static(publicDirectoryPath));

