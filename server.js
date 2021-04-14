const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const port = 3000;
const utils = require('./utils');
const constants = require('./constants');

const AppError = require('./classes/AppError');
const GamesManager = require('./classes/GamesManager');
const game_mgr = new GamesManager();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));

// parse application/json
app.use(bodyParser.json({limit: '50mb'}));

app.set('view engine', 'pug');

app.use('/static', express.static('static'));

app.get('/', (req, res) => {
  res.render('index', {title: 'Play 5ten50'});
});

app.post('/create-room', (req, res) => {
  const req_body = req.body;
  try {
    const game_id = game_mgr.getNewGame();
    res.json({game_urlpath: `/g/${game_id}`});
  } catch (err) {
    if (err instanceof AppError) {
      res.status(503).json(err.getJSON());
    }
  }
});

app.get('/g/:game_id', (req, res) => {
  const game_id = req.params['game_id'];
  const game = game_mgr.getGame(game_id);
  if (game) {
    res.render('game', {
      game_id: game.game_id,
      moves: constants.MOVES
    })
  } else {
    res.redirect('/');
  }
});

io.on('connection', (socket) => {
  game_mgr.handleSocket(socket, io);
});

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
