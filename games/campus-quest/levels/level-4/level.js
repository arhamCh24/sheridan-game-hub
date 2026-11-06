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
    title: "Creative Studio Complete!",
    prompt: "QUEST COMPLETE",
    message:
      "You found the creative production tools. Replay to try a different set of six clues.",
  },
  steps: [
    {
      id: "pen-display",
      prompt: "FIND THE OBJECT",
      hint: "Find the large angled screen designed for drawing directly onto its surface.",
      helpHint:
        "Look at the largest tilted display at the left of the front desk.",
      foundLabel: "Digital Drawing Display",
      title: "Digital Drawing Display found!",
      story:
        "Correct! Digital pen displays allow artists to draw directly into design applications.",
      clueType: "text",
    },
    {
      id: "camera",
      prompt: "FIND THE OBJECT",
      hint: "Find the black DSLR-style camera with a large circular lens on the front desk.",
      helpHint:
        "Look at the bottom-left of the creative workbench, near the front edge.",
      foundLabel: "Digital Camera",
      title: "Digital Camera found!",
      story:
        "Correct! A camera can capture photographs, video reference and stop-motion material.",
      clueType: "text",
    },
    {
      id: "headphones",
      prompt: "FIND THE OBJECT",
      hint: "Find the black over-ear headphones lying near the sketchbook.",
      helpHint: "Look toward the middle of the main workbench.",
      foundLabel: "Studio Headphones",
      title: "Studio Headphones found!",
      story:
        "Correct! Headphones help editors and designers listen closely to audio.",
      clueType: "text",
    },
    {
      id: "storyboard",
      prompt: "FIND THE OBJECT",
      hint: "Find the large collection of panels showing a visual sequence of scenes.",
      helpHint:
        "Look at the loose printed pages across the front-centre of the desk.",
      foundLabel: "Storyboard Sheets",
      title: "Storyboard Sheets found!",
      story:
        "Correct! Storyboards help teams plan a sequence of shots or animation events.",
      clueType: "text",
    },
    {
      id: "sketchbook",
      prompt: "FIND THE OBJECT",
      hint: "Find the open spiral-bound book showing drawings of characters and poses.",
      helpHint: "Look to the right of the headphones on the desk.",
      foundLabel: "Open Sketchbook",
      title: "Open Sketchbook found!",
      story:
        "Correct! Sketchbooks help artists explore ideas before final production.",
      clueType: "text",
    },
    {
      id: "softbox",
      prompt: "FIND THE OBJECT",
      hint: "Find the large black fabric light modifier hanging above the workstations.",
      helpHint: "Look high above the desks, toward the centre-right.",
      foundLabel: "Softbox Studio Light",
      title: "Softbox Studio Light found!",
      story:
        "Correct! Softboxes spread light to create a softer illumination for photography.",
      clueType: "text",
    },
    {
      id: "tripod-camera",
      prompt: "FIND THE OBJECT",
      hint: "Find the video camera mounted high on three supporting legs.",
      helpHint:
        "Look toward the right side of the studio, behind the main desk.",
      foundLabel: "Camera on Tripod",
      title: "Camera on Tripod found!",
      story: "Correct! A tripod helps keep a camera stable during recording.",
      clueType: "text",
    },
    {
      id: "modeling-monitor",
      prompt: "FIND THE OBJECT",
      hint: "Find the screen displaying a digital three-dimensional chair model.",
      helpHint: "Look at the centre-back monitor under the studio light.",
      foundLabel: "3D Design Monitor",
      title: "3D Design Monitor found!",
      story:
        "Correct! 3D modeling software helps artists plan and shape digital objects.",
      clueType: "text",
    },
    {
      id: "editing-monitor",
      prompt: "FIND THE OBJECT",
      hint: "Find the screen showing a video timeline with coloured tracks.",
      helpHint: "Look at the large monitor at the back-right edge.",
      foundLabel: "Video Editing Monitor",
      title: "Video Editing Monitor found!",
      story:
        "Correct! Editors arrange video clips, sound and transitions on a timeline.",
      clueType: "text",
    },
    {
      id: "coffee-cup",
      prompt: "FIND THE OBJECT",
      hint: "Find the brown takeaway drink cup between the workstations and the front desk.",
      helpHint: "Look near the centre of the large foreground desk.",
      foundLabel: "Takeaway Coffee Cup",
      title: "Takeaway Coffee Cup found!",
      story:
        "Correct! Breaks and drinks are common parts of long creative work sessions.",
      clueType: "text",
    },
    {
      id: "lens-cap",
      prompt: "FIND THE OBJECT",
      hint: "Find the separate black circular cap lying on the desk in front of the camera.",
      helpHint: "Look along the bottom-left edge of the desk.",
      foundLabel: "Camera Lens Cap",
      title: "Camera Lens Cap found!",
      story:
        "Correct! A lens cap protects camera glass while the camera is not being used.",
      clueType: "text",
    },
    {
      id: "art-poster",
      prompt: "FIND THE OBJECT",
      hint: "Find the orange and blue illustration mounted on the studio wall.",
      helpHint: "Look high on the back wall, just left of the studio light.",
      foundLabel: "Colourful Art Poster",
      title: "Colourful Art Poster found!",
      story:
        "Correct! Reference artwork can inspire colour and character-design decisions.",
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
