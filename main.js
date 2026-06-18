// SWAY WAYS — game logic (classic script; reads window.CONFIG / QUIZZES / GLYPHS / TEXTS)
const config=window.CONFIG, quizzes=window.QUIZZES, GLYPHS=window.GLYPHS, TEXTS=window.TEXTS;
const NS='http://www.w3.org/2000/svg';

// ---- geometry constants (same as the tool) ----
const {headH:HEAD_H, headHalf:HEAD_HALF, gapR:R, laneM:M, bowK:BOWK, headHead:HH, headShaft:HS, shaftBack:BACK}=config.geom;
const MINTIP=92;
const HEAD_PTS=`0,0 ${-HEAD_H},${-HEAD_HALF} ${-HEAD_H},${HEAD_HALF}`;
const VW=1456, VH=819, CX=VW/2, CY=VH/2;
const START_TIME=config.timerSeconds;
const norm=(x,y)=>{const l=Math.hypot(x,y)||1;return[x/l,y/l];};
const clean=w=>(w||'').toUpperCase().replace(/[^A-Z0-9]/g,'');

const params=new URLSearchParams(location.search);
const GAME_G=clean(params.get('g'))||config.gameWords.green;   // the puzzle that begins on READY?
const GAME_R=clean(params.get('r'))||config.gameWords.red;
const TITLE_G=config.titleWords.green, TITLE_R=config.titleWords.red;          // title-screen logo words
// current model (rebuilt when switching between title and game)
let GREEN, RED, greenArrows, redArrows, allArrows, chains;
function setWords(g,r){
  GREEN=clean(g); RED=clean(r);
  greenArrows=mkArrows(GREEN,'green'); redArrows=mkArrows(RED,'red'); allArrows=[...greenArrows,...redArrows];
  // same-direction duplicate edges go to opposite sides
  const cnt={}; allArrows.forEach(a=>{ const k=a.src+'>'+a.tgt; const i=(cnt[k]=(cnt[k]||0)); cnt[k]++; a.side=(i%2===0)?1:-1; });
  chains={ green:{word:GREEN,arrows:greenArrows,prog:0}, red:{word:RED,arrows:redArrows,prog:0} };
}

const svg=document.getElementById('board');
const gLetters=document.getElementById('gLetters');
const gMarkers=document.getElementById('gMarkers');
const gArrowsLive=document.getElementById('gArrowsLive');
const gProv=document.getElementById('gProv');
const boardG=document.getElementById('boardG');
const measure=document.getElementById('measure');

/* =======================================================================
   GLYPH TEXT — render any string with the alphabets.svg font (paths)
   ======================================================================= */
const _mc={};
function glyphMetrics(ch){
  if(_mc[ch]) return _mc[ch];
  const g=GLYPHS[ch];
  if(!g){ return _mc[ch]={xmin:0,ymax:0,w:40,h:60}; }
  const p=document.createElementNS(NS,'path'); p.setAttribute('d',g.d);
  measure.appendChild(p); const b=p.getBBox(); measure.removeChild(p);
  return _mc[ch]={xmin:b.x, ymin:b.y, ymax:b.y+b.height, w:b.width, h:b.height};
}
let CAPH=0;
function textWidth(str,size){
  const sc=size/CAPH; let w=0;
  for(const ch of str){ if(ch===' '){ w+=size*0.45; continue; }
    w += glyphMetrics(ch).w*sc + size*0.12; }
  return w;
}
// render `str` into `container` (cleared). align: 'left'|'center'|'right' around x. y = baseline.
function setText(container, str, {x=0, y=0, size=30, color='#111', align='left', opacity=1}={}){
  container.innerHTML='';
  const sc=size/CAPH;
  const w=textWidth(str,size);
  let cur = align==='center' ? x-w/2 : align==='right' ? x-w : x;
  for(const ch of str){
    if(ch===' '){ cur+=size*0.45; continue; }
    const m=glyphMetrics(ch); const gl=GLYPHS[ch];
    if(gl){
      const path=document.createElementNS(NS,'path');
      path.setAttribute('d', gl.d);
      path.setAttribute('fill', color);
      if(opacity!==1) path.setAttribute('opacity', opacity);
      let ty = y - m.ymax*sc;
      if(ch===':') ty -= size*0.18;          // nudge colon toward mid-line
      path.setAttribute('transform', `translate(${cur - m.xmin*sc} ${ty}) scale(${sc})`);
      container.appendChild(path);
    }
    cur += m.w*sc + size*0.12;
  }
  return w;
}
function hitRect(container, x, y, w, h, onClick){
  const r=document.createElementNS(NS,'rect');
  r.setAttribute('class','hit'); r.setAttribute('x',x); r.setAttribute('y',y);
  r.setAttribute('width',w); r.setAttribute('height',h);
  r.addEventListener('click', onClick);
  r.addEventListener('touchstart', e=>{e.preventDefault(); onClick();}, {passive:false});
  container.appendChild(r);
}

