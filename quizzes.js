window.QUIZZES = [
  {
    "id": "step-pets",
    "green": "STEP",
    "red": "PETS"
  },
  {
    "id": "listen-silent",
    "green": "LISTEN",
    "red": "SILENT"
  },
  {
    "id": "night-thing",
    "green": "NIGHT",
    "red": "THING"
  },
  {
    "id": "earth-heart",
    "green": "EARTH",
    "red": "HEART"
  }
];

window.QuizStore = {
  export(list){ const b=new Blob([JSON.stringify(list||window.QUIZZES,null,2)],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download="quizzes.json";
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href); },
  import(file,cb){ const r=new FileReader(); r.onload=()=>{ try{ cb(JSON.parse(r.result)); }catch(e){ alert("JSON読み込み失敗"); } }; r.readAsText(file); },
};
