/* =====================================================
   げんじぶツール Ver.2
   quiz.js

   モード切替・画面描画・問題選出・正解表示を管理します。
   ===================================================== */


/* =====================================================
   アプリ状態
   ===================================================== */

var currentMode = 'utari';

var currentQuiz = null;

var remainingQuizList = [];

var remainingLyricQuizList = [];


/* =====================================================
   モード切替
   ===================================================== */

function switchMode(mode) {

    pauseAllPlayers();

    currentMode = mode;

    currentQuiz = null;

    updateMenuButtons();

    renderScreen();


    if (mode === 'intro') {

        nextQuestion(false);

    } else if (mode === 'outro') {

        nextQuestion(false);

    } else if (mode === 'mix') {

        nextMixQuestion(false);

    } else if (mode === 'lyric') {

        nextLyricQuestion(false);
    }
}


/* =====================================================
   メニューボタン更新
   ===================================================== */

function updateMenuButtons() {

    var buttons =
        document.querySelectorAll('.menu-btn');


    buttons.forEach(function(button) {

        button.classList.remove('active');
    });


    var activeButton =
        getElement('menu-' + currentMode);


    if (activeButton) {

        activeButton.classList.add('active');
    }
}


/* =====================================================
   画面描画
   ===================================================== */

function renderScreen() {

    var box =
        getElement('mainAppBox');


    if (!box) {

        return;
    }


    if (currentMode === 'utari') {

        renderUtariScreen(box);

    } else if (currentMode === 'intro') {

        renderIntroScreen(box);

    } else if (currentMode === 'outro') {

        renderOutroScreen(box);

    } else if (currentMode === 'mix') {

        renderMixScreen(box);

    } else if (currentMode === 'lyric') {

        renderLyricScreen(box);
    }
}


/* =====================================================
   歌割画面
   ===================================================== */

function renderUtariScreen(box) {

    var html =

        '<div class="select-container">'

        + '<select id="songSelector" onchange="displayLyrics()">'

        + '<option value="">-- 曲を選択してください --</option>';


    songList.forEach(function(song) {

        html +=

            '<option value="'

            + escapeHtml(song.title)

            + '">'

            + escapeHtml(song.title)

            + '</option>';
    });


    html +=

        '</select>'

        + '</div>'

        + '<div id="lyricsArea">'

        + '<div class="empty-message">'

        + '全 '

        + songList.length

        + ' 曲を読み込みました！'

        + '<br>'

        + '上のプルダウンから曲を選んでね！'

        + '</div>'

        + '</div>';


    box.innerHTML = html;
}


/* =====================================================
   イントロ画面
   ===================================================== */

function renderIntroScreen(box) {

    var html =

        '<div class="intro-screen">'

        + '<h2 class="intro-title">🎵 ランダム イントロドン！</h2>'

        + '<div class="mode-note">バーで秒数を選んで曲の最初から再生します</div>'

        + '<div id="statusArea" class="status-text">準備中...</div>'

        + createSecondsSliderHtml(

            'intro',

            '最初の',

            APP_SETTINGS.introMin,

            APP_SETTINGS.introMax,

            APP_SETTINGS.introDefault,

            APP_SETTINGS.introStep
        )

        + '<button class="action-btn btn-answer intro-play-btn" '

        + 'id="introPlayBtn" '

        + 'onclick="playIntroFromSlider()" disabled>'

        + '選んだ秒数で聴く'

        + '</button>'

        + createNormalAnswerAreaHtml()

        + '</div>';


    box.innerHTML = html;
}


/* =====================================================
   アウトロ画面
   ===================================================== */

function renderOutroScreen(box) {

    var html =

        '<div class="intro-screen">'

        + '<h2 class="intro-title">🎶 ランダム アウトロドン！</h2>'

        + '<div class="mode-note">バーで秒数を選んで曲の最後から再生します</div>'

        + '<div id="statusArea" class="status-text">準備中...</div>'

        + createSecondsSliderHtml(

            'outro',

            'ラスト',

            APP_SETTINGS.outroMin,

            APP_SETTINGS.outroMax,

            APP_SETTINGS.outroDefault,

            APP_SETTINGS.outroStep
        )

        + '<button class="action-btn btn-answer outro-play-btn" '

        + 'id="outroPlayBtn" '

        + 'onclick="playOutroFromSlider()" disabled>'

        + '選んだ秒数で聴く'

        + '</button>'

        + createNormalAnswerAreaHtml()

        + '</div>';


    box.innerHTML = html;
}


