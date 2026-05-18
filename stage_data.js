const STAGES = [
  {
    id: 1,
    rounds: 9, papers: 5, poppers: 4, plates: 0, ns: 1, reloads: 0,
    ready: "Firearm loaded, lying flat in the tray, all magazines on belt",
    start: "Sitting on barrel, hands on marks",
    special: ["WEAK HAND ONLY throughout", "Min 1 hit per paper target", "Firearm in tray — no holster draw"],
    moving: "P2 → T1 (stays visible)   |   P3 → T2 (stays visible)",
    magPlan: "9 rounds in one magazine. Pick up firearm → rack slide → engage all WEAK HAND ONLY.",
    order: [
      "Pick up firearm from tray (weak hand)",
      "Rack slide to chamber first round",
      "Engage 5 papers — min 1 round each (5 rds)",
      "Shoot P2 → activates moving target T1",
      "Shoot P3 → activates moving target T2",
      "Engage T1 and T2 at rest",
      "Shoot P1 and P4 poppers"
    ],
    alerts: [
      "WEAK HAND ONLY — includes pick-up and rack",
      "Minimum 1 hit per paper is mandatory",
      "9 rounds = no reload needed"
    ],
    tags: ["special","moving"]
  },
  {
    id: 2,
    rounds: 21, papers: 8, poppers: 4, plates: 1, ns: 1, reloads: 2,
    ready: "Loaded, chamber empty, magazine inserted",
    start: "Standing at mark, heels touching",
    special: ["Chamber empty — rack slide immediately", "4 moving targets from 4 poppers"],
    moving: "P1→T2  |  P2→T1  |  P3→T3  |  P4→T4 (all stay visible)",
    magPlan: "Mag 1: 10 rds  |  Mag 2: 10 rds  |  Mag 3: 1 rd. Start by racking slide.",
    order: [
      "Rack slide immediately on buzzer",
      "Engage P1 (activates T2) + P2 (activates T1)",
      "Engage P3 (activates T3) + P4 (activates T4)",
      "Engage paper array — 2 rds each paper",
      "RELOAD #1 (slide lock at 10 rds)",
      "Continue papers + metal plate PL",
      "RELOAD #2",
      "Engage all 4 moving targets T1–T4",
      "Avoid NS target"
    ],
    alerts: [
      "Chamber empty — rack slide is your FIRST action",
      "Shoot all 4 poppers before attempting movers",
      "21 rounds = 3 magazines Classic"
    ],
    tags: ["moving","long","reload3"]
  },
  {
    id: 3,
    rounds: 12, papers: 4, poppers: 2, plates: 2, ns: 0, reloads: 1,
    ready: "Firearm loaded, lying on barrel — ALL mags on barrel too",
    start: "Standing at mark, both heels touching",
    special: ["Firearm AND all mags on barrel — not on belt"],
    moving: "None",
    magPlan: "Mag 1: 10 rds on barrel  |  Mag 2: 2 rds on barrel. Pick up firearm, shoot left bay, reload, shoot right bay.",
    order: [
      "Pick up firearm from barrel",
      "Engage left bay: 2 papers (2 rds each) + mini popper + plate",
      "RELOAD #1 at slide lock",
      "Engage right bay: 2 papers (2 rds each) + mini popper + plate"
    ],
    alerts: [
      "All magazines must be on the barrel at start — confirm in walk",
      "12 rounds = 1 full mag + 2 rds"
    ],
    tags: []
  },
  {
    id: 4,
    rounds: 23, papers: 10, poppers: 2, plates: 1, ns: 1, reloads: 2,
    ready: "⚠️ NOT SPECIFIED — confirm with RO before stage",
    start: "Standing anywhere (free choice)",
    special: ["Firearm ready condition missing from stage sheet"],
    moving: "P2 → T1 (stays visible at rest)",
    magPlan: "Mag 1: 10  |  Mag 2: 10  |  Mag 3: 3. Shoot P2 early to activate T1.",
    order: [
      "Choose optimal start position in walk",
      "Engage left cluster papers + P1 popper",
      "Shoot P2 → activates moving target T1",
      "RELOAD #1 (slide lock at 10 rds)",
      "Engage center arrays + metal plate",
      "RELOAD #2",
      "Engage T1 mover (visible at rest)",
      "Mop up remaining papers + NS target (avoid NS)"
    ],
    alerts: [
      "Firearm ready condition NOT on stage sheet — ask RO",
      "P2 must fall before T1 exists — plan popper order",
      "23 rounds = 3 magazines minimum"
    ],
    tags: ["moving","long","reload3"]
  },
  {
    id: 5,
    rounds: 32, papers: 12, poppers: 3, plates: 5, ns: 2, reloads: 3,
    ready: "⚠️ NOT SPECIFIED — confirm with RO before stage",
    start: "Standing anywhere (free choice)",
    special: ["Heaviest stage in the match — 32 rounds", "4 magazines required"],
    moving: "None",
    magPlan: "Mag 1: 10  |  Mag 2: 10  |  Mag 3: 10  |  Mag 4: 2. Plan movement path carefully — 3 bays.",
    order: [
      "Choose start position — open nearest array first",
      "Engage bay 1: papers + steel",
      "RELOAD #1 (slide lock)",
      "Move to bay 2: papers + steel",
      "RELOAD #2 (slide lock)",
      "Move to bay 3: poppers + plates",
      "RELOAD #3",
      "Mop up + avoid 2 NS targets"
    ],
    alerts: [
      "32 rounds = 4 magazines — heaviest stage of the match",
      "2 NS targets — identify and memorize in walk",
      "Ready condition NOT specified — confirm with RO"
    ],
    tags: ["long","reload3"]
  },
  {
    id: 6,
    rounds: 11, papers: 3, poppers: 2, plates: 3, ns: 0, reloads: 1,
    ready: "Loaded and holstered, chamber empty, magazine inserted",
    start: "Sitting on chair, both hands on knees",
    special: ["Holstered start", "Chamber empty — rack after draw", "Sitting start position"],
    moving: "P1 → activates PL2 and PL3 (stay visible)",
    magPlan: "Mag 1: 10  |  Mag 2: 1. Draw, rack, shoot P1 first to unlock plates.",
    order: [
      "On buzzer: stand and draw from holster",
      "Rack slide — chamber was empty",
      "Shoot P1 → activates metal plates PL2 and PL3",
      "Engage 3 papers (2 rds each = 6 rds)",
      "Shoot P2 popper",
      "RELOAD #1 at 10 rds",
      "Engage plates PL1, PL2, PL3"
    ],
    alerts: [
      "Rack slide immediately after draw — chamber empty",
      "P1 MUST fall before PL2–PL3 are accessible",
      "Practice draw from seated position before competition"
    ],
    tags: ["special","moving"]
  },
  {
    id: 7,
    rounds: 12, papers: 4, poppers: 1, plates: 3, ns: 2, reloads: 1,
    ready: "⚠️ NOT SPECIFIED — confirm with RO",
    start: "Standing anywhere (free choice)",
    special: ["2 NS metal plates — do NOT shoot"],
    moving: "P1 → T1 (stays visible at rest)",
    magPlan: "Mag 1: 10  |  Mag 2: 2. Shoot P1 early to activate T1.",
    order: [
      "Choose position covering most targets",
      "Shoot P1 popper → activates T1",
      "Engage 4 papers (2 rds each = 8 rds)",
      "RELOAD #1 at slide lock",
      "Engage 3 scoring metal plates",
      "Engage T1 mover (visible at rest)",
      "AVOID 2 NS metal plates throughout"
    ],
    alerts: [
      "2 NS metal plates — confirm exact positions in walk",
      "P1 activates T1 — shoot P1 before attempting T1",
      "Ready condition not specified — confirm with RO"
    ],
    tags: ["moving"]
  },
  {
    id: 8,
    rounds: 16, papers: 7, poppers: 0, plates: 2, ns: 2, reloads: 1,
    ready: "⚠️ NOT SPECIFIED — confirm with RO",
    start: "Standing at mark, both heels touching",
    special: ["STRONG HAND ONLY throughout", "Door must be opened to activate PL1", "2 NS paper targets"],
    moving: "Opening the door → activates PL1 (stays visible)",
    magPlan: "Mag 1: 10  |  Mag 2: 6. Open door first — strong hand holds firearm throughout.",
    order: [
      "On buzzer: open the door (activates PL1 mover)",
      "Engage first paper array — strong hand only (2 rds each)",
      "RELOAD #1 at slide lock",
      "Engage second paper array",
      "Engage plate PL1 (mover, now at rest) + PL2",
      "AVOID 2 NS paper targets"
    ],
    alerts: [
      "STRONG HAND ONLY — entire stage",
      "Door opens PL1 — operate door before engaging",
      "Practice strong-hand reload before competition",
      "2 NS papers — memorize positions"
    ],
    tags: ["special","moving"]
  },
  {
    id: 9,
    rounds: 32, papers: 16, poppers: 0, plates: 0, ns: 4, reloads: 3,
    ready: "⚠️ NOT SPECIFIED — confirm with RO",
    start: "Standing in front of wall, both hands touching mark",
    special: ["4 NS paper targets — biggest penalty risk", "Pure paper stage — no steel"],
    moving: "None",
    magPlan: "Mag 1: 10  |  Mag 2: 10  |  Mag 3: 10  |  Mag 4: 2. All paper — accuracy + speed.",
    order: [
      "Touch wall mark with both hands — draw on buzzer",
      "Engage left array papers (2 rds each)",
      "RELOAD #1",
      "Engage center papers",
      "RELOAD #2",
      "Engage right array papers",
      "RELOAD #3 if needed",
      "Confirm 4 NS targets NEVER engaged"
    ],
    alerts: [
      "4 NS paper targets — memorize positions precisely in walk",
      "32 rounds = 4 magazines — same as Stage 5 and 15",
      "No steel — pure paper accuracy challenge",
      "Ready condition not specified — confirm with RO"
    ],
    tags: ["long","reload3"]
  },
  {
    id: 10,
    rounds: 12, papers: 5, poppers: 2, plates: 0, ns: 1, reloads: 1,
    ready: "⚠️ NOT SPECIFIED — confirm with RO",
    start: "Standing, both heels touching mark",
    special: ["NS Popper on stage — do NOT shoot"],
    moving: "P2 → T1 (stays visible at rest)",
    magPlan: "Mag 1: 10  |  Mag 2: 2. Shoot P2 to unlock T1. Identify NS popper in walk.",
    order: [
      "Shoot P1 (scoring) = 1 rd",
      "Shoot P2 (scoring) → activates T1 = 1 rd",
      "Engage 5 papers (2 rds each = 10 rds)",
      "RELOAD #1",
      "Engage T1 mover (visible at rest) = 2 rds",
      "AVOID NS Popper throughout"
    ],
    alerts: [
      "NS Popper present — identify which one in walk",
      "P2 activates T1 — not P1",
      "Ready condition not specified — confirm with RO"
    ],
    tags: ["moving"]
  },
  {
    id: 11,
    rounds: 23, papers: 10, poppers: 3, plates: 2, ns: 2, reloads: 2,
    ready: "⚠️ NOT SPECIFIED — confirm with RO",
    start: "Standing anywhere (free choice)",
    special: ["2 NS Poppers + 1 NS metal plate — 3 penalty traps", "P1 activates TWO movers simultaneously"],
    moving: "P1 → T1 AND T2 simultaneously (both stay visible)",
    magPlan: "Mag 1: 10  |  Mag 2: 10  |  Mag 3: 3. Shoot P1 early — it unlocks both T1 and T2.",
    order: [
      "Identify P1 (scoring) position in walk",
      "Shoot P1 → activates BOTH T1 and T2",
      "Engage first paper array (2 rds each)",
      "RELOAD #1 at slide lock",
      "Engage second paper array",
      "Engage 2 scoring metal plates",
      "RELOAD #2",
      "Engage T1 and T2 movers (visible at rest)",
      "AVOID 2 NS Poppers + 1 NS plate throughout"
    ],
    alerts: [
      "P1 activates TWO movers — identify P1 early",
      "2 NS Poppers + 1 NS metal plate = 3 traps",
      "23 rounds = 3 magazines"
    ],
    tags: ["moving","long","reload3"]
  },
  {
    id: 12,
    rounds: 12, papers: 5, poppers: 2, plates: 0, ns: 0, reloads: 1,
    ready: "⚠️ NOT SPECIFIED — confirm with RO",
    start: "Standing, both heels touching mark",
    special: ["Both poppers must fall to reveal flip-up targets"],
    moving: "P1 → flip-up T1 & T2   |   P2 → flip-up T3 & T4",
    magPlan: "Mag 1: 10  |  Mag 2: 2. Shoot both poppers first — T1–T4 are hidden until activated.",
    order: [
      "Shoot P1 → flip-up T1 and T2 appear",
      "Shoot P2 → flip-up T3 and T4 appear",
      "Engage 1 standard paper target (not flip-up)",
      "Engage flip-up T1, T2, T3, T4 (2 rds each = 8 rds)",
      "RELOAD #1 at 10 rds",
      "Complete remaining targets"
    ],
    alerts: [
      "Both poppers MUST fall before T1–T4 exist",
      "Flip-up targets stay visible — no rush after activation",
      "Plan reload timing to cover all 4 flip-ups"
    ],
    tags: ["moving"]
  },
  {
    id: 13,
    rounds: 12, papers: 5, poppers: 1, plates: 1, ns: 1, reloads: 1,
    ready: "⚠️ NOT SPECIFIED — confirm with RO",
    start: "Standing anywhere (free choice)",
    special: ["NS paper target present"],
    moving: "P1 (mini popper) → T1 (stays visible)",
    magPlan: "Mag 1: 10  |  Mag 2: 2. Shoot mini popper P1 to unlock T1.",
    order: [
      "Choose optimal start position",
      "Shoot mini popper P1 → activates T1",
      "Engage 5 scoring papers (2 rds each = 10 rds)",
      "RELOAD #1",
      "Engage metal plate = 1 rd",
      "Engage T1 mover (visible at rest) = 2 rds",
      "AVOID NS paper target"
    ],
    alerts: [
      "NS paper target — identify exact location in walk",
      "P1 is a mini popper — confirm identity before engaging"
    ],
    tags: ["moving"]
  },
  {
    id: 14,
    rounds: 24, papers: 11, poppers: 3, plates: 0, ns: 2, reloads: 2,
    ready: "⚠️ NOT SPECIFIED — confirm with RO",
    start: "Standing, both heels touching mark",
    special: ["Cooper Tunnel — must crawl through", "P2 movers DISAPPEAR — engage IMMEDIATELY", "Most complex stage"],
    moving: "P1 → T1 (stays visible)  |  P2 → T2 & T3 (DISAPPEAR after activation)",
    magPlan: "Mag 1: 10  |  Mag 2: 10  |  Mag 3: 4. P2 → T2/T3 disappear — shoot them instantly.",
    order: [
      "Identify Cooper Tunnel position in walk — plan pre/post",
      "Shoot P1 → T1 activates (stays, shoot later)",
      "Shoot P2 → T2 & T3 appear — ENGAGE IMMEDIATELY",
      "Engage papers in first position",
      "Navigate Cooper Tunnel",
      "RELOAD #1 at slide lock",
      "Engage papers on far side of tunnel",
      "RELOAD #2",
      "Engage T1 (visible at rest)",
      "Avoid NS mini popper (P3 area)"
    ],
    alerts: [
      "⚠️ T2 and T3 DISAPPEAR — engage the instant P2 falls",
      "Cooper Tunnel: plan firearm orientation when crawling",
      "NS mini popper on stage — do NOT shoot",
      "Walk this stage multiple times — most complex"
    ],
    tags: ["special","moving","long","reload3"]
  },
  {
    id: 15,
    rounds: 32, papers: 16, poppers: 0, plates: 0, ns: 4, reloads: 3,
    ready: "⚠️ NOT SPECIFIED — confirm with RO",
    start: "Standing, both heels touching mark",
    special: ["Same format as Stage 9 — 4 NS targets, pure paper"],
    moving: "None",
    magPlan: "Mag 1: 10  |  Mag 2: 10  |  Mag 3: 10  |  Mag 4: 2. Mirror of Stage 9.",
    order: [
      "Engage left array papers (2 rds each)",
      "RELOAD #1",
      "Engage center papers",
      "RELOAD #2",
      "Engage right papers",
      "RELOAD #3 if needed",
      "Confirm 4 NS targets NEVER engaged"
    ],
    alerts: [
      "4 NS paper targets — same risk as Stage 9",
      "32 rounds = 4 magazines",
      "Pure paper — no steel at all",
      "Walk carefully — map all NS target positions"
    ],
    tags: ["long","reload3"]
  },
  {
    id: 16,
    rounds: 12, papers: 12, poppers: 0, plates: 0, ns: 4, reloads: 1,
    ready: "⚠️ NOT SPECIFIED — confirm with RO",
    start: "Standing, both heels touching mark",
    special: ["STRONG HAND ONLY", "Min 1 hit per paper — mandatory", "4 NS papers"],
    moving: "None",
    magPlan: "Mag 1: 10  |  Mag 2: 2. Strong hand only. 12 rounds for 12 papers = zero miss margin.",
    order: [
      "Engage left papers — strong hand only (1 rd each min)",
      "RELOAD #1 at slide lock",
      "Engage right papers — strong hand only",
      "Confirm every scoring paper has min 1 hit",
      "AVOID 4 NS papers throughout"
    ],
    alerts: [
      "STRONG HAND ONLY — entire stage",
      "Min 1 hit per paper is MANDATORY — rule violation if missed",
      "4 NS papers — confirm positions",
      "12 rds / 12 papers = zero margin for misses"
    ],
    tags: ["special"]
  },
  {
    id: 17,
    rounds: 24, papers: 12, poppers: 0, plates: 0, ns: 3, reloads: 2,
    ready: "⚠️ NOT SPECIFIED — confirm with RO",
    start: "Standing, both heels touching mark",
    special: ["3 NS paper targets"],
    moving: "None",
    magPlan: "Mag 1: 10  |  Mag 2: 10  |  Mag 3: 4. V-shaped bay layout — plan sweep direction.",
    order: [
      "Choose sweep direction left or right first",
      "Engage first bay papers (2 rds each)",
      "RELOAD #1",
      "Engage second bay papers",
      "RELOAD #2",
      "Engage third bay papers",
      "Confirm 3 NS targets never engaged"
    ],
    alerts: [
      "3 NS paper targets — memorize positions in walk",
      "24 rounds = 3 magazines Classic",
      "V-shaped bay — significant lateral movement"
    ],
    tags: ["long","reload3"]
  },
  {
    id: 18,
    rounds: 12, papers: 5, poppers: 1, plates: 1, ns: 1, reloads: 1,
    ready: "⚠️ NOT SPECIFIED — confirm with RO",
    start: "Standing, both heels touching mark",
    special: ["NS paper target"],
    moving: "P1 → T1 (stays visible at rest)",
    magPlan: "Mag 1: 10  |  Mag 2: 2. Shoot P1 to activate T1.",
    order: [
      "Shoot P1 popper → activates T1",
      "Engage 5 scoring papers (2 rds each = 10 rds)",
      "RELOAD #1",
      "Engage metal plate = 1 rd",
      "Engage T1 mover (visible at rest) = 2 rds",
      "AVOID NS paper target"
    ],
    alerts: [
      "NS paper target — confirm location in walk",
      "P1 activates T1 — shoot P1 first"
    ],
    tags: ["moving"]
  },
  {
    id: 19,
    rounds: 12, papers: 5, poppers: 2, plates: 0, ns: 1, reloads: 1,
    ready: "⚠️ NOT SPECIFIED — confirm with RO",
    start: "Standing, both heels touching mark",
    special: ["NS paper target"],
    moving: "P2 → T1 (stays visible at rest)",
    magPlan: "Mag 1: 10  |  Mag 2: 2. P1 is scoring — P2 activates T1. Do not mix them up.",
    order: [
      "Shoot P1 (scoring) = 1 rd",
      "Shoot P2 → activates T1 = 1 rd",
      "Engage 5 scoring papers (2 rds each = 10 rds)",
      "RELOAD #1",
      "Engage T1 mover (visible at rest) = 2 rds",
      "AVOID NS paper target"
    ],
    alerts: [
      "P2 activates T1 — not P1, do not confuse",
      "NS paper target — confirm exact position"
    ],
    tags: ["moving"]
  },
  {
    id: 20,
    rounds: 23, papers: 10, poppers: 3, plates: 0, ns: 3, reloads: 2,
    ready: "⚠️ NOT SPECIFIED — confirm with RO",
    start: "Standing anywhere (free choice)",
    special: ["3 NS paper targets"],
    moving: "None",
    magPlan: "Mag 1: 10  |  Mag 2: 10  |  Mag 3: 3. Three bays — free start choice.",
    order: [
      "Choose start position for best first array coverage",
      "Engage bay 1: papers + popper",
      "RELOAD #1",
      "Engage bay 2: papers + popper",
      "RELOAD #2",
      "Engage bay 3: papers + popper",
      "Confirm 3 NS targets avoided"
    ],
    alerts: [
      "3 NS paper targets — same risk as Stage 17",
      "23 rounds = 3 magazines",
      "Free start — use it wisely"
    ],
    tags: ["long","reload3"]
  },
  {
    id: 21,
    rounds: 24, papers: 11, poppers: 2, plates: 0, ns: 2, reloads: 2,
    ready: "⚠️ NOT SPECIFIED — confirm with RO",
    start: "Standing, both heels touching mark",
    special: ["2 NS targets"],
    moving: "None",
    magPlan: "Mag 1: 10  |  Mag 2: 10  |  Mag 3: 4. Overlapping bay layout.",
    order: [
      "Engage first bay papers + popper",
      "RELOAD #1 at slide lock",
      "Engage second bay papers + popper",
      "RELOAD #2",
      "Engage remaining papers",
      "Confirm 2 NS targets not engaged"
    ],
    alerts: [
      "2 NS paper targets — confirm positions",
      "24 rounds = 3 magazines Classic"
    ],
    tags: ["long","reload3"]
  },
  {
    id: 22,
    rounds: 30, papers: 15, poppers: 0, plates: 0, ns: 2, reloads: 2,
    ready: "⚠️ NOT SPECIFIED — confirm with RO",
    start: "Holding bull's horns prop with both hands",
    special: ["Unique start — both hands on bull's horns prop", "Wide lateral stage"],
    moving: "None",
    magPlan: "Mag 1: 10  |  Mag 2: 10  |  Mag 3: 10. Three full mags — wide bay layout.",
    order: [
      "On buzzer: release horns and draw",
      "Engage left bay papers (2 rds each)",
      "RELOAD #1",
      "Engage center papers",
      "RELOAD #2",
      "Engage right bay papers",
      "Avoid 2 NS targets throughout"
    ],
    alerts: [
      "Both hands on bull's horns at start — practice this draw",
      "30 rounds = 3 full magazines",
      "2 NS targets — confirm positions",
      "Wide stage — plan lateral movement"
    ],
    tags: ["special","long","reload3"]
  },
  {
    id: 23,
    rounds: 12, papers: 4, poppers: 2, plates: 2, ns: 2, reloads: 1,
    ready: "⚠️ NOT SPECIFIED — confirm with RO",
    start: "Standing, both heels touching mark",
    special: ["P1 mover DISAPPEARS — engage immediately", "2 NS metal plates"],
    moving: "P1 → T1 (DISAPPEARS after activation)  |  P2 → no mover",
    magPlan: "Mag 1: 10  |  Mag 2: 2. Shoot P1 and IMMEDIATELY engage T1 before it vanishes.",
    order: [
      "Shoot P1 → T1 appears — ENGAGE T1 INSTANTLY",
      "Shoot P2 popper",
      "Engage 4 scoring papers (2 rds each = 8 rds)",
      "RELOAD #1",
      "Engage 2 scoring metal plates",
      "AVOID 2 NS metal plates throughout"
    ],
    alerts: [
      "⚠️ T1 DISAPPEARS — no hesitation after P1 falls",
      "2 NS metal plates — identify exact positions in walk",
      "If T1 is missed before disappearing — points are gone"
    ],
    tags: ["special","moving"]
  },
  {
    id: 24,
    rounds: 9, papers: 3, poppers: 2, plates: 0, ns: 0, reloads: 0,
    ready: "Firearm loaded, lying flat in the box, all magazines on belt",
    start: "Sitting in boat, strong hand on engine joystick",
    special: ["WEAK HAND ONLY", "Strong hand holds joystick at start", "Firearm in box — not holster", "Most unusual start position in match"],
    moving: "P1 → T1 (stays visible)   |   P2 → T2 (stays visible)",
    magPlan: "9 rounds in one magazine. Pick up firearm with WEAK HAND. Strong hand stays on joystick.",
    order: [
      "On buzzer: pick up firearm from box — WEAK HAND",
      "Shoot P1 (weak hand) → activates T1",
      "Shoot P2 (weak hand) → activates T2",
      "Engage 3 scoring papers (min 1 hit each)",
      "Engage T1 and T2 at rest (weak hand)",
      "No reload needed — 9 rounds total"
    ],
    alerts: [
      "WEAK HAND ONLY — strong hand holds joystick at start",
      "Firearm in box — practice the seated weak-hand pickup",
      "Walk the boat stage carefully — unique terrain"
    ],
    tags: ["special","moving"]
  }
];
