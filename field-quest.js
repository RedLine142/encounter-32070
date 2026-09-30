(() => {
'use strict';

const ROOT_ID = 'field-quest';
const VERSION = '1.0.0';

const QUEST = {
  title: 'СИГНАЛ ОБЪЕКТА 17',
  subtitle: 'ПОЛЕВАЯ ОПЕРАЦИЯ // ПРОТОКОЛ «СЕВЕР»',
  intro: 'Первое самостоятельное задание полевика. Объект №17 официально закрыт семь лет назад. Три дня назад с него начал передаваться короткий радиосигнал.',
  scenes: {}
};

const S = (id, text, choices, meta={}) => { QUEST.scenes[id] = {id,text,choices,meta}; };

const choice = (label, next, opts={}) => ({label,next,...opts});

S('briefing',
`18:37.<br><br>Последний населённый пункт остался позади почти час назад. Дорога закончилась десять минут назад.<br><br>В рации появляется короткая последовательность:<br><br><span class="fq-signal">... — ... — ..</span><br><br>Через тридцать секунд она повторяется. Затем снова.<br><br><strong>Кто-то или что-то передаёт сигнал.</strong>`,
[
 choice('ЗАПИСАТЬ СИГНАЛ', 'signal_record', {effect:{clue:1,signal:1,time:2}}),
 choice('ОТВЕТИТЬ НА ЧАСТОТЕ', 'signal_answer', {effect:{radio:1,alarm:1,time:1}}),
 choice('ИГНОРИРОВАТЬ И ПРОДОЛЖИТЬ ПУТЬ', 'road_tracks', {effect:{time:4}})
]);

S('signal_record',
`Ты включаешь запись.<br><br>Сигнал состоит не из случайного шума. Между импульсами есть одинаковые паузы.<br><br>Ты помечаешь запись как <strong>«Улика 01»</strong>.<br><br>Если это сообщение, то оно рассчитано на того, кто умеет его прочитать.`,
[
 choice('РАСШИФРОВАТЬ НА МЕСТЕ', 'morse_intro', {effect:{knowledge:1,time:5}}),
 choice('СОХРАНИТЬ И ЕХАТЬ К ОБЪЕКТУ', 'arrival', {effect:{clue:1,time:2}})
]);

S('signal_answer',
`— ...приём...<br><br>Треск.<br><br>— Если ты меня слышишь...<br><br>Пауза.<br><br>— <strong>не заходи через главные ворота.</strong><br><br>Связь обрывается.<br><br>Ты проверяешь журнал рации. Передача пришла с территории объекта.`,
[
 choice('ПОПРОБОВАТЬ ОТВЕТИТЬ ЕЩЁ РАЗ', 'signal_answer2', {effect:{time:2,alarm:1}}),
 choice('ЗАПИСАТЬ ПРЕДУПРЕЖДЕНИЕ И ПРОДОЛЖИТЬ', 'arrival', {effect:{clue:1,time:2}})
]);

S('signal_answer2',
`В ответ приходит только один звук: <span class="fq-signal">—</span>.<br><br>Затем автоматический голос:<br><br><em>«Внешний оператор обнаружен.»</em><br><br>Ты не помнишь, чтобы представлялся системе.`,
[
 choice('ПРОДОЛЖИТЬ К ОБЪЕКТУ', 'arrival', {effect:{alarm:1,time:2}}),
 choice('ПРОВЕРИТЬ СВОЙ ПОЗЫВНОЙ В РАЦИИ', 'radio_check', {effect:{knowledge:1,time:3}})
]);

S('radio_check',
`В памяти рации сохранён твой служебный позывной. Ничего необычного.<br><br>Но ниже есть ещё одна запись. Дата создания файла — <strong>семь лет назад</strong>.<br><br>Файл называется: <strong>OPERATOR_17</strong>.`,
[
 choice('НЕ ОТКРЫВАТЬ ФАЙЛ', 'arrival', {effect:{time:1}}),
 choice('ОТКРЫТЬ ФАЙЛ', 'file_17', {effect:{knowledge:2,clue:1,time:4}})
]);

S('file_17',
`Внутри только одна строка:<br><br><span class="fq-terminal">ЕСЛИ ОПЕРАТОР ВЕРНУЛСЯ — НЕ ДОВЕРЯЙ ПЕРВОМУ ГОЛОСУ.</span><br><br>Файл закрывается сам.`,
[
 choice('ЗАКРЫТЬ РАЦИЮ И ЕХАТЬ', 'arrival', {effect:{time:1}}),
 choice('ЗАПИСАТЬ ФРАЗУ В ЖУРНАЛ', 'arrival', {effect:{clue:2,time:2}})
]);

S('road_tracks',
`Ты убираешь рацию.<br><br>Через несколько минут замечаешь свежие следы шин. Они уходят к старой технической дороге, которой нет на твоей карте.<br><br>Следы появились недавно.`,
[
 choice('ПОЕХАТЬ ПО СЛЕДАМ', 'service_road', {effect:{clue:1,time:8}}),
 choice('НЕ ОТКЛОНЯТЬСЯ ОТ МАРШРУТА', 'arrival', {effect:{time:3}})
]);

S('service_road',
`Техническая дорога приводит к бетонной стене. За ней видна старая вышка.<br><br>На стене свежей краской нанесён символ: <strong>17</strong>.<br><br>Под символом — маленькая металлическая коробка.`,
[
 choice('ОТКРЫТЬ КОРОБКУ', 'box', {effect:{clue:1,time:3}}),
 choice('НЕ ТРОГАТЬ И ИДТИ К ВЫШКЕ', 'tower', {effect:{time:5}})
]);

S('box',
`В коробке лежит тонкая карта памяти и бумажная полоска с точками и тире.<br><br><span class="fq-mono">-- --- .-. ... . / .-.. --- --- -.-</span><br><br>Под ней карандашом написано: <strong>«Не доверяй первому переводу.»</strong>`,
[
 choice('РАЗОБРАТЬ КОД', 'morse_puzzle', {effect:{item:'memory',knowledge:1,time:5}}),
 choice('ЗАБРАТЬ ВСЁ И ИДТИ ДАЛЬШЕ', 'tower', {effect:{item:'memory',time:2}})
]);

S('morse_intro',
`Ты раскладываешь сигнал по группам.<br><br>Точки и тире напоминают азбуку Морзе. На панели появляются подсказки.<br><br><strong>ЗАДАЧА:</strong> расшифруй последовательность <span class="fq-mono">... --- ...</span>.`,
[
 choice('SOS', 'arrival', {effect:{knowledge:2,clue:1,time:3}}),
 choice('17', 'arrival', {effect:{alarm:1,time:2}}),
 choice('NO SIGNAL', 'arrival', {effect:{time:2}})
], {inputPuzzle:{type:'morse',answer:'SOS',prompt:'Введите расшифровку: ... --- ...'}});

S('morse_puzzle',
`Это не обычная записка. Последовательность на полоске читается как: <span class="fq-mono">-- --- .-. ... . / .-.. --- --- -.-</span>.<br><br>Подсказка на обороте: <strong>«Слово, которым называют способ передачи, — тоже часть сообщения.»</strong>`,
[
 choice('MORSE LOOK', 'tower', {effect:{knowledge:2,clue:1,time:3}}),
 choice('SOS LOOK', 'tower', {effect:{alarm:1,time:2}}),
 choice('LOOK MORSE', 'tower', {effect:{knowledge:1,time:2}})
], {inputPuzzle:{type:'morse',answer:'MORSE LOOK',prompt:'Расшифруй строку Морзе.'}});

S('arrival',
`19:12.<br><br>Ты видишь объект №17.<br><br>Заброшенные корпуса, старая вышка, бетонные стены и закрытые ворота. Электричества официально нет.<br><br>Но над главным корпусом мигает один зелёный индикатор.`,
[
 choice('ВОЙТИ ЧЕРЕЗ ГЛАВНЫЕ ВОРОТА', 'gate', {effect:{alarm:1,time:4}}),
 choice('ОБЫСКАТЬ ПЕРИМЕТР', 'perimeter', {effect:{clue:1,time:10}}),
 choice('ПОДНЯТЬСЯ НА ВЫШКУ', 'tower', {effect:{time:8}})
]);

S('tower',
`С вышки открывается вид на объект.<br><br>Ты замечаешь три вещи: подземный вход на северной стороне, антенну на крыше лаборатории и маленькое помещение у генераторной.<br><br>На старой табличке различимы слова: <strong>«Аварийный протокол / визуальная кодировка»</strong>.`,
[
 choice('ИССЛЕДОВАТЬ СЕВЕРНЫЙ ВХОД', 'north_door', {effect:{knowledge:1,time:6}}),
 choice('ИДТИ К ГЕНЕРАТОРНОЙ', 'generator', {effect:{time:6}}),
 choice('ПРОВЕРИТЬ АНТЕННУ', 'antenna', {effect:{clue:1,time:7}})
]);

S('perimeter',
`За бетонной плитой ты находишь следы недавнего пребывания человека: окурок, свежую царапину на замке и кусок синей изоленты.<br><br>Окурок ещё не успел намокнуть.<br><br>Кто-то был здесь сегодня.`,
[
 choice('ВЗЯТЬ ИЗОЛЕНТУ', 'gate', {effect:{item:'tape',time:2}}),
 choice('ПРОСЛЕДИТЬ СЛЕДЫ', 'generator', {effect:{clue:1,time:7}}),
 choice('ИДТИ К СЕВЕРНОМУ ВХОДУ', 'north_door', {effect:{time:4}})
]);

S('gate',
`Главные ворота открываются после второго нажатия.<br><br>Внутри темно. Через несколько секунд включается аварийная подсветка.<br><br>На стене появляется сообщение:<br><br><span class="fq-terminal">ДОБРО ПОЖАЛОВАТЬ, ОПЕРАТОР.</span><br><br>Ты точно никому не сообщал свой позывной.`,
[
 choice('ПРОЙТИ В КОРПУС', 'hall', {effect:{alarm:1,time:4}}),
 choice('ОТВЕТИТЬ СИСТЕМЕ', 'terminal_intro', {effect:{knowledge:1,time:3}}),
 choice('ОТСТУПИТЬ И ИСКАТЬ ДРУГОЙ ВХОД', 'north_door', {effect:{time:5}})
]);

S('generator',
`Генераторная работает на резервном аккумуляторе.<br><br>У панели лежит человек в рабочем комбинезоне.<br><br>Он жив.<br><br>— Не подходи резко, — говорит он. — Если ты полевик, покажи пропуск.`,
[
 choice('ПОКАЗАТЬ ПРОПУСК', 'klim', {effect:{time:3}}),
 choice('СПРОСИТЬ, КТО ОН', 'klim', {effect:{time:3,trust:1}}),
 choice('СКРЫТЬ ПРОПУСК', 'klim_suspicious', {effect:{alarm:1,time:2}})
]);

S('klim',
`— Клим, техник. Я здесь застрял.<br><br>Он смотрит на твою рацию.<br><br>— Если ты пришёл из службы, у тебя проблема. Этот объект не должен был проснуться.<br><br>— И ещё. Не разговаривай с голосом в терминале.`,
[
 choice('СПРОСИТЬ ПРО ГОЛОС', 'klim_voice', {effect:{trust:1,time:4}}),
 choice('СПРОСИТЬ ПРО ПОДЗЕМНЫЙ ВХОД', 'klim_tunnel', {effect:{trust:1,time:3}}),
 choice('СПРОСИТЬ, ПОЧЕМУ ОН ЗДЕСЬ', 'klim_secret', {effect:{trust:1,time:4}})
]);

S('klim_suspicious',
`Клим медленно поднимается.<br><br>— Значит, не хочешь показывать документы.<br><br>Он отходит от панели.<br><br>— Тогда сам ищи дорогу.`,
[
 choice('ОБЪЯСНИТЬСЯ', 'klim', {effect:{alarm:0,time:2}}),
 choice('УЙТИ', 'north_door', {effect:{time:3}})
]);

S('klim_voice',
`— Голос? — Клим усмехается. — Он всегда знает, что ты собираешься сделать.<br><br>— Когда объект ещё работал, система называлась «Север». Она обучалась на действиях операторов.<br><br>— Потом мы её выключили.`,
[
 choice('ПОЧЕМУ ОНА СНОВА РАБОТАЕТ?', 'klim_secret', {effect:{knowledge:2,time:3}}),
 choice('КТО ВКЛЮЧИЛ ЕЁ?', 'klim_secret', {effect:{clue:1,time:3}})
]);

S('klim_tunnel',
`Клим показывает на северную дверь.<br><br>— Там старый сервисный тоннель. Но замок с визуальным кодом. Если не знаешь последовательность, дверь просто сбросит питание.<br><br>Он добавляет:<br>— Когда-то мы использовали Брайль для аварийных инструкций.`,
[
 choice('СПРОСИТЬ ПРО БРАЙЛЬ', 'braille_hint', {effect:{knowledge:2,time:3}}),
 choice('ПОПРОБОВАТЬ ОТКРЫТЬ БЕЗ КОДА', 'north_door', {effect:{alarm:1,time:2}})
]);

S('klim_secret',
`Клим долго молчит.<br><br>— Я не включал систему.<br><br>— Но семь лет назад был оператор, который должен был закрыть её окончательно.<br><br>— Его звали...<br><br>Клим смотрит на тебя.<br><br>— Тебя.`,
[
 choice('ПОТРЕБОВАТЬ ОБЪЯСНЕНИЙ', 'klim_reveal', {effect:{knowledge:2,time:3}}),
 choice('НЕ ВЕРИТЬ ЕМУ', 'hall', {effect:{time:2}})
]);

S('klim_reveal',
`— Не ты сегодняшний, — говорит Клим. — Другой. Первый оператор проекта.<br><br>Он исчез после последнего запуска.<br><br>В документах его дело закрыли.<br><br>А система оставила его профиль.`,
[
 choice('СПРОСИТЬ, ГДЕ ПРОФИЛЬ', 'terminal_intro', {effect:{knowledge:1,trust:1,time:3}}),
 choice('ПОЙТИ В АРХИВ', 'archive', {effect:{time:5}})
]);

S('braille_hint',
`Клим рисует на пыльной панели шесть точек.<br><br><span class="fq-braille">⠏⠁⠞⠑</span><br><br>— Это пример. В Брайле всё строится на комбинациях точек. Но тебе нужен не текст. Тебе нужен номер двери.<br><br>На панели рядом с рисунком три ячейки: <strong>1 / 2 / 3</strong>.`,
[
 choice('ПРОЧИТАТЬ «PATE» И ПОПРОБОВАТЬ НОМЕР 1', 'north_door', {effect:{time:3,alarm:1}}),
 choice('ПРОВЕРИТЬ КОД НА ПАНЕЛИ', 'braille_puzzle', {effect:{knowledge:2,time:4}}),
 choice('СПРОСИТЬ КЛИМА ЕЩЁ', 'klim_tunnel', {effect:{trust:1,time:2}})
]);

S('braille_puzzle',
`На боковой панели видны три группы точек:<br><br><span class="fq-braille">⠼⠁ &nbsp; ⠼⠃ &nbsp; ⠼⠉</span><br><br>Подсказка: знак <strong>⠼</strong> переводит следующую ячейку в цифровой режим. Нужно назвать последовательность цифр.`,
[
 choice('123', 'north_door', {effect:{keycode:1,knowledge:2,time:3}}),
 choice('321', 'north_door', {effect:{alarm:1,time:2}}),
 choice('231', 'north_door', {effect:{alarm:1,time:2}})
], {inputPuzzle:{type:'braille',answer:'123',prompt:'Назови последовательность цифр, зашифрованную Брайлем.'}});

S('north_door',
`Северная дверь покрыта пылью. На панели три индикатора.<br><br>Если ты получил код Брайля, система принимает его сразу.<br><br>Если нет — на экране появляется:<br><br><span class="fq-terminal">АВАРИЙНЫЙ ДОСТУП. ОСТАЛОСЬ 1 ПОПЫТКА.</span>`,
[
 choice('ВВЕСТИ 123', 'tunnel', {condition:g=>g.keycode===1, effect:{time:2}}),
 choice('ПОПРОБОВАТЬ СТАНДАРТНЫЙ КОД', 'tunnel', {condition:g=>g.keycode!==1 && g.knowledge>=3, effect:{alarm:1,time:4}}),
 choice('ОТКАЗАТЬСЯ ОТ ВЗЛОМА', 'hall', {effect:{time:3}})
]);

S('tunnel',
`За дверью начинается узкий технический тоннель.<br><br>Через несколько метров ты находишь старый терминал. На экране мигает:<br><br><span class="fq-terminal">СВЯЗЬ С ЦЕНТРАЛЬНЫМ ЯДРОМ: 17%</span><br><br>Ниже две кнопки: <strong>ПОДКЛЮЧИТЬСЯ</strong> и <strong>ИЗОЛИРОВАТЬ</strong>.`,
[
 choice('ПОДКЛЮЧИТЬСЯ', 'core_link', {effect:{knowledge:2,alarm:1,time:5}}),
 choice('ИЗОЛИРОВАТЬ', 'core_isolated', {effect:{clue:1,time:4}})
]);

S('hall',
`В главном корпусе несколько дверей.<br><br>Слева — архив.<br>Справа — операторская.<br>В конце коридора — центральный терминал.<br><br>На полу свежая грязь. Следы идут к операторской.`,
[
 choice('АРХИВ', 'archive', {effect:{time:5}}),
 choice('ОПЕРАТОРСКАЯ', 'operator_room', {effect:{time:5}}),
 choice('ЦЕНТРАЛЬНЫЙ ТЕРМИНАЛ', 'terminal_intro', {effect:{time:4}})
]);

S('archive',
`В архиве сохранились бумажные журналы.<br><br>Последняя запись датирована семью годами назад.<br><br>«Оператор утверждает, что система начала отвечать до того, как получил запрос.»<br><br>Ниже другая строка:<br><br><strong>«Если система спрашивает имя — не называйте настоящее.»</strong>`,
[
 choice('ИСКАТЬ ДОСЬЕ ОПЕРАТОРА', 'archive_file', {effect:{knowledge:2,clue:1,time:7}}),
 choice('ВЕРНУТЬСЯ В КОРИДОР', 'hall', {effect:{time:2}})
]);
S('ending_escape',
`Ты покидаешь объект.<br><br>Когда ворота остаются позади, рация сама включается.<br><br>Тот же сигнал.<br><br>Но теперь между группами появилась новая пауза.<br><br>Ты записываешь её.<br><br><strong>Работа ещё не закончена.</strong>`,
[], {ending:'escape',title:'СИГНАЛ ПРОДОЛЖАЕТСЯ'});

S('ending_observer',
`Ты забираешь данные и выходишь.<br><br>На последнем экране перед отключением появляется:<br><br><span class="fq-terminal">НАБЛЮДЕНИЕ ПРОДОЛЖЕНО.</span><br><br>Ты не знаешь, что именно система считает своим объектом наблюдения: тебя или того, кто будет следующим.`,
[], {ending:'observer',title:'НАБЛЮДАТЕЛЬ'});

S('ending_system',
`Ты принимаешь предложение системы.<br><br>Экран показывает:<br><br><span class="fq-terminal">ОБУЧЕНИЕ ПРОДОЛЖЕНО.</span><br><br>Последняя строка:<br><br>«Теперь твоя очередь задавать вопросы.»`,
[], {ending:'system',title:'СИСТЕМА'});

S('ending_secret',
`Экран гаснет.<br><br>Затем появляется зелёная строка:<br><br><span class="fq-terminal">ПРОТОКОЛ «ПИУПИУ» АКТИВИРОВАН.</span><br><br>Ниже:<br><br><strong>«Ты оставил след.»</strong><br><br>На выходе терминал печатает маленькую строку:<br><br><span class="fq-terminal">FIELD OPERATIVE // ACCESS GRANTED</span><br><br>Ты забираешь её с собой.`,
[], {ending:'secret',title:'СКРЫТЫЙ ПРОТОКОЛ'});

function initialState() {
  return {
    scene:'briefing',
    hp:100,
    energy:100,
    time:18*60+37,
    clue:0,
    signal:0,
    radio:0,
    alarm:0,
    knowledge:0,
    courage:0,
    trust:0,
    secretReady:0,
    secret:0,
    keycode:0,
    inventory:['Полевой фонарь','Мультитул','Рация','Пропуск LEVEL 1'],
    history:[],
    ended:false
  };
}

let game = initialState();

function fmtTime(m) {
  m = ((m % 1440)+1440)%1440;
  return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
}

function esc(v) {
  return String(v).replace(/[&<>"']/g, c => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#039;'
  }[c]));
}

function applyEffect(e={}) {
  if (e.time) game.time += e.time;
  if (e.energy) game.energy = Math.max(0,Math.min(100,game.energy+e.energy));
  if (e.hp) game.hp = Math.max(0,Math.min(100,game.hp+e.hp));

  for (const k of [
    'clue',
    'signal',
    'radio',
    'alarm',
    'knowledge',
    'courage',
    'trust',
    'secretReady',
    'secret',
    'keycode'
  ]) {
    if (typeof e[k] === 'number') game[k] += e[k];
  }

  if (e.item && !game.inventory.includes(e.item)) {
    game.inventory.push(e.item);
  }
}

function can(c) {
  return !c.condition || c.condition(game);
}

function visibleChoices(scene) {
  return scene.choices.filter(can);
}

function endingForState(scene) {
  if (!scene.meta || !scene.meta.ending) return null;
  return scene.meta;
}

function render() {
  const root = document.getElementById(ROOT_ID);
  if (!root) return;

  const scene = QUEST.scenes[game.scene];
  const ending = endingForState(scene);
  const choices = visibleChoices(scene);

  root.innerHTML = `
  <div class="fq-shell">
    <div class="fq-topbar">
      <div>
        <div class="fq-kicker">ENCOUNTER // FIELD OPERATIONS</div>
        <div class="fq-title">ПУТЬ ПОЛЕВИКА</div>
      </div>
      <div class="fq-status">
        <span class="fq-dot"></span> ONLINE
      </div>
    </div>

    <div class="fq-grid">
      <main class="fq-main">
        <div class="fq-scene-code">
          OBJECT 17 / ${esc(scene.id.toUpperCase())}
        </div>

        <div class="fq-story">${scene.text}</div>

        ${
          scene.meta && scene.meta.inputPuzzle
            ? renderPuzzle(scene.meta.inputPuzzle)
            : ''
        }

        ${ending ? renderEnding(ending) : `
          <div class="fq-actions">
            ${choices.map((c,i)=>`
              <button
                class="fq-choice"
                data-index="${i}"
                type="button"
              >
                <span class="fq-choice-num">
                  ${String(i+1).padStart(2,'0')}
                </span>
                <span>${esc(c.label)}</span>
                <b>›</b>
              </button>
            `).join('')}
          </div>
        `}
      </main>

      <aside class="fq-side">
        <div class="fq-panel">
          <div class="fq-panel-title">ПОЛЕВОЙ СТАТУС</div>

          <div class="fq-stat">
            <span>ВРЕМЯ</span>
            <strong>${fmtTime(game.time)}</strong>
          </div>

          <div class="fq-stat">
            <span>СОСТОЯНИЕ</span>
            <strong>${game.hp}%</strong>
          </div>

          <div class="fq-stat">
            <span>ЭНЕРГИЯ</span>
            <strong>${game.energy}%</strong>
          </div>

          <div class="fq-bar">
            <i style="width:${game.energy}%"></i>
          </div>

          <div class="fq-stat">
            <span>ТРЕВОГА</span>
            <strong>${game.alarm}</strong>
          </div>

          <div class="fq-stat">
            <span>УЛИКИ</span>
            <strong>${game.clue}</strong>
          </div>

          <div class="fq-stat">
            <span>ЗНАНИЯ</span>
            <strong>${game.knowledge}</strong>
          </div>
        </div>

        <div class="fq-panel">
          <div class="fq-panel-title">ИНВЕНТАРЬ</div>

          <div class="fq-inventory">
            ${game.inventory.map(x=>`
              <span>${esc(x)}</span>
            `).join('')}
          </div>
        </div>

        <div class="fq-panel fq-log">
          <div class="fq-panel-title">ЖУРНАЛ</div>

          ${
            game.history.slice(-5).reverse().map(x=>`
              <div class="fq-log-item">${esc(x)}</div>
            `).join('')
            ||
            '<div class="fq-muted">Операция начата.</div>'
          }
        </div>
      </aside>
    </div>
  </div>`;

  root.querySelectorAll('.fq-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.add('is-pressed');
      setTimeout(
        ()=>choose(Number(btn.dataset.index)),
        180
      );
    });
  });

  const restart = root.querySelector('[data-restart]');

  if (restart) {
    restart.addEventListener('click', () => {
      game = initialState();
      render();
    });
  }

  const submit = root.querySelector('[data-puzzle-submit]');

  if (submit) {
    submit.addEventListener('click', () =>
      solvePuzzle(scene.meta.inputPuzzle)
    );
  }

  const input = root.querySelector('#fq-puzzle-input');

  if (input) {
    input.addEventListener('keydown', e => {
      if(e.key === 'Enter') {
        solvePuzzle(scene.meta.inputPuzzle);
      }
    });
  }
}