/* =====================================================
   秒数スライダー
   ===================================================== */

function createSecondsSliderHtml(

    type,

    label,

    min,

    max,

    defaultSeconds,

    step

) {

    var displayId =
        type + 'SecondsDisplay';


    var sliderId =
        type + 'SecondsSlider';


    var sliderClass =
        type + '-slider';


    var displayClass =
        type + '-seconds-display';


    var updateFunction =

        type === 'intro'

            ? 'updateIntroSecondsDisplay()'

            : 'updateOutroSecondsDisplay()';


    return (

        '<div class="slider-box">'

        + '<div class="slider-label">'

        + label

        + ' <span id="'

        + displayId

        + '" class="'

        + displayClass

        + '">'

        + formatSeconds(defaultSeconds)

        + '</span> 秒'

        + '</div>'

        + '<input class="'

        + sliderClass

        + '" id="'

        + sliderId

        + '" type="range" min="'

        + min

        + '" max="'

        + max

        + '" step="'

        + step

        + '" value="'

        + defaultSeconds

        + '" oninput="'

        + updateFunction

        + '">'

        + '<div class="slider-minmax">'

        + '<span>'

        + formatSeconds(min)

        + '秒</span>'

        + '<span>'

        + formatSeconds(max)

        + '秒</span>'

        + '</div>'

        + '</div>'
    );
}


/* =====================================================
   通常クイズ回答欄
   ===================================================== */

function createNormalAnswerAreaHtml() {

    return (

        '<div class="answer-box" id="answerBox">'

        + '<div class="secret-text">？ ？ ？</div>'

        + '</div>'

        + '<button class="action-btn btn-answer" '

        + 'id="ansBtn" '

        + 'onclick="showAnswer()" disabled>'

        + '正解発表 どん！'

        + '</button>'

        + '<button class="action-btn btn-next" '

        + 'id="nextBtn" '

        + 'onclick="nextQuestion(false)" '

        + 'style="display:none;">'

        + '次の問題へ ➔'

        + '</button>'
    );
}


/* =====================================================
   MIX画面
   ===================================================== */

function renderMixScreen(box) {

    var html =

        '<div class="intro-screen">'

        + '<h2 class="intro-title">🎧 ランダム 3曲MIXドン！</h2>'

        + '<div class="mode-note">シート2からランダムで3曲を同時再生します</div>'

        + '<div id="statusArea" class="status-text">準備中...</div>'

        + '<button class="action-btn btn-answer intro-play-btn" '

        + 'id="mixPlayBtn" onclick="playMixQuiz()" disabled>'

        + '3曲を同時に聴く'

        + '</button>'

        + '<div class="answer-box" id="answerBox">'

        + '<div class="secret-text">？ ？ ？</div>'

        + '</div>'

        + '<button class="action-btn btn-answer" '

        + 'id="ansBtn" onclick="showMixAnswer()" disabled>'

        + '正解発表 どん！'

        + '</button>'

        + '<button class="action-btn btn-next" '

        + 'id="nextBtn" onclick="nextMixQuestion(false)" '

        + 'style="display:none;">'

        + '次の問題へ ➔'

        + '</button>'

        + '</div>';


    box.innerHTML = html;
}


/* =====================================================
   歌詞ドン画面
   ===================================================== */

function renderLyricScreen(box) {

    var html =

        '<div class="intro-screen">'

        + '<h2 class="intro-title">📝 ランダム 歌詞ドン！</h2>'

        + '<div class="mode-note">シート3の歌詞から、約10文字のフレーズで曲名を当ててください</div>'

        + '<div id="statusArea" class="status-text">準備中...</div>'

        + '<div class="answer-box" id="answerBox">'

        + '<div class="secret-text">？ ？ ？</div>'

        + '</div>'

        + '<button class="action-btn btn-answer" '

        + 'id="ansBtn" onclick="showLyricAnswer()">'

        + '正解発表 どん！'

        + '</button>'

        + '<button class="action-btn btn-next" '

        + 'id="nextBtn" onclick="nextLyricQuestion(false)" '

        + 'style="display:none;">'

        + '次の問題へ ➔'

        + '</button>'

        + '</div>';


    box.innerHTML = html;
}


/* =====================================================
   イントロ・アウトロ次の問題
   ===================================================== */

