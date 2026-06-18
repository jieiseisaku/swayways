// クイズ登録（アナグラム）と図（ヒント/アニメSVG）を分けて管理。
//   id        … "green-red" の小文字（例 "step-pets"）
//   green/red … アナグラムの2語（大文字）
//   hint      … ヒント図のSVGファイル名（svg/ フォルダ内）。未設定なら図なし。
//   animation … アニメ図のSVGファイル名（追加予定。今は未使用）。
// 図のSVGはすべて svg/ フォルダで管理する（QUIZ.SVG_DIR）。
window.QUIZZES = [
  { "id": "step-pets",    "green": "STEP",  "red": "PETS",   "hint": "hint_step-pets.svg", "animation": "" },
  { "id": "listen-silent","green": "LISTEN","red": "SILENT", "hint": "", "animation": "" },
  { "id": "night-thing",  "green": "NIGHT", "red": "THING",  "hint": "", "animation": "" },
  { "id": "earth-heart",  "green": "EARTH", "red": "HEART",  "hint": "", "animation": "" },
  { "id": "tea-eat",      "green": "TEA",   "red": "EAT",    "hint": "", "animation": "" },
  { "id": "smile-slime",  "green": "SMILE", "red": "SLIME",  "hint": "", "animation": "" },
  { "id": "stone-notes",  "green": "STONE", "red": "NOTES",  "hint": "", "animation": "" }
];

// 図SVGの保管フォルダ、命名・経路ヘルパ、クイズ解決、入出力。
window.QUIZ = {
  SVG_DIR: "svg/",
  // "green-red" の小文字id
  makeId(green, red){
    const c = s => (s||"").toLowerCase().replace(/[^a-z0-9]/g, "");
    return c(green) + "-" + c(red);
  },
  // 規定のヒント/アニメSVG名（idベース）
  defaultHintName(id){ return "hint_" + id + ".svg"; },
  defaultAnimName(id){ return "animation-" + id + ".svg"; },
  // svg/ を前置したフルパス
  path(name){ return name ? (this.SVG_DIR + name) : ""; },
  // 色別ヒント（"…_red.svg" / "…_green.svg"）。variant: 'red' | 'green' | 'both'
  hintPath(name, variant){
    if(!name) return "";
    if(variant === "both" || !variant) return this.path(name);
    return this.path(name.replace(/\.svg$/i, "") + "_" + variant + ".svg");
  },
  // green/red からクイズを探す。なければ最小オブジェクトを生成。
  resolve(green, red){
    const id = this.makeId(green, red);
    const q = (window.QUIZZES || []).find(x => x.id === id
      || (x.green === (green||"").toUpperCase() && x.red === (red||"").toUpperCase()));
    return q || { id, green:(green||"").toUpperCase(), red:(red||"").toUpperCase(), hint:"", animation:"" };
  }
};

// JSON / JS の書き出しと JSON 読み込み
window.QuizStore = {
  _download(text, filename, mime){
    const b = new Blob([text], { type: mime });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  },
  // JSON で書き出し（quizzes.json）
  export(list){ this._download(JSON.stringify(list || window.QUIZZES, null, 2), "quizzes.json", "application/json"); },
  exportJSON(list){ this.export(list); },
  // quizzes.js として書き出し（差し替え用。先頭の登録配列のみ）
  exportJS(list){
    const arr = (list || window.QUIZZES).map(q =>
      `  ${JSON.stringify({ id:q.id, green:q.green, red:q.red, hint:q.hint||"", animation:q.animation||"" })}`
    ).join(",\n");
    const head = "// 自動生成: ANAGRAM EDITOR からの書き出し。図SVGは svg/ フォルダに置く。\n";
    this._download(head + "window.QUIZZES = [\n" + arr + "\n];\n", "quizzes.js", "text/javascript");
  },
  // JSON ファイルを読み込み → cb(list)
  import(file, cb){
    const r = new FileReader();
    r.onload = () => { try { cb(JSON.parse(r.result)); } catch(e){ alert("JSON読み込み失敗"); } };
    r.readAsText(file);
  }
};
