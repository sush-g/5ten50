const assert = require('chai').assert;
const Player = require('../../classes/Player');

describe('Player', function() {
  it('Player should be created by name with correct defaults', function() {
    const player = new Player('terabaap');
    assert.equal(player.name, 'terabaap', 'player should be created with name terabaap');
    assert.equal(player.n_moves, 0, 'player should default to 0 n_moves');
    assert.equal(player.score, 0, 'player should default to 0 score');
    assert.equal(player.hasFinished(), false, 'player default state should be not finished');
  });

  it('Player score should be updated', function() {
    const player = new Player('terabaap');
    player.score += 50;
    assert.equal(player.score, 50, 'player score should be updated to 50');
  });

  it('Player data for broadcast check', function() {
    const player = new Player('terabaap');
    player.score += 5;
    player.n_moves++;
    player.score += 50;
    player.n_moves++;
    player.markFinished();
    assert.deepEqual(player.getDataForBroadcast(), {
      name: 'terabaap',
      score: 55,
      n_moves: 2,
      finished: true
    }, 'player data for broadcast should be intact');
  });
});
