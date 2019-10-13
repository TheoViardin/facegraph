const express = require('express')
const router = express.Router()

const faunadb = require('faunadb')
const bodyParser = require('body-parser')
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

router.post('/', function(req, res) {
    var params = {screen_name: req.body.screen_name, count: 20};
    
    clientTwitter.get('users/show', params, function(error, user1, response) {
        if (!error) {

            const user1Data = {
                id: user1.id,
                name: user1.screen_name,
                user_created_date: user1.created_at
            }

            var createUser1 = clientFauna.query(
                q.Create(
                    q.Collection('user'), 
                    { data: 
                        user1Data
                    }
                )
            );
            createUser1.then(function (response) {
                
                clientTwitter.get('followers/ids', params, function(error, users2, response) {
                    if (!error) {  
                        clientTwitter.get('users/lookup', {user_id: users2.ids.join()}, function (error, response) {
                            if (!response === null) {
                                const prom = response.map(async function (user2, index) {
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
                                    
                                    createUser.then(function(resp) {

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

                                        createUser_user.then(function(resp) {})
                                    })
                                
                                })

                                var wait = Promise.all(prom)

                                wait.then(function (resp) {
                                    if (!error) {
                                        res.json({
                                            user1: user1,
                                            user2: response
                                        })
                                    }
                                    else {
                                        res.send(error.message)
                                    }
                                })
                            }
                            else {                            
                                res.send()
                            }
                        })
                    }
                    else {
                        res.send(error.message)
                    }
                });
            })

            
        }
    })
    
});

router.get('/:screen_name', function (req, res) {
    var screen_name = req.params.screen_name

    clientTwitter.get('users/show', {screen_name: screen_name}, function (error, user, response) {
        res.json(user)
    })
})

module.exports = router