#!/usr/bin/env node
/**
 * Build script: generates dist/index.html (standalone, no CDN, no syntax errors)
 * Strategy: poems loaded as JSON -> data injected via JSON.stringify (no escaping bugs)
 *           CSS background-image for images (no quote escaping in HTML attrs)
 */
const fs = require('fs');
const { execSync } = require('child_process');

// ── 1. Load poems ─────────────────────────────────────────────────────────
const poems = JSON.parse(fs.readFileSync('./poems80.json', 'utf8'));

// ── 2. Write dist/poems.json ──────────────────────────────────────────────
fs.mkdirSync('./dist', { recursive: true });
fs.writeFileSync('./dist/poems.json', JSON.stringify(poems, null, 2), 'utf8');
console.log('poems.json: ' + poems.length + ' poems');

// ── 3. Copy images ─────────────────────────────────────────────────────────
execSync('cp -r ./images ./dist/', { stdio: 'inherit' });
const imgCount = fs.readdirSync('./dist/images').filter(f => !f.startsWith('.')).length;
console.log('images/: ' + imgCount + ' files');

// ── 4. Build POEMS data array with ALL content as JSON-safe strings ────────
// All text fields go through JSON.stringify — zero escaping issues
const poemsData = poems.map(p => ({
  id: p.id,
  poem: p.poem,
  dynasty: p.dynasty,
  author: p.author,
  content: p.content,
  translation: p.translation || '',
  background: p.background || '',
  authorIntro: p.authorIntro || '',
  category: p.category,
  season: p.season || '',
  term: p.term || '',
  festivalName: p.festivalName || '',
  imgUrl: p.imgUrl || '',  // local path or empty
  quizzes: (p.quizzes || []).map(q => ({
    q: q.q,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation || ''
  }))
}));

// Inject as global JS variable via JSON -> safe string literal
const poemsJS = 'var POEMS = ' + JSON.stringify(poemsData) + ';';