// ---- positions ----
let positions={};
function defaultPositions(){
  // alphabet placement is randomised every play
  return randomPositions([...new Set((GREEN+RED).split(''))]);
}
function randomPositions(ids){
  const pad=180, n=ids.length, minD=Math.max(150,Math.min(360,760/Math.sqrt(n)));
  const out={}, placed=[];
  ids.forEach(id=>{ let p,t=0; do{ p=[pad+Math.random()*(VW-2*pad), pad+Math.random()*(VH-140-pad)+40]; t++; }
    while(t<400&&placed.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<minD)); placed.push(p); out[id]=p; });
  return out;
}

// ---- arrows model ----
function mkArrows(word,color){
  const cs=word.split(''), a=[];
  for(let i=0;i<cs.length-1;i++) if(cs[i]!==cs[i+1])
    a.push({color, src:cs[i], tgt:cs[i+1], seq:a.length, side:1});
  return a;
}

// ---- letters ----
const nodeEls={};
function placeLetters(){
  gLetters.innerHTML='';
  for(const k in nodeEls) delete nodeEls[k];   // reset when switching word sets
  const ids=[...new Set((GREEN+RED).split(''))];
  ids.forEach(id=>{
    const g=document.createElementNS(NS,'g');
    const glyph=GLYPHS[id], anchor=glyph?glyph.c:[0,0];
    const path=document.createElementNS(NS,'path');
    path.setAttribute('class','letter'); path.setAttribute('d', glyph?glyph.d:'');
    const outline=document.createElementNS(NS,'path');
    outline.setAttribute('class','letter-outline'); outline.setAttribute('d', glyph?glyph.d:'');
    g.setAttribute('transform',`translate(${positions[id][0]-anchor[0]} ${positions[id][1]-anchor[1]})`);
    g.appendChild(path); g.appendChild(outline);
    gLetters.appendChild(g);
    // per-letter random drift params (gentle float in title & after CLEAR)
    const R2=Math.random, TAU=Math.PI*2;
    nodeEls[id]={path, outline, g, float:{
      ax:config.floatAmpMin+R2()*(config.floatAmpMax-config.floatAmpMin), ay:config.floatAmpMin+R2()*(config.floatAmpMax-config.floatAmpMin), sx:0.5+R2()*0.7, sy:0.5+R2()*0.7, px:R2()*TAU, py:R2()*TAU }};
  });
  ids.forEach(id=>{ const bb=nodeEls[id].path.getBBox(); const n=nodeEls[id];
    n.cx=positions[id][0]; n.cy=positions[id][1]; n.w=bb.width; n.h=bb.height;
    n.rad=Math.max(bb.width,bb.height)/2*config.letterCollision; });
}

// ---- start markers ----
// marker rides the chain head; when a word is complete it returns to its initial letter
let markers=[];
let active=null;   // committed colour while building one word (null = choosable)
function markerInfo(color){
  if(isComplete(color)) return { show:true, id:chains[color].word[0] };                 // done -> 1st letter
  if(!started)          return { show:true, id:chains[color].word[0] };                 // title screen
  if(active===null || active===color)
                        return { show:true, id:chains[color].word[chains[color].prog] }; // choosable / active head
  return { show:false };                                                                // other colour is locked
}
function placeMarkers(){
  gMarkers.innerHTML=''; markers=[];
  const g=markerInfo('green'), r=markerInfo('red');
  const same = g.show && r.show && g.id===r.id;
  if(g.show) addMarker('green', g.id, same?-15:0);   // green diamond
  if(r.show) addMarker('red',   r.id, same?+15:0);   // red circle
}
function addMarker(color, id, dx){
  const n=nodeEls[id]; if(!n) return;
  const cx=n.cx+dx, cy=n.cy - n.h/2 - 20 - 8;
  if(color==='green'){
    const s=config.marker.diamondPx/Math.SQRT2, h=s/2;   // square side so the rotated diamond is 18px point-to-point
    const d=document.createElementNS(NS,'rect');
    d.setAttribute('x',cx-h); d.setAttribute('y',cy-h); d.setAttribute('width',s); d.setAttribute('height',s);
    d.setAttribute('fill','var(--green)'); d.setAttribute('transform',`rotate(45 ${cx} ${cy})`);
    gMarkers.appendChild(d);
  } else {
    const c=document.createElementNS(NS,'circle');
    c.setAttribute('cx',cx); c.setAttribute('cy',cy); c.setAttribute('r',8); c.setAttribute('fill','var(--red)');
    gMarkers.appendChild(c);
  }
  markers.push({color, id, x:cx, y:cy, r:20});   // generous grab radius
}
// nearest marker under the cursor (so the hovered colour wins when two markers overlap)
function markerAt(p){ let best=null,bd=1e9; for(const m of markers){ const d=Math.hypot(p[0]-m.x,p[1]-m.y); if(d<m.r && d<bd){ bd=d; best=m; } } return best; }

