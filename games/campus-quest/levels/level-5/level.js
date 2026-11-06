/** Campus Quest Level 5: photo-style scene. All polygons are in the native 1672x941 coordinate space. */
const level5 = {
  id: 5,
  gameTitle: "Sheridan Campus Quest",
  roomName: "Student Life Adventure",
  mission:
    "Explore the student commons, decode six clues about campus life and find the right places or belongings.",
  tip: "Look at the tables, recreation corner and wall signs. Each adventure chooses six of eleven targets.",
  settings: {
    timer: true,
    questions: false,
    audio: false,
    scoring: true,
    randomizeObjects: true,
    randomClueCount: 6,
  },
  scoring: {
    maxScore: 100,
    wrongClickPenalty: 5,
    maxTimePenalty: 20,
    chancesPerClue: 3,
  },
  timer: { durationSeconds: 300, perfectTimeSeconds: 180 },
  room: {
    width: 1672,
    height: 941,
    backgroundUrl: new URL(
      "../../assets/images/levels/level-5/background.png",
      import.meta.url,
    ).href,
  },
  completion: {
    title: "Student Life Adventure Complete!",
    prompt: "QUEST COMPLETE",
    message:
      "You explored the student commons. Replay to find another combination of campus-life clues.",
  },
  steps: [
    {
      id: "foosball",
      prompt: "FIND THE OBJECT",
      hint: "Find the recreational table game with rows of miniature football players.",
      helpHint: "Look across the lower-left foreground of the student commons.",
      foundLabel: "Foosball Table",
      title: "Foosball Table found!",
      story:
        "Correct! Shared games can give students a fun way to relax between classes.",
      clueType: "text",
    },
    {
      id: "water-bottle",
      prompt: "FIND THE OBJECT",
      hint: "Find the tall blue reusable bottle on the front study table.",
      helpHint: "Look at the middle-right foreground, next to the notebook.",
      foundLabel: "Blue Water Bottle",
      title: "Blue Water Bottle found!",
      story:
        "Correct! Staying hydrated matters whether a student is studying or relaxing.",
      clueType: "text",
    },
    {
      id: "laptop",
      prompt: "FIND THE OBJECT",
      hint: "Find the silver portable computer open on the front-right table.",
      helpHint: "Look at the large screen on the far-right foreground table.",
      foundLabel: "Open Laptop",
      title: "Open Laptop found!",
      story:
        "Correct! Portable computers make campus group work and independent study easier.",
      clueType: "text",
    },
    {
      id: "notebooks",
      prompt: "FIND THE OBJECT",
      hint: "Find the pair of spiral-bound notebooks stacked beside the open computer.",
      helpHint:
        "Look on the foreground table directly to the right of the blue water bottle.",
      foundLabel: "Stacked Notebooks",
      title: "Stacked Notebooks found!",
      story:
        "Correct! Notebooks let students capture ideas even when they are away from their devices.",
      clueType: "text",
    },
    {
      id: "student-id",
      prompt: "FIND THE OBJECT",
      hint: "Find the small identification card near the front edge of the table.",
      helpHint: "Look at the bottom-right corner of the foreground table.",
      foundLabel: "Student ID Card",
      title: "Student ID Card found!",
      story:
        "Correct! A student ID is one way to identify a member of a college community.",
      clueType: "text",
    },
    {
      id: "backpack",
      prompt: "FIND THE OBJECT",
      hint: "Find the black bag placed on a chair near the front table.",
      helpHint: "Look just behind the open laptop on the right side.",
      foundLabel: "Black Backpack",
      title: "Black Backpack found!",
      story:
        "Correct! Backpacks can carry class supplies, chargers and personal belongings.",
      clueType: "text",
    },
    {
      id: "menu-screens",
      prompt: "FIND THE OBJECT",
      hint: "Find the glowing screens showing items available at the food counter.",
      helpHint: "Look high above the service counter in the back of the scene.",
      foundLabel: "Cafe Menu Screens",
      title: "Cafe Menu Screens found!",
      story: "Correct! Menu displays can help visitors choose food and drinks.",
      clueType: "text",
    },
    {
      id: "student-services-sign",
      prompt: "FIND THE OBJECT",
      hint: "Find the wall sign showing the direction of student support services.",
      helpHint: "Look along the white wall at the upper-right of the scene.",
      foundLabel: "Student Services Sign",
      title: "Student Services Sign found!",
      story:
        "Correct! Knowing where to find student services can help visitors access campus support.",
      clueType: "text",
    },
    {
      id: "cafeteria-sign",
      prompt: "FIND THE OBJECT",
      hint: "Find the sign pointing visitors toward the cafeteria.",
      helpHint: "Look near the very top of the right-hand wall.",
      foundLabel: "Cafeteria Sign",
      title: "Cafeteria Sign found!",
      story:
        "Correct! Directional signs help students find food and shared facilities.",
      clueType: "text",
    },
    {
      id: "potted-plant",
      prompt: "FIND THE OBJECT",
      hint: "Find the tall green plant growing beside the windows at the left.",
      helpHint:
        "Look against the wall of windows in the far-left part of the commons.",
      foundLabel: "Large Potted Plant",
      title: "Large Potted Plant found!",
      story:
        "Correct! Indoor plants can bring a natural touch to shared student spaces.",
      clueType: "text",
    },
    {
      id: "ottoman",
      prompt: "FIND THE OBJECT",
      hint: "Find the low round upholstered seat in front of the sofas.",
      helpHint:
        "Look near the centre-left of the commons, just behind the recreation game.",
      foundLabel: "Round Lounge Ottoman",
      title: "Round Lounge Ottoman found!",
      story:
        "Correct! Ottomans give lounge areas flexible seating and places to rest.",
      clueType: "text",
    },
  ],

  hotspots: [
    // 1. Foosball — playing area, cabinet and visible leg
    {
      type: "polygon",
      object: "foosball",
      points:
        "14,525 50,521 300,513 333,513 363,526 404,543 470,577 531,610 598,643 636,657 652,671 649,680 622,694 555,700 488,707 370,721 224,735 14,747",
    },
    {
      type: "polygon",
      object: "foosball",
      points:
        "14,748 133,741 238,734 370,720 498,708 625,694 651,684 650,846 638,858 583,872 520,882 435,893 337,904 221,920 14,940",
    },
    {
      type: "polygon",
      object: "foosball",
      points: "523,877 615,870 615,941 548,941",
    },

    // 2. Water bottle — cap, body and side handle

    {
      type: "polygon",
      object: "water-bottle",
      points:
        "952,535 958,530 970,526 1017,526 1033,530 1040,535 1040,552 1035,560 962,560 952,551",
    },
    {
      type: "polygon",
      object: "water-bottle",
      points:
        "961,557 1036,557 1046,566 1056,578 1060,589 1060,792 1057,806 1044,815 966,815 953,809 948,795 948,587 952,574",
    },
    {
      type: "polygon",
      object: "water-bottle",
      points:
        "938,536 947,531 955,534 956,545 948,549 945,558 940,586 938,612 941,615 950,614 950,627 937,627 930,618 930,582 932,550",
    },

    // 3. Laptop — screen and visible keyboard/base
    {
      type: "polygon",
      object: "laptop",
      points:
        "1447,545 1671,518 1671,693 1603,779 1576,790 1373,800 1357,794 1361,771 1372,743 1390,689 1409,625 1428,561",
    },
    {
      type: "polygon",
      object: "laptop",
      points:
        "1175,741 1322,718 1385,704 1395,713 1387,743 1368,776 1360,794 1343,799 1310,788 1269,780 1222,770 1172,757 1167,749",
    },

    // 4. Stacked notebooks

    {
      type: "polygon",
      object: "notebooks",
      // Upper notebook and spiral binding
      points:
        "1067,784 1101,778 1140,769 1177,762 1209,770 1251,780 1297,792 1311,800 1311,817 1295,828 1257,836 1223,843 1182,833 1136,823 1090,810 1066,801",
    },
    {
      type: "polygon",
      object: "notebooks",
      // Lower notebook and visible page edges
      points:
        "1055,809 1067,802 1090,810 1136,823 1182,833 1223,843 1257,836 1295,828 1311,817 1311,839 1296,850 1262,861 1220,871 1184,862 1138,851 1092,840 1053,827",
    },

    // 5. Student ID
    {
      type: "polygon",
      object: "student-id",
      points:
        "1362,842 1381,835 1421,839 1461,848 1495,857 1516,867 1514,878 1496,898 1478,898 1401,895 1354,881 1347,867",
    },

    // 6. Backpack
    {
      type: "polygon",
      object: "backpack",
      points:
        "1228,573 1230,547 1239,518 1251,499 1273,478 1298,463 1315,461 1329,453 1348,453 1365,467 1387,473 1409,485 1425,510 1436,534 1433,547 1423,555 1412,580 1399,605 1380,615 1269,615 1244,606 1229,592",
    },

    // 8. Menu screens
    {
      type: "polygon",
      object: "menu-screens",
      points: "1129,194 1336,184 1336,189 1335,232 1129,242",
    },

    // 9. Student Services — full sign box
    {
      type: "polygon",
      object: "student-services-sign",
      points: "1472,92 1668,92 1668,151 1472,151",
    },

    // 10. Cafeteria — full sign box
    {
      type: "polygon",
      object: "cafeteria-sign",
      points: "1474,23 1668,23 1668,74 1474,74",
    },

    // 11. Potted plant — foliage clusters and visible pot

    {
      type: "polygon",
      object: "potted-plant",
      // Left leaves
      points:
        "0,143 12,156 26,173 42,184 48,197 33,193 24,185 32,216 52,239 55,258 42,247 22,223 13,198 1,174",
    },
    {
      type: "polygon",
      object: "potted-plant",
      // Tall upper leaves
      points:
        "44,180 38,155 40,132 47,126 59,141 72,167 74,189 70,209 62,225 57,211 58,187",
    },
    {
      type: "polygon",
      object: "potted-plant",
      // Long leaves extending right
      points:
        "67,201 80,170 96,156 113,150 130,158 118,168 105,176 94,190 121,179 152,181 179,196 185,207 167,199 145,192 126,197 110,212 97,231 89,253 81,259 83,229",
    },
    {
      type: "polygon",
      object: "potted-plant",
      // Lower-left foliage
      points: "14,226 24,219 36,231 49,254 56,275 51,291 39,279 29,261 16,254",
    },
    {
      type: "polygon",
      object: "potted-plant",
      // Lower-right foliage
      points:
        "83,251 98,236 113,228 126,240 117,245 105,258 100,277 91,286 80,284",
    },
    {
      type: "polygon",
      object: "potted-plant",
      // Brown plant pot
      points: "43,266 54,261 93,261 100,271 97,313 46,314",
    },

    // 12. Ottoman — top, visible front and right side

    {
      type: "polygon",
      object: "ottoman",
      // Top cushion
      points:
        "468,514 478,505 504,498 536,493 583,491 638,491 690,497 724,506 741,517 745,534 699,540 658,541 610,538 552,536 500,534 470,530",
    },
    {
      type: "polygon",
      object: "ottoman",
      // Front face, following the foosball's diagonal obstruction
      points:
        "470,530 500,534 552,536 610,538 658,541 658,671 645,666 621,653 593,637 562,621 533,605 506,588 482,573 470,557",
    },
    {
      type: "polygon",
      object: "ottoman",
      // Right curved side
      points:
        "658,541 699,540 745,534 746,575 746,630 740,652 726,666 701,676 678,681 658,672",
    },
  ],
};
export default level5;
