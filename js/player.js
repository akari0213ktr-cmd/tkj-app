/* =====================================================
   げんじぶツール Ver.2
   player.js

   YouTube IFrame Player APIを使用した
   プレイヤー初期化・再生・停止処理を管理します。

   依存ファイル：
   config.js
   common.js
   ===================================================== */


/* =====================================================
   プレイヤー状態
   ===================================================== */

var ytPlayer = null;

var mixPlayers = [];

var stopTimer = null;

var isPlayerReady = false;

var lastPlayerError = null;


/* =====================================================
   YouTube IFrame API準備完了
   ===================================================== */

window.onYouTubeIframeAPIReady = function() {

    /* ---------- 通常クイズ用プレイヤー ---------- */

    ytPlayer = new YT.Player(

        'yt-player',

        {

            height: '135',

            width: '240',

            videoId: 'dQw4w9WgXcQ',

            playerVars: {

                playsinline: 1,

                controls: 0,

                disablekb: 1
            },

            events: {

                onReady: function() {

                    isPlayerReady = true;


                    /*
                       すでにイントロ・アウトロ画面が
                       表示されている場合は再生可能にします。
                    */

                    if (

                        (
                            currentMode === 'intro'

                            || currentMode === 'outro'

                            || currentMode === 'mix'
                        )

                        && currentQuiz

                    ) {

                        setQuizButtonsEnabled(true);
                    }
                },


                onStateChange:
                    onPlayerStateChange,


                onError:
                    onPlayerError
            }
        }
    );


    /* ---------- 3曲MIX用プレイヤー ---------- */

    mixPlayers = [

        createMixPlayer(
            'yt-mix-player-1'
        ),

        createMixPlayer(
            'yt-mix-player-2'
        ),

        createMixPlayer(
            'yt-mix-player-3'
        )
    ];
};


/* =====================================================
   MIX用プレイヤー生成
   ===================================================== */

function createMixPlayer(elementId) {

    return new YT.Player(

        elementId,

        {

            height: '135',

            width: '240',

            videoId: 'dQw4w9WgXcQ',

            playerVars: {

                playsinline: 1,

                controls: 0,

                disablekb: 1
            },

            events: {

                onStateChange:
                    onPlayerStateChange,

                onError:
                    onPlayerError
            }
        }
    );
}


/* =====================================================
   プレイヤー状態変更
   ===================================================== */

function onPlayerStateChange(event) {

    /*
       MIXプレイヤーの状態変化でも呼ばれるため、
       通常プレイヤーの存在だけ確認します。
    */

    if (!ytPlayer) {
        return;
    }


    if (
        event.data
        === YT.PlayerState.PLAYING
    ) {

        try {

            /*
               実際に再生状態になったプレイヤーを
               ミュート解除します。

               通常プレイヤー・MIXプレイヤーの
               どちらにも対応します。
            */

            if (
                event.target
                && event.target.unMute
            ) {

                event.target.unMute();
            }


            /*
               通常プレイヤーは音量100。
               MIXプレイヤーはplayMixQuiz()側で
               音量70へ設定します。
            */

            if (
                event.target === ytPlayer
                && event.target.setVolume
            ) {

                event.target.setVolume(100);
            }

        } catch (error) {

            console.error(
                'Player state change error:',
                error
            );
        }
    }
}


/* =====================================================
   YouTube再生エラー
   ===================================================== */

function onPlayerError(event) {

    lastPlayerError =
        event.data;


    var message =
        'YouTubeの再生エラーです。';


    if (event.data === 2) {

        message =
            '動画IDが正しくない可能性があります。';

    } else if (event.data === 5) {

        message =
            'この動画はHTML5プレイヤーで再生できない可能性があります。';

    } else if (event.data === 100) {

        message =
            '動画が削除・非公開の可能性があります。';

    } else if (

        event.data === 101

        || event.data === 150

    ) {

        message =
            'この動画は埋め込み再生が許可されていません。YouTube Musicの一部楽曲で起きやすいです。';
    }


    setText(
        'statusArea',
        message
    );


    console.error(
        'YouTube Player Error:',
        event.data
    );
}


/* =====================================================
   停止タイマー
   ===================================================== */

function startStopTimer(seconds) {

    clearStopTimer();


    stopTimer =
        setTimeout(

            function() {

                pauseMainPlayer();


                setText(

                    'statusArea',

                    'ストップ！さあ、答えは？'
                );

            },

            seconds * 1000
        );
}


/* =====================================================
   停止タイマー解除
   ===================================================== */

function clearStopTimer() {

    if (stopTimer) {

        clearTimeout(stopTimer);

        stopTimer = null;
    }
}


/* =====================================================
   通常プレイヤー停止
   ===================================================== */

function pauseMainPlayer() {

    if (
        !ytPlayer

        || !isPlayerReady
    ) {

        return;
    }


    try {

        ytPlayer.pauseVideo();

    } catch (error) {

        console.error(
            'Main player pause error:',
            error
        );
    }
}


/* =====================================================
   MIXプレイヤー停止
   ===================================================== */

function pauseMixPlayers() {

    if (
        !mixPlayers

        || mixPlayers.length === 0
    ) {

        return;
    }


    mixPlayers.forEach(

        function(player) {

            try {

                if (
                    player

                    && player.pauseVideo
                ) {

                    player.pauseVideo();
                }

            } catch (error) {

                console.error(
                    'Mix player pause error:',
                    error
                );
            }
        }
    );
}


/* =====================================================
   すべてのプレイヤー停止
   ===================================================== */

function pauseAllPlayers() {

    pauseMainPlayer();

    pauseMixPlayers();

    clearStopTimer();
}