// ---- solution geometry ----
const a2g=new Map();
function segDist(px,py,ax,ay,bx,by){
  const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy||1;
  let t=((px-ax)*dx+(py-ay)*dy)/L2; t=Math.max(0,Math.min(1,t));
  const cx=ax+t*dx,cy=ay+t*dy; return [Math.hypot(px-cx,py-cy), px-cx, py-cy];
}
function computeGeo(){
  a2g.clear();
  const geo=allArrows.map(a=>{
    const s=[nodeEls[a.src].cx, nodeEls[a.src].cy], e=[nodeEls[a.tgt].cx, nodeEls[a.tgt].cy];
    const len=Math.hypot(e[0]-s[0],e[1]-s[1])||1;
    const [ux,uy]=norm(e[0]-s[0],e[1]-s[1]);
    const px=-uy*a.side, py=ux*a.side;
    const s2=[s[0]+px*M,s[1]+py*M], e2=[e[0]+px*M,e[1]+py*M];
    const bow=a.color==='red'?BOWK*len:0;
    const mx=(s2[0]+e2[0])/2+px*bow, my=(s2[1]+e2[1])/2+py*bow;
    const d1=norm(mx-s2[0],my-s2[1]); const start=[s2[0]+d1[0]*R,s2[1]+d1[1]*R];
    const d2=norm(mx-e2[0],my-e2[1]); const tip=[e2[0]+d2[0]*R,e2[1]+d2[1]*R];
    return {a,start,tip,mx,my,tan:[0,0],hc:[0,0]};
  });
  const segsOf=o=> o.a.color==='red'
    ? [[o.start[0],o.start[1],o.mx,o.my],[o.mx,o.my,o.tip[0],o.tip[1]]]
    : [[o.start[0],o.start[1],o.tip[0],o.tip[1]]];
  for(let it=0;it<26;it++){
    geo.forEach(o=>{ const t=norm(o.tip[0]-o.mx,o.tip[1]-o.my); o.tan=t;
      o.hc=[o.tip[0]-t[0]*HEAD_H*0.5, o.tip[1]-t[1]*HEAD_H*0.5]; });
    for(let i=0;i<geo.length;i++) for(let j=i+1;j<geo.length;j++){
      const dx=geo[j].hc[0]-geo[i].hc[0], dy=geo[j].hc[1]-geo[i].hc[1]; let d=Math.hypot(dx,dy);
      if(d<HH){ let nx,ny; if(d<1e-3){nx=Math.cos(i);ny=Math.sin(i);}else{nx=dx/d;ny=dy/d;}
        const p=(HH-d)*0.5; geo[i].tip[0]-=nx*p;geo[i].tip[1]-=ny*p;geo[j].tip[0]+=nx*p;geo[j].tip[1]+=ny*p; }
    }
    for(let i=0;i<geo.length;i++) for(let j=0;j<geo.length;j++){ if(i===j) continue;
      let best=1e9,bvx=0,bvy=0;
      for(const sg of segsOf(geo[j])){ const r=segDist(geo[i].hc[0],geo[i].hc[1],sg[0],sg[1],sg[2],sg[3]);
        if(r[0]<best){ best=r[0]; bvx=r[1]; bvy=r[2]; } }
      if(best<HS && best>1e-3){ const p=(HS-best)*0.5; geo[i].tip[0]+=bvx/best*p; geo[i].tip[1]+=bvy/best*p; }
    }
  }
  geo.forEach(o=>{ o.tan=norm(o.tip[0]-o.mx,o.tip[1]-o.my); a2g.set(o.a,o); });
}
// the merged arrow silhouette (shaft + head as one closed shape) -> a single path
function arrowSilhouette(o){
  const halfBar=config.geom.stroke/2, HB=HEAD_HALF;
  const S=o.start, C=[o.mx,o.my], TIP=o.tip, tan=o.tan;
  const base=[TIP[0]-tan[0]*HEAD_H, TIP[1]-tan[1]*HEAD_H];   // head back
  const perpT=[-tan[1],tan[0]];
  const N=20, top=[], bot=[];
  for(let i=0;i<=N;i++){ const t=i/N, u=1-t;
    const qx=u*u*S[0]+2*u*t*C[0]+t*t*base[0], qy=u*u*S[1]+2*u*t*C[1]+t*t*base[1];
    const dx=2*u*(C[0]-S[0])+2*t*(base[0]-C[0]), dy=2*u*(C[1]-S[1])+2*t*(base[1]-C[1]);
    const dl=Math.hypot(dx,dy)||1, nx=-dy/dl, ny=dx/dl;
    top.push([qx+nx*halfBar, qy+ny*halfBar]); bot.push([qx-nx*halfBar, qy-ny*halfBar]);
  }
  let d='M '+top[0][0]+' '+top[0][1];
  for(let i=1;i<=N;i++) d+=' L '+top[i][0]+' '+top[i][1];
  d+=` L ${base[0]+perpT[0]*HB} ${base[1]+perpT[1]*HB}`;     // top barb
  d+=` L ${TIP[0]} ${TIP[1]}`;                               // tip
  d+=` L ${base[0]-perpT[0]*HB} ${base[1]-perpT[1]*HB}`;     // bottom barb
  for(let i=N;i>=0;i--) d+=' L '+bot[i][0]+' '+bot[i][1];
  return d+' Z';
}
function arrowSVG(o, container, solid){
  const col=o.a.color==='red'?'var(--red)':'var(--green)';
  const p=document.createElementNS(NS,'path');
  p.setAttribute('d', arrowSilhouette(o));
  if(solid){ p.setAttribute('fill',col); p.setAttribute('stroke','none'); }          // complete -> solid
  else { p.setAttribute('fill','none'); p.setAttribute('stroke',col);                // building -> hollow outline
         p.setAttribute('stroke-width',config.geom.outline); p.setAttribute('stroke-linejoin','miter'); }
  container.appendChild(p);
}

