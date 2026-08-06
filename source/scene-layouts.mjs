// Token staging data for the current DungeonDraft-style maps.
// Legacy traced geometry remains only as reference; the build intentionally
// emits no Scene wall documents so the GM can configure walls manually.

const ACTORS = {
  bruiser: "20iCLIcHVHWZqvBg",
  commanderVoss: "IVG8XsGcbY3JtVHz",
  davik: "RXoLdtGV00z6dxTt",
  doctorVey: "zdPrGvzoFH9rq1Ie",
  investigator: "l3JFZ0aZahnlv5OX",
  keelo: "oaOJSg6s2xEWWKnD",
  mira: "9QrTMNJRTA2W7S0X",
  orra: "1bzV6DO0kf6CsfkR",
  pavo: "I8CQenDTnm6l7rnT",
  probeDroid: "RNFfvtHCPKqJuWym",
  ressik: "WiUcetQQtQd8bHPI",
  scoutTrooper: "aplddsjBsAo67S7v",
  securityDroid: "g9reSEqGK1ID9YYT",
  sella: "qq0tzc3QOueOfpFk",
  tensin: "h4dL6k5jK0a1jsQK",
  tovan: "SFeQoXE5sQZxcHwZ",
  trooper: "2aBLkMcb9CKbRBP4",
  fighter: "xaclhcdT5TyhAMlV",
  lieutenantHarven: "ym5vG10BPlnJvqxq"
};

const c = (...coordinates) => coordinates;
const rect = (x1, y1, x2, y2) => c(x1, y1, x2, y1, x2, y2, x1, y2, x1, y1);
const token = (actorId, x, y, options = {}) => ({ actorId, x, y, ...options });

export const officialEncounterActorIds = new Set([
  ACTORS.trooper,
  ACTORS.scoutTrooper,
  ACTORS.probeDroid
]);

export const sceneLayouts = {
  "01-brackens-point-landing-yard.png": {
    solid: [
      c(106, 74, 590, 74), c(858, 74, 1342, 74),
      c(106, 74, 106, 1015, 615, 1015), c(833, 1015, 1342, 1015, 1342, 74),
      rect(263, 105, 444, 336), rect(1071, 98, 1208, 442),
      rect(211, 418, 399, 958), rect(1048, 558, 1229, 911),
      c(566, 151, 650, 117, 798, 117, 881, 151),
      c(567, 934, 635, 889), c(813, 889, 881, 934)
    ],
    doors: [
      c(319, 336, 390, 336), c(1071, 334, 1071, 404),
      c(399, 575, 399, 650), c(1102, 911, 1175, 911),
      c(615, 1015, 833, 1015)
    ],
    windows: [
      c(263, 155, 263, 220), c(444, 155, 444, 220),
      c(1071, 165, 1071, 240), c(1208, 165, 1208, 240),
      c(211, 495, 211, 585), c(399, 710, 399, 805), c(1048, 650, 1048, 735)
    ],
    barriers: [
      c(548, 253, 589, 196, 650, 180), c(798, 180, 859, 196, 900, 253),
      c(548, 575, 590, 632, 650, 650), c(798, 650, 858, 632, 900, 575)
    ],
    tokens: [
      token(ACTORS.lieutenantHarven, 1050, 216, { disposition: 0 }),
      token(ACTORS.trooper, 1110, 450), token(ACTORS.trooper, 1255, 455),
      token(ACTORS.investigator, 215, 220, { hidden: true }),
      token(ACTORS.securityDroid, 820, 845, { hidden: true }),
      token(ACTORS.tensin, 470, 845, { disposition: 1, hidden: true })
    ]
  },

  "02-bent-spanner-cantina.png": {
    solid: [
      c(88, 68, 1323, 68, 1323, 1040, 88, 1040, 88, 68),
      c(88, 237, 335, 237), c(88, 404, 335, 404), c(88, 571, 335, 571),
      c(88, 722, 335, 722), c(1007, 68, 1007, 1040),
      c(1128, 68, 1128, 1040), c(1007, 284, 1323, 284), c(1007, 520, 1323, 520),
      c(1007, 746, 1323, 746), c(335, 68, 335, 1040),
      rect(414, 579, 565, 765), rect(744, 842, 979, 1040)
    ],
    doors: [
      c(635, 68, 779, 68), c(658, 1040, 803, 1040),
      c(335, 143, 335, 203), c(335, 310, 335, 370), c(335, 477, 335, 537), c(335, 627, 335, 687), c(335, 846, 335, 906),
      c(1007, 170, 1007, 230), c(1007, 358, 1007, 418), c(1007, 590, 1007, 650), c(1007, 860, 1007, 920),
      c(1128, 360, 1128, 420), c(1128, 594, 1128, 654), c(1128, 815, 1128, 875),
      c(465, 765, 525, 765), c(810, 842, 880, 842)
    ],
    windows: [
      c(165, 68, 270, 68), c(475, 68, 565, 68), c(845, 68, 940, 68),
      c(88, 714, 88, 806), c(1323, 334, 1323, 430), c(1323, 815, 1323, 910)
    ],
    tokens: [
      token(ACTORS.tensin, 770, 465, { disposition: 1 }),
      token(ACTORS.sella, 430, 745, { disposition: 0, hidden: true }),
      token(ACTORS.bruiser, 245, 875, { hidden: true }),
      token(ACTORS.fighter, 920, 540, { hidden: true }),
      token(ACTORS.fighter, 1160, 640, { hidden: true })
    ]
  },

  "03-compressor-station-scrapyard.png": {
    solid: [
      c(58, 25, 1382, 25), c(58, 25, 58, 1080, 550, 1080),
      c(858, 1080, 1382, 1080, 1382, 25),
      rect(343, 286, 997, 808), c(343, 651, 997, 651), c(704, 286, 704, 808),
      c(704, 470, 997, 470)
    ],
    doors: [
      c(550, 1080, 858, 1080), c(568, 808, 712, 808),
      c(704, 384, 704, 454), c(704, 548, 704, 618),
      c(428, 651, 498, 651), c(813, 651, 883, 651)
    ],
    windows: [
      c(420, 286, 535, 286), c(790, 286, 905, 286),
      c(343, 400, 343, 495), c(997, 515, 997, 610)
    ],
    barriers: [c(250, 235, 500, 235), c(1040, 360, 1255, 360)],
    tokens: [
      token(ACTORS.keelo, 760, 405, { disposition: 0 }),
      token(ACTORS.fighter, 460, 600), token(ACTORS.fighter, 810, 620),
      token(ACTORS.fighter, 1130, 835, { hidden: true }),
      token(ACTORS.pavo, 620, 850, { disposition: 0, hidden: true })
    ]
  },

  "04-ressiks-rustclaw-hideout.png": {
    solid: [
      c(71, 20, 716, 20), c(716, 20, 716, 115), c(716, 115, 694, 135),
      c(694, 135, 694, 650, 727, 682, 997, 682, 997, 144, 970, 115),
      c(970, 115, 970, 20), c(970, 20, 1050, 20), c(1220, 20, 1376, 20, 1376, 1048),
      c(1376, 1048, 810, 1048), c(636, 1048, 71, 1048, 71, 20),
      rect(170, 344, 574, 785), c(170, 560, 574, 560),
      rect(965, 145, 1318, 336), rect(963, 369, 1320, 537), c(1030, 369, 1030, 537),
      c(1100, 369, 1100, 537), c(1170, 369, 1170, 537), c(1240, 369, 1240, 537),
      rect(948, 619, 1254, 887), c(1138, 619, 1138, 887),
      rect(652, 759, 895, 994), rect(975, 915, 1324, 1038)
    ],
    doors: [
      c(636, 1048, 810, 1048), c(1050, 20, 1220, 20),
      c(278, 560, 345, 560), c(451, 560, 518, 560), c(574, 435, 574, 502),
      c(1095, 336, 1165, 336), c(995, 537, 1055, 537), c(1065, 537, 1125, 537),
      c(1135, 537, 1195, 537), c(1205, 537, 1265, 537), c(1040, 619, 1110, 619),
      c(1138, 730, 1138, 800), c(735, 759, 805, 759)
    ],
    windows: [c(235, 344, 330, 344), c(430, 344, 525, 344), c(1015, 145, 1120, 145), c(1190, 145, 1285, 145)],
    barriers: [c(998, 545, 1320, 545)],
    tokens: [
      token(ACTORS.ressik, 815, 420), token(ACTORS.bruiser, 1060, 690), token(ACTORS.bruiser, 1180, 720),
      token(ACTORS.fighter, 350, 420), token(ACTORS.fighter, 500, 680), token(ACTORS.fighter, 1030, 435),
      token(ACTORS.fighter, 1180, 435), token(ACTORS.fighter, 760, 855),
      token(ACTORS.keelo, 520, 835, { disposition: 0, hidden: true }),
      token(ACTORS.pavo, 400, 900, { disposition: 0, hidden: true })
    ]
  },

  "05-southern-cut-checkpoint.png": {
    solid: [
      rect(970, 285, 1360, 775), c(970, 485, 1360, 485), c(1163, 285, 1163, 775),
      rect(720, 388, 965, 674)
    ],
    doors: [
      c(1080, 775, 1160, 775), c(970, 386, 970, 456), c(1163, 380, 1163, 450),
      c(1163, 565, 1163, 635), c(805, 674, 880, 674)
    ],
    windows: [c(1035, 285, 1120, 285), c(1225, 285, 1315, 285), c(1360, 340, 1360, 430)],
    barriers: [c(489, 260, 835, 340), c(429, 642, 800, 705)],
    terrain: [
      c(0, 0, 275, 65, 390, 190, 450, 330), c(0, 971, 270, 900, 390, 790),
      c(1619, 0, 1510, 120, 1460, 255), c(1619, 971, 1490, 835, 1435, 710)
    ],
    tokens: [
      token(ACTORS.lieutenantHarven, 1070, 420, { disposition: 0 }),
      token(ACTORS.trooper, 790, 470), token(ACTORS.trooper, 745, 620),
      token(ACTORS.scoutTrooper, 250, 175, { hidden: true }),
      token(ACTORS.scoutTrooper, 225, 735, { hidden: true }),
      token(ACTORS.probeDroid, 1420, 210, { elevation: 20, hidden: true }),
      token(ACTORS.investigator, 1260, 590, { hidden: true })
    ]
  },

  "06-daviks-reclamation-yard.png": {
    solid: [
      c(135, 12, 135, 1048, 540, 1048), c(838, 1048, 1350, 1048, 1350, 12, 135, 12),
      rect(185, 52, 472, 325), rect(183, 370, 470, 642), rect(190, 682, 388, 904),
      rect(895, 40, 1075, 340), rect(1090, 48, 1304, 250), rect(1080, 282, 1308, 462),
      rect(1075, 485, 1305, 655), rect(884, 520, 1062, 770), rect(1080, 668, 1305, 885),
      rect(962, 823, 1080, 1038), rect(1142, 858, 1308, 1038)
    ],
    doors: [
      c(540, 1048, 838, 1048), c(265, 325, 340, 325), c(265, 642, 340, 642), c(255, 682, 325, 682),
      c(895, 255, 895, 325), c(1145, 250, 1220, 250), c(1145, 462, 1220, 462),
      c(1140, 485, 1215, 485), c(1062, 615, 1062, 685), c(1145, 668, 1220, 668),
      c(990, 823, 1060, 823)
    ],
    windows: [c(250, 52, 360, 52), c(183, 450, 183, 545), c(1090, 100, 1090, 190), c(1308, 335, 1308, 420)],
    tokens: [
      token(ACTORS.davik, 270, 765, { disposition: 1 }), token(ACTORS.tensin, 1170, 365, { disposition: 1 }),
      token(ACTORS.pavo, 1020, 605, { disposition: 1 }), token(ACTORS.keelo, 335, 175, { disposition: 0, hidden: true }),
      token(ACTORS.fighter, 560, 500, { hidden: true }), token(ACTORS.fighter, 820, 410, { hidden: true }),
      token(ACTORS.fighter, 920, 850, { hidden: true })
    ]
  },

  "07-hidden-stargazer-hangar.png": {
    solid: [
      c(12, 12, 1436, 12, 1436, 1074, 12, 1074, 12, 12),
      rect(22, 28, 278, 258), rect(315, 28, 503, 258), rect(891, 28, 1128, 258), rect(1165, 28, 1425, 258),
      rect(24, 287, 160, 470), rect(24, 520, 160, 690), rect(24, 742, 160, 854),
      rect(1288, 287, 1425, 465), rect(1288, 510, 1425, 690), rect(1288, 735, 1425, 854),
      rect(25, 866, 285, 1065), rect(315, 866, 530, 1065), rect(820, 866, 1082, 1065), rect(1112, 866, 1425, 1065)
    ],
    doors: [
      c(646, 12, 802, 12), c(646, 1074, 802, 1074),
      c(105, 258, 180, 258), c(370, 258, 445, 258), c(965, 258, 1040, 258), c(1230, 258, 1305, 258),
      c(160, 342, 160, 412), c(1288, 342, 1288, 412), c(100, 866, 175, 866),
      c(390, 866, 465, 866), c(900, 866, 975, 866), c(1200, 866, 1275, 866)
    ],
    windows: [c(70, 28, 170, 28), c(1225, 28, 1325, 28), c(65, 1065, 180, 1065), c(1235, 1065, 1350, 1065)],
    barriers: [
      c(205, 400, 340, 330, 560, 300, 865, 300, 1105, 330, 1240, 400),
      c(1240, 685, 1110, 755, 865, 785, 565, 785, 335, 755, 205, 685),
      c(245, 520, 330, 410, 500, 360, 724, 350, 947, 365, 1120, 415, 1200, 520),
      c(1200, 580, 1120, 680, 947, 725, 724, 740, 500, 720, 330, 675, 245, 580)
    ],
    tokens: [
      token(ACTORS.davik, 420, 930, { disposition: 1 }), token(ACTORS.tovan, 930, 930, { disposition: 1, hidden: true }),
      token(ACTORS.keelo, 275, 600, { disposition: 0, hidden: true }), token(ACTORS.pavo, 1120, 590, { disposition: 0, hidden: true }),
      token(ACTORS.fighter, 95, 580, { hidden: true }), token(ACTORS.fighter, 1320, 580, { hidden: true })
    ]
  },

  "08-crashed-transport-site.png": {
    solid: [
      c(210, 560, 254, 424, 375, 319, 565, 214, 795, 105, 1035, 105, 1130, 190),
      c(1130, 190, 1110, 316, 975, 407, 799, 515, 612, 628, 410, 673, 264, 646, 210, 560)
    ],
    terrain: [
      c(0, 0, 248, 50, 332, 160), c(0, 770, 155, 690, 270, 700),
      c(0, 1127, 300, 1015, 405, 905), c(1396, 0, 1180, 70, 1100, 145),
      c(1396, 500, 1260, 455, 1180, 520), c(1396, 1127, 1120, 1030, 1015, 900),
      c(690, 1127, 705, 980, 790, 875, 940, 820)
    ],
    tokens: [
      token(ACTORS.investigator, 450, 535, { hidden: true }), token(ACTORS.probeDroid, 510, 720, { elevation: 20, hidden: true }),
      token(ACTORS.trooper, 300, 760, { hidden: true }), token(ACTORS.trooper, 1035, 635, { hidden: true })
    ]
  },

  "09-broken-beacon-site.png": {
    terrain: [
      c(0, 0, 330, 0, 450, 130, 455, 350, 390, 470),
      c(0, 1190, 370, 1190, 485, 1045, 500, 850, 450, 690),
      c(1322, 0, 930, 0, 845, 145, 820, 305),
      c(1322, 1190, 995, 1190, 905, 1040, 890, 870),
      c(390, 470, 530, 405, 655, 420, 710, 520),
      c(450, 690, 565, 615, 700, 625, 760, 730),
      c(820, 305, 745, 420, 710, 520), c(890, 870, 810, 790, 760, 730)
    ],
    barriers: [rect(487, 1004, 720, 1155)],
    tokens: [
      token(ACTORS.tovan, 245, 240, { disposition: 0, hidden: true }),
      token(ACTORS.probeDroid, 1010, 250, { elevation: 20, hidden: true }),
      token(ACTORS.investigator, 715, 475, { hidden: true }), token(ACTORS.trooper, 860, 560, { hidden: true })
    ]
  },

  "10-tovan-rells-hidden-refuge.png": {
    solid: [
      rect(245, 151, 535, 407), rect(566, 166, 854, 410), rect(940, 145, 1198, 408),
      rect(225, 442, 520, 716), rect(565, 462, 882, 652), rect(945, 438, 1215, 675),
      rect(228, 735, 523, 924), rect(610, 692, 930, 947)
    ],
    doors: [
      c(535, 270, 535, 340), c(650, 410, 720, 410), c(1030, 408, 1100, 408),
      c(335, 716, 405, 716), c(520, 535, 520, 605), c(675, 462, 745, 462), c(675, 652, 745, 652),
      c(945, 535, 945, 605), c(1040, 675, 1110, 675), c(335, 735, 405, 735), c(715, 692, 785, 692)
    ],
    secretDoors: [c(375, 924, 445, 924), c(335, 151, 425, 151)],
    windows: [c(245, 220, 245, 300), c(1198, 220, 1198, 300), c(225, 510, 225, 600), c(1215, 500, 1215, 590)],
    terrain: [
      c(0, 70, 200, 45, 360, 80), c(0, 1040, 205, 1010, 335, 950),
      c(1409, 60, 1230, 40, 1100, 90), c(1409, 1040, 1225, 990, 1115, 930)
    ],
    tokens: [
      token(ACTORS.tovan, 720, 535, { disposition: 1 }), token(ACTORS.orra, 335, 820, { disposition: 1, hidden: true }),
      token(ACTORS.investigator, 1040, 810, { hidden: true }), token(ACTORS.trooper, 1120, 790, { hidden: true }),
      token(ACTORS.trooper, 1185, 840, { hidden: true }), token(ACTORS.probeDroid, 1260, 690, { elevation: 20, hidden: true })
    ]
  },

  "11-prisoner-transfer-ambush.png": {
    solid: [rect(145, 42, 390, 315), rect(420, 55, 665, 310)],
    doors: [c(235, 315, 305, 315), c(505, 310, 575, 310)],
    barriers: [c(1050, 260, 1050, 690), c(1015, 260, 1085, 260), c(1015, 690, 1085, 690)],
    terrain: [
      c(0, 650, 165, 590, 330, 610, 450, 760), c(0, 995, 250, 930, 390, 820),
      c(780, 0, 900, 100, 970, 250), c(1580, 0, 1400, 60, 1300, 210),
      c(1580, 995, 1390, 930, 1270, 800), c(720, 995, 780, 850, 900, 760)
    ],
    tokens: [
      token(ACTORS.investigator, 940, 410), token(ACTORS.securityDroid, 1020, 495),
      token(ACTORS.trooper, 820, 380), token(ACTORS.trooper, 1130, 425),
      token(ACTORS.tovan, 720, 520, { disposition: 0, hidden: true }),
      token(ACTORS.tensin, 365, 700, { disposition: 0, hidden: true }), token(ACTORS.keelo, 455, 760, { disposition: 0, hidden: true }),
      token(ACTORS.pavo, 1180, 720, { disposition: 0, hidden: true }), token(ACTORS.sella, 1260, 665, { disposition: 0, hidden: true })
    ]
  },

  "12-administration-square.png": {
    solid: [
      c(115, 20, 1318, 20, 1318, 1050, 115, 1050, 115, 20),
      rect(210, 115, 405, 466), rect(480, 65, 945, 310), rect(1050, 115, 1218, 465),
      rect(180, 555, 418, 870), rect(1015, 552, 1250, 900), c(710, 65, 710, 310)
    ],
    doors: [
      c(636, 1050, 796, 1050), c(285, 466, 355, 466), c(620, 310, 695, 310), c(1075, 465, 1145, 465),
      c(250, 555, 320, 555), c(1095, 552, 1165, 552), c(710, 160, 710, 230)
    ],
    windows: [
      c(250, 115, 355, 115), c(535, 65, 650, 65), c(780, 65, 895, 65), c(1090, 115, 1190, 115),
      c(180, 640, 180, 745), c(1250, 650, 1250, 760)
    ],
    barriers: [c(625, 470, 805, 470, 858, 525, 858, 680, 805, 735, 625, 735, 573, 680, 573, 525, 625, 470)],
    tokens: [
      token(ACTORS.commanderVoss, 805, 185, { hidden: true }), token(ACTORS.lieutenantHarven, 585, 185, { disposition: 0, hidden: true }),
      token(ACTORS.investigator, 690, 400), token(ACTORS.securityDroid, 760, 400),
      token(ACTORS.trooper, 525, 425), token(ACTORS.trooper, 900, 425), token(ACTORS.trooper, 1130, 700, { hidden: true }),
      token(ACTORS.tovan, 1080, 760, { disposition: 0, hidden: true })
    ]
  },

  "13-workers-blocks.png": {
    solid: [
      c(0, 0, 1448, 0), c(0, 1086, 1448, 1086),
      c(75, 250, 75, 55, 315, 55, 315, 150), c(158, 250, 75, 250),
      c(360, 255, 360, 70, 615, 70, 615, 185), c(450, 255, 360, 255),
      c(695, 260, 695, 60, 960, 60, 960, 175), c(780, 260, 695, 260),
      c(1130, 180, 1130, 45, 1370, 45, 1370, 260, 1285, 260),
      c(75, 730, 75, 1020, 300, 1020, 300, 900), c(75, 730, 155, 730),
      c(365, 790, 365, 720, 610, 720, 610, 965, 520, 965),
      c(690, 820, 690, 730, 930, 730, 930, 965, 840, 965),
      c(1110, 800, 1110, 720, 1368, 720, 1368, 1025, 1275, 1025)
    ],
    doors: [],
    barriers: [
      c(365, 335, 1060, 335), c(350, 610, 1080, 610),
      c(95, 395, 220, 340), c(1170, 355, 1350, 430), c(105, 650, 270, 600), c(1165, 645, 1360, 590)
    ],
    tokens: [
      token(ACTORS.mira, 650, 500, { disposition: 1 }), token(ACTORS.pavo, 760, 535, { disposition: 1 }),
      token(ACTORS.sella, 540, 575, { disposition: 1, hidden: true }), token(ACTORS.orra, 860, 570, { disposition: 1, hidden: true }),
      token(ACTORS.investigator, 1180, 465, { hidden: true }), token(ACTORS.trooper, 1245, 530, { hidden: true }),
      token(ACTORS.securityDroid, 1110, 570, { hidden: true })
    ]
  },

  "14-market-row-during-purge.png": {
    solid: [
      c(0, 180, 330, 180, 330, 0), c(360, 0, 360, 185, 525, 185),
      c(770, 0, 770, 185, 1120, 185, 1120, 0), c(1265, 0, 1265, 230, 1448, 230),
      c(0, 770, 265, 770, 265, 1086), c(330, 1086, 330, 720, 610, 720, 610, 900),
      c(735, 910, 735, 725, 1035, 725, 1035, 1086), c(1175, 1086, 1175, 760, 1448, 760)
    ],
    barriers: [
      c(390, 235, 1040, 235), c(405, 540, 1045, 540),
      c(345, 615, 1080, 615), c(85, 310, 250, 375), c(1190, 300, 1360, 390)
    ],
    tokens: [
      token(ACTORS.sella, 700, 455, { disposition: 1 }), token(ACTORS.tensin, 555, 680, { disposition: 0, hidden: true }),
      token(ACTORS.keelo, 820, 680, { disposition: 0, hidden: true }), token(ACTORS.investigator, 1080, 450, { hidden: true }),
      token(ACTORS.trooper, 1160, 510, { hidden: true }), token(ACTORS.trooper, 1010, 545, { hidden: true }),
      token(ACTORS.securityDroid, 1240, 590, { hidden: true })
    ]
  },

  "15-stargazer-hangar-finale-damaged.png": {
    solid: [
      c(75, 18, 1373, 18, 1373, 1060, 75, 1060, 75, 18),
      rect(75, 790, 370, 1060), c(370, 790, 500, 790), c(948, 790, 1070, 790),
      rect(1070, 790, 1373, 1060)
    ],
    doors: [c(650, 1060, 800, 1060), c(1170, 790, 1240, 790)],
    barriers: [
      c(300, 420, 390, 345, 570, 315, 875, 315, 1055, 345, 1148, 420),
      c(1148, 625, 1050, 690, 865, 720, 575, 720, 390, 690, 300, 625),
      c(320, 500, 430, 395, 650, 365, 845, 365, 1075, 410, 1125, 500),
      c(1125, 560, 1040, 650, 835, 680, 625, 680, 430, 645, 320, 560),
      rect(1180, 865, 1340, 1035)
    ],
    terrain: [c(570, 18, 640, 115, 724, 155, 815, 110, 875, 18)],
    tokens: [
      token(ACTORS.commanderVoss, 720, 800), token(ACTORS.securityDroid, 810, 760),
      token(ACTORS.trooper, 610, 750), token(ACTORS.trooper, 910, 735), token(ACTORS.trooper, 1030, 820, { hidden: true }),
      token(ACTORS.davik, 505, 845, { disposition: 1 }), token(ACTORS.tovan, 420, 760, { disposition: 1, hidden: true }),
      token(ACTORS.keelo, 320, 690, { disposition: 1, hidden: true }), token(ACTORS.pavo, 1110, 690, { disposition: 1, hidden: true }),
      token(ACTORS.sella, 1190, 735, { disposition: 1, hidden: true }), token(ACTORS.doctorVey, 250, 850, { disposition: 1, hidden: true })
    ]
  },

  "16-doctor-veys-clinic.png": {
    tokens: [
      token(ACTORS.doctorVey, 276, 250, { disposition: 0 }),
      token(ACTORS.fighter, 1192, 620, { hidden: true }),
      token(ACTORS.fighter, 1266, 739, { hidden: true }),
      token(ACTORS.investigator, 706, 445, { hidden: true }),
      token(ACTORS.trooper, 769, 445, { hidden: true }),
      token(ACTORS.trooper, 641, 445, { hidden: true })
    ]
  },

  "17-desert-shrine.png": {
    tokens: [
      token(ACTORS.orra, 685, 862, { disposition: 1 }),
      token(ACTORS.tovan, 960, 254, { hidden: true, disposition: 0 })
    ]
  },

  "18-brackens-point-town-encounter.png": {
    tokens: []
  }
};
