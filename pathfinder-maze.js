(function () {
  'use strict';

  function init() {
    var board = document.getElementById('pp-2048-board');
    var scoreEl = document.getElementById('pp-2048-score');
    var bestEl = document.getElementById('pp-2048-best');
    var restart1 = document.getElementById('pp-2048-restart');
    var restart2 = document.getElementById('pp-2048-new');
    var message = document.getElementById('pp-2048-message');

    if (!board || !scoreEl || !bestEl ||
        board.getAttribute('data-pp2048-init') === '1') {
      return;
    }

    board.setAttribute('data-pp2048-init', '1');

    var style = document.createElement('style');
    style.type = 'text/css';
    style.textContent = `
      .pp-game-terminal {
        display:block!important;box-sizing:border-box!important;
        width:100%!important;max-width:540px!important;
        margin:25px auto!important;padding:22px!important;
        overflow:hidden!important;background:#071b4b!important;
        border:2px solid #d7ad45!important;border-radius:10px!important;
        color:#fff8dc!important;font-family:Arial,Helvetica,sans-serif!important;
        line-height:1.45!important;
        box-shadow:0 0 0 4px #0b2c70,0 0 30px rgba(0,0,0,.4),
          inset 0 0 28px rgba(85,155,255,.13)!important;
      }
      .pp-game-terminal *{box-sizing:border-box}
      .pp-game-terminal .pp-game-header{
        display:flex!important;align-items:flex-start!important;
        justify-content:flex-start!important;gap:0!important;
        flex-wrap:wrap!important;margin-bottom:16px!important;
        padding:0 0 13px!important;border-bottom:1px solid rgba(224,190,99,.5)!important;
      }
      .pp-game-terminal .pp-game-kicker,
      .pp-game-terminal .pp-game-header h3,
      .pp-game-terminal .pp-game-status{display:none!important}
      .pp-game-terminal .pp-game-header p{
        margin:0!important;padding:0!important;color:#f6df9b!important;
        font-size:13px!important;font-weight:700!important;letter-spacing:.2px!important;
      }
      .pp-game-terminal .pp-game-stats{
        display:flex!important;flex-direction:row!important;
        align-items:stretch!important;justify-content:stretch!important;
        flex-wrap:nowrap!important;gap:10px!important;width:100%!important;
        max-width:none!important;margin:0 0 14px!important;padding:0!important;
        float:none!important;clear:both!important;position:relative!important;
      }
      .pp-game-terminal .pp-game-stat{
        display:block!important;flex:1 1 0!important;width:50%!important;
        max-width:none!important;min-width:0!important;float:none!important;
        position:static!important;margin:0!important;padding:12px!important;
        border:1px solid #d5ad4d!important;border-radius:6px!important;
        background:linear-gradient(180deg,#17499c,#0d2d70)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 3px 8px rgba(0,0,0,.22)!important;
        text-align:center!important;
      }
      .pp-game-terminal .pp-game-stat span{
        display:block!important;margin-bottom:5px!important;color:#f1d98e!important;
        font-size:9px!important;font-weight:bold!important;letter-spacing:1.2px!important;
      }
      .pp-game-terminal .pp-game-stat strong{
        display:block!important;color:#fff!important;
        font-family:Arial,Helvetica,sans-serif!important;font-size:27px!important;
        font-weight:900!important;line-height:1.15!important;
        text-shadow:0 2px 0 #08245b,0 0 10px rgba(255,255,255,.18)!important;
      }
      .pp-game-terminal #pp-2048-board{
        display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;
        grid-template-rows:repeat(4,minmax(0,1fr))!important;
        gap:clamp(5px,1.5vw,9px)!important;width:100%!important;
        max-width:440px!important;margin:0 auto!important;
        padding:clamp(7px,2vw,11px)!important;aspect-ratio:1/1!important;
        border:2px solid #d8b34e!important;border-radius:7px!important;
        background:linear-gradient(145deg,#06143b,#0b2b68)!important;
        box-shadow:inset 0 0 24px rgba(0,0,0,.55),0 0 14px rgba(0,0,0,.25)!important;
        touch-action:none!important;user-select:none!important;-webkit-user-select:none!important;
      }
      .pp-game-terminal #pp-2048-board .pp2048-cell{
        display:flex!important;align-items:center!important;justify-content:center!important;
        min-width:0!important;min-height:0!important;width:100%!important;aspect-ratio:1/1!important;
        margin:0!important;padding:0!important;overflow:hidden!important;
        border:1px solid rgba(255,221,130,.48)!important;border-radius:4px!important;
        background:#103b83!important;color:#fff!important;
        font-family:Arial,Helvetica,sans-serif!important;
        font-size:clamp(17px,5vw,34px)!important;font-weight:900!important;
        line-height:1!important;text-align:center!important;
        text-shadow:0 2px 2px rgba(0,0,0,.35)!important;
        transition:background-color .12s ease,box-shadow .12s ease,transform .12s ease!important;
      }
      .pp-game-terminal .pp-game-controls{
        display:flex!important;flex-wrap:wrap!important;gap:9px!important;margin-top:16px!important;
      }
      .pp-game-terminal .pp-game-controls button{
        flex:1 1 140px!important;min-height:43px!important;margin:0!important;padding:10px 12px!important;
        border:1px solid #f0cf72!important;border-radius:5px!important;
        background:linear-gradient(180deg,#f3d77e,#c99a32)!important;
        color:#09245b!important;font-family:Arial,Helvetica,sans-serif!important;
        font-size:12px!important;font-weight:900!important;text-align:center!important;
        text-shadow:0 1px 0 rgba(255,255,255,.35)!important;cursor:pointer!important;
        box-shadow:0 3px 0 #805d1d,0 5px 10px rgba(0,0,0,.2)!important;
      }
      .pp-game-terminal .pp-game-controls button:hover{
        background:linear-gradient(180deg,#ffe9a6,#dfb84e)!important;
      }
      .pp-game-terminal .pp-game-controls button:active{
        transform:translateY(2px)!important;box-shadow:0 1px 0 #805d1d!important;
      }
      .pp-game-terminal #pp-2048-message{
        margin-top:13px!important;padding:12px!important;
        border:1px solid #d5ad4d!important;border-radius:5px!important;
        background:#0b2a68!important;color:#fff1bd!important;
        font-size:13px!important;text-align:center!important;overflow-wrap:anywhere!important;
      }
      .pp-game-terminal #pp-2048-message button{
        display:inline-block!important;margin:10px 0 0!important;padding:8px 14px!important;
        border:1px solid #f0cf72!important;border-radius:4px!important;
        background:#d9ad48!important;color:#09245b!important;font-weight:bold!important;cursor:pointer!important;
      }
      .pp-game-terminal .pp-game-hint{
        margin-top:13px!important;color:#b8cbed!important;font-size:9px!important;
        font-weight:bold!important;letter-spacing:1px!important;line-height:1.7!important;text-align:center!important;
      }
      @media(max-width:480px){
        .pp-game-terminal{padding:13px!important;border-radius:8px!important}
        .pp-game-terminal .pp-game-stat{padding:9px!important}
        .pp-game-terminal .pp-game-stat strong{font-size:23px!important}
      }
    `;
    document.head.appendChild(style);

    var gameHeader = document.querySelector('.pp-game-terminal .pp-game-header');
    if (gameHeader) {
      var headerDescription = gameHeader.querySelector('p');
      if (headerDescription) {
        gameHeader.replaceChildren(headerDescription);
      } else {
        gameHeader.remove();
      }
    }

    var statusBadge = document.querySelector('.pp-game-terminal .pp-game-status');
    if (statusBadge) statusBadge.remove();

    var size = 4;
    var grid = [];
    var score = 0;
    var best = 0;
    var gameOver = false;
    var won = false;
    var victory = false;
    var continueAfterWin = false;
    var touchStartX = 0;
    var touchStartY = 0;

    try {
      best = parseInt(localStorage.getItem('pp2048_best') || '0', 10) || 0;
    } catch (e) {
      best = 0;
    }

    function createGrid() {
      var a = [];
      for (var r = 0; r < size; r++) {
        a[r] = [];
        for (var c = 0; c < size; c++) {
          a[r][c] = 0;
        }
      }
      return a;
    }

    function getEmpty() {
      var a = [];
      for (var r = 0; r < size; r++) {
        for (var c = 0; c < size; c++) {
          if (grid[r][c] === 0) a.push({ r: r, c: c });
        }
      }
      return a;
    }

    function addTile() {
      var cells = getEmpty();
      if (!cells.length) return;

      var p = cells[Math.floor(Math.random() * cells.length)];
      grid[p.r][p.c] = Math.random() < 0.9 ? 2 : 4;
    }

    /*
     * ПАЛИТРА ИГРЫ:
     * 2    — очень светло-красный
     * 4    — светло-красный
     * 8    — розово-красный
     * 16   — насыщенный красный
     * 32   — ярко-красный
     * 64   — красный
     * 128  — тёмно-красный
     * 256  — ещё темнее
     * 512  — глубокий красный
     * 1024 — очень тёмный красный
     * 2048 — самый тёмный красный
     */
    function tileColor(v) {
      var colors = {
        2:    '#d9e9ff',
        4:    '#a9ceff',
        8:    '#78b4ff',
        16:   '#4d94ee',
        32:   '#3278d0',
        64:   '#245eb1',
        128:  '#17468f',
        256:  '#123775',
        512:  '#102d62',
        1024: '#0b2454',
        2048: '#071a42'
      };

      return colors[v] || '#061638';
    }

    function tileTextColor(v) {
      return v === 2 || v === 4 ? '#09245b' : '#FFFFFF';
    }

    function render() {
      board.innerHTML = '';

      if (victory) {
        board.style.setProperty('display', 'flex', 'important');
        board.style.setProperty('grid-template-columns', 'none', 'important');
        board.style.setProperty('grid-template-rows', 'none', 'important');
        board.style.setProperty('align-items', 'center', 'important');
        board.style.setProperty('justify-content', 'center', 'important');
        board.style.setProperty('padding', '12px', 'important');

        var victoryLabel = document.createElement('div');
        victoryLabel.textContent = 'ВЛАДИВОСТОК';
        victoryLabel.style.cssText =
          'display:block;width:100%;max-width:100%;color:#ffe18a;' +
          'font-family:Arial,Helvetica,sans-serif;font-size:clamp(17px,5vw,34px);' +
          'font-weight:900;line-height:1.15;letter-spacing:1px;text-align:center;' +
          'white-space:nowrap;overflow:visible;text-shadow:0 0 8px #fff0b0,0 0 22px rgba(255,205,70,.8);';
        board.appendChild(victoryLabel);

        scoreEl.textContent = String(score);
        bestEl.textContent = String(best);
        if (message) {
          message.style.display = 'none';
          message.textContent = '';
        }
        return;
      }

      board.style.setProperty('display', 'grid', 'important');
      board.style.setProperty('grid-template-columns', 'repeat(4,minmax(0,1fr))', 'important');
      board.style.setProperty('grid-template-rows', 'repeat(4,minmax(0,1fr))', 'important');
      board.style.setProperty('align-items', 'stretch', 'important');
      board.style.setProperty('justify-content', 'stretch', 'important');
      board.style.setProperty('padding', 'clamp(7px,2vw,11px)', 'important');

      for (var r = 0; r < size; r++) {
        for (var c = 0; c < size; c++) {
          var v = grid[r][c];
          var cell = document.createElement('div');

          cell.className = 'pp2048-cell';

          if (v) {
            var color = tileColor(v);

            cell.textContent = String(v);

            /*
             * ВАЖНО:
             * На сайте у фона клетки прописан CSS с !important.
             * Обычного cell.style.backgroundColor недостаточно:
             * внешний стиль может его перекрыть.
             * setProperty с третьим аргументом important
             * гарантирует правильный цвет каждой плитки.
             */
            cell.style.setProperty('background-color', color, 'important');
            cell.style.setProperty('border-color', color, 'important');
            cell.style.setProperty('color', tileTextColor(v), 'important');

            cell.style.setProperty(
              'box-shadow',
              v === 2048
                ? '0 0 16px rgba(255,40,55,.35)'
                : 'inset 0 0 0 1px rgba(255,255,255,.08)',
              'important'
            );

            if (v >= 1024) {
              cell.style.setProperty('font-size', 'clamp(15px,4vw,27px)', 'important');
            }
          }

          board.appendChild(cell);
        }
      }

      scoreEl.textContent = String(score);
      bestEl.textContent = String(best);

      if (!message) return;

      if (gameOver) {
        message.style.display = 'block';

        if (victory) {
          message.style.display = 'none';
          message.textContent = '';
        } else {
          message.textContent = 'Игра окончена — нажми «Новая игра».';
        }
      } else if (won && !continueAfterWin) {
        message.style.display = 'block';
        message.innerHTML =
          '<strong>🎉 Ты достиг 2048!</strong><br>' +
          'Можно продолжить игру.<br>' +
          '<button type="button" id="pp-2048-continue">Продолжить игру</button>';
      } else {
        message.style.display = 'none';
        message.textContent = '';
      }
    }

    function slide(line) {
      var a = line.filter(function (x) {
        return x !== 0;
      });

      var out = [];
      var gain = 0;

      for (var i = 0; i < a.length; i++) {
        if (i < a.length - 1 && a[i] === a[i + 1]) {
          var n = a[i] * 2;
          out.push(n);
          gain += n;
          i++;
        } else {
          out.push(a[i]);
        }
      }

      while (out.length < size) out.push(0);

      return { line: out, score: gain };
    }

    function hasMoves() {
      if (getEmpty().length > 0) return true;

      for (var r = 0; r < size; r++) {
        for (var c = 0; c < size; c++) {
          var v = grid[r][c];

          if (r < size - 1 && grid[r + 1][c] === v) return true;
          if (c < size - 1 && grid[r][c + 1] === v) return true;
        }
      }

      return false;
    }

    function move(direction) {
      if (gameOver || (won && !continueAfterWin)) return;

      var before = JSON.stringify(grid);
      var gain = 0;
      var r, c, line, res;

      if (direction === 'left' || direction === 'right') {
        for (r = 0; r < size; r++) {
          line = grid[r].slice();

          if (direction === 'right') line.reverse();

          res = slide(line);
          gain += res.score;

          if (direction === 'right') res.line.reverse();

          grid[r] = res.line;
        }
      } else {
        for (c = 0; c < size; c++) {
          line = [];

          for (r = 0; r < size; r++) {
            line.push(grid[r][c]);
          }

          if (direction === 'down') line.reverse();

          res = slide(line);
          gain += res.score;

          if (direction === 'down') res.line.reverse();

          for (r = 0; r < size; r++) {
            grid[r][c] = res.line[r];
          }
        }
      }

      if (JSON.stringify(grid) === before) return;

      score = Math.min(score + gain, 2000);

      if (score > best) {
        best = score;

        try {
          localStorage.setItem('pp2048_best', String(best));
        } catch (e) {}
      }

      if (score >= 2000) {
        victory = true;
        gameOver = true;
        render();
        return;
      }

      if (!won) {
        for (r = 0; r < size; r++) {
          if (grid[r].indexOf(2048) !== -1) {
            won = true;
            break;
          }
        }
      }

      addTile();

      if (!hasMoves()) gameOver = true;

      render();
    }

    function newGame() {
      grid = createGrid();
      score = 0;
      gameOver = false;
      won = false;
      victory = false;
      continueAfterWin = false;

      if (message) {
        message.style.display = 'none';
        message.textContent = '';
      }

      addTile();
      addTile();
      render();
    }

    function keyHandler(e) {
      var k = e.key;
      var d = null;

      if (k === 'ArrowLeft' || k === 'a' || k === 'A') d = 'left';
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') d = 'right';
      else if (k === 'ArrowUp' || k === 'w' || k === 'W') d = 'up';
      else if (k === 'ArrowDown' || k === 's' || k === 'S') d = 'down';

      if (d) {
        if (e.preventDefault) e.preventDefault();
        move(d);
      }
    }

    function touchStart(e) {
      if (!e.touches || !e.touches.length) return;

      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }

    function touchEnd(e) {
      if (!e.changedTouches || !e.changedTouches.length) return;

      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;

      if (Math.max(Math.abs(dx), Math.abs(dy)) < 25) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        move(dx > 0 ? 'right' : 'left');
      } else {
        move(dy > 0 ? 'down' : 'up');
      }
    }

    function bindButton(btn) {
      if (!btn) return;

      btn.addEventListener('click', function (e) {
        if (e && e.preventDefault) e.preventDefault();
        newGame();
      });
    }

    bindButton(restart1);
    bindButton(restart2);

    document.addEventListener('keydown', keyHandler, false);

    board.addEventListener('touchstart', touchStart, { passive: true });
    board.addEventListener('touchend', touchEnd, { passive: true });

    if (message) {
      message.addEventListener('click', function (e) {
        var target = e.target || e.srcElement;

        if (target && target.id === 'pp-2048-continue') {
          e.preventDefault();
          continueAfterWin = true;
          render();
        }
      });
    }

    newGame();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, false);
  } else {
    init();
  }
})();