// ---- game state ----
const isComplete=c=>chains[c].prog>=chains[c].arrows.length;
const won=()=>isComplete('green')&&isComplete('red');
function drawSolved(){
  gArrowsLive.innerHTML='';
  ['green','red'].forEach(c=>{ const solid=isComplete(c);   // complete word = solid, building = outline
    for(let i=0;i<chains[c].prog;i++) arrowSVG(a2g.get(chains[c].arrows[i]), gArrowsLive, solid); });
}
function drawAllArrows(){   // title logo: the whole diagram, solid
  gArrowsLive.innerHTML='';
  allArrows.forEach(a=> arrowSVG(a2g.get(a), gArrowsLive, true));
}

/* =======================================================================
   HUD  (all rendered with the custom glyph font)
   ======================================================================= */
// render a whole pre-drawn word from text.svg (HINT / CLEAR! ...), scaled to cap-height `size`
function placeWord(container, name, {x=0,y=0,size=30,color='#111',align='left'}={}){
  const t=TEXTS[name]; const [bx,by,bw,bh]=t.bbox; const sc=size/bh;
  const w=bw*sc;
  const startX = align==='center'?x-w/2 : align==='right'?x-w : x;
  const g=document.createElementNS(NS,'g');
  g.setAttribute('transform',`translate(${startX-bx*sc} ${y-(by+bh)*sc}) scale(${sc})`);
  t.paths.forEach(d=>{ const p=document.createElementNS(NS,'path'); p.setAttribute('d',d); p.setAttribute('fill',color); g.appendChild(p); });
  container.appendChild(g);
  return w;
}
function wordWidth(name,size){ const [,,bw,bh]=TEXTS[name].bbox; return bw*(size/bh); }
// place a single glyph horizontally centred at xc (for the monospace timer)
function placeGlyphCentered(container, ch, xc, baseY, size, color){
  const gl=GLYPHS[ch]; if(!gl) return; const m=glyphMetrics(ch); const sc=size/CAPH;
  let ty=baseY-m.ymax*sc; if(ch===':') ty-=size*0.18;
  const tx=xc-(m.w*sc)/2-m.xmin*sc;
  const p=document.createElementNS(NS,'path'); p.setAttribute('d',gl.d); p.setAttribute('fill',color);
  p.setAttribute('transform',`translate(${tx} ${ty}) scale(${sc})`); container.appendChild(p);
}
let maxDigitW=0;

