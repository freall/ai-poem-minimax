// Standalone poem learning app generator
import { writeFileSync, readFileSync } from 'fs';

const data = readFileSync('/workspace/poem-learning/src/data/poems.js', 'utf8');
const match = data.match(/const poems = ([\s\S]*?]);?\s*$/);
const poemsStr = match[1];

const navJS = `
const SEASONS = ["春季","夏季","秋季","冬季"];
const SEASON_ICONS = ["🌸","☀️","🍂","❄️"];
const SEASON_COLORS = ["#f472b6","#fbbf24","#f97316","#60a5fa"];
const FESTIVALS = [
  {name:"春节",icon:"🧧",color:"#ef4444"},
  {name:"元宵节",icon:"🏮",color:"#f97316"},
  {name:"清明节",icon:"🌿",color:"#10b981"},
  {name:"端午节",icon:"🐉",color:"#14b8a6"},
  {name:"七夕节",icon:"🌙",color:"#a855f7"},
  {name:"中秋节",icon:"🥮",color:"#f59e0b"},
  {name:"重阳节",icon:"🌺",color:"#ea580c"},
  {name:"除夕",icon:"🎆",color:"#dc2626"},
];

let state = {
  view: 'home', poemIdx: 0, quizStep: 0,
  quizIdx: 0, answers: [], showExp: false,
  confetti: false, progress: {}, tab: 0
};

const e = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const starsHTML = Array.from({length:80},(_,i)=>{
  const x=Math.random()*100,y=Math.random()*100,s=Math.random()*2+1,d=Math.random()*3;
  return '<div style="position:fixed;border-radius:50%;background:#fff;pointer-events:none;z-index:0;left:'+x+'%;top:'+y+'%;width:'+s+'px;height:'+s+'px;opacity:'+(Math.random()*.5+.2)+';animation:float '+(3+d)+'s ease-in-out '+d+'s infinite"></div>';
}).join('');

function confettiHTML() {
  if (!state.confetti) return '';
  return Array.from({length:60},(_,i)=>{
    const c=['#ffd700','#f87171','#4fc3f7','#86efac','#f97316','#a855f7'][i%6];
    const x=Math.random()*100,d=Math.random()*1.5,s=Math.random()*8+4;
    return '<div class="confetti-piece" style="left:'+x+'%;background:'+c+';width:'+s+'px;height:'+(i%3===0?s+'px':'4px')+';border-radius:'+(i%3===0?'50%':'2px')+';animation-delay:'+d+'s"></div>';
  }).join('');
}

function letter(i, done, correct) {
  const bg = done ? (correct ? '#4ade80' : '#f87171') : 'rgba(255,255,255,.1)';
  return '<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;font-size:.75rem;font-weight:bold;margin-right:8px;background:'+bg+'">'+(i===0?'A':i===1?'B':i===2?'C':'D')+'</span>';
}

function progBar(pct) {
  return '<div style="height:4px;background:rgba(255,255,255,.1);border-radius:2px;margin-top:.5rem"><div style="width:'+pct+'%;height:100%;background:linear-gradient(90deg,#67e8f9,#3b82f6);border-radius:2px;transition:width .3s"></div></div>';
}

function render() {
  const p = poems[state.poemIdx];
  const q = p?.quizzes?.[state.quizIdx];
  const solarPoems = poems.filter(pp => pp.category === 'solar');
  const festPoems = poems.filter(pp => pp.category === 'festival');
  const mastered = Object.values(state.progress).filter(v => v === 'mastered').length;
  const learned = Object.values(state.progress).filter(v => v === 'learned').length;
  const score = p ? p.quizzes.filter((qq, i) => state.answers[i] === qq.answer).length : 0;
  const pct = ((state.poemIdx + 1) / poems.length * 100).toFixed(1);
  const tabs = p ? [p.translation, p.background, p.authorIntro] : [];
  const stars = starsHTML;
  const confetti = confettiHTML();
  let content = '';

  if (state.view === 'home') {
    content = '<div class="screen home-screen">' +
      '<div class="stars-bg">'+stars+'</div>' + confetti +
      '<div class="app-title">📜</div>' +
      '<h1 class="grad-text">诗词大会</h1>' +
      '<p class="subtitle">24节气 · 传统节日</p>' +
      '<p class="sub">'+poems.length+'首精选古诗词</p>' +
      '<p class="score-tag">已掌握: '+mastered+' ⭐ | 已学习: '+learned+' ✅</p>' +
      '<div class="nav-btns">' +
        '<button class="btn btn-green" onclick="goSolar()">🌱 节气诗词</button>' +
        '<button class="btn btn-red" onclick="goFestival()">🎊 节日诗词</button>' +
      '</div>' +
      '<p class="tip">点击开始学习 · 每首诗后有趣味问答</p>' +
    '</div>';

  } else if (state.view === 'solar') {
    const seasonBtns = SEASONS.map((s, i) => {
      const cnt = poems.filter(pp => pp.season === s).length;
      const idx = poems.findIndex(pp => pp.season === s);
      return '<div class="cat-card" onclick="goPoem('+Math.max(0,idx)+')" style="background:linear-gradient(135deg,'+SEASON_COLORS[i]+'88,'+SEASON_COLORS[i]+'44);border-color:'+SEASON_COLORS[i]+'44;color:#fff">' +
        '<div class="cat-icon">'+SEASON_ICONS[i]+'</div><div class="cat-name">'+s+'</div><div class="cat-count">'+cnt+'首诗词</div></div>';
    }).join('');
    const poemCards = solarPoems.map((po, i) => {
      const badge = state.progress[po.id] === 'mastered' ? '<span class="badge star">⭐</span>' : state.progress[po.id] === 'learned' ? '<span class="badge check">✅</span>' : '';
      return '<div class="poem-card" onclick="goPoem('+i+')">' +
        '<div class="poem-top"><span class="poem-id">'+(po.id<10?'0'+po.id:po.id)+'</span>'+badge+'</div>' +
        '<div class="poem-title">'+e(po.poem)+'</div>' +
        '<div class="poem-author">'+e(po.dynasty)+'·'+e(po.author)+'</div>' +
        '<div class="poem-tag">'+e(po.term)+'</div></div>';
    }).join('');
    content = '<div class="screen">' +
      '<div class="stars-bg">'+stars+'</div>' +
      '<button class="back-btn" onclick="goHome()">← 返回首页</button>' +
      '<h2 class="section-title">🌱 二十四节气</h2>' +
      '<div class="cat-grid">'+seasonBtns+'</div>' +
      '<h3 class="poem-list-title">📚 全部节气诗词 · '+solarPoems.length+'首</h3>' +
      '<div class="poem-grid">'+poemCards+'</div>' +
    '</div>';

  } else if (state.view === 'festival') {
    const festBtns = FESTIVALS.map(f => {
      const cnt = poems.filter(pp => pp.festivalName === f.name).length;
      const idx = poems.findIndex(pp => pp.festivalName === f.name);
      if (idx < 0) return '<div class="cat-card" style="background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.1);color:#666;opacity:.5"><div class="cat-icon">'+f.icon+'</div><div class="cat-name">'+f.name+'</div><div class="cat-count">待添加</div></div>';
      return '<div class="cat-card" onclick="goPoem('+idx+')" style="background:linear-gradient(135deg,'+f.color+'88,'+f.color+'44);border-color:'+f.color+'44;color:#fff">' +
        '<div class="cat-icon">'+f.icon+'</div><div class="cat-name">'+f.name+'</div><div class="cat-count">'+cnt+'首</div></div>';
    }).join('');
    const poemCards = festPoems.length === 0 ? '<div class="empty-msg">节日诗词陆续添加中...</div>' :
      festPoems.map((po) => {
        const idx = poems.indexOf(po);
        const badge = state.progress[po.id] === 'mastered' ? '<span class="badge star">⭐</span>' : state.progress[po.id] === 'learned' ? '<span class="badge check">✅</span>' : '';
        return '<div class="poem-card" onclick="goPoem('+idx+')">' +
          '<div class="poem-top"><span class="poem-id">'+(po.id<10?'0'+po.id:po.id)+'</span>'+badge+'</div>' +
          '<div class="poem-title">'+e(po.poem)+'</div>' +
          '<div class="poem-author">'+e(po.dynasty)+'·'+e(po.author)+'</div>' +
          '<div class="poem-tag fest-tag">'+e(po.festivalName||'')+'</div></div>';
      }).join('');
    content = '<div class="screen">' +
      '<div class="stars-bg">'+stars+'</div>' +
      '<button class="back-btn" onclick="goHome()">← 返回首页</button>' +
      '<h2 class="section-title">🎊 传统节日</h2>' +
      '<div class="cat-grid">'+festBtns+'</div>' +
      (festPoems.length > 0 ? '<div><h3 class="poem-list-title">📚 全部节日诗词 · '+festPoems.length+'首</h3><div class="poem-grid">'+poemCards+'</div></div>' : '') +
    '</div>';

  } else if (state.view === 'poem' && p) {
    const backView = p.category === 'solar' ? 'solar' : 'festival';
    const tabBtns = ['翻译','背景','诗人'].map((t, i) =>
      '<button class="'+(state.tab===i?'tab active':'tab')+'" onclick="setTab('+i+')">'+t+'</button>'
    ).join('');

    if (state.quizStep === 0) {
      content = '<div class="screen">' +
        '<div class="stars-bg">'+stars+'</div>' + confetti +
        '<div class="poem-header">' +
          '<button class="back-btn" onclick="goCat()">← 返回</button>' +
          '<div class="header-center"><div class="progress-text">'+(state.poemIdx+1)+' / '+poems.length+'</div><div style="width:10rem;height:4px;background:rgba(255,255,255,.1);border-radius:2px;margin-top:.25rem"><div style="width:'+pct+'%;height:100%;background:linear-gradient(90deg,#67e8f9,#3b82f6);border-radius:2px"></div></div></div>' +
          '<span class="poem-tag-label">'+e(p.term||p.festivalName||'')+'</span>' +
        '</div>' +
        '<div class="poem-card" style="cursor:default;padding:1.5rem;margin-bottom:1.5rem">' +
          '<div class="poem-emoji">'+(p.category==='solar'?'🌱':'🎊')+'</div>' +
          '<h2 class="poem-name">'+e(p.poem)+'</h2>' +
          '<p class="poem-author-lg">'+e(p.dynasty)+'·'+e(p.author)+'</p>' +
          '<pre class="poem-content">'+e(p.content)+'</pre>' +
          '<div style="display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap">'+tabBtns+'</div>' +
          '<div class="tab-content">'+e(tabs[state.tab]||'')+'</div>' +
        '</div>' +
        '<button class="btn btn-cyan" onclick="startQuiz()" style="width:100%;padding:1rem;font-size:1.1rem">开始答题 →</button>' +
        '<button class="btn btn-ghost" onclick="goCat()" style="width:100%;margin-top:.5rem">← 返回分类</button>' +
      '</div>';

    } else if (state.quizStep === 1 && q) {
      const opts = q.options.map((opt, i) => {
        const done = state.showExp;
        const correct = i === q.answer;
        const wrong = state.answers[state.quizIdx] === i && !correct;
        const cls = done ? (correct ? 'quiz-opt correct' : wrong ? 'quiz-opt wrong' : 'quiz-opt') : 'quiz-opt';
        return '<button class="'+cls+'" '+(done?'':'onclick="answerQuiz('+i+')"')+'>' + letter(i, done, correct) + e(opt) + '</button>';
      }).join('');
      const expHTML = state.showExp ? '<div class="explanation '+(state.answers[state.quizIdx]===q.answer?'exp-correct':'exp-wrong')+'">' +
        '<div class="exp-title">'+(state.answers[state.quizIdx]===q.answer?'🎉 正确！':'💡 答案解析')+'</div>' +
        '<div>'+e(q.explanation)+'</div></div>' : '';
      content = '<div class="screen">' +
        '<div class="stars-bg">'+stars+'</div>' + confetti +
        '<button class="back-btn" onclick="backToPoem()">← 返回诗词</button>' +
        '<div class="quiz-header">' +
          '<div class="quiz-icon">📝</div>' +
          '<h3 class="quiz-poem-name">'+e(p.poem)+'</h3>' +
          '<p class="quiz-author">'+e(p.dynasty)+'·'+e(p.author)+'</p>' +
          '<p class="quiz-progress">第 '+(state.quizIdx+1)+' / '+p.quizzes.length+' 题</p>' +
          '<div style="height:4px;background:rgba(255,255,255,.1);border-radius:2px;margin-top:.5rem"><div style="width:'+((state.quizIdx+1)/p.quizzes.length*100)+'%;height:100%;background:linear-gradient(90deg,#67e8f9,#3b82f6);border-radius:2px"></div></div>' +
        '</div>' +
        '<div class="poem-card" style="cursor:default;padding:1.5rem;margin-bottom:1rem">' +
          '<div class="quiz-q-label">问题 '+(state.quizIdx+1)+'</div>' +
          '<div class="quiz-q">'+e(q.q)+'</div>' +
          '<div class="quiz-options">'+opts+'</div>' +
          expHTML +
        '</div>' +
      '</div>';

    } else if (state.quizStep === 2) {
      content = '<div class="screen" style="text-align:center">' +
        '<div class="stars-bg">'+stars+'</div>' + confetti +
        '<div class="result-emoji">'+(score===p.quizzes.length?'🌟':'👍')+'</div>' +
        '<h2 class="result-title" style="color:'+(score===p.quizzes.length?'#fbbf24':'#67e8f9')+'">'+(score===p.quizzes.length?'太棒了！全部答对！':'继续加油！')+'</h2>' +
        '<p class="result-score">正确率 '+score+' / '+p.quizzes.length+'</p>' +
        '<pre class="poem-content" style="text-align:center;background:rgba(255,255,255,.05);border-radius:1rem;padding:1.5rem;margin:1rem auto;max-width:32rem;border:1px solid rgba(255,255,255,.1);color:#fde68a;font-size:.875rem;line-height:1.8">'+e(p.content)+'</pre>' +
        '<div class="result-btns">' +
          '<button class="btn btn-ghost" onclick="restartQuiz()">再学一遍</button>' +
          '<button class="btn btn-cyan" onclick="nextPoem()">'+(state.poemIdx<poems.length-1?'下一首 →':'完成 ✅')+'</button>' +
        '</div>' +
      '</div>';
    }
  }

  document.getElementById('app').innerHTML = content;
}

window.goHome = () => { state.view='home'; render(); };
window.goSolar = () => { state.view='solar'; state.quizStep=0; render(); };
window.goFestival = () => { state.view='festival'; state.quizStep=0; render(); };
window.goCat = () => { const p=poems[state.poemIdx]; state.view=p?.category==='solar'?'solar':'festival'; render(); };
window.goPoem = (idx) => { state.poemIdx=idx; state.view='poem'; state.quizStep=0; state.quizIdx=0; state.answers=[]; state.showExp=false; state.tab=0; render(); };
window.backToPoem = () => { state.quizStep=0; render(); };
window.startQuiz = () => { state.quizStep=1; state.quizIdx=0; state.answers=[]; state.showExp=false; render(); };
window.restartQuiz = () => { state.quizStep=1; state.quizIdx=0; state.answers=[]; state.showExp=false; render(); };
window.setTab = (i) => { state.tab=i; render(); };
window.answerQuiz = (optIdx) => {
  if (state.showExp) return;
  const p = poems[state.poemIdx];
  const q = p.quizzes[state.quizIdx];
  const correct = optIdx === q.answer;
  const na=[...state.answers]; na[state.quizIdx]=optIdx; state.answers=na;
  state.showExp=true;
  if (correct) {
    state.confetti=true;
    setTimeout(()=>{
      state.confetti=false;
      if (state.quizIdx < p.quizzes.length-1) { state.quizIdx++; state.showExp=false; }
      else { state.progress[p.id]='mastered'; state.quizStep=2; }
      render();
    },1200);
  } else {
    setTimeout(()=>{
      if (state.quizIdx < p.quizzes.length-1) { state.quizIdx++; state.showExp=false; }
      else { state.progress[p.id]='learned'; state.quizStep=2; }
      render();
    },2500);
  }
  render();
};
window.nextPoem = () => {
  const p = poems[state.poemIdx];
  const sc = p.quizzes.filter((q,i)=>state.answers[i]===q.answer).length;
  state.progress[p.id] = sc===p.quizzes.length?'mastered':'learned';
  state.quizStep=2; render();
  setTimeout(()=>{
    if (state.poemIdx < poems.length-1) { state.poemIdx++; state.quizStep=0; state.quizIdx=0; state.answers=[]; state.showExp=false; state.tab=0; }
    else { state.view='home'; }
    render();
  }, 3000);
};

render();
`;

const fullHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>诗词大会 - 24节气与传统节日</title>
<link href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Noto Serif SC',serif;background:linear-gradient(135deg,#0a0a1a,#0d1a2e);color:#f0e6d3;min-height:100vh;overflow-x:hidden}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-thumb{background:#4fc3f7;border-radius:3px}
@keyframes float{0%,100%{transform:translateY(0)}33%{transform:translateY(-12px)}66%{transform:translateY(-6px)}}
@keyframes bounceIn{0%{transform:scale(0.3);opacity:0}50%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
@keyframes confetti{0%{transform:translateY(-10vh) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
.stars-bg{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.confetti-piece{position:fixed;top:-20px;border-radius:3px;animation:confetti 2.5s ease-in forwards;pointer-events:none;z-index:9999}
.grad-text{background:linear-gradient(135deg,#ffd700,#ff6b6b,#4fc3f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-size:200% auto;animation:shimmer 3s linear infinite;font-size:3rem;font-weight:bold;margin-bottom:.5rem}
.app-title{font-size:5rem;margin-bottom:.5rem;animation:float 4s ease-in-out infinite}
.home-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem 1rem;position:relative}
.subtitle{color:#67e8f9;font-size:1.1rem;margin-bottom:.5rem}
.sub{color:#9ca3af;margin-bottom:.5rem}
.score-tag{color:#fbbf24;font-size:.8rem;margin-bottom:.5rem}
.nav-btns{display:flex;flex-direction:column;gap:1rem;margin-top:2rem;position:relative;z-index:10}
.tip{color:#6b7280;font-size:.7rem;margin-top:2rem}
.btn{padding:12px 24px;border-radius:16px;font-weight:bold;cursor:pointer;border:none;transition:all .2s;display:inline-block;font-size:1rem}
.btn:hover{transform:scale(1.03)}
.btn-green{background:linear-gradient(135deg,#10b981,#059669);color:#fff}
.btn-red{background:linear-gradient(135deg,#dc2626,#ea580c);color:#fff}
.btn-cyan{background:linear-gradient(135deg,#06b6d4,#2563eb);color:#fff}
.btn-ghost{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#d1d5db}
.screen{padding:2rem 1rem;max-width:56rem;margin:0 auto;min-height:100vh;position:relative}
.back-btn{color:#67e8f9;background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:.5rem;font-size:.875rem;margin-bottom:2rem;padding:0}
.section-title{text-align:center;margin-bottom:2rem;color:#fbbf24;font-size:1.75rem;font-weight:bold}
.poem-list-title{text-align:center;color:#9ca3af;margin-bottom:1rem;font-size:1rem;margin-top:1rem}
.cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:1rem;margin-bottom:2.5rem}
.cat-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:1rem;text-align:center;cursor:pointer;transition:all .2s}
.cat-card:hover{border-color:rgba(79,195,247,.4);transform:translateY(-2px)}
.cat-icon{font-size:2.5rem;margin-bottom:.25rem}
.cat-name{font-weight:bold;font-size:.9rem;color:#fff}
.cat-count{font-size:.7rem;opacity:.8;margin-top:.25rem}
.poem-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.75rem}
.poem-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:1rem;cursor:pointer;transition:all .2s;text-align:left;display:block}
.poem-card:hover{border-color:rgba(79,195,247,.4);transform:translateY(-2px)}
.poem-top{display:flex;justify-content:space-between;margin-bottom:.25rem;align-items:center}
.poem-id{font-size:.7rem;color:#fbbf24;font-weight:bold}
.badge{font-size:.7rem}
.star{color:#fbbf24}
.check{color:#34d399}
.poem-title{font-weight:bold;font-size:.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#f0e6d3}
.poem-author{font-size:.75rem;color:#9ca3af;margin-top:.1rem}
.poem-tag{font-size:.7rem;color:#67e8f9;opacity:.6;margin-top:.25rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fest-tag{color:#f97316;opacity:.7}
.poem-emoji{font-size:2.5rem;margin-bottom:.5rem;text-align:center}
.poem-name{color:#fbbf24;font-size:1.75rem;margin-bottom:.25rem;text-align:center;font-weight:bold}
.poem-author-lg{color:#67e8f9;font-size:.9rem;text-align:center;margin-bottom:1.5rem}
.poem-content{font-family:'Ma Shan Zheng','Noto Serif SC',serif;font-size:1.1rem;line-height:2;text-align:center;background:rgba(15,23,42,.8);border-radius:1rem;padding:1.5rem;margin-bottom:1.5rem;border:1px solid rgba(245,158,11,.2);color:#fde68a;white-space:pre-wrap}
.tab{display:inline-block;padding:8px 16px;border-radius:999px;font-size:.8rem;cursor:pointer;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#9ca3af;transition:all .2s}
.tab.active{background:rgba(79,195,247,.2);color:#67e8f9;border-color:rgba(79,195,247,.4);font-weight:bold}
.tab-content{font-size:.875rem;color:#d1d5db;line-height:1.7;min-height:80px;padding:1rem;background:rgba(255,255,255,.03);border-radius:12px}
.poem-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem}
.header-center{text-align:center}
.progress-text{font-size:.75rem;color:#6b7280}
.poem-tag-label{font-size:.7rem;color:#6b7280}
.quiz-header{text-align:center;margin-bottom:1rem}
.quiz-icon{font-size:2rem;margin-bottom:.5rem}
.quiz-poem-name{color:#fbbf24;font-size:1.1rem;margin-bottom:.25rem;font-weight:bold}
.quiz-author{color:#9ca3af;font-size:.75rem}
.quiz-progress{color:#6b7280;font-size:.7rem;margin-top:.5rem}
.quiz-q-label{color:#67e8f9;font-size:.75rem;font-weight:bold;margin-bottom:.75rem}
.quiz-q{font-size:1.1rem;font-weight:bold;line-height:1.6;margin-bottom:1.25rem}
.quiz-options{display:flex;flex-direction:column;gap:.5rem}
.quiz-opt{width:100%;padding:16px;border-radius:12px;text-align:left;background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);color:#d1d5db;cursor:pointer;transition:all .2s;font-size:.95rem;font-family:inherit}
.quiz-opt:hover:not(:disabled){border-color:rgba(79,195,247,.5);background:rgba(79,195,247,.1)}
.quiz-opt.correct{border-color:#4ade80;background:rgba(74,222,128,.2);color:#86efac;animation:bounceIn .4s}
.quiz-opt.wrong{border-color:#f87171;background:rgba(248,113,113,.15);color:#fca5a5;animation:shake .4s}
.quiz-opt:disabled{cursor:default}
.explanation{margin-top:1rem;padding:1rem;border-radius:12px;font-size:.875rem;line-height:1.6;animation:slideUp .4s}
.exp-correct{background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.3);color:#86efac}
.exp-wrong{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.3);color:#fca5a5}
.exp-title{font-weight:bold;margin-bottom:.25rem}
.result-emoji{font-size:5rem;margin-bottom:1rem;animation:bounceIn .5s}
.result-title{font-size:2rem;margin-bottom:.5rem;font-weight:bold}
.result-score{color:#9ca3af;margin-bottom:1rem}
.result-btns{display:flex;gap:1rem;justify-content:center;margin-top:1.5rem;flex-wrap:wrap}
.empty-msg{text-align:center;color:#6b7280;padding:2rem;font-size:.9rem}
</style>
</head>
<body>
<div id="app"></div>
<script>
const poems = ${poemsStr};
${navJS}
</script>
</body>
</html>`;

writeFileSync('/workspace/poem-learning/index.html', fullHTML);
console.log('Written:', fullHTML.length, 'bytes');
