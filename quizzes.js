// クイズ登録（アナグラム）と図（ヒント/アニメSVG）を分けて管理。
//   id        … "green-red" の小文字（例 "step-pets"）
//   green/red … アナグラムの2語（大文字）
//   hint      … ヒント図のSVG（命名規則 "hint_[id].svg"・svg/ フォルダ）。id から自動命名。
//   animation … アニメJSON（命名規則 "anim_[id].json"）。id から自動命名。
// 図のSVGはすべて svg/ フォルダで管理する（QUIZ.SVG_DIR）。
window.QUIZZES = [
  { "id": "step-pets",    "green": "STEP",  "red": "PETS",   "hint": "hint_step-pets.svg",    "animation": "anim_step-pets.json" },
  { "id": "listen-silent","green": "LISTEN","red": "SILENT", "hint": "hint_listen-silent.svg","animation": "anim_listen-silent.json" },
  { "id": "night-thing",  "green": "NIGHT", "red": "THING",  "hint": "hint_night-thing.svg",  "animation": "anim_night-thing.json" },
  { "id": "earth-heart",  "green": "EARTH", "red": "HEART",  "hint": "hint_earth-heart.svg",  "animation": "anim_earth-heart.json" },
  { "id": "tea-eat",      "green": "TEA",   "red": "EAT",    "hint": "hint_tea-eat.svg",      "animation": "anim_tea-eat.json" },
  { "id": "smile-slime",  "green": "SMILE", "red": "SLIME",  "hint": "hint_smile-slime.svg",  "animation": "anim_smile-slime.json" },
  { "id": "stone-notes",  "green": "STONE", "red": "NOTES",  "hint": "hint_stone-notes.svg",  "animation": "anim_stone-notes.json" }
];

// 図SVGの保管フォルダ、命名・経路ヘルパ、クイズ解決、入出力。
window.QUIZ = {
  SVG_DIR: "svg/",
  // "green-red" の小文字id
  makeId(green, red){
    const c = s => (s||"").toLowerCase().replace(/[^a-z0-9]/g, "");
    return c(green) + "-" + c(red);
  },
  // 規定のヒント/アニメ名（idベース）: "hint_[id].svg" / "anim_[id].json"
  defaultHintName(id){ return "hint_" + id + ".svg"; },
  defaultAnimName(id){ return "anim_" + id + ".json"; },
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
  // quizzes.js として書き出し（差し替え用）。hint/animation は id から自動命名。
  exportJS(list){
    const arr = (list || window.QUIZZES).map(q =>
      `  ${JSON.stringify({ id:q.id, green:q.green, red:q.red, hint:window.QUIZ.defaultHintName(q.id), animation:window.QUIZ.defaultAnimName(q.id) })}`
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