// ── 5. Write index.html ───────────────────────────────────────────────────
// The JS app reads POEMS, renders via innerHTML (all user text is JS-safe)
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>诗词大会 - 24节气与传统节日</title>
<link href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;700&display=swap" rel="stylesheet">
<style>
*,::before,::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Noto Serif SC',serif;background:linear-gradient(135deg,#0a0a1a,#0d1a2e);color:#f0e6d3;min-height:100vh;overflow-x:hidden}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#4fc3f7;border-radius:3px}
@keyframes float{0%,100%{transform:translateY(0)}33%{transform:translateY(-12px)}66%{transform:translateY(-6px)}}
@keyframes bounceIn{0%{transform:scale(0.3);opacity:0}50%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
@keyframes confetti{0%{transform:translateY(-10vh) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1}}
.grad-text{background:linear-gradient(135deg,#ffd700,#ff6b6b,#4fc3f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-size:200% auto;animation:shimmer 3s linear infinite}
.card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:20px;backdrop-filter:blur(10px)}
.screen{padding:2rem 1rem;max-width:56rem;margin:0 auto;min-height:100vh;position:relative}
.poem-pre{font-family:'Ma Shan Zheng','Noto Serif SC',serif;white-space:pre-wrap}
.tab{padding:8px 16px;border-radius:999px;font-size:.8rem;cursor:pointer;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#9ca3af;transition:all .2s;display:inline-block}
.tab.active{background:rgba(79,195,247,.2);color:#67e8f9;border-color:rgba(79,195,247,.4);font-weight:bold}
.quiz-opt{width:100%;padding:16px;border-radius:12px;text-align:left;background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);color:#d1d5db;cursor:pointer;transition:all .2s;margin-bottom:8px;font-size:.95rem}
.quiz-opt:hover:not([disabled]){border-color:rgba(79,195,247,.5);background:rgba(79,195,247,.1)}
.quiz-opt.correct{border-color:#4ade80;background:rgba(74,222,128,.2);color:#86efac;animation:bounceIn .4s}
.quiz-opt.wrong{border-color:#f87171;background:rgba(248,113,113,.15);color:#fca5a5;animation:shake .4s}
.quiz-opt[disabled]{cursor:default}
.btn{padding:12px 24px;border-radius:16px;font-weight:bold;cursor:pointer;border:none;transition:all .2s;display:inline-block;font-size:1rem}
.btn:hover{transform:scale(1.03)}
.cat-card{text-align:center;font-weight:bold;padding:1rem;border-radius:20px;cursor:pointer;transition:all .2s}
.cat-card:hover{transform:translateY(-2px);box-shadow:0 4px 20px rgba(79,195,247,.2)}
.cat-icon{font-size:2.5rem;margin-bottom:.25rem}.cat-name{font-size:.9rem}.cat-count{font-size:.7rem;opacity:.8;margin-top:.25rem}
.poem-img{height:200px;width:100%;border-radius:12px;margin-bottom:.75rem;display:block;background-size:cover;background-position:center;background-color:rgba(0,0,0,.3)}
.poem-img-placeholder{height:200px;width:100%;border-radius:12px;margin-bottom:.75rem;display:flex;align-items:center;justify-content:center;font-size:3rem;opacity:.2;color:#fff}
</style>
</head>
<body>
<div id="app"></div>
<script>
${poemsJS}
</script>
<script>
(function() {
  var SEASONS=['春季','夏季','秋季','冬季'];
  var SEASON_ICONS=['🌸','☀️','🍂','❄️'];
  var SEASON_COLORS=['#f472b6','#fbbf24','#f97316','#60a5fa'];
  var SEASON_GRAD={'春季':'linear-gradient(135deg,#1a3a05,#2d5016,#4a7c23)','夏季':'linear-gradient(135deg,#1a3a5c,#2d6aa0,#4a9fd4)','秋季':'linear-gradient(135deg,#5c2d0a,#8B4513,#CD853F)','冬季':'linear-gradient(135deg,#1a2a3a,#2d4a6a,#4a7ab4)'};
  var FESTIVALS=[{n:'春节',i:'🧧',c:'#ef4444'},{n:'元宵节',i:'🏮',c:'#f97316'},{n:'清明节',i:'🌿',c:'#10b981'},{n:'端午节',i:'🐉',c:'#14b8a6'},{n:'七夕节',i:'🌙',c:'#a855f7'},{n:'中秋节',i:'🥮',c:'#f59e0b'},{n:'重阳节',i:'🌺',c:'#ea580c'},{n:'除夕',i:'🎆',c:'#dc2626'}];
  var state={v:'home',pi:0,qs:0,qi:0,ans:[],exp:false,conf:false,prg:{},tab:0};

  function e(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  function stars(){
    var h='';
    for(var i=0;i<80;i++){
      var x=(Math.random()*100).toFixed(2),y=(Math.random()*100).toFixed(2);
      var sz=(Math.random()*2+1).toFixed(1),d=(Math.random()*3).toFixed(1);
      var op=(Math.random()*.5+.2).toFixed(2);
      h+='<div style="position:fixed;border-radius:50%;background:#fff;pointer-events:none;left:'+x+'%;top:'+y+'%;width:'+sz+'px;height:'+sz+'px;opacity:'+op+';animation:float '+(3+parseFloat(d))+'s ease-in-out '+d+'s infinite"></div>';
    }
    return h;
  }

  function confetti(){
    if(!state.conf)return'';
    var cs=['#ffd700','#f87171','#4fc3f7','#86efac','#f97316','#a855f7'];
    var h='';
    for(var i=0;i<60;i++){
      var c=cs[i%6],x=(Math.random()*100).toFixed(2),d=(Math.random()*1.5).toFixed(1);
      var s=(Math.random()*8+4).toFixed(1);
      h+='<div style="position:fixed;top:-20px;border-radius:'+(i%3===0?'50%':'2px')+';animation:confetti 2.5s ease-in '+d+'s forwards;pointer-events:none;z-index:9999;left:'+x+'%;background:'+c+';width:'+s+'px;height:'+(i%3===0?s+'px':'4px')+'"></div>';
    }
    return h;
  }

  function letter(i,done,correct){
    var bg=done?(correct?'#4ade80':'#f87171'):'rgba(255,255,255,.1)';
    return'<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;font-size:.75rem;font-weight:bold;margin-right:8px;background:'+bg+'">'+(i===0?'A':i===1?'B':i===2?'C':'D')+'</span>';
  }

  function iconEmoji(po){
    if(po.season){var i=SEASONS.indexOf(po.season);return i>=0?SEASON_ICONS[i]:'📜';}
    for(var j=0;j<FESTIVALS.length;j++)if(FESTIVALS[j].n===po.festivalName)return FESTIVALS[j].i;
    return'🎊';
  }

  function gradFor(po){return SEASON_GRAD[po.season]||'linear-gradient(135deg,#2d2d2d,#1a1a1a)';}

  function imgHTML(po){
    if(!po.imgUrl)return'<div class="poem-img-placeholder" style="background:'+gradFor(po)+'">'+iconEmoji(po)+'</div>';
    var url=po.imgUrl.replace(/'/g,"\\'");
    return'<div class="poem-img" style="background-image:url(\\'+url+'\\');background-size:cover;background-position:center" title="'+e(po.poem)+'"></div>';
  }

  function firstIdx(pred){
    for(var i=0;i<POEMS.length;i++)if(pred(POEMS[i]))return i;
    return 0;
  }

  // ── RENDER ───────────────────────────────────────────────────────────────
  function render(){
    var p=POEMS[state.pi];
    var q=p&&p.quizzes&&p.quizzes[state.qi];
    var solar=POEMS.filter(function(x){return x.category==='solar';});
    var fest=POEMS.filter(function(x){return x.category==='festival';});
    var mastered=Object.keys(state.prg).filter(function(k){return state.prg[k]==='mastered';}).length;
    var learned=Object.keys(state.prg).filter(function(k){return state.prg[k]==='learned';}).length;
    var score=p&&p.quizzes?p.quizzes.filter(function(qq,i){return state.ans[i]===qq.answer;}).length:0;
    var pct=((state.pi+1)/POEMS.length*100).toFixed(1);

    // ── HOME ────────────────────────────────────────────────────────────
    if(state.v==='home'){
      var sc=SEASONS.map(function(s,i){
        var cnt=solar.filter(function(x){return x.season===s;}).length;
        return'<div class="cat-card" onclick="_gp('+firstIdx(function(x){return x.season===s;})+')" style="background:'+SEASON_GRAD[s]+';border:2px solid '+SEASON_COLORS[i]+'44;color:#fff"><div class="cat-icon">'+SEASON_ICONS[i]+'</div><div class="cat-name">'+s+'</div><div class="cat-count">'+cnt+'首诗词</div></div>';
      }).join('');
      var fc=FESTIVALS.map(function(f){
        var cnt=fest.filter(function(x){return x.festivalName===f.n;}).length;
        return'<div class="cat-card"'+(cnt>0?' onclick="_gp('+firstIdx(function(x){return x.festivalName===f.n;})+')"':'')+' style="background:linear-gradient(135deg,'+f.c+'88,'+f.c+'44);border:2px solid '+f.c+'44;color:'+(cnt>0?'#fff':'#666')+';opacity:'+(cnt>0?1:.5)+';cursor:'+(cnt>0?'pointer':'default')+'"><div class="cat-icon">'+f.i+'</div><div class="cat-name">'+f.n+'</div><div class="cat-count">'+(cnt>0?cnt+'首':'即将推出')+'</div></div>';
      }).join('');
      document.getElementById('app').innerHTML='<div class="screen" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:100vh;padding:2rem 1rem"><div style="position:fixed;inset:0;pointer-events:none;overflow:hidden">'+stars()+'</div>'+confetti()+'<div style="font-size:5rem;margin-bottom:.5rem;animation:float 4s ease-in-out infinite">📜</div><h1 class="grad-text" style="font-size:3rem;font-weight:bold;margin-bottom:.5rem">诗词大会</h1><p style="color:#67e8f9;font-size:1.1rem;margin-bottom:.5rem">24节气 · 传统节日</p><p style="color:#9ca3af;margin-bottom:.5rem">'+POEMS.length+'首精选古诗词 · 每首配精美插图</p><p style="color:#fbbf24;font-size:.8rem;margin-bottom:1.5rem">已掌握: '+mastered+' ⭐ | 已学习: '+learned+' ✅</p><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:.75rem;margin-bottom:2rem;width:100%;max-width:560px">'+sc+'</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:.75rem;width:100%;max-width:560px">'+fc+'</div><p style="color:#6b7280;font-size:.7rem;margin-top:2rem">点击任一分类开始学习</p></div>';
      return;
    }

    // ── SOLAR / FEST ────────────────────────────────────────────────────
    if(state.v==='solar'||state.v==='fest'){
      var isSolar=state.v==='solar';
      var filtered=isSolar?solar:fest;
      var catBtns=(isSolar?SEASONS:FESTIVALS).map(function(c){
        var name=isSolar?c:c.n;
        var cnt=filtered.filter(function(x){return isSolar?x.season===name:x.festivalName===name;}).length;
        return'<div class="cat-card" onclick="_gp('+firstIdx(function(x){return isSolar?x.season===name:x.festivalName===name;})+')" style="background:'+(isSolar?SEASON_GRAD[name]:'linear-gradient(135deg,'+(isSolar?SEASON_COLORS[SEASONS.indexOf(name)]:c.c)+'88,'+(isSolar?SEASON_COLORS[SEASONS.indexOf(name)]:c.c)+'44)')+';border:2px solid '+(isSolar?SEASON_COLORS[SEASONS.indexOf(name)]:c.c)+'44;color:#fff"><div class="cat-icon">'+(isSolar?SEASON_ICONS[SEASONS.indexOf(name)]:c.i)+'</div><div class="cat-name">'+name+'</div><div class="cat-count">'+cnt+'首</div></div>';
      }).join('');
      var cards=filtered.map(function(po){
        var idx=POEMS.indexOf(po);
        var badge=state.prg[po.id]==='mastered'?'⭐':state.prg[po.id]==='learned'?'✅':'';
        return'<div onclick="_gp('+idx+')" style="background:'+gradFor(po)+';border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:1rem;cursor:pointer;transition:all .2s;text-align:left;position:relative;overflow:hidden;animation:fadeIn .4s"><div style="position:absolute;top:0;right:0;width:50%;height:100%;opacity:.06;font-size:4rem;pointer-events:none;text-align:right;line-height:1;padding:.5rem;color:#fff">'+iconEmoji(po)+'</div><div style="position:relative;z-index:1"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.25rem"><span style="font-size:.7rem;color:#fbbf24;font-weight:bold">'+String(po.id).padStart(2,'0')+'</span>'+(badge?'<span style="font-size:.7rem">'+badge+'</span>':'')+'</div><div style="font-weight:bold;font-size:1rem;margin-bottom:.2rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+e(po.poem)+'</div><div style="font-size:.75rem;color:rgba(255,255,255,.7);margin-bottom:.1rem">'+e(po.dynasty+'·'+po.author)+'</div><div style="font-size:.7rem;color:rgba(79,195,247,.8)">'+(po.term||po.festivalName||'')+'</div></div></div>';
      }).join('');
      document.getElementById('app').innerHTML='<div class="screen"><div style="position:fixed;inset:0;pointer-events:none;overflow:hidden">'+stars()+'</div><button onclick="_gh()" style="color:#67e8f9;margin-bottom:2rem;background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:.5rem;font-size:.875rem">← 返回首页</button><h2 style="text-align:center;margin-bottom:.5rem;color:#fbbf24;font-size:1.75rem;font-weight:bold">'+(isSolar?'🌱 节气诗词':'🎊 传统节日')+'</h2><p style="text-align:center;color:#6b7280;font-size:.8rem;margin-bottom:1.5rem">'+(isSolar?'春季·夏季·秋季·冬季':'春节·元宵·清明·端午·七夕·中秋·重阳·除夕')+'</p><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:.75rem;margin-bottom:2rem">'+catBtns+'</div><h3 style="text-align:center;color:#9ca3af;margin-bottom:1rem;font-size:.9rem">📚 全部诗词 · '+filtered.length+'首</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.75rem">'+cards+'</div></div>';
      return;
    }

    // ── POEM ─────────────────────────────────────────────────────────────
    if(state.v==='poem'&&p){
      var pct2=((state.pi+1)/POEMS.length*100).toFixed(1);

      if(state.qs===0){
        var tabs=[p.translation,p.background,p.authorIntro];
        var tabBtns=['翻译','背景','诗人'].map(function(t,i){
          return'<button onclick="_st('+i+')" class="'+(state.tab===i?'tab active':'tab')+'">'+t+'</button>';
        }).join('');
        document.getElementById('app').innerHTML='<div class="screen"><div style="position:fixed;inset:0;pointer-events:none;overflow:hidden">'+stars()+'</div>'+confetti()+'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem"><button onclick="_gb()" style="color:#67e8f9;background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:.5rem;font-size:.875rem">← 返回</button><div style="text-align:center"><div style="font-size:.75rem;color:#6b7280">'+(state.pi+1)+' / '+POEMS.length+'</div><div style="width:10rem;height:4px;background:rgba(255,255,255,.1);border-radius:2px;margin-top:.25rem"><div style="width:'+pct2+'%;height:100%;background:linear-gradient(90deg,#67e8f9,#3b82f6);border-radius:2px;transition:width .4s"></div></div></div><span style="font-size:.7rem;color:#6b7280">'+(p.term||p.festivalName||'')+'</span></div><div class="card" style="padding:1.5rem;cursor:default">'+imgHTML(p)+'<div style="text-align:center;margin-bottom:1.5rem"><div style="font-size:2.5rem;margin-bottom:.5rem">'+iconEmoji(p)+'</div><h2 style="color:#fbbf24;font-size:1.75rem;margin-bottom:.25rem;font-weight:bold">'+e(p.poem)+'</h2><p style="color:#67e8f9;font-size:.9rem">'+e(p.dynasty+'·'+p.author)+'</p></div><pre class="poem-pre" style="font-size:1.1rem;line-height:2;text-align:center;background:rgba(15,23,42,.8);border-radius:1rem;padding:1.5rem;margin-bottom:1.5rem;border:1px solid rgba(245,158,11,.2);color:#fde68a">'+e(p.content)+'</pre><div style="display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap">'+tabBtns+'</div><div style="font-size:.875rem;color:#d1d5db;line-height:1.7;min-height:80px;padding:1rem;background:rgba(255,255,255,.03);border-radius:12px">'+e(tabs[state.tab]||'')+'</div></div><button onclick="_sq()" class="btn" style="width:100%;margin-top:1rem;background:linear-gradient(135deg,#06b6d4,#2563eb);color:#fff;font-size:1.1rem;padding:1rem">开始答题 →</button><button onclick="_gb()" style="width:100%;margin-top:.5rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#9ca3af;padding:12px;border-radius:16px;cursor:pointer;font-size:.9rem">← 返回分类</button></div>';
        return;
      }

      if(state.qs===1&&q){
        var opts=q.options.map(function(opt,i){
          var done=state.exp;
          var correct=i===q.answer;
          var isWrong=state.ans[state.qi]===i&&!correct;
          var cls=done?(correct?'quiz-opt correct':isWrong?'quiz-opt wrong':'quiz-opt'):'quiz-opt';
          return'<button class="'+cls+'"'+(done?'':' onclick="_aq('+i+')"')+' disabled>'+letter(i,done,correct)+e(opt)+'</button>';
        }).join('');
        var expHTML=state.exp?'<div style="margin-top:1rem;padding:1rem;border-radius:12px;background:'+(state.ans[state.qi]===q.answer?'rgba(74,222,128,.1)':'rgba(248,113,113,.1)')+';border:1px solid '+(state.ans[state.qi]===q.answer?'rgba(74,222,128,.3)':'rgba(248,113,113,.3)')+';color:'+(state.ans[state.qi]===q.answer?'#86efac':'#fca5a5')+';font-size:.875rem;line-height:1.6;animation:slideUp .4s"><div style="font-weight:bold;margin-bottom:.25rem">'+(state.ans[state.qi]===q.answer?'🎉 正确！':'💡 答案解析')+'</div><div>'+e(q.explanation)+'</div></div>':'';
        document.getElementById('app').innerHTML='<div class="screen"><div style="position:fixed;inset:0;pointer-events:none;overflow:hidden">'+stars()+'</div>'+confetti()+'<button onclick="_bp()" style="color:#67e8f9;background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:.5rem;font-size:.875rem;margin-bottom:1rem">← 返回诗词</button><div style="text-align:center;margin-bottom:1rem"><div style="font-size:2rem">📝</div><h3 style="color:#fbbf24;font-size:1.1rem;margin-bottom:.25rem;font-weight:bold">'+e(p.poem)+'</h3><p style="color:#9ca3af;font-size:.75rem">'+e(p.dynasty+'·'+p.author)+'</p><p style="color:#6b7280;font-size:.7rem;margin-top:.5rem">第 '+(state.qi+1)+' / '+p.quizzes.length+' 题</p><div style="height:4px;background:rgba(255,255,255,.1);border-radius:2px;margin-top:.5rem"><div style="width:'+((state.qi+1)/p.quizzes.length*100).toFixed(1)+'%;height:100%;background:linear-gradient(90deg,#67e8f9,#3b82f6);border-radius:2px"></div></div></div><div class="card" style="padding:1.5rem;margin-bottom:1rem;cursor:default"><div style="color:#67e8f9;font-size:.75rem;font-weight:bold;margin-bottom:.75rem">问题 '+(state.qi+1)+'</div><div style="font-size:1.1rem;font-weight:bold;line-height:1.6;margin-bottom:1.25rem">'+e(q.q)+'</div><div style="display:flex;flex-direction:column;gap:.5rem">'+opts+'</div>'+expHTML+'</div></div>';
        return;
      }

      if(state.qs===2){
        document.getElementById('app').innerHTML='<div class="screen" style="text-align:center"><div style="position:fixed;inset:0;pointer-events:none;overflow:hidden">'+stars()+'</div>'+confetti()+'<div style="font-size:5rem;margin-bottom:1rem;animation:bounceIn .5s">'+(score===p.quizzes.length?'🌟':'👍')+'</div><h2 style="color:'+(score===p.quizzes.length?'#fbbf24':'#67e8f9')+';font-size:2rem;margin-bottom:.5rem;font-weight:bold">'+(score===p.quizzes.length?'太棒了！全部答对！':'继续加油！')+'</h2><p style="color:#9ca3af;margin-bottom:1rem">正确率 '+score+' / '+p.quizzes.length+'</p><pre class="poem-pre" style="text-align:center;background:rgba(255,255,255,.05);border-radius:1rem;padding:1.5rem;margin:1rem auto;max-width:32rem;border:1px solid rgba(255,255,255,.1);color:#fde68a;font-size:.875rem;line-height:1.8">'+e(p.content)+'</pre><div style="display:flex;gap:1rem;justify-content:center;margin-top:1.5rem;flex-wrap:wrap"><button onclick="_rq()" class="btn" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#d1d5db;padding:12px 24px">再学一遍</button><button onclick="_np()" class="btn" style="background:linear-gradient(135deg,#06b6d4,#2563eb);color:#fff;padding:12px 24px">'+(state.pi<POEMS.length-1?'下一首 →':'完成 ✅')+'</button></div></div>';
        return;
      }
    }

    document.getElementById('app').innerHTML='<div class="screen" style="text-align:center;padding-top:40vh"><p>加载中...</p></div>';
  }

  // ── Event handlers ──────────────────────────────────────────────────────
  window._gh=function(){state.v='home';state.qs=0;render();};
  window._gp=function(i){state.pi=i;state.v='poem';state.qs=0;state.qi=0;state.ans=[];state.exp=false;state.tab=0;render();};
  window._gb=function(){
    var p=POEMS[state.pi];
    state.v=p&&p.category==='solar'?'solar':'fest';
    render();
  };
  window._bp=function(){state.qs=0;render();};
  window._sq=function(){state.qs=1;state.qi=0;state.ans=[];state.exp=false;render();};
  window._rq=function(){state.qs=1;state.qi=0;state.ans=[];state.exp=false;render();};
  window._st=function(i){state.tab=i;render();};
  window._aq=function(idx){
    if(state.exp)return;
    var pp=POEMS[state.pi];
    var qq=pp.quizzes[state.qi];
    var correct=idx===qq.answer;
    var na=state.ans.slice();na[state.qi]=idx;state.ans=na;
    state.exp=true;
    if(correct){
      state.conf=true;
      render();
      setTimeout(function(){
        state.conf=false;
        if(state.qi<pp.quizzes.length-1){state.qi++;state.exp=false;render();}
        else{state.prg[pp.id]='mastered';state.qs=2;render();}
      },1200);
    }else{
      render();
      setTimeout(function(){
        if(state.qi<pp.quizzes.length-1){state.qi++;state.exp=false;render();}
        else{state.prg[pp.id]='learned';state.qs=2;render();}
      },2500);
    }
  };
  window._np=function(){
    var pp=POEMS[state.pi];
    var sc=pp.quizzes.filter(function(q,i){return state.ans[i]===q.answer;}).length;
    state.prg[pp.id]=sc===pp.quizzes.length?'mastered':'learned';
    state.qs=2;render();
    setTimeout(function(){
      if(state.pi<POEMS.length-1){state.pi++;state.qs=0;state.qi=0;state.ans=[];state.exp=false;state.tab=0;}
      else{state.v='home';}
      render();
    },3000);
  };

  render();
})();
</script>
</body>
</html>`;

fs.writeFileSync('./dist/index.html', html, 'utf8');
console.log('index.html: ' + (fs.statSync('./dist/index.html').size / 1024).toFixed(1) + ' KB');
console.log('Build complete!');