function renderIndicators(){
  const fmt=(word,prog)=> word.split('').map((ch,i)=> i<=prog?ch:'?').join('');
  const gw=setText(document.getElementById('hudGreen'), fmt(GREEN,chains.green.prog), {x:34,y:790,size:30,color:'var(--green)',align:'left'});
  const rw=setText(document.getElementById('hudRed'),   fmt(RED,chains.red.prog),     {x:1422,y:790,size:30,color:'var(--red)',align:'right'});
  // after CLEAR, the word labels also sort the letters
  indHit(document.getElementById('hudGreen'), 30, 754, gw+8, 56, 'green');
  indHit(document.getElementById('hudRed'),   1422-rw-4, 754, rw+8, 56, 'red');
}
function indHit(container, x, y, w, h, color){
  const r=document.createElementNS(NS,'rect');
  r.setAttribute('class','hit'); r.setAttribute('x',x); r.setAttribute('y',y); r.setAttribute('width',w); r.setAttribute('height',h);
  r.addEventListener('click', ()=>{ if(won()) sortByColor(color); });
  container.appendChild(r);
}
let blink=true;
function renderTimer(){
  const el=document.getElementById('hudTimer'); el.innerHTML='';
  if(won()){ placeWord(el,'CLEAR',{x:CX,y:794,size:42,color:'#111',align:'center'}); return; }
  // monospace cells: [d][d] : [d][d] — colon slot kept even while blinked off
  const size=40, sc=size/CAPH;
  const DW=maxDigitW*sc + size*0.10;   // digit cell advance (fixed)
  const CW=size*0.34;                  // colon cell advance (fixed)
  const m=String(Math.floor(timeLeft/60)).padStart(2,'0'), s=String(timeLeft%60).padStart(2,'0');
  const cells=[m[0],m[1],':',s[0],s[1]];
  const widths=cells.map(c=> c===':'?CW:DW);
  const total=widths.reduce((a,b)=>a+b,0);
  let x=CX-total/2;
  cells.forEach((c,i)=>{ const cw=widths[i];
    if(!(c===':'&&!blink)) placeGlyphCentered(el,c,x+cw/2,790,size,'#111');
    x+=cw; });
}
function renderHintLabel(){
  const c=document.getElementById('hudHint'); c.innerHTML='';
  const size=28, qsize=26, y=50, padX=24, padY=10, gap=size*0.5, qgap=qsize*0.5;
  const labelW=wordWidth('HINT',size), qW=textWidth('?',qsize);
  const innerW=labelW+gap+qW*3+qgap*2;
  const pillW=innerW+padX*2, pillH=size+padY*2;
  const pillX=1422-pillW, pillY=(y-size)-padY;
  // rounded outline (pill)
  const pill=document.createElementNS(NS,'rect');
  pill.setAttribute('x',pillX); pill.setAttribute('y',pillY);
  pill.setAttribute('width',pillW); pill.setAttribute('height',pillH);
  pill.setAttribute('rx',pillH/2); pill.setAttribute('ry',pillH/2);
  pill.setAttribute('fill','#fff'); pill.setAttribute('stroke','#222'); pill.setAttribute('stroke-width','2.5');
  c.appendChild(pill);
  // ink: HINT (text.svg) + three ? (left ones faded as used)
  const ink=document.createElementNS(NS,'g'); c.appendChild(ink);
  let x=pillX+padX;
  placeWord(ink,'HINT',{x,y,size,color:'#222',align:'left'}); x+=labelW+gap;
  for(let i=0;i<3;i++){ const used=i<(3-hintUses);
    setText(_tmpG(ink),'?',{x,y,size:qsize,color:'#222',align:'left',opacity:used?0.2:1}); x+=qW+qgap; }
  // hover: fill the pill black and invert the text to white
  const hit=document.createElementNS(NS,'rect');
  hit.setAttribute('class','hit');
  hit.setAttribute('x',pillX); hit.setAttribute('y',pillY);
  hit.setAttribute('width',pillW); hit.setAttribute('height',pillH);
  hit.setAttribute('rx',pillH/2);
  const setInk=col=> ink.querySelectorAll('path').forEach(p=>p.setAttribute('fill',col));
  hit.addEventListener('mouseenter',()=>{ pill.setAttribute('fill','#000'); pill.setAttribute('stroke','#000'); setInk('#fff'); });
  hit.addEventListener('mouseleave',()=>{ pill.setAttribute('fill','#fff'); pill.setAttribute('stroke','#222'); setInk('#222'); });
  hit.addEventListener('click',doHint);
  hit.addEventListener('touchstart',e=>{e.preventDefault();doHint();},{passive:false});
  c.appendChild(hit);
}
function _tmpG(parent){ const g=document.createElementNS(NS,'g'); parent.appendChild(g); return g; }
function renderExit(){
  const c=document.getElementById('hudExit'); c.innerHTML='';
  const w=placeWord(c,'EXIT',{x:34,y:52,size:26,color:'#999',align:'left'});
  hitRect(c,28,26,w+12,36,goEditor);
}
function showQuit(){
  const c=document.getElementById('hudQuit'); c.style.display='';
  const size=26, w=textWidth('QUIT',size);
  setText(c,'QUIT',{x:1422,y:52,size,color:'#111',align:'right'});
  hitRect(c,1422-w-6,30,w+12,34,goEditor);
}

/* =======================================================================
   pointer / dragging to draw
   ======================================================================= */
// convert pointer to boardG-local coords (so it stays correct after the clear-screen shrink)
function toSvg(ev){ const c=ev.touches?ev.touches[0]:ev; const pt=svg.createSVGPoint();
  pt.x=c.clientX; pt.y=c.clientY; const p=pt.matrixTransform(boardG.getScreenCTM().inverse()); return [p.x,p.y]; }
function letterAt(p){ let best=null,bd=1e9;
  for(const id in nodeEls){ const n=nodeEls[id]; const d=Math.hypot(p[0]-n.cx,p[1]-n.cy);
    if(d<n.rad && d<bd){ bd=d; best=id; } } return best; }
