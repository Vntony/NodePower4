const express = require('express')
const compression = require('compression')
const morgan = require('morgan')
const {
    listAllGames,
    findGame,
    createGame
} = require('./data')

const app = express()
const router = express.Router()
//const routes = require('./routes')

const publicRoot = 'public'
app.use(express.static(publicRoot))

//ATTENTION A L'ORDRE !
app.use(morgan('tiny'))
app.use(express.json())
app.use(express.urlencoded())
app.use(router)

app.use((req, res, next) => { //next est le middleware et si le next() dedans est caché, la page ne chargera pas
    next()
})


const myCompression = compression()
app.use(myCompression)



router.get('/', (req, res) => {
        listAllGames()
        .then(games => {
            const html = renderGames(games)
            res.send(html)
        })
        .catch(err => {
            console.error('Failed to serve /', err.stack)
            res.status(500).send('Oops !')
            //res.send("Oops, error")
        })
    return

})



router.get('/games/:id', (req, res) => {
    const id = req.params.id
    findGame(id)
        .then(game => {
            if (game === null) {
                res.status(404).send('Partie inexistante')
            } else {
                res.send(`
                <html>
                 <head>
                  <title>Jeu ${game._id}</title>
                 </head>
                 <body>
                    <h1>Jeu ${game._id}</h1>
                    <section>
                      <h2>Tour numéro ${game.turn}</h2>
                    </section>
                    <p>${game.player1}</p>
                    <p>${game.player2}</p>
                 </body>
                </html>
        `)
            }
            //res.send("ID de la partie: " + render._id + '<br>' +" Nombre de tours : " + render.turn)
        })

})

//POST
router.post('/game', (req, res) => {

    createGame({
        player1: req.body.player1,
        player2: req.body.player2
    })
        .then( result => {
            res.redirect(303, '/games/'+result._id)
            //res.send("Voici venir la bataille entre " + req.body.player1 + " et " + req.body.player2)
        })
})



function renderGames(games) {
    const list = games.map(game => { //sorte de foreach !
        return `<li><a href="/games/${game._id}">${game._id}</a></li>`
    })
        .join(' ')


    return ` <html>
         <head>
          <title>Puissance 4</title>
         </head>
         <body>
            <h1>Bienvenue</h1>
              <h2>Toutes les parties</h2>
              <form action="/game" method="POST">
                <input type="text" name="player1">
                <br>
                <input type="text" name="player2">
                <br>
                <input type="submit" value="New game">
              </form>
                <ul>
                    ${list}
                </ul>
         </body>
        </html>
        
    `
}

app.listen(80, (err) => {
    if(err) {
        console.error(err ? err.stack : err)
        process.exit(255)
    } else {
        console.log('Listening on *:80')
    }
})