function nextQuestion(isFirst) {

    if (quizList.length === 0) {

        alert('イントロドンの問題データがありません。');

        return;
    }


    pauseAllPlayers();


    if (isFirst) {

        renderScreen();
    }


    setHtml(

        'answerBox',

        '<div class="secret-text">？ ？ ？</div>'
    );


    showElement('ansBtn');

    hideElement('nextBtn');

    setQuizButtonsEnabled(false);


    if (remainingQuizList.length === 0) {

        remainingQuizList =
            quizList.slice();
    }


    var randomIndex =

        Math.floor(

            Math.random()

            * remainingQuizList.length
        );


    currentQuiz =

        remainingQuizList.splice(

            randomIndex,

            1

        )[0];


    setText(

        'statusArea',

        '問題を読み込み中...'
    );


    if (

        isPlayerReady

        && ytPlayer

    ) {

        cueQuizVideo(

            currentQuiz.videoId
        );


        setText(

            'statusArea',

            '問題をセットしました！いつでも鳴らせます。'
        );


        setQuizButtonsEnabled(true);

    } else {

        waitForQuizPlayer();
    }
}


/* =====================================================
   プレイヤー準備待ち
   ===================================================== */

function waitForQuizPlayer() {

    var attempts = 0;


    var timer =

        setInterval(function() {

            attempts++;


            if (

                currentQuiz

                && isPlayerReady

                && ytPlayer

            ) {

                clearInterval(timer);


                cueQuizVideo(

                    currentQuiz.videoId
                );


                setText(

                    'statusArea',

                    '問題をセットしました！いつでも鳴らせます。'
                );


                setQuizButtonsEnabled(true);


                return;
            }


            if (attempts >= 30) {

                clearInterval(timer);


                setText(

                    'statusArea',

                    'YouTubeプレイヤーの準備に時間がかかっています。ページを再読み込みしてください。'
                );
            }

        }, 500);
}


/* =====================================================
   通常クイズ正解表示
   ===================================================== */

function showAnswer() {

    clearStopTimer();

    pauseMainPlayer();


    if (!currentQuiz) {

        return;
    }


    setHtml(

        'answerBox',

        '<h3 class="ans-title">👉 '

        + escapeHtml(currentQuiz.title)

        + '</h3>'

        + '<p class="ans-artist">👤 '

        + escapeHtml(currentQuiz.artist)

        + '</p>'
    );


    setText(

        'statusArea',

        '正解発表！！どん！！'
    );


    hideElement('ansBtn');

    showElement('nextBtn');
}


/* =====================================================
   歌詞ドン次の問題
   ===================================================== */

function nextLyricQuestion(isFirst) {

    if (lyricQuizList.length === 0) {

        alert('歌詞ドンの問題データがありません。');

        return;
    }


    pauseAllPlayers();


    if (isFirst) {

        renderScreen();
    }


    if (

        remainingLyricQuizList.length

        === 0

    ) {

        remainingLyricQuizList =

            lyricQuizList.slice();
    }


    var randomIndex =

        Math.floor(

            Math.random()

            * remainingLyricQuizList.length
        );


    currentQuiz =

        remainingLyricQuizList.splice(

            randomIndex,

            1

        )[0];


    setHtml(

        'answerBox',

        '<div class="lyric-quiz-line">“'

        + escapeHtml(currentQuiz.lyric)

        + '”</div>'
    );


    setText(

        'statusArea',

        'この約10文字フレーズの曲名は？'
    );


    showElement('ansBtn');

    hideElement('nextBtn');
}


/* =====================================================
   歌詞ドン正解表示
   ===================================================== */

function showLyricAnswer() {

    clearStopTimer();


    if (!currentQuiz) {

        return;
    }


    setHtml(

        'answerBox',

        '<h3 class="ans-title">👉 '

        + escapeHtml(currentQuiz.title)

        + '</h3>'
    );


    setText(

        'statusArea',

        '正解発表！！どん！！'
    );


    hideElement('ansBtn');

    showElement('nextBtn');
}


/* =====================================================
   クイズボタン有効・無効
   ===================================================== */

function setQuizButtonsEnabled(enabled) {

    setDisabled(

        'introPlayBtn',

        !enabled
    );


    setDisabled(

        'outroPlayBtn',

        !enabled
    );


    setDisabled(

        'mixPlayBtn',

        !enabled
    );


    setDisabled(

        'ansBtn',

        !enabled
    );
}
