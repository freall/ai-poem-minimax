import { useState, useEffect } from "react";
import { poems } from "./data/poems";

const SEASONS = ["春季","夏季","秋季","冬季"];
const SEASON_ICONS = ["🌸","☀️","🍂","❄️"];
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

function StarField() {
  const stars = Array.from({length:80},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,size:Math.random()*2+1,delay:Math.random()*3}));
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {stars.map(s=>(
        <div key={s.id} style={{
          position:"absolute",left:s.x+"%",top:s.y+"%",
          width:s.size+"px",height:s.size+"px",
          borderRadius:"50%",background:"#fff",
          opacity:Math.random()*0.5+0.2,
          animation:"float "+(3+s.delay)+"s ease-in-out "+(s.delay)+"s infinite"
        }} />
      ))}
    </div>
  );
}

function Confetti({active}) {
  if (!active) return null;
  const COLORS = ["#ffd700","#ff6b6b","#4fc3f7","#66bb6a","#f97316","#a855f7"];
  const pcs = Array.from({length:60},(_,i)=>({id:i,x:Math.random()*100,color:COLORS[i%6],delay:Math.random()*1.5,size:Math.random()*8+4}));
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
      {pcs.map(p=>(
        <div key={p.id} style={{
          position:"absolute",left:p.x+"%",top:"-20px",
          width:p.size+"px",height:p.id%3===0?p.size+"px":"4px",
          background:p.color,borderRadius:p.id%3===0?"50%":"2px",
          animation:"confetti 2.5s ease-in "+(p.delay)+"s forwards"
        }} />
      ))}
    </div>
  );
}

