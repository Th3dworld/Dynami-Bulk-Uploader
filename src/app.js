//Load packages required for program
const { MongoClient, ServerApiVersion } = require("mongodb");
const path = require('path');
const express = require('express');
const hbs = require('hbs');
const multer  = require('multer')
const excelToJson = require('convert-excel-to-json');
const { Dropzone } = require("dropzone");
const xlsx = require('node-xlsx');

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

app.post("/submit",(req,res) => {
  const collectionName = req.body.collection;
  res.send(collectionName);
})

// post requests
app.post('/upload', upload.array('files'), (req, res) => {
 

  //iterate through each file storing it in secified data base
  req.files.forEach((file) => {
    const sheetBuffer = xlsx.parse(file.buffer);

    //get array with headers
    const dbheaders = sheetBuffer[0].data[1];
    const headers  =  sheetBuffer[0].data[0];
    const dbcount = dbheaders.length;
    const headerCount = headers.length;
    const mapObject = {};
    let i = 0;
    
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
            await db.collection(databaseName).insertOne(obj);
      })
  })
  
  

  res.send(req.body);
  
  // res.json(result);
});

 
//run webpage in browser
app.listen(3000, async ()=> {
    console.log("loaded succesfully");
    run().catch(console.dir);

})

  