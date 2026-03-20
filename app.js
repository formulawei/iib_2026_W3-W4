/**
 * IIB Interactive Web – 企業功能：營運、研發、行銷、財務管理
 * Follows IIB_01 template structure
 * Bilingual (zh / en), Presenter mode, keyboard shortcuts, LocalStorage
 */

const STORE_KEY = "iib_02_03_state_v1";

// ===== I18N =====
const I18N = {
  zh: {
    topicTitle: "企業功能：營運、研發、行銷與財務管理",
    navTitle: "單元導覽",
    footerLeft: "建議投影：按「投影模式」可放大字級；共 2 小時，涵蓋四大企業功能。",
    helpTitle: "使用說明",
    helpBody: `
      <div class="card">
        <p class="p"><strong>用途：</strong>2 小時互動教學，涵蓋營運、研發、行銷、財務四大企業功能。</p>
        <div class="kpiRow">
          <div class="pill"><span class="dot"></span>← / →：切換單元</div>
          <div class="pill"><span class="dot"></span>L：語言切換</div>
          <div class="pill"><span class="dot"></span>P：投影模式</div>
          <div class="pill"><span class="dot"></span>R：重置互動</div>
          <div class="pill"><span class="dot"></span>?：說明</div>
        </div>
        <hr class="sep"/>
        <p class="p"><strong>教學時間建議：</strong></p>
        <ul class="ul">
          <li>🏠 開場（5 分鐘）：企業功能整體關係圖</li>
          <li>⚙️ 營運管理（30 分鐘）：Newsvendor → Bullwhip → 供應鏈遊戲</li>
          <li>🔬 研發管理（25 分鐘）：S曲線 → 破壞性創新 → LLM vs 搜尋</li>
          <li>📣 行銷管理（30 分鐘）：4P → 消費品分類 → Pizza競賽</li>
          <li>💰 財務管理（25 分鐘）：會計連結 → 公司財務要素</li>
          <li>🔁 收斂（5 分鐘）：一張圖串起來</li>
        </ul>
      </div>
    `,
    toastReset: "已重置互動狀態",
    buttons: { lang: "中文 / EN", presenter: "投影模式", reset: "重置互動", help: "?" },
    labels: {
      quickPoll: "快速投票",
      results: "票數（本機）",
      discussion: "討論追問",
      oneLiner: "一句話重點",
      activity: "互動活動",
      keyTakeaway: "核心概念"
    }
  },
  en: {
    topicTitle: "Business Functions: Operations, R&D, Marketing & Financial Management",
    navTitle: "Modules",
    footerLeft: "Projection tip: use Presenter mode. 2-hour session covering 4 business functions.",
    helpTitle: "How to use",
    helpBody: `
      <div class="card">
        <p class="p"><strong>Goal:</strong> 2-hour interactive session covering Operations, R&D, Marketing & Finance.</p>
        <div class="kpiRow">
          <div class="pill"><span class="dot"></span>← / →: switch module</div>
          <div class="pill"><span class="dot"></span>L: language</div>
          <div class="pill"><span class="dot"></span>P: presenter mode</div>
          <div class="pill"><span class="dot"></span>R: reset</div>
          <div class="pill"><span class="dot"></span>?: help</div>
        </div>
        <hr class="sep"/>
        <p class="p"><strong>Suggested timing:</strong></p>
        <ul class="ul">
          <li>🏠 Intro (5 min): Business functions overview</li>
          <li>⚙️ Operations Mgmt (30 min): Newsvendor → Bullwhip → Supply chain game</li>
          <li>🔬 R&D Mgmt (25 min): S-curve → Disruptive innovation → LLM vs Search</li>
          <li>📣 Marketing Mgmt (30 min): 4P → Product types → Pizza competition</li>
          <li>💰 Financial Mgmt (25 min): Accounting link → Corporate finance elements</li>
          <li>🔁 Wrap-up (5 min): Integrative diagram</li>
        </ul>
      </div>
    `,
    toastReset: "Interaction state reset",
    buttons: { lang: "中文 / EN", presenter: "Presenter", reset: "Reset", help: "?" },
    labels: {
      quickPoll: "Quick poll",
      results: "Counts (local)",
      discussion: "Discussion prompts",
      oneLiner: "One-liner",
      activity: "Interactive activity",
      keyTakeaway: "Key concept"
    }
  }
};

// View ordering for keyboard navigation
const VIEW_ORDER = [
  "start",
  "ops_intro","newsvendor","bullwhip","supply_game",
  "rd_intro","disruptive","llm_search",
  "mkt_intro","consumer_products","pizza_game",
  "acct_finance","corp_finance",
  "wrap"
];

// ===== State =====
const defaultState = {
  lang: "zh",
  presenter: false,
  view: "start",
  polls: {},
  sliders: {},
};

let state = loadState();

// ===== DOM =====
const content    = document.getElementById("content");
const btnLang    = document.getElementById("btnLang");
const btnPresent = document.getElementById("btnPresenter");
const btnReset   = document.getElementById("btnReset");
const btnHelp    = document.getElementById("btnHelp");
const helpDialog = document.getElementById("helpDialog");
const helpTitle  = document.getElementById("helpTitle");
const helpBody   = document.getElementById("helpBody");
const btnClose   = document.getElementById("btnCloseHelp");
const topicTitle = document.getElementById("topicTitle");
const navTitle   = document.getElementById("navTitle");
const footLeft   = document.getElementById("footLeft");
const toast      = document.getElementById("toast");

// ===== Helpers =====
function loadState(){
  try { const s = localStorage.getItem(STORE_KEY); return s ? {...defaultState,...JSON.parse(s)} : {...defaultState}; }
  catch(e){ return {...defaultState}; }
}
function saveState(){
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch(e){}
}
function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"), 2200);
}

// ===== Poll helpers =====
function getPoll(key){ return state.polls[key] || {a:0,b:0,c:0,d:0,choice:null}; }
function setPoll(key, choice){
  const p = getPoll(key);
  if(p.choice) p[p.choice] = Math.max(0,p[p.choice]-1);
  p[p.choice=choice] = (p[choice]||0)+1;
  state.polls[key] = p; saveState();
}
function totalVotes(p){ return (p.a||0)+(p.b||0)+(p.c||0)+(p.d||0); }
function pct(p,k){ const t=totalVotes(p); return t?Math.round((p[k]||0)/t*100):0; }

// ===== Slider helper =====
function getSlider(key, def){ return state.sliders[key] ?? def; }
function setSlider(key, val){ state.sliders[key]=val; saveState(); }

// ===== Render helpers =====
function pollCard({key, title, options, followup, accent}){
  const p = getPoll(key);
  const tot = totalVotes(p);
  const cls = accent ? ` ${accent}` : "";
  return `
    <div class="qBox${cls}">
      <p class="qTitle${cls}">📊 ${title}</p>
      <div class="options">
        ${options.map(([k,label])=>`
          <button class="opt" aria-pressed="${p.choice===k}" data-poll="${key}" data-opt="${k}">
            ${k.toUpperCase()}. ${label}
          </button>
        `).join("")}
      </div>
      <div class="progress">
        <div class="bar"><div class="fill" style="width:${tot>0?'100':'0'}%"></div></div>
        <span class="small">${tot} 票</span>
      </div>
      ${tot>0?`
        <div style="margin-top:8px; display:grid; gap:4px;">
          ${options.map(([k,label])=>`
            <div class="small" style="display:flex; align-items:center; gap:6px;">
              <span style="width:28px; font-weight:900; font-family:var(--mono);">${pct(p,k)}%</span>
              <div style="flex:1;height:8px;border-radius:4px;background:rgba(0,0,0,.06); overflow:hidden; border:1px solid var(--line);">
                <div style="height:100%;width:${pct(p,k)}%;background:linear-gradient(90deg,var(--ntu-gold),var(--ntu-maroon));transition:width .4s ease;"></div>
              </div>
              <span>${k.toUpperCase()}. ${label}</span>
            </div>
          `).join("")}
        </div>
      `:""}
      ${followup?.length ? `
        <hr class="sep"/>
        <p class="small" style="font-weight:800; margin-bottom:6px;">💬 討論追問</p>
        <ul class="ul" style="font-size:13px; margin-top:0; color:var(--muted);">
          ${followup.map(q=>`<li>${q}</li>`).join("")}
        </ul>
      `:``}
    </div>
  `;
}

function timeTag(label, time, cls){
  return `<span class="timePill ${cls}">${label} ${time}</span>`;
}
function timeTags(lang){
  const zh = lang==="zh";
  return `<div class="timeTracker">
    ${timeTag(zh?"🏠 開場":"🏠 Intro","5min","current")}
    ${timeTag(zh?"⚙️ 營運":"⚙️ Ops","30min","ops")}
    ${timeTag(zh?"🔬 研發":"🔬 R&D","25min","rd")}
    ${timeTag(zh?"📣 行銷":"📣 Mkt","30min","mkt")}
    ${timeTag(zh?"💰 財務":"💰 Fin","25min","fin")}
    ${timeTag(zh?"🔁 收斂":"🔁 Wrap","5min","")}
  </div>`;
}

// ===== Views =====

function viewStart(lang){
  const zh = lang==="zh";
  return `
    <div class="sectionHead">
      <div>
        <h1 class="h1">${zh?"企業功能：整體架構":"Business Functions: The Big Picture"}</h1>
        <p class="sub">${zh?"從市場到企業：四大功能如何協同創造與捕獲價值？（~5 分鐘）":"From markets to firms: how do the four functions co-create and capture value? (~5 min)"}</p>
      </div>
      <div class="tag">🏠 ${zh?"開場":"Intro"}</div>
    </div>
    ${timeTags(lang)}

    <div class="card" style="margin-bottom:14px;">
      <h3 class="cardTitle">${zh?"從市場到企業（Simons, 2016）":"From Markets to Firms (adapted from Simons, 2016)"}</h3>
      <p class="p" style="margin-bottom:12px;">${zh?"企業同時參與三種市場，並透過四大內部功能協調資源、創造並捕獲價值。":"A firm participates in three markets simultaneously and coordinates resources through four internal functions to create and capture value."}</p>
      <svg class="firmDiagramSvg" viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="max-width:100%; display:block; margin:0 auto;">
        <!-- Background -->
        <rect width="700" height="480" fill="white" rx="16"/>
        <!-- Center Firm Circle -->
        <circle cx="350" cy="240" r="52" fill="#1A8A7A" opacity=".85"/>
        <text x="350" y="244" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="18" font-weight="bold" font-family="sans-serif">Firm</text>
        <!-- Financial Markets (top) -->
        <rect x="275" y="28" width="150" height="44" rx="10" fill="#1A4A8B" opacity=".9"/>
        <text x="350" y="47" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="sans-serif">Financial</text>
        <text x="350" y="63" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="sans-serif">Markets</text>
        <!-- Factor Markets (left) -->
        <rect x="28" y="216" width="130" height="50" rx="10" fill="#7A0019" opacity=".85"/>
        <text x="93" y="238" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="sans-serif">Factor</text>
        <text x="93" y="256" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="sans-serif">Markets</text>
        <!-- Product Markets (right) -->
        <rect x="542" y="216" width="130" height="50" rx="10" fill="#7A3A00" opacity=".85"/>
        <text x="607" y="238" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="sans-serif">Product</text>
        <text x="607" y="256" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="sans-serif">Markets</text>
        <!-- Arrows: Financial -->
        <path d="M310 72 Q270 140 298 188" stroke="#1A4A8B" stroke-width="2.5" fill="none" marker-end="url(#arrowBlue)"/>
        <path d="M290 188 Q265 130 295 72" stroke="#1A4A8B" stroke-width="2.5" fill="none" stroke-dasharray="6,3"/>
        <text x="248" y="135" fill="#1A4A8B" font-size="12" font-family="sans-serif" font-weight="700">Investments</text>
        <text x="380" y="130" fill="#1A4A8B" font-size="11" font-family="sans-serif">Market Value</text>
        <text x="380" y="148" fill="#1A4A8B" font-size="11" font-family="sans-serif">Return on Inv.</text>
        <text x="380" y="166" fill="#1A4A8B" font-size="11" font-family="sans-serif">Profit</text>
        <!-- Arrows: Factor -->
        <path d="M158 241 Q230 241 298 241" stroke="#7A0019" stroke-width="2.5" fill="none" marker-end="url(#arrowRed)"/>
        <path d="M298 252 Q225 270 160 260" stroke="#7A0019" stroke-width="2.5" fill="none" stroke-dasharray="6,3" marker-end="url(#arrowRed2)"/>
        <text x="190" y="290" fill="#7A0019" font-size="12" font-family="sans-serif" font-weight="700">Cash Payments</text>
        <text x="165" y="185" fill="#60646C" font-size="11" font-family="sans-serif">Value Chain:</text>
        <text x="165" y="200" fill="#60646C" font-size="11" font-family="sans-serif">Material · Labor</text>
        <text x="165" y="215" fill="#60646C" font-size="11" font-family="sans-serif">Energy · Tech</text>
        <!-- Arrows: Product -->
        <path d="M402 241 Q480 241 542 241" stroke="#7A3A00" stroke-width="2.5" fill="none" marker-end="url(#arrowBrown)"/>
        <path d="M542 252 Q476 280 404 258" stroke="#7A3A00" stroke-width="2.5" fill="none" stroke-dasharray="6,3" marker-end="url(#arrowBrown2)"/>
        <text x="446" y="225" fill="#7A3A00" font-size="12" font-family="sans-serif" font-weight="700">Revenues</text>
        <text x="450" y="290" fill="#60646C" font-size="11" font-family="sans-serif">Value Prop:</text>
        <text x="450" y="305" fill="#60646C" font-size="11" font-family="sans-serif">Price · Quality</text>
        <text x="450" y="320" fill="#60646C" font-size="11" font-family="sans-serif">Features · Service</text>
        <!-- Stakeholder boxes -->
        <rect x="290" y="140" width="90" height="28" rx="6" fill="white" stroke="#E5E1DA" stroke-width="1.5"/>
        <text x="335" y="158" text-anchor="middle" fill="#60646C" font-size="11" font-family="sans-serif">Shareholders</text>
        <rect x="540" y="140" width="110" height="28" rx="6" fill="white" stroke="#E5E1DA" stroke-width="1.5"/>
        <text x="595" y="158" text-anchor="middle" fill="#60646C" font-size="11" font-family="sans-serif">Society</text>
        <rect x="540" y="178" width="130" height="28" rx="6" fill="white" stroke="#E5E1DA" stroke-width="1.5"/>
        <text x="605" y="196" text-anchor="middle" fill="#60646C" font-size="11" font-family="sans-serif">Institutions &amp; Supranational</text>
        <rect x="28" y="140" width="135" height="38" rx="6" fill="white" stroke="#E5E1DA" stroke-width="1.5"/>
        <text x="95" y="156" text-anchor="middle" fill="#60646C" font-size="11" font-family="sans-serif">Community &amp;</text>
        <text x="95" y="171" text-anchor="middle" fill="#60646C" font-size="11" font-family="sans-serif">Natural Environment</text>
        <rect x="28" y="290" width="90" height="28" rx="6" fill="white" stroke="#E5E1DA" stroke-width="1.5"/>
        <text x="73" y="308" text-anchor="middle" fill="#60646C" font-size="11" font-family="sans-serif">Suppliers</text>
        <rect x="28" y="330" width="90" height="28" rx="6" fill="white" stroke="#E5E1DA" stroke-width="1.5"/>
        <text x="73" y="348" text-anchor="middle" fill="#60646C" font-size="11" font-family="sans-serif">Employees</text>
        <rect x="572" y="290" width="100" height="28" rx="6" fill="white" stroke="#E5E1DA" stroke-width="1.5"/>
        <text x="622" y="308" text-anchor="middle" fill="#60646C" font-size="11" font-family="sans-serif">Consumers</text>
        <!-- Business Function Labels inside firm -->
        <text x="350" y="320" text-anchor="middle" fill="#1A6B4A" font-size="12" font-family="sans-serif" font-weight="800">⚙️ Operations</text>
        <text x="350" y="338" text-anchor="middle" fill="#1A4A8B" font-size="12" font-family="sans-serif" font-weight="800">🔬 R&amp;D</text>
        <text x="350" y="356" text-anchor="middle" fill="#7A3A00" font-size="12" font-family="sans-serif" font-weight="800">📣 Marketing</text>
        <text x="350" y="374" text-anchor="middle" fill="#4A006B" font-size="12" font-family="sans-serif" font-weight="800">💰 Finance</text>
        <!-- Source -->
        <text x="680" y="470" text-anchor="end" fill="#aaa" font-size="10" font-family="sans-serif">Adapted from Simons, 2016</text>
        <!-- Arrow markers -->
        <defs>
          <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#1A4A8B"/></marker>
          <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#7A0019"/></marker>
          <marker id="arrowRed2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#7A0019"/></marker>
          <marker id="arrowBrown" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#7A3A00"/></marker>
          <marker id="arrowBrown2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#7A3A00"/></marker>
        </defs>
      </svg>
      <p class="small" style="text-align:center; margin-top:8px;">${zh?"（互動圖：四大內部功能透過三個市場與外部環境連結）":"(The four internal functions connect to the external environment through three markets)"}</p>
    </div>

    <div class="grid2">
      <div class="card">
        <h3 class="cardTitle">${zh?"今日教學地圖（2小時）":"Today's Teaching Map (2 hours)"}</h3>
        <div class="callout">
          <p class="p">${zh?"<strong>核心問題：</strong>企業要生存，必須同時在<strong>要素市場</strong>取得資源、在<strong>產品市場</strong>競爭收益、向<strong>金融市場</strong>交代績效。四大功能是協調這三條線的引擎。":"<strong>Core question:</strong> To survive, a firm must simultaneously source inputs in <strong>factor markets</strong>, compete for revenues in <strong>product markets</strong>, and justify performance in <strong>financial markets</strong>. The four functions are the engines that coordinate these flows."}</p>
        </div>
        <div class="kpiRow">
          <div class="pill"><span class="dot ops"></span>${zh?"⚙️ 營運":"⚙️ Operations"}</div>
          <div class="pill"><span class="dot rd"></span>${zh?"🔬 研發":"🔬 R&D"}</div>
          <div class="pill"><span class="dot mkt"></span>${zh?"📣 行銷":"📣 Marketing"}</div>
          <div class="pill"><span class="dot fin"></span>${zh?"💰 財務":"💰 Finance"}</div>
        </div>
      </div>

      ${pollCard({
        key:"start_poll",
        lang,
        title: zh?"你認為哪個企業功能對公司成敗最關鍵？":"Which business function do you think matters most for firm success?",
        options:[
          ["a", zh?"⚙️ 營運管理（效率、品質、交期）":"⚙️ Operations (efficiency, quality, delivery)"],
          ["b", zh?"🔬 研發管理（創新、技術、新產品）":"🔬 R&D management (innovation, technology, new products)"],
          ["c", zh?"📣 行銷管理（了解顧客、創造需求）":"📣 Marketing management (customer insight, demand creation)"],
          ["d", zh?"💰 財務管理（資金、投資、財務績效）":"💰 Financial management (capital, investment, performance)"]
        ],
        followup: zh
          ? ["你選的功能，如果不靠另外三個功能支撐，會出什麼問題？","哪個功能是其他三個的『基礎』？（提示：因果關係）"]
          : ["If your chosen function couldn't rely on the other three, what would break down?","Which function is the 'foundation' for the other three?"]
      })}
    </div>
  `;
}

