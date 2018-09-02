'use strict';

const fs = require('fs');
// 一行ずつ読み込むモジュール
const readline = require('readline');
// ファイルを読み込むためのストリームを作成
const rs = fs.createReadStream('./popu-pref.csv');
// readlineオブジェクトのinputとして設定
const rl = readline.createInterface({ 'input': rs, 'output': {} });
// key: 都道府県 value: 集計データのオブジェクト
const map = new Map();

// lineイベントを発生させる
rl.on('line', (linestring) => {
   // カンマで分割して配列に格納
   const columns = linestring.split(',');
   // 集計年、都道府県、15~19歳の人口のデータを数値（整数）で保存
   const year = parseInt(columns[0]);
   const prefecture = columns[2];
   const popu = parseInt(columns[7]);
   if (year === 2010 || year === 2015) {
      let value = map.get(prefecture);
      if (!value) {
         value = {
            popu10: 0,
            popu15: 0,
            change: null
         };
      }
      if (year === 2010) {
         value.popu10 += popu;
      }
      if (year === 2015) {
         value.popu15 += popu;
      }
      map.set(prefecture, value);
   }

});
// ストリームに情報を流し始める処理
rl.resume();
rl.on('close', () => {
   for (let keyAndValue of map) { // keyAndValue　の添え字 0 にキー、 1 に値が入っている
      const value = keyAndValue[1];
      value.change = value.popu15 / value.popu10;
   }
   const rankingArray = Array.from(map).sort((pair1, pair2) => {
      return pair2[1].change - pair1[1].change;
   });
   const rankingStrings = rankingArray.map((keyAndValue) => {
      return keyAndValue[0] + ': ' + keyAndValue[1].popu10 + '=>' + keyAndValue[1].popu15 + ' 変化率:' + keyAndValue[1].change;
   });
   console.log(rankingStrings);
});
