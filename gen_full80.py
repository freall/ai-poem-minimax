#!/usr/bin/env python3
"""Generate full 80-poem app with images"""
import json, os

# CDN URLs for AI-generated images
CDN_URLS = {
    25: 'https://cdn.hailuoai.com/mcp/image_tool/output/473932182464974854/372569239945651/1775439142_219a64f9.jpg',
    26: 'https://cdn.hailuoai.com/mcp/image_tool/output/473932182464974854/372569239945651/1775439196_c9d8b36d.jpg',
    # 27-34 not yet uploaded
}

# Season gradient backgrounds
SEASON_GRAD = {
    '春季': 'linear-gradient(135deg,#2d5016,#4a7c23,#6bb92d)',
    '夏季': 'linear-gradient(135deg,#1a3a5c,#2d6aa0,#4a9fd4)',
    '秋季': 'linear-gradient(135deg,#8B4513,#CD853F,#DAA520)',
    '冬季': 'linear-gradient(135deg,#1a2a3a,#2d4a6a,#4a7ab4)',
    'festival': 'linear-gradient(135deg,#4a1a1a,#8B0000,#DC143C)',
}

# Read poems
with open('/workspace/poem-learning/poems80.json', encoding='utf-8') as f:
    poems = json.load(f)

# Build image URL map
img_urls = {}
local_map = {
    26: '/workspace/imgs/poem26_王维山居秋暝诗配画获奖2张-古诗配画网.jpg',
    29: '/workspace/imgs/poem29_杜甫月夜忆舍弟戍鼓断人行边秋一雁声全诗翻译赏析.jpg',
    45: '/workspace/imgs/poem45_杜牧清明诗的诗眼-_光明日报_光明网.jpg',
    47: '/workspace/imgs/poem47_赛龙舟----端午节传统活动--亦适达.jpg',
    48: '/workspace/imgs/poem48_织女牛郎鹊桥相会_百度百科.jpg',
}

# Add CDN or local paths
for p in poems:
    pid = p['id']
    if pid in CDN_URLS:
        p['imgUrl'] = CDN_URLS[pid]
    elif pid in local_map and os.path.exists(local_map[pid]):
        p['imgUrl'] = local_map[pid]
    else:
        p['imgUrl'] = None

count = sum(1 for p in poems if p.get('imgUrl'))
print(f"Images: {count}/{len(poems)}")

# Save updated poems
with open('/workspace/poem-learning/poems80.json', 'w', encoding='utf-8') as f:
    json.dump(poems, f, ensure_ascii=False, indent=2)

# Generate HTML
html = open('/workspace/poem-learning/index.html', 'w', encoding='utf-8')
html.write('''<!DOCTYPE html>
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
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.stars{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.star{position:fixed;border-radius:50%;background:#fff;pointer-events:none;z-index:0}
.confetti-piece{position:fixed;top:-20px;border-radius:3px;animation:confetti 2.5s ease-in forwards;pointer-events:none;z-index:9999}
.grad-text{background:linear-gradient(135deg,#ffd700,#ff6b6b,#4fc3f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-size:200% auto;animation:shimmer 3s linear infinite}
.card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:20px;backdrop-filter:blur(10px);transition:all .2s;cursor:pointer;display:block;text-decoration:none;color:inherit}
.card:hover{border-color:rgba(79,195,247,.4);transform:translateY(-2px);box-shadow:0 4px 20px rgba(79,195,247,.15)}
.btn{padding:12px 24px;border-radius:16px;font-weight:bold;cursor:pointer;border:none;transition:all .2s;display:inline-block;font-size:1rem}
.btn:hover{transform:scale(1.03)}
.tab{padding:8px 16px;border-radius:999px;font-size:.8rem;cursor:pointer;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#9ca3af;transition:all .2s;display:inline-block}
.tab.active{background:rgba(79,195,247,.2);color:#67e8f9;border-color:rgba(79,195,247,.4);font-weight:bold}
.quiz-opt{width:100%;padding:16px;border-radius:12px;text-align:left;background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);color:#d1d5db;cursor:pointer;transition:all .2s;margin-bottom:8px;font-size:.95rem;font-family:inherit}
.quiz-opt:hover:not(:disabled){border-color:rgba(79,195,247,.5);background:rgba(79,195,247,.1)}
.quiz-opt.correct{border-color:#4ade80;background:rgba(74,222,128,.2);color:#86efac;animation:bounceIn .4s}
.quiz-opt.wrong{border-color:#f87171;background:rgba(248,113,113,.15);color:#fca5a5;animation:shake .4s}
.quiz-opt:disabled{cursor:default}
.prog-bar{height:4px;background:rgba(255,255,255,.1);border-radius:2px}
.prog-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,#67e8f9,#3b82f6);transition:width .4s}
.screen{padding:2rem 1rem;max-width:56rem;margin:0 auto;min-height:100vh;position:relative}
.poem-pre{font-family:'Ma Shan Zheng','Noto Serif SC',serif;white-space:pre-wrap}
.poem-img{max-height:200px;width:100%;object-fit:cover;border-radius:12px;margin-bottom:1rem}
.poem-img-placeholder{height:160px;border-radius:12px;margin-bottom:1rem;display:flex;align-items:center;justify-content:center;font-size:3rem;opacity:.3}
.animate-in{animation:fadeIn .4s ease-out}
.grade-badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:.7rem;font-weight:bold}
.grade-mastered{background:rgba(251,191,36,.2);color:#fbbf24;border:1px solid rgba(251,191,36,.4)}
.grade-learned{background:rgba(74,222,128,.2);color:#4ade80;border:1px solid rgba(74,222,128,.4)}
</style>
</head>
<body>
<div id="app"></div>
<script>
const poems = ''' + json.dumps(poems, ensure_ascii=False) + ''';
''')