// ===== OPERATIONS =====
function viewOpsIntro(lang){
  const zh = lang==="zh";
  return `
    <div class="sectionHead">
      <div>
        <h1 class="h1" style="color:var(--ops-color)">${zh?"營運管理：核心問題與工具":"Operations Management: Core Questions & Tools"}</h1>
        <p class="sub">${zh?"如何以最有效率的方式生產正確數量、正確品質的產品或服務？（30 分鐘）":"How to produce the right quantity and quality of goods or services as efficiently as possible? (30 min)"}</p>
      </div>
      <div class="tag ops">⚙️ ${zh?"營運管理":"Operations"}</div>
    </div>
    <div class="grid2">
      <div class="card">
        <h3 class="cardTitle" style="color:var(--ops-color)">${zh?"一句話重點":"One-liner"}</h3>
        <div class="callout ops">
          <p class="p">${zh?"營運管理要回答：<strong>生產多少、何時、以什麼品質、用什麼成本</strong>？核心挑戰是在<em>需求不確定</em>下做最佳的庫存與產能決策。":"Operations management asks: <strong>How much, when, at what quality, and at what cost</strong>? The core challenge is making optimal inventory and capacity decisions under <em>demand uncertainty</em>."}</p>
        </div>
        <div class="kpiRow">
          <div class="pill"><span class="dot ops"></span>${zh?"數量 Quantity":"Quantity"}</div>
          <div class="pill"><span class="dot ops"></span>${zh?"成本 Cost":"Cost"}</div>
          <div class="pill"><span class="dot ops"></span>${zh?"品質 Quality":"Quality"}</div>
          <div class="pill"><span class="dot ops"></span>${zh?"時程 Timing":"Timing"}</div>
        </div>
        <hr class="sep"/>
        <h4 class="cardTitle" style="font-size:14px;">${zh?"關鍵管理目標":"Key management objectives"}</h4>
        <ul class="ul" style="font-size:14px;">
          <li>${zh?"<strong>數量規劃</strong>：需求預測、庫存管理、產能決策":"<strong>Quantity planning</strong>: demand forecasting, inventory, capacity"}</li>
          <li>${zh?"<strong>時程排程</strong>：Gantt 圖、PERT 圖、專案管理":"<strong>Scheduling</strong>: Gantt charts, PERT diagrams, project management"}</li>
          <li>${zh?"<strong>品質管理</strong>：SPC 統計製程管制、TQM 全面品質":"<strong>Quality management</strong>: SPC, TQM"}</li>
          <li>${zh?"<strong>物料管理</strong>：MRP 物料需求計畫、ERP 企業資源規劃":"<strong>Materials management</strong>: MRP, ERP systems"}</li>
        </ul>
      </div>
      <div class="card">
        <h3 class="cardTitle" style="color:var(--ops-color)">${zh?"台灣 OEM/ODM 模式":"Taiwan OEM/ODM Model"}</h3>
        <p class="p" style="font-size:14px;">${zh?"許多台灣企業採用 OEM（原廠委託製造）或 ODM（原廠委託設計製造）商業模式，靠精細的營運管理維持競爭力。":"Many Taiwanese firms use OEM (Original Equipment Manufacturer) or ODM (Original Design Manufacturer) models, competing through superior operations management."}</p>
        <div class="highlight" style="margin-top:12px;">
          <div class="highlightTitle">${zh?"Zara 的啟示：速度 = 競爭優勢":"Zara's insight: Speed = Competitive Advantage"}</div>
          <p class="p" style="font-size:13px;">${zh?"傳統服飾產業前置時間 9 個月，Zara 壓縮到 10-15 天。關鍵：把設計→生產→上架的整個流程重新設計，讓需求訊號能快速回饋。":"Traditional apparel: 9-month lead time. Zara compressed this to 10-15 days by redesigning the entire design→production→shelf process so demand signals feed back rapidly."}</p>
        </div>
        ${pollCard({
          key:"ops_oem_poll",
          title: zh?"台灣 OEM/ODM 廠商最大的營運挑戰是？":"Taiwan OEM/ODM firms' biggest operational challenge?",
          options:[
            ["a", zh?"需求預測困難、庫存過多或過少":"Demand forecasting & inventory (too much/little)"],
            ["b", zh?"品質一致性與客訴處理":"Quality consistency & customer complaints"],
            ["c", zh?"交期壓力與供應商管理":"Delivery pressure & supplier management"],
            ["d", zh?"成本上漲、毛利薄":"Rising costs & thin margins"]
          ],
          followup: zh?["這個挑戰和 Newsvendor Problem 有什麼關係？","Zara 的解法可以複製到你選的情境嗎？"]:
            ["How does this challenge relate to the Newsvendor Problem?","Can Zara's approach be replicated in your scenario?"],
          accent:"ops"
        })}
      </div>
    </div>
  `;
}

// ── Normal distribution helpers (used only by viewNewsvendor) ──
function _normPDF(z){ return Math.exp(-0.5*z*z)/Math.sqrt(2*Math.PI); }
function _normCDF(z){
  const t=1/(1+0.2316419*Math.abs(z));
  const p=1-_normPDF(z)*t*(0.319381530+t*(-0.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));
  return z>=0?p:1-p;
}
function _normLoss(z){ return _normPDF(z)-z*(1-_normCDF(z)); }

