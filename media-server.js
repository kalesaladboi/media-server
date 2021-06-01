const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const crypto = require('crypto')
const mongoose = require('mongoose')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require ('gridfs-stream')
const methodOverride = require('method-override')
const dotenv = require('dotenv')

const app = express()

//middleware
app.use(bodyParser.json())
app.use(methodOverride('_method'))

// dotenv.config()
// mongoose.connect(process.env.DB_CONNECTION,{ useNewUrlParser: true } , () =>console.log(`db connected`))

const mongoURI = "mongodb+srv://KyleMiller:Luffy321@cluster0.2oag0.mongodb.net/user?retryWrites=true&w=majority"

let conn = mongoose.createConnection(mongoURI, () =>console.log("db connected"))

//init gridfs
let gfs

console.log('big boobies')

//storage

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
    res.json({file: req.file})
})

app.get('/mediaget', (req,res) =>{
    gfs.find().toArray((err,files) =>{
        if( !files || files.length === 0 ) {
            return res.status(404).json({
                err:'No files exist'
            })
        }
    })

    //file exist
    return res.json(files)
})

const port = process.env.PORT || 8000


conn.once('open', () => {
    //init stream
    gfs= Grid(conn.db, mongoose.mongo)
    gfs.collection('uploads')
    console.log('boobies')
    app.listen(port, () => console.log(`started on port ${port}`))
})