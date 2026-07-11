/* =====================================================
   げんじぶツール Ver.2
   parser.js

   Googleスプレッドシートから取得したCSVデータの解析と、
   歌詞ドン用フレーズの生成処理を管理します。

   依存ファイル：
   config.js
   common.js
   ===================================================== */


/* =====================================================
   CSV解析
   ===================================================== */

function splitCSV(text) {

    var lines = [];
    var row = [];
    var inQuotes = false;
    var field = '';

    for (var i = 0; i < text.length; i++) {

        var c = text[i];
        var next = text[i + 1];

        if (c === '"') {

            if (inQuotes && next === '"') {

                field += '"';
                i++;

            } else {

                inQuotes = !inQuotes;
            }

        } else if (c === ',' && !inQuotes) {

            row.push(field);
            field = '';

        } else if (
            (c === '\r' || c === '\n')
            && !inQuotes
        ) {

            if (c === '\r' && next === '\n') {
                i++;
            }

            row.push(field);
            lines.push(row);

            row = [];
            field = '';

        } else {

            field += c;
        }
    }


    if (field || row.length > 0) {

        row.push(field);
        lines.push(row);
    }


    return lines;
}


/* =====================================================
   シート1：歌割データ解析
   ===================================================== */

function parseUtariCSV(text) {

    var lines = splitCSV(text);

    songList = [];
    songData = {};


    /*
       直前に読み込んだ曲名を記憶します。

       スプレッドシートでA列が空欄の行でも、
       直前の曲の歌詞として扱えるようにします。
    */

    var currentTitle = null;


    for (var i = 1; i < lines.length; i++) {

        var cols = lines[i] || [];


        var title =
            cols[0]
                ? cols[0].trim()
                : '';


        var yomi =
            cols[1]
                ? cols[1].trim()
                : '';


        var lyrics =
            cols.length >= 3
                ? cols[2]
                : '';


        /*
           A列に曲名がある場合は、
           新しい曲の開始として扱います。
        */

        if (title) {

            currentTitle = title;


            if (!songData[currentTitle]) {

                songData[currentTitle] = lyrics;


                songList.push({

                    title:
                        currentTitle,

                    yomi:
                        yomi
                            ? yomi
                            : currentTitle
                });

            } else {

                songData[currentTitle] +=
                    '\n' + lyrics;
            }


            continue;
        }


        /*
           A列が空欄の場合。

           直前の曲が存在すれば、
           その曲の続きとして扱います。

           C列も空欄なら "\n" だけ追加されるため、
           スプレッドシートの空行がアプリにも残ります。
        */

        if (currentTitle) {

            songData[currentTitle] +=
                '\n' + lyrics;
        }
    }


    songList.sort(function(a, b) {

        return a.yomi.localeCompare(

            b.yomi,

            'ja',

            {
                numeric: true
            }
        );
    });
}

/* =====================================================
   シート2：イントロ・アウトロ・3曲MIX
   ===================================================== */

function parseIntroCSV(text) {

    var lines = splitCSV(text);

    quizList = [];


    for (var i = 1; i < lines.length; i++) {

        var cols = lines[i];

        if (!cols || cols.length < 3) {
            continue;
        }


        var title = cols[0].trim();

        var artist = cols[1].trim();

        var youtubeUrl = cols[2].trim();


        var videoId =
            extractVideoId(youtubeUrl);


        if (title && videoId) {

            quizList.push({

                title: title,

                artist: artist,

                videoId: videoId
            });
        }
    }
}


/* =====================================================
   シート3：歌詞ドン
   ===================================================== */

function parseLyricCSV(text) {

    var lines = splitCSV(text);

    lyricQuizList = [];

    remainingLyricQuizList = [];


    for (var i = 1; i < lines.length; i++) {

        var cols = lines[i];

        if (!cols || cols.length < 3) {
            continue;
        }


        var title = cols[0].trim();

        var lyrics = cols[2];


        if (!title || !lyrics) {
            continue;
        }


        var phrases =
            createLyricPhrases(lyrics);


        phrases.forEach(function(phrase) {

            lyricQuizList.push({

                title: title,

                lyric: phrase
            });
        });
    }
}


/* =====================================================
   歌詞クリーニング
   ===================================================== */

