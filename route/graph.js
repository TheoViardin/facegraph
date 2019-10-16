const express = require('express')
const router = express.Router()

const bodyParser = require('body-parser')

const sqlite3 = require('sqlite3').verbose()

require('dotenv').config()

const app = express()
const db = new sqlite3.Database(process.env.BASE_SQLITE);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*router.get('/', function (req, res) {
    var user_user = []
    var user = []
console.log('test')
    clientFauna.paginate(
        q.Match(
            q.Index('all_user_user')
        )
    ) 
    .map(function(ref) {
        console.log('test1')
        return q.Get(ref); 
    })
    .each(function(page) {
        console.log('test2')
        user_user.push(page)    
    })
    .then(function () {

        console.log('test4')
        clientFauna.paginate(
            q.Match(
                q.Index('all_user')
            )
        ) 
        .map(function(ref) {
            return q.Get(ref); 
        })
        .each(async function(page) {
            user.push(page)    
        })
        .then(function () {
            res.status(200).json({user: user, user_user: user_user})
        })
    })
})*/

router.get('/', function (req, res) {
    var user_user = []
    var user = []

    var wait = [
        new Promise(function (resolve, reject) {
            db.all(
                `
                    SELECT *
                    FROM user
                `,
                function (err, rows) {
                    user = rows
                    resolve()
                }
            )
        }),
        new Promise(function (resolve, reject) {
            db.all(
                `
                    SELECT *
                    FROM relation
                `,
                function (err, rows) {
                    user_user = rows
                    resolve()
                }
            )
        })
    ]
    
    Promise.all(wait)
        .then(function () {
            console.log('retour')
            res.json({
                users: user,
                edges: user_user
            })
        })
})

module.exports = router