function viewNewsvendor(lang){
  const zh = lang==="zh";

  // ── Fixed parameters ──────────────────────────────────────
  const p=110, c=40, s=10, mu=50, sigma=15;
  const cu = p-c;          // 70  – underage cost per unit
  const co = c-s;          // 30  – overage cost per unit
  const cr = cu/(cu+co);   // 0.70
  const crPct = Math.round(cr*100);           // 70
  const zStar = 0.524;                        // Φ⁻¹(0.70)
  const qStar = Math.round(mu + zStar*sigma); // 58

  // ── User's chosen Q (slider, default = Q*) ────────────────
  const q = getSlider("nv_q", qStar);
  const z = (q - mu) / sigma;

  // ── Correct expected-value calculations ───────────────────
  // E[underage] = Cu · σ · L(z)          where L(z) = φ(z) − z·(1−Φ(z))
  // E[overage]  = Co · (σ·L(z) + Q − μ)
  // E[profit]   = (p−c)·μ − E[underage] − E[overage]
  const Lz        = _normLoss(z);
  const eUnderage = cu * sigma * Lz;
  const eOverage  = co * (sigma * Lz + (q - mu));
  const eProfit   = (p - c) * mu - eUnderage - eOverage;
  const eProfitStar = (p-c)*mu - cu*sigma*_normLoss(zStar) - co*(sigma*_normLoss(zStar)+(qStar-mu));
  const pctOfOptimal = eProfit/eProfitStar*100;

  // ── Mini profit curve: sample 9 Q values ─────────────────
  const curveQs = [30,35,40,45,50,55,58,63,68,73];
  const curveProfits = curveQs.map(qq=>{
    const lz = _normLoss((qq-mu)/sigma);
    return (p-c)*mu - cu*sigma*lz - co*(sigma*lz+(qq-mu));
  });
  const maxP = Math.max(...curveProfits);
  const barH = v => Math.max(4, Math.round((v/maxP)*60));

  return `
    <div class="sectionHead">
      <div>
        <h1 class="h1" style="color:var(--ops-color)">Newsvendor Problem &amp; Critical Ratio</h1>
        <p class="sub">${zh?"不確定需求下如何決定最佳庫存數量？":"How to determine optimal stocking quantity under uncertain demand?"}</p>
      </div>
      <div class="tag ops">⚙️ NVP</div>
    </div>

    <div class="grid2">
      <!-- ── LEFT: concept card ─────────────────────────────── -->
      <div class="card">
        <h3 class="cardTitle" style="color:var(--ops-color)">${zh?"經典問題設定":"Classic Problem Setup"}</h3>
        <div class="callout ops">
          <p class="p">${zh?"<strong>報販（Newsvendor）</strong>每天清晨採購報紙，未賣出的當日以殘值回收。他應採購多少份？（售價 $110，進貨 $40，殘值 $10，平均需求 μ = 50，σ = 15）":"A <strong>newsvendor</strong> buys papers each morning; unsold copies are salvaged at day-end. How many to buy? (sell $110, buy $40, salvage $10, mean demand μ=50, σ=15)"}</p>
        </div>

        <div class="grid2" style="margin-top:12px;">
          <div class="card" style="background:rgba(26,107,74,.06); border-color:rgba(26,107,74,.25);">
            <h4 class="cardTitle" style="color:var(--ops-color); font-size:14px;">${zh?"缺貨成本 Cu":"Underage cost Cu"}</h4>
            <p class="p" style="font-size:12px;">${zh?"少訂一份的機會成本 = 售價 − 進貨":"Lost profit per unmet unit = sell − buy"}</p>
            <div style="font-family:var(--mono); font-size:13px; margin-top:6px;">Cu = 110 − 40 = <strong style="font-size:17px; color:var(--ops-color);">$70</strong></div>
          </div>
          <div class="card" style="background:rgba(122,0,25,.06); border-color:rgba(122,0,25,.25);">
            <h4 class="cardTitle" style="color:var(--ntu-maroon); font-size:14px;">${zh?"過剩成本 Co":"Overage cost Co"}</h4>
            <p class="p" style="font-size:12px;">${zh?"多訂一份的損失 = 進貨 − 殘值":"Loss per leftover unit = buy − salvage"}</p>
            <div style="font-family:var(--mono); font-size:13px; margin-top:6px;">Co = 40 − 10 = <strong style="font-size:17px; color:var(--ntu-maroon);">$30</strong></div>
          </div>
        </div>

        <hr class="sep"/>
        <h4 class="cardTitle" style="color:var(--ops-color); font-size:15px;">Critical Ratio (CR)</h4>
        <div class="highlight">
          <div class="highlightTitle" style="font-family:var(--mono);">CR = Cu / (Cu + Co) = 70 / 100 = <span style="color:var(--ops-color)">70%</span></div>
          <p class="p" style="font-size:13px; margin-top:8px;">
            ${zh?"最佳採購量 Q* = 需求分佈的<strong>第 70 百分位數</strong>。":"Optimal Q* = the <strong>70th percentile</strong> of the demand distribution."}
          </p>
          <div style="margin-top:10px; padding:10px; border-radius:10px; background:rgba(26,74,139,.08); border:1px solid rgba(26,74,139,.2); font-family:var(--mono); font-size:13px; line-height:2;">
            Q* = μ + z<sub>0.70</sub> · σ<br>
            &nbsp;&nbsp;&nbsp;= 50 + 0.524 × 15<br>
            &nbsp;&nbsp;&nbsp;≈ <strong style="font-size:18px; color:var(--rd-color);">${qStar} ${zh?"份":"units"}</strong>
          </div>
          <p style="font-size:12px; color:var(--ntu-maroon); font-weight:700; margin:8px 0 0;">
            ⚠ ${zh?`Q* ≈ ${qStar} 份，<u>不是 50 份</u>（均值）。CR = 70% > 50% → 理性採購量必須超過平均需求`
                    :`Q* ≈ ${qStar} units, <u>not 50</u> (the mean). CR = 70% > 50% → rational order exceeds average demand`}
          </p>
        </div>

        <hr class="sep"/>
        <p class="p" style="font-size:13px;">
          ${zh?"<strong>直覺：</strong>缺貨 $70 ＞ 過剩 $30，採購量應偏向均值右側。若 CR = 50%（Cu = Co），Q* 才等於均值。":
                "<strong>Intuition:</strong> Stockout $70 > leftover $30, so order above the mean. Only when CR = 50% (Cu = Co) does Q* equal the mean."}
        </p>
        <p class="p" style="font-size:13px; margin-top:6px;">
          ${zh?"➡ CR 高（時裝、航空）：Q* 明顯超過均值。CR 低（鮮食）：Q* 低於均值。":
                "➡ High CR (fashion, airlines): Q* well above mean. Low CR (fresh food): Q* below mean."}
        </p>
      </div>

      <!-- ── RIGHT: interactive simulator ──────────────────── -->
      <div class="card">
        <h3 class="cardTitle" style="color:var(--ops-color)">${zh?"互動模擬：滑動調整採購量":"Interactive: Adjust stocking quantity"}</h3>
        <p class="p" style="font-size:12px; color:var(--muted);">${zh?"μ=50，σ=15，p=$110，c=$40，s=$10 → Q*=${qStar}（第 70 百分位數）":"μ=50, σ=15, p=$110, c=$40, s=$10 → Q*=${qStar} (70th percentile)"}</p>

        <div class="sliderRow" style="margin-top:10px;">
          <span style="font-size:14px; font-weight:700; width:80px; flex-shrink:0;">${zh?"採購量":"Order qty"}</span>
          <input type="range" min="25" max="80" value="${q}" id="nvSlider" oninput="handleNVSlider(this.value)"/>
          <div class="value" style="min-width:60px;">Q = ${q}</div>
        </div>

        <!-- KPI row: 3 cards -->
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:12px;">
          <div style="padding:8px; border-radius:10px; background:rgba(26,107,74,.08); border:1px solid rgba(26,107,74,.22); text-align:center;">
            <div style="font-size:10px; font-weight:800; color:var(--ops-color); margin-bottom:3px;">${zh?"預期缺貨損失":"E[Underage]"}</div>
            <div style="font-size:18px; font-weight:900; color:var(--ops-color);">$${eUnderage.toFixed(0)}</div>
            <div style="font-size:10px; color:var(--muted);">Cu·σ·L(z)</div>
          </div>
          <div style="padding:8px; border-radius:10px; background:rgba(122,0,25,.08); border:1px solid rgba(122,0,25,.22); text-align:center;">
            <div style="font-size:10px; font-weight:800; color:var(--ntu-maroon); margin-bottom:3px;">${zh?"預期過剩損失":"E[Overage]"}</div>
            <div style="font-size:18px; font-weight:900; color:var(--ntu-maroon);">$${eOverage.toFixed(0)}</div>
            <div style="font-size:10px; color:var(--muted);">Co·(σL(z)+Q−μ)</div>
          </div>
          <div style="padding:8px; border-radius:10px; background:${Math.abs(q-qStar)<=2?'rgba(26,107,74,.08)':'rgba(201,162,39,.12)'}; border:1px solid ${Math.abs(q-qStar)<=2?'rgba(26,107,74,.25)':'rgba(201,162,39,.4)'}; text-align:center;">
            <div style="font-size:10px; font-weight:800; color:${Math.abs(q-qStar)<=2?'var(--ops-color)':'#6B4E00'}; margin-bottom:3px;">${zh?"預期利潤":"E[Profit]"}</div>
            <div style="font-size:18px; font-weight:900; color:${Math.abs(q-qStar)<=2?'var(--ops-color)':'#6B4E00'};">$${eProfit.toFixed(0)}</div>
            <div style="font-size:10px; color:var(--muted);">${pctOfOptimal.toFixed(1)}% ${zh?"of Q*":"of Q*"}</div>
          </div>
        </div>

        <!-- Status bar -->
        <div style="margin-top:8px; padding:8px 10px; border-radius:8px; font-size:12px; font-weight:700;
             background:${Math.abs(q-qStar)<=2?'rgba(26,107,74,.08)':q<qStar?'rgba(26,74,139,.08)':'rgba(122,0,25,.08)'};
             border:1px solid ${Math.abs(q-qStar)<=2?'rgba(26,107,74,.25)':q<qStar?'rgba(26,74,139,.25)':'rgba(122,0,25,.25)'};">
          ${Math.abs(q-qStar)<=2
            ? `✅ ${zh?`Q = ${q} ≈ Q* = ${qStar}，接近最佳採購量！`:`Q = ${q} ≈ Q* = ${qStar}, near optimal!`}`
            : q < qStar
            ? `⬆ ${zh?`Q = ${q} < Q* = ${qStar}（訂太少）：缺貨損失 $${eUnderage.toFixed(0)} > 最佳 $${(cu*sigma*_normLoss(zStar)).toFixed(0)}，建議增加採購量`
                     :`Q = ${q} < Q* = ${qStar} (under-stocking): E[underage] $${eUnderage.toFixed(0)} exceeds optimal $${(cu*sigma*_normLoss(zStar)).toFixed(0)}, increase order`}`
            : `⬇ ${zh?`Q = ${q} > Q* = ${qStar}（訂太多）：過剩損失 $${eOverage.toFixed(0)} > 最佳 $${(co*(sigma*_normLoss(zStar)+(qStar-mu))).toFixed(0)}，建議減少採購量`
                     :`Q = ${q} > Q* = ${qStar} (over-stocking): E[overage] $${eOverage.toFixed(0)} exceeds optimal $${(co*(sigma*_normLoss(zStar)+(qStar-mu))).toFixed(0)}, reduce order`}`}
        </div>

        <!-- Expected profit curve -->
        <div style="margin-top:12px;">
          <div style="font-size:12px; font-weight:800; color:var(--muted); margin-bottom:6px;">${zh?"預期利潤曲線（Q* = ${qStar} 份為最高點）":"Expected profit curve (peak at Q* = ${qStar})"}</div>
          <div style="display:flex; align-items:flex-end; gap:3px; height:68px; padding:0 2px; position:relative;">
            ${curveQs.map((qq,i)=>{
              const h = barH(curveProfits[i]);
              const isQStar = qq===qStar;
              const isNearQ = Math.abs(qq-q)<=3;
              const col = isQStar ? 'var(--ntu-maroon)' : isNearQ ? 'var(--rd-color)' : 'rgba(26,107,74,.35)';
              return `<div style="flex:1; height:${h}px; border-radius:3px 3px 0 0; background:${col}; transition:all .3s ease; position:relative;" title="Q=${qq}: E[π]=$${curveProfits[i].toFixed(0)}">
                ${isQStar?`<div style="position:absolute; top:-16px; left:50%; transform:translateX(-50%); font-size:9px; font-weight:900; color:var(--ntu-maroon); white-space:nowrap;">Q*=${qStar}</div>`:''}
              </div>`;
            }).join("")}
          </div>
          <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--muted); margin-top:2px; padding:0 2px;">
            <span>30</span><span>45</span><span>58</span><span>68</span><span>73</span>
          </div>
          <div style="display:flex; gap:12px; margin-top:6px; flex-wrap:wrap; font-size:11px; font-weight:800;">
            <span style="color:var(--ntu-maroon);">■ Q* = ${qStar}（最佳）</span>
            <span style="color:var(--rd-color);">■ ${zh?"你目前的 Q":"Your current Q"} = ${q}</span>
            <span style="color:rgba(26,107,74,.6);">■ ${zh?"其他 Q 值":"Other Q values"}</span>
          </div>
        </div>

        ${pollCard({
          key:"nv_poll",
          title: zh?"航空座位（高 Cu，Co ≈ 0），CR 是多少？":"Airline seat (high Cu, Co ≈ 0): what is CR?",
          options:[
            ["a", zh?"CR → 0%，應少賣（空位成本高）":"CR → 0%, should under-sell"],
            ["b", zh?"CR → 100%，應超賣（缺貨遠比過剩貴）":"CR → 100%, should overbook (stockout ≫ leftover)"],
            ["c", zh?"CR = 70%，和本題一樣":"CR = 70%, same as this example"],
            ["d", zh?"CR = 50%，訂到平均需求":"CR = 50%, order to the mean"]
          ],
          followup: zh?
            ["Cu ≈ 票價，Co ≈ 0 → CR = Cu/(Cu+0) → 100%。Q* 遠超平均需求 → 超賣（Overbooking）是理性的。","實際 Co 含補償旅客費用（約 $150-300），使 CR 略低於 100%——航空公司精算每班超賣幾席，正是在求這個 Q*。"]:
            ["Cu ≈ ticket price, Co ≈ 0 → CR → 100%. Q* far exceeds mean → overbooking is rational.","In practice Co includes denied-boarding compensation (~$150-300), making CR slightly below 100%—airlines calculate exact overbooking qty by solving for this Q*."],
          accent:"ops"
        })}
      </div>
    </div>
  `;
}

function handleNVSlider(val){
  setSlider("nv_q", Number(val));
  renderView();
}

function viewBullwhip(lang){
  const zh = lang==="zh";
  const amp = getSlider("bw_amp", 50);
  const levels = [
    {label: zh?"消費者":"Consumer", base:10, icon:"🛒"},
    {label: zh?"零售商":"Retailer", base:13, icon:"🏪"},
    {label: zh?"批發商":"Wholesaler", base:17, icon:"🏭"},
    {label: zh?"製造商":"Manufacturer", base:22, icon:"⚙️"},
    {label: zh?"原料供應":"Raw Material", base:28, icon:"⛏️"},
  ];
  const factor = 0.5 + amp/100;
  return `
    <div class="sectionHead">
      <div>
        <h1 class="h1" style="color:var(--ops-color)">${zh?"牛鞭效應（Bullwhip Effect）":"The Bullwhip Effect"}</h1>
        <p class="sub">${zh?"零售端的小小需求波動，為何讓供應鏈上游掀起大浪？":"Why does a small demand fluctuation at retail create amplified waves upstream?"}</p>
      </div>
      <div class="tag ops">⚙️ Bullwhip</div>
    </div>
    <div class="grid2">
      <div class="card">
        <h3 class="cardTitle" style="color:var(--ops-color)">${zh?"什麼是牛鞭效應？":"What is the Bullwhip Effect?"}</h3>
        <div class="callout ops">
          <p class="p">${zh?"供應鏈<strong>末端（消費者）</strong>的需求波動，在往<strong>上游（製造、原料）</strong>傳遞時不斷被<strong>放大</strong>，導致上游廠商面對比實際需求更大的庫存波動——就像揮動牛鞭，鞭尖的振幅遠大於手腕。":"A small demand fluctuation at the <strong>downstream (consumer) end</strong> of the supply chain gets <strong>amplified</strong> as it propagates <strong>upstream (manufacturing, raw materials)</strong>—like a cracking whip, where the tip oscillates far more than the handle."}</p>
        </div>
        <h4 class="cardTitle" style="font-size:14px; margin-top:12px;">${zh?"四大成因":"Four Root Causes"}</h4>
        <ul class="ul" style="font-size:13px;">
          <li><strong>${zh?"需求訊號處理":"Demand signal processing"}</strong>: ${zh?"每層都把當期需求「外推」，高估未來":"Each tier extrapolates current demand, overestimating future"}</li>
          <li><strong>${zh?"批量訂購":"Order batching"}</strong>: ${zh?"為降低訂單固定成本而集中下單":"Ordering in batches to reduce fixed ordering costs"}</li>
          <li><strong>${zh?"價格波動":"Price fluctuation"}</strong>: ${zh?"促銷導致囤貨，非促銷期需求驟降":"Promotions trigger hoarding; demand collapses after"}</li>
          <li><strong>${zh?"短缺競爭":"Shortage gaming"}</strong>: ${zh?"預期缺貨時搶先多訂，缺貨消失後又取消":"Pre-ordering when shortage expected, canceling when resolved"}</li>
        </ul>
        <hr class="sep"/>
        <div class="highlight">
          <div class="highlightTitle">${zh?"解決方案（Zara 案例）":"Solutions (Zara case)"}</div>
          <p class="p" style="font-size:13px;">${zh?"1. <strong>縮短前置時間</strong>（Zara: 10-15天）<br>2. <strong>資訊分享</strong>（POS即時資料共享）<br>3. <strong>EDLP</strong>（每日低價，減少促銷波動）<br>4. <strong>Vendor-Managed Inventory</strong>（VMI）":"1. <strong>Reduce lead times</strong> (Zara: 10-15 days)<br>2. <strong>Information sharing</strong> (real-time POS data)<br>3. <strong>EDLP</strong> (everyday low prices, reduce promotion peaks)<br>4. <strong>Vendor-Managed Inventory (VMI)</strong>"}</p>
        </div>
      </div>
      <div class="card">
        <h3 class="cardTitle" style="color:var(--ops-color)">${zh?"互動：調整放大程度":"Interactive: Adjust amplification"}</h3>
        <p class="p" style="font-size:13px;">${zh?"滑動調整供應鏈放大程度，觀察各層訂單波動如何變化：":"Slide to adjust amplification—observe how order variability changes at each tier:"}</p>
        <div class="sliderRow" style="margin-top:10px;">
          <span style="font-size:13px; font-weight:700;">${zh?"牛鞭強度":"Bullwhip intensity"}</span>
          <input type="range" min="0" max="100" value="${amp}" id="bwSlider" oninput="handleBWSlider(this.value)"/>
          <div class="value" id="bwVal">${amp < 30?"低":"(amp < 70?'中':'高')"}</div>
        </div>
        <div class="bullwhipVisual" style="margin-top:12px;">
          ${levels.map((lvl,i)=>{
            const width = Math.round(lvl.base * Math.pow(factor, i));
            const col = `hsl(${200-i*30},${50+i*8}%,${45+i*5}%)`;
            return `
              <div class="bwRow">
                <div class="bwLabel">${lvl.icon} ${lvl.label}</div>
                <div class="bwBars" style="position:relative; height:28px; background:rgba(0,0,0,.03); border-radius:4px; overflow:hidden;">
                  <div style="height:100%; width:${Math.min(width,100)}%; background:${col}; border-radius:4px; transition:width .4s ease; display:flex; align-items:center; padding:0 8px;">
                    <span style="font-size:11px; font-weight:800; color:white;">${width > 15 ? width+'%':''}</span>
                  </div>
                </div>
                <div style="font-size:11px; font-weight:900; color:${col}; width:36px; text-align:right;">${width}%</div>
              </div>
            `;
          }).join("")}
        </div>
        <p class="small" style="margin-top:8px;">${zh?"消費者需求波動：${Math.round(levels[0].base * factor)}%；原料端波動：${Math.round(levels[4].base * Math.pow(factor,4))}%":"Consumer fluctuation: ${Math.round(levels[0].base * factor)}%; Raw material: ${Math.round(levels[4].base * Math.pow(factor,4))}%"}</p>
        ${pollCard({
          key:"bw_poll",
          title: zh?"台灣半導體供應鏈中，牛鞭效應最嚴重出現在哪個環節？":"In Taiwan's semiconductor supply chain, where is the Bullwhip Effect most severe?",
          options:[
            ["a", zh?"晶片設計公司（Fabless）的訂單需求":"Fabless chip design company demand"],
            ["b", zh?"晶圓代工（TSMC等）的產能配置":"Wafer foundry (TSMC) capacity allocation"],
            ["c", zh?"IC 封裝測試廠商的庫存":"IC packaging & testing inventory"],
            ["d", zh?"電子品牌大廠（Apple、HP）的採購":"Brand OEM (Apple, HP) procurement"]
          ],
          followup: zh?["這個環節的前置時間是多長？如何壓縮？","COVID後台灣半導體出現什麼樣的牛鞭效應案例？"]:
            ["What is the lead time at this tier? How can it be reduced?","What Bullwhip Effect cases emerged in Taiwan's semiconductor sector post-COVID?"],
          accent:"ops"
        })}
      </div>
    </div>
  `;
}

