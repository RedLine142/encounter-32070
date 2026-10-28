(function () {
  'use strict';

  function initArkanoid() {
    const game = document.getElementById('pp-arkanoid-game');
    if (!game || game.dataset.arkanoidHtmlInitialized === '1') return;

    const board = document.getElementById('pa-board');
    const bricksBox = document.getElementById('pa-bricks');
    const ballEl = document.getElementById('pa-ball');
    const paddleEl = document.getElementById('pa-paddle');
    const messageEl = document.getElementById('pa-message');
    const scoreEl = document.getElementById('pa-score');
    const bestEl = document.getElementById('pa-best');
    const livesEl = document.getElementById('pa-lives');
    const startBtn = document.getElementById('pa-start');
    const resetBtn = document.getElementById('pa-reset');

    if (
      !board || !bricksBox || !ballEl || !paddleEl ||
      !messageEl || !scoreEl || !bestEl || !livesEl ||
      !startBtn || !resetBtn
    ) {
      console.error('Arkanoid: проверь HTML-разметку игрового блока.');
      return;
    }

    game.dataset.arkanoidHtmlInitialized = '1';

    const W = 800;
    const H = 520;
    const BALL_R = 7;
    const PADDLE_W = 112;
    const PADDLE_H = 13;
    const PADDLE_Y = 482;
    const BRICK_W = 68;
    const BRICK_H = 18;
    const GAP_X = 8;
    const GAP_Y = 10;
    const LEFT = 24;
    const TOP = 48;
    const COLS = 10;
    const ROWS = 6;

    let bricks = [];
    let score = 0;
    let lives = 3;
    let best = 0;
    let paddleX = (W - PADDLE_W) / 2;
    let ballX = W / 2;
    let ballY = PADDLE_Y - 18;
    let ballVX = 3.2;
    let ballVY = -4.3;
    let running = false;
    let finished = false;
    let lastTime = 0;
    let animationId = 0;
    let pointerActive = false;
    let touchLeft = false;
    let touchRight = false;

    const keys = { left: false, right: false };

    try {
      best = Number(localStorage.getItem('redfox_arkanoid_best') || 0);
    } catch (e) {
      best = 0;
    }

    // Полностью автономное оформление игры.
    const style = document.createElement('style');
    style.textContent = `
      #pp-arkanoid-game {
        box-sizing:border-box;
        width:100%;
        max-width:900px;
        margin:20px auto;
        padding:18px;
        color:#edf5ff;
        background:#080d1b;
        border:2px solid #263e65;
        border-radius:12px;
        font-family:Consolas,"Courier New",monospace;
        box-shadow:0 0 28px rgba(49,232,255,.12);
      }

      #pp-arkanoid-game * { box-sizing:border-box; }

      #pp-arkanoid-game .pa-header {
        text-align:center;
        padding:5px 0 18px;
      }

      #pp-arkanoid-game .pa-brand {
        color:#31e8ff;
        font-size:11px;
        letter-spacing:5px;
        margin-bottom:8px;
      }

      #pp-arkanoid-game .pa-title {
        color:#ffe45e;
        font-size:clamp(30px,6vw,52px);
        font-weight:900;
        letter-spacing:5px;
        line-height:1.1;
        text-shadow:3px 3px #a34822;
      }

      #pp-arkanoid-game .pa-subtitle {
        margin-top:8px;
        color:#91a9d0;
        font-size:11px;
        letter-spacing:3px;
      }

      #pp-arkanoid-game .pa-stats {
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:10px;
        margin-bottom:12px;
      }

      #pp-arkanoid-game .pa-stat {
        min-width:0;
        padding:10px 5px;
        text-align:center;
        background:#101a30;
        border:1px solid #263e65;
        border-radius:6px;
        color:#91a9d0;
        font-size:10px;
        letter-spacing:1px;
      }

      #pp-arkanoid-game .pa-stat strong {
        display:block;
        margin-top:6px;
        color:#31e8ff;
        font-size:23px;
      }

      #pp-arkanoid-game #pa-board {
        position:relative;
        width:100%;
        aspect-ratio:800/520;
        overflow:hidden;
        background:#050914;
        border:2px solid #29476c;
        border-radius:5px;
        line-height:normal;
        user-select:none;
        -webkit-user-select:none;
        touch-action:none;
      }

      #pp-arkanoid-game #pa-bricks {
        position:absolute;
        inset:0;
      }

      #pp-arkanoid-game .pa-brick {
        position:absolute;
        border:1px solid rgba(255,255,255,.45);
        border-radius:3px;
        box-shadow:inset 0 2px rgba(255,255,255,.22),
                   0 2px 4px rgba(0,0,0,.3);
      }

      #pp-arkanoid-game #pa-ball {
        position:absolute;
        width:1.75%;
        height:1.35%;
        min-width:7px;
        min-height:7px;
        border-radius:50%;
        background:#fff7b1;
        box-shadow:0 0 10px #ffe45e,0 0 20px rgba(255,228,94,.55);
        transform:translate(-50%,-50%);
        pointer-events:none;
      }

      #pp-arkanoid-game #pa-paddle {
        position:absolute;
        height:2.5%;
        border-radius:5px;
        background:linear-gradient(180deg,#a3f8ff,#31bde9);
        border:1px solid #c5fbff;
        box-shadow:0 0 12px rgba(49,232,255,.45);
        pointer-events:none;
      }

      #pp-arkanoid-game #pa-message {
        position:absolute;
        inset:0;
        z-index:5;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        padding:18px;
        text-align:center;
        color:#d6e7ff;
        background:rgba(5,9,20,.86);
        font-weight:bold;
        font-size:clamp(14px,2.5vw,23px);
        letter-spacing:2px;
        line-height:1.6;
      }

      #pp-arkanoid-game #pa-message.pa-hidden {
        display:none;
      }

      #pp-arkanoid-game .pa-controls {
        display:flex;
        flex-wrap:wrap;
        justify-content:center;
        gap:10px;
        margin:16px 0 12px;
      }

      #pp-arkanoid-game .pa-controls button {
        flex:1 1 120px;
        max-width:240px;
        padding:13px 12px;
        color:#e8f3ff;
        background:#172642;
        border:1px solid #3b5b88;
        border-radius:5px;
        font:bold 12px Consolas,"Courier New",monospace;
        letter-spacing:1px;
        cursor:pointer;
        touch-action:manipulation;
      }

      #pp-arkanoid-game .pa-controls #pa-start {
        color:#07101c;
        background:#31e8ff;
        border-color:#31e8ff;
      }

      #pp-arkanoid-game .pa-controls button:hover {
        filter:brightness(1.15);
      }

      #pp-arkanoid-game .pa-help {
        padding:12px 4px;
        color:#91a9d0;
        font-size:10px;
        letter-spacing:1px;
        text-align:center;
        line-height:1.7;
      }

      #pp-arkanoid-game .pa-touch-controls {
        display:none;
      }

      /* Полноэкранный режим */
      #pp-arkanoid-game:fullscreen,
      #pp-arkanoid-game:-webkit-full-screen {
        position:fixed;
        inset:0;
        z-index:2147483000;
        width:100%;
        max-width:none;
        height:100%;
        height:100dvh;
        margin:0;
        padding:8px;
        border:0;
        border-radius:0;
        display:flex;
        flex-direction:column;
        overflow:auto;
        background:#080d1b;
      }

      #pp-arkanoid-game:fullscreen .pa-header,
      #pp-arkanoid-game:-webkit-full-screen .pa-header {
        padding:0 0 5px;
      }

      #pp-arkanoid-game:fullscreen .pa-title,
      #pp-arkanoid-game:-webkit-full-screen .pa-title {
        font-size:clamp(22px,4vh,36px);
      }

      #pp-arkanoid-game:fullscreen .pa-brand,
      #pp-arkanoid-game:-webkit-full-screen .pa-brand {
        margin-bottom:3px;
      }

      #pp-arkanoid-game:fullscreen .pa-subtitle,
      #pp-arkanoid-game:-webkit-full-screen .pa-subtitle {
        margin-top:3px;
      }

      #pp-arkanoid-game:fullscreen .pa-stats,
      #pp-arkanoid-game:-webkit-full-screen .pa-stats {
        gap:5px;
        margin-bottom:6px;
      }

      #pp-arkanoid-game:fullscreen .pa-stat,
      #pp-arkanoid-game:-webkit-full-screen .pa-stat {
        padding:4px;
      }

      #pp-arkanoid-game:fullscreen .pa-stat strong,
      #pp-arkanoid-game:-webkit-full-screen .pa-stat strong {
        margin-top:2px;
        font-size:18px;
      }

      #pp-arkanoid-game:fullscreen #pa-board,
      #pp-arkanoid-game:-webkit-full-screen #pa-board {
        flex:none;
        width:min(100%,calc((100dvh - 175px) * 1.53846));
        max-height:calc(100dvh - 175px);
        margin:auto;
        aspect-ratio:800/520;
      }

      #pp-arkanoid-game:fullscreen .pa-controls,
      #pp-arkanoid-game:-webkit-full-screen .pa-controls {
        flex:none;
        margin:6px 0 0;
        gap:6px;
      }

      #pp-arkanoid-game:fullscreen .pa-controls button,
      #pp-arkanoid-game:-webkit-full-screen .pa-controls button {
        padding:10px 5px;
        font-size:11px;
      }

      #pp-arkanoid-game:fullscreen .pa-help,
      #pp-arkanoid-game:-webkit-full-screen .pa-help {
        padding:4px;
      }

      #pp-arkanoid-game .pa-touch-controls button {
        min-height:54px;
        font-size:24px;
        font-weight:bold;
        color:#31e8ff;
        background:#172642;
        border:1px solid #3b5b88;
        border-radius:8px;
        touch-action:none;
        user-select:none;
        -webkit-user-select:none;
      }

      @media(max-width:600px) {
        #pp-arkanoid-game {
          padding:10px;
        }

        #pp-arkanoid-game .pa-stats {
          gap:5px;
        }

        #pp-arkanoid-game .pa-stat {
          font-size:9px;
        }

        #pp-arkanoid-game .pa-stat strong {
          font-size:19px;
        }

        #pp-arkanoid-game:fullscreen .pa-brand,
        #pp-arkanoid-game:-webkit-full-screen .pa-brand,
        #pp-arkanoid-game:fullscreen .pa-subtitle,
        #pp-arkanoid-game:-webkit-full-screen .pa-subtitle,
        #pp-arkanoid-game:fullscreen .pa-help,
        #pp-arkanoid-game:-webkit-full-screen .pa-help {
          display:none;
        }

        #pp-arkanoid-game:fullscreen,
        #pp-arkanoid-game:-webkit-full-screen {
          padding:5px;
        }

        #pp-arkanoid-game:fullscreen #pa-board,
        #pp-arkanoid-game:-webkit-full-screen #pa-board {
          width:min(100%,calc((100dvh - 155px) * 1.53846));
          max-height:calc(100dvh - 155px);
        }

        #pp-arkanoid-game .pa-touch-controls {
          display:flex;
          justify-content:center;
          gap:12px;
          margin-top:8px;
        }

        #pp-arkanoid-game .pa-touch-controls button {
          flex:1;
          max-width:180px;
        }

        #pp-arkanoid-game:fullscreen .pa-touch-controls,
        #pp-arkanoid-game:-webkit-full-screen .pa-touch-controls {
          flex:none;
          margin-top:5px;
        }
      }

      @media(orientation:landscape) and (max-height:500px) {
        #pp-arkanoid-game:fullscreen .pa-header,
        #pp-arkanoid-game:-webkit-full-screen .pa-header {
          display:none;
        }

        #pp-arkanoid-game:fullscreen #pa-board,
        #pp-arkanoid-game:-webkit-full-screen #pa-board {
          width:min(100%,calc((100dvh - 95px) * 1.53846));
          max-height:calc(100dvh - 95px);
        }
      }
    `;

    document.head.appendChild(style);

    // Кнопка полного экрана создаётся автоматически,
    // даже если HTML-редактор удалил её из разметки.
    const controls = game.querySelector('.pa-controls');
    let fullscreenBtn = document.getElementById('pa-fullscreen');

    if (!fullscreenBtn && controls) {
      fullscreenBtn = document.createElement('button');
      fullscreenBtn.type = 'button';
      fullscreenBtn.id = 'pa-fullscreen';
      fullscreenBtn.textContent = '⛶ ВО ВЕСЬ ЭКРАН';
      controls.appendChild(fullscreenBtn);
    }

    // Дополнительные крупные сенсорные кнопки.
    let touchControls = game.querySelector('.pa-touch-controls');

    if (!touchControls) {
      touchControls = document.createElement('div');
      touchControls.className = 'pa-touch-controls';

      const leftBtn = document.createElement('button');
      leftBtn.type = 'button';
      leftBtn.textContent = '◀';
      leftBtn.setAttribute('aria-label', 'Двигать платформу влево');

      const rightBtn = document.createElement('button');
      rightBtn.type = 'button';
      rightBtn.textContent = '▶';
      rightBtn.setAttribute('aria-label', 'Двигать платформу вправо');

      touchControls.appendChild(leftBtn);
      touchControls.appendChild(rightBtn);

      if (controls && controls.parentNode) {
        controls.parentNode.insertBefore(touchControls, controls.nextSibling);
      } else {
        game.appendChild(touchControls);
      }

      function bindHold(button, direction) {
        const down = function (event) {
          event.preventDefault();
          if (direction === 'left') touchLeft = true;
          else touchRight = true;

          try {
            if (button.setPointerCapture && event.pointerId !== undefined) {
              button.setPointerCapture(event.pointerId);
            }
          } catch (e) {}
        };

        const up = function () {
          if (direction === 'left') touchLeft = false;
          else touchRight = false;
        };

        button.addEventListener('pointerdown', down);
        button.addEventListener('pointerup', up);
        button.addEventListener('pointercancel', up);
        button.addEventListener('lostpointercapture', up);
        button.addEventListener('contextmenu', e => e.preventDefault());
      }

      bindHold(leftBtn, 'left');
      bindHold(rightBtn, 'right');
    }

    function setMessage(title, subtitle) {
      messageEl.replaceChildren();

      const heading = document.createElement('div');
      heading.textContent = title;
      heading.style.color = '#ffe45e';
      heading.style.fontSize = 'clamp(22px,5vw,38px)';
      heading.style.fontWeight = '900';
      heading.style.letterSpacing = '3px';
      messageEl.appendChild(heading);

      if (subtitle) {
        const text = document.createElement('div');
        text.textContent = subtitle;
        text.style.marginTop = '12px';
        text.style.fontSize = 'clamp(11px,2vw,15px)';
        text.style.fontWeight = 'normal';
        messageEl.appendChild(text);
      }

      messageEl.classList.remove('pa-hidden');
    }

    function hideMessage() {
      messageEl.classList.add('pa-hidden');
    }

    function positionElement(el, x, y, width, height) {
      el.style.left = (x / W * 100) + '%';
      el.style.top = (y / H * 100) + '%';

      if (width !== undefined) {
        el.style.width = (width / W * 100) + '%';
      }

      if (height !== undefined) {
        el.style.height = (height / H * 100) + '%';
      }
    }

    function createBricks() {
      bricks = [];
      bricksBox.replaceChildren();

      const colors = [
        '#ff4f91',
        '#ff824f',
        '#ffe45e',
        '#5dff9b',
        '#31e8ff',
        '#9d83ff'
      ];

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const brick = {
            x: LEFT + col * (BRICK_W + GAP_X),
            y: TOP + row * (BRICK_H + GAP_Y),
            w: BRICK_W,
            h: BRICK_H,
            alive: true,
            el: document.createElement('div')
          };

          brick.el.className = 'pa-brick';
          brick.el.style.background = colors[row];
          positionElement(
            brick.el,
            brick.x,
            brick.y,
            brick.w,
            brick.h
          );

          bricksBox.appendChild(brick.el);
          bricks.push(brick);
        }
      }
    }

    function updateStats() {
      scoreEl.textContent = String(score);
      bestEl.textContent = String(best);
      livesEl.textContent = String(lives);
    }

    function saveBest() {
      if (score > best) {
        best = score;

        try {
          localStorage.setItem('redfox_arkanoid_best', String(best));
        } catch (e) {}
      }

      updateStats();
    }

    function drawObjects() {
      positionElement(
        paddleEl,
        paddleX,
        PADDLE_Y,
        PADDLE_W,
        PADDLE_H
      );

      positionElement(
        ballEl,
        ballX - BALL_R,
        ballY - BALL_R,
        BALL_R * 2,
        BALL_R * 2
      );
    }

    function resetBall() {
      paddleX = (W - PADDLE_W) / 2;
      ballX = W / 2;
      ballY = PADDLE_Y - 18;
      ballVX = (Math.random() < 0.5 ? -1 : 1) * 3.2;
      ballVY = -4.3;
      drawObjects();
    }

    function stopLoop() {
      running = false;

      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = 0;
      }
    }

    function resetGame() {
      stopLoop();

      finished = false;
      score = 0;
      lives = 3;
      keys.left = false;
      keys.right = false;
      touchLeft = false;
      touchRight = false;

      createBricks();
      resetBall();
      updateStats();

      startBtn.textContent = 'СТАРТ';
      setMessage('АРКАНОИД', 'Нажми «СТАРТ», чтобы начать');
    }

    function startGame() {
      if (running) return;

      if (finished) {
        resetGame();
      }

      running = true;
      lastTime = 0;
      hideMessage();
      startBtn.textContent = 'ИГРА ИДЁТ';
      animationId = requestAnimationFrame(tick);
    }

    function endGame(won) {
      stopLoop();
      finished = true;
      saveBest();
      startBtn.textContent = 'ИГРАТЬ СНОВА';

      if (won) {
        setMessage('ПОБЕДА!', 'Все кирпичи разбиты! Счёт: ' + score);
      } else {
        setMessage('ИГРА ОКОНЧЕНА', 'Счёт: ' + score + '. Нажми «ЗАНОВО»');
      }
    }

    function loseLife() {
      lives--;
      updateStats();

      if (lives <= 0) {
        endGame(false);
        return;
      }

      resetBall();
      stopLoop();
      startBtn.textContent = 'ПРОДОЛЖИТЬ';

      setMessage(
        'МИНУС ЖИЗНЬ',
        'Осталось жизней: ' + lives + '. Нажми «СТАРТ»'
      );
    }

    function hitBrick(brick, oldX, oldY) {
      const closestX = Math.max(
        brick.x,
        Math.min(ballX, brick.x + brick.w)
      );

      const closestY = Math.max(
        brick.y,
        Math.min(ballY, brick.y + brick.h)
      );

      const dx = ballX - closestX;
      const dy = ballY - closestY;

      if (dx * dx + dy * dy > BALL_R * BALL_R) return false;

      brick.alive = false;
      brick.el.remove();

      const wasAbove = oldY + BALL_R <= brick.y;
      const wasBelow = oldY - BALL_R >= brick.y + brick.h;
      const wasLeft = oldX + BALL_R <= brick.x;
      const wasRight = oldX - BALL_R >= brick.x + brick.w;

      if (wasAbove || wasBelow) {
        ballVY *= -1;
      } else if (wasLeft || wasRight) {
        ballVX *= -1;
      } else {
        ballVY *= -1;
      }

      score += 10;
      saveBest();

      if (bricks.every(item => !item.alive)) {
        endGame(true);
      }

      return true;
    }

    function tick(timestamp) {
      if (!running) return;

      const dt = lastTime
        ? Math.min((timestamp - lastTime) / 16.667, 2)
        : 1;

      lastTime = timestamp;

      if (keys.left || touchLeft) paddleX -= 7 * dt;
      if (keys.right || touchRight) paddleX += 7 * dt;

      paddleX = Math.max(0, Math.min(W - PADDLE_W, paddleX));

      const oldX = ballX;
      const oldY = ballY;

      ballX += ballVX * dt;
      ballY += ballVY * dt;

      if (ballX - BALL_R <= 0) {
        ballX = BALL_R;
        ballVX = Math.abs(ballVX);
      } else if (ballX + BALL_R >= W) {
        ballX = W - BALL_R;
        ballVX = -Math.abs(ballVX);
      }

      if (ballY - BALL_R <= 0) {
        ballY = BALL_R;
        ballVY = Math.abs(ballVY);
      }

      // Столкновение с платформой.
      if (
        ballVY > 0 &&
        ballY + BALL_R >= PADDLE_Y &&
        ballY - BALL_R <= PADDLE_Y + PADDLE_H &&
        ballX + BALL_R >= paddleX &&
        ballX - BALL_R <= paddleX + PADDLE_W
      ) {
        ballY = PADDLE_Y - BALL_R;

        const offset =
          (ballX - (paddleX + PADDLE_W / 2)) / (PADDLE_W / 2);

        ballVX = offset * 5.2;

        if (Math.abs(ballVX) < 1.3) {
          ballVX = ballVX < 0 ? -1.3 : 1.3;
        }

        ballVY = -Math.max(
          3.5,
          Math.sqrt(34 - Math.min(25, ballVX * ballVX))
        );
      }

      for (const brick of bricks) {
        if (brick.alive && hitBrick(brick, oldX, oldY)) break;
      }

      if (finished || !running) return;

      if (ballY - BALL_R > H) {
        loseLife();

        if (running) {
          animationId = requestAnimationFrame(tick);
        }

        return;
      }

      drawObjects();
      animationId = requestAnimationFrame(tick);
    }

    function movePaddleFromPointer(event) {
      const rect = board.getBoundingClientRect();
      if (!rect.width) return;

      const scaleX = W / rect.width;
      const x = (event.clientX - rect.left) * scaleX;

      paddleX = Math.max(
        0,
        Math.min(W - PADDLE_W, x - PADDLE_W / 2)
      );

      drawObjects();
    }

    board.addEventListener('pointerdown', function (event) {
      pointerActive = true;
      movePaddleFromPointer(event);

      try {
        if (board.setPointerCapture && event.pointerId !== undefined) {
          board.setPointerCapture(event.pointerId);
        }
      } catch (e) {}
    });

    board.addEventListener('pointermove', function (event) {
      if (pointerActive || event.pointerType === 'mouse') {
        movePaddleFromPointer(event);
      }
    });

    board.addEventListener('pointerup', function () {
      pointerActive = false;
    });

    board.addEventListener('pointercancel', function () {
      pointerActive = false;
    });

    document.addEventListener('keydown', function (event) {
      const key = event.key.toLowerCase();

      if (key === 'arrowleft' || key === 'a') {
        keys.left = true;
        if (key === 'arrowleft') event.preventDefault();
      }

      if (key === 'arrowright' || key === 'd') {
        keys.right = true;
        if (key === 'arrowright') event.preventDefault();
      }

      if (
        (key === ' ' || key === 'enter') &&
        !running &&
        !event.repeat
      ) {
        const active = document.activeElement;

        if (
          active !== startBtn &&
          active !== resetBtn &&
          active !== fullscreenBtn
        ) {
          event.preventDefault();
          startGame();
        }
      }
    });

    document.addEventListener('keyup', function (event) {
      const key = event.key.toLowerCase();

      if (key === 'arrowleft' || key === 'a') keys.left = false;
      if (key === 'arrowright' || key === 'd') keys.right = false;
    });

    window.addEventListener('blur', function () {
      keys.left = false;
      keys.right = false;
      touchLeft = false;
      touchRight = false;
      pointerActive = false;
    });

    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);

    // Полноэкранный режим.
    function isFullscreen() {
      return !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
    }

    function updateFullscreenButton() {
      if (!fullscreenBtn) return;

      fullscreenBtn.textContent = isFullscreen()
        ? '✕ ВЫЙТИ ИЗ ПОЛНОГО ЭКРАНА'
        : '⛶ ВО ВЕСЬ ЭКРАН';
    }

    async function toggleFullscreen() {
      if (!fullscreenBtn) return;

      try {
        if (isFullscreen()) {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }

          updateFullscreenButton();
          return;
        }

        if (game.requestFullscreen) {
          await game.requestFullscreen();
        } else if (game.webkitRequestFullscreen) {
          game.webkitRequestFullscreen();
        } else if (game.webkitRequestFullScreen) {
          game.webkitRequestFullScreen();
        } else if (game.msRequestFullscreen) {
          game.msRequestFullscreen();
        } else {
          setMessage(
            'ПОЛНЫЙ ЭКРАН НЕДОСТУПЕН',
            'Этот браузер не поддерживает полноэкранный режим для игры.'
          );
          return;
        }

        updateFullscreenButton();
      } catch (error) {
        console.warn('Arkanoid fullscreen:', error);

        setMessage(
          'НЕ УДАЛОСЬ ОТКРЫТЬ ЭКРАН',
          'Попробуй открыть игру в обычном браузере, а не во встроенном окне.'
        );
      }
    }

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', toggleFullscreen);

      document.addEventListener('fullscreenchange', updateFullscreenButton);
      document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
      document.addEventListener('mozfullscreenchange', updateFullscreenButton);
      document.addEventListener('MSFullscreenChange', updateFullscreenButton);
    }

    // Первоначальная расстановка.
    createBricks();
    resetBall();
    updateStats();
    updateFullscreenButton();
    setMessage('АРКАНОИД', 'Нажми «СТАРТ», чтобы начать');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArkanoid);
  } else {
    initArkanoid();
  }
})();
