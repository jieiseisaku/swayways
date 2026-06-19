# SWAY WAYS — 引き継ぎメモ（CLAUDE.md）

新しいスレッド／開発者が**このファイルとリポジトリだけ読めば続きから作業できる**ことを目的にしたメモ。
会話履歴は正本ではない。**正本はファイル**。迷ったら各 `.js` の `window.*` を読むこと。

---

## 1. これは何か
アナグラムを矢印でつないで2語（緑＝green / 赤＝red）を綴るブラウザゲーム「SWAY WAYS」。
グラフィックデザイナーの個人開発。実装は AI（Claude）と進行。狙いは「動く」だけでなく「面白い・手触りが良い」こと。

## 2. 技術方針（厳守）
- **ビルド不要の静的サイト**。プレーン HTML + CSS + 古典的 `<script src>`。
- **ES モジュール禁止・fetch 禁止**。`file://` のダブルクリックでも GitHub Pages でも動くこと。
- データ入出力は **download / upload（Blob・FileReader）** のみ。サーバ前提にしない。
- 盤面の座標系は **1456 × 819**（SVG viewBox）。レイアウトエディタは 1920×1080 の枠で見せるが、座標は 1456×819 のまま。

## 3. ファイル構成と役割
```
index.html         ゲーム入口。layout.js→config.js→quizzes.js→glyphs.js→texts.js→main.js を読む。
                   盤面SVG（boardG / hintScreen / gHud / gExtras / overGameover / measure）。
                   先頭に ?pv= フック（レイアウトエディタのプレビュー用）。
editor.html        ANAGRAM EDITOR（クイズCRUD）。layout.js(+pvフック)→glyphs.js→quizzes.js→words.js。
layout-editor.html レイアウトエディタ（Material 3）。layout.js→glyphs.js を読む。配置/モーション/タイポ/スウォッチを編集→layout.js書き出し。
layout.js          window.LAYOUT（単一ソース）: typography / motion / swatches / screens{...elements}。window.LY ヘルパ。
quizzes.js         window.QUIZZES（id,green,red,hint,animation）/ window.QUIZ（命名・解決ヘルパ）/ window.QuizStore（入出力）。
glyphs.js          window.GLYPHS。字形 {c:[inkCx,inkCy], b:baseline, d:path}。alphabets.svg から抽出。
texts.js           window.TEXTS。text.svg の既製ワード（HINT/SWAY/WAYS/CLEAR/EXIT/START/READY?）。
words.js           window.WORDS(Set) / window.isWord()。英単語チェック（エディタのみ。ゲーム本体は不使用）。
main.js            ゲーム本体。矢印エンジン・シーン・入力。CONFIG/QUIZZES/GLYPHS/TEXTS/LAYOUT を読む。
config.js          window.CONFIG。タイマー/ヒント/矢印幾何/マーカー等の調整値。
alphabets.svg      字形の元データ（ピンク線＝アセンダ/ディセンダ基準）。
text.svg           既製ワードの元データ。
svg/               ヒント図 hint_[id]*.svg。
style.css          ゲームのスタイル。
```

## 4. データの単一ソース
- **window.LAYOUT**（layout.js）… 各画面の要素配置・サイズ・色・align、全体の typography（spacing/lineHeight）、motion（slideMs/ease/hoverOffset/hoverMs 等）、swatches。
  - screens: `title / play / hint / clear / gameover`（ゲーム）＋ `editEdit / editList`（エディタ）。
  - main.js は `LZ(screen,key)` でフォールバック付き取得。editor.html は `EE`(editEdit)/`EL2`(editList) 参照。
- **window.QUIZZES**（quizzes.js）… クイズ。`QUIZ.makeId/defaultHintName/defaultAnimName/hintPath/resolve`、`QuizStore.exportJS/export/import`。
- **window.CONFIG / GLYPHS / TEXTS** … 調整値・字形。

## 5. 命名規則
- id = `"green-red"` 小文字（例 `step-pets`）。
- hint = `"hint_[id].svg"`、animation = `"anim_[id].json"`。**id から自動命名**（exportJS / editor で自動補完）。
- ヒント図は `svg/` フォルダに置く。色別は `…_red.svg` / `…_green.svg`（hintPath が生成）。