function renderPuzzle(p) {
  return `<div class="fq-puzzle">
    <div class="fq-puzzle-label">
      ПРОВЕРКА // ${esc(p.type.toUpperCase())}
    </div>

    <div class="fq-puzzle-prompt">
      ${esc(p.prompt)}
    </div>

    <div class="fq-puzzle-row">
      <input
        id="fq-puzzle-input"
        autocomplete="off"
        placeholder="Введите ответ"
      >

      <button
        type="button"
        data-puzzle-submit
      >
        ПРОВЕРИТЬ
      </button>
    </div>

    <div
      id="fq-puzzle-result"
      class="fq-puzzle-result"
    ></div>
  </div>`;
}

function solvePuzzle(p) {
  const root = document.getElementById(ROOT_ID);

  const input = root.querySelector('#fq-puzzle-input');
  const result = root.querySelector('#fq-puzzle-result');

  const value = input.value
    .trim()
    .toUpperCase()
    .replace(/\s+/g,' ');

  const answer = p.answer.toUpperCase();

  if (value === answer) {
    result.innerHTML =
      '<span class="ok">ДОСТУП ПОДТВЕРЖДЁН</span>';

    if (p.type === 'secret') {
      game.secretReady = 1;
      game.secret = 1;

      game.history.push('Скрытая фраза введена.');

      game.scene = 'ending_secret';

      setTimeout(render,500);
    }
  } else {
    result.innerHTML =
      '<span class="bad">НЕВЕРНО. ПРОВЕРЬ ПОСЛЕДОВАТЕЛЬНОСТЬ.</span>';

    game.alarm++;

    game.history.push('Ошибка при расшифровке.');
  }
}

