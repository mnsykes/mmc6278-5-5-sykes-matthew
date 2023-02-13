const express = require('express')
const apiRoutes = require('./api-routes')
const app = express()

app.use(express.json())
app.use(express.static('public'))
app.use('/api', apiRoutes)

module.exports = app
