const express = require('express')
const faunadb = require('faunadb')
const bodyParser = require('body-parser')
const path = require('path')
const https = require('https')
const fs = require('fs')
const Twitter = require('twitter')

const app = express()
const q = faunadb.query

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var clientFauna = new faunadb.Client({secret: 'fnADY9xgfRACAurCr5ZpzFsFqRuteoZ8daFBymq-'})

var clientTwitter = new Twitter({
    consumer_key: '6d39TkEgSHYGk7ttA1barye7P',
    consumer_secret: '1BNWHSyvjQtx5yYg1RNgXjQm9lXS7nODVBlxv0Osu8QxEQEZuG',
    access_token_key: '1181222020899643392-aDIqDiO6l6nWywrZZkUS67VcNerjbN',
    access_token_secret: 'XUgcMioxWCp5vzlerSb0KPqhakB2Cx5xJjXs7IZB6x0Wo'
});

/*var createP = clientFauna.query(
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

app.get('/', function (req, res) {    
    res.sendFile(path.join(__dirname + '/index.html'));
})

app.get('/sigma.min.js', function (req, res) {   
    res.sendFile(path.join(__dirname + '/sigma.js/build/sigma.min.js'));
})

app.post('/', function(req, res) {
    var params = {screen_name: req.body.screen_name};
    
    clientTwitter.get('users/show', params, function(error, user1, response) {
        if (!error) {
            var createUser1 = clientFauna.query(
                q.Create(
                    q.Collection('user'), 
                    { data: 
                        {
                            id: user1.id,
                            name: user1.screen_name,
                            user_created_date: user1.created_at
                        } 
                    }
                )
            );
            createUser1.then(function (response) {
                console.log(response)
                clientTwitter.get('followers/list', params, function(error, users2, response) {
                    if (!error) {
                    
                        users2.users.map((user2, index) => {            
                            var createUser = clientFauna.query(
                                q.Create(
                                    q.Collection('user'), 
                                    { data: 
                                        {
                                            id: user2.id,
                                            name: user2.screen_name,
                                            user_created_date: user2.created_at
                                        } 
                                    }
                                )
                            );
                            
                            createUser.then(function (response) {
                                var createUser_user = clientFauna.query(
                                    q.Create(
                                        q.Collection('user_user'), 
                                        { data: 
                                            {
                                                user1: user1.id,
                                                user2: user2.id
                                            } 
                                        }
                                    )
                                );
                            })
                        })
                        console.log(users2)
                        res.json({
                            user1: user1,
                            users2: users2.users
                        })
                    }
                });
            })

            
        }
    })
    
});

app.post('/user', function (req, res) {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    var createUser = clientFauna.query(
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

app.listen(3000, 'localhost', function () {
    console.log('listening on port 3000')
})

