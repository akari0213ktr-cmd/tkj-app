/* =====================================================
   げんじぶツール Ver.2
   config.js

   アプリ全体で使用する設定値を管理します。
   秒数・歌詞ドンの文字数・スプレッドシート情報などを
   変更したい場合は、基本的にこのファイルを編集します。
   ===================================================== */


/* =====================================================
   Googleスプレッドシート設定
   ===================================================== */

var PUB_ID =
    '2PACX-1vQ62QQm7gEsWNSLW1-3KXvFH1uQ5mSkglMcIUhxi115_7xnpIJB5FFZNlvZlwLQhoEuGV75D-d5NKnO';


/* ---------- シートGID ---------- */

var SHEET_GIDS = {

    /* シート1：歌割 */
    utari: '0',

    /* シート2：イントロ・アウトロ・3曲MIX */
    intro: '748753405',

    /* シート3：歌詞ドン */
    lyric: '673138966'

};


/* =====================================================
   CSV URL生成
   ===================================================== */

/*
   キャッシュ対策としてURL末尾に現在時刻を付けています。

   Googleスプレッドシートを更新したあとにページを再読み込みすると、
   最新データを取得しやすくなります。
*/

function createSheetCsvUrl(gid) {

    return 'https://docs.google.com/spreadsheets/d/e/'
        + PUB_ID
        + '/pub?gid='
        + gid
        + '&output=csv&t='
        + new Date().getTime();

}


/* ---------- 各シートURL ---------- */

var utariUrl = createSheetCsvUrl(SHEET_GIDS.utari);

var introUrl = createSheetCsvUrl(SHEET_GIDS.intro);

var lyricUrl = createSheetCsvUrl(SHEET_GIDS.lyric);


/* =====================================================
   アプリ設定
   ===================================================== */

var APP_SETTINGS = {

    /* ---------- イントロドン ---------- */

    /* 最小秒数 */
    introMin: 1,

    /* 最大秒数 */
    introMax: 10,

    /* 最初に表示する秒数 */
    introDefault: 1,

    /* スライダーの刻み幅 */
    introStep: 0.5,


    /* ---------- アウトロドン ---------- */

    /* 最小秒数 */
    outroMin: 3,

    /* 最大秒数 */
    outroMax: 10,

    /* 最初に表示する秒数 */
    outroDefault: 5,

    /* スライダーの刻み幅 */
    outroStep: 0.5,


    /* ---------- 歌詞ドン ---------- */

    /* 目標文字数 */
    lyricTargetLength: 10,

    /* 最小文字数 */
    lyricMinLength: 8,

    /* 最大文字数 */
    lyricMaxLength: 12

};


/* =====================================================
   メンバーカラー
   ===================================================== */

/*
   歌割データ内の色名をCSS変数へ変換するための対応表です。

   この色は7人のメンバー表示などで使用します。

   あかりさん・ご友人・2人パートの文字色は、
   css/style.css の

   --my-color
   --friend-color
   --both-color

   で管理します。
*/

var colorMap = {

    '白': 'var(--color-white)',
    '白色': 'var(--color-white)',

    '黄': 'var(--color-yellow)',
    '黄色': 'var(--color-yellow)',

    'ピンク': 'var(--color-pink)',

    '青': 'var(--color-blue)',

    '赤': 'var(--color-red)',

    '緑': 'var(--color-green)',

    '紫': 'var(--color-purple)'

};
