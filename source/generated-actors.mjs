export const generatedActorDefinitions = [
  {
    id: "AoVActorKrask001",
    name: "Krask Venn",
    templateId: "20iCLIcHVHWZqvBg",
    cr: 2,
    hp: { value: 45, max: 45, formula: "6d8 + 18" },
    ac: 15,
    abilities: { str: 18, dex: 11, con: 16, int: 8, wis: 12, cha: 11 },
    biography: "<p><strong>Rustclaw Enforcer.</strong> A scarred, heavy-built Trandoshan veteran who serves as Ressik’s senior muscle and frontline intimidator. Krask dominates through direct violence and respects strength above loyalty.</p>",
    itemRenames: { "Shock Maul": "Vibro-ax", "Heavy Blaster": "Heavy Blaster Carbine", "Bellowing Threat": "Frontline Intimidator", Bodyguard: "Senior Enforcer" }
  },
  {
    id: "AoVActorNera0001",
    name: "Nera Vox",
    templateId: "xaclhcdT5TyhAMlV",
    cr: 0.5,
    hp: { value: 18, max: 18, formula: "4d8" },
    ac: 14,
    abilities: { str: 10, dex: 16, con: 12, int: 11, wis: 14, cha: 10 },
    biography: "<p><strong>Rustclaw Lookout.</strong> A wiry, sharp-eyed perimeter scout who watches rooftops, catwalks, and junk ridges. Nera survives by noticing danger first and relaying it before enemies reach the hideout.</p>",
    itemRenames: { "Light Blaster": "Battered Blaster Rifle", "Dirty Maneuver": "Perimeter Watch", "Gang Tactics": "Spotter’s Warning" }
  },
  {
    id: "AoVActorGorr0001",
    name: "Gorr Tal",
    templateId: "20iCLIcHVHWZqvBg",
    cr: 1,
    hp: { value: 36, max: 36, formula: "6d8 + 12" },
    ac: 14,
    abilities: { str: 17, dex: 10, con: 16, int: 8, wis: 11, cha: 9 },
    biography: "<p><strong>Rustclaw Bruiser.</strong> A broad Aqualish guard and debt collector who blocks doorways and lets his physical presence do the talking. Gorr is dependable muscle with little patience for negotiation.</p>",
    itemRenames: { "Heavy Blaster": "Heavy Blaster Pistol", "Bellowing Threat": "Doorway Menace", Bodyguard: "Immovable Guard" }
  },
  {
    id: "AoVActorVekis001",
    name: "Vekis Draal",
    templateId: "xaclhcdT5TyhAMlV",
    cr: 0.5,
    hp: { value: 22, max: 22, formula: "4d8 + 4" },
    ac: 13,
    abilities: { str: 10, dex: 14, con: 12, int: 16, wis: 12, cha: 9 },
    biography: "<p><strong>Rustclaw Mechanic.</strong> A lean Nikto technician who oversees stolen speeders, stripped vehicles, and coerced repairs. Vekis is impatient, mechanically gifted, and more concerned with machines than captives.</p>",
    itemRenames: { "Vibroknife": "Weighted Hydrospanner", "Dirty Maneuver": "Sabotage", "Gang Tactics": "Jury-Rigged Advantage" }
  },
  {
    id: "AoVActorYarra001",
    name: "Yarra Dekk",
    templateId: "l3JFZ0aZahnlv5OX",
    cr: 1,
    hp: { value: 24, max: 24, formula: "5d8 + 2" },
    ac: 13,
    abilities: { str: 9, dex: 13, con: 12, int: 15, wis: 14, cha: 14 },
    biography: "<p><strong>Rustclaw Quartermaster.</strong> A hard-faced organizer who controls loot, ammunition, rations, and prisoner property. Yarra’s authority comes from knowing what the gang owns and who owes it.</p>",
    itemRenames: { "Service Blaster": "Hold-out Blaster", "Mark As Suspect": "Inventory Control", "Issue Command": "Ration Leverage", "Imperial Authority": "Quartermaster’s Authority" }
  },
  {
    id: "AoVActorSorn0001",
    name: "Sorn Kesh",
    templateId: "l3JFZ0aZahnlv5OX",
    cr: 1,
    hp: { value: 30, max: 30, formula: "5d8 + 8" },
    ac: 14,
    abilities: { str: 11, dex: 14, con: 13, int: 14, wis: 15, cha: 16 },
    biography: "<p><strong>Rustclaw Interrogator and Handler.</strong> A weathered Weequay lieutenant whose patient, quiet manner makes threats more unsettling. Sorn questions captives, manages informants, and applies calculated pressure.</p>",
    itemRenames: { "Stun Baton": "Shock Baton", "Mark As Suspect": "Apply Pressure", "Issue Command": "Handler’s Order", "Imperial Authority": "Rustclaw Authority" }
  },
  {
    id: "AoVActorTikka001",
    name: "Tikka Bral",
    templateId: "xaclhcdT5TyhAMlV",
    cr: 0.25,
    hp: { value: 11, max: 11, formula: "2d8 + 2" },
    ac: 13,
    abilities: { str: 9, dex: 16, con: 12, int: 12, wis: 11, cha: 12 },
    biography: "<p><strong>Rustclaw Runner.</strong> A young, underfed messenger and thief who joined the gang to survive. Tikka is quick, nervous, opportunistic, and likely to flee or change sides when pressure rises.</p>",
    itemRenames: { "Light Blaster": "Hold-out Blaster", "Dirty Maneuver": "Slip Away", "Poor Morale": "Survival First" }
  },
  ...[
    ["AoVActorBXSC0001", "BX-Series Super Commando", "g9reSEqGK1ID9YYT"],
    ["AoVActorFJedi001", "Fallen Jedi", "xaclhcdT5TyhAMlV"],
    ["AoVActorJHunter1", "Jedi Hunter", "xaclhcdT5TyhAMlV"],
    ["AoVActorTesty001", "TESTY", "xaclhcdT5TyhAMlV"],
    ["AoVActorToven001", "Toven Rell", "xaclhcdT5TyhAMlV"],
    ["AoVActorTrogo001", "Trogo Bounty Hunter", "xaclhcdT5TyhAMlV"]
  ].map(([id, name, templateId]) => ({
    id,
    name,
    templateId,
    placeholder: true,
    biography: `<p><strong>Default placeholder Actor.</strong> No campaign statblock description was supplied for ${name}. Replace or customize this Actor before using it in a finalized encounter.</p>`
  }))
];

