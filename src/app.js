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
  // req.file is the name of your file in the form above, here 'uploaded_file'
  // req.body will hold the text fields, if there were any
  // const {mimetype} = req.files[0]

  //iterate through each file storing it in secified data base
  req.files.forEach((file) => {
    const sheetBuffer = xlsx.parse(file.buffer);
    console.log(sheetBuffer);

    //get headers
    // const headGetter = excelToJson({
    //   source: file.buffer, // fs.readFileSync return a Buffer
    // }); 

    //get array with headers
    const dbheaders = sheetBuffer[0].data[1];
    const headers  =  sheetBuffer[0].data[0];
    console.log(dbheaders);
    const dbcount = dbheaders.length;
    const headerCount = headers.length;
    const mapObject = {};
    let i = 0;
    
    while(i < headerCount){
      mapObject[headers[i]] = dbheaders[i];
      i++;
    }
    console.log(mapObject);

    i = 0;
    let dbObj = {};

    while(i < dbcount){
      dbObj[dbheaders[i]] = "";
      i++;
    }
    console.log(dbObj);
    const dataSheet = sheetBuffer[1].data;
    let dataObj = {};
    const dataHeaders = dataSheet[0];

    dataHeaders.forEach( async (item) =>{
      dataObj[item] = "";
    })

    console.log(dataObj);
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
    console.log(excelArray);

    excelArray.forEach((item) => {
      let newObj = {...dbObj};
      Object.keys(item).forEach(key => {
        newObj[mapObject[key]] = item[key];
      })
      dbArray.push(newObj);
    })

    console.log(dbArray);

      dbArray.forEach( async (obj) => {  
            await db.collection(databaseName).insertOne(obj);
      })
  
    //get access to excel 
    // const result = excelToJson({
    //   source: file.buffer, // fs.readFileSync return a Buffer
    //   columnToKey: {
    //     A: '{{A1}}',
    //     B: '{{B1}}',
    //     C: '{{C1}}',
    //     D: dbheaders[3],
    //     E: dbheaders[4],
    //     F: dbheaders[5],
    //     G: dbheaders[6],
    //     H: dbheaders[7],
    //     I: dbheaders[8],
    //     J: dbheaders[9],
    //     K: dbheaders[10],
    //     L: dbheaders[11],
    //     M: dbheaders[12],
    //     N: dbheaders[13],
    //     O: dbheaders[14],
    //     P: dbheaders[15],
    //     Q: dbheaders[16],
    //     R: dbheaders[17],
    //     S: dbheaders[18],
    //     T: dbheaders[19],
    //     U: dbheaders[20],
    //     V: dbheaders[21],
    //     W: dbheaders[22],
    //     X: dbheaders[23],
    //     Y: dbheaders[24],
    //     Z: dbheaders[25],
    //     // D:`{{${headers[3]}}}`
    //   },
    //   sheets: sheets
    // });



    // try{

    //  Object.values(result).forEach( (arr) => {
    //     arr.forEach(async (item) => {
    //       //Make sure rows containing heading is not copied
    //       if(item[dbheaders[0]] == headers[0]){
    //         return;
    //       }
    //       else{
    //         await db.collection(databaseName).insertOne(item);
    //       }
    //     })
    //   })
    

    // }catch(error){
    //   console.error('In Uploaders', error)
    // }
  })
  
  

  res.send(req.files);
  
  // res.json(result);
});

 
//run webpage in browser
app.listen(3000, async ()=> {
    console.log("loaded succesfully");
    run().catch(console.dir);

})

  