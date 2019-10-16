const express = require('express')
const router = express.Router()

const bodyParser = require('body-parser')
const Twitter = require('twitter')

const sqlite3 = require('sqlite3').verbose()

require('dotenv').config()

const app = express()
const db = new sqlite3.Database(process.env.BASE_SQLITE);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var clientTwitter = new Twitter({
    consumer_key: '6d39TkEgSHYGk7ttA1barye7P',
    consumer_secret: '1BNWHSyvjQtx5yYg1RNgXjQm9lXS7nODVBlxv0Osu8QxEQEZuG',
    access_token_key: '1181222020899643392-aDIqDiO6l6nWywrZZkUS67VcNerjbN',
    access_token_secret: 'XUgcMioxWCp5vzlerSb0KPqhakB2Cx5xJjXs7IZB6x0Wo'
});

router.get('/:screen_name', function (req, res) {
    var screen_name = req.params.screen_name

    clientTwitter.get('users/show', {screen_name: screen_name}, function (error, user, response) {
        res.status(200).json(user)
    })
})

router.post('/', function(req, res) {
    let name = req.body.screen_name
    
    saveUserByName(name)
        .then(function (user) {
            addUserFriends(user.id, user.name)
                .then(function (result) {
                    res.send()
                })
                .catch((error) => res.status(404).send(error))
        })
        .catch((error) => res.status(404).send(error))
    
});

function saveUserByName(name) {
    return new Promise(function (resolve, reject) {
        let params = {screen_name: name, count: 100}

        let id_user = null

        db.get(
            `
                SELECT id,
                    name
                FROM user
                WHERE name = ?
            `, 
            [name], 
            function (err, res) {
                if (res) {
                    resolve({
                        id: res.id,
                        name: res.name
                    })
                }
                else {
                    
                    clientTwitter.get('users/show', params, async function(error, user1, response) {
                        if (!error) {
                            db.run(`
                                INSERT INTO user (name, twitter_id) 
                                VALUES (?, ?)
                            `, 
                            [user1.screen_name, user1.id],
                            function (err, res) {
                                resolve({
                                    id: this.lastID,
                                    name: user1.screen_name
                                })
                            })
                        }
                        else {

                            console.log(new Date())
                            console.log(error)
                            reject(error.message)
                        }
                    })
                }
            }
        )
    })
}

function saveUser(user) {
    return new Promise(function (resolve, reject) {
        let id_user = null

        db.get(
            `
                SELECT id,
                    name
                FROM user
                WHERE name = ?
            `, 
            [user.screen_name], 
            function (err, res) {
                if (res) {
                    resolve({
                        id: res.id,
                        name: res.name
                    })
                }
                else {
                    db.run(`
                        INSERT INTO user (name, twitter_id) 
                        VALUES (?, ?)
                    `, 
                    [user.screen_name, user.id],
                    function (err, res) {
                        resolve({
                            id: this.lastID,
                            name: user.name
                        })
                    })
                }
            }
        )
    })
}

function addUserFriends(id_user, name) {
    return new Promise(function (resolve, reject) {
        let params = {screen_name: name, count: 100}

        if (id_user) {
            clientTwitter.get('followers/ids', params, async function(error, users2, response) {
                if (!error) {  
                    clientTwitter.get('users/lookup', {user_id: users2.ids.join()}, async function (error, response) {
                        
                        if (!error) {

                            if (response !== null) {
                                const prom = response.map(function (user2, index) {
                                    console.log(user2.name)
                                    return new Promise(function(resolve, reject) {
                                        saveUser(user2)
                                            .then(function (user) {
                                                addUserFriends(user.id, user.name)
                                                    .catch((error) => reject(error))
                                                saveUserRelation(id_user, user.id)
                                                    .then(function (res) {
                                                        resolve()
                                                    })
                                            })
                                    })
                                })
                                
                                Promise.all(prom)
                                    .then(function () {
                                        resolve()
                                    })
                            }
                        }
                        else {

                            console.log(new Date())
                            console.log(error)
                            reject(error.message)
                        }
                    })
                }
                else {
                            
                    console.log(new Date())
                    console.log(error)
                    reject(error.message)
                }
            })
        }
    })
}

function saveUserRelation(id_user1, id_user2) {
    return new Promise(function (resolve, reject) {
        
        db.get(
            `
                SELECT id
                FROM relation
                WHERE id1 = ?
                    AND id2 = ?
            `, 
            [id_user1, id_user2], 
            function (err, res) {
                if (res) {
                    resolve(res.id)
                } else {
                    db.run(
                        `
                            INSERT INTO relation (id1, id2) 
                            VALUES (?, ?)
                        `, 
                        [id_user1, id_user2],
                        function (err, res) {
                            resolve(this.lastID)
                        }
                    )
                }
            }
        )
    })
}

/*router.post('/', function(req, res) {
    var params = {screen_name: req.body.screen_name, count: 900};
    
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
                                console.log(response)
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
                                        res.status(500).send(error.message)
                                    }
                                })
                            }
                            else {                            
                                res.status(201).send()
                            }
                        })
                    }
                    else {
                    }
                });
            })            
        }
        else {            
            res.status(500).send(error.message)
        }
    })
    
});*/

module.exports = router