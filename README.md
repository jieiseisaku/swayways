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

## アナグラムエディタ（GUI）
`editor.html` を**ダブルクリック**で起動（`EXIT` でゲーム `index.html` に戻る）。
- **EDIT 画面**: 緑・赤の2語を入力 → `SAVE`（アナグラム成立かつ実在語のとき有効。CMD+ENTER 可）。`SWAP` で左右入替。`IMPORT SVG` は保存後に有効で、選んだ図を `green-red.svg` にリネームしてDL（`svg/` に置く）。
- **LIST 画面**: 登録一覧。`EDIT(E)` / `SWAP(S)` / `DELETE(delete)`、並べ替え `NEW-OLD / A-Z / SHORT-LONG`（再クリックで逆順）。上下キーで選択。
- **入出力**: `SAVE TO JS`（`quizzes.js` を書き出し）/ `EXPORT JSON` / `LOAD JSON`。書き出した `quizzes.js` で差し替えればゲームに反映。
- 単語チェックは `words.js`（英単語リスト）を使用。エディタのみ読み込み（ゲーム本体は不使用）。

## レイアウトエディタ（GUI）
`layout-editor.html` を**ダブルクリック**で起動。Unity/GameMaker/Figma 風に、配置・文字組み・モーションを画面で調整。
- 上部: 画面タブ、`↶Undo / ↷Redo`（履歴50・Cmd/Ctrl+Z、Shift+Zで戻る/進む）、`▶ Preview`、`⤓ Export layout.js`。
- `▶ Preview`: 編集中の値で実ページ（index.html / editor.html）を読み込み、hover・クリック・スライド等の実挙動を確認（編集不可）。もう一度押すと編集に戻る。
- 数値入力は Enter / フォーカス外で確定。色はピッカーを閉じた（色域外クリック）ときに確定。
- 画面タブ: ゲーム（Title / Playing / Hint / Clear / Over）＋ エディタ（Editor-EDIT / Editor-LIST）の全シーケンス。プレイ中の下部UI（進捗 SWAY/WAYS・タイマー・下線）も配置可能。
- 中央: 1920×1080 ステージ内に 1456×819 フレーム。要素をドラッグ（矢印キーで1px / Shift+10px）。
- 左: 要素一覧。右: 選択要素のプロパティ（x/y/size/color/align/text/w/h）＋ Typography（字間・行間）＋ Motion（slide ms・ease・hover）。
- 調整したら `Export layout.js` → ダウンロードした `layout.js` をプロジェクトに差し替え → index/editor に反映。
- 値は `layout.js`（`window.LAYOUT`）が単一ソース。index.html(ゲーム) と editor.html がこれを読む。

## 調整ポイント（テキストエディタで編集）
- `config.js` … タイマー秒数 / ヒント（回数・秒・倍率・フォーカス）/ 矢印の幾何 / マーカー径 / 浮遊量 / 文字コリジョン / タイトル・ゲームの語。
- `quizzes.js` … クイズ登録（`id` / `green` / `red` / `hint` / `animation`）と図のパス解決（`window.QUIZ`）・入出力（`window.QuizStore`）。図SVGは `svg/` フォルダで管理。

## データ / アセット
- `glyphs.js` … アルファベット字形（`alphabets.svg` から抽出した window.GLYPHS）。アンカーは `alphabets.svg` のピンク線（アセンダ/ディセンダ）の中央線を基準。ピンク線はフォントに含めない。
- `texts.js` … UI単語の字形（`text.svg` から抽出：HINT / SWAY / WAYS / CLEAR / EXIT / START / READY?）。
- `svg/hint_step-pets*.svg` … ヒント/勝利イラスト（赤のみ / 緑のみ / 両方）。図SVGはすべて `svg/` フォルダで管理。
- `words.js` … 英単語リスト（エディタの単語チェック用）。

## 構成
```
index.html        エントリ（盤面SVG＋各スクリプトを読み込み）
editor.html       アナグラムエディタ（GUI。登録・編集・並べ替え・入出力）
layout-editor.html レイアウトエディタ（配置/文字組み/モーションをGUI調整→layout.js書き出し）
layout.js         配置/モーション/タイポの単一ソース（window.LAYOUT）
style.css         スタイル
config.js         調整値（window.CONFIG）
quizzes.js     クイズ登録＋パス解決＋入出力（window.QUIZZES / QUIZ / QuizStore）
glyphs.js      字形データ（window.GLYPHS）
texts.js       UI単語データ（window.TEXTS）
words.js       英単語リスト（エディタの単語チェック用）
main.js        ゲーム本体（矢印エンジン・シーン・入力）
svg/hint_*.svg ヒント/勝利イラスト
```
すべて通常の `<script src>`（モジュール不使用）なので、サーバもビルドも不要です。

## 今後
- `main.js` をシーン別（title / play / clear / gameover）に整理。
- エディタモード：クイズ登録 → `quizzes.json` 入出力 → ゲームで順次再生。
- `letters-arrows.html` は旧エディタ（別ツール。統合予定）。
- 字形を再生成したいとき: `alphabets.svg` / `text.svg` を更新 → 抽出スクリプトで `glyphs.js` / `texts.js` を作り直し（手順は別途用意可）。
