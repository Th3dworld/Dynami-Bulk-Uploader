//Load packages required for program
const { MongoClient, ServerApiVersion } = require("mongodb");
const path = require('path');
const express = require('express');
const hbs = require('hbs');
const multer  = require('multer')
const excelToJson = require('convert-excel-to-json');
const { Dropzone } = require("dropzone");

//Set up multer package
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname)
//   }
// })

const storage = multer.memoryStorage();
const  fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
    cb(null, true);
  } else {
    return cb(new Error('Invalid file type'));
  }
}

//Use dropzone code
const upload = multer({storage, fileFilter})
const databaseName = 'bulk-uploader-data';




// Replace the placeholder with your connection string
const uri = "mongodb://127.0.0.1:27017";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri);
let db;

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    db = client.db(databaseName)
 
    // Send a ping to confirm a successful connection
    console.log("You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}



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
        title: "BULK UPLOADER"
    });
})

app.get('/instructions', (req,res) => {
  res.render('index', {
      name: "Matanda Hillary Phiri",
      title:"INSTRUCTIONS"
  });
})

app.get('/log', (req,res) => {
  res.render('index', {
      name: "Matanda Hillary Phiri",
      title:"Log"
  });
})

//post requests
app.post('/upload', upload.array('files'), (req, res) => {
  // req.file is the name of your file in the form above, here 'uploaded_file'
  // req.body will hold the text fields, if there were any
  // const {mimetype} = req.files[0]

  //iterate through each file storing it in secified data base
  req.files.forEach((file) => {
    //get headers
    const headGetter = excelToJson({
      source: file.buffer, // fs.readFileSync return a Buffer
    }); 

    //get array with headers
    const dbheaders = Object.values(headGetter.mapping[1]);
    const headers  = Object.values(headGetter.mapping[0]);
    const [map, ...sheets] = Object.keys(headGetter);

    //get access to excel 
    const result = excelToJson({
      source: file.buffer, // fs.readFileSync return a Buffer
      columnToKey: {
        A: dbheaders[0],
        B: dbheaders[1],
        C: dbheaders[2],
        D: dbheaders[3],
        E: dbheaders[4],
        F: dbheaders[5],
        G: dbheaders[6],
        H: dbheaders[7],
        I: dbheaders[8],
        J: dbheaders[9],
        K: dbheaders[10],
        L: dbheaders[11],
        M: dbheaders[12],
        N: dbheaders[13],
        O: dbheaders[14],
        P: dbheaders[15],
        Q: dbheaders[16],
        R: dbheaders[17],
        S: dbheaders[18],
        T: dbheaders[19],
        U: dbheaders[20],
        V: dbheaders[21],
        W: dbheaders[22],
        X: dbheaders[23],
        Y: dbheaders[24],
        Z: dbheaders[25],
        // D:`{{${headers[3]}}}`
      },
      sheets: sheets
    });



    try{

     Object.values(result).forEach( (arr) => {
        arr.forEach(async (item) => {
          //Make sure rows containing heading is not copied
          if(item[dbheaders[0]] == headers[0]){
            return;
          }
          else{
            await db.collection(databaseName).insertOne(item);
          }
        })
      })
    

    }catch(error){
      console.error('In Uploaders', error)
    }
  })
  
  

  res.send(req.files[0]);
  
  // res.json(result);
});

 
//run webpage in browser
app.listen(3000, async ()=> {
    console.log("loaded succesfully");
    run().catch(console.dir);

})

  