html.write('''
const SEASONS = ["春季","夏季","秋季","冬季"];
const SEASON_ICONS = ["🌸","☀️","🍂","❄️"];
const SEASON_COLORS = ["#f472b6","#fbbf24","#f97316","#60a5fa"];
const SEASON_GRAD = {
  "春季": "linear-gradient(135deg,#1a3a05,#2d5016,#4a7c23)",
  "夏季": "linear-gradient(135deg,#1a3a5c,#2d6aa0,#4a9fd4)",
  "秋季": "linear-gradient(135deg,#5c2d0a,#8B4513,#CD853F)",
  "冬季": "linear-gradient(135deg,#1a2a3a,#2d4a6a,#4a7ab4)",
  "festival": "linear-gradient(135deg,#4a1a1a,#8B0000,#DC143C)"
};
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
  view:"home", poemIdx:0, quizStep:0,
  quizIdx:0, answers:[], showExp:false,
  confetti:false, progress:{}, tab:0
};

const e = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const starsHTML = Array.from({length:80},(_,i)=>{const x=Math.random()*100,y=Math.random()*100,s=Math.random()*2+1,d=Math.random()*3;return '<div class="star" style="position:fixed;border-radius:50%;background:#fff;pointer-events:none;z-index:0;left:'+x+'%;top:'+y+'%;width:'+s+'px;height:'+s+'px;opacity:'+(Math.random()*.5+.2)+';animation:float '+(3+d)+'s ease-in-out '+d+'s infinite"></div>';}).join('');

function confettiHTML() {
  if (!state.confetti) return "";
  return Array.from({length:60},(_,i)=>{const c=["#ffd700","#f87171","#4fc3f7","#86efac","#f97316","#a855f7"][i%6];const x=Math.random()*100,d=Math.random()*1.5,s=Math.random()*8+4;return '<div class="confetti-piece" style="left:'+x+'%;background:'+c+';width:'+s+'px;height:'+(i%3===0?s+"px":"4px")+';border-radius:'+(i%3===0?"50%":"2px")+';animation-delay:'+d+'s"></div>';}).join("");
}

function letter(i, done, correct) {
  const bg = done?(correct?"#4ade80":"#f87171"):"rgba(255,255,255,.1)";
  return '<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;font-size:.75rem;font-weight:bold;margin-right:8px;background:'+bg+'">'+(i===0?"A":i===1?"B":i===2?"C":"D")+"</span>";
}

function render() {
  const p = poems[state.poemIdx];
  const q = p?.quizzes?.[state.quizIdx];
  const solarPoems = poems.filter(pp => pp.category === "solar");
  const festPoems = poems.filter(pp => pp.category === "festival");
  const mastered = Object.values(state.progress).filter(v => v === "mastered").length;
  const learned = Object.values(state.progress).filter(v => v === "learned").length;
  const score = p ? p.quizzes.filter((qq, i) => state.answers[i] === qq.answer).length : 0;
  const pct = ((state.poemIdx + 1) / poems.length * 100).toFixed(1);
  const stars = starsHTML;
  const confetti = confettiHTML();
  let content = "";

  if (state.view === "home") {
    const solarBySeason = {};
    SEASONS.forEach(s => { solarBySeason[s] = solarPoems.filter(pp => pp.season === s); });
    const solarCards = SEASONS.map((s, i) => {
      const cnt = solarBySeason[s].length;
      return '<div class="card" onclick="goSeason('+"'"+s+"'"+')" style="background:'+SEASON_GRAD[s]+';border-color:'+SEASON_COLORS[i]+'44;color:#fff;text-align:center">' +
        '<div style="font-size:2.5rem;margin-bottom:.25rem">'+SEASON_ICONS[i]+'</div>' +
        '<div style="font-weight:bold">'+s+'</div>' +
        '<div style="font-size:.7rem;opacity:.8;margin-top:.25rem">'+cnt+'首诗词</div></div>';
    }).join("");
    const festCards = FESTIVALS.map(f => {
      const cnt = festPoems.filter(pp => pp.festivalName === f.name).length;
      const pidx = poems.findIndex(pp => pp.festivalName === f.name);
      return '<div class="card" onclick="goPoem('+pidx+')" style="background:linear-gradient(135deg,'+f.color+'88,'+f.color+'44);border-color:'+f.color+'44;color:#fff;text-align:center">' +
        '<div style="font-size:2.5rem;margin-bottom:.25rem">'+f.icon+'</div>' +
        '<div style="font-weight:bold;font-size:.875rem">'+f.name+'</div>' +
        '<div style="font-size:.7rem;opacity:.8;margin-top:.25rem">'+(cnt>0?cnt+'首':'即将推出')+'</div></div>';
    }).join("");
    content = '<div class="screen home-screen">' +
      '<div class="stars">'+stars+'</div>' + confetti +
      '<div style="font-size:5rem;margin-bottom:.5rem;animation:float 4s ease-in-out infinite">📜</div>' +
      '<h1 class="grad-text" style="font-size:3rem;font-weight:bold;margin-bottom:.5rem">诗词大会</h1>' +
      '<p style="color:#67e8f9;font-size:1.1rem;margin-bottom:.5rem">24节气 · 传统节日</p>' +
      '<p style="color:#9ca3af;margin-bottom:.5rem">'+poems.length+'首精选古诗词</p>' +
      '<p style="color:#fbbf24;font-size:.8rem;margin-bottom:1rem">已掌握: '+mastered+' ⭐ | 已学习: '+learned+' ✅</p>' +
      '<div class="animate-in" style="margin-bottom:1.5rem">' +
        '<h3 style="color:#fbbf24;font-size:1rem;margin-bottom:.75rem;text-align:center">🌱 节气诗词 · '+solarPoems.length+'首</h3>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:.75rem;margin-bottom:1.5rem">'+solarCards+'</div>' +
        '<h3 style="color:#fbbf24;font-size:1rem;margin-bottom:.75rem;text-align:center">🎊 节日诗词 · '+festPoems.length+'首</h3>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:.75rem">'+festCards+'</div>' +
      '</div>' +
      '<p style="color:#6b7280;font-size:.7rem;margin-top:1.5rem;text-align:center">点击任一分类开始学习 · 每首诗后有趣味问答</p>' +
    "</div>";
  } else if (state.view === "solar" || state.view === "fest") {
    const isSolar = state.view === "solar";
    const cats = isSolar ? SEASONS : FESTIVALS.map(f=>f.name);
    const filtered = isSolar ? solarPoems : festPoems;
    const catGrad = isSolar ? SEASON_GRAD : {};
    const catIcon = isSolar ? SEASON_ICONS : FESTIVALS.map(f=>f.icon);
    const catColor = isSolar ? SEASON_COLORS : FESTIVALS.map(f=>f.color);
    const catProps = isSolar ? {} : {};
    const catInfo = isSolar ? {} : FESTIVALS.reduce((acc,f)=>(acc[f.name]=f,acc),{});
    
    const catBtns = cats.map((cat, i) => {
      const grad = isSolar ? catGrad[cat] : 'linear-gradient(135deg,'+catInfo[cat].color+'88,'+catInfo[cat].color+'44)';
      const icon = isSolar ? catIcon[i] : catInfo[cat].icon;
      const col = isSolar ? catColor[i] : catInfo[cat].color;
      const firstIdx = poems.findIndex(pp => isSolar ? pp.season === cat : pp.festivalName === cat);
      return '<div class="card" onclick="goPoem('+Math.max(0,firstIdx)+')" style="background:'+grad+';border-color:'+col+'44;color:#fff;text-align:center;font-weight:bold">' +
        '<div style="font-size:2.5rem;margin-bottom:.25rem">'+icon+'</div><div>'+cat+'</div></div>';
    }).join("");
    
    const poemCards = filtered.map((po) => {
      const idx = poems.indexOf(po);
      const badge = state.progress[po.id]==="mastered"?"⭐":state.progress[po.id]==="learned"?"✅":"";
      const badgeClass = state.progress[po.id]==="mastered"?"grade-mastered":state.progress[po.id]==="learned"?"grade-learned":"";
      const grad = SEASON_GRAD[po.season] || SEASON_GRAD["festival"];
      return '<div class="card animate-in" onclick="goPoem('+idx+')" style="background:'+grad+';border-color:rgba(255,255,255,.1);text-align:left;position:relative;overflow:hidden">' +
        '<div style="position:absolute;top:0;right:0;width:60%;height:100%;opacity:.1;font-size:4rem;pointer-events:none;text-align:right;line-height:1;padding-right:.5rem;padding-top:.5rem">'+(po.season?SEASON_ICONS[SEASONS.indexOf(po.season)]:FESTIVALS.find(f=>f.name===po.festivalName)?.icon||"🎊")+'</div>' +
        '<div style="position:relative;z-index:1">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.25rem">' +
          '<span style="font-size:.7rem;color:#fbbf24;font-weight:bold">'+String(po.id).padStart(2,"0")+'</span>' +
          (badge?'<span class="grade-badge '+badgeClass+'">'+badge+'</span>':"") +
        '</div>' +
        '<div style="font-weight:bold;font-size:1rem;margin-bottom:.2rem">'+e(po.poem)+'</div>' +
        '<div style="font-size:.75rem;color:rgba(255,255,255,.7);margin-bottom:.25rem">'+e(po.dynasty)+'·'+e(po.author)+'</div>' +
        '<div style="font-size:.7rem;color:rgba(79,195,247,.8)">'+(po.term||po.festivalName||"")+'</div></div>' +
      '</div>';
    }).join("");
    
    const catTitle = isSolar ? "🌱 节气诗词" : "🎊 传统节日";
    const backFn = "goHome()";
    content = '<div class="screen">' +
      '<div class="stars">'+stars+'</div>' +
      '<button onclick="'+backFn+'" style="color:#67e8f9;margin-bottom:1.5rem;background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:.5rem;font-size:.875rem">← 返回首页</button>' +
      '<h2 style="text-align:center;margin-bottom:1.5rem;color:#fbbf24;font-size:1.5rem;font-weight:bold">'+catTitle+'</h2>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:.75rem;margin-bottom:2rem">'+catBtns+'</div>' +
      '<h3 style="text-align:center;color:#9ca3af;margin-bottom:1rem;font-size:.9rem">📚 全部诗词 · '+filtered.length+'首</h3>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.75rem">'+poemCards+'</div>' +
    '</div>';
  } else if (state.view === "poem" && p) {
    const tabs = [p.translation, p.background, p.authorIntro];
    const tabLabels = ["翻译","背景","诗人"];
    const hasImg = !!p.imgUrl;
    const grad = SEASON_GRAD[p.season] || SEASON_GRAD["festival"];
    
    if (state.quizStep === 0) {
      const tabBtns = tabLabels.map((t, i) =>
        '<button onclick="setTab('+i+')" class="'+(state.tab===i?"tab active":"tab")+'">'+t+'</button>'
      ).join("");
      const imgHTML = hasImg
        ? '<img class="poem-img" src="'+p.imgUrl+'" alt="'+e(p.poem)+'" onerror="this.style.display=\\'none\\'" />'
        : '<div class="poem-img-placeholder" style="background:'+grad+'">📜</div>';
      content = '<div class="screen">' +
        '<div class="stars">'+stars+'</div>' + confetti +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">' +
          '<button onclick="goBack()" style="color:#67e8f9;background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:.5rem;font-size:.875rem">← 返回</button>' +
          '<div style="text-align:center"><div style="font-size:.75rem;color:#6b7280">'+(state.poemIdx+1)+' / '+poems.length+'</div>' +
            '<div style="width:8rem;height:4px;background:rgba(255,255,255,.1);border-radius:2px;margin-top:.25rem"><div style="width:'+pct+'%;height:100%;background:linear-gradient(90deg,#67e8f9,#3b82f6);border-radius:2px"></div></div></div>' +
          '<span style="font-size:.7rem;color:#6b7280">'+(p.term||p.festivalName||"")+'</span>' +
        '</div>' +
        '<div class="card animate-in" style="padding:1.5rem;cursor:default">' +
          imgHTML +
          '<div style="text-align:center;margin-bottom:1.5rem">' +
            '<div style="font-size:2.5rem;margin-bottom:.5rem">'+(p.category==="solar"?(p.season?SEASON_ICONS[SEASONS.indexOf(p.season)]||"📜":"📜"):(FESTIVALS.find(f=>f.name===p.festivalName)?.icon||"🎊"))+'</div>' +
            '<h2 style="color:#fbbf24;font-size:1.75rem;margin-bottom:.25rem;font-weight:bold">'+e(p.poem)+'</h2>' +
            '<p style="color:#67e8f9;font-size:.9rem">'+e(p.dynasty)+'·'+e(p.author)+'</p>' +
          '</div>' +
          '<pre class="poem-pre" style="font-size:1.1rem;line-height:2;text-align:center;background:rgba(15,23,42,.8);border-radius:1rem;padding:1.5rem;margin-bottom:1.5rem;border:1px solid rgba(245,158,11,.2);color:#fde68a">'+e(p.content)+'</pre>' +
          '<div style="display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap">'+tabBtns+'</div>' +
          '<div style="font-size:.875rem;color:#d1d5db;line-height:1.7;min-height:80px;padding:1rem;background:rgba(255,255,255,.03);border-radius:12px">'+e(tabs[state.tab]||"")+'</div>' +
        '</div>' +
        '<button class="btn" onclick="startQuiz()" style="width:100%;margin-top:1rem;background:linear-gradient(135deg,#06b6d4,#2563eb);color:#fff;font-size:1.1rem;padding:1rem">开始答题 →</button>' +
        '<button onclick="goBack()" style="width:100%;margin-top:.5rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#9ca3af;padding:12px;border-radius:16px;cursor:pointer;font-size:.9rem">← 返回分类</button>' +
      '</div>';
    } else if (state.quizStep === 1 && q) {
      const opts = q.options.map((opt, i) => {
        const done = state.showExp;
        const correct = i === q.answer;
        const cls = done?(correct?"quiz-opt correct":(state.answers[state.quizIdx]===i?"quiz-opt wrong":"quiz-opt")):"quiz-opt";
        return '<button class="'+cls+'" '+(done?'':'onclick="answerQuiz('+i+')"')+' '+(done?'':'style="border-color:rgba(255,255,255,.1);background:rgba(255,255,255,.05)"')+'>' + letter(i, done, correct) + e(opt) + '</button>';
      }).join("");
      const expHTML = state.showExp ? '<div style="margin-top:1rem;padding:1rem;border-radius:12px;background:'+(state.answers[state.quizIdx]===q.answer?"rgba(74,222,128,.1)":"rgba(248,113,113,.1)")+';border:1px solid '+(state.answers[state.quizIdx]===q.answer?"rgba(74,222,128,.3)":"rgba(248,113,113,.3)")+';color:'+(state.answers[state.quizIdx]===q.answer?"#86efac":"#fca5a5")+';font-size:.875rem;line-height:1.6;animation:slideUp .4s">' +
          '<div style="font-weight:bold;margin-bottom:.25rem">'+(state.answers[state.quizIdx]===q.answer?"🎉 正确！":"💡 答案解析")+'</div><div>'+e(q.explanation)+'</div></div>' : '';
      content = '<div class="screen">' +
        '<div class="stars">'+stars+'</div>' + confetti +
        '<button onclick="backToPoem()" style="color:#67e8f9;background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:.5rem;font-size:.875rem;margin-bottom:1rem">← 返回诗词</button>' +
        '<div style="text-align:center;margin-bottom:1rem">' +
          '<div style="font-size:2rem">📝</div>' +
          '<h3 style="color:#fbbf24;font-size:1.1rem;margin-bottom:.25rem;font-weight:bold">'+e(p.poem)+'</h3>' +
          '<p style="color:#9ca3af;font-size:.75rem">'+e(p.dynasty)+'·'+e(p.author)+'</p>' +
          '<p style="color:#6b7280;font-size:.7rem;margin-top:.5rem">第 '+(state.quizIdx+1)+' / '+p.quizzes.length+' 题</p>' +
          '<div style="height:4px;background:rgba(255,255,255,.1);border-radius:2px;margin-top:.5rem"><div style="width:'+((state.quizIdx+1)/p.quizzes.length*100)+'%;height:100%;background:linear-gradient(90deg,#67e8f9,#3b82f6);border-radius:2px"></div></div>' +
        '</div>' +
        '<div class="card" style="padding:1.5rem;margin-bottom:1rem;cursor:default">' +
          '<div style="color:#67e8f9;font-size:.75rem;font-weight:bold;margin-bottom:.75rem">问题 '+(state.quizIdx+1)+'</div>' +
          '<div style="font-size:1.1rem;font-weight:bold;line-height:1.6;margin-bottom:1.25rem">'+e(q.q)+'</div>' +
          '<div style="display:flex;flex-direction:column;gap:.5rem">'+opts+'</div>' +
          expHTML +
        '</div>' +
      '</div>';
    } else if (state.quizStep === 2) {
      content = '<div class="screen" style="text-align:center">' +
        '<div class="stars">'+stars+'</div>' + confetti +
        '<div style="font-size:5rem;margin-bottom:1rem;animation:bounceIn .5s">'+(score===p.quizzes.length?"🌟":"👍")+'</div>' +
        '<h2 style="color:'+(score===p.quizzes.length?"#fbbf24":"#67e8f9")+';font-size:2rem;margin-bottom:.5rem;font-weight:bold">'+(score===p.quizzes.length?"太棒了！全部答对！":"继续加油！")+'</h2>' +
        '<p style="color:#9ca3af;margin-bottom:1rem">正确率 '+score+' / '+p.quizzes.length+'</p>' +
        '<pre class="poem-pre" style="text-align:center;background:rgba(255,255,255,.05);border-radius:1rem;padding:1.5rem;margin:1rem auto;max-width:32rem;border:1px solid rgba(255,255,255,.1);color:#fde68a;font-size:.875rem;line-height:1.8">'+e(p.content)+'</pre>' +
        '<div style="display:flex;gap:1rem;justify-content:center;margin-top:1.5rem;flex-wrap:wrap">' +
          '<button class="btn" onclick="restartQuiz()" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#d1d5db;padding:12px 24px">再学一遍</button>' +
          '<button class="btn" onclick="nextPoem()" style="background:linear-gradient(135deg,#06b6d4,#2563eb);color:#fff;padding:12px 24px">'+(state.poemIdx<poems.length-1?"下一首 →":"完成 ✅")+'</button>' +
        '</div>' +
      '</div>';
    }
  }

  document.getElementById("app").innerHTML = content;
}

window.goHome = () => { state.view="home"; state.quizStep=0; render(); };
window.goSeason = (s) => { state.view="solar"; const idx=poems.findIndex(p=>p.season===s); state.poemIdx=Math.max(0,idx); state.quizStep=0; render(); };
window.goFestival = () => { state.view="fest"; state.quizStep=0; render(); };
window.goPoem = (idx) => { state.poemIdx=idx; state.view="poem"; state.quizStep=0; state.quizIdx=0; state.answers=[]; state.showExp=false; state.tab=0; render(); };
window.goBack = () => { const p=poems[state.poemIdx]; state.view=p?.category==="solar"?"solar":"fest"; render(); };
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
</script>
</body>
</html>