let drag=null, moveDrag=null, cleared=false, freeDrag=false;
// after CLEAR: lay the letters out left-to-right in a word's reading order (ease-out 400ms morph)
let sorting=false, curBoard={tx:0,ty:0,s:1};
function sortByColor(color){
  if(!won()) return;
  document.getElementById('winImg').style.display='none';   // expand to a clean readable view
  const seen={}, order=[];
  for(const ch of chains[color].word){ if(!seen[ch]){ seen[ch]=1; order.push(ch); } }  // unique, word order
  const n=order.length, gap=Math.min(150, 980/n), totalW=gap*(n-1), startX=CX-totalW/2, baseY=VH*0.5;
  const target={};
  order.forEach((id,i)=>{ target[id]=[ startX+i*gap+(Math.random()*2-1)*gap*0.12, baseY+(Math.random()*2-1)*70 ]; });
  const from={}; order.forEach(id=> from[id]=positions[id].slice());
  const b0={...curBoard}, b1={tx:0,ty:0,s:1};               // un-shrink the board so the word reads large
  const t0=performance.now(), DUR=400; sorting=true;
  (function tween(t){
    const k=Math.min(1,(t-t0)/DUR), e=1-Math.pow(1-k,3);    // easeOutCubic
    order.forEach(id=>{ positions[id]=[ from[id][0]+(target[id][0]-from[id][0])*e,
                                        from[id][1]+(target[id][1]-from[id][1])*e ]; });
    curBoard={ tx:b0.tx+(b1.tx-b0.tx)*e, ty:b0.ty+(b1.ty-b0.ty)*e, s:b0.s+(b1.s-b0.s)*e };
    boardG.setAttribute('transform',`translate(${curBoard.tx} ${curBoard.ty}) scale(${curBoard.s})`);
    if(k<1) requestAnimationFrame(tween); else sorting=false;
  })(t0);
}
function candidatesFor(id){
  if(active!==null)   // already building one colour: only that colour is connectable
    return (!isComplete(active) && chains[active].word[chains[active].prog]===id) ? [active] : [];
  const out=[];
  ['green','red'].forEach(c=>{ if(!isComplete(c)&&chains[c].word[chains[c].prog]===id) out.push(c); });
  return out;
}
// after CLEAR the letters drift; dragging just updates the base position (floatLoop renders)
function moveLetterTo(p){
  const id=moveDrag.id;
  positions[id]=[ Math.max(0,Math.min(VW,p[0]+moveDrag.off[0])), Math.max(0,Math.min(VH,p[1]+moveDrag.off[1])) ];
}
function onDown(ev){
  const p=toSvg(ev);
  if(freeDrag){ const mk=markerAt(p); const id=mk?mk.id:letterAt(p); if(!id) return; ev.preventDefault();
    // marker can be tapped (sort) or dragged (move); a letter is just dragged
    moveDrag={ id, off:[nodeEls[id].cx-p[0], nodeEls[id].cy-p[1]], down:p, marker:mk?mk.color:null, moved:false }; return; }
  if(!started || paused||won()) return;
  const mk=markerAt(p);
  const id=mk?mk.id:letterAt(p); if(!id) return;       // letter OR its marker can be grabbed
  let cand=candidatesFor(id);
  if(mk) cand=cand.filter(c=>c===mk.color);            // grabbing a marker selects that colour
  if(!cand.length) return;
  ev.preventDefault();
  const color=cand[0];
  const shaft=document.createElementNS(NS,'path');
  shaft.setAttribute('class','prov-shaft');
  shaft.setAttribute('stroke', color==='red'?'var(--red)':'var(--green)');
  gProv.appendChild(shaft);
  drag={ srcId:id, candidates:cand, color, shaft };
  updateProv(p);
}
function updateProv(p){
  const n=nodeEls[drag.srcId]; const [ux,uy]=norm(p[0]-n.cx,p[1]-n.cy);
  const sx=n.cx+ux*n.rad*0.8, sy=n.cy+uy*n.rad*0.8;
  drag.shaft.setAttribute('d',`M ${sx} ${sy} L ${p[0]} ${p[1]}`);
}
function onMove(ev){
  if(moveDrag){ ev.preventDefault(); const p=toSvg(ev);
    if(Math.hypot(p[0]-moveDrag.down[0],p[1]-moveDrag.down[1])>6) moveDrag.moved=true;
    moveLetterTo(p); return; }
  if(drag){
    ev.preventDefault();
    const p=toSvg(ev); updateProv(p);
    const id=letterAt(p);
    for(const k in nodeEls){ const o=nodeEls[k].outline;
      if(k===id){ o.setAttribute('stroke', drag.color==='red'?'var(--red)':'var(--green)'); o.style.visibility='visible'; }
      else o.style.visibility='hidden'; }
    return;
  }
  // plain hover (not dragging): outline a startable letter just like a target
  if(!started || freeDrag || paused || won()){ clearOutlines(); return; }
  const p=toSvg(ev); const mk=markerAt(p); const id=mk?mk.id:letterAt(p);
  let cand=id?candidatesFor(id):[];
  if(mk) cand=cand.filter(c=>c===mk.color);
  for(const k in nodeEls){ const o=nodeEls[k].outline;
    if(k===id && cand.length){ o.setAttribute('stroke', cand[0]==='red'?'var(--red)':'var(--green)'); o.style.visibility='visible'; }
    else o.style.visibility='hidden'; }
}
function clearOutlines(){ for(const k in nodeEls) nodeEls[k].outline.style.visibility='hidden'; }
function onUp(ev){
  if(moveDrag){ const md=moveDrag; moveDrag=null;
    if(md.marker && !md.moved) sortByColor(md.marker);   // tapped a marker (no drag) -> sort
    return; }
  if(!drag) return;
  const p=toSvg(ev); const target=letterAt(p);
  let solvedColor=null;
  if(target){ for(const c of drag.candidates){ const ch=chains[c];
    if(ch.word[ch.prog+1]===target){ solvedColor=c; break; } } }
  if(solvedColor) correct(solvedColor,target);
  else wrong(drag,p,target);
  if(drag&&drag.shaft) drag.shaft.remove();
  drag=null; clearOutlines();
}
function correct(color,targetId){
  if(active===null) active=color;          // first connection commits to this colour (other marker hides)
  chains[color].prog++;
  if(isComplete(color)) active=null;        // word done -> release; other colour's marker revives
  drawSolved(); renderIndicators(); placeMarkers();
  const path=nodeEls[targetId].path; path.classList.remove('pop'); void path.getBBox(); path.classList.add('pop');
  if(won()) onWin();
}
function wrong(d,p,targetId){
  const n=nodeEls[d.srcId];
  d.shaft.setAttribute('d', zigzag(n.cx,n.cy,p[0],p[1]));
  d.shaft.style.animation='none'; d.shaft.classList.add('shake');
  if(targetId){ const t=nodeEls[targetId].path; t.classList.remove('shake'); void t.getBBox(); t.classList.add('shake'); }
  const dead=d.shaft; setTimeout(()=>dead.remove(),300); d.shaft=null;
}
function zigzag(x1,y1,x2,y2){
  const segs=6, dx=(x2-x1)/segs, dy=(y2-y1)/segs, nx=-(y2-y1), ny=(x2-x1), nl=Math.hypot(nx,ny)||1, amp=16;
  let d=`M ${x1} ${y1}`;
  for(let i=1;i<=segs;i++){ const s=(i%2?1:-1)*(i<segs?amp:0); d+=` L ${x1+dx*i+nx/nl*s} ${y1+dy*i+ny/nl*s}`; }
  return d;
}

