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
    title: "Student Life Adventure Complete! 🎉",
    prompt: "QUEST COMPLETE",
    message:
      "You explored the student commons. Replay to find another combination of campus-life clues.",
  },
  steps: [
    /* =====================================================
     FOOSBALL
  ===================================================== */
    {
      id: "foosball",

      prompt: "FIND THE OBJECT",

      hint: "A quick break between classes can become a friendly competition when miniature players are controlled using rods instead of a controller.",

      helpHint:
        "Look across the lower-left foreground of the student commons for a recreational table with rows of miniature football players.",

      foundLabel: "Foosball Table",

      title: "Foosball table found!",

      story:
        "Correct. Recreational games give students opportunities to relax, socialize, and enjoy friendly competition between classes.",

      clueType: "text",
    },

    /* =====================================================
     WATER BOTTLE
  ===================================================== */
    {
      id: "water-bottle",

      prompt: "FIND THE OBJECT",

      hint: "Whether someone is studying or taking a break, this reusable companion keeps a refreshing drink within reach throughout the day.",

      helpHint:
        "Inspect the middle-right foreground study table for a tall blue drink container standing beside the notebook.",

      foundLabel: "Blue Water Bottle",

      title: "Water bottle found!",

      story:
        "Correct. Keeping water nearby helps students stay hydrated during busy days, while reusable containers reduce unnecessary waste.",

      clueType: "text",
    },

    /* =====================================================
     LAPTOP
  ===================================================== */
    {
      id: "laptop",

      prompt: "FIND THE OBJECT",

      hint: "A student does not always need a computer lab to complete an assignment. This portable device can turn an ordinary table into a workspace.",

      helpHint:
        "Look at the far-right foreground study table for an open silver computer with a large screen.",

      foundLabel: "Open Laptop",

      title: "Laptop found!",

      story:
        "Correct. Portable computers allow students to continue coursework, collaborate, and access digital resources from shared campus spaces.",

      clueType: "text",
    },

    /* =====================================================
     NOTEBOOKS
  ===================================================== */
    {
      id: "notebooks",

      prompt: "FIND THE OBJECT",

      hint: "When ideas arrive faster than someone can organize them digitally, these bound pages provide a familiar place for notes and sketches.",

      helpHint:
        "Look on the foreground study table, directly to the right of the blue water bottle, for two stacked spiral-bound writing pads.",

      foundLabel: "Stacked Notebooks",

      title: "Notebooks found!",

      story:
        "Correct. Paper notebooks remain practical tools for taking lecture notes, planning assignments, and organizing ideas without electronic devices.",

      clueType: "text",
    },

    /* =====================================================
     STUDENT ID CARD
  ===================================================== */
    {
      id: "student-id",

      prompt: "FIND THE OBJECT",

      hint: "Small enough to fit inside a wallet, this personal item can help prove someone's connection to the college community.",

      helpHint:
        "Search near the bottom-right edge of the foreground study table for a small identification card lying flat.",

      foundLabel: "Student ID Card",

      title: "Student ID card found!",

      story:
        "Correct. Student identification provides a convenient way to verify college membership and may help students access campus services.",

      clueType: "text",
    },

    /* =====================================================
     BACKPACK
  ===================================================== */
    {
      id: "backpack",

      prompt: "FIND THE OBJECT",

      hint: "Moving between classes becomes easier when books, chargers, and personal belongings can all travel together in one convenient place.",

      helpHint:
        "Look on the chair just behind the open laptop at the right side of the foreground study area for a black carrying bag.",

      foundLabel: "Black Backpack",

      title: "Backpack found!",

      story:
        "Correct. Carrying essential supplies together helps students stay organized while moving between classrooms and shared campus spaces.",

      clueType: "text",
    },

    /* =====================================================
     MENU SCREENS
  ===================================================== */
    {
      id: "menu-screens",

      prompt: "FIND THE OBJECT",

      hint: "Before ordering something to eat, visitors can check these illuminated displays to discover what is available and make their selection.",

      helpHint:
        "Look high above the food service counter toward the back of the student commons for a row of glowing digital displays.",

      foundLabel: "Cafe Menu Screens",

      title: "Cafe menu screens found!",

      story:
        "Correct. Digital menus help customers explore available food and drink options while allowing businesses to update their displays.",

      clueType: "text",
    },

    /* =====================================================
     STUDENT SERVICES SIGN
  ===================================================== */
    {
      id: "student-services-sign",

      prompt: "FIND THE OBJECT",

      hint: "When someone needs academic or campus support but does not know where to go, this directional information can help them find the right place.",

      helpHint:
        "Inspect the white wall in the upper-right section of the commons for a sign directing visitors toward student support services.",

      foundLabel: "Student Services Sign",

      title: "Student services sign found!",

      story:
        "Correct. Clear directional signs help students locate support services and navigate campus facilities with greater confidence.",

      clueType: "text",
    },

    /* =====================================================
     CAFETERIA SIGN
  ===================================================== */
    {
      id: "cafeteria-sign",

      prompt: "FIND THE OBJECT",

      hint: "A visitor who is hungry between classes may follow this simple directional clue to find somewhere to purchase a meal.",

      helpHint:
        "Look near the very top of the right-hand wall for a sign pointing toward the campus dining area.",

      foundLabel: "Cafeteria Sign",

      title: "Cafeteria sign found!",

      story:
        "Correct. Campus wayfinding signs help students and visitors find dining areas and other essential facilities without unnecessary confusion.",

      clueType: "text",
    },

    /* =====================================================
     POTTED PLANT
  ===================================================== */
    {
      id: "potted-plant",

      prompt: "FIND THE OBJECT",

      hint: "Even inside a busy student commons, something green and growing can bring a little of the outdoors into the room.",

      helpHint:
        "Look beside the large windows along the far-left side of the student commons for a tall leafy indoor plant.",

      foundLabel: "Large Potted Plant",

      title: "Potted plant found!",

      story:
        "Correct. Indoor plants add a natural element to shared spaces and can make campus lounges feel more comfortable and welcoming.",

      clueType: "text",
    },

    /* =====================================================
     OTTOMAN
  ===================================================== */
    {
      id: "ottoman",

      prompt: "FIND THE OBJECT",

      hint: "Not every comfortable place to sit looks like an ordinary chair. This low, padded piece of furniture offers flexible seating in a shared lounge.",

      helpHint:
        "Inspect the centre-left area of the student commons, just behind the recreational game table and in front of the sofas, for a low round upholstered seat.",

      foundLabel: "Round Lounge Ottoman",

      title: "Ottoman found!",

      story:
        "Correct. Flexible lounge furniture gives students additional places to sit, relax, and socialize between their academic activities.",

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
