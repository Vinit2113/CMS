const express = require('express')
const bodyParser = require('body-parser')
const conn = require('./database/db')

require('dotenv').config();
const app = express()
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const classRoutes = require('./routes/AllInOneRoutes');
const facultyRoutes = require('./routes/AllInOneRoutes');
const studentRoutes = require('./routes/AllInOneRoutes');
const documentRoutes = require('./routes/AllInOneRoutes');



app.use('/classes', classRoutes)
app.use('/faculty', facultyRoutes)
app.use('/student', studentRoutes)
app.use('/documents', documentRoutes)



const PORT = process.env.PORT || 8765
app.get('/', (req, res) =>{
    res.send("Hello world")
})

app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
})