const express = require('express')
const faunadb = require('faunadb')
const bodyParser = require('body-parser')

const app = express()
const q = faunadb.query

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var client = new faunadb.Client({secret: 'fnADY9xgfRACAurCr5ZpzFsFqRuteoZ8daFBymq-'})

/*var createP = client.query(
    q.Create(
        q.Collection('user'), 
        { data: 
            { 
                name: 'Ganacheau',
                firstname: 'Quentin',
                user_created_date: ''
            } 
        }
    )
);

createP.then(function(response) {
    console.log(response.ref); // Would log the ref to console.
});*/

app.post('/user', function (req, res) {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    var createUser = client.query(
        q.Create(
            q.Collection('user'), 
            { data: 
                { 
                    name: req.body.name,
                    firstname: req.body.firstName,
                    user_created_date: dateTime
                } 
            }
        )
    );

    createUser.then(function(response) {
        console.log(response.ref); // Would log the ref to console.
    });
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

