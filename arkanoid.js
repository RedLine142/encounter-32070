
(function () {
  'use strict';

  function initArkanoid() {
    const canvas = document.getElementById('pp-arkanoid-canvas');
    const startBtn = document.getElementById('pp-arkanoid-start');
    const restartBtn = document.getElementById('pp-arkanoid-restart');
    const scoreEl = document.getElementById('pp-arkanoid-score');
    const bestEl = document.getElementById('pp-arkanoid-best');
    const livesEl = document.getElementById('pp-arkanoid-lives');
    const messageEl = document.getElementById('pp-arkanoid-message');

    if (!canvas || !startBtn || !restartBtn || !scoreEl ||
        !bestEl || !livesEl || !messageEl) return;

    if (canvas.dataset.arkanoidInitialized === '1') return;
    canvas.dataset.arkanoidInitialized = '1';

    const ctx = canvas.getContext('2d');
    const W = 800;
    const H = 520;

    canvas.width = W;
    canvas.height = H;
    canvas.tabIndex = 0;
    canvas.setAttribute('aria-label', 'Игра Арканоид. Используйте стрелки влево и вправо.');

    const COLORS = {
      background: '#090B16',
      frame: '#343D67',
      white: '#F5F7FF',
      cyan: '#69F4FF',
      red: '#FF526A',
      orange: '#FFAA45',
      yellow: '#FFE66D',
      green: '#65F59B',
      blue: '#59A9FF',
      purple: '#C28BFF'
    };

    const brickColors = [
      '#FF526A',
      '#FF8A52',
      '#FFE66D',
      '#65F59B',
      '#59A9FF',
      '#C28BFF'
    ];

    const BEST_KEY = 'pp_arkanoid_best_v1';

    let best = 0;
    try {
      best = Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch (_) {}

    let score = 0;
    let lives = 3;
    let bricks = [];
    let running = false;
    let finished = false;
    let won = false;
    let animationId = 0;
    let lastTime = 0;
    let keys = { left: false, right: false };

    const paddle = {
      x: W / 2 - 58,
      y: H - 43,
      w: 116,
      h: 13,
      speed: 440
    };

    const ball = {
      x: W / 2,
      y: H - 65,
      r: 7,
      vx: 210,
      vy: -280,
      speed: 350
    };

    function setMessage(title, subtitle) {
      messageEl.innerHTML = '';
      const heading = document.createElement('div');
      heading.className = 'pp-arkanoid-message-title';
      heading.textContent = title;
      const detail = document.createElement('div');
      detail.className = 'pp-arkanoid-message-subtitle';
      detail.textContent = subtitle || '';
      messageEl.appendChild(heading);
      messageEl.appendChild(detail);
      messageEl.hidden = false;
    }

    function hideMessage() {
      messageEl.hidden = true;
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
          localStorage.setItem(BEST_KEY, String(best));
        } catch (_) {}
      }
      updateStats();
    }

    function resetBall() {
      paddle.x = W / 2 - paddle.w / 2;
      ball.x = W / 2;
      ball.y = paddle.y - ball.r - 2;
      ball.speed = 350;

      // Шар всегда стартует вверх, но немного в сторону.
      const direction = Math.random() < 0.5 ? -1 : 1;
      ball.vx = direction * 135;
      ball.vy = -Math.sqrt(ball.speed * ball.speed - ball.vx * ball.vx);
    }

    function createBricks() {
      bricks = [];

      const columns = 10;
      const rows = 6;
      const brickW = 66;
      const brickH = 21;
      const gap = 8;
      const totalW = columns * brickW + (columns - 1) * gap;
      const startX = (W - totalW) / 2;
      const startY = 76;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          bricks.push({
            x: startX + col * (brickW + gap),
            y: startY + row * (brickH + gap),
            w: brickW,
            h: brickH,
            color: brickColors[row],
            alive: true
          });
        }
      }
    }

    function resetGame() {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = 0;
      }

      score = 0;
      lives = 3;
      running = false;
      finished = false;
      won = false;
      lastTime = 0;
      keys.left = false;
      keys.right = false;

      createBricks();
      resetBall();
      updateStats();
      startBtn.textContent = 'СТАРТ';
      setMessage('АРКАНОИД', 'Нажми «СТАРТ», чтобы начать');
      draw();
    }

    function startGame() {
      if (finished) return;

      if (!running) {
        running = true;
        hideMessage();
        startBtn.textContent = 'ИГРА ИДЁТ';
        canvas.focus({ preventScroll: true });
        lastTime = 0;

        if (!animationId) {
          animationId = requestAnimationFrame(loop);
        }
      }
    }

    function endGame(isWin) {
      running = false;
      finished = true;
      won = isWin;
      saveBest();

      startBtn.textContent = isWin ? 'ПОБЕДА!' : 'ИГРА ОКОНЧЕНА';

      if (isWin) {
        setMessage('ПОБЕДА!', 'Все кирпичи разбиты! Счёт: ' + score);
      } else {
        setMessage('ИГРА ОКОНЧЕНА', 'Счёт: ' + score + ' — нажми «ЗАНОВО»');
      }
    }

    function loseLife() {
      lives--;
      updateStats();

      if (lives <= 0) {
        endGame(false);
        return;
      }

      running = false;
      resetBall();
      startBtn.textContent = 'ПРОДОЛЖИТЬ';
      setMessage('МИНУС ЖИЗНЬ', 'Осталось жизней: ' + lives + '. Нажми «ПРОДОЛЖИТЬ»');
    }

    function movePaddle(dt) {
      if (keys.left) paddle.x -= paddle.speed * dt;
      if (keys.right) paddle.x += paddle.speed * dt;
      paddle.x = Math.max(12, Math.min(W - paddle.w - 12, paddle.x));
    }

    function circleRectCollision(cx, cy, radius, rect) {
      const nearestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
      const nearestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
      const dx = cx - nearestX;
      const dy = cy - nearestY;
      return dx * dx + dy * dy <= radius * radius;
    }

    function updateBall(dt) {
      const oldX = ball.x;
      const oldY = ball.y;

      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      // Левая и правая стены.
      if (ball.x - ball.r < 12) {
        ball.x = 12 + ball.r;
        ball.vx = Math.abs(ball.vx);
      } else if (ball.x + ball.r > W - 12) {
        ball.x = W - 12 - ball.r;
        ball.vx = -Math.abs(ball.vx);
      }

      // Верхняя стена.
      if (ball.y - ball.r < 12) {
        ball.y = 12 + ball.r;
        ball.vy = Math.abs(ball.vy);
      }

      // Платформа: шар должен лететь вниз.
      if (
        ball.vy > 0 &&
        oldY + ball.r <= paddle.y + 3 &&
        ball.y + ball.r >= paddle.y &&
        ball.x + ball.r >= paddle.x &&
        ball.x - ball.r <= paddle.x + paddle.w
      ) {
        ball.y = paddle.y - ball.r;

        const hit = (ball.x - (paddle.x + paddle.w / 2)) /
          (paddle.w / 2);

        // Чем ближе к краю платформы, тем сильнее боковой отскок.
        const angle = hit * (Math.PI / 3);
        ball.speed = Math.min(ball.speed + 3, 470);
        ball.vx = Math.sin(angle) * ball.speed;
        ball.vy = -Math.cos(angle) * ball.speed;
      }

      // Столкновение с кирпичами.
      for (const brick of bricks) {
        if (!brick.alive) continue;

        if (circleRectCollision(ball.x, ball.y, ball.r, brick)) {
          brick.alive = false;
          score += 10;
          saveBest();

          // Определяем, с какой стороны шар пришёл к кирпичу.
          const cameFromTop = oldY + ball.r <= brick.y;
          const cameFromBottom = oldY - ball.r >= brick.y + brick.h;
          const cameFromLeft = oldX + ball.r <= brick.x;
          const cameFromRight = oldX - ball.r >= brick.x + brick.w;

          if (cameFromTop || cameFromBottom) {
            ball.vy *= -1;
          } else if (cameFromLeft || cameFromRight) {
            ball.vx *= -1;
          } else {
            ball.vy *= -1;
          }

          if (bricks.every(item => !item.alive)) {
            endGame(true);
          }
          break;
        }
      }

      // Шар упал ниже экрана.
      if (ball.y - ball.r > H) {
        loseLife();
      }
    }

    function update(dt) {
      movePaddle(dt);

      if (!running) {
        ball.x = paddle.x + paddle.w / 2;
        ball.y = paddle.y - ball.r - 2;
        return;
      }

      updateBall(dt);
    }

    function drawBrick(brick) {
      if (!brick.alive) return;

      ctx.fillStyle = brick.color;
      ctx.fillRect(brick.x, brick.y, brick.w, brick.h);

      // Пиксельные блики в стиле 8-bit.
      ctx.fillStyle = 'rgba(255,255,255,0.38)';
      ctx.fillRect(brick.x + 3, brick.y + 3, brick.w - 6, 3);
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(brick.x + 3, brick.y + brick.h - 4, brick.w - 6, 2);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = COLORS.background;
      ctx.fillRect(0, 0, W, H);

      // Внешняя рамка игрового поля.
      ctx.strokeStyle = COLORS.frame;
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 10, W - 20, H - 20);

      // Тонкая пиксельная линия под кирпичами.
      ctx.fillStyle = '#242A49';
      ctx.fillRect(20, 52, W - 40, 2);

      for (const brick of bricks) drawBrick(brick);

      // Платформа.
      ctx.fillStyle = COLORS.cyan;
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(paddle.x + 5, paddle.y + 2, paddle.w - 10, 3);
      ctx.fillStyle = '#268CA9';
      ctx.fillRect(paddle.x + 5, paddle.y + paddle.h - 3, paddle.w - 10, 2);

      // Шар.
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ball.x - ball.r, ball.y - ball.r, ball.r * 2, ball.r * 2);
      ctx.fillStyle = '#B9FFFF';
      ctx.fillRect(ball.x - 3, ball.y - 3, 4, 4);
    }

    function loop(time) {
      animationId = 0;

      if (!lastTime) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.025);
      lastTime = time;

      update(dt);
      draw();

      if (running) {
        animationId = requestAnimationFrame(loop);
      }
    }

    function setPaddleFromPointer(event) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const x = (event.clientX - rect.left) * scaleX;

      paddle.x = Math.max(
        12,
        Math.min(W - paddle.w - 12, x - paddle.w / 2)
      );

      if (!running) {
        ball.x = paddle.x + paddle.w / 2;
        ball.y = paddle.y - ball.r - 2;
        draw();
      }
    }

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', resetGame);

    canvas.addEventListener('pointermove', function (event) {
      // Мышь или палец позволяют перемещать платформу по горизонтали.
      if (event.pointerType === 'mouse' || event.pointerType === 'touch') {
        setPaddleFromPointer(event);
      }
    });

    canvas.addEventListener('pointerdown', function (event) {
      setPaddleFromPointer(event);
      canvas.focus({ preventScroll: true });
    });

    document.addEventListener('keydown', function (event) {
      const key = event.key.toLowerCase();

      if (['arrowleft', 'arrowright', 'a', 'd', ' '].includes(key)) {
        if (document.activeElement === canvas ||
            canvas.contains(document.activeElement)) {
          event.preventDefault();
        }
      }

      if (key === 'arrowleft' || key === 'a') keys.left = true;
      if (key === 'arrowright' || key === 'd') keys.right = true;

      if ((key === ' ' || key === 'enter') &&
          document.activeElement === canvas && !running && !finished) {
        event.preventDefault();
        startGame();
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
    });

    resetGame();
    updateStats();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArkanoid, { once: true });
  } else {
    initArkanoid();
  }
})();