// ---- timer ----
let timeLeft=START_TIME, paused=false;
function startTimer(){
  setInterval(()=>{ if(paused) return; timeLeft--; if(timeLeft<=0){ timeLeft=0; renderTimer(); gameOver(); } else renderTimer(); },1000);
  setInterval(()=>{ if(paused) return; blink=!blink; if(!won()) renderTimer(); },500);
}

// ---- hint ----
let hintUses=3, hinting=false;
const hintScreen=document.getElementById('hintScreen');
const hintScale=document.getElementById('hintScale');
const hintBar=document.getElementById('hintBar');
const hintImg=document.getElementById('hintImg');
const winImg=document.getElementById('winImg');
const HINT_BASE=`hint_${GAME_G.toLowerCase()}-${GAME_R.toLowerCase()}`;   // hints are for the game puzzle
const XL='http://www.w3.org/1999/xlink';
// win illustration: full (both colours)
winImg.setAttribute('href',HINT_BASE+'.svg'); winImg.setAttributeNS(XL,'xlink:href',HINT_BASE+'.svg');
// per-use hint config: 1st red@400%, 2nd green@400%, 3rd both@200%
// random focus that keeps the zoom window over the colour's artwork (most of the screen = object)
function hintFocus(variant){
  const b=config.hintBox[variant]||config.hintBox.both;
  const wW=VW/config.hintScale, wH=VH/config.hintScale;
  const rx=Math.max(0,(b[2]-wW)/2), ry=Math.max(0,(b[3]-wH)/2);
  return [ b[0]+b[2]/2 + (Math.random()*2-1)*rx, b[1]+b[3]/2 + (Math.random()*2-1)*ry ];
}
function doHint(){
  if(hinting||hintUses<=0||won()) return;
  const variant = active || 'both';                       // hint matches the colour being built
  const src = HINT_BASE + (variant==='both'?'':'_'+variant) + '.svg';
  const [fx,fy] = hintFocus(variant);
  hinting=true; paused=true;
  hintImg.setAttribute('href',src); hintImg.setAttributeNS(XL,'xlink:href',src);
  hintScale.setAttribute('transform',`translate(${CX} ${CY}) scale(${config.hintScale}) translate(${-fx} ${-fy})`);
  hintScreen.style.display='';
  hintBar.style.display=''; hintBar.setAttribute('width',0);
  const HINT_MS=config.hintMs;
  const t0=performance.now();
  (function grow(t){ const k=Math.min(1,(t-t0)/HINT_MS); hintBar.setAttribute('width',VW*k);
    if(k<1 && hinting) requestAnimationFrame(grow); })(t0);
  hintTimer=setTimeout(endHint,HINT_MS);
}
let hintTimer=null;
function endHint(){
  hintScreen.style.display='none'; hintBar.style.display='none';
  hintUses--; hinting=false; paused=false;
  renderHintLabel();
  if(hintUses<=0){ const c=document.getElementById('hudHint'); /* keep label, just no action */ }
}

// ---- win / game over ----
function onWin(){
  renderTimer();                                   // timer -> CLEAR! (text.svg)
  document.getElementById('hudHint').style.display='none';
  curBoard={tx:30,ty:10,s:0.55};                    // clear screen: shrink anagram
  boardG.setAttribute('transform',`translate(${curBoard.tx} ${curBoard.ty}) scale(${curBoard.s})`);
  winImg.style.display='';                          // reveal the illustration
  cleared = true; freeDrag = true;                  // letters stay draggable, arrows follow
  requestAnimationFrame(floatLoop);                 // letters drift gently to show they're touchable
}
// each letter drifts in its own random direction and the arrows follow; a grabbed letter holds still
function floatLoop(ts){
  if(!freeDrag) return;
  for(const id in nodeEls){ const n=nodeEls[id], f=n.float;
    const base=positions[id], grabbed=(moveDrag && moveDrag.id===id);
    const ox=grabbed?0:Math.sin(ts*0.001*f.sx+f.px)*f.ax;
    const oy=grabbed?0:Math.sin(ts*0.001*f.sy+f.py)*f.ay;
    n.cx=base[0]+ox; n.cy=base[1]+oy;
    const a=GLYPHS[id]?GLYPHS[id].c:[0,0];
    n.g.setAttribute('transform',`translate(${n.cx-a[0]} ${n.cy-a[1]})`);
  }
  computeGeo(); drawAllArrows();                 // arrows follow the drift (all shown)
  placeMarkers();                                // initial markers (title) / follow heads (post-clear)
  requestAnimationFrame(floatLoop);
}
function gameOver(){
  if(won()) return;
  paused=true;
  const ov=document.getElementById('overGameover'); ov.style.display='';
  setText(document.getElementById('goText'),'GAME OVER',{x:CX,y:380,size:64,color:'#111',align:'center'});
  const rw=setText(document.getElementById('goRetry'),'RETRY',{x:CX-110,y:470,size:30,color:'#111',align:'center'});
  hitRect(document.getElementById('goRetry'),CX-110-rw/2-8,440,rw+16,42,()=>location.reload());
  const ew=setText(document.getElementById('goExit'),'EXIT',{x:CX+110,y:470,size:30,color:'#111',align:'center'});
  hitRect(document.getElementById('goExit'),CX+110-ew/2-8,440,ew+16,42,goEditor);
}
function goEditor(){ location.reload(); }  // back to title

