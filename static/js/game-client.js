(function($) {
  // js selectors
  const jss = {
    player_name_modal: '.js-modal-player-name-input',
    finishers_modal: '.js-modal-finishers',
    modal_content: '.js-modal-content',
    cta: '.js-cta',
    name_input: '.js-name',
    play_again_btn: '.js-play-again',
    move: '.js-move',
    player_row: '.js-player-row',
    game_arena: '.js-game-arena',
    moves_wrapper: '.js-moves-wrapper',
    move_advantage: '.js-move-advantage',
    move_advantage_note: '.js-move-advantage-note'
  };

  let game_data = {
    player_name: null,
    game: null,
    player_index: {},
    move_played: null
  };

  const socket_events = {
    add_player: "add_player",
    play_move: "play_move",
    reset_game: "reset_game",
    game_data: "game_data",
    redirect: "redirect",
    disconnect: "disconnect",
    app_error: "app_error"
  };

  const moves = {
    SAFE: 'SAFE',
    RISK: 'RISK',
    ADVANTAGE: 'ADVANTAGE'
  };

  function getGameIdFromURL() {
    const game_id_match = document.location.pathname.match(/^\/g\/(\w+)/);
    return game_id_match ? game_id_match[1] : null;
  }

  const socket = io("ws://localhost:3000");
  socket.on("connect", () => {
  });

  // handle the event sent with socket.send()
  socket.on(socket_events.game_data, (data) => {
    if (data.game && game_data.game) {
      if (data.game.timestamp < game_data.game.timestamp) {
        return;
      }
    }
    game_data = {
      ...game_data,
      ...data
    };
    game_data.player_index = {};
    if (game_data.game && game_data.game.players) {
      for (const player of game_data.game.players) {
        game_data.player_index[player.name] = player;
      }
    }
    renderGame();
  });

  socket.on(socket_events.redirect, (urlpath) => {
    document.location.href = urlpath;
  });

  socket.on(socket_events.disconnect, () => {
    document.location.reload();
  });

  socket.on(socket_events.app_error, (err) => {
    alert(err.message);
  })

  function _getScoreBarWidthPercent(score) {
    return score;
  }

  function _renderPlayer(player) {
    const cls_list = ["player-row", "js-player-row"];
    let yet_to_play_html = '';
    if (player.name === game_data.player_name) {
      cls_list.push("player-playing");
    }
    if (game_data.game && game_data.game.players_yet_to_play_move.length > 0 &&
        game_data.game.players_yet_to_play_move.indexOf(player.name) === -1) {
      yet_to_play_html = '<span class="player-moved"></span>';
    }
    return `<div class="${cls_list.join(' ')}"
                 data-name="${player.name}" data-score="${player.score}">
      <div class="d-flex-row flex-align-center">
        <div class="player-name">${player.name}${yet_to_play_html}</div>
        <div class="player-score">${player.score}</div>
      </div>
      <div class="player-score-bar-wrapper">
        <div class="player-score-bar" style="width: ${_getScoreBarWidthPercent(player.score)}%;"></div>
      </div>
    </div>`;
  }

  function _renderMove(move, cls_list, inner_html) {
    const final_cls_list = ['move', 'js-move', ...cls_list];
    return `<div class="${final_cls_list.join(' ')}" data-move="${move}">
      ${inner_html}
    </div>`;
  }

  function _renderMovesSection(instruction_html, selected_move) {
    const cls_list = ['moves', 'd-flex-row', 'flex-align-center', 'flex-justify-center'];
    const safe_mv_cls = ['move-safe'];
    const risk_mv_cls = ['move-risk'];
    const advantage_mv_cls = ['move-advantage', 'js-move-advantage'];
    if (selected_move) {
      cls_list.push('disabled');
    }
    if (selected_move === moves.SAFE) {
      safe_mv_cls.push('selected-move');
    } else if (selected_move === moves.RISK) {
      risk_mv_cls.push('selected-move');
    } else if (selected_move === moves.ADVANTAGE) {
      advantage_mv_cls.push('selected-move');
    }
    return `<div class="${cls_list.join(' ')}">
      <span class="moves-instruction js-moves-instruction">
        <h3>${instruction_html}</h3>
      </span>
      <div class="d-flex-row flex-justify-center">
        ${_renderMove(moves.SAFE, safe_mv_cls, 5)}
        ${_renderMove(moves.RISK, risk_mv_cls, 10)}
        <div class="move-advantage-wrapper">
          ${_renderMove(moves.ADVANTAGE, advantage_mv_cls, 50)}
          <div class="move-advantage-note js-move-advantage-note"></div>
        </div>
      </div>
    </div>`;
  }

  function _renderArena() {
    const players = game_data.game.players;
    $(jss.game_arena).html(
      players.map((p)=>_renderPlayer(p)).join('')
    );
  }

  function _setAdvantageMove() {
    if (game_data.player_name) {
      const player = game_data.player_index[game_data.player_name];
      if (player && player.can_use_advantage === false) {
        $(jss.move_advantage).addClass('disabled');
        $(jss.move_advantage_note).html('[Used]');
        return;
      }
    }
    $(jss.move_advantage).removeClass('disabled');
    $(jss.move_advantage_note).html('[Can use once]');
  }

  function _renderControls() {
    let selected_move = null;
    let instruction_html = 'Play your move';
    if (game_data.player_name && game_data.game && game_data.game.players_yet_to_play_move) {
      if (game_data.game.players_yet_to_play_move.indexOf(game_data.player_name) === -1) {
        selected_move = game_data.move_played;
        instruction_html = 'You played your move<br/>Waiting for others&mldr;';
      }
    }
    $(jss.moves_wrapper).html(
      _renderMovesSection(instruction_html, selected_move)
    );
    _setAdvantageMove();
  }

  function _renderFinishers() {
    const finishers = game_data.game.players.filter((p) => p.finished);
    if (finishers.length > 0) {
      _showModalForFinishers();
      _setModalForFinishers(finishers);
    }
  }

  function renderGame() {
    if (game_data.player_name) {
      _hideModalForPlayerNameInput();
    }
    _renderArena();
    _renderControls();
    _hideModalForFinishers();
    _renderFinishers();
  }

  function _setModalForFinishers(finishers) {
    const finishers_html = finishers.map((p) => `<span class="finished-player">${p.name}</span>`);
    const modal_content = `
      <p>${finishers_html} WON!</p>
    `;
    $(jss.finishers_modal).find(jss.modal_content).html(modal_content);
  }

  function _showModalForPlayerNameInput() {
    $(jss.player_name_modal).removeClass('hide');
    $(jss.player_name_modal).find('input').focus();
  }

  function _hideModalForPlayerNameInput() {
    $(jss.player_name_modal).addClass('hide');
  }

  function _showModalForFinishers() {
    $(jss.finishers_modal).removeClass('hide');
  }

  function _hideModalForFinishers() {
    $(jss.finishers_modal).addClass('hide');
  }

  function setPlayerName() {
    const player_name = $(jss.player_name_modal).find(jss.name_input).val().trim();
    if (game_data.player_name === null) {
      socket.emit(socket_events.add_player, {
        game_id: getGameIdFromURL(),
        name: player_name
      });
    }
  }

  function playMove(move) {
    game_data.move_played = move;
    socket.emit(socket_events.play_move, game_data.move_played);
  }

  $(document).ready(function() {
    socket.emit(
      socket_events.game_data,
      {game_id: getGameIdFromURL()}
    );
    _showModalForPlayerNameInput();

    $(jss.player_name_modal).find(jss.cta).on('click', (e) => {
      e && e.preventDefault();
      setPlayerName();
    });
    $('body').on('click', jss.move, (e) => {
      e && e.preventDefault();
      const $elem = $(e.target);
      if (!$elem.hasClass('disabled')) {
        playMove($elem.data('move'));
      }
    });
    $('body').on('click', jss.play_again_btn, (e) => {
      e && e.preventDefault();
      socket.emit(socket_events.reset_game);
    });
    $(jss.player_name_modal).find('input').keypress((e) => {
      if (e.which == 13) {
        setPlayerName();
        return false;
      }
    });
  });
})(jQuery);
