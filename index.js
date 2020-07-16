import express from 'express'
import mongoose from 'mongoose'
import http from 'http'
import { api, auth } from './api/index.js'

const app = express()

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongodb connection error:'));
db.once('open', () => console.log('connected to mongodb'));
mongoose.connect('mongodb://localhost/godutch', { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true });

app.set('port', process.env.PORT || 3000)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.get('/', (req, res) => { res.json({}) })
app.use('/api', api)
app.use('/auth', auth)

http.createServer(app).listen(app.get('port'), () => {
    console.log(`Express server listening on port ${app.get('port')}`)
})