function handleBWSlider(val){
  setSlider("bw_amp", Number(val));
  renderView();
}

function viewSupplyGame(lang){
  const zh = lang==="zh";
  return `
    <div class="sectionHead">
      <div>
        <h1 class="h1" style="color:var(--ops-color)">${zh?"供應鏈遊戲｜Can you manage a supply chain?":"Supply Chain Game｜Can you manage a supply chain?"}</h1>
        <p class="sub">${zh?"OpenLearn 互動模擬：親身體驗 Bullwhip Effect 的生成機制（~15 分鐘）":"OpenLearn interactive simulation: experience the Bullwhip Effect firsthand (~15 min)"}</p>
      </div>
      <div class="tag ops">⚙️ ${zh?"遊戲":"Game"}</div>
    </div>
    <div class="card" style="margin-bottom:14px;">
      <h3 class="cardTitle" style="color:var(--ops-color)">${zh?"遊戲說明":"Game Instructions"}</h3>
      <div class="grid2">
        <div>
          <div class="callout ops">
            <p class="p">${zh?"你將扮演供應鏈中的一個角色（零售商、批發商或製造商），在需求不確定下做訂單決策。看看你能不能避免牛鞭效應！":"You play a role in the supply chain (retailer, wholesaler, or manufacturer) and make ordering decisions under demand uncertainty. Can you avoid the Bullwhip Effect?"}</p>
          </div>
          <div class="kpiRow" style="margin-top:10px;">
            <div class="pill"><span class="dot ops"></span>${zh?"角色：零售/批發/製造":"Role: retail/wholesale/mfg"}</div>
            <div class="pill"><span class="dot ops"></span>${zh?"決策：每期訂單量":"Decision: order qty each period"}</div>
            <div class="pill"><span class="dot ops"></span>${zh?"目標：最小化成本":"Objective: minimize cost"}</div>
          </div>
          <hr class="sep"/>
          <h4 class="cardTitle" style="font-size:14px;">${zh?"遊戲後討論問題":"Post-game discussion"}</h4>
          <ul class="ul" style="font-size:13px;">
            <li>${zh?"你的訂單波動比消費者需求更大嗎？原因是什麼？":"Was your order variability larger than consumer demand? Why?"}</li>
            <li>${zh?"什麼資訊如果能看到，會讓你做出更好的決策？":"What information, if visible, would have helped you decide better?"}</li>
            <li>${zh?"現實中，你會用什麼工具來解決這個問題？":"In reality, what tools would you use to solve this?"}</li>
          </ul>
        </div>
        <div>
          ${pollCard({
            key:"supply_game_poll",
            title: zh?"玩完遊戲後，你認為牛鞭效應最主要的根因是？":"After playing, what do you think is the primary root cause of the Bullwhip Effect?",
            options:[
              ["a", zh?"資訊不透明（看不到下游真實需求）":"Information opacity (can't see downstream demand)"],
              ["b", zh?"批量訂購習慣（降低訂單固定成本）":"Order batching (fixed ordering cost)"],
              ["c", zh?"過度反應（對需求波動過度修正）":"Overreaction (over-correcting to demand signals)"],
              ["d", zh?"價格誘因（囤貨）":"Price incentives (forward buying)"]
            ],
            followup: zh?["如果所有層級都能即時看到消費者 POS 資料，結果會不同嗎？","哪個根因最難消除？為什麼？"]:
              ["If all tiers could see real-time consumer POS data, would outcomes differ?","Which root cause is hardest to eliminate and why?"],
            accent:"ops"
          })}
        </div>
      </div>
    </div>
    <div class="embedWrap">
      <div class="embedHeader">
        <div class="embedTitle">🎮 Can you manage a supply chain? — OpenLearn, Open University</div>
        <a href="https://www.open.edu/openlearn/money-business/business-strategy-studies/can-you-manage-supply-chain" target="_blank" class="btn" style="font-size:12px;">${zh?"在新分頁開啟":"Open in new tab"} ↗</a>
      </div>
      <iframe src="https://www.open.edu/openlearn/money-business/business-strategy-studies/can-you-manage-supply-chain" height="600" loading="lazy" title="Supply Chain Game" allowfullscreen></iframe>
    </div>
    <div class="card" style="margin-top:14px;">
      <h3 class="cardTitle" style="color:var(--ops-color);">${zh?"如果遊戲無法嵌入：討論替代方案":"If the game cannot load: alternative discussion"}</h3>
      <p class="p" style="font-size:14px;">${zh?"老師可帶領學生用角色扮演方式模擬 Beer Game（啤酒遊戲）：把全班分成4組（零售/批發/分銷/製造），每組只和相鄰層溝通，觀察訂單如何在各層級放大。":"The instructor can lead a Beer Game role-play: divide the class into 4 groups (retail/wholesale/distribution/manufacturing), each communicating only with adjacent tiers, and observe how orders amplify at each level."}</p>
    </div>
  `;
}

// ===== R&D MANAGEMENT =====
function viewRDIntro(lang){
  const zh = lang==="zh";
  const era = getSlider("scurve_era", 50);
  return `
    <div class="sectionHead">
      <div>
        <h1 class="h1" style="color:var(--rd-color)">${zh?"研發管理：技術 S 曲線":"R&D Management: The Technology S-Curve"}</h1>
        <p class="sub">${zh?"技術如何演化？為什麼有些技術突然停滯，又被新技術取代？（25 分鐘）":"How do technologies evolve? Why do some suddenly plateau and get replaced? (25 min)"}</p>
      </div>
      <div class="tag rd">🔬 R&D</div>
    </div>
    <div class="grid2">
      <div class="card">
        <h3 class="cardTitle" style="color:var(--rd-color)">${zh?"技術 S 曲線（Industrial Process Life Cycle）":"Technology S-Curve (Industrial Process Life Cycle)"}</h3>
        <div class="callout rd">
          <p class="p">${zh?"技術的進步通常遵循 S 型曲線：<strong>萌芽期</strong>（緩慢學習）→ <strong>成長期</strong>（快速進步）→ <strong>成熟期</strong>（效益遞減）。當技術接近物理極限，繼續投入的回報遞減，此時新技術往往從邊緣悄然出現。":"Technology progress typically follows an S-curve: <strong>emergence</strong> (slow learning) → <strong>growth</strong> (rapid improvement) → <strong>maturity</strong> (diminishing returns). As a technology approaches its physical limits, a new technology often quietly emerges at the margins."}</p>
        </div>
        <div class="sliderRow" style="margin-top:12px;">
          <span style="font-size:13px; font-weight:700;">${zh?"時間進度":"Time progress"}</span>
          <input type="range" min="0" max="100" value="${era}" id="scurveSlider" oninput="handleSCurveSlider(this.value)"/>
          <div class="value" id="scurveVal">${era < 25 ? (zh?"萌芽":"Emergence") : era < 60 ? (zh?"成長":"Growth") : era < 85 ? (zh?"成熟":"Maturity") : (zh?"飽和":"Saturation")}</div>
        </div>
        <!-- S-curve SVG -->
        <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" style="width:100%; margin-top:8px; border:1px solid var(--line); border-radius:10px; background:#fafafa;">
          <defs>
            <clipPath id="scurveClip">
              <rect x="40" y="10" width="${Math.round(3.2*era)}" height="200"/>
            </clipPath>
          </defs>
          <!-- Axes -->
          <line x1="40" y1="190" x2="380" y2="190" stroke="#ccc" stroke-width="1.5"/>
          <line x1="40" y1="10" x2="40" y2="190" stroke="#ccc" stroke-width="1.5"/>
          <text x="210" y="210" text-anchor="middle" fill="#999" font-size="11" font-family="sans-serif">${zh?"時間 / 研發投入":"Time / R&D Inputs"}</text>
          <text x="12" y="100" fill="#999" font-size="11" font-family="sans-serif" transform="rotate(-90,12,100)">${zh?"績效":"Performance"}</text>
          <!-- S-curve path -->
          <path d="M40,185 C80,183 110,175 140,155 C170,130 190,90 210,60 C230,35 260,22 300,18 C330,15 360,16 380,16" stroke="#1A4A8B" stroke-width="2.5" fill="none" opacity=".25"/>
          <path d="M40,185 C80,183 110,175 140,155 C170,130 190,90 210,60 C230,35 260,22 300,18 C330,15 360,16 380,16" stroke="#1A4A8B" stroke-width="3" fill="none" clip-path="url(#scurveClip)"/>
          <!-- Phase labels -->
          <text x="75" y="165" fill="#60646C" font-size="10" font-family="sans-serif" text-anchor="middle">${zh?"萌芽期":"Emergence"}</text>
          <text x="175" y="95" fill="#1A4A8B" font-size="10" font-family="sans-serif" text-anchor="middle">${zh?"成長期":"Growth"}</text>
          <text x="300" y="38" fill="#60646C" font-size="10" font-family="sans-serif" text-anchor="middle">${zh?"成熟／飽和":"Maturity"}</text>
          <!-- Phase dividers -->
          <line x1="120" y1="20" x2="120" y2="185" stroke="#E5E1DA" stroke-width="1" stroke-dasharray="4,3"/>
          <line x1="240" y1="20" x2="240" y2="185" stroke="#E5E1DA" stroke-width="1" stroke-dasharray="4,3"/>
          <!-- Current marker -->
          <circle cx="${40+Math.round(3.2*Math.min(era,99))}" cy="${Math.round(185 - 169/(1+Math.exp(-0.08*(era-50))))}" r="6" fill="#1A4A8B" stroke="white" stroke-width="2"/>
        </svg>
        <p class="small" style="margin-top:6px;">${zh?"拖動滑桿觀察技術在S曲線上的演化位置，以及各階段的策略涵義。":"Slide to see where a technology sits on the S-curve and the strategic implications at each phase."}</p>
      </div>
      <div class="card">
        <h3 class="cardTitle" style="color:var(--rd-color)">${zh?"各階段策略涵義":"Strategic Implications by Phase"}</h3>
        <div class="timeline">
          <div class="tlItem">
            <div class="tlLabel">${zh?"萌芽期（Phase 1）":"Emergence (Phase 1)"}</div>
            <div class="tlText">${zh?"多年摸索、學習、實驗。技術尚未定型，規格競爭激烈。<strong>策略</strong>：廣泛探索、容忍失敗、尋找突破口。":"Years of learning and probing. Technology unsettled, design competition intense. <strong>Strategy</strong>: broad exploration, tolerance of failure, search for breakthroughs."}</div>
          </div>
          <div class="tlItem">
            <div class="tlLabel">${zh?"成長期（Phase 2）":"Growth (Phase 2)"}</div>
            <div class="tlText">${zh?"主流設計確立（Dominant Design），快速改善製程，規模效益出現。<strong>策略</strong>：快速放量、標準化、建立領先地位。":"Dominant Design established, rapid process improvement, scale economies emerge. <strong>Strategy</strong>: ramp up fast, standardize, build leadership."}</div>
          </div>
          <div class="tlItem">
            <div class="tlLabel">${zh?"成熟／飽和期（Phase 3）":"Maturity/Saturation (Phase 3)"}</div>
            <div class="tlText">${zh?"接近物理或技術極限，效益遞減，持續投入的回報下降。<strong>策略</strong>：此時注意！新 S 曲線可能已在另一個地方開始……":"Approaching physical/technical limits, diminishing returns. <strong>Strategy</strong>: Beware! A new S-curve may already be starting somewhere else..."}</div>
          </div>
          <div class="tlItem new">
            <div class="tlLabel new">${zh?"技術不連續！":"Technological Discontinuity!"}</div>
            <div class="tlText">${zh?"新技術從全新 S 曲線起步，初期表現可能更差——但有截然不同的進步軌跡和終極極限。":"A new technology starts its own S-curve—may initially perform worse, but has a different trajectory and ultimate limit."}</div>
          </div>
        </div>
        ${pollCard({
          key:"scurve_poll",
          title: zh?"手機 OLED 螢幕技術，目前大概在 S 曲線哪個位置？":"Where is smartphone OLED display technology on the S-curve?",
          options:[
            ["a", zh?"萌芽期：技術仍在突破":"Emergence: technology still breaking through"],
            ["b", zh?"成長期：快速改善中":"Growth: rapidly improving"],
            ["c", zh?"成熟期：接近物理極限":"Maturity: approaching physical limits"],
            ["d", zh?"飽和／被取代中（microLED？）":"Saturation/being replaced (microLED?)"]
          ],
          followup: zh?["下一個 S 曲線是什麼？什麼時候會達到「不連續點」？","台灣面板廠（AUO、Innolux）的策略選擇是？"]:
            ["What's the next S-curve? When will the discontinuity hit?","What strategy should Taiwan's panel makers (AUO, Innolux) pursue?"],
          accent:"rd"
        })}
      </div>
    </div>
  `;
}

function handleSCurveSlider(val){
  setSlider("scurve_era", Number(val));
  renderView();
}

