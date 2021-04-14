const keyMirror = require('keyMirror');

const ERROR_TYPES = keyMirror({
  GAMES_MANAGER__MAX_GAMES: null,
  GAME__MAX_PLAYERS: null,
  GAME__PLAYER_NOT_FOUND: null,
  GAME__INVALID_MOVE: null
});

const MOVES = keyMirror({
  SAFE: null,
  RISK: null,
  ADVANTAGE: null
});

exports.ERROR_TYPES = ERROR_TYPES;
exports.MOVES = MOVES;
exports.MOVE_VALUES = Object.values(MOVES);
