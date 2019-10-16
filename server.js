const express = require('express')
const bodyParser = require('body-parser')

const sqlite3 = require('sqlite3').verbose()

const users = require('./route/users')
const graph = require('./route/graph')

const app = express()
const db = new sqlite3.Database(process.env.BASE_SQLITE);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'))

app.use('/users', users)
app.use('/graph', graph)

app.listen(process.env.PORT, process.env.IP, function () {
    console.log(`listening on port ${process.env.PORT}`)

    db.run(`
        CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY, 
            twitter_id INTEGER NOT NULL, 
            name text NOT NULL
        )
    `)

    db.run(`
        CREATE TABLE IF NOT EXISTS relation (
            id INTEGER PRIMARY KEY, 
            id1 INTEGER NOT NULL, 
            id2 INTEGER NOT NULL, 
            FOREIGN KEY (id1)
                REFERENCES user (id)
                    ON DELETE cascade
                    ON UPDATE no action,
                    FOREIGN KEY (id2)
                REFERENCES user (id)
                    ON DELETE cascade
                    ON UPDATE no action
        )
    `)
})

