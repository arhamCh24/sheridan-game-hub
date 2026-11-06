/** Campus Quest Level 3: photo-style scene. All polygons are in the native 1672x941 coordinate space. */
const level3 = {
  id: 3,
  gameTitle: "Sheridan Campus Quest",
  roomName: "Library Mystery",
  mission:
    "Search a vibrant library study area, decode six practical clues and find the right objects before time runs out.",
  tip: "Look across the foreground table, group-study space and reading area. Only six objects are chosen from twelve each round.",
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
      "../../assets/images/levels/level-3/background.png",
      import.meta.url,
    ).href,
  },
  completion: {
    title: "Library Mystery Solved! 🎉",
    prompt: "QUEST COMPLETE",
    message:
      "You solved the Library Mystery. Replay to discover a fresh set of study-space clues.",
  },
  steps: [
    /* =====================================================
     LAPTOP
  ===================================================== */
    {
      id: "laptop",

      prompt: "FIND THE OBJECT",

      hint: "A shared table can become a personal workstation when this portable device is opened and an assignment needs attention.",

      helpHint:
        "Look toward the far-left side of the large round study table in the foreground for an open computer.",

      foundLabel: "Open Laptop",

      title: "Laptop found!",

      story:
        "Correct. Portable computers allow students to work on assignments and access learning resources from almost anywhere on campus.",

      clueType: "text",
    },

    /* =====================================================
     NOTEBOOK
  ===================================================== */
    {
      id: "notebook",

      prompt: "FIND THE OBJECT",

      hint: "Quick sketches, lecture notes, and unexpected ideas can all find a permanent place here without needing a keyboard.",

      helpHint:
        "Inspect the front-left section of the round study table for a spiral-bound writing pad.",

      foundLabel: "Spiral Notebook",

      title: "Notebook found!",

      story:
        "Correct. Handwritten notes and sketches remain useful for organizing ideas, even in a classroom filled with digital technology.",

      clueType: "text",
    },

    /* =====================================================
     STUDENT ID CARD
  ===================================================== */
    {
      id: "student-id",

      prompt: "FIND THE OBJECT",

      hint: "A name and photograph on something small can confirm a person's connection to campus without requiring an introduction.",

      helpHint:
        "Look near the front edge of the round study table, just to the left of the paper campus guide.",

      foundLabel: "Student ID Card",

      title: "Student ID card found!",

      story:
        "Correct. Student identification helps connect individuals to their campus community and may be used to access college services.",

      clueType: "text",
    },

    /* =====================================================
     WATER BOTTLE
  ===================================================== */
    {
      id: "water-bottle",

      prompt: "FIND THE OBJECT",

      hint: "Long study sessions are easier when a refreshing drink is close by and the container can be filled again instead of thrown away.",

      helpHint:
        "Look just behind the tablet on the foreground study table for a tall blue container with a metal cap.",

      foundLabel: "Reusable Water Bottle",

      title: "Water bottle found!",

      story:
        "Correct. Bringing a reusable bottle helps students stay hydrated throughout the day while reducing reliance on disposable containers.",

      clueType: "text",
    },

    /* =====================================================
     TABLET
  ===================================================== */
    {
      id: "tablet",

      prompt: "FIND THE OBJECT",

      hint: "Reading documents, reviewing diagrams, and making digital annotations can all happen by touching a screen instead of using a keyboard.",

      helpHint:
        "Search near the middle of the large foreground table for a touchscreen device propped upright.",

      foundLabel: "Tablet Computer",

      title: "Tablet found!",

      story:
        "Correct. Touchscreen devices give students a convenient way to review documents, annotate notes, and access course materials.",

      clueType: "text",
    },

    /* =====================================================
     TEXTBOOK
  ===================================================== */
    {
      id: "textbook",

      prompt: "FIND THE OBJECT",

      hint: "When a quick explanation is not enough, this substantial printed resource can offer entire chapters of detailed information.",

      helpHint:
        "Look behind the headphones toward the right-hand side of the study table for a thick, dark-blue hardcover book.",

      foundLabel: "Thick Textbook",

      title: "Textbook found!",

      story:
        "Correct. Textbooks provide structured explanations, examples, and reference material that support deeper understanding of a subject.",

      clueType: "text",
    },

    /* =====================================================
     HEADPHONES
  ===================================================== */
    {
      id: "headphones",

      prompt: "FIND THE OBJECT",

      hint: "In a room filled with conversations, these can deliver a recorded lecture directly to one listener without disturbing everyone nearby.",

      helpHint:
        "Inspect the foreground study table to the right of the thick hardcover book for an over-ear audio accessory.",

      foundLabel: "Headphones",

      title: "Headphones found!",

      story:
        "Correct. Personal audio equipment allows students to listen to lectures and learning materials in shared study environments.",

      clueType: "text",
    },

    /* =====================================================
     BACKPACK
  ===================================================== */
    {
      id: "backpack",

      prompt: "FIND THE OBJECT",

      hint: "Books, chargers, and personal belongings can travel together throughout a busy campus day when everything has one place to go.",

      helpHint:
        "Look on the chair at the far-right edge of the large foreground study table for a black carrying bag.",

      foundLabel: "Black Backpack",

      title: "Backpack found!",

      story:
        "Correct. Keeping study materials and personal essentials together makes moving between classrooms and study spaces more convenient.",

      clueType: "text",
    },

    /* =====================================================
     CAMPUS MAP
  ===================================================== */
    {
      id: "campus-map",

      prompt: "FIND THE OBJECT",

      hint: "Someone visiting an unfamiliar college can use this portable guide to understand where buildings and important destinations are located.",

      helpHint:
        "Look across the unfolded paper pages near the front-right section of the round study table.",

      foundLabel: "Folded Campus Guide",

      title: "Campus map found!",

      story:
        "Correct. Campus maps help students and visitors navigate unfamiliar buildings, locate services, and plan routes between destinations.",

      clueType: "text",
    },

    /* =====================================================
     POWER ADAPTER
  ===================================================== */
    {
      id: "power-adapter",

      prompt: "FIND THE OBJECT",

      hint: "A charging cable alone is not always enough. This compact accessory converts electrical power into a form a connected device can use.",

      helpHint:
        "Look near the tablet, slightly left of the folded campus map, for a small white charging block attached to a cable.",

      foundLabel: "Power Adapter",

      title: "Power adapter found!",

      story:
        "Correct. Power adapters convert electrical power into the voltage and current required by compatible electronic devices.",

      clueType: "text",
    },

    /* =====================================================
     POTTED PLANT
  ===================================================== */
    {
      id: "potted-plant",

      prompt: "FIND THE OBJECT",

      hint: "Not everything in a study space is electronic or made for coursework. A little greenery can make a busy room feel more welcoming.",

      helpHint:
        "Inspect the group-study table in the centre background, between the students, for a small leafy decoration.",

      foundLabel: "Small Potted Plant",

      title: "Potted plant found!",

      story:
        "Correct. Indoor plants bring a natural element into shared spaces and can make study environments feel more inviting.",

      clueType: "text",
    },

    /* =====================================================
     READING BOOK
  ===================================================== */
    {
      id: "reading-book",

      prompt: "FIND THE OBJECT",

      hint: "While others work with digital screens, someone nearby is exploring information the traditional way, turning printed pages by hand.",

      helpHint:
        "Look at the student seated on the lounge sofa at the far-right side of the room. The reading material is open in their hands.",

      foundLabel: "Open Reading Book",

      title: "Reading book found!",

      story:
        "Correct. Printed books remain valuable for independent reading, research, and learning alongside digital resources.",

      clueType: "text",
    },
  ],
  hotspots: [
    {
      type: "polygon",
      object: "laptop",
      points:
        "614,413 612,416 620,427 621,443 619,464 540,609 521,621 509,612 514,594 556,499",
    },
    {
      type: "polygon",
      object: "laptop",
      points:
        "378,602 394,596 485,594 513,599 525,607 520,624 401,635 379,631 375,616",
    },
    {
      type: "polygon",
      object: "notebook",
      points:
        "307,700 472,644 503,645 590,661 685,704 644,721 629,732 472,773 325,739 304,720",
    },
    {
      type: "polygon",
      object: "student-id",
      points: "648,750 777,755 762,764 759,784 752,799 653,796 639,787",
    },
    {
      type: "polygon",
      object: "water-bottle",
      /*
      points:
        "640,389 668,386 680,392 686,408 687,431 687,584 681,599 629,599 623,586 623,434 625,412 630,397", */
      points:
        "650,389 678,386 690,392 696,408 697,431 697,584 691,599 639,599 633,586 633,434 635,412 640,397",
    },
    {
      type: "polygon",
      object: "tablet",
      points:
        "828,462 921,471 928,469 950,474 960,490 907,617 889,633 872,638 747,612 730,607 740,598 746,583 810,460",
    },
    {
      type: "polygon",
      object: "textbook",
      points:
        "1015,500 1153,481 1251,497 1271,505 1271,521 1266,544 1257,550 1250,576 1235,576 992,580 986,567 986,533",
    },

    {
      type: "polygon",
      object: "headphones",
      points:
        "1174,624 1175,609 1182,594 1192,588 1206,586 1221,590 1236,600 1244,619 1244,648 1235,666 1217,676 1198,672 1184,661 1177,644",
    },
    {
      type: "polygon",
      object: "headphones",
      points:
        "1224,639 1228,623 1238,608 1252,599 1270,596 1288,600 1303,610 1311,626 1315,643 1310,663 1298,681 1280,690 1257,690 1239,679 1228,663",
    },
    {
      type: "polygon",
      object: "headphones",
      points:
        "1234,594 1242,590 1257,592 1282,592 1314,595 1346,601 1365,607 1379,617 1382,630 1380,646 1373,656 1357,664 1334,671 1318,671 1312,663 1316,651 1337,654 1357,648 1367,638 1367,627 1356,617 1330,609 1294,605 1255,606 1240,606",
    },

    {
      type: "polygon",
      object: "backpack",
      points:
        "1419,465 1440,445 1475,439 1518,449 1557,474 1580,499 1593,533 1600,586 1600,658 1597,711 1588,765 1570,780 1490,781 1480,774 1481,727 1481,675 1462,643 1440,617 1417,592 1391,575 1369,555 1383,522 1401,487",
    },
    {
      type: "polygon",
      object: "campus-map",
      points:
        "905,648 969,650 1026,663 1099,678 1163,691 1301,696 1310,809 1293,815 1214,813 1154,799 1103,785 1045,795 990,791 930,773 870,763 877,716",
    },
    {
      type: "polygon",
      object: "power-adapter",
      points:
        "787,679 799,660 827,664 832,659 839,668 868,695 861,697 869,714 848,715 796,708 777,694",
    },
    {
      type: "polygon",
      object: "potted-plant",
      points:
        "843,278 850,266 858,267 863,257 871,267 886,265 891,278 904,282 900,299 892,304 890,325 845,324 839,312 840,298",
    },
    {
      type: "polygon",
      object: "reading-book",
      points:
        "1317,242 1327,236 1346,237 1363,246 1385,254 1406,271 1405,281 1389,280 1369,269 1356,268 1341,255 1321,256",
    },
  ],
};
export default level3;
