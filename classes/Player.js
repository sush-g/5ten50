const utils = require('../utils');

class Player {
  constructor(name, game) {
    this._name = name;
    this._game = game;
    this._score = 0;
    this._n_moves = 0;
    this._n_advantages = 0;
    this._finished = false;
    this._created_at = utils.getTimestamp();
  }

  get name() {
    return this._name;
  }

  set name(new_name) {
    this._name = new_name;
  }

  get score() {
    return this._score;
  }

  set score(new_score) {
    this._score = new_score;
  }

  get n_moves() {
    return this._n_moves;
  }

  set n_moves(n) {
    this._n_moves = n;
  }

  get n_advantages() {
    return this._n_advantages;
  }

  set n_advantages(n) {
    this._n_advantages = n;
  }

  markFinished() {
    this._finished = true;
  }

  hasFinished() {
    return this._finished;
  }

  canUseAdvantage() {
    return this._n_advantages < this._game.max_advantages;
  }

  reset() {
    this._score = 0;
    this._n_moves = 0;
    this._n_advantages = 0;
    this._finished = false;
  }

  getDataForBroadcast() {
    return {
      name: this.name,
      score: this.score,
      n_moves: this.n_moves,
      can_use_advantage: this.canUseAdvantage(),
      finished: this.hasFinished(),
      created_at: this._created_at
    };
  }
}

module.exports = Player;
