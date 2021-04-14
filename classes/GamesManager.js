const utils = require('../utils');
const AppError = require('./AppError');
const Game = require('./Game');
const constants = require('../constants');

const {ERROR_TYPES} = constants;

const socket_events = {
  add_player: 'add_player',
  play_move: 'play_move',
  reset_game: 'reset_game',
  game_data: 'game_data',
  disconnect: 'disconnect',
  app_error: 'app_error'
};

class GamesManager {
  constructor() {
    this._games = {};
    this._game_id_len = 10;
    this._max_games = 1000;
    this._sockets = {};
  }

  _getNewGameId() {
    let game_id = utils.makeID(this._game_id_len);
    if (!this._games.hasOwnProperty(game_id)) {
      return game_id;
    } else {
      return this._getNewGameId();
    }
  }

  _makeRoomIdForGame(game) {
    return `/g/${game.game_id}`;
  }

  getNewGame() {
    if (this._max_games > Object.keys(this._games).length) {
      const game_id = this._getNewGameId();
      const game = new Game(game_id);
      this._games[game_id] = game;
      return game_id;
    } else {
      throw new AppError(
        ERROR_TYPES.GAMES_MANAGER__MAX_GAMES,
        'No new games can be added, max games limit reached'
      );
    }
  }

  getGame(game_id) {
    return this._games[game_id];
  }

  _broadcastGameData(io, game) {
    const room_id = this._makeRoomIdForGame(game);
    io.in(room_id).emit(
      socket_events.game_data,
      {game: game.getDataForBroadcast()}
    );
  }

  _handleAddPlayer(socket, io, data) {
    if (!this._sockets.hasOwnProperty(socket.id)) {
      const {game_id, name} = data;
      if (!this._games.hasOwnProperty(game_id)) {
        socket.emit('redirect', '/');
      } else {
        const game = this._games[game_id];
        const player = game.addPlayer(name);
        const room_id = this._makeRoomIdForGame(game);
        this._sockets[socket.id] = {
          game_id: game_id,
          player_name: player.name
        };
        socket.join(room_id);
        socket.emit(
          socket_events.game_data,
          {player_name: player.name}
        );
        this._broadcastGameData(io, game);
      }
    }
  }

  _handlePlayMove(socket, io, move) {
    if (this._sockets.hasOwnProperty(socket.id)) {
      const {game_id, player_name} = this._sockets[socket.id];
      const game = this._games[game_id];
      game.playMove(player_name, move);
      if (game.canConcludeRound()) {
        game.concludeRound();
      }
      this._broadcastGameData(io, game);
    }
  }

  _handleGameData(socket, io, game_id) {
    if (this._games.hasOwnProperty(game_id)) {
      socket.emit(
        socket_events.game_data,
        {game: this._games[game_id].getDataForBroadcast()}
      );
    }
  }

  _handleDisconnect(socket, io) {
    if (this._sockets.hasOwnProperty(socket.id)) {
      const {game_id, player_name} = this._sockets[socket.id];
      const game = this._games[game_id];
      game.dropPlayer(player_name);
      if (game.players.length === 0) {
        delete this._games[game_id];
      } else {
        this._broadcastGameData(io, game);
      }
      delete this._sockets[socket.id];
    }
  }

  _handleSocketEvent(socket, io, handler_fn, ...args) {
    try {
      handler_fn.bind(this)(socket, io, ...args);
    } catch (err) {
      if (err instanceof AppError) {
        socket.emit(socket_events.app_error, err.getJSON());
      }
    }
  }

  handleSocket(socket, io) {
    socket.on(socket_events.add_player, (data) => {
      this._handleSocketEvent(socket, io, this._handleAddPlayer, data);
    });
    socket.on(socket_events.play_move, (move) => {
      this._handleSocketEvent(socket, io, this._handlePlayMove, move);
    });
    socket.on(socket_events.game_data, ({game_id})=> {
      this._handleSocketEvent(socket, io, this._handleGameData, game_id);
    });
    socket.on(socket_events.disconnect, () => {
      this._handleSocketEvent(socket, io, this._handleDisconnect);
    });
  }
}

module.exports = GamesManager;
