// 調整値（テキストエディタで編集できます）
window.CONFIG = {
  titleWords: { green: "SWAY", red: "WAYS" },   // タイトルロゴの語（常にSWAY/WAYS）
  gameWords:  { green: "STEP", red: "PETS" },    // READY?で始まるクイズ

  timerSeconds: 120,   // カウントダウン（5問通しで1本）
  runQuizzes: 5,       // 1ランの問題数（登録から毎回ランダム）
  clearBonus: 10,      // 1問クリアごとに加算される秒数
  nextMs: 1500,        // NEXT のプログレスバー時間（次の問題開始まで）
  hintCount: 3,        // ヒント回数（1問ごとにリセット）
  hintMs: 5000,        // 1回の表示秒
  hintScale: 4,        // ヒントの拡大率（400%固定）
  // 盤面座標の各色コンテンツ範囲 [x,y,w,h]。ヒントはこの範囲内でランダムに寄せ、過半数が画面に入るようにする
  hintBox: {
    red:   [109.9, 186.6, 1193.1, 556.0],
    green: [651.1, 407.3,  695.0, 319.2],
    both:  [109.9, 186.6, 1236.2, 556.0]
  },

  geom: {
    headH: 38.7, headHalf: 38.75, stroke: 13, outline: 4,
    gapR: 66, laneM: 34, bowK: 0.34,
    headHead: 72, headShaft: 36, shaftBack: 0.85
  },

  marker: { circlePx: 16, diamondPx: 18, offsetY: 20 },
  letterCollision: 1.25,
  floatAmpMin: 5, floatAmpMax: 10
};
