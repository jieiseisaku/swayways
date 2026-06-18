# SWAY WAYS

アナグラムを矢印でつなぐゲーム。最終形はブラウザで動作。開発は Vite。

## 開発（編集・データ差し替え重視）
```bash
npm install      # 初回のみ
npm run dev      # http://localhost:5173 で起動（保存即反映 / HMR）
```
- `src/data/*.json` や `src/main.js` を編集すると即反映されます。

## ビルド（配布用）
```bash
npm run build    # dist/ に書き出し
npm run preview  # ビルド結果をローカル確認
```
- `dist/index.html` は **自己完結の単一HTML**（JS/CSS を内包）。
- `dist/hint_*.svg`（ヒント/勝利イラスト）は実行時に参照するため index.html と同じ場所に置きます。
- 配布は `dist/` フォルダごと（任意のWebサーバや静的ホスティングで公開可、ローカルでも `index.html` を開けば動作）。

## 調整ポイント
- `src/data/config.json` … タイマー秒数 / ヒント（回数・表示秒・倍率・フォーカス）/ 矢印の幾何（太さ・湾曲・反発）/ マーカー径 / 浮遊量 / 文字コリジョン / タイトル・ゲームの語。
- `src/data/quizzes.json` … クイズ（アナグラム）の登録一覧。

## データ / アセット
- `src/data/glyphs.json` … アルファベット字形（`alphabets.svg` から抽出）。
- `src/data/texts.json` … UI単語の字形（`text.svg` から抽出：HINT / SWAY / WAYS / CLEAR / EXIT / START / READY?）。
- `public/hint_step-pets*.svg` … ヒント/勝利イラスト（赤のみ / 緑のみ / 両方）。

## 構成
```
index.html          エントリ（盤面のSVGマークアップ）
src/main.js         ゲーム本体（矢印エンジン・シーン・入力）
src/style.css       スタイル
src/data/           config / quizzes / glyphs / texts（JSON）
public/             実行時に参照するSVGアセット
vite.config.js      ビルド設定（vite-plugin-singlefile）
```

## 今後の整備予定
- `src/` をシーン別に分割（title / play / clear / gameover）し、矢印エンジンを `engine/` に切り出し。
- エディタモード：クイズを登録 → `quizzes.json` を書き出し/読み込み → ゲームで順次再生。
- `letters-arrows.html` は旧エディタ（別ツール。上記エディタへ統合予定）。

## メモ
- `alphabets.svg` は現在0バイト（記録用。字形は `glyphs.json` に取り込み済みのため動作に影響なし。再編集時に再保存）。