function cleanLyricLine(line) {

    if (!line) {
        return '';
    }


    var clean =
        String(line).trim();


    if (!clean) {
        return '';
    }


    /*
       歌割タグ・注釈・装飾などを削除します。
    */

    clean =
        clean.replace(/＝*［[^］]+］/g, ' ');

    clean =
        clean.replace(/【[^】]*】/g, ' ');

    clean =
        clean.replace(/\[[^\]]*\]/g, ' ');

    clean =
        clean.replace(/（[^）]*）/g, ' ');

    clean =
        clean.replace(/\([^)]*\)/g, ' ');

    clean =
        clean.replace(/[「」『』“”"']/g, '');

    clean =
        clean.replace(/[♪☆★♡♥]/g, ' ');

    clean =
        clean.replace(/\s+/g, ' ').trim();


    if (!clean) {
        return '';
    }


    /*
       クレジット情報を問題文にしないよう除外します。
    */

    if (
        clean.indexOf('作詞') !== -1
        || clean.indexOf('作曲') !== -1
        || clean.indexOf('編曲') !== -1
    ) {

        return '';
    }


    return clean;
}


/* =====================================================
   表示文字数取得
   ===================================================== */

function visibleLength(text) {

    return Array.from(

        String(text || '')

            .replace(/\s+/g, '')

            .trim()

    ).length;
}


/* =====================================================
   空白除去
   ===================================================== */

function compactText(text) {

    return String(text || '')

        .replace(/\s+/g, '')

        .trim();
}


/* =====================================================
   歌詞を自然な区切りへ分割
   ===================================================== */

function splitLyricClauses(lyrics) {

    var normalized =

        String(lyrics || '')

            .replace(/\r\n/g, '\n')

            .replace(/\r/g, '\n')

            .replace(/[。！？!?]/g, '$&\n')

            .replace(/[、，,]/g, '$&\n')

            .replace(/[／/]/g, '\n')

            .replace(/[〜～]/g, '$&\n');


    return normalized

        .split(/\n+/)

        .map(cleanLyricLine)

        .filter(Boolean);
}


/* =====================================================
   日本語単語分割
   ===================================================== */

function segmentJapanese(text) {

    var clean =
        compactText(text);


    if (!clean) {
        return [];
    }


    /*
       対応ブラウザではIntl.Segmenterを使用し、
       できるだけ単語の途中で切れないようにします。
    */

    if (
        typeof Intl !== 'undefined'
        && Intl.Segmenter
    ) {

        var segmenter =

            new Intl.Segmenter(

                'ja-JP',

                {
                    granularity: 'word'
                }
            );


        return Array.from(

            segmenter.segment(clean)

        )

            .map(function(part) {

                return part.segment;
            })

            .filter(function(part) {

                return part
                    && part.trim();
            });
    }


    /*
       Intl.Segmenter非対応ブラウザでは
       1文字単位へ分割します。
    */

    return Array.from(clean);
}


/* =====================================================
   歌詞候補追加
   ===================================================== */

function addPhraseCandidate(

    store,

    phrase,

    targetLen,

    minLen,

    maxLen

) {

    var clean =

        compactText(

            cleanLyricLine(phrase)
        );


    var len =
        visibleLength(clean);


    if (
        !clean
        || len < minLen
        || len > maxLen
    ) {

        return;
    }


    /*
       数字だけの候補は除外します。
    */

    if (/^[0-9０-９]+$/.test(clean)) {
        return;
    }


    /*
       記号だけの候補は除外します。
    */

    if (/^[、。，,.!?！？]+$/.test(clean)) {
        return;
    }


    /*
       目標文字数との差をスコアにします。
       10文字に近いほど優先されます。
    */

    var score =
        Math.abs(len - targetLen);


    /*
       ひらがなだけの短い文章は
       少し優先度を下げます。
    */

    if (/^[ぁ-んー]+$/.test(clean)) {

        score += 1.5;
    }


    /*
       単独では問題として分かりにくい語句の
       優先度を下げます。
    */

    if (
        /^(それ|これ|あれ|だけ|でも|まだ|もう|そして|だから|ように|ここで)$/
            .test(clean)
    ) {

        score += 5;
    }


    if (
        !store[clean]
        || score < store[clean].score
    ) {

        store[clean] = {

            text: clean,

            score: score
        };
    }
}


/* =====================================================
   単語単位でフレーズ候補生成
   ===================================================== */

function buildPhraseWindows(

    clause,

    targetLen,

    minLen,

    maxLen,

    store

) {

    var tokens =
        segmentJapanese(clause);


    if (!tokens.length) {
        return;
    }


    for (
        var start = 0;
        start < tokens.length;
        start++
    ) {

        var phrase = '';


        for (
            var end = start;
            end < tokens.length;
            end++
        ) {

            phrase += tokens[end];


            var len =
                visibleLength(phrase);


            if (len > maxLen) {
                break;
            }


            if (len >= minLen) {

                addPhraseCandidate(

                    store,

                    phrase,

                    targetLen,

                    minLen,

                    maxLen
                );
            }
        }
    }
}


/* =====================================================
   歌詞ドン問題候補生成
   ===================================================== */

function createLyricPhrases(lyrics) {

    var TARGET_LEN =
        APP_SETTINGS.lyricTargetLength;

    var MIN_LEN =
        APP_SETTINGS.lyricMinLength;

    var MAX_LEN =
        APP_SETTINGS.lyricMaxLength;


    var store = {};


    if (!lyrics) {
        return [];
    }


    var clauses =
        splitLyricClauses(lyrics);


    clauses.forEach(function(clause) {

        /*
           単語単位で候補生成
        */

        buildPhraseWindows(

            clause,

            TARGET_LEN,

            MIN_LEN,

            MAX_LEN,

            store
        );


        /*
           空白区切りの歌詞にも対応
        */

        clause

            .split(/\s+/)

            .forEach(function(chunk) {

                addPhraseCandidate(

                    store,

                    chunk,

                    TARGET_LEN,

                    MIN_LEN,

                    MAX_LEN
                );
            });
    });


    var phrases =

        Object.keys(store)

            .map(function(key) {

                return store[key];
            })

            .sort(function(a, b) {

                return a.score - b.score;
            })

            .map(function(item) {

                return item.text;
            });


    /*
       候補が1件も作れなかった場合のみ、
       文字単位で候補を作成します。
    */

    if (phrases.length === 0) {

        var fallback =

            compactText(

                cleanLyricLine(lyrics)
            );


        var chars =
            Array.from(fallback);


        for (
            var i = 0;
            i < chars.length;
            i += 4
        ) {

            for (
                var len = MIN_LEN;
                len <= MAX_LEN;
                len++
            ) {

                if (
                    i + len
                    <= chars.length
                ) {

                    addPhraseCandidate(

                        store,

                        chars

                            .slice(i, i + len)

                            .join(''),

                        TARGET_LEN,

                        MIN_LEN,

                        MAX_LEN
                    );
                }
            }
        }


        phrases =

            Object.keys(store)

                .map(function(key) {

                    return store[key];
                })

                .sort(function(a, b) {

                    return a.score - b.score;
                })

                .map(function(item) {

                    return item.text;
                });
    }


    return phrases;
}
