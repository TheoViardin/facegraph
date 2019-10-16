const cron = require('node-cron')
const fetch = require('node-fetch')

require('dotenv').config()

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(process.env.BASE_SQLITE);

console.log(`Robot lancé à ${new Date()}`)

cron.schedule('*/15 * * * *', () => {
    db.get(
        `
            SELECT name
            FROM user
            ORDER BY RANDOM()
            LIMIT 1
        `,
        function (err, res) {
            console.log(`Synchronisation débuté à ${new Date()} pour l'utilisateur ${res.name}`)
            fetch(`http://facegraph.theo-viardin.ninja/users/`, {
                    method: `POST`, 
                    body: JSON.stringify({screen_name: res.name}),
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(console.log(`Synchronisation terminée à ${new Date()}`))
        }
    )
})