/* =====================================================
   げんじぶツール Ver.2
   app.js

   アプリの起動処理とGoogleスプレッドシートの
   データ読み込みを管理します。

   必ず他のJavaScriptファイルより後に読み込んでください。
   ===================================================== */


/* =====================================================
   データ状態
   ===================================================== */

var songList = [];

var songData = {};

var quizList = [];

var lyricQuizList = [];


/* =====================================================
   アプリ起動
   ===================================================== */

document.addEventListener(

    'DOMContentLoaded',

    function() {

        initializeApp();
    }
);


/* =====================================================
   初期化
   ===================================================== */

function initializeApp() {

    /*
       まず歌割画面を表示します。
       データ読み込み中でも画面自体は表示できます。
    */

    currentMode = 'utari';

    updateMenuButtons();

    renderLoadingScreen();


    /*
       シート1・2・3を並行して読み込みます。
    */

    Promise.all([

        loadTextData(
            utariUrl
        ),

        loadTextData(
            introUrl
        ),

        loadTextData(
            lyricUrl
        )

    ])

        .then(function(results) {

            /*
               シート1：歌割
            */

            parseUtariCSV(
                results[0]
            );


            /*
               シート2：
               イントロ・アウトロ・3曲MIX
            */

            parseIntroCSV(
                results[1]
            );


            /*
               シート3：歌詞ドン
            */

            parseLyricCSV(
                results[2]
            );


            /*
               ランダム出題履歴を初期化します。
            */

            remainingQuizList = [];

            remainingLyricQuizList = [];


            /*
               読み込み完了後、
               初期画面を描画します。
            */

            renderScreen();


            console.log(

                'げんじぶツール Ver.2 読み込み完了',

                {
                    songs:
                        songList.length,

                    quizzes:
                        quizList.length,

                    lyricQuizzes:
                        lyricQuizList.length
                }
            );
        })


        .catch(function(error) {

            console.error(

                'アプリ初期化エラー:',

                error
            );


            renderLoadErrorScreen(
                error
            );
        });
}


/* =====================================================
   テキストデータ取得
   ===================================================== */

function loadTextData(url) {

    return fetch(

        url,

        {
            cache:
                'no-store'
        }
    )

        .then(function(response) {

            if (!response.ok) {

                throw new Error(

                    'HTTPエラー：'
                    + response.status
                );
            }


            return response.text();
        });
}


/* =====================================================
   読み込み中画面
   ===================================================== */

function renderLoadingScreen() {

    var box =
        getElement(
            'mainAppBox'
        );


    if (!box) {

        return;
    }


    box.innerHTML =

        '<div class="loading">'

        + '<div class="loading-title">'
        + 'データを読み込んでいます...'
        + '</div>'

        + '<div class="loading-note">'
        + '少しお待ちください'
        + '</div>'

        + '</div>';
}


/* =====================================================
   読み込みエラー画面
   ===================================================== */

function renderLoadErrorScreen(error) {

    var box =
        getElement(
            'mainAppBox'
        );


    if (!box) {

        return;
    }


    var message =

        error

            ? String(
                error.message
                || error
            )

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
        + '<br>'
        + '改善しない場合は、Googleスプレッドシートの公開設定を確認してください。'
        + '</p>'

        + '<button '
        + 'class="action-btn btn-answer" '
        + 'onclick="location.reload()">'
        + '再読み込み'
        + '</button>'

        + '</div>';
}
