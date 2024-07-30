//Load packages required for program
const { MongoClient, ServerApiVersion } = require("mongodb");
const path = require('path');
const express = require('express');
const hbs = require('hbs');
const multer  = require('multer')
const xlsx = require('node-xlsx');

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

//Create Variables
let successes = "N/A";
let fails = "N/A";
let sheetsUploaded = "N/A";
let inserts =  "N/A";
let sheet = "N/A"
let err = "N/A"

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
  res.render('instructions', {
      name: "Matanda Hillary Phiri",
      title:"INSTRUCTIONS"
  });
})


// post requests
app.post('/upload', upload.array('files'), async(req, res) => {
  //Array to hold error data
  const sheetToError = {};
  inserts = 0;

  // get collection name
  const collectionName = req.body.collectionName;

  //Return home page if invalid collection name has been entered
  if(collectionName === "" || collectionName === "collection name"){
    return res.render('index', {
      name: "Matanda Hillary Phiri",
      title: "BULK UPLOADER"
    })
  }

  
  
  //iterate through each file storing it in specified data base
  req.files.forEach((file) => {
    const sheetBuffer = xlsx.parse(file.buffer);

    //Create Variables
    let i = 0; //Variable that will be used for every iteration needed
    //find mapping tab
    let mappingSheet = sheetBuffer.findIndex((obj) => obj.name === "mapping"); 

    if(mappingSheet === -1){
      sheetToError[file.originalname] = "mapping tab not found!";
      return;
    }

    //get arrays of headers
    const dbheaders = sheetBuffer[mappingSheet].data[1];
    const headers  =  sheetBuffer[0].data[0];

    const dbcount = dbheaders.length;
    const headerCount = headers.length;

    const mapObject = {};
    
    
    while(i < headerCount){
      mapObject[headers[i]] = dbheaders[i];
      i++;
    }

    i = 0;
    let dbObj = {};

    while(i < dbcount){
      dbObj[dbheaders[i]] = "";
      i++;
    }

    const dataSheet = sheetBuffer[1].data;
    let dataObj = {};
    const dataHeaders = dataSheet[0];

    dataHeaders.forEach( async (item) =>{
      dataObj[item] = "";
    })

    const excelArray = [];

    i = 0;
    dataSheet.forEach((items) => {
      if(i !== 0){
        let ind = 0;
        let newObj = {...dataObj};
        items.forEach((item) => {
          newObj[dataHeaders[ind]] = item;
          ind++;
        })
        excelArray.push(newObj)
      }
      i++;
    })

    const dbArray = [];

    excelArray.forEach((item) => {
      let newObj = {...dbObj};
      Object.keys(item).forEach(key => {
        newObj[mapObject[key]] = item[key];
      })
      dbArray.push(newObj);
    })

    
    dbArray.forEach( async (obj) => {  
      await db.collection(collectionName).insertOne(obj);
      inserts += 1;
    })
  })

  fails = Object.keys(sheetToError).length;
  sheetsUploaded = req.files.length;
  successes = sheetsUploaded - fails;

  if(fails > 0){
    sheet = Object.keys(sheetToError)[0];
    err = Object.values(sheetToError)[0];
  }

  res.render('message', {
    name: "Matanda Hillary Phiri",
  })

  // res.json(result);
});

app.get('/log', (req,res) => {
  res.render('log', {
      name: "Matanda Hillary Phiri",
      title:"Log",
      successes,
      fails,
      sheetsUploaded,
      inserts,
      sheet,
      err,
  });
})

 
//run webpage in browser
app.listen(3000, async ()=> {
    console.log("loaded succesfully");
    run().catch(console.dir);

})

  