export const actorArtworkDefinitions = [
  ["IVG8XsGcbY3JtVHz", "Commander Voss.png", "commander-voss.png"],
  ["RXoLdtGV00z6dxTt", "Davik Renn.png", "davik-renn.png"],
  ["zdPrGvzoFH9rq1Ie", "Doctor Halden Vey.png", "doctor-halden-vey.png"],
  ["l3JFZ0aZahnlv5OX", "Imperial Investigator.png", "imperial-investigator.png"],
  ["g9reSEqGK1ID9YYT", "Imperial Security Droid.png", "imperial-security-droid.png"],
  ["oaOJSg6s2xEWWKnD", "Keelo Venn.png", "keelo-venn.png"],
  ["ym5vG10BPlnJvqxq", "Lieutenant Noll Harven.png", "lieutenant-noll-harven.png"],
  ["9QrTMNJRTA2W7S0X", "Mira Nesh.png", "mira-nesh.png"],
  ["1bzV6DO0kf6CsfkR", "Orra Pell.png", "orra-pell.png"],
  ["I8CQenDTnm6l7rnT", "Pavo Nesh.png", "pavo-nesh.png"],
  ["WiUcetQQtQd8bHPI", "Ressik.png", "ressik.png"],
  ["20iCLIcHVHWZqvBg", "Rustclaw Bruiser.png", "rustclaw-bruiser.png"],
  ["xaclhcdT5TyhAMlV", "Rustclaw Fighter.png", "rustclaw-fighter.png"],
  ["qq0tzc3QOueOfpFk", "Sella Vorn.png", "sella-vorn.png"],
  ["h4dL6k5jK0a1jsQK", "Tensin Black.png", "tensin-black.png"],
  ["SFeQoXE5sQZxcHwZ", "Tovan Rell.png", "tovan-rell.png"],
  ["AoVActorKrask001", "Krask, Rustclaw Enforcer.png", "krask-venn.png"],
  ["AoVActorNera0001", "Nera Vox, Rustclaw Lookout.png", "nera-vox.png"],
  ["AoVActorGorr0001", "Gorr Taal, Rustclaw Bruiser.png", "gorr-tal.png"],
  ["AoVActorVekis001", "Vekis Draal, Rustclaw Mechanic.png", "vekis-draal.png"],
  ["AoVActorYarra001", "Yarra Dekk, Rustclaw Quartermaster.png", "yarra-dekk.png"],
  ["AoVActorSorn0001", "Sorn Kesh, Rustclaw Interrogator-Handler.png", "sorn-kesh.png"],
  ["AoVActorTikka001", "Tikka Bral, Rustclaw Runner.png", "tikka-bral.png"],
  ["AoVActorBXSC0001", "BX-Series_Super_Commando.webp", "bx-series-super-commando.webp"],
  ["AoVActorFJedi001", "Fallen Jedi.png", "fallen-jedi.png"],
  ["AoVActorJHunter1", "Jedi Hunter.png", "jedi-hunter.png"],
  ["AoVActorTesty001", "TESTY.jpg", "testy.jpg"],
  ["AoVActorToven001", "Toven Rell.png", "toven-rell.png"],
  ["AoVActorTrogo001", "Trogo Bounty Hunter.png", "trogo-bounty-hunter.png"]
].map(([actorId, sourceFile, targetFile, tokenSourceFile = null, tokenTargetFile = null]) => ({
  actorId,
  sourceFile,
  targetFile,
  tokenSourceFile,
  tokenTargetFile
}));