function viewDisruptive(lang){
  const zh = lang==="zh";
  return `
    <div class="sectionHead">
      <div>
        <h1 class="h1" style="color:var(--rd-color)">${zh?"破壞性技術變革（Disruptive Technological Change）":"Disruptive Technological Change"}</h1>
        <p class="sub">${zh?"為什麼領先企業常常被後起之秀顛覆？（Christensen, 1997）":"Why are market leaders so often disrupted by challengers? (Christensen, 1997)"}</p>
      </div>
      <div class="tag rd">🔬 Disruption</div>
    </div>
    <div class="grid2">
      <div class="card">
        <h3 class="cardTitle" style="color:var(--rd-color)">${zh?"持續性 vs. 破壞性技術":"Sustaining vs. Disruptive Technology"}</h3>
        <div class="grid2" style="gap:10px; margin-bottom:12px;">
          <div class="card" style="background:rgba(26,74,139,.06); border-color:rgba(26,74,139,.3);">
            <h4 class="cardTitle" style="color:var(--rd-color); font-size:14px;">📈 ${zh?"持續性技術":"Sustaining Technology"}</h4>
            <ul class="ul" style="font-size:12px;">
              <li>${zh?"以現有顧客的標準改善產品":"Improves product on metrics valued by current customers"}</li>
              <li>${zh?"讓主流客戶更滿意":"Mainstream customers become more satisfied"}</li>
              <li>${zh?"既有廠商通常領先":"Incumbents usually lead"}</li>
              <li>${zh?"例：更快的 CPU、更高解析度螢幕":"e.g. Faster CPU, higher-res displays"}</li>
            </ul>
          </div>
          <div class="card" style="background:rgba(122,0,25,.06); border-color:rgba(122,0,25,.3);">
            <h4 class="cardTitle" style="color:var(--ntu-maroon); font-size:14px;">⚡ ${zh?"破壞性技術":"Disruptive Technology"}</h4>
            <ul class="ul" style="font-size:12px;">
              <li>${zh?"以不同指標吸引<em>非主流</em>客戶":"Appeals to non-mainstream customers on different metrics"}</li>
              <li>${zh?"初期表現「更差」（對主流客戶）":"Initially 'worse' (by mainstream standards)"}</li>
              <li>${zh?"從邊緣向上攻":"Attacks from the low end/fringe"}</li>
              <li>${zh?"既有廠商難以反應（資源詛咒）":"Incumbents struggle to respond (resources curse)"}</li>
            </ul>
          </div>
        </div>
        <div class="callout rd">
          <p class="p">${zh?"<strong>關鍵洞見</strong>：主流客戶的需求有一個「滿足天花板」——當現有技術已過度滿足主流需求，破壞性技術就從下方（或邊緣）悄悄超越，等既有廠商發現，為時已晚。":"<strong>Key insight</strong>: Mainstream customers have a 'satisfaction ceiling.' When existing technology overshoots their needs, a disruptive technology quietly overtakes from below (or the fringe). By the time incumbents react, it's often too late."}</p>
        </div>
        <!-- Disruption SVG -->
        <svg viewBox="0 0 380 200" xmlns="http://www.w3.org/2000/svg" style="width:100%; margin-top:12px; border:1px solid var(--line); border-radius:10px; background:#fafafa;">
          <!-- Axes -->
          <line x1="35" y1="180" x2="360" y2="180" stroke="#ccc" stroke-width="1.5"/>
          <line x1="35" y1="10" x2="35" y2="180" stroke="#ccc" stroke-width="1.5"/>
          <text x="200" y="198" text-anchor="middle" fill="#999" font-size="10" font-family="sans-serif">${zh?"時間":"Time"}</text>
          <text x="14" y="95" fill="#999" font-size="10" font-family="sans-serif" transform="rotate(-90,14,95)">${zh?"績效":"Performance"}</text>
          <!-- Customer need line -->
          <line x1="35" y1="90" x2="360" y2="70" stroke="#C9A227" stroke-width="2" stroke-dasharray="6,3"/>
          <text x="340" y="65" fill="#C9A227" font-size="9" font-family="sans-serif">${zh?"主流需求":"Customer need"}</text>
          <!-- Old technology S-curve -->
          <path d="M35,175 C70,172 100,155 130,120 C155,90 175,55 200,40 C225,28 260,25 310,24 C330,24 345,23 360,23" stroke="#1A4A8B" stroke-width="2.5" fill="none"/>
          <text x="200" y="28" fill="#1A4A8B" font-size="10" font-family="sans-serif">${zh?"既有技術":"Old tech"}</text>
          <!-- New disruptive technology -->
          <path d="M130,178 C160,176 185,170 210,158 C235,140 250,110 270,82 C285,60 305,45 340,35" stroke="#7A0019" stroke-width="2.5" fill="none"/>
          <text x="340" y="32" fill="#7A0019" font-size="10" font-family="sans-serif">${zh?"新技術":"New tech"}</text>
          <!-- Intersection -->
          <circle cx="260" cy="88" r="5" fill="#7A0019" opacity=".7"/>
          <text x="264" y="83" fill="#7A0019" font-size="9" font-family="sans-serif">${zh?"超越點":"Crossing"}</text>
          <!-- Label incumbents -->
          <text x="45" y="168" fill="#60646C" font-size="9" font-family="sans-serif">${zh?"初期：新技術表現差":"Initially inferior"}</text>
        </svg>
      </div>
      <div class="card">
        <h3 class="cardTitle" style="color:var(--rd-color)">${zh?"為何既有廠商難以應對？":"Why Can't Incumbents Respond?"}</h3>
        <ul class="ul" style="font-size:14px;">
          <li><strong>${zh?"主流客戶綁架":"Mainstream customer lock-in"}</strong>: ${zh?"銷售、行銷、研發都圍著主流客戶轉，邊緣市場看不上。":"Sales, marketing, R&D all optimized for mainstream; fringe markets seem unworthy."}</li>
          <li><strong>${zh?"資源詛咒":"Resource curse"}</strong>: ${zh?"既有廠商的競爭力來自既有技術，新技術一開始需要不同的能力和商業模式。":"Incumbents' strengths are tied to old tech; new tech requires different capabilities and business models."}</li>
          <li><strong>${zh?"財務短視":"Financial myopia"}</strong>: ${zh?"初期的破壞性技術市場太小，無法滿足大公司的利潤目標。":"Early disruptive markets are too small to meet large firms' profit targets."}</li>
        </ul>
        <hr class="sep"/>
        <h4 class="cardTitle" style="font-size:14px;">${zh?"Zara 的破壞性創新":"Zara as Disruptive Innovator"}</h4>
        <div class="callout rd" style="font-size:13px;">
          <p class="p">${zh?"傳統服飾業的績效指標：<em>設計品質、品牌形象</em>。Zara 重新定義指標：<em>新鮮度（Freshness）</em>——快速更新設計，讓消費者每週都有新品可買。傳統廠商被自己的優勢（深厚設計、長週期生產）所困。":"Traditional apparel's performance metric: <em>design quality, brand prestige</em>. Zara redefined the metric: <em>freshness</em>—rapid design turnover, so consumers find new items every week. Incumbents were trapped by their own strengths (deep design, long-cycle production)."}</p>
        </div>
        ${pollCard({
          key:"disrupt_poll",
          title: zh?"哪個案例最符合「破壞性創新」的定義？":"Which best fits the 'disruptive innovation' definition?",
          options:[
            ["a", zh?"iPhone 從 iPod 進化到更好的手機":"iPhone evolving from iPod to a better phone"],
            ["b", zh?"Netflix 從 DVD 郵寄進化到串流":"Netflix from DVD mail to streaming"],
            ["c", zh?"特斯拉以電動車切入高端市場":"Tesla entering the premium EV segment"],
            ["d", zh?"Spotify 讓音樂訂閱比 CD 更方便":"Spotify making music subscription easier than CDs"]
          ],
          followup: zh?["你選的案例，初期的客群和現有技術是完全不同的嗎？","既有廠商（唱片公司、百視達、Sony）為何沒有先做到？"]:
            ["For your choice, was the initial customer segment different from mainstream?","Why couldn't incumbents (record labels, Blockbuster, Sony) do it first?"],
          accent:"rd"
        })}
      </div>
    </div>
  `;
}

function viewLLMSearch(lang){
  const zh = lang==="zh";
  return `
    <div class="sectionHead">
      <div>
        <h1 class="h1" style="color:var(--rd-color)">${zh?"LLM vs 傳統搜尋引擎：S 曲線視角":"LLMs vs Traditional Search Engines: An S-Curve Perspective"}</h1>
        <p class="sub">${zh?"大型語言模型是否正在對 Google 等傳統搜尋引擎發動破壞性顛覆？":"Are Large Language Models launching a disruptive attack on Google and traditional search?"}</p>
      </div>
      <div class="tag rd">🔬 Case Study</div>
    </div>
    <div class="grid2">
      <div class="card">
        <h3 class="cardTitle" style="color:var(--rd-color)">${zh?"兩條 S 曲線的碰撞":"Collision of Two S-Curves"}</h3>
        <svg viewBox="0 0 380 210" xmlns="http://www.w3.org/2000/svg" style="width:100%; border:1px solid var(--line); border-radius:10px; background:#fafafa; margin-bottom:10px;">
          <line x1="35" y1="190" x2="360" y2="190" stroke="#ccc" stroke-width="1.5"/>
          <line x1="35" y1="10" x2="35" y2="190" stroke="#ccc" stroke-width="1.5"/>
          <text x="200" y="208" text-anchor="middle" fill="#999" font-size="10" font-family="sans-serif">${zh?"時間（2000 → 2030+）":"Time (2000 → 2030+)"}</text>
          <!-- Traditional Search S-curve (flattening) -->
          <path d="M35,185 C55,183 75,170 100,140 C125,105 145,65 165,45 C185,30 215,22 260,20 C295,19 330,19 360,19" stroke="#60646C" stroke-width="2.5" fill="none" opacity=".7"/>
          <text x="280" y="16" fill="#60646C" font-size="9" font-family="sans-serif">${zh?"傳統搜尋（Google等）":"Traditional Search"}</text>
          <!-- LLM new S-curve -->
          <path d="M200,188 C215,187 230,183 245,174 C262,160 274,138 286,112 C298,86 312,62 330,48 C345,38 355,35 360,34" stroke="#7A0019" stroke-width="2.5" fill="none"/>
          <text x="310" y="30" fill="#7A0019" font-size="9" font-family="sans-serif">LLMs</text>
          <!-- Current marker -->
          <circle cx="268" cy="110" r="5" fill="#7A0019" stroke="white" stroke-width="2"/>
          <text x="230" y="107" fill="#7A0019" font-size="9" font-family="sans-serif">${zh?"← 現在 Now":"← Now"}</text>
          <!-- Saturation zone -->
          <rect x="220" y="15" width="140" height="178" fill="rgba(201,162,39,.05)" stroke="none"/>
          <text x="290" y="100" fill="#C9A227" font-size="9" font-family="sans-serif" text-anchor="middle">${zh?"競爭區":"Contested Zone"}</text>
          <!-- Phase markers -->
          <line x1="165" y1="15" x2="165" y2="185" stroke="#E5E1DA" stroke-width="1" stroke-dasharray="4,3"/>
          <text x="130" y="30" fill="#60646C" font-size="9" font-family="sans-serif">${zh?"搜尋黃金時代":"Search Golden Age"}</text>
          <line x1="215" y1="15" x2="215" y2="185" stroke="#E5E1DA" stroke-width="1" stroke-dasharray="4,3"/>
          <text x="185" y="145" fill="#999" font-size="8" font-family="sans-serif">ChatGPT</text>
          <text x="185" y="155" fill="#999" font-size="8" font-family="sans-serif">2022</text>
        </svg>
        <div class="grid2" style="gap:10px;">
          <div class="card" style="background:rgba(96,100,108,.06); border-color:rgba(96,100,108,.3);">
            <h4 style="margin:0 0 6px; font-size:13px; font-weight:900; color:#60646C;">${zh?"傳統搜尋引擎":"Traditional Search"}</h4>
            <ul class="ul" style="font-size:12px; margin-top:0;">
              <li>${zh?"關鍵字比對、網頁索引":"Keyword matching, web indexing"}</li>
              <li>${zh?"藍色連結、廣告商業模式":"Blue links, ad-based revenue"}</li>
              <li>${zh?"使用者需自行過濾資訊":"Users filter info themselves"}</li>
              <li>${zh?"S曲線趨於平坦（功能改善緩慢）":"S-curve flattening (incremental gains)"}</li>
            </ul>
          </div>
          <div class="card" style="background:rgba(122,0,25,.06); border-color:rgba(122,0,25,.3);">
            <h4 style="margin:0 0 6px; font-size:13px; font-weight:900; color:var(--ntu-maroon);">LLMs (ChatGPT, etc.)</h4>
            <ul class="ul" style="font-size:12px; margin-top:0;">
              <li>${zh?"自然語言理解與生成":"Natural language understanding & generation"}</li>
              <li>${zh?"直接給答案，不給連結":"Direct answers, not links"}</li>
              <li>${zh?"新的商業模式（訂閱）":"New business model (subscription)"}</li>
              <li>${zh?"S曲線快速上升":"S-curve rising rapidly"}</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="card">
        <h3 class="cardTitle" style="color:var(--rd-color)">${zh?"這是破壞性創新嗎？":"Is This Disruptive Innovation?"}</h3>
        <div class="callout rd">
          <p class="p">${zh?"<strong>S 曲線理論告訴我們</strong>：傳統搜尋在「幫使用者找到網頁」這個維度上接近天花板。LLM 重新定義了績效指標——不是「哪個網頁最相關」，而是「直接給我最好的答案」。":"<strong>S-curve theory tells us</strong>: Traditional search is near its ceiling on 'helping users find web pages.' LLMs redefine the metric—not 'which page is most relevant' but 'give me the best answer directly.'"}</p>
        </div>
        <div class="timeline" style="margin-top:14px;">
          <div class="tlItem">
            <div class="tlLabel">${zh?"Phase 1 – 萌芽（2017–2022）":"Phase 1 – Emergence (2017–2022)"}</div>
            <div class="tlText">${zh?"GPT-3, BERT 等 Transformer 模型出現。傳統搜尋引擎仍主導。LLM 工具以實驗性介面出現。":"GPT-3, BERT, Transformer models emerge. Search still dominates. LLM tools appear as experimental interfaces."}</div>
          </div>
          <div class="tlItem">
            <div class="tlLabel">${zh?"Phase 2 – 快速擴散（2022–now）":"Phase 2 – Rapid Diffusion (2022–now)"}</div>
            <div class="tlText">${zh?"ChatGPT 引爆大眾採用。AI 搜尋（Perplexity、Copilot）快速成長。Google 被迫推出 AI Overviews。":"ChatGPT triggers mass adoption. AI search (Perplexity, Copilot) grows rapidly. Google forced to launch AI Overviews."}</div>
          </div>
          <div class="tlItem new">
            <div class="tlLabel new">${zh?"Phase 3 – 未來？（2025–）":"Phase 3 – Future? (2025–)"}</div>
            <div class="tlText">${zh?"傳統搜尋廣告模式是否被顛覆？LLM 的幻覺問題（Hallucination）是否是制約其 S 曲線的關鍵瓶頸？":"Will traditional search ad models be disrupted? Will hallucination be the key bottleneck limiting LLMs' S-curve?"}</div>
          </div>
        </div>
        ${pollCard({
          key:"llm_poll",
          title: zh?"5 年後，你最主要的資訊搜尋方式將是？":"In 5 years, your primary way to find information will be?",
          options:[
            ["a", zh?"Google/Bing 等傳統搜尋":"Traditional search (Google/Bing)"],
            ["b", zh?"ChatGPT/Gemini 等 LLM 工具":"LLM tools (ChatGPT/Gemini)"],
            ["c", zh?"AI 搜尋（Perplexity 等，結合兩者）":"AI search (Perplexity, combining both)"],
            ["d", zh?"完全不同的新介面（語音、AR等）":"Something entirely different (voice, AR)"]
          ],
          followup: zh?
            ["Google 是持續性創新者還是面對破壞性技術的既有廠商？","廣告商業模式是 Google 的護城河，還是 Achilles' heel？","台灣的資訊服務業者應如何因應？"] :
            ["Is Google a sustaining innovator or an incumbent facing disruption?","Is the ad business model Google's moat or its Achilles' heel?","How should Taiwan's information services companies respond?"],
          accent:"rd"
        })}
      </div>
    </div>
  `;
}

