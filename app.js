'use strict';
// require : Node.jsのモジュール('fs', 'readline'など)をメモリ上に読み込んで利用可能にする
const fs = require('fs');   //fs(FileSystem)モジュール : ファイルを扱うためのモジュール
const readline = require('readline'); //readlineモジュール：ファイルを一行ずつ読み込むためのモジュール

const rs = fs.createReadStream('./popu-pref.csv');  //指定ファイルを読み込める状態にする
const rl = readline.createInterface({input: rs, outpu: {}}); //readingモジュールにrs(読み込みファイル)を設定する

// 都道府県をkeyにして、関連データを読み出せる連想配列の箱を用意する
const prefectureDataMap = new Map();    //([key]都道府県, [value]集計データのオブジェクト)


// rlオブジェクトで'line'イベントが発生したら、この無名関数を読む
// ↓これと同じ
// function lineOut(lineString){
//     console.log(lineString);
// }
// rl.on('line', lineOut(lineString));
rl.on('line', lineString => {
    // console.log('-----------------------');
    // console.log(lineString);

    //読み込んだ1行(lineString)を「,」でデータを分割する
    const columns = lineString.split(',');  //columns = ["2010","北海道","237155","258530"]のようなデータ配列に分割

    // 必要なデータだけ抜き出し
    const year = parseInt(columns[0]);  //集計年(文字列->数字(Int)に変換)
    const prefecture = columns[1];      //都道府県名
    const popu = parseInt(columns[3]);  //15〜19歳の人口(文字列->数字(Int)に変換)

    // yearが2010, 2015のデータのみ抜き出し(タイトル行は違うので抜き出されない)
    if(year === 2010 || year === 2015){

        // prefectureDataMapに指定した都道府県があるか？を確認
        let value = prefectureDataMap.get(prefecture);
        if(!value){     //データがない場合
            // 初期化
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }

        if(year === 2010){
            value.popu10 = popu;
        }
        else if(year === 2015){
            value.popu15 = popu
        }
        prefectureDataMap.set(prefecture, value);   //prefectureDataMapの形式がここで決まっている
    }
});


rl.on('close', () => {
    // 2010->2015の人口変化率の計算
    for(let [key, data] of prefectureDataMap){  //prefectureDataMapの全てのデータに対して実行
        data.change = data.popu15 / data.popu10; //変化率の代入
    }

    // データを変化率ごとに並び替える
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });

    // 表示の整形
    const rankingStrings = rankingArray.map(([key, value]) => {
        return(`${key}：${value.popu10}人=>${value.popu15}人 　変化率：${value.change}`);
    });
    console.log(rankingStrings);
});