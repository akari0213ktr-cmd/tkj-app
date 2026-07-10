/* =====================================================
   げんじぶツール Ver.2
   app.js
   ===================================================== */


/* =====================================================
   データ状態
   ===================================================== */

var songList = [];

var songData = {};

var quizList = [];

var lyricQuizList = [];


/* =====================================================
   起動
   ===================================================== */

document.addEventListener('DOMContentLoaded', function() {

    initializeApp();

});


/* =====================================================
   初期化
   ===================================================== */

async function initializeApp() {

    currentMode = 'utari';

    updateMenuButtons();

    renderLoadingScreen();


    try {

        setLoadingMessage('シート1（歌割）を読み込んでいます...');

        var utariText = await loadTextData(
            utariUrl,
            'シート1（歌割）'
        );

        parseUtariCSV(utariText);


        setLoadingMessage('シート2（クイズ）を読み込んでいます...');

        var introText = await loadTextData(
            introUrl,
            'シート2（クイズ）'
        );

        parseIntroCSV(introText);


        setLoadingMessage('シート3（歌詞ドン）を読み込んでいます...');

        var lyricText = await loadTextData(
            lyricUrl,
            'シート3（歌詞ドン）'
        );

        parseLyricCSV(lyricText);


        remainingQuizList = [];

        remainingLyricQuizList = [];


        renderScreen();


        console.log(
            'Ver.2 読み込み完了',
            {
                songs: songList.length,
                quizzes: quizList.length,
                lyricQuizzes: lyricQuizList.length
            }
        );


    } catch (error) {

        console.error(
            'アプリ初期化エラー:',
            error
        );

        renderLoadErrorScreen(error);
    }
}


/* =====================================================
   CSV取得
   ===================================================== */

function loadTextData(url, sheetName) {

    var timeoutMilliseconds = 15000;


    return new Promise(function(resolve, reject) {

        var finished = false;


        var timeoutId = setTimeout(function() {

            if (finished) {
                return;
            }

            finished = true;


            reject(

                new Error(
                    sheetName
                    + 'の読み込みが15秒以内に完了しませんでした。'
                )

            );

        }, timeoutMilliseconds);


        fetch(
            url,
            {
                cache: 'no-store'
            }
        )

        .then(function(response) {

            if (finished) {
                return;
            }


            if (!response.ok) {

                throw new Error(

                    sheetName
                    + 'のHTTPエラー：'
                    + response.status

                );
            }


            return response.text();
        })

        .then(function(text) {

            if (finished) {
                return;
            }


            finished = true;

            clearTimeout(timeoutId);

            resolve(text);
        })

        .catch(function(error) {

            if (finished) {
                return;
            }


            finished = true;

            clearTimeout(timeoutId);

            reject(error);
        });
    });
}


/* =====================================================
   読み込み画面
   ===================================================== */

function renderLoadingScreen() {

    var box = getElement('mainAppBox');


    if (!box) {
        return;
    }


    box.innerHTML =

        '<div class="loading">'

        + '<div class="loading-title" id="loadingTitle">'

        + 'データを読み込んでいます...'

        + '</div>'

        + '<div class="loading-note">'

        + '少しお待ちください'

        + '</div>'

        + '</div>';
}


/* =====================================================
   読み込みメッセージ変更
   ===================================================== */

function setLoadingMessage(message) {

    setText(
        'loadingTitle',
        message
    );
}


/* =====================================================
   エラー画面
   ===================================================== */

function renderLoadErrorScreen(error) {

    var box = getElement('mainAppBox');


    if (!box) {
        return;
    }


    var message = error
        ? String(error.message || error)
        : '不明なエラー';


    box.innerHTML =

        '<div class="load-error">'

        + '<h2 class="load-error-title">'

        + 'データを読み込めませんでした'

        + '</h2>'

        + '<p class="load-error-message">'

        + escapeHtml(message)

        + '</p>'

        + '<p class="load-error-note">'

        + 'ページを再読み込みしてください。'

        + '</p>'

        + '<button '

        + 'class="action-btn btn-answer" '

        + 'onclick="location.reload()">'

        + '再読み込み'

        + '</button>'

        + '</div>';
}