// ===== MARKETING =====
function viewMktIntro(lang){
  const zh = lang==="zh";
  const product = getSlider("mm_product", 7);
  const price = getSlider("mm_price", 5);
  const place = getSlider("mm_place", 6);
  const promo = getSlider("mm_promo", 4);
  return `
    <div class="sectionHead">
      <div>
        <h1 class="h1" style="color:var(--mkt-color)">${zh?"行銷管理：Marketing Mix（4P）":"Marketing Management: The Marketing Mix (4P)"}</h1>
        <p class="sub">${zh?"行銷不是廣告，而是用一致的組合讓目標客群感受到無可取代的價值。（30 分鐘）":"Marketing is not advertising—it's about creating an irresistible value offer for your target segment through a coherent mix. (30 min)"}</p>
      </div>
      <div class="tag mkt">📣 ${zh?"行銷":"Marketing"}</div>
    </div>
    <div class="grid2">
      <div class="card">
        <h3 class="cardTitle" style="color:var(--mkt-color)">${zh?"什麼是行銷管理？":"What is Marketing Management?"}</h3>
        <div class="callout mkt">
          <p class="p">${zh?"行銷的核心是<strong>細分市場→選擇目標→定位（STP）</strong>，然後透過<strong>4P 行銷組合</strong>（Product、Price、Place、Promotion）把價值主張具體傳遞給目標客群。":"The core of marketing is <strong>Segment → Target → Position (STP)</strong>, then use the <strong>4P marketing mix</strong> (Product, Price, Place, Promotion) to deliver your value proposition to your target customers."}</p>
        </div>
        <div class="mmixGrid">
          <div class="mmixCard product">
            <h4>🧩 Product</h4>
            <p>${zh?"品質、設計、功能、品牌、售後服務。讓顧客願意支付的核心價值。":"Quality, design, features, brand, after-sales. Core value customers pay for."}</p>
          </div>
          <div class="mmixCard price">
            <h4>💲 Price</h4>
            <p>${zh?"定價策略：滲透價格、掠奪性、動態定價。影響收益與品牌感知。":"Pricing: penetration, skimming, dynamic. Impacts revenue and brand perception."}</p>
          </div>
          <div class="mmixCard place">
            <h4>📦 Place</h4>
            <p>${zh?"通路：直銷、零售商、電商、平台。讓產品在對的地方出現。":"Distribution: direct, retailers, e-commerce, platforms. Getting product to the right place."}</p>
          </div>
          <div class="mmixCard promotion">
            <h4>📢 Promotion</h4>
            <p>${zh?"廣告、PR、社群、促銷、口碑。創造認知與購買意願。":"Advertising, PR, social media, sales promotion. Creating awareness and purchase intent."}</p>
          </div>
        </div>
      </div>
      <div class="card">
        <h3 class="cardTitle" style="color:var(--mkt-color)">${zh?"互動：為你的產品調整 4P":"Interactive: Tune the 4P for your product"}</h3>
        <p class="p" style="font-size:13px;">${zh?"假設你是一家台灣手搖茶飲品牌的行銷長，調整各P的資源投入：":"Imagine you're CMO of a Taiwanese bubble tea brand. Adjust resource allocation across the 4Ps:"}</p>
        <div style="margin-top:10px;">
          ${[
            ["mm_product","🧩 Product (品質/設計)","Product quality/design", product],
            ["mm_price","💲 Price (定價策略)","Pricing strategy", price],
            ["mm_place","📦 Place (通路拓展)","Distribution expansion", place],
            ["mm_promo","📢 Promotion (行銷推廣)","Marketing promotion", promo]
          ].map(([key, labelZh, labelEn, val])=>`
            <div class="sliderRow" style="margin-bottom:6px;">
              <span style="font-size:12px; font-weight:700; width:160px; flex-shrink:0;">${zh?labelZh:labelEn}</span>
              <input type="range" min="1" max="10" value="${val}" oninput="handleMMSlider('${key}',this.value)" style="flex:1;"/>
              <div class="value" style="min-width:36px; text-align:center;">${val}/10</div>
            </div>
          `).join("")}
          <div style="margin-top:12px; padding:12px; border-radius:10px; background:rgba(122,58,0,.06); border:1px solid rgba(122,58,0,.2);">
            <p class="p" style="font-size:13px; color:var(--mkt-color);"><strong>${zh?"你的組合側重：":"Your mix emphasizes:"}</strong><br>
            ${product>7 ? (zh?"高端產品策略（差異化）":"Premium product strategy (differentiation)") :
              price<4 ? (zh?"低價滲透策略":"Low-price penetration strategy") :
              place>7 ? (zh?"廣泛鋪貨（普及化）":"Wide distribution (mass market)") :
              promo>7 ? (zh?"行銷驅動成長":"Marketing-driven growth") :
              (zh?"均衡組合":"Balanced mix")}
            </p>
            <p class="small" style="margin-top:6px;">${zh?"思考：各P之間的一致性最重要。高端品牌在折扣通路出現，會發生什麼？":"Think: coherence across Ps matters most. What happens when a premium brand appears in discount channels?"}</p>
          </div>
        </div>
        ${pollCard({
          key:"mkt_stp_poll",
          title: zh?"台灣新創（手搖飲/餐飲）最容易犯的行銷錯誤是？":"What is the most common marketing mistake by Taiwan's food/beverage startups?",
          options:[
            ["a", zh?"沒有清楚的目標客群（STP做不好）":"No clear target segment (weak STP)"],
            ["b", zh?"4P 不一致（例：高端產品配低價策略）":"Incoherent 4P (e.g. premium product, low-price strategy)"],
            ["c", zh?"只注重促銷，忽略產品本身":"Over-focus on promotion, neglect product quality"],
            ["d", zh?"通路選擇錯誤（不在目標客群出沒的地方）":"Wrong distribution channel"]
          ],
          followup: zh?["你選的錯誤，如何用 STP-4P 框架來診斷和修正？","舉一個成功的台灣品牌，說明它的 4P 如何做到高度一致性？"]:
            ["How would you diagnose and fix your chosen mistake using the STP-4P framework?","Name a successful Taiwan brand and explain how its 4P achieves coherence."],
          accent:"mkt"
        })}
      </div>
    </div>
  `;
}

function handleMMSlider(key, val){
  setSlider(key, Number(val));
  renderView();
}

