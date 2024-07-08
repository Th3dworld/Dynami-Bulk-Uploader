//Load packages required for program
const { MongoClient, ServerApiVersion } = require("mongodb");
const path = require('path');
const express = require('express');
const hbs = require('hbs');
const multer  = require('multer')

//Set up multer package
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})


const upload = multer({storage})
const databaseName = 'Bulk Uploader data';



// Replace the placeholder with your connection string
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
app.set('views', viewsPath );
hbs.registerPartials(partialsPath);
app.use(express.static(publicDirectoryPath));

//Load pages
app.get('', (req,res) => {
    res.render('index', {
        name: "Matanda Hillary Phiri",
    });
})

//post requests
app.post('/upload', upload.single('file'), (req, res) => {
  // req.file is the name of your file in the form above, here 'uploaded_file'
  // req.body will hold the text fields, if there were any 
  res.json(req.file);
});

 
//run webpage in browser
app.listen(3000, ()=> {
    console.log("loaded succesfully");
})