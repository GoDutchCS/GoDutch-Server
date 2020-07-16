const express = require('express')
const mongoose = require('mongoose')
const http = require('http')

const app = express()

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongodb connection error:'));
db.once('open', () => console.log('connected to mongodb'));
mongoose.connect('mongodb://localhost/godutch', { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true });

app.set('port', process.env.PORT || 3000)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
    res.json({})
})

http.createServer(app).listen(app.get('port'), () => {
    console.log(`Express server listening on port ${app.get('port')}`)
})