function viewConsumerProducts(lang){
  const zh = lang==="zh";
  const selected = getSlider("cp_sel", -1);
  const products = [
    {
      type: zh?"便利品 Convenience":"Convenience goods",
      desc: zh?"日常必需、低涉入、隨手可買":"Daily necessities, low involvement, impulse purchase",
      examples: zh?"飲料、口香糖、牙膏":"Beverages, gum, toothpaste",
      product: zh?"標準化、可靠、包裝醒目":"Standardized, reliable, distinctive packaging",
      price: zh?"低價位、競爭定價":"Low price, competitive pricing",
      place: zh?"廣泛鋪點（7-11、全家）":"Wide distribution (7-Eleven, FamilyMart)",
      promotion: zh?"大眾媒體廣告、品牌知名度":"Mass media advertising, brand awareness",
      icon: "🛒"
    },
    {
      type: zh?"選購品 Shopping":"Shopping goods",
      desc: zh?"比較後決策、中高涉入":"Comparison before purchase, moderate-high involvement",
      examples: zh?"家電、服飾、家具":"Appliances, clothing, furniture",
      product: zh?"品質差異、設計、功能特色":"Quality differences, design, features",
      price: zh?"中高價位、比較定價":"Mid-high price, comparison-based pricing",
      place: zh?"選擇性通路、百貨/購物中心":"Selective distribution, department stores",
      promotion: zh?"廣告+人員銷售結合":"Advertising + personal selling",
      icon: "🏪"
    },
    {
      type: zh?"特殊品 Specialty":"Specialty goods",
      desc: zh?"品牌忠誠、高涉入、不比較":"Brand loyalty, high involvement, no substitutes",
      examples: zh?"Rolex、Porsche、名牌包":"Rolex, Porsche, designer handbags",
      product: zh?"獨特性、卓越品質、品牌意義":"Uniqueness, superior quality, brand meaning",
      price: zh?"高價溢酬（Premium pricing）":"Premium pricing, high price signals quality",
      place: zh?"獨家/限定通路":"Exclusive distribution channels",
      promotion: zh?"形象廣告、口碑、品牌故事":"Image advertising, word-of-mouth, brand storytelling",
      icon: "💎"
    },
    {
      type: zh?"冷門品 Unsought":"Unsought goods",
      desc: zh?"消費者不主動尋求（保險、墓地）":"Consumers don't actively seek (insurance, funeral services)",
      examples: zh?"壽險、消防設備、急救課程":"Life insurance, fire equipment, first aid courses",
      product: zh?"聚焦實用功能、解決方案":"Focus on utility, problem-solving",
      price: zh?"多種定價方案（分期、配套）":"Multiple pricing options (installments, bundles)",
      place: zh?"直銷、人員上門":"Direct sales, door-to-door",
      promotion: zh?"積極人員銷售、教育行銷":"Aggressive personal selling, educational marketing",
      icon: "📋"
    }
  ];
  const sel = selected >= 0 ? products[selected] : null;
  return `
    <div class="sectionHead">
      <div>
        <h1 class="h1" style="color:var(--mkt-color)">${zh?"消費品分類與行銷組合考量":"Consumer Products & Marketing Mix Considerations"}</h1>
        <p class="sub">${zh?"「它是關於產品屬性與消費者偏好的配適」—— 不同產品類型，需要完全不同的行銷組合！":"'It's about the fit between product attributes and consumer preferences.' Different product types need very different marketing mixes!"}</p>
      </div>
      <div class="tag mkt">📣 Consumer Products</div>
    </div>
    <div class="card" style="margin-bottom:14px;">
      <h3 class="cardTitle" style="color:var(--mkt-color)">${zh?"點選產品類型，查看對應行銷組合建議：":"Click a product type to see its marketing mix implications:"}</h3>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px;">
        ${products.map((p,i)=>`
          <button onclick="handleCPSel(${i})" style="padding:10px 16px; border-radius:12px; font-weight:800; font-size:14px; cursor:pointer; border:2px solid ${selected===i?'var(--mkt-color)':'var(--line)'}; background:${selected===i?'rgba(122,58,0,.10)':'white'}; color:${selected===i?'var(--mkt-color)':'var(--ink)'}; transition:all .2s;">
            ${p.icon} ${p.type.split(" ")[0]}
          </button>
        `).join("")}
      </div>
      ${sel ? `
        <div style="border:2px solid rgba(122,58,0,.3); border-radius:14px; padding:16px; background:rgba(122,58,0,.04);">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
            <span style="font-size:28px;">${sel.icon}</span>
            <div>
              <div style="font-weight:900; font-size:18px; color:var(--mkt-color);">${sel.type}</div>
              <div style="font-size:13px; color:var(--muted);">${sel.desc}</div>
            </div>
          </div>
          <div class="kpiRow" style="margin-bottom:12px;">
            <div class="pill"><span class="dot mkt"></span>${zh?"例：":"e.g."} ${sel.examples}</div>
          </div>
          <div class="grid2" style="gap:10px;">
            <div style="padding:10px; border-radius:10px; background:rgba(26,107,74,.06); border:1px solid rgba(26,107,74,.2);">
              <div style="font-size:11px; font-weight:800; color:var(--ops-color); margin-bottom:4px;">🧩 Product</div>
              <div style="font-size:13px;">${sel.product}</div>
            </div>
            <div style="padding:10px; border-radius:10px; background:rgba(26,74,139,.06); border:1px solid rgba(26,74,139,.2);">
              <div style="font-size:11px; font-weight:800; color:var(--rd-color); margin-bottom:4px;">💲 Price</div>
              <div style="font-size:13px;">${sel.price}</div>
            </div>
            <div style="padding:10px; border-radius:10px; background:rgba(122,58,0,.06); border:1px solid rgba(122,58,0,.2);">
              <div style="font-size:11px; font-weight:800; color:var(--mkt-color); margin-bottom:4px;">📦 Place</div>
              <div style="font-size:13px;">${sel.place}</div>
            </div>
            <div style="padding:10px; border-radius:10px; background:rgba(74,0,107,.06); border:1px solid rgba(74,0,107,.2);">
              <div style="font-size:11px; font-weight:800; color:var(--fin-color); margin-bottom:4px;">📢 Promotion</div>
              <div style="font-size:13px;">${sel.promotion}</div>
            </div>
          </div>
        </div>
      ` : `
        <div style="text-align:center; padding:30px; color:var(--muted); border:2px dashed var(--line); border-radius:14px;">
          ${zh?"👆 點選上方的產品類型，查看其行銷組合建議":"👆 Click a product type above to see its marketing mix recommendation"}
        </div>
      `}
    </div>
    <div class="grid2">
      <div class="card">
        <h3 class="cardTitle" style="color:var(--mkt-color);">${zh?"完整比較表":"Full Comparison Table"}</h3>
        <table class="ptTable">
          <thead>
            <tr>
              <th>${zh?"類型":"Type"}</th>
              <th>${zh?"涉入程度":"Involvement"}</th>
              <th>${zh?"通路":"Distribution"}</th>
              <th>${zh?"促銷重點":"Promo focus"}</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p=>`
              <tr>
                <td><span class="ptType">${p.icon} ${p.type}</span></td>
                <td>${p.type.includes("Convenience")||p.type.includes("便利") ? (zh?"低":"Low") :
                     p.type.includes("Shopping")||p.type.includes("選購") ? (zh?"中":"Medium") :
                     p.type.includes("Specialty")||p.type.includes("特殊") ? (zh?"高":"High") : (zh?"推銷":"Push")}</td>
                <td style="font-size:12px;">${p.place.split("（")[0].split("(")[0]}</td>
                <td style="font-size:12px;">${p.promotion.split("、")[0].split(",")[0]}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      ${pollCard({
        key:"cp_poll",
        title: zh?"台灣珍珠奶茶（手搖飲）在消費品分類中屬於？":"Taiwan bubble tea (hand-shaken drinks) falls into which consumer product category?",
        options:[
          ["a", zh?"便利品（隨買隨走）":"Convenience goods (impulse, low-involvement)"],
          ["b", zh?"選購品（會比較品牌）":"Shopping goods (comparison-based)"],
          ["c", zh?"特殊品（有品牌忠誠度的高端）":"Specialty goods (brand loyal, premium)"],
          ["d", zh?"視情況而定（視消費者和情境不同）":"Depends on consumer and context"]
        ],
        followup: zh?["如果手搖飲從「便利品」升級為「特殊品」，4P 要如何改變？","HEYTEA（喜茶）的行銷定位在哪個類別？"]:
          ["If bubble tea 'upgrades' from convenience to specialty, how must the 4P change?","Which category does HEYTEA's marketing positioning target?"],
        accent:"mkt"
      })}
    </div>
  `;
}

function handleCPSel(idx){
  setSlider("cp_sel", idx);
  renderView();
}

function viewPizzaGame(lang){
  const zh = lang==="zh";
  return `
    <div class="sectionHead">
      <div>
        <h1 class="h1" style="color:var(--mkt-color)">${zh?"Pizza Store 行銷競賽":"Pizza Store Marketing Competition"}</h1>
        <p class="sub">${zh?"在競爭市場中，如何透過 4P 決策最大化市占率與利潤？（~15 分鐘）":"In a competitive market, how do you maximize market share and profit through 4P decisions? (~15 min)"}</p>
      </div>
      <div class="tag mkt">📣 ${zh?"競賽":"Competition"}</div>
    </div>
    <div class="card" style="margin-bottom:14px;">
      <div class="grid2">
        <div>
          <h3 class="cardTitle" style="color:var(--mkt-color);">${zh?"競賽說明":"Competition Instructions"}</h3>
          <div class="callout mkt">
            <p class="p">${zh?"你將與其他組別競爭，在 Pizza 市場中做出定價、品質、促銷和通路決策，爭取最高市占率和利潤。你的每一個決策都會影響對手的策略！":"You compete against other teams, making pricing, quality, promotion, and distribution decisions in the pizza market. Every decision you make affects rivals' strategies!"}</p>
          </div>
          <h4 class="cardTitle" style="font-size:14px; margin-top:14px;">${zh?"競賽後討論問題":"Post-competition discussion"}</h4>
          <ul class="ul" style="font-size:13px;">
            <li>${zh?"你的 4P 組合是否與目標客群一致？":"Was your 4P mix consistent with your target segment?"}</li>
            <li>${zh?"競爭對手的哪個動作最讓你措手不及？":"Which competitor move surprised you most?"}</li>
            <li>${zh?"如果再來一次，你會先攻哪個 P？":"If you could redo it, which P would you change first?"}</li>
            <li>${zh?"定價競爭（Price war）的最終結果是什麼？":"What was the end result of price competition?"}</li>
          </ul>
        </div>
        <div>
          ${pollCard({
            key:"pizza_poll",
            title: zh?"在Pizza競賽中，你最主要的競爭策略是？":"In the Pizza competition, your primary strategy was?",
            options:[
              ["a", zh?"低價滲透（搶市占率）":"Low-price penetration (grab market share)"],
              ["b", zh?"高品質差異化（Premium positioning）":"High quality differentiation (premium)"],
              ["c", zh?"廣泛鋪點（通路取勝）":"Wide distribution (channel dominance)"],
              ["d", zh?"行銷投入（廣告與促銷）":"Heavy promotion (advertising & deals)"]
            ],
            followup: zh?["你的策略和 4P 各元素是否一致？（例：高端定位但低價促銷？）","同學之間的策略組合，是否出現了賽局理論中的 Nash Equilibrium？"]:
              ["Was your strategy coherent with all 4P elements? (e.g. premium positioning but low-price promotion?)","Did a Nash Equilibrium emerge among teams' strategies?"],
            accent:"mkt"
          })}
          <div class="card" style="margin-top:14px;">
            <h4 class="cardTitle" style="color:var(--mkt-color); font-size:14px;">${zh?"進入 Google Sheets 競賽":"Enter the Google Sheets Competition"}</h4>
            <p class="p" style="font-size:13px;">${zh?"點下方按鈕，在 Google Sheets 中做出你的行銷決策：":"Click below to make your marketing decisions in Google Sheets:"}</p>
            <a href="https://docs.google.com/spreadsheets/d/16vxijHmbmEWbOhLs4AvXZ1sjnoc-IxjGu6nt702JTE4/edit?gid=657910887#gid=657910887" target="_blank" class="btn" style="display:inline-block; margin-top:8px; background:var(--mkt-color); color:white; border-color:var(--mkt-color);">
              🍕 ${zh?"開啟 Pizza Store Spreadsheet ↗":"Open Pizza Store Spreadsheet ↗"}
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="embedWrap">
      <div class="embedHeader">
        <div class="embedTitle">🍕 Pizza Store Competition — Google Sheets</div>
        <a href="https://docs.google.com/spreadsheets/d/16vxijHmbmEWbOhLs4AvXZ1sjnoc-IxjGu6nt702JTE4/edit?gid=657910887#gid=657910887" target="_blank" class="btn" style="font-size:12px;">${zh?"在新分頁開啟":"Open in new tab"} ↗</a>
      </div>
      <iframe src="https://docs.google.com/spreadsheets/d/16vxijHmbmEWbOhLs4AvXZ1sjnoc-IxjGu6nt702JTE4/edit?gid=657910887#gid=657910887" height="600" loading="lazy" title="Pizza Store Competition" allowfullscreen></iframe>
    </div>
  `;
}

// ===== FINANCIAL MANAGEMENT =====
function viewAcctFinance(lang){
  const zh = lang==="zh";
  return `
    <div class="sectionHead">
      <div>
        <h1 class="h1" style="color:var(--fin-color)">${zh?"會計與財務的連結":"Connection Between Accounting and Finance"}</h1>
        <p class="sub">${zh?"會計記錄過去；財務規劃未來。兩者如何透過資產負債表、損益表連結？（25 分鐘）":"Accounting records the past; finance plans the future. How are they connected through the balance sheet and income statement? (25 min)"}</p>
      </div>
      <div class="tag fin">💰 ${zh?"財務":"Finance"}</div>
    </div>
    <div class="grid2">
      <div class="card">
        <h3 class="cardTitle" style="color:var(--fin-color)">${zh?"會計 vs. 財務：有什麼不同？":"Accounting vs. Finance: What's the difference?"}</h3>
        <div class="grid2" style="gap:10px; margin-bottom:12px;">
          <div class="card" style="background:rgba(96,100,108,.05); border-color:#ddd;">
            <h4 style="margin:0 0 6px; font-size:14px; font-weight:900; color:#60646C;">📊 ${zh?"會計 Accounting":"📊 Accounting"}</h4>
            <ul class="ul" style="font-size:12px; margin-top:0;">
              <li>${zh?"記錄歷史交易":"Records historical transactions"}</li>
              <li>${zh?"遵循 GAAP/IFRS 準則":"Follows GAAP/IFRS standards"}</li>
              <li>${zh?"產出：財報（B/S, I/S, C/F）":"Outputs: Financial statements"}</li>
              <li>${zh?"面向：股東、主管機關、稅務":"Audience: shareholders, regulators, tax"}</li>
            </ul>
          </div>
          <div class="card" style="background:rgba(74,0,107,.05); border-color:rgba(74,0,107,.3);">
            <h4 style="margin:0 0 6px; font-size:14px; font-weight:900; color:var(--fin-color);">💰 ${zh?"財務 Finance":"💰 Finance"}</h4>
            <ul class="ul" style="font-size:12px; margin-top:0;">
              <li>${zh?"決策未來資金分配":"Decides future capital allocation"}</li>
              <li>${zh?"評估投資報酬率、風險":"Evaluates ROI and risk"}</li>
              <li>${zh?"工具：NPV, IRR, WACC":"Tools: NPV, IRR, WACC"}</li>
              <li>${zh?"面向：投資人、銀行、管理層":"Audience: investors, banks, management"}</li>
            </ul>
          </div>
        </div>
        <div class="callout fin">
          <p class="p">${zh?"<strong>連結</strong>：財務決策的起點是會計數據（過去的財報），但財務要用這些數據預測未來的現金流，決定投資是否值得、資金從哪裡來。":"<strong>The link</strong>: Finance decisions start with accounting data (past financial statements), but finance uses them to project future cash flows, decide if investments are worthwhile, and determine where capital comes from."}</p>
        </div>
        <hr class="sep"/>
        <h4 class="cardTitle" style="font-size:14px;">${zh?"資產負債表模型（Balance Sheet Model）":"Balance Sheet Model of the Firm"}</h4>
        <div class="balanceSheet">
          <div class="bsCol">
            <div class="bsColTitle">${zh?"資產 Assets":"Assets"}</div>
            <div class="bsItem ca">${zh?"流動資產 Current Assets":"Current Assets"}</div>
            <div class="bsItem ca" style="margin-left:12px; font-size:12px;">${zh?"現金、應收款、存貨":"Cash, Receivables, Inventory"}</div>
            <div class="bsItem fa" style="margin-top:6px;">${zh?"固定資產 Fixed Assets":"Fixed Assets"}</div>
            <div class="bsItem fa" style="margin-left:12px; font-size:12px;">${zh?"廠房、設備、無形資產":"PP&E, Intangibles"}</div>
          </div>
          <div class="bsCol">
            <div class="bsColTitle">${zh?"負債 + 股東權益":"Liabilities + Equity"}</div>
            <div class="bsItem cl">${zh?"流動負債 Current Liabilities":"Current Liabilities"}</div>
            <div class="bsItem cl" style="margin-left:12px; font-size:12px;">${zh?"應付款、短期借款":"Payables, Short-term debt"}</div>
            <div class="bsItem ltd" style="margin-top:6px;">${zh?"長期負債 Long-term Debt":"Long-term Debt"}</div>
            <div class="bsItem eq" style="margin-top:6px;">${zh?"股東權益 Shareholders' Equity":"Shareholders' Equity"}</div>
          </div>
        </div>
        <p class="small" style="text-align:center; margin-top:6px;">${zh?"資產 = 負債 + 股東權益（會計恆等式）":"Assets = Liabilities + Shareholders' Equity (Accounting Identity)"}</p>
      </div>
      <div class="card">
        <h3 class="cardTitle" style="color:var(--fin-color)">${zh?"現金流模型 vs. 損益表":"Cash Flow Model vs. Income Statement"}</h3>
        <div class="callout fin">
          <p class="p">${zh?"<strong>關鍵區別</strong>：損益表記錄應計利潤（Accrual profit），現金流量表記錄實際現金移動。企業可以有利潤但沒有現金（→ 流動性危機），也可以有現金流但虧損（→ 早期新創）。":"<strong>Key distinction</strong>: Income statement records accrual profit; cash flow statement records actual cash movement. A firm can be profitable but cash-poor (→ liquidity crisis), or cash-rich but loss-making (→ early startups)."}</p>
        </div>
        <div class="highlight" style="margin:12px 0;">
          <div class="highlightTitle">${zh?"SVB（矽谷銀行）危機 2023":"Silicon Valley Bank Crisis 2023"}</div>
          <p class="p" style="font-size:13px;">${zh?"SVB 持有大量長期美國公債，帳面上「有利潤」。但利率上升 → 公債市值下跌 → 客戶擠兌 → 流動性崩潰。教訓：資產負債表的<em>存續期錯配（Duration mismatch）</em>是致命的。":"SVB held large long-term US Treasuries, 'profitable' on paper. But rising rates → bond values dropped → bank run → liquidity collapse. Lesson: <em>duration mismatch</em> on the balance sheet is fatal."}</p>
        </div>
        <div class="card" style="background:rgba(74,0,107,.04); border-color:rgba(74,0,107,.2); margin-top:10px;">
          <h4 class="cardTitle" style="color:var(--fin-color); font-size:14px;">${zh?"現金流三大類別":"Three Types of Cash Flows"}</h4>
          <div style="display:grid; gap:8px;">
            ${[
              ["營業活動","Operating Activities", "日常業務產生的現金", "Cash from day-to-day operations", "80%"],
              ["投資活動","Investing Activities", "資本支出、收購", "Capital expenditure, acquisitions", "–"],
              ["融資活動","Financing Activities", "發行股票、借款、配息", "Stock issuance, borrowing, dividends", "–"]
            ].map(([zhLabel, enLabel, zhDesc, enDesc])=>`
              <div style="padding:8px 10px; border-radius:8px; background:rgba(74,0,107,.06); border:1px solid rgba(74,0,107,.15); display:flex; gap:10px; align-items:flex-start;">
                <div style="font-weight:900; font-size:13px; color:var(--fin-color); min-width:110px;">${zh?zhLabel:enLabel}</div>
                <div style="font-size:12px; color:var(--muted);">${zh?zhDesc:enDesc}</div>
              </div>
            `).join("")}
          </div>
        </div>
        ${pollCard({
          key:"fin_acct_poll",
          title: zh?"一家公司若「有獲利但沒現金」，最可能是什麼問題？":"A company is 'profitable but cash-poor.' What is most likely happening?",
          options:[
            ["a", zh?"應收帳款過多（客戶太慢付款）":"Too many receivables (customers paying slowly)"],
            ["b", zh?"存貨積壓（賣不掉）":"Inventory buildup (poor sales)"],
            ["c", zh?"資本支出過大（大量投資設備）":"Heavy capex (investing in equipment)"],
            ["d", zh?"以上皆有可能":"Any of the above"]
          ],
          followup: zh?["你選的問題，應該從現金流量表的哪個部分找到線索？","如果你是銀行授信人員，你最重視哪個財報？"]:
            ["For your chosen issue, which section of the cash flow statement would reveal the clue?","If you were a bank credit officer, which financial statement would you focus on most?"],
          accent:"fin"
        })}
      </div>
    </div>
  `;
}

function viewCorpFinance(lang){
  const zh = lang==="zh";
  const investSlider = getSlider("cf_invest", 50);
  const finSlider = getSlider("cf_fin", 50);
  return `
    <div class="sectionHead">
      <div>
        <h1 class="h1" style="color:var(--fin-color)">${zh?"公司財務的核心要素（Elements of Corporate Finance）":"Elements of Corporate Finance"}</h1>
        <p class="sub">${zh?"企業的三大財務決策：投資什麼？錢從哪裡來？如何分配利潤？":"A firm's three core financial decisions: What to invest in? Where to get capital? How to distribute profits?"}</p>
      </div>
      <div class="tag fin">💰 Corp Finance</div>
    </div>
    <div class="grid2">
      <div class="card">
        <h3 class="cardTitle" style="color:var(--fin-color)">${zh?"三大決策框架":"Three Core Decisions"}</h3>
        <div style="display:grid; gap:10px; margin-bottom:12px;">
          ${[
            {
              icon: "📈",
              title: zh?"投資決策 (Investment / Capital Budgeting)":"Investment Decision (Capital Budgeting)",
              desc: zh?"要把錢投資在哪些資產？（廠房、設備、R&D、收購）<br>工具：NPV、IRR、Payback Period":"Which assets should the firm invest in? (Plant, equipment, R&D, acquisitions)<br>Tools: NPV, IRR, Payback Period",
              bg: "rgba(74,0,107,.06)", border: "rgba(74,0,107,.25)"
            },
            {
              icon: "🏦",
              title: zh?"融資決策 (Financing Decision)":"Financing Decision",
              desc: zh?"資金從哪裡來？股票（股權）還是借款（負債）？<br>工具：WACC, D/E ratio, 資本結構":"Where does the capital come from? Equity or debt?<br>Tools: WACC, D/E ratio, capital structure",
              bg: "rgba(26,74,139,.06)", border: "rgba(26,74,139,.25)"
            },
            {
              icon: "💸",
              title: zh?"股利決策 (Dividend Decision)":"Dividend Decision",
              desc: zh?"賺到的錢要發股利還是保留再投資？<br>考量：股東回報 vs. 成長資本需要":"Should profits be returned to shareholders or retained for growth?<br>Trade-off: shareholder returns vs. growth capital",
              bg: "rgba(26,107,74,.06)", border: "rgba(26,107,74,.25)"
            }
          ].map(d=>`
            <div style="padding:12px; border-radius:12px; background:${d.bg}; border:1.5px solid ${d.border};">
              <div style="display:flex; gap:10px; align-items:flex-start;">
                <span style="font-size:22px;">${d.icon}</span>
                <div>
                  <div style="font-weight:900; font-size:14px; color:var(--fin-color); margin-bottom:4px;">${d.title}</div>
                  <div style="font-size:13px; color:var(--muted); line-height:1.5;">${d.desc}</div>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
        <div class="callout fin">
          <p class="p">${zh?"<strong>財務的終極目標</strong>（股東觀點）：最大化公司市場價值（Market Value）。這意味著投資只有在 ROI > 資本成本（WACC）時才值得做；否則應還給股東。":"<strong>Finance's ultimate goal</strong> (shareholder view): Maximize firm market value. This means investments are only worthwhile when ROI > cost of capital (WACC); otherwise, return capital to shareholders."}</p>
        </div>
      </div>
      <div class="card">
        <h3 class="cardTitle" style="color:var(--fin-color)">${zh?"互動：投資 vs. 融資組合":"Interactive: Investment vs. Financing Mix"}</h3>
        <p class="p" style="font-size:13px;">${zh?"假設你是台積電 CFO，調整投資強度（R&D + CapEx）和股權/負債比例：":"Assume you're TSMC's CFO. Adjust investment intensity (R&D + CapEx) and equity/debt mix:"}</p>
        <div style="margin:14px 0;">
          <div class="sliderRow">
            <span style="font-size:13px; font-weight:700; width:160px; flex-shrink:0;">📈 ${zh?"投資強度":"Investment Intensity"}</span>
            <input type="range" min="0" max="100" value="${investSlider}" oninput="handleCFSlider('cf_invest',this.value)" style="flex:1;"/>
            <div class="value">${investSlider < 30 ? (zh?"保守":"Conservative") : investSlider < 70 ? (zh?"均衡":"Balanced") : (zh?"積極":"Aggressive")}</div>
          </div>
          <div class="sliderRow" style="margin-top:6px;">
            <span style="font-size:13px; font-weight:700; width:160px; flex-shrink:0;">🏦 ${zh?"負債比 D/(D+E)":"Leverage D/(D+E)"}</span>
            <input type="range" min="0" max="100" value="${finSlider}" oninput="handleCFSlider('cf_fin',this.value)" style="flex:1;"/>
            <div class="value">${finSlider}%</div>
          </div>
        </div>
        <div style="padding:12px; border-radius:12px; background:rgba(74,0,107,.06); border:1.5px solid rgba(74,0,107,.2); margin-top:4px;">
          <div style="font-size:14px; font-weight:900; color:var(--fin-color); margin-bottom:8px;">${zh?"你的財務策略分析：":"Your Financial Strategy Analysis:"}</div>
          <p class="p" style="font-size:13px;">
            ${investSlider > 70 && finSlider < 30 ? (zh?"<strong>高投資 + 低負債</strong>：成長型策略（科技公司如台積電、台達電），依靠內部現金流和股權融資支撐大量資本支出。風險：若投資回報不佳，股東壓力大。":"<strong>High investment + low leverage</strong>: Growth strategy (tech firms like TSMC, Delta Electronics). Relying on internal cash flow and equity for heavy capex. Risk: shareholder pressure if ROI disappoints.") :
             investSlider > 70 && finSlider > 70 ? (zh?"<strong>高投資 + 高負債</strong>：激進的槓桿成長。風險極高——若市場下行，財務危機風險大。類似 2008 前的私募股權操作。":"<strong>High investment + high leverage</strong>: Aggressive leveraged growth. Very high risk—financial distress if market turns. Similar to pre-2008 private equity.") :
             investSlider < 30 && finSlider < 30 ? (zh?"<strong>低投資 + 低負債</strong>：防禦保守型。適合成熟、現金充沛的企業。可能錯失成長機會，但安全穩定。":"<strong>Low investment + low leverage</strong>: Defensive, conservative. Suitable for mature, cash-rich firms. May miss growth but stable.") :
             investSlider < 30 && finSlider > 70 ? (zh?"<strong>低投資 + 高負債</strong>：危險組合！負債高但缺乏投資，恐難以未來還款。":"<strong>Low investment + high leverage</strong>: Dangerous combination! High debt without investment growth makes repayment difficult.") :
             (zh?"<strong>均衡策略</strong>：在成長投資和財務穩健間取得平衡——多數成熟企業的選擇。":"<strong>Balanced strategy</strong>: Balancing growth investment with financial health—the choice of most mature firms.")}
          </p>
        </div>
        <hr class="sep"/>
        ${pollCard({
          key:"corpfin_poll",
          title: zh?"台積電大規模赴美、日建廠，主要財務風險是？":"TSMC's massive overseas expansion (US, Japan) poses what primary financial risk?",
          options:[
            ["a", zh?"資本支出巨大、WACC 上升":"Massive capex, rising WACC"],
            ["b", zh?"匯率風險（台幣貶值收益 vs 美元支出）":"Currency risk (TWD revenue vs USD expenditure)"],
            ["c", zh?"折舊攤提壓低近期獲利":"Depreciation drags near-term profits"],
            ["d", zh?"政治風險超過財務模型可量化的範圍":"Political risk beyond what financial models can quantify"]
          ],
          followup: zh?["台積電如何用財務工具（避險、資本結構）來管理這些風險？","如果你是台積電的機構投資人，你最關注哪個財務指標？"]:
            ["How can TSMC use financial tools (hedging, capital structure) to manage these risks?","As a TSMC institutional investor, what financial metric would you focus on most?"],
          accent:"fin"
        })}
      </div>
    </div>
  `;
}

function handleCFSlider(key, val){
  setSlider(key, Number(val));
  renderView();
}

// ===== WRAP-UP =====
function viewWrap(lang){
  const zh = lang==="zh";
  return `
    <div class="sectionHead">
      <div>
        <h1 class="h1">${zh?"收斂：一張圖串起四大企業功能":"Wrap-up: One Integrative Map"}</h1>
        <p class="sub">${zh?"如何把今天的四個單元串起來，回到最初的「從市場到企業」大框架？":"How do today's four modules tie back to the 'From Markets to Firms' framework?"}</p>
      </div>
      <div class="tag">🔁 ${zh?"收斂":"Wrap-up"}</div>
    </div>
    <div class="card" style="margin-bottom:14px;">
      <h3 class="cardTitle">${zh?"整合框架：四大功能如何協同運作？":"Integrative Framework: How the Four Functions Work Together"}</h3>
      <div class="grid2">
        <div>
          <div class="callout" style="border-color:var(--ops-color); background:rgba(26,107,74,.05);">
            <p class="p" style="font-size:13px;"><strong style="color:var(--ops-color);">⚙️ ${zh?"營運 → 要素市場":"Operations → Factor Markets"}</strong><br>
            ${zh?"向供應商採購原料、人力、能源，透過最佳的庫存決策（Newsvendor）和供應鏈管理（Bullwhip）創造成本效率。":"Sourcing materials, labor, and energy from suppliers through optimal inventory decisions (Newsvendor) and supply chain management (Bullwhip) to create cost efficiency."}</p>
          </div>
          <div class="callout" style="margin-top:10px; border-color:var(--rd-color); background:rgba(26,74,139,.05);">
            <p class="p" style="font-size:13px;"><strong style="color:var(--rd-color);">🔬 ${zh?"研發 → 創造競爭優勢":"R&D → Creating Competitive Advantage"}</strong><br>
            ${zh?"沿技術 S 曲線持續改善，並在適當時機發動破壞性創新（或防禦它），使企業在產品市場保持差異化優勢。":"Continuously improving along the S-curve and launching disruptive innovation at the right moment, maintaining product market differentiation."}</p>
          </div>
        </div>
        <div>
          <div class="callout" style="border-color:var(--mkt-color); background:rgba(122,58,0,.05);">
            <p class="p" style="font-size:13px;"><strong style="color:var(--mkt-color);">📣 ${zh?"行銷 → 產品市場":"Marketing → Product Markets"}</strong><br>
            ${zh?"透過 4P 組合把價值主張傳遞給目標客群，將顧客的支付意願（WTP）轉化為實際收益（Revenues）。":"Through the 4P mix, delivering the value proposition to target customers, converting willingness to pay (WTP) into actual revenues."}</p>
          </div>
          <div class="callout" style="margin-top:10px; border-color:var(--fin-color); background:rgba(74,0,107,.05);">
            <p class="p" style="font-size:13px;"><strong style="color:var(--fin-color);">💰 ${zh?"財務 → 金融市場":"Finance → Financial Markets"}</strong><br>
            ${zh?"向金融市場交代績效（利潤、ROI、市場價值），同時從中融資，再配置資本到最有價值的投資機會。":"Reporting performance (profit, ROI, market value) to financial markets, while raising capital and allocating it to the highest-value investment opportunities."}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="grid2">
      <div class="card">
        <h3 class="cardTitle">${zh?"今日核心概念回顧":"Key Concepts Review"}</h3>
        <ul class="ul" style="font-size:13px;">
          <li><strong style="color:var(--ops-color);">Newsvendor + Critical Ratio</strong>: ${zh?"在需求不確定下，用 Cu/(Cu+Co) 找最佳庫存量":"Under uncertainty, use Cu/(Cu+Co) for optimal order quantity"}</li>
          <li><strong style="color:var(--ops-color);">Bullwhip Effect</strong>: ${zh?"供應鏈末端的小波動，在上游被指數放大":"Small downstream fluctuations amplified exponentially upstream"}</li>
          <li><strong style="color:var(--rd-color);">Technology S-curve</strong>: ${zh?"技術進步遵循萌芽→成長→成熟曲線，注意不連續點":"Tech progress follows emergence→growth→maturity; watch for discontinuities"}</li>
          <li><strong style="color:var(--rd-color);">Disruptive Innovation</strong>: ${zh?"從邊緣客群出發、以不同指標競爭，最終顛覆主流":"Starts with fringe customers, competes on different metrics, eventually disrupts mainstream"}</li>
          <li><strong style="color:var(--mkt-color);">Marketing Mix (4P)</strong>: ${zh?"Product, Price, Place, Promotion 要高度一致":"Product, Price, Place, Promotion must be coherent"}</li>
          <li><strong style="color:var(--mkt-color);">Consumer Product Types</strong>: ${zh?"便利品/選購品/特殊品/冷門品，各需不同 4P 策略":"Convenience/Shopping/Specialty/Unsought goods—each needs different 4P"}</li>
          <li><strong style="color:var(--fin-color);">Accrual vs. Cash Flow</strong>: ${zh?"利潤 ≠ 現金；流動性危機即便在獲利時也可能發生":"Profit ≠ cash; liquidity crises can occur even when profitable"}</li>
          <li><strong style="color:var(--fin-color);">Corporate Finance Decisions</strong>: ${zh?"投資（NPV）+ 融資（WACC）+ 股利（保留 vs. 分配）":"Investment (NPV) + Financing (WACC) + Dividends (retain vs. distribute)"}</li>
        </ul>
      </div>
      ${pollCard({
        key:"wrap_poll",
        title: zh?"學完今天四個功能後，你認為最難整合的挑戰是什麼？":"After today's four modules, what's the hardest integration challenge?",
        options:[
          ["a", zh?"營運與研發之間：創新速度 vs. 生產穩定性的拉力":"Ops vs R&D: Speed of innovation vs. production stability"],
          ["b", zh?"研發與行銷之間：技術能做 vs. 市場要什麼":"R&D vs Marketing: What tech can do vs. what markets want"],
          ["c", zh?"行銷與財務之間：行銷投入 vs. 短期財務壓力":"Marketing vs Finance: Marketing investment vs. short-term financial pressure"],
          ["d", zh?"四個功能整體：沒有單一功能是瓶頸，全部要同時最佳化":"All four: no single bottleneck, must optimize simultaneously"]
        ],
        followup: zh?[
          "你選的張力，在台積電、台灣大哥大或統一超商中，是如何被管理的？",
          "如果只能改善一個功能，你會選哪個？為什麼？",
          "從課程第一週到今天，你的答案有沒有改變？"
        ]:[
          "For your chosen tension, how is it managed at TSMC, Taiwan Mobile, or 7-Eleven?",
          "If you could improve only one function, which would you choose? Why?",
          "Has your answer changed since the first week of class?"
        ]
      })}
    </div>
  `;
}

// ===== View router =====
function renderView(){
  const lang = state.lang;
  const v = state.view;
  let html = "";
  switch(v){
    case "start":           html = viewStart(lang); break;
    case "ops_intro":       html = viewOpsIntro(lang); break;
    case "newsvendor":      html = viewNewsvendor(lang); break;
    case "bullwhip":        html = viewBullwhip(lang); break;
    case "supply_game":     html = viewSupplyGame(lang); break;
    case "rd_intro":        html = viewRDIntro(lang); break;
    case "disruptive":      html = viewDisruptive(lang); break;
    case "llm_search":      html = viewLLMSearch(lang); break;
    case "mkt_intro":       html = viewMktIntro(lang); break;
    case "consumer_products": html = viewConsumerProducts(lang); break;
    case "pizza_game":      html = viewPizzaGame(lang); break;
    case "acct_finance":    html = viewAcctFinance(lang); break;
    case "corp_finance":    html = viewCorpFinance(lang); break;
    case "wrap":            html = viewWrap(lang); break;
    default:                html = viewStart(lang);
  }
  content.innerHTML = html;
  content.scrollTop = 0;

  // Bind poll buttons
  document.querySelectorAll(".opt[data-poll]").forEach(btn => {
    btn.addEventListener("click", ()=>{
      const key = btn.dataset.poll;
      const opt = btn.dataset.opt;
      setPoll(key, opt);
      renderView();
    });
  });

  // Update sidebar active
  document.querySelectorAll(".navItem").forEach(n=>{
    n.classList.toggle("active", n.dataset.view === v);
  });
}

function applyI18N(){
  const t = I18N[state.lang];
  topicTitle.textContent = t.topicTitle;
  navTitle.textContent = t.navTitle;
  footLeft.textContent = t.footerLeft;
  btnLang.textContent = t.buttons.lang;
  btnPresent.textContent = t.buttons.presenter;
  btnReset.textContent = t.buttons.reset;
  btnHelp.textContent = t.buttons.help;
}

function navigate(dir){
  const idx = VIEW_ORDER.indexOf(state.view);
  const next = idx + dir;
  if(next >= 0 && next < VIEW_ORDER.length){
    state.view = VIEW_ORDER[next];
    saveState();
    renderView();
  }
}

// ===== Event listeners =====
document.querySelectorAll(".navItem[data-view]").forEach(btn => {
  btn.addEventListener("click", ()=>{
    state.view = btn.dataset.view;
    saveState();
    renderView();
  });
});

btnLang.addEventListener("click", ()=>{
  state.lang = state.lang === "zh" ? "en" : "zh";
  saveState();
  applyI18N();
  renderView();
});

btnPresent.addEventListener("click", ()=>{
  state.presenter = !state.presenter;
  document.documentElement.classList.toggle("presenter", state.presenter);
  showToast(state.presenter ? "投影模式 ON" : "投影模式 OFF");
});

btnReset.addEventListener("click", ()=>{
  state.polls = {}; state.sliders = {};
  saveState();
  showToast(I18N[state.lang].toastReset);
  renderView();
});

btnHelp.addEventListener("click", ()=>{
  const t = I18N[state.lang];
  helpTitle.textContent = t.helpTitle;
  helpBody.innerHTML = t.helpBody;
  helpDialog.showModal();
});
btnClose.addEventListener("click", ()=> helpDialog.close());
helpDialog.addEventListener("click", e=>{ if(e.target===helpDialog) helpDialog.close(); });

document.addEventListener("keydown", e=>{
  if(helpDialog.open) return;
  const tag = document.activeElement.tagName;
  if(["INPUT","TEXTAREA","SELECT"].includes(tag)) return;
  switch(e.key){
    case "ArrowRight": case "ArrowDown": navigate(1); break;
    case "ArrowLeft":  case "ArrowUp":   navigate(-1); break;
    case "l": case "L": btnLang.click(); break;
    case "p": case "P": btnPresent.click(); break;
    case "r": case "R": btnReset.click(); break;
    case "?":           btnHelp.click(); break;
  }
});

// ===== Init =====
applyI18N();
renderView();
