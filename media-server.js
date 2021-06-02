const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const crypto = require('crypto')
const mongoose = require('mongoose')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')
const methodOverride = require('method-override')
const cors = require('cors')

const app = express()

//middleware
app.use(bodyParser.json())
app.use(methodOverride('_method'))
app.use(cors())

const mongoURI = "mongo connection"

let conn = mongoose.createConnection(mongoURI, () =>console.log("db connected"))

//init gridfs
let gfs

console.log('big boobies')

//storage

//randomizes file name so you don't have repeat names doesn't have to and you can add a name this
const storage = new GridFsStorage({
    url: mongoURI, 
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if(err) {
                    return reject(err)
                }
                const filename = buf.toString('hex') + path.extname(file.originalname)
                const fileInfo = {
                    filename: filename,
                    bucketname: 'uploads'
                }
                resolve(fileInfo)
            })
        })
    }
})
const upload = multer({ storage })

// post route
// uploads file to db
app.post('/mediapost',upload.single('file'), (req,res)=>{
    return res.json({file: req.file})
})

//gets all files
app.get('/files', (req, res) => {2
    gfs.find().toArray((err, files) => {
      console.log(gfs.find())
      // Check if files
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: 'No files exist'
        })
      }
      // Files exist
      return res.json(files)
    })
})

//gets files by filename
app.get('/files/:filename', (req, res) => {
    gfs.find({ filename: req.params.filename }).toArray((err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
      // File exists
      //return res.json(file)
      gfs.openDownloadStreamByName(req.params.filename).pipe(res)
    });
  });

const port = process.env.PORT || 4000


conn.once('open', () => {
    //init stream
    // gfs=Grid(conn.db, mongoose.mongo)
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName:"fs" //check this matches your mongodb collection it should be user.uploads.files but for some reason it does user.fs.files
    })
    // gfs.collection('uploads')
    app.listen(port, () => console.log(`started on port ${port}`))
})