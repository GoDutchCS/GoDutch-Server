const express = require('express')
const http = require('http')

const app = express()

app.set('port', process.env.PORT || 3000)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
    res.json({})
})

http.createServer(app).listen(app.get('port'), () => {
    console.log(`Express server listening on port ${app.get('port')}`)
})
