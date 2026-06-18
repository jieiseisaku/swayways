# SWAY WAYS

アナグラムを矢印でつなぐゲーム。**ビルド不要の静的サイト**（HTML + CSS + 素のJS）。
ローカルはダブルクリックで動作し、GitHub Pages にそのまま公開できます。

## 動かす（ターミナル不要）
- ローカル確認: `index.html` を**ダブルクリック**してブラウザで開くだけ。修正したらブラウザを**リロード**で反映。
- 公開: GitHub に push → GitHub Pages が自動で配信（ビルド工程なし）。

### GitHub Pages の設定（初回のみ）
1. GitHub のリポジトリ → **Settings → Pages**
2. **Source: Deploy from a branch** → **Branch: `main` / `(root)`** → Save
3. 数十秒後、`https://jieiseisaku.github.io/swayways/` で公開されます。

> 限定公開について: 無料プランの Pages は公開URL（URLを知っていれば誰でも閲覧可。検索には載りにくい）です。
> 完全な限定公開が必要なら、プライベートリポジトリ＋有料プランの Pages アクセス制御、または Netlify 等のパスワード保護を利用します。

### 更新サイクル
ローカルで修正 → ダブルクリックで確認 → `git add -A && git commit -m "..." && git push`（GitHub Desktop でもOK）→ Pages に反映。

## 調整ポイント（テキストエディタで編集）
- `config.js` … タイマー秒数 / ヒント（回数・秒・倍率・フォーカス）/ 矢印の幾何 / マーカー径 / 浮遊量 / 文字コリジョン / タイトル・ゲームの語。
- `quizzes.js` … クイズ（アナグラム）の登録一覧。`window.QuizStore.export()/import()` でJSON入出力。

## データ / アセット
- `glyphs.js` … アルファベット字形（`alphabets.svg` から抽出した window.GLYPHS）。
- `texts.js` … UI単語の字形（`text.svg` から抽出：HINT / SWAY / WAYS / CLEAR / EXIT / START / READY?）。
- `hint_step-pets*.svg` … ヒント/勝利イラスト（赤のみ / 緑のみ / 両方）。

## 構成
```
index.html     エントリ（盤面SVG＋各スクリプトを読み込み）
style.css      スタイル
config.js      調整値（window.CONFIG）
quizzes.js     クイズ登録＋JSON入出力（window.QUIZZES / QuizStore）
glyphs.js      字形データ（window.GLYPHS）
texts.js       UI単語データ（window.TEXTS）
main.js        ゲーム本体（矢印エンジン・シーン・入力）
hint_*.svg     ヒント/勝利イラスト
```
すべて通常の `<script src>`（モジュール不使用）なので、サーバもビルドも不要です。

## 今後
- `main.js` をシーン別（title / play / clear / gameover）に整理。
- エディタモード：クイズ登録 → `quizzes.json` 入出力 → ゲームで順次再生。
- `letters-arrows.html` は旧エディタ（別ツール。統合予定）。
- 字形を再生成したいとき: `alphabets.svg` / `text.svg` を更新 → 抽出スクリプトで `glyphs.js` / `texts.js` を作り直し（手順は別途用意可）。
