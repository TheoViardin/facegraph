const express = require('express')
const bodyParser = require('body-parser')

const user = require('./route/user')
const graph = require('./route/graph')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'))

app.use('/user', user)
app.use('/graph', graph)

app.listen(3000, '192.168.1.22', function () {
    console.log('listening on port 3000')
})

