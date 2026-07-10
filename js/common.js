/* =====================================================
   げんじぶツール Ver.2
   common.js

   複数の機能から使用する共通処理を管理します。
   ===================================================== */


/* =====================================================
   秒数表示
   ===================================================== */

/*
   1.0 → "1"
   1.5 → "1.5"

   のように、整数の場合は小数点を表示しません。
*/

function formatSeconds(value) {

    var num = parseFloat(value);

    if (isNaN(num)) {
        return String(value);
    }

    if (Math.abs(num - Math.round(num)) < 0.001) {
        return String(Math.round(num));
    }

    return String(num);
}


/* =====================================================
   HTMLエスケープ
   ===================================================== */

/*
   スプレッドシートの曲名や歌詞を
   HTMLへ安全に表示するために使用します。
*/

function escapeHtml(value) {

    return String(value == null ? '' : value)

        .replace(/&/g, '&amp;')

        .replace(/</g, '&lt;')

        .replace(/>/g, '&gt;')

        .replace(/"/g, '&quot;')

        .replace(/'/g, '&#039;');
}


/* =====================================================
   ランダム抽出
   ===================================================== */

/*
   配列から重複なしで指定個数をランダム抽出します。

   3曲MIXドンで使用します。
*/

function pickRandomItems(list, count) {

    var copy = list.slice();

    var result = [];


    while (
        copy.length > 0
        && result.length < count
    ) {

        var index =
            Math.floor(
                Math.random() * copy.length
            );

        result.push(
            copy.splice(index, 1)[0]
        );
    }


    return result;
}


/* =====================================================
   YouTube動画ID取得
   ===================================================== */

/*
   以下の形式に対応します。

   通常URL
   youtu.be
   embed
   shorts
   live

   YouTube MusicのURLでも、
   URL内に v=動画ID が存在すれば取得できます。
*/

function extractVideoId(url) {

    try {

        var parsedUrl = new URL(url);


        /* 通常URL・YouTube Music */

        var videoId =
            parsedUrl.searchParams.get('v');

        if (videoId) {
            return videoId;
        }


        /* youtu.be */

        if (
            parsedUrl.hostname.indexOf('youtu.be') !== -1
        ) {

            return parsedUrl.pathname
                .substring(1)
                .split('/')[0];
        }


        /* embed */

        if (
            parsedUrl.pathname.indexOf('/embed/') !== -1
        ) {

            return parsedUrl.pathname
                .split('/embed/')[1]
                .split('/')[0];
        }


        /* shorts */

        if (
            parsedUrl.pathname.indexOf('/shorts/') !== -1
        ) {

            return parsedUrl.pathname
                .split('/shorts/')[1]
                .split('/')[0];
        }


        /* live */

        if (
            parsedUrl.pathname.indexOf('/live/') !== -1
        ) {

            return parsedUrl.pathname
                .split('/live/')[1]
                .split('/')[0];
        }


        return null;


    } catch (error) {

        return null;
    }
}


/* =====================================================
   DOM取得
   ===================================================== */

/*
   IDから要素を取得します。

   画面切り替えによって存在しない要素があるため、
   毎回必要なタイミングで取得します。
*/

function getElement(id) {

    return document.getElementById(id);
}


/* =====================================================
   テキスト変更
   ===================================================== */

/*
   指定したIDの要素が存在する場合だけ
   textContentを変更します。
*/

function setText(id, text) {

    var element = getElement(id);

    if (element) {
        element.textContent = text;
    }
}


/* =====================================================
   HTML変更
   ===================================================== */

/*
   指定したIDの要素が存在する場合だけ
   innerHTMLを変更します。
*/

function setHtml(id, html) {

    var element = getElement(id);

    if (element) {
        element.innerHTML = html;
    }
}


/* =====================================================
   表示
   ===================================================== */

function showElement(id) {

    var element = getElement(id);

    if (element) {
        element.style.display = 'block';
    }
}


/* =====================================================
   非表示
   ===================================================== */

function hideElement(id) {

    var element = getElement(id);

    if (element) {
        element.style.display = 'none';
    }
}


/* =====================================================
   disabled切り替え
   ===================================================== */

function setDisabled(id, disabled) {

    var element = getElement(id);

    if (element) {
        element.disabled = disabled;
    }
}
