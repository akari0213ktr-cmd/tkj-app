/* =====================================================
   げんじぶツール Ver.2
   mix.js

   3曲MIXドンの
   問題選出・同時再生・正解表示を管理します。

   依存ファイル：
   common.js
   player.js
   ===================================================== */


/* =====================================================
   MIX問題状態
   ===================================================== */

var currentMixQuiz = [];


/* =====================================================
   次のMIX問題
   ===================================================== */

function nextMixQuestion(isFirst) {

    /*
       3曲未満の場合はゲームを開始できません。
    */

    if (quizList.length < 3) {

        alert(
            '3曲MIXドンには、シート2に3曲以上のデータが必要です。'
        );

        return;
    }


    /*
       再生中の音声・停止タイマーを止めます。
    */

    pauseAllPlayers();


    /*
       初回はMIX画面を描画します。
    */

    if (isFirst) {

        renderScreen();
    }


    /*
       シート2から重複なしで3曲選びます。
    */

    currentMixQuiz =

        pickRandomItems(
            quizList,
            3
        );


    /*
       currentQuizは通常クイズでも使用するため、
       MIX中であることが分かる値を設定します。
    */

    currentQuiz = {

        title:
            '3曲MIX',

        artist:
            ''
    };


    /*
       回答欄を初期化します。
    */

    setHtml(

        'answerBox',

        '<div class="secret-text">'
        + '？ ？ ？'
        + '</div>'
    );


    showElement(
        'ansBtn'
    );


    hideElement(
        'nextBtn'
    );


    setText(

        'statusArea',

        '3曲をセットしました！'
    );


    setQuizButtonsEnabled(true);
}


/* =====================================================
   3曲同時再生
   ===================================================== */

function playMixQuiz() {

    if (

        !mixPlayers

        || mixPlayers.length < 3

        || currentMixQuiz.length < 3

    ) {

        return;
    }


    /*
       前回の停止タイマーがあれば解除します。
    */

    clearStopTimer();


    setText(

        'statusArea',

        '3曲 同時再生中... 🎧'
    );


    /*
       3台のYouTubeプレイヤーへ
       それぞれ1曲ずつ設定します。
    */

    currentMixQuiz.forEach(

        function(song, index) {

            var player =
                mixPlayers[index];


            try {

                player.unMute();

                player.setVolume(70);


                /*
                   スマホの再生制限対策として、
                   ユーザーのボタン操作を起点に
                   loadVideoById()を呼びます。
                */

                player.loadVideoById({

                    videoId:
                        song.videoId,

                    startSeconds:
                        0
                });


                /*
                   読み込み後に先頭へ移動し、
                   再生を開始します。
                */

                setTimeout(

                    function() {

                        try {

                            player.seekTo(
                                0,
                                true
                            );

                            player.unMute();

                            player.setVolume(70);

                            player.playVideo();

                        } catch (error) {

                            console.error(
                                'Mix delayed play error:',
                                error
                            );
                        }

                    },

                    250
                );


            } catch (error) {

                console.error(
                    'Mix play error:',
                    error
                );
            }
        }
    );
}


/* =====================================================
   MIX正解表示
   ===================================================== */

function showMixAnswer() {

    /*
       3曲すべて停止します。
    */

    pauseMixPlayers();

    clearStopTimer();


    /*
       正解HTMLを生成します。
    */

    var html =

        '<div class="mix-answer-list">';


    currentMixQuiz.forEach(

        function(song, index) {

            html +=

                '<div class="mix-answer-item">'

                + '<div class="mix-title">'

                + (index + 1)

                + '. '

                + escapeHtml(song.title)

                + '</div>'

                + '<div>👤 '

                + escapeHtml(song.artist)

                + '</div>'

                + '</div>';
        }
    );


    html += '</div>';


    /*
       回答欄へ表示します。
    */

    setHtml(

        'answerBox',

        html
    );


    setText(

        'statusArea',

        '正解発表！！どん！！'
    );


    hideElement(
        'ansBtn'
    );


    showElement(
        'nextBtn'
    );
}