// ---- title / start screen: the SWAY-WAYS diagram is shown as a logo ----
let started=false;
function startIndicator(container, word, color, align){
  const x = align==='right'?1422:34;
  if(TEXTS[word]) placeWord(container, word, {x, y:790, size:30, color, align});
  else setText(container, '?'.repeat(word.length), {x, y:790, size:30, color, align});
}
function renderStartScreen(){
  // title logo: the SWAY/WAYS diagram, drawn with the arrow engine at random positions
  setWords(TITLE_G, TITLE_R);
  positions=defaultPositions();
  placeLetters(); computeGeo(); drawAllArrows(); placeMarkers();   // initial ◆/● on the title too
  // bottom indicators come from text.svg (SWAY / WAYS)
  startIndicator(document.getElementById('hudGreen'), GREEN, 'var(--green)', 'left');
  startIndicator(document.getElementById('hudRed'),   RED,   'var(--red)',   'right');
  renderStartButton();
  freeDrag=true;                       // title letters float & can be dragged
  requestAnimationFrame(floatLoop);
}
function renderStartButton(){
  const c=document.getElementById('hudStart'); c.innerHTML='';
  const size=34, padX=34, padY=12, y=792;
  const w=Math.max(wordWidth('READY?',size), wordWidth('START',size));
  const pillW=w+padX*2, pillH=size+padY*2, pillX=CX-pillW/2, pillY=y-size-padY;
  const pill=document.createElementNS(NS,'rect');
  pill.setAttribute('x',pillX); pill.setAttribute('y',pillY);
  pill.setAttribute('width',pillW); pill.setAttribute('height',pillH);
  pill.setAttribute('rx',pillH/2); pill.setAttribute('ry',pillH/2);
  pill.setAttribute('fill','#fff'); pill.setAttribute('stroke','#222'); pill.setAttribute('stroke-width','2.5');
  c.appendChild(pill);
  const ink=document.createElementNS(NS,'g'); c.appendChild(ink);
  const label=(word,col)=>{ ink.innerHTML=''; placeWord(ink,word,{x:CX,y,size,color:col,align:'center'}); };
  label('READY?','#222');
  const hit=document.createElementNS(NS,'rect');
  hit.setAttribute('class','hit'); hit.setAttribute('x',pillX); hit.setAttribute('y',pillY);
  hit.setAttribute('width',pillW); hit.setAttribute('height',pillH); hit.setAttribute('rx',pillH/2);
  hit.addEventListener('mouseenter',()=>{ pill.setAttribute('fill','#000'); pill.setAttribute('stroke','#000'); label('START','#fff'); });
  hit.addEventListener('mouseleave',()=>{ pill.setAttribute('fill','#fff'); pill.setAttribute('stroke','#222'); label('READY?','#222'); });
  hit.addEventListener('click', startGame);
  hit.addEventListener('touchstart', e=>{e.preventDefault(); startGame();}, {passive:false});
  c.appendChild(hit);
}
function startGame(){
  if(started) return;
  started=true; freeDrag=false; active=null;           // stop the title float/drag; colour not yet chosen
  document.getElementById('hudStart').innerHTML='';   // remove READY? button
  document.getElementById('hudGreen').innerHTML=''; document.getElementById('hudRed').innerHTML='';
  // switch to the actual puzzle (STEP / PETS) with a fresh random layout
  setWords(GAME_G, GAME_R);
  positions=defaultPositions();
  placeLetters(); computeGeo();
  gArrowsLive.innerHTML=''; drawSolved();              // empty board to solve
  placeMarkers();                                     // gameplay markers
  renderExit(); renderHintLabel(); renderIndicators(); renderTimer();
  startTimer();
}

// ---- wire up ----
svg.addEventListener('mousedown', onDown);
svg.addEventListener('touchstart', onDown, {passive:false});
window.addEventListener('mousemove', onMove);
window.addEventListener('touchmove', onMove, {passive:false});
window.addEventListener('mouseup', onUp);
window.addEventListener('touchend', onUp);

// ---- init ----
CAPH = (function(){ const p=document.createElementNS(NS,'path'); p.setAttribute('d',GLYPHS['H'].d);
  measure.appendChild(p); const b=p.getBBox(); measure.removeChild(p); return b.height; })();
maxDigitW = Math.max(...'0123456789'.split('').map(d=>glyphMetrics(d).w));
renderStartScreen();   // wait on READY? before the game begins