/* =====================================================
   問題曲を事前読み込み
   ===================================================== */

function cueQuizVideo(videoId) {

    if (

        !ytPlayer

        || !isPlayerReady

        || !videoId

    ) {

        return false;
    }


    try {

        ytPlayer.cueVideoById(videoId);

        return true;

    } catch (error) {

        console.error(
            'Video cue error:',
            error
        );

        return false;
    }
}


/* =====================================================
   イントロ再生
   ===================================================== */

function playIntro(seconds) {

    if (

        !ytPlayer

        || !isPlayerReady

        || !currentQuiz

    ) {

        return;
    }


    clearStopTimer();

    lastPlayerError = null;


    setText(

        'statusArea',

        formatSeconds(seconds)
            + '秒間 再生中... 🎵'
    );


    try {

        ytPlayer.unMute();

        ytPlayer.setVolume(100);


        /*
           スマホではボタン操作を起点に
           loadVideoById()を呼ぶ方が再生しやすいため、
           現在のVer.1と同じ方式を維持します。
        */

        ytPlayer.loadVideoById({

            videoId:
                currentQuiz.videoId,

            startSeconds:
                0
        });


        setTimeout(

            function() {

                try {

                    ytPlayer.seekTo(
                        0,
                        true
                    );

                    ytPlayer.unMute();

                    ytPlayer.setVolume(100);

                    ytPlayer.playVideo();

                } catch (error) {

                    console.error(
                        'Intro delayed play error:',
                        error
                    );
                }

            },

            250
        );


        /*
           スマホ対策として、
           PLAYING状態を待たずに停止タイマーを開始します。
        */

        startStopTimer(seconds);


    } catch (error) {

        setText(

            'statusArea',

            '再生できませんでした。別のYouTube URLで試してください。'
        );


        console.error(
            'Intro play error:',
            error
        );
    }
}


/* =====================================================
   アウトロ再生
   ===================================================== */

function playOutro(seconds) {

    if (

        !ytPlayer

        || !isPlayerReady

        || !currentQuiz

    ) {

        return;
    }


    clearStopTimer();

    lastPlayerError = null;


    setText(

        'statusArea',

        'アウトロを準備中...'
    );


    try {

        ytPlayer.unMute();

        ytPlayer.setVolume(100);


        /*
           動画を読み込み、
           動画時間を取得できる状態にします。
        */

        ytPlayer.loadVideoById({

            videoId:
                currentQuiz.videoId,

            startSeconds:
                0
        });


        var attempts = 0;


        var waitTimer =

            setInterval(

                function() {

                    attempts++;


                    var duration = 0;


                    try {

                        duration =
                            ytPlayer.getDuration();

                    } catch (error) {

                        duration = 0;
                    }


                    /*
                       動画時間を取得できたら、
                       終了位置から指定秒数前へ移動します。
                    */

                    if (

                        duration

                        && duration > 0

                    ) {

                        clearInterval(
                            waitTimer
                        );


                        var start =

                            Math.max(

                                duration - seconds,

                                0
                            );


                        try {

                            ytPlayer.seekTo(
                                start,
                                true
                            );

                            ytPlayer.unMute();

                            ytPlayer.setVolume(100);

                            ytPlayer.playVideo();


                            setText(

                                'statusArea',

                                'ラスト'
                                    + formatSeconds(seconds)
                                    + '秒間 再生中... 🎵'
                            );


                            startStopTimer(seconds);


                        } catch (error) {

                            setText(

                                'statusArea',

                                'アウトロを再生できませんでした。'
                            );


                            console.error(
                                'Outro seek/play error:',
                                error
                            );
                        }
                    }


                    /*
                       約5秒待っても動画時間を
                       取得できなければ終了します。
                    */

                    if (attempts > 20) {

                        clearInterval(
                            waitTimer
                        );


                        setText(

                            'statusArea',

                            '動画の長さを取得できませんでした。もう一度押すか、別URLで試してください。'
                        );


                        pauseMainPlayer();
                    }

                },

                250
            );


    } catch (error) {

        setText(

            'statusArea',

            '再生できませんでした。別のYouTube URLで試してください。'
        );


        console.error(
            'Outro play error:',
            error
        );
    }
}


/* =====================================================
   イントロスライダーから再生
   ===================================================== */

function playIntroFromSlider() {

    var slider =
        getElement(
            'introSecondsSlider'
        );


    var seconds =
        APP_SETTINGS.introDefault;


    if (slider) {

        seconds =
            parseFloat(
                slider.value
            );
    }


    playIntro(seconds);
}


/* =====================================================
   アウトロスライダーから再生
   ===================================================== */

function playOutroFromSlider() {

    var slider =
        getElement(
            'outroSecondsSlider'
        );


    var seconds =
        APP_SETTINGS.outroDefault;


    if (slider) {

        seconds =
            parseFloat(
                slider.value
            );
    }


    playOutro(seconds);
}


/* =====================================================
   イントロ秒数表示更新
   ===================================================== */

function updateIntroSecondsDisplay() {

    var slider =
        getElement(
            'introSecondsSlider'
        );


    var display =
        getElement(
            'introSecondsDisplay'
        );


    if (
        slider
        && display
    ) {

        display.textContent =
            formatSeconds(
                slider.value
            );
    }
}


/* =====================================================
   アウトロ秒数表示更新
   ===================================================== */

function updateOutroSecondsDisplay() {

    var slider =
        getElement(
            'outroSecondsSlider'
        );


    var display =
        getElement(
            'outroSecondsDisplay'
        );


    if (
        slider
        && display
    ) {

        display.textContent =
            formatSeconds(
                slider.value
            );
    }
}