function choose(index) {
  const scene = QUEST.scenes[game.scene];
  const choices = visibleChoices(scene);
  const c = choices[index];

  if (!c) return;

  applyEffect(c.effect);

  game.history.push(c.label);

  if (game.energy <= 0) game.energy = 1;

  game.scene = c.next;

  render();
}

function renderEnding(meta) {
  return `<div class="fq-ending">
    <div class="fq-ending-mark">MISSION COMPLETE</div>

    <h2>${esc(meta.title)}</h2>

    <p>
      Операция завершена.
      Решения сохранены в локальном журнале этого прохождения.
    </p>

    <button
      class="fq-restart"
      data-restart
    >
      НАЧАТЬ ЗАНОВО
    </button>
  </div>`;
}
function injectCSS() {
  if (document.getElementById('field-quest-style')) return;

  const css = `
  #field-quest{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#dcebe7;max-width:1180px;margin:28px auto;padding:0 14px;box-sizing:border-box}
  #field-quest *{box-sizing:border-box}

  .fq-shell{background:linear-gradient(145deg,#07100f,#0a1715 55%,#07100f);border:1px solid rgba(88,239,184,.22);border-radius:22px;overflow:hidden;box-shadow:0 20px 70px rgba(0,0,0,.38),inset 0 0 80px rgba(50,255,175,.025);position:relative}

  .fq-shell:before{content:"";position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(87,240,184,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(87,240,184,.035) 1px,transparent 1px);background-size:32px 32px;mask-image:linear-gradient(to bottom,black,transparent 85%)}

  .fq-topbar{position:relative;display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid rgba(88,239,184,.15);background:rgba(3,10,9,.72);backdrop-filter:blur(10px)}

  .fq-kicker,.fq-scene-code,.fq-panel-title,.fq-puzzle-label,.fq-ending-mark{font-size:10px;letter-spacing:.18em;color:#6eaaa0;font-weight:800}

  .fq-title{font-size:24px;line-height:1.05;font-weight:900;letter-spacing:.08em;margin-top:5px;color:#e9fff9}

  .fq-status{font-size:11px;letter-spacing:.12em;color:#83cfc0;display:flex;align-items:center;gap:8px}

  .fq-dot{width:8px;height:8px;border-radius:50%;background:#4df0a9;box-shadow:0 0 12px #4df0a9;animation:fqPulse 1.7s infinite}

  .fq-grid{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:0}

  .fq-main{padding:34px 32px 36px;min-height:580px}

  .fq-scene-code{margin-bottom:22px}

  .fq-story{font-size:17px;line-height:1.78;max-width:800px;color:#d6e5e1;animation:fqIn .28s ease}

  .fq-story strong{color:#f0fff9}
  .fq-story em{color:#9bded0}

  .fq-signal,.fq-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#69f3ba;letter-spacing:.1em}

  .fq-terminal{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#63f1b4;background:rgba(74,239,174,.06);border:1px solid rgba(74,239,174,.12);padding:2px 5px;border-radius:4px}

  .fq-braille{font-size:30px;letter-spacing:.18em;color:#b5ffe5}

  .fq-actions{display:grid;gap:10px;margin-top:34px;max-width:800px}

  .fq-choice{position:relative;display:flex;align-items:center;gap:14px;width:100%;border:1px solid rgba(96,235,191,.17);border-radius:12px;padding:15px 16px;background:rgba(13,31,27,.8);color:#d9ebe7;text-align:left;font:inherit;cursor:pointer;transition:transform .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease;overflow:hidden}

  .fq-choice:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:#4ef0ae;transform:scaleY(0);transition:transform .16s ease}

  .fq-choice:hover{transform:translateX(4px);border-color:rgba(90,245,186,.58);background:rgba(24,52,45,.92);box-shadow:0 0 22px rgba(65,239,169,.09)}

  .fq-choice:hover:before,.fq-choice.is-pressed:before{transform:scaleY(1)}

  .fq-choice.is-pressed{transform:translateX(7px) scale(.99);border-color:#55f1b1;background:rgba(42,88,73,.92);box-shadow:0 0 0 2px rgba(85,241,177,.12),0 0 28px rgba(85,241,177,.2)}

  .fq-choice-num{font-family:ui-monospace,monospace;font-size:11px;color:#5d9b8e;min-width:25px}

  .fq-choice b{margin-left:auto;color:#5feeb2;font-size:22px;font-weight:400}

  .fq-side{border-left:1px solid rgba(88,239,184,.12);background:rgba(3,11,10,.4);padding:20px}

  .fq-panel{border:1px solid rgba(88,239,184,.12);border-radius:14px;background:rgba(10,25,22,.62);padding:15px;margin-bottom:12px}

  .fq-panel-title{margin-bottom:12px}

  .fq-stat{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid rgba(88,239,184,.07);font-size:11px;color:#739d95}

  .fq-stat strong{color:#cce9e2;font-family:ui-monospace,monospace;font-size:12px}

  .fq-bar{height:4px;background:#142a25;border-radius:4px;overflow:hidden;margin:7px 0 5px}

  .fq-bar i{display:block;height:100%;background:#4ef0ae;box-shadow:0 0 9px rgba(78,240,174,.55);transition:width .35s ease}

  .fq-inventory{display:flex;flex-wrap:wrap;gap:6px}

  .fq-inventory span{font-size:10px;border:1px solid rgba(88,239,184,.12);padding:5px 7px;border-radius:6px;color:#9ac7bd;background:rgba(88,239,184,.035)}

  .fq-log-item{font-size:10px;line-height:1.45;color:#769d96;padding:5px 0;border-bottom:1px solid rgba(88,239,184,.06)}

  .fq-muted{font-size:10px;color:#55736e}

  .fq-puzzle{margin-top:28px;border:1px solid rgba(89,239,184,.24);border-radius:14px;padding:17px;background:rgba(20,51,42,.42);max-width:800px}

  .fq-puzzle-label{color:#59e9b0}

  .fq-puzzle-prompt{margin:11px 0 12px;color:#d5e9e4;line-height:1.5}

  .fq-puzzle-row{display:flex;gap:8px}

  .fq-puzzle input{flex:1;min-width:0;background:#06100e;border:1px solid rgba(88,239,184,.22);border-radius:9px;padding:12px;color:#eafff9;outline:none}

  .fq-puzzle input:focus{border-color:#5aefb2;box-shadow:0 0 0 3px rgba(90,239,178,.08)}

  .fq-puzzle button,.fq-restart{border:1px solid rgba(88,239,184,.4);border-radius:9px;background:#123b30;color:#bfffe9;padding:0 16px;font-weight:800;cursor:pointer}

  .fq-puzzle-result{min-height:20px;margin-top:10px;font-size:11px;letter-spacing:.08em}

  .fq-puzzle-result .ok{color:#55efae}

  .fq-puzzle-result .bad{color:#ff8b8b}

  .fq-ending{margin-top:34px;padding:30px;border:1px solid rgba(83,241,178,.3);border-radius:16px;background:linear-gradient(145deg,rgba(29,78,62,.5),rgba(6,22,18,.7));animation:fqIn .4s ease}

  .fq-ending h2{font-size:26px;letter-spacing:.04em;margin:7px 0 10px;color:#eafff7}

  .fq-ending p{color:#9fc4bb;line-height:1.6}

  .fq-restart{height:44px;margin-top:14px}

  @keyframes fqIn{
    from{opacity:0;transform:translateY(8px)}
    to{opacity:1;transform:none}
  }

  @keyframes fqPulse{
    0%,100%{opacity:.55;transform:scale(.8)}
    50%{opacity:1;transform:scale(1.15)}
  }

  @media(max-width:800px){
    .fq-grid{grid-template-columns:1fr}

    .fq-side{
      border-left:0;
      border-top:1px solid rgba(88,239,184,.12);
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:10px
    }

    .fq-panel{margin:0}

    .fq-log{grid-column:1/-1}

    .fq-main{min-height:auto}

    .fq-story{font-size:16px}

    .fq-title{font-size:20px}
  }

  @media(max-width:560px){
    #field-quest{
      padding:0 6px;
      margin:14px auto
    }

    .fq-shell{border-radius:16px}

    .fq-topbar{padding:16px}

    .fq-main{padding:24px 17px}

    .fq-side{
      padding:12px;
      grid-template-columns:1fr
    }

    .fq-log{grid-column:auto}

    .fq-choice{padding:14px 12px}

    .fq-puzzle-row{flex-direction:column}

    .fq-puzzle button{height:42px}

    .fq-status{display:none}
  }
  `;

  const style = document.createElement('style');
  style.id = 'field-quest-style';
  style.textContent = css;
  document.head.appendChild(style);
}

function boot() {
  let root = document.getElementById(ROOT_ID);

  if(!root) {
    root = document.createElement('div');
    root.id = ROOT_ID;

    const target =
      document.currentScript &&
      document.currentScript.parentElement;

    if(target) {
      target.appendChild(root);
    } else {
      document.body.appendChild(root);
    }
  }

  injectCSS();
  render();
}

if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded',boot);
} else {
  boot();
}

})();