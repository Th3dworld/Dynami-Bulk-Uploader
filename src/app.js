//Load packages required for program
const { MongoClient, ServerApiVersion } = require("mongodb");
const path = require('path');
const express = require('express');
const hbs = require('hbs');


// //Set up MongoDB
// const MongoClient = mongodb.MongoClient;

// const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'Bulk Uploader data';

// MongoClient.connect(connectionURL, {}, (error, client) => {
//     if(error){
//         return console.log('Unable to connect to Database')
//     }

//     console.log('Goood!');
// })



// Replace the placeholder with your Atlas connection string
const uri = "mongodb://127.0.0.1:27017";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    const db = client.db(databaseName);
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


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

