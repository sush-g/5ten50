const constants = require('./../constants');
const AppError = require('./AppError');
const Player = require('./Player');
const utils = require('../utils');

const {ERROR_TYPES, MOVES, MOVE_VALUES} = constants;

class Game {
  constructor(an_id) {
    this._id = an_id;
    this._players = {};
    this._moves = {};
    this._max_players = 50;
    this._finish_score = 100;
    this._max_advantages = 1;
  }

  get game_id() {
    return this._id;
  }

  get max_players() {
    return this._max_players;
  }

  get finish_score() {
    return this._finish_score;
  }

  get max_advantages() {
    return this._max_advantages;
  }

  get players() {
    return Object.values(this._players);
  }

  _makePlayerName_r(player_name) {
    if (this._players.hasOwnProperty(player_name)) {
      if (/-\d+$/.test(player_name)) {
        const idx = parseInt(player_name.match(/\d+$/)[0]);
        return this._makePlayerName_r(player_name.replace(/\d+$/, idx+1));
      } else {
        return this._makePlayerName_r(`${player_name}-2`);
      }
    }
    return player_name;
  }

  _makePlayerName(player_name) {
    let cleaned_name = player_name.replace(
      /[^a-z0-9\-\_]/gi, ''
    ).substr(0, 29);
    cleaned_name = cleaned_name ? cleaned_name : 'player';
    return this._makePlayerName_r(cleaned_name);
  }

  _isValidMove(player_name, move) {
    const player = this._players[player_name];
    return (MOVE_VALUES.indexOf(move) !== -1) &&
      !(move === MOVES.ADVANTAGE && !player.canUseAdvantage());
  }

  _cleanScore(score) {
    return Math.max(Math.min(score, this._finish_score), 0);
  }

  addPlayer(player_name) {
    const normalized_name = this._makePlayerName(player_name.substr(0, 29));
    if (Object.keys(this._players).length >= this._max_players) {
      throw new AppError(
        ERROR_TYPES.GAME__MAX_PLAYERS,
        "You can't add more players to the game"
      );
    }
    const player = new Player(normalized_name, this);
    this._players[normalized_name] = player;
    this._moves[normalized_name] = null;
    return player;
  }

  dropPlayer(player_name) {
    delete this._players[player_name];
    delete this._moves[player_name];
  }

  findPlayer(player_name) {
    return this._players[player_name];
  }

  playMove(player_name, move) {
    if (this._players.hasOwnProperty(player_name)) {
      if (this._isValidMove(player_name, move)) {
        this._moves[player_name] = move;
      } else {
        throw new AppError(
          ERROR_TYPES.GAME__INVALID_MOVE,
          "Invalid move played"
        );
      }
    } else {
      throw new AppError(
        ERROR_TYPES.GAME__PLAYER_NOT_FOUND,
        "Player not found"
      );
    }
  }

  _evalMoves() {
    let curr_player, curr_move, delta_score;
    const all_moves = Object.values(this._moves);
    const n_moves = all_moves.length;
    const n_risks = utils.nOccurrence(all_moves, MOVES.RISK);
    const n_adv = utils.nOccurrence(all_moves, MOVES.ADVANTAGE);
    const risk_score = n_risks > Math.floor(n_moves / 2) ? -5 : 10;
    const adv_score = n_adv === 1 ? 50 : 0;
    for (const k in this._moves) {
      if (this._moves.hasOwnProperty(k)) {
        curr_player = this._players[k];
        curr_move = this._moves[k];
        delta_score = 0;
        if (curr_move === MOVES.SAFE) {
          delta_score = 5;
        } else if (curr_move === MOVES.RISK) {
          delta_score = risk_score;
        } else if (curr_move === MOVES.ADVANTAGE) {
          delta_score = adv_score;
          curr_player.n_advantages += 1;
        }
        curr_player.score = this._cleanScore(curr_player.score + delta_score);
        curr_player.n_moves += 1;
      }
    }
  }

  _markFinishers() {
    for (const player of Object.values(this._players)) {
      if (!player.hasFinished() && player.score >= this._finish_score) {
        player.markFinished();
      }
    }
  }

  _resetMoves() {
    for (const k in this._moves) {
      this._moves[k] = null;
    }
  }

  concludeRound() {
    this._evalMoves();
    this._markFinishers();
    this._resetMoves();
  }

  canConcludeRound() {
    return Object.values(this._moves).filter(
      (move) => {return move===null;}
    ).length === 0;
  }

  resetPlayers() {
    for (const player of Object.values(this._players)) {
      player.reset();
      this._moves[player.name] = null;
    }
  }

  getDataForBroadcast() {
    const players_data = Object.values(
      this._players
    ).map(
      function(player) {
        return player.getDataForBroadcast();
      }
    );

    const players_yet_to_play_move = Object.keys(this._moves).filter(
      (player_name) => {return this._moves[player_name] === null;}
    );

    return {
      players: players_data,
      players_yet_to_play_move: players_yet_to_play_move,
      timestamp: utils.getTimestamp()
    };
  }
}

module.exports = Game;