## 6. フォント描画（重要）
- 各グリフは alphabets.svg のピンク線（行ごとのアセンダ/ディセンダ）から求めた **baseline `b`** を持つ。
- テキスト描画は **baseline 揃え ＋ 光学カーニング**（隣接グリフの輪郭プロファイルを `getPointAtLength` でサンプリングし重なりを詰める）。
- 字間 = `LAYOUT.typography.spacing`（cap比、概ね 0.12）。editor/main は描画時に一時上書き可（追加要素の個別 spacing 用）。
- フォントに無い記号は簡易シェイプで描画：`- . " *`。`*` は未保存インジケータ用。

## 7. 保存モデル（要点）
- **アナグラムエディタ**：登録(SUBMIT)/削除/SWAP は**メモリのみ更新→ dirty**。タイトル先頭に `*`。`SAVE` ボタン or `⌘S` で `quizzes.js` を1回書き出し（download）→ dirty 解除。`beforeunload` で離脱警告。
- **レイアウトエディタ**：編集はメモリ→ `Export layout.js`（download）。Undo/Redo 50（⌘Z / ⌘⇧Z）。
- 共通：ブラウザは `file://` から直接上書きできないため**「書き出し→ファイル差し替え」運用**。
- **プレビュー（レイアウトエディタ）**：Preview モードは index.html / editor.html を iframe で開き、`?pv=<encodeURIComponent(JSON.stringify(LAYOUT))>` で未保存値を渡して実挙動を確認（編集不可）。受け側に ?pv フックあり。

## 8. レイアウトエディタの機能
画面タブ（7）／要素ドラッグ・矢印キー移動／複数選択（Shift）／整列（単一=フレーム基準・複数=キーオブジェクト基準）／スウォッチ（色を一元管理・変更で連動・自動リンク）／要素追加（Text/Rect/Ellipse/Line、Rect は角丸比 rx）／要素ごとのタイポ上書き／Undo・Redo／Preview／Export。Material 3 スタイル。

## 9. 開発・公開フロー
- 確認：各 html をダブルクリック → 変更後リロード。
- データ更新：layout-editor → Export → `layout.js` を差し替え。editor → SAVE → `quizzes.js` を差し替え。ヒント図は `svg/` へ。
- 公開：`git add -A && git commit && git push` → GitHub Pages。

## 10. 検証手段（ライブブラウザ無し環境向け）
- 構文：`node --check`。
- 動作：jsdom で例外なし＋ロジック検証（getBBox/getTotalLength はスタブ。カーニングはサンプル不可時フォールバック）。
- 見た目：Python `svgpathtools`＋`cairosvg` で SVG をラスタライズして確認。

## 11. 保留・未決
- **localStorage 自動バックアップ＆復元**（アナグラムエディタ）：相談済みだが**未実装**（ブラウザ保存の可否を確認待ち）。
- **File System Access による真の上書き保存**（localhost 限定）：未実装（download フォールバックのみ）。
- **animation（anim_[id].json）**：フィールド・命名のみ用意。フォーマット未定・ゲーム未使用。
- 追加要素（extras）の描画：editEdit / editList / title / play / gameover に対応済み。hint / clear は未配線。
- 解像度は 1456×819 のまま（1920×1080 移行はしない方針）。

## 12. 作者の方向性（文脈）
- 作者はコードを書かない。**実装は人と組む前提**、プロトタイプは自分（＋Claude）で作る。
- 当面の現実的ゴール：**公開できる web 作品**まで磨く。その先（ネイティブ／運用）はエンジニアと組む。
- 強み＝仕様化・手触り・ツール設計。意識的に伸ばすべき＝「面白いか」を早く検証する（プレイテスト優先、磨きすぎ注意）。

## 13. 新スレッドの始め方
1. このフォルダを開き、`CLAUDE.md` と各 `.js` の `window.*` を読む。
2. 作業対象のファイルだけ読み込む（全部は不要）。
3. 変更後は §10 の検証 → §9 の差し替え/公開。
