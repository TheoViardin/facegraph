const express = require('express')
const router = express.Router()

const faunadb = require('faunadb')
const bodyParser = require('body-parser')

const app = express()
const q = faunadb.query

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var clientFauna = new faunadb.Client({secret: 'fnADY9xgfRACAurCr5ZpzFsFqRuteoZ8daFBymq-'})

router.get('/', function (req, res) {
    var user_user = []
    var user = []

    clientFauna.paginate(
        q.Match(
            q.Index('all_user_user')
        )
    ) 
    .map(function(ref) {
        return q.Get(ref); 
    })
    .each(async function(page) {
        user_user.push(page)    
    })
    .then(function (dsds) {

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
        .then(function (dsds) {
            res.json({user: user, user_user: user_user})
        })
    })
})

module.exports = router