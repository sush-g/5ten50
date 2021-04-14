const assert = require('chai').assert;
const Game = require('../../classes/Game');
const constants = require('../../constants');

describe('Game', function() {
  it('should be created by an id with correct defaults', function() {
    const game = new Game('#Game1');
    assert.equal(game.game_id, '#Game1', 'game should have game id #Game1');
    assert.deepEqual(game.players, [], 'game should default to no players');
  });

  it('should add player by player name', function() {
    const game = new Game('#Game1');
    game.addPlayer('terabaap');
    const data_for_broadcast = game.getDataForBroadcast();
    assert.equal(game.players.length, 1, '1 player should exist');
    assert.equal(game.players[0].name, 'terabaap', '1st player name should be terabaap');
    assert.equal(data_for_broadcast.players.length, 1);
    assert.deepEqual(data_for_broadcast.players_yet_to_play_move, ['terabaap']);
  });

  it('should add players with same name with auto incremented id suffixes', function() {
    const game = new Game('#Game1');
    game.addPlayer('terabaap');
    game.addPlayer('terabaap');
    game.addPlayer('terabaap');
    const player_names = game.players.map((p)=>p.name);
    assert.deepEqual(player_names.sort(), ['terabaap', 'terabaap-2', 'terabaap-3'].sort());
  });

  it('should be able to make players make a move', function() {
    const game = new Game('#Game1');
    game.addPlayer('terabaap');
    game.playMove('terabaap', constants.MOVES.SAFE);
    const data_for_broadcast = game.getDataForBroadcast();
    assert.deepEqual(data_for_broadcast.players_yet_to_play_move, []);
  });

  it('should not conclude if all players are not done with move', function() {
    const game = new Game('#Game1');
    game.addPlayer('terabaap');
    game.addPlayer('sabkabaap');
    game.addPlayer('aapkabaap');
    game.playMove('terabaap', constants.MOVES.SAFE);
    game.playMove('sabkabaap', constants.MOVES.RISK);
    assert.equal(game.canConcludeRound(), false);
  });

  it('should not conclude if all players are not done with move', function() {
    const game = new Game('#Game1');
    game.addPlayer('terabaap');
    game.addPlayer('sabkabaap');
    game.addPlayer('aapkabaap');
    game.playMove('terabaap', constants.MOVES.SAFE);
    game.playMove('sabkabaap', constants.MOVES.RISK);
    assert.equal(game.canConcludeRound(), false);
  });

  it('should conclude if all players are done with move', function() {
    const game = new Game('#Game1');
    game.addPlayer('terabaap');
    game.addPlayer('sabkabaap');
    game.addPlayer('aapkabaap');
    game.playMove('terabaap', constants.MOVES.SAFE);
    game.playMove('sabkabaap', constants.MOVES.RISK);
    game.playMove('aapkabaap', constants.MOVES.SAFE);
    assert.equal(game.canConcludeRound(), true);
  });

  it('should conclude round for all safes moves', function() {
    const game = new Game('#Game1');
    game.addPlayer('terabaap');
    game.addPlayer('sabkabaap');
    game.addPlayer('aapkabaap');
    game.playMove('terabaap', constants.MOVES.SAFE);
    game.playMove('sabkabaap', constants.MOVES.SAFE);
    game.playMove('aapkabaap', constants.MOVES.SAFE);
    assert.equal(game.canConcludeRound(), true);
    game.concludeRound();
    assert.equal(game.players.find((p)=>p.name=='terabaap').score, 5);
    assert.equal(game.players.find((p)=>p.name=='sabkabaap').score, 5);
    assert.equal(game.players.find((p)=>p.name=='aapkabaap').score, 5);
  });

  it('should conclude round for less than majority risk takers', function() {
    const game = new Game('#Game1');
    game.addPlayer('terabaap');
    game.addPlayer('sabkabaap');
    game.addPlayer('aapkabaap');
    game.playMove('terabaap', constants.MOVES.SAFE);
    game.playMove('sabkabaap', constants.MOVES.RISK);
    game.playMove('aapkabaap', constants.MOVES.SAFE);
    assert.equal(game.canConcludeRound(), true);
    game.concludeRound();
    assert.equal(game.players.find((p)=>p.name=='terabaap').score, 5);
    assert.equal(game.players.find((p)=>p.name=='sabkabaap').score, 10);
    assert.equal(game.players.find((p)=>p.name=='aapkabaap').score, 5);
  });

  it('should conclude round for majority risk takers', function() {
    const game = new Game('#Game1');
    game.addPlayer('terabaap');
    game.addPlayer('sabkabaap');
    game.addPlayer('aapkabaap');
    game.playMove('terabaap', constants.MOVES.SAFE);
    game.playMove('sabkabaap', constants.MOVES.RISK);
    game.playMove('aapkabaap', constants.MOVES.RISK);
    assert.equal(game.canConcludeRound(), true);
    game.concludeRound();
    assert.equal(game.players.find((p)=>p.name=='terabaap').score, 5);
    assert.equal(game.players.find((p)=>p.name=='sabkabaap').score, 0);
    assert.equal(game.players.find((p)=>p.name=='aapkabaap').score, 0);
  });

  it('should conclude round for less than majority risk takers mid game', function() {
    const game = new Game('#Game1');
    game.addPlayer('terabaap');
    game.addPlayer('sabkabaap');
    game.addPlayer('aapkabaap');
    game.playMove('terabaap', constants.MOVES.SAFE);
    game.playMove('sabkabaap', constants.MOVES.RISK);
    game.playMove('aapkabaap', constants.MOVES.RISK);
    game.players.forEach((p) => {p.score = 50;});
    assert.equal(game.canConcludeRound(), true);
    game.concludeRound();
    assert.equal(game.players.find((p)=>p.name=='terabaap').score, 55);
    assert.equal(game.players.find((p)=>p.name=='sabkabaap').score, 45);
    assert.equal(game.players.find((p)=>p.name=='aapkabaap').score, 45);
  });

  it('should conclude round for single player playing advantage', function() {
    const game = new Game('#Game1');
    game.addPlayer('terabaap');
    game.addPlayer('sabkabaap');
    game.addPlayer('aapkabaap');
    game.playMove('terabaap', constants.MOVES.SAFE);
    game.playMove('sabkabaap', constants.MOVES.RISK);
    game.playMove('aapkabaap', constants.MOVES.ADVANTAGE);
    assert.equal(game.canConcludeRound(), true);
    game.concludeRound();
    assert.equal(game.players.find((p)=>p.name=='terabaap').score, 5);
    assert.equal(game.players.find((p)=>p.name=='sabkabaap').score, 10);
    assert.equal(game.players.find((p)=>p.name=='aapkabaap').score, 50);
  });

  it('should conclude round for more than 1 player playing advantage', function() {
    const game = new Game('#Game1');
    game.addPlayer('terabaap');
    game.addPlayer('sabkabaap');
    game.addPlayer('aapkabaap');
    game.playMove('terabaap', constants.MOVES.ADVANTAGE);
    game.playMove('sabkabaap', constants.MOVES.RISK);
    game.playMove('aapkabaap', constants.MOVES.ADVANTAGE);
    assert.equal(game.canConcludeRound(), true);
    game.concludeRound();
    assert.equal(game.players.find((p)=>p.name=='terabaap').score, 0);
    assert.equal(game.players.find((p)=>p.name=='sabkabaap').score, 10);
    assert.equal(game.players.find((p)=>p.name=='aapkabaap').score, 0);
  });

  it('should conclude round for finishers', function() {
    const game = new Game('#Game1');
    game.addPlayer('terabaap');
    game.addPlayer('sabkabaap');
    game.addPlayer('aapkabaap');
    const terabaap = game.players.find((p)=>p.name=='terabaap');
    const sabkabaap = game.players.find((p)=>p.name=='sabkabaap');
    const aapkabaap = game.players.find((p)=>p.name=='aapkabaap');
    terabaap.score = 95;
    sabkabaap.score = 95;
    game.playMove('terabaap', constants.MOVES.SAFE);
    game.playMove('sabkabaap', constants.MOVES.RISK);
    game.playMove('aapkabaap', constants.MOVES.ADVANTAGE);
    assert.equal(game.canConcludeRound(), true);
    game.concludeRound();
    assert.equal(terabaap.score, 100);
    assert.equal(sabkabaap.score, 100);
    assert.equal(aapkabaap.score, 50);
    assert.equal(terabaap.hasFinished(), true);
    assert.equal(sabkabaap.hasFinished(), true);
    assert.equal(aapkabaap.hasFinished(), false);
  });

  it('should make data for broadcast', function() {
    const game = new Game('#Game1');
    game.addPlayer('terabaap');
    game.addPlayer('sabkabaap');
    game.addPlayer('aapkabaap');
    const terabaap = game.players.find((p)=>p.name=='terabaap');
    const sabkabaap = game.players.find((p)=>p.name=='sabkabaap');
    const aapkabaap = game.players.find((p)=>p.name=='aapkabaap');
    terabaap.score = 95;
    sabkabaap.score = 95;
    game.playMove('terabaap', constants.MOVES.SAFE);
    game.playMove('sabkabaap', constants.MOVES.RISK);
    const data_for_broadcast = game.getDataForBroadcast();
    assert.includeDeepMembers(
      data_for_broadcast.players, [terabaap, sabkabaap, aapkabaap].map(
        (p)=>p.getDataForBroadcast()
      )
    );
    assert.equal(data_for_broadcast.players.length, 3);
    assert.equal(data_for_broadcast.players_yet_to_play_move, 'aapkabaap');
  });
});
