/* =====================================================
   げんじぶツール Ver.2
   lyrics.js

   歌割カードの表示処理を管理します。

   シート1の想定形式：
   ［空・空、要］歌詞
   ［要・杢代］歌詞
   ［両・空、要↓］歌詞

   表示例：
   歌詞 (空・要)
   歌詞 (杢代)
   歌詞 (空・要↓)

   文字色：
   空 → あなたの文字色
   要 → ご友人の文字色
   両 → 2人パートの文字色

   依存ファイル：
   common.js
   parser.js
   ===================================================== */


/* =====================================================
   パート文字色取得
   ===================================================== */

function getPartStyle(utariwake) {

    var part =
        String(utariwake || '')
            .trim();


    var utaiClass =
        'utai-futari';


    if (part === '空') {

        utaiClass =
            'utai-jibun';

    } else if (part === '要') {

        utaiClass =
            'utai-aite';

    } else if (part === '両') {

        utaiClass =
            'utai-futari';
    }


    return {

        className:
            utaiClass
    };
}


/* =====================================================
   歌唱メンバー表記生成
   ===================================================== */

/*
   入力：

   空、要

   出力：

   (空・要)


   入力：

   空、要↓

   出力：

   (空・要↓)


   入力：

   全員

   出力：

   (全員)
*/

function formatMemberLabel(memberRaw) {

    var raw =
        String(memberRaw || '')
            .trim();


    if (!raw) {

        return '';
    }


    if (raw === '全員') {

        return '(全員)';
    }


    var members =

        raw.split(/[、,]/)

            .map(function(name) {

                return name.trim();
            })

            .filter(Boolean);


    if (!members.length) {

        return '';
    }


    return '('
        + members.join('・')
        + ')';
}


/* =====================================================
   歌割タグ解析
   ===================================================== */

/*
   例：

   ［空・空、要↓］君と歩いていこう

   ↓

   {
       part: "空",
       members: "空、要↓",
       lyric: "君と歩いていこう"
   }
*/

function parseUtariPart(text) {

    var value =
        String(text || '');


    var match =

        value.match(

            /^＝*［([^・]+)・([^］]+)］(.*)$/

        );


    if (!match) {

        return null;
    }


    return {

        part:
            match[1].trim(),

        members:
            match[2].trim(),

        lyric:
            match[3]
    };
}


/* =====================================================
   歌割1パート分のHTML生成
   ===================================================== */

function createUtariPartHtml(partText) {

    var parsed =
        parseUtariPart(partText);


    /*
       歌割タグとして解析できない場合は
       通常テキストとして表示します。
    */

    if (!parsed) {

        return '<span class="part-span" '
            + 'style="color:#888888;">'
            + escapeHtml(partText)
            + '</span>';
    }


    var style =
        getPartStyle(
            parsed.part
        );


    var memberLabel =
        formatMemberLabel(
            parsed.members
        );


    var html =

        '<span class="part-span '
        + style.className
        + '">';


    /*
       歌詞を先に表示します。
    */

    html +=
        escapeHtml(
            parsed.lyric
        );


    /*
       7人の歌唱メンバー名は
       歌詞の後ろへ表示します。
    */

    if (memberLabel) {

        html +=

            '<span class="member-label member-label-after">'

            + escapeHtml(
                memberLabel
            )

            + '</span>';
    }


    html += '</span>';


    return html;
}


/* =====================================================
   歌割1行分のHTML生成
   ===================================================== */

function createUtariLineHtml(line) {

    var clean =
        String(line || '')
            .trim();


    /*
       空行は改行として残します。
    */

    if (!clean) {

        return '<br>';
    }


    /*
       歌割タグがない行は
       通常テキストとして表示します。
    */

    if (
        clean.indexOf('［')
        === -1
    ) {

        return '<div class="lyrics-line" '
            + 'style="color:#888888;">'
            + escapeHtml(clean)
            + '</div>';
    }


    /*
       1行に複数の歌割タグがある場合にも対応します。
    */

    var parts =

        clean.split(

            /(＝*［[^］]+］[^［]*)/g

        )

            .filter(Boolean);


    var html =
        '<div class="lyrics-line">';


    parts.forEach(function(part) {

        html +=
            createUtariPartHtml(part);
    });


    html += '</div>';


    return html;
}


/* =====================================================
   歌割カード表示
   ===================================================== */

function displayLyrics() {

    var selector =
        getElement(
            'songSelector'
        );


    var area =
        getElement(
            'lyricsArea'
        );


    if (
        !selector
        || !area
    ) {

        return;
    }


    var title =
        selector.value;


    /*
       曲が未選択の場合
    */

    if (!title) {

        area.innerHTML =

            '<div class="empty-message">'
            + '上のプルダウンから曲を選んでね！'
            + '</div>';


        return;
    }


    var html =

        '<h2 class="song-title">🎵 '

        + escapeHtml(title)

        + '</h2>';


    var rawText =
        songData[title]
        || '';


    var lines =

        rawText.split(

            /\r\n|\n|\r/

        );


    lines.forEach(function(line) {

        html +=
            createUtariLineHtml(line);
    });


    area.innerHTML =
        html;
}
