/** Campus Quest Level 4: photo-style scene. All polygons are in the native 1672x941 coordinate space. */
const level4 = {
  id: 4,
  gameTitle: "Sheridan Campus Quest",
  roomName: "Creative Studio",
  mission:
    "Explore a photographic and animation studio, interpret six creative-workflow clues and find the correct equipment.",
  tip: "Check the foreground desk, computer stations and lighting rigs. The six clues change every round.",
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
      "../../assets/images/levels/level-4/background.png",
      import.meta.url,
    ).href,
  },
  completion: {
    title: "Creative Studio Complete! 🎉",
    prompt: "QUEST COMPLETE",
    message:
      "You found the creative production tools. Replay to try a different set of six clues.",
  },
  steps: [
    /* =====================================================
     PEN DISPLAY
  ===================================================== */
    {
      id: "pen-display",

      prompt: "FIND THE OBJECT",

      hint: "An artist can draw directly onto this digital surface, turning movements of a stylus into artwork without using traditional paper.",

      helpHint:
        "Inspect the front-left workstation for the large tilted screen designed for drawing with a digital pen.",

      foundLabel: "Digital Drawing Display",

      title: "Digital drawing display found!",

      story:
        "Correct. Interactive pen displays allow designers and illustrators to create digital artwork using precise, natural drawing movements.",

      clueType: "text",
    },

    /* =====================================================
     CAMERA
  ===================================================== */
    {
      id: "camera",

      prompt: "FIND THE OBJECT",

      hint: "Instead of describing a moment or drawing it from memory, a creator can capture what appears through a lens for later use.",

      helpHint:
        "Look near the bottom-left edge of the main creative workbench for a black photographic device with a large circular lens.",

      foundLabel: "Digital Camera",

      title: "Digital camera found!",

      story:
        "Correct. Digital cameras help creative professionals capture photographs, record visual references, and produce media for different projects.",

      clueType: "text",
    },

    /* =====================================================
     HEADPHONES
  ===================================================== */
    {
      id: "headphones",

      prompt: "FIND THE OBJECT",

      hint: "When editing sound, hearing every detail matters. This personal accessory lets someone listen closely without filling the entire room with noise.",

      helpHint:
        "Search the middle of the main creative workbench for a black over-ear audio accessory lying near the sketchbook.",

      foundLabel: "Studio Headphones",

      title: "Studio headphones found!",

      story:
        "Correct. Headphones help audio and video editors listen carefully to dialogue, music, and sound effects during production.",

      clueType: "text",
    },

    /* =====================================================
     STORYBOARD
  ===================================================== */
    {
      id: "storyboard",

      prompt: "FIND THE OBJECT",

      hint: "Before filming begins, a creative team can plan what viewers will see by arranging a sequence of illustrated scenes.",

      helpHint:
        "Inspect the loose printed sheets spread across the front-centre section of the main workbench for a collection of illustrated panels.",

      foundLabel: "Storyboard Sheets",

      title: "Storyboard sheets found!",

      story:
        "Correct. Storyboards help filmmakers, animators, and designers organize visual sequences before production begins.",

      clueType: "text",
    },

    /* =====================================================
     SKETCHBOOK
  ===================================================== */
    {
      id: "sketchbook",

      prompt: "FIND THE OBJECT",

      hint: "Before a character becomes a finished animation, its expressions, movements, and appearance may begin as rough drawings on these pages.",

      helpHint:
        "Look to the right of the headphones on the main workbench for an open spiral-bound book containing character drawings.",

      foundLabel: "Open Sketchbook",

      title: "Sketchbook found!",

      story:
        "Correct. Sketchbooks give artists a place to experiment with characters, compositions, and visual concepts before developing finished designs.",

      clueType: "text",
    },

    /* =====================================================
     SOFTBOX
  ===================================================== */
    {
      id: "softbox",

      prompt: "FIND THE OBJECT",

      hint: "Bright studio lighting can create harsh shadows. This large fabric-covered accessory helps spread the light more gently across a subject.",

      helpHint:
        "Look above the creative workstations toward the centre-right of the studio for a large black light modifier.",

      foundLabel: "Softbox Studio Light",

      title: "Softbox studio light found!",

      story:
        "Correct. Softboxes diffuse light to create softer illumination and more controlled shadows in photography and video production.",

      clueType: "text",
    },

    /* =====================================================
     TRIPOD CAMERA
  ===================================================== */
    {
      id: "tripod-camera",

      prompt: "FIND THE OBJECT",

      hint: "Recording a steady shot becomes easier when the equipment stays supported in one position instead of being held by hand.",

      helpHint:
        "Inspect the right side of the studio behind the main workbench for a video camera mounted on a three-legged stand.",

      foundLabel: "Camera on Tripod",

      title: "Camera on tripod found!",

      story:
        "Correct. Tripods help stabilize cameras, maintain consistent framing, and reduce unwanted movement during recording.",

      clueType: "text",
    },

    /* =====================================================
     MODELING MONITOR
  ===================================================== */
    {
      id: "modeling-monitor",

      prompt: "FIND THE OBJECT",

      hint: "A designer can rotate, reshape, and examine a virtual object here long before anyone builds a physical version of it.",

      helpHint:
        "Look at the centre-back computer screen beneath the studio light for a digital three-dimensional chair model.",

      foundLabel: "3D Design Monitor",

      title: "3D design monitor found!",

      story:
        "Correct. Three-dimensional modeling software allows designers to visualize, refine, and test ideas digitally before physical production.",

      clueType: "text",
    },

    /* =====================================================
     EDITING MONITOR
  ===================================================== */
    {
      id: "editing-monitor",

      prompt: "FIND THE OBJECT",

      hint: "Separate clips, music, and sound effects can be arranged along a timeline here until they become one complete production.",

      helpHint:
        "Inspect the large computer screen at the back-right of the studio for a video-editing timeline with coloured tracks.",

      foundLabel: "Video Editing Monitor",

      title: "Video editing monitor found!",

      story:
        "Correct. Video editing applications allow creators to organize footage, adjust timing, and combine visual and audio elements into a finished project.",

      clueType: "text",
    },

    /* =====================================================
     COFFEE CUP
  ===================================================== */
    {
      id: "coffee-cup",

      prompt: "FIND THE OBJECT",

      hint: "A long creative session sometimes calls for a warm drink that can travel from a nearby café back to the workstation.",

      helpHint:
        "Search near the centre of the large foreground workbench for a brown takeaway drink container.",

      foundLabel: "Takeaway Coffee Cup",

      title: "Coffee cup found!",

      story:
        "Correct. Creative projects often involve long periods of concentration, making occasional breaks an important part of a productive routine.",

      clueType: "text",
    },

    /* =====================================================
     LENS CAP
  ===================================================== */
    {
      id: "lens-cap",

      prompt: "FIND THE OBJECT",

      hint: "When a photographer finishes shooting, this small protective cover helps keep dust and accidental contact away from delicate glass.",

      helpHint:
        "Look along the bottom-left edge of the main workbench, in front of the digital camera, for a separate black circular cover.",

      foundLabel: "Camera Lens Cap",

      title: "Camera lens cap found!",

      story:
        "Correct. Lens caps protect camera lenses from dust, fingerprints, and accidental damage when equipment is not in use.",

      clueType: "text",
    },

    /* =====================================================
     ART POSTER
  ===================================================== */
    {
      id: "art-poster",

      prompt: "FIND THE OBJECT",

      hint: "Creative inspiration does not always come from a computer screen. Colourful artwork displayed nearby can help spark new visual ideas.",

      helpHint:
        "Look high on the back wall, just to the left of the studio light, for an orange-and-blue illustration.",

      foundLabel: "Colourful Art Poster",

      title: "Art poster found!",

      story:
        "Correct. Displayed artwork can provide inspiration for colour choices, illustration styles, and creative direction during design projects.",

      clueType: "text",
    },
  ],
  hotspots: [
    {
      type: "polygon",
      object: "pen-display",
      points:
        "33,238 90,239 298,243 468,246 482,252 514,302 584,424 645,541 654,554 654,569 640,581 509,597 451,599 418,598 393,600 366,607 338,623 304,637 255,651 212,645 179,603 160,548 137,479 111,410 73,333 16,270 16,256",
    },
    {
      type: "polygon",
      object: "camera",
      points:
        "316,639 361,618 399,607 427,609 449,615 484,639 520,650 566,666 599,683 619,701 620,751 602,786 577,800 542,808 487,802 458,790 407,791 329,804 307,788 300,752 299,692",
    },
    {
      type: "polygon",
      object: "headphones",
      points:
        "853,569 884,541 926,532 970,542 1018,561 1034,587 1042,608 1060,606 1074,620 1075,652 1065,661 1037,659 1002,648 974,669 942,676 896,672 850,652 831,621 832,592",
    },
    {
      type: "polygon",
      object: "storyboard",
      points:
        "628,702 814,677 909,674 998,684 1161,725 1309,762 1308,770 1195,795 1022,829 951,851 820,810 670,761 626,731",
    },
    {
      type: "polygon",
      object: "sketchbook",
      points: "1110,562 1353,572 1371,571 1384,638 1102,623",
    },
    {
      type: "polygon",
      object: "sketchbook",
      points:
        "1099,625 1109,620 1364,637 1382,636 1386,702 1362,701 1077,674 1075,658",
    },
    {
      type: "polygon",
      object: "softbox",
      points:
        "992,6 1016,2 1040,0 1090,0 1128,11 1166,40 1172,57 1190,115 1180,167 1150,222 1063,230 1054,222 1044,185 1028,131 1010,81",
    },
    {
      type: "polygon",
      object: "tripod-camera",
      points:
        "1277,230 1277,220 1309,229 1303,210 1340,207 1371,210 1371,221 1417,223 1416,274 1415,283 1366,287 1339,293 1306,286 1270,284 1254,274",
    },
    {
      type: "polygon",
      object: "tripod-camera",
      points: "1312,287 1366,289 1349,316 1330,347 1315,347",
    },
    {
      type: "polygon",
      object: "modeling-monitor",
      points:
        "912,243 1148,245 1164,249 1164,389 1154,412 903,421 903,392 903,254",
    },
    {
      type: "polygon",
      object: "editing-monitor",
      points:
        "1424,237 1665,234 1672,249 1672,393 1645,391 1435,429 1435,392 1435,250",
    },
    {
      type: "polygon",
      object: "coffee-cup",
      points:
        "778,454 799,449 826,449 849,449 860,449 862,475 860,537 865,545 851,566 832,581 799,600 790,599 774,535 772,499 770,462",
    },
    {
      type: "polygon",
      object: "lens-cap",
      points:
        "284,815 317,805 370,804 408,815 423,834 426,861 416,875 392,883 328,885 288,874 274,852 274,827",
    },
    {
      type: "polygon",
      object: "art-poster",
      points: "770,45 884,44 884,219 770,218",
    },
  ],
};
export default level4;
