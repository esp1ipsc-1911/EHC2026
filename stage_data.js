/* EHC 2026 — Stage Data
   order: [] — empty by default, filled via in-app editor
*/
const STAGES = [
  {
    id:1, rounds:9, papers:5, poppers:4, plates:0, ns:1, reloads:0,
    ready:"Firearm loaded, lying flat in the tray, all magazines on belt",
    start:"Sitting on barrel, hands on marks",
    special:["WEAK HAND ONLY throughout","Min 1 hit per paper target","Firearm in tray — no holster draw"],
    moving:"P2 → T1 (stays visible)   |   P3 → T2 (stays visible)",
    magPlan:"9 rounds in one magazine. Pick up firearm → rack slide → engage all WEAK HAND ONLY.",
    alerts:["WEAK HAND ONLY — includes pick-up and rack","Minimum 1 hit per paper is mandatory","9 rounds = no reload needed"],
    order:[], tags:["special","moving"]
  },
  {
    id:2, rounds:21, papers:8, poppers:4, plates:1, ns:1, reloads:2,
    ready:"Loaded, chamber empty, magazine inserted",
    start:"Standing at mark, heels touching",
    special:["Chamber empty — rack slide immediately","4 moving targets from 4 poppers"],
    moving:"P1→T2  |  P2→T1  |  P3→T3  |  P4→T4 (all stay visible)",
    magPlan:"Mag 1: 10 rds  |  Mag 2: 10 rds  |  Mag 3: 1 rd. Start by racking slide.",
    alerts:["Chamber empty — rack slide is your FIRST action","Shoot all 4 poppers before attempting movers","21 rounds = 3 magazines Classic"],
    order:[], tags:["moving","long","reload3"]
  },
  {
    id:3, rounds:12, papers:4, poppers:2, plates:2, ns:0, reloads:1,
    ready:"Firearm loaded, lying on barrel — ALL mags on barrel too",
    start:"Standing at mark, both heels touching",
    special:["Firearm AND all mags on barrel — not on belt"],
    moving:"None",
    magPlan:"Mag 1: 10 rds on barrel  |  Mag 2: 2 rds on barrel.",
    alerts:["All magazines must be on the barrel at start — confirm in walk","12 rounds = 1 full mag + 2 rds"],
    order:[], tags:[]
  },
  {
    id:4, rounds:23, papers:10, poppers:2, plates:1, ns:1, reloads:2,
    ready:"⚠ NOT SPECIFIED — confirm with RO before stage",
    start:"Standing anywhere (free choice)",
    special:["Firearm ready condition missing from stage sheet"],
    moving:"P2 → T1 (stays visible at rest)",
    magPlan:"Mag 1: 10  |  Mag 2: 10  |  Mag 3: 3. Shoot P2 early to activate T1.",
    alerts:["Firearm ready condition NOT on stage sheet — ask RO","P2 must fall before T1 exists — plan popper order","23 rounds = 3 magazines minimum"],
    order:[], tags:["moving","long","reload3"]
  },
  {
    id:5, rounds:32, papers:12, poppers:3, plates:5, ns:2, reloads:3,
    ready:"⚠ NOT SPECIFIED — confirm with RO before stage",
    start:"Standing anywhere (free choice)",
    special:["Heaviest stage in the match — 32 rounds","4 magazines required"],
    moving:"None",
    magPlan:"Mag 1: 10  |  Mag 2: 10  |  Mag 3: 10  |  Mag 4: 2.",
    alerts:["32 rounds = 4 magazines — heaviest stage of the match","2 NS targets — identify and memorize in walk","Ready condition NOT specified — confirm with RO"],
    order:[], tags:["long","reload3"]
  },
  {
    id:6, rounds:11, papers:3, poppers:2, plates:3, ns:0, reloads:1,
    ready:"Loaded and holstered, chamber empty, magazine inserted",
    start:"Sitting on chair, both hands on knees",
    special:["Holstered start","Chamber empty — rack after draw","Sitting start position"],
    moving:"P1 → activates PL2 and PL3 (stay visible)",
    magPlan:"Mag 1: 10  |  Mag 2: 1. Draw, rack, shoot P1 first to unlock plates.",
    alerts:["Rack slide immediately after draw — chamber empty","P1 MUST fall before PL2–PL3 are accessible","Practice draw from seated position before competition"],
    order:[], tags:["special","moving"]
  },
  {
    id:7, rounds:12, papers:4, poppers:1, plates:3, ns:2, reloads:1,
    ready:"⚠ NOT SPECIFIED — confirm with RO",
    start:"Standing anywhere (free choice)",
    special:["2 NS metal plates — do NOT shoot"],
    moving:"P1 → T1 (stays visible at rest)",
    magPlan:"Mag 1: 10  |  Mag 2: 2. Shoot P1 early to activate T1.",
    alerts:["2 NS metal plates — confirm exact positions in walk","P1 activates T1 — shoot P1 before attempting T1","Ready condition not specified — confirm with RO"],
    order:[], tags:["moving"]
  },
  {
    id:8, rounds:16, papers:7, poppers:0, plates:2, ns:2, reloads:1,
    ready:"⚠ NOT SPECIFIED — confirm with RO",
    start:"Standing at mark, both heels touching",
    special:["STRONG HAND ONLY throughout","Door must be opened to activate PL1","2 NS paper targets"],
    moving:"Opening the door → activates PL1 (stays visible)",
    magPlan:"Mag 1: 10  |  Mag 2: 6. Open door first — strong hand holds firearm throughout.",
    alerts:["STRONG HAND ONLY — entire stage","Door opens PL1 — operate door before engaging","Practice strong-hand reload before competition","2 NS papers — memorize positions"],
    order:[], tags:["special","moving"]
  },
  {
    id:9, rounds:32, papers:16, poppers:0, plates:0, ns:4, reloads:3,
    ready:"⚠ NOT SPECIFIED — confirm with RO",
    start:"Standing in front of wall, both hands touching mark",
    special:["4 NS paper targets — biggest penalty risk","Pure paper stage — no steel"],
    moving:"None",
    magPlan:"Mag 1: 10  |  Mag 2: 10  |  Mag 3: 10  |  Mag 4: 2. All paper — accuracy + speed.",
    alerts:["4 NS paper targets — memorize positions precisely in walk","32 rounds = 4 magazines","No steel — pure paper accuracy challenge","Ready condition not specified — confirm with RO"],
    order:[], tags:["long","reload3"]
  },
  {
    id:10, rounds:12, papers:5, poppers:2, plates:0, ns:1, reloads:1,
    ready:"⚠ NOT SPECIFIED — confirm with RO",
    start:"Standing, both heels touching mark",
    special:["NS Popper on stage — do NOT shoot"],
    moving:"P2 → T1 (stays visible at rest)",
    magPlan:"Mag 1: 10  |  Mag 2: 2. Shoot P2 to unlock T1. Identify NS popper in walk.",
    alerts:["NS Popper present — identify which one in walk","P2 activates T1 — not P1","Ready condition not specified — confirm with RO"],
    order:[], tags:["moving"]
  },
  {
    id:11, rounds:23, papers:10, poppers:3, plates:2, ns:2, reloads:2,
    ready:"⚠ NOT SPECIFIED — confirm with RO",
    start:"Standing anywhere (free choice)",
    special:["2 NS Poppers + 1 NS metal plate — 3 penalty traps","P1 activates TWO movers simultaneously"],
    moving:"P1 → T1 AND T2 simultaneously (both stay visible)",
    magPlan:"Mag 1: 10  |  Mag 2: 10  |  Mag 3: 3. Shoot P1 early — it unlocks both T1 and T2.",
    alerts:["P1 activates TWO movers — identify P1 early","2 NS Poppers + 1 NS metal plate = 3 traps","23 rounds = 3 magazines"],
    order:[], tags:["moving","long","reload3"]
  },
  {
    id:12, rounds:12, papers:5, poppers:2, plates:0, ns:0, reloads:1,
    ready:"⚠ NOT SPECIFIED — confirm with RO",
    start:"Standing, both heels touching mark",
    special:["Both poppers must fall to reveal flip-up targets"],
    moving:"P1 → flip-up T1 & T2   |   P2 → flip-up T3 & T4",
    magPlan:"Mag 1: 10  |  Mag 2: 2. Shoot both poppers first — T1–T4 hidden until activated.",
    alerts:["Both poppers MUST fall before T1–T4 exist","Flip-up targets stay visible — no rush after activation"],
    order:[], tags:["moving"]
  },
  {
    id:13, rounds:12, papers:5, poppers:1, plates:1, ns:1, reloads:1,
    ready:"⚠ NOT SPECIFIED — confirm with RO",
    start:"Standing anywhere (free choice)",
    special:["NS paper target present"],
    moving:"P1 (mini popper) → T1 (stays visible)",
    magPlan:"Mag 1: 10  |  Mag 2: 2. Shoot mini popper P1 to unlock T1.",
    alerts:["NS paper target — identify exact location in walk","P1 is a mini popper — confirm identity before engaging"],
    order:[], tags:["moving"]
  },
  {
    id:14, rounds:24, papers:11, poppers:3, plates:0, ns:2, reloads:2,
    ready:"⚠ NOT SPECIFIED — confirm with RO",
    start:"Standing, both heels touching mark",
    special:["Cooper Tunnel — must crawl through","P2 movers DISAPPEAR — engage IMMEDIATELY","Most complex stage"],
    moving:"P1 → T1 (stays visible)  |  P2 → T2 & T3 (DISAPPEAR after activation)",
    magPlan:"Mag 1: 10  |  Mag 2: 10  |  Mag 3: 4. P2 → T2/T3 disappear — shoot them instantly.",
    alerts:["⚠ T2 and T3 DISAPPEAR — engage the instant P2 falls","Cooper Tunnel: plan firearm orientation when crawling","NS mini popper on stage — do NOT shoot","Walk this stage multiple times — most complex"],
    order:[], tags:["special","moving","long","reload3"]
  },
  {
    id:15, rounds:32, papers:16, poppers:0, plates:0, ns:4, reloads:3,
    ready:"⚠ NOT SPECIFIED — confirm with RO",
    start:"Standing, both heels touching mark",
    special:["Same format as Stage 9 — 4 NS targets, pure paper"],
    moving:"None",
    magPlan:"Mag 1: 10  |  Mag 2: 10  |  Mag 3: 10  |  Mag 4: 2.",
    alerts:["4 NS paper targets — same risk as Stage 9","32 rounds = 4 magazines","Pure paper — no steel at all","Walk carefully — map all NS target positions"],
    order:[], tags:["long","reload3"]
  },
  {
    id:16, rounds:12, papers:12, poppers:0, plates:0, ns:4, reloads:1,
    ready:"⚠ NOT SPECIFIED — confirm with RO",
    start:"Standing, both heels touching mark",
    special:["STRONG HAND ONLY","Min 1 hit per paper — mandatory","4 NS papers"],
    moving:"None",
    magPlan:"Mag 1: 10  |  Mag 2: 2. Strong hand only. 12 rounds for 12 papers = zero miss margin.",
    alerts:["STRONG HAND ONLY — entire stage","Min 1 hit per paper is MANDATORY","4 NS papers — confirm positions","12 rds / 12 papers = zero margin for misses"],
    order:[], tags:["special"]
  },
  {
    id:17, rounds:24, papers:12, poppers:0, plates:0, ns:3, reloads:2,
    ready:"⚠ NOT SPECIFIED — confirm with RO",
    start:"Standing, both heels touching mark",
    special:["3 NS paper targets"],
    moving:"None",
    magPlan:"Mag 1: 10  |  Mag 2: 10  |  Mag 3: 4. V-shaped bay layout.",
    alerts:["3 NS paper targets — memorize positions in walk","24 rounds = 3 magazines Classic","V-shaped bay — significant lateral movement"],
    order:[], tags:["long","reload3"]
  },
  {
    id:18, rounds:12, papers:5, poppers:1, plates:1, ns:1, reloads:1,
    ready:"⚠ NOT SPECIFIED — confirm with RO",
    start:"Standing, both heels touching mark",
    special:["NS paper target"],
    moving:"P1 → T1 (stays visible at rest)",
    magPlan:"Mag 1: 10  |  Mag 2: 2. Shoot P1 to activate T1.",
    alerts:["NS paper target — confirm location in walk","P1 activates T1 — shoot P1 first"],
    order:[], tags:["moving"]
  },
  {
    id:19, rounds:12, papers:5, poppers:2, plates:0, ns:1, reloads:1,
    ready:"⚠ NOT SPECIFIED — confirm with RO",
    start:"Standing, both heels touching mark",
    special:["NS paper target"],
    moving:"P2 → T1 (stays visible at rest)",
    magPlan:"Mag 1: 10  |  Mag 2: 2. P1 is scoring — P2 activates T1.",
    alerts:["P2 activates T1 — not P1, do not confuse","NS paper target — confirm exact position"],
    order:[], tags:["moving"]
  },
  {
    id:20, rounds:23, papers:10, poppers:3, plates:0, ns:3, reloads:2,
    ready:"⚠ NOT SPECIFIED — confirm with RO",
    start:"Standing anywhere (free choice)",
    special:["3 NS paper targets"],
    moving:"None",
    magPlan:"Mag 1: 10  |  Mag 2: 10  |  Mag 3: 3. Three bays — free start choice.",
    alerts:["3 NS paper targets — same risk as Stage 17","23 rounds = 3 magazines","Free start — use it wisely"],
    order:[], tags:["long","reload3"]
  },
  {
    id:21, rounds:24, papers:11, poppers:2, plates:0, ns:2, reloads:2,
    ready:"⚠ NOT SPECIFIED — confirm with RO",
    start:"Standing, both heels touching mark",
    special:["2 NS targets"],
    moving:"None",
    magPlan:"Mag 1: 10  |  Mag 2: 10  |  Mag 3: 4.",
    alerts:["2 NS paper targets — confirm positions","24 rounds = 3 magazines Classic"],
    order:[], tags:["long","reload3"]
  },
  {
    id:22, rounds:30, papers:15, poppers:0, plates:0, ns:2, reloads:2,
    ready:"⚠ NOT SPECIFIED — confirm with RO",
    start:"Holding bull's horns prop with both hands",
    special:["Unique start — both hands on bull's horns prop","Wide lateral stage"],
    moving:"None",
    magPlan:"Mag 1: 10  |  Mag 2: 10  |  Mag 3: 10. Three full mags — wide bay layout.",
    alerts:["Both hands on bull's horns at start — practice this draw","30 rounds = 3 full magazines","2 NS targets — confirm positions","Wide stage — plan lateral movement"],
    order:[], tags:["special","long","reload3"]
  },
  {
    id:23, rounds:12, papers:4, poppers:2, plates:2, ns:2, reloads:1,
    ready:"⚠ NOT SPECIFIED — confirm with RO",
    start:"Standing, both heels touching mark",
    special:["P1 mover DISAPPEARS — engage immediately","2 NS metal plates"],
    moving:"P1 → T1 (DISAPPEARS after activation)  |  P2 → no mover",
    magPlan:"Mag 1: 10  |  Mag 2: 2. Shoot P1 and IMMEDIATELY engage T1 before it vanishes.",
    alerts:["⚠ T1 DISAPPEARS — no hesitation after P1 falls","2 NS metal plates — identify exact positions in walk","If T1 is missed before disappearing — points are gone"],
    order:[], tags:["special","moving"]
  },
  {
    id:24, rounds:9, papers:3, poppers:2, plates:0, ns:0, reloads:0,
    ready:"Firearm loaded, lying flat in the box, all magazines on belt",
    start:"Sitting in boat, strong hand on engine joystick",
    special:["WEAK HAND ONLY","Strong hand holds joystick at start","Firearm in box — not holster","Most unusual start position in match"],
    moving:"P1 → T1 (stays visible)   |   P2 → T2 (stays visible)",
    magPlan:"9 rounds in one magazine. Pick up firearm with WEAK HAND. Strong hand stays on joystick.",
    alerts:["WEAK HAND ONLY — strong hand holds joystick at start","Firearm in box — practice the seated weak-hand pickup","Walk the boat stage carefully — unique terrain"],
    order:[], tags:["special","moving"]
  }
];