export default function App() {
  const [view,setView] = useState("home");
  const [poemIdx,setPoemIdx] = useState(0);
  const [quizStep,setQuizStep] = useState(0);
  const [quizIdx,setQuizIdx] = useState(0);
  const [answers,setAnswers] = useState([]);
  const [showExp,setShowExp] = useState(false);
  const [confetti,setConfetti] = useState(false);
  const [progress,setProgress] = useState({});
  const [tab,setTab] = useState(0);

  const current = poems[poemIdx];
  const quiz = current?.quizzes?.[quizIdx];

  useEffect(()=>{
    let t;
    if(confetti) t = setTimeout(()=>setConfetti(false),3000);
    return ()=>clearTimeout(t);
  },[confetti]);

  const handleAns = (optIdx) => {
    if(showExp) return;
    setShowExp(true);
    const correct = optIdx === quiz.answer;
    const na = [...answers];
    na[quizIdx] = optIdx;
    setAnswers(na);
    if(correct) {
      setConfetti(true);
      setTimeout(()=>{
        setConfetti(false);
        if(quizIdx < current.quizzes.length-1) {
          setQuizIdx(q=>q+1);
          setShowExp(false);
        } else {
          setProgress(p=>({...p,[current.id]:"mastered"}));
          setQuizStep(2);
        }
      },1200);
    } else {
      setTimeout(()=>{
        if(quizIdx < current.quizzes.length-1) {
          setQuizIdx(q=>q+1);
          setShowExp(false);
        } else {
          setProgress(p=>({...p,[current.id]:"learned"}));
          setQuizStep(2);
        }
      },2500);
    }
  };

  const mastered = Object.values(progress).filter(v=>v==="mastered").length;
  const learned = Object.values(progress).filter(v=>v==="learned").length;
  const solarPoems = poems.filter(p=>p.category==="solar");
  const festPoems = poems.filter(p=>p.category==="festival");
  const score = answers.filter((a,i)=>a===current?.quizzes?.[i]?.answer).length;
  const seasonColors = ["#f472b6","#fbbf24","#f97316","#60a5fa"];
  const pct = ((poemIdx+1)/poems.length*100).toFixed(1);

  // HOME SCREEN
  if(view==="home") {
    return (
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"1rem",position:"relative",textAlign:"center"}}>
        <StarField />
        <Confetti active={confetti} />
        <div style={{fontSize:"5rem",marginBottom:"1rem",animation:"float 4s ease-in-out infinite"}}>📜</div>
        <h1 style={{fontSize:"3rem",fontWeight:"bold",background:"linear-gradient(135deg,#ffd700,#ff6b6b,#4fc3f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:"0.5rem"}}>诗词大会</h1>
        <p style={{color:"#67e8f9",fontSize:"1.1rem",marginBottom:"0.5rem"}}>24节气 · 传统节日</p>
        <p style={{color:"#9ca3af",marginBottom:"0.5rem"}}>{poems.length}首精选古诗词</p>
        <p style={{color:"#fbbf24",fontSize:"0.8rem"}}>已掌握: {mastered} ⭐ | 已学习: {learned} ✅</p>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem",marginTop:"2rem",position:"relative",zIndex:10}}>
          <button onClick={()=>setView("solar")} className="btn" style={{background:"linear-gradient(135deg,#10b981,#059669)",color:"#fff",fontSize:"1.1rem"}}>🌱 节气诗词</button>
          <button onClick={()=>setView("festival")} className="btn" style={{background:"linear-gradient(135deg,#dc2626,#ea580c)",color:"#fff",fontSize:"1.1rem"}}>🎊 节日诗词</button>
        </div>
        <p style={{color:"#6b7280",fontSize:"0.7rem",marginTop:"2rem"}}>点击开始学习 · 每首诗后有趣味问答</p>
      </div>
    );
  }

  // SOLAR SCREEN
  if(view==="solar") {
    return (
      <div style={{minHeight:"100vh",padding:"2rem 1rem",maxWidth:"56rem",margin:"0 auto",position:"relative"}}>
        <StarField />
        <button onClick={()=>setView("home")} style={{color:"#67e8f9",marginBottom:"2rem",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"0.5rem",fontSize:"0.875rem"}}>← 返回首页</button>
        <h2 style={{textAlign:"center",marginBottom:"2rem",color:"#fbbf24",fontSize:"1.75rem",fontWeight:"bold"}}>🌱 二十四节气</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:"1rem",marginBottom:"2.5rem"}}>
          {SEASONS.map((s,i)=>(
            <button key={s} onClick={()=>{const idx=poems.findIndex(p=>p.season===s);setPoemIdx(Math.max(0,idx));setView("poem");}} className="card" style={{textAlign:"center",background:"linear-gradient(135deg,"+seasonColors[i]+"88,"+seasonColors[i]+"44)",borderColor:seasonColors[i]+"44",color:"#fff"}}>
              <div style={{fontSize:"2.5rem",marginBottom:"0.25rem"}}>{SEASON_ICONS[i]}</div>
              <div style={{fontWeight:"bold"}}>{s}</div>
              <div style={{fontSize:"0.7rem",opacity:0.8,marginTop:"0.25rem"}}>{poems.filter(p=>p.season===s).length}首诗词</div>
            </button>
          ))}
        </div>
        <h3 style={{textAlign:"center",color:"#9ca3af",marginBottom:"1rem",fontSize:"1rem"}}>📚 全部节气诗词 · {solarPoems.length}首</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"0.75rem"}}>
          {solarPoems.map((p,i)=>(
            <button key={p.id} onClick={()=>{setPoemIdx(i);setQuizStep(0);setView("poem");}} className="card" style={{textAlign:"left",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.25rem"}}>
                <span style={{fontSize:"0.7rem",color:"#fbbf24",fontWeight:"bold"}}>{p.id<10?"0"+p.id:p.id}</span>
                {progress[p.id]==="mastered"&&<span style={{color:"#fbbf24"}}>⭐</span>}
                {progress[p.id]==="learned"&&<span style={{color:"#34d399"}}>✅</span>}
              </div>
              <div style={{fontWeight:"bold",fontSize:"0.9rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.poem}</div>
              <div style={{fontSize:"0.75rem",color:"#9ca3af"}}>{p.dynasty}·{p.author}</div>
              <div style={{fontSize:"0.7rem",color:"#67e8f9",opacity:0.6,marginTop:"0.25rem"}}>{p.term}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // FESTIVAL SCREEN
  if(view==="festival") {
    return (
      <div style={{minHeight:"100vh",padding:"2rem 1rem",maxWidth:"56rem",margin:"0 auto",position:"relative"}}>
        <StarField />
        <button onClick={()=>setView("home")} style={{color:"#67e8f9",marginBottom:"2rem",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"0.5rem",fontSize:"0.875rem"}}>← 返回首页</button>
        <h2 style={{textAlign:"center",marginBottom:"2rem",color:"#fbbf24",fontSize:"1.75rem",fontWeight:"bold"}}>🎊 传统节日</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:"1rem",marginBottom:"2.5rem"}}>
          {FESTIVALS.map(f=>(
            <button key={f.name} onClick={()=>{const idx=poems.findIndex(p=>p.festivalName===f.name);if(idx>=0){setPoemIdx(idx);setQuizStep(0);setView("poem");}}} className="card" style={{textAlign:"center",background:"linear-gradient(135deg,"+f.color+"88,"+f.color+"44)",borderColor:f.color+"44",color:"#fff"}}>
              <div style={{fontSize:"2.5rem",marginBottom:"0.25rem"}}>{f.icon}</div>
              <div style={{fontWeight:"bold",fontSize:"0.875rem"}}>{f.name}</div>
              <div style={{fontSize:"0.7rem",opacity:0.8,marginTop:"0.25rem"}}>{poems.filter(p=>p.festivalName===f.name).length}首</div>
            </button>
          ))}
        </div>
        {festPoems.length===0&&<div style={{textAlign:"center",color:"#6b7280",padding:"2rem"}}>节日诗词陆续添加中...</div>}
        {festPoems.length>0&&(
          <>
            <h3 style={{textAlign:"center",color:"#9ca3af",marginBottom:"1rem",fontSize:"1rem"}}>📚 全部节日诗词 · {festPoems.length}首</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"0.75rem"}}>
              {festPoems.map((p,i)=>{
                const realIdx = poems.indexOf(p);
                return (
                  <button key={p.id} onClick={()=>{setPoemIdx(realIdx);setQuizStep(0);setView("poem");}} className="card" style={{textAlign:"left",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.25rem"}}>
                      <span style={{fontSize:"0.7rem",color:"#fbbf24",fontWeight:"bold"}}>{p.id<10?"0"+p.id:p.id}</span>
                      {progress[p.id]==="mastered"&&<span style={{color:"#fbbf24"}}>⭐</span>}
                      {progress[p.id]==="learned"&&<span style={{color:"#34d399"}}>✅</span>}
                    </div>
                    <div style={{fontWeight:"bold",fontSize:"0.9rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.poem}</div>
                    <div style={{fontSize:"0.75rem",color:"#9ca3af"}}>{p.dynasty}·{p.author}</div>
                    <div style={{fontSize:"0.7rem",color:"#67e8f9",opacity:0.6,marginTop:"0.25rem"}}>{p.festivalName}</div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // POEM SCREEN - read mode
  if(view==="poem" && current && quizStep===0) {
    const tabs = [
      {label:"翻译", content:current.translation},
      {label:"背景", content:current.background},
      {label:"诗人", content:current.authorIntro}
    ];
    return (
      <div style={{minHeight:"100vh",padding:"1.5rem 1rem",maxWidth:"48rem",margin:"0 auto",position:"relative"}}>
        <StarField />
        <Confetti active={confetti} />
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem"}}>
          <button onClick={()=>setView(current.category==="solar"?"solar":"festival")} style={{color:"#67e8f9",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"0.5rem",fontSize:"0.875rem"}}>← 返回</button>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"0.75rem",color:"#6b7280"}}>{poemIdx+1} / {poems.length}</div>
            <div style={{width:"10rem",height:"6px",background:"rgba(255,255,255,0.1)",borderRadius:"3px",marginTop:"0.25rem"}}>
              <div style={{width:pct+"%",height:"100%",background:"linear-gradient(90deg,#67e8f9,#3b82f6)",borderRadius:"3px",transition:"width 0.4s"}} />
            </div>
          </div>
          <span style={{fontSize:"0.7rem",color:"#6b7280"}}>{current.term||current.festivalName}</span>
        </div>
        <div className="card" style={{padding:"1.5rem",marginBottom:"1.5rem"}}>
          <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
            <div style={{fontSize:"2.5rem",marginBottom:"0.5rem"}}>{current.category==="solar"?"🌱":"🎊"}</div>
            <h2 style={{color:"#fbbf24",fontSize:"1.75rem",marginBottom:"0.25rem"}}>{current.poem}</h2>
            <p style={{color:"#67e8f9",fontSize:"0.9rem"}}>{current.dynasty}·{current.author}</p>
          </div>
          <pre style={{fontSize:"1.1rem",lineHeight:"2",textAlign:"center",background:"rgba(15,23,42,0.8)",borderRadius:"1rem",padding:"1.5rem",marginBottom:"1.5rem",border:"1px solid rgba(245,158,11,0.2)",fontFamily:"'Ma Shan Zheng','Noto Serif SC',serif",whiteSpace:"pre-wrap",color:"#fde68a"}}>{current.content}</pre>
          <div style={{display:"flex",gap:"0.5rem",marginBottom:"1rem",flexWrap:"wrap"}}>
            {tabs.map((t,i)=>(
              <button key={t.label} onClick={()=>setTab(i)} className={i===tab?"tab active":"tab"}>{t.label}</button>
            ))}
          </div>
          <div style={{fontSize:"0.875rem",color:"#d1d5db",lineHeight:"1.8",minHeight:"80px"}}>{tabs[tab].content}</div>
        </div>
        <button onClick={()=>{setQuizStep(1);setQuizIdx(0);setAnswers([]);setShowExp(false);}} className="btn" style={{width:"100%",background:"linear-gradient(135deg,#06b6d4,#2563eb)",color:"#fff",fontSize:"1.1rem",padding:"1rem",boxShadow:"0 4px 20px rgba(6,182,212,0.3)"}}>开始答题 →</button>
        <button onClick={()=>setView(current.category==="solar"?"solar":"festival")} style={{width:"100%",marginTop:"0.5rem",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#9ca3af",padding:"0.75rem",borderRadius:"16px",cursor:"pointer"}}>← 返回分类</button>
      </div>
    );
  }

  // POEM SCREEN - quiz mode
  if(view==="poem" && current && quizStep===1 && quiz) {
    return (
      <div style={{minHeight:"100vh",padding:"1.5rem 1rem",maxWidth:"48rem",margin:"0 auto",position:"relative"}}>
        <StarField />
        <button onClick={()=>setQuizStep(0)} style={{color:"#67e8f9",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"0.5rem",fontSize:"0.875rem",marginBottom:"1rem"}}>← 返回诗词</button>
        <div style={{textAlign:"center",marginBottom:"1rem"}}>
          <div style={{fontSize:"2rem"}}>📝</div>
          <h3 style={{color:"#fbbf24",fontSize:"1.1rem",marginBottom:"0.25rem"}}>{current.poem}</h3>
          <p style={{color:"#9ca3af",fontSize:"0.75rem"}}>{current.dynasty}·{current.author}</p>
          <p style={{color:"#6b7280",fontSize:"0.7rem",marginTop:"0.5rem"}}>第 {quizIdx+1} / {current.quizzes.length} 题</p>
          <div style={{height:"4px",background:"rgba(255,255,255,0.1)",borderRadius:"2px",marginTop:"0.5rem"}}>
            <div style={{width:((quizIdx+1)/current.quizzes.length*100)+"%",height:"100%",background:"linear-gradient(90deg,#67e8f9,#3b82f6)",borderRadius:"2px",transition:"width 0.3s"}} />
          </div>
        </div>
        <div className="card" style={{padding:"1.5rem",marginBottom:"1rem"}}>
          <div style={{color:"#67e8f9",fontSize:"0.75rem",fontWeight:"bold",marginBottom:"0.75rem"}}>问题 {quizIdx+1}</div>
          <div style={{fontSize:"1.1rem",fontWeight:"bold",lineHeight:"1.6",marginBottom:"1.25rem"}}>{quiz.q}</div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {quiz.options.map((opt,i)=>{
              const sel = answers[quizIdx];
              const isDone = sel!==undefined;
              const isCorrect = i===quiz.answer;
              const isWrong = sel===i&&!isCorrect;
              let cls = "quiz-opt";
              if(isDone) cls += isCorrect?" correct":" wrong";
              return (
                <button key={i} className={cls} disabled={isDone} onClick={()=>handleAns(i)} style={!isDone?{borderColor:"rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)"}:{}}>
                  <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"28px",height:"28px",borderRadius:"50%",fontSize:"0.75rem",fontWeight:"bold",marginRight:"8px",background:isDone?(isCorrect?"#4ade80":"#f87171"):"rgba(255,255,255,0.1)"}}>{["A","B","C","D"][i]}</span>
                  {opt}
                </button>
              );
            })}
          </div>
          {showExp&&(
            <div style={{marginTop:"1rem",padding:"1rem",borderRadius:"12px",background:answers[quizIdx]===quiz.answer?"rgba(74,222,128,0.1)":"rgba(248,113,113,0.1)",border:"1px solid "+(answers[quizIdx]===quiz.answer?"rgba(74,222,128,0.3)":"rgba(248,113,113,0.3)"),color:answers[quizIdx]===quiz.answer?"#86efac":"#fca5a5",fontSize:"0.875rem",lineHeight:"1.6",animation:"slideUp 0.4s"}}>
              <div style={{fontWeight:"bold",marginBottom:"0.25rem"}}>{answers[quizIdx]===quiz.answer?"🎉 正确！":"💡 答案解析"}</div>
              <div>{quiz.explanation}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // POEM SCREEN - result mode
  if(view==="poem" && current && quizStep===2) {
    return (
      <div style={{minHeight:"100vh",padding:"1.5rem 1rem",maxWidth:"48rem",margin:"0 auto",position:"relative",textAlign:"center"}}>
        <StarField />
        <Confetti active={confetti} />
        <div style={{fontSize:"5rem",marginBottom:"1rem",animation:"bounceIn 0.5s"}}>{score===current.quizzes.length?"🌟":"👍"}</div>
        <h2 style={{color:score===current.quizzes.length?"#fbbf24":"#67e8f9",fontSize:"2rem",marginBottom:"0.5rem"}}>
          {score===current.quizzes.length?"太棒了！全部答对！":"继续加油！"}
        </h2>
        <p style={{color:"#9ca3af",marginBottom:"1rem"}}>正确率 {score} / {current.quizzes.length}</p>
        <pre style={{textAlign:"center",background:"rgba(255,255,255,0.05)",borderRadius:"1rem",padding:"1.5rem",margin:"1rem auto",maxWidth:"32rem",border:"1px solid rgba(255,255,255,0.1)",color:"#fde68a",fontSize:"0.875rem",lineHeight:"1.8",whiteSpace:"pre-wrap",fontFamily:"'Ma Shan Zheng','Noto Serif SC',serif"}}>{current.content}</pre>
        <div style={{display:"flex",gap:"1rem",justifyContent:"center",marginTop:"1.5rem",flexWrap:"wrap"}}>
          <button onClick={()=>{setQuizStep(1);setQuizIdx(0);setAnswers([]);setShowExp(false);}} className="btn" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#d1d5db",padding:"12px 24px"}}>再学一遍</button>
          <button onClick={()=>{if(poemIdx<poems.length-1){setPoemIdx(i=>i+1);setQuizStep(0);}else{setView("home");}}} className="btn" style={{background:"linear-gradient(135deg,#06b6d4,#2563eb)",color:"#fff",padding:"12px 24px"}}>
            {poemIdx<poems.length-1?"下一首 →":"完成 ✅"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
