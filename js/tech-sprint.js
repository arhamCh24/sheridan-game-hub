import { initStore } from "./store.js";
import { icon } from "./icons.js";
import { initChrome, requirePlayer, setGameplayActive, toast } from "./ui.js";

// ============================================================
// TECH SPRINT — QUESTION BANK
// Each round selects 5 random questions.
// Each correct answer earns 20 Sheridan Points.
// ============================================================

const QUESTIONS_PER_ROUND = 5;
const POINTS_PER_QUESTION = 20;

const QUESTIONS = [
  {
    question: "Which part is often called the brain of a computer?",
    options: ["RAM", "CPU", "SSD", "Power supply"],
    answer: 1,
    note: "The CPU (Central Processing Unit) carries out instructions and helps the computer process information.",
  },
  {
    question: "What does RAM help a computer do?",
    options: [
      "Store files permanently",
      "Connect to Wi-Fi",
      "Temporarily hold information being used",
      "Display images on a screen",
    ],
    answer: 2,
    note: "RAM temporarily stores information that programs need while they are running.",
  },
  {
    question:
      "Which part can store your files even when the computer is turned off?",
    options: ["SSD", "CPU cooler", "Motherboard", "Case fan"],
    answer: 0,
    note: "An SSD stores files, programs, and other information even when the computer is powered off.",
  },
  {
    question: "What is a GPU especially useful for?",
    options: [
      "Recording sound",
      "Processing graphics and images",
      "Detecting keyboard presses",
      "Charging a battery",
    ],
    answer: 1,
    note: "A GPU (Graphics Processing Unit) helps process images, video, games, and other graphics-heavy tasks.",
  },
  {
    question:
      "Which part connects important computer components such as the CPU and RAM?",
    options: ["Monitor", "Router", "Mouse", "Motherboard"],
    answer: 3,
    note: "The motherboard connects important computer components so they can work together.",
  },
  {
    question: "Which device is commonly used to type on a computer?",
    options: ["Printer", "Keyboard", "Speaker", "Monitor"],
    answer: 1,
    note: "A keyboard lets you enter letters, numbers, and commands into a computer.",
  },
  {
    question: "Which device displays images and text from a desktop computer?",
    options: ["Mouse", "Microphone", "Monitor", "Router"],
    answer: 2,
    note: "A monitor displays the computer's visual output, including text, pictures, and videos.",
  },
  {
    question: "What is the main purpose of a computer mouse?",
    options: [
      "Move the pointer and select items",
      "Store photos",
      "Connect to the internet",
      "Print documents",
    ],
    answer: 0,
    note: "A mouse helps you move the pointer, click buttons, and select items on a screen.",
  },
  {
    question: "Which device is used to print a document onto paper?",
    options: ["Scanner", "Monitor", "Webcam", "Printer"],
    answer: 3,
    note: "A printer creates a physical copy of a digital document or image.",
  },
  {
    question: "What does Wi-Fi let your device do?",
    options: [
      "Increase its screen size",
      "Connect to a wireless network",
      "Charge without electricity",
      "Automatically fix damaged files",
    ],
    answer: 1,
    note: "Wi-Fi allows devices to connect to a wireless network, which may provide access to the internet.",
  },
  {
    question: "Which of these is an example of an operating system?",
    options: ["Microsoft Word", "Google Chrome", "Windows", "YouTube"],
    answer: 2,
    note: "Windows is an operating system. It manages computer resources and helps you run applications.",
  },
  {
    question: "What is a web browser used for?",
    options: [
      "Opening and exploring websites",
      "Cleaning a computer screen",
      "Charging a laptop",
      "Printing without a printer",
    ],
    answer: 0,
    note: "A web browser, such as Chrome, Safari, or Firefox, lets you visit websites and use web applications.",
  },
  {
    question: "Which password is generally the strongest?",
    options: ["password123", "12345678", "yourname2026", "River!Cloud82#Piano"],
    answer: 3,
    note: "Long, unique passwords are harder to guess. Using a password manager can help you create and remember them.",
  },
  {
    question:
      "What should you do if you receive a suspicious link from an unknown sender?",
    options: [
      "Open it immediately",
      "Avoid clicking and verify the sender",
      "Forward it to everyone",
      "Enter your password to check it",
    ],
    answer: 1,
    note: "Suspicious links may lead to scams. Avoid opening them and verify the message through a trusted source.",
  },
  {
    question:
      "Which device is commonly used to record your voice on a computer?",
    options: ["Monitor", "Printer", "Microphone", "Keyboard"],
    answer: 2,
    note: "A microphone captures sound and lets you record your voice or speak during video calls.",
  },
  {
    question: "What is a computer file?",
    options: [
      "A collection of saved digital information",
      "A type of charging cable",
      "A computer cooling fan",
      "A wireless router",
    ],
    answer: 0,
    note: "A file stores digital information, such as a document, photo, video, or audio recording.",
  },
  {
    question: "What is the purpose of a computer's cooling fan?",
    options: [
      "Improve Wi-Fi speed",
      "Store more files",
      "Make the screen brighter",
      "Help prevent components from overheating",
    ],
    answer: 3,
    note: "Cooling fans move air to help keep computer components at safe operating temperatures.",
  },
  {
    question: "Which of these is an example of software?",
    options: ["Keyboard", "Microsoft Word", "Motherboard", "Computer case"],
    answer: 1,
    note: "Microsoft Word is software. Software consists of programs that run on computers and other devices.",
  },
  {
    question: "What does USB commonly allow you to do?",
    options: [
      "Make a computer waterproof",
      "Increase monitor brightness",
      "Connect devices and transfer data",
      "Replace the operating system automatically",
    ],
    answer: 2,
    note: "USB connections can transfer data, connect accessories, and provide power to compatible devices.",
  },
  {
    question: "Why is it useful to back up important files?",
    options: [
      "To recover them if the originals are lost",
      "To make the keyboard type faster",
      "To turn off the computer automatically",
      "To increase the size of the monitor",
    ],
    answer: 0,
    note: "A backup is an additional copy of your files. It can help you recover important information if something goes wrong.",
  },
];

// ============================================================
// GAME STATE
// ============================================================

let store;

let step = 0;
let correct = 0;
let chosen = null;
let saving = false;

// Questions selected for the CURRENT round only.
let currentQuestions = [];

const container = document.querySelector("#gameContent");

// ============================================================
// QUESTION RANDOMIZATION
// ============================================================

// Fisher-Yates shuffle.
// Returns a shuffled COPY without modifying the original array.
function shuffleArray(items) {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

// Shuffle the answer positions while preserving the
// correct answer for each question.
function shuffleAnswers(question) {
  const shuffledOptions = shuffleArray(
    question.options.map((text, index) => ({
      text,
      isCorrect: index === question.answer,
    })),
  );

  return {
    question: question.question,
    options: shuffledOptions.map((option) => option.text),
    answer: shuffledOptions.findIndex((option) => option.isCorrect),
    note: question.note,
  };
}

// Select five DIFFERENT questions for each new round.
function createRoundQuestions() {
  return shuffleArray(QUESTIONS)
    .slice(0, QUESTIONS_PER_ROUND)
    .map(shuffleAnswers);
}

// Reset the game and generate a fresh round.
function startNewRound() {
  step = 0;
  correct = 0;
  chosen = null;
  saving = false;

  currentQuestions = createRoundQuestions();
}

// ============================================================
// MOBILE / ACCESSIBILITY
// ============================================================

/**
 * Reposition the screen after a new stage is rendered.
 * Otherwise an iPhone user may remain scrolled to
 * the previous button and miss the new question.
 */
function revealStage(selector) {
  const stage = container.querySelector(selector);

  if (!stage) return;

  stage.scrollIntoView({
    behavior: "auto",
    block: "start",
  });

  stage.querySelector("h2[tabindex]")?.focus({ preventScroll: true });
}

// ============================================================
// INTRO SCREEN
// ============================================================

function showIntro() {
  container.innerHTML = `
    <div class="game-panel">
      <div class="mini-eyebrow">
        READY WHEN YOU ARE
      </div>

      <h2>
        Think fast.<br>
        Stay curious.
      </h2>

      <p>
        Test your tech knowledge with five quick questions
        chosen at random. Each correct answer earns
        <strong>20 Sheridan Points</strong>.
        Play again to discover new questions and improve
        your best score!
      </p>

      <div class="game-checklist">
        <span>
          ${icon("check", 18)}
          5 random questions
        </span>

        <span>
          ${icon("check", 18)}
          No time pressure
        </span>

        <span>
          ${icon("check", 18)}
          Highest score counts
        </span>
      </div>

      <button
        id="startGame"
        class="button button-primary button-lg"
        type="button"
      >
        Start challenge
        ${icon("arrow", 18)}
      </button>
    </div>
  `;

  container.querySelector("#startGame").addEventListener("click", async () => {
    try {
      await requirePlayer("Tech Sprint");

      // Generate a new selection only when a round starts.
      startNewRound();

      setGameplayActive(true);

      showQuestion();

      revealStage(".question-panel");
    } catch (error) {
      toast(
        error?.message || "We couldn't start the challenge. Please try again.",
        "error",
      );
    }
  });
}

// ============================================================
// QUESTION SCREEN
// ============================================================

function showQuestion() {
  chosen = null;

  const q = currentQuestions[step];

  const progress = Math.round((step / QUESTIONS_PER_ROUND) * 100);

  const totalPoints = correct * POINTS_PER_QUESTION;

  container.innerHTML = `
    <div class="question-panel">

      <div class="question-top">
        <span>
          QUESTION
          <strong>
            ${String(step + 1).padStart(2, "0")}
            /
            ${String(QUESTIONS_PER_ROUND).padStart(2, "0")}
          </strong>
        </span>

        <span class="question-earned">
          ${totalPoints} PTS EARNED
        </span>
      </div>

      <div
        class="progress-track"
        role="progressbar"
        aria-label="Questions completed"
        aria-valuemin="0"
        aria-valuemax="${QUESTIONS_PER_ROUND}"
        aria-valuenow="${step}"
      >
        <div
          class="progress-bar"
          style="width:${progress}%"
        ></div>
      </div>

      <h2 tabindex="-1">
        ${q.question}
      </h2>

      <p class="question-prompt">
        Choose the best answer.
      </p>

      <div class="options-list">
        ${q.options
          .map(
            (option, index) => `
              <button
                class="option"
                data-answer="${index}"
                type="button"
              >
                <span class="option-letter">
                  ${String.fromCharCode(65 + index)}
                </span>

                <span>${option}</span>

                <span
                  class="option-indicator"
                  aria-hidden="true"
                >
                  ○
                </span>
              </button>
            `,
          )
          .join("")}
      </div>

      <div
        class="feedback-zone"
        id="feedbackZone"
        aria-live="polite"
      ></div>

      <button
        type="button"
        class="button button-primary next-button"
        id="nextQuestion"
        disabled
      >
        ${step === QUESTIONS_PER_ROUND - 1 ? "See results" : "Next question"}

        ${icon("arrow", 17)}
      </button>

    </div>
  `;

  // Register answer buttons.
  container.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      answer(Number(button.dataset.answer));
    });
  });

  // Register Next / Results button.
  container.querySelector("#nextQuestion").addEventListener("click", () => {
    if (chosen === null) return;

    step++;

    if (step === QUESTIONS_PER_ROUND) {
      complete();
    } else {
      showQuestion();
      revealStage(".question-panel");
    }
  });
}

// ============================================================
// ANSWER HANDLING
// ============================================================

function answer(index) {
  // Prevent answering the same question multiple times.
  if (chosen !== null) return;

  chosen = index;

  const q = currentQuestions[step];

  const right = index === q.answer;

  if (right) {
    correct++;
  }

  // Update points.
  container.querySelector(".question-earned").textContent =
    `${correct * POINTS_PER_QUESTION} PTS EARNED`;

  // Update progress.
  const progress = Math.round(((step + 1) / QUESTIONS_PER_ROUND) * 100);

  container.querySelector(".progress-bar").style.width = `${progress}%`;

  container
    .querySelector(".progress-track")
    .setAttribute("aria-valuenow", String(step + 1));

  // Disable all answers and highlight the correct one.
  container.querySelectorAll("[data-answer]").forEach((button) => {
    button.disabled = true;

    const answerIndex = Number(button.dataset.answer);

    if (answerIndex === q.answer) {
      button.classList.add("correct");
    } else if (answerIndex === index) {
      button.classList.add("incorrect");
    }
  });

  // Friendly feedback with a short learning explanation.
  container.querySelector("#feedbackZone").innerHTML = `
    <div
      class="answer-feedback ${right ? "answer-right" : "answer-wrong"}"
    >
      <strong>
        ${
          right
            ? `✓ Correct! +${POINTS_PER_QUESTION} points`
            : "Not quite — keep going!"
        }
      </strong>

      <span>${q.note}</span>
    </div>
  `;

  container.querySelector("#nextQuestion").disabled = false;
}

// ============================================================
// COMPLETE GAME / SAVE SCORE
// ============================================================

async function complete() {
  if (saving) return;

  saving = true;

  // Keep gameplay active while saving.
  // This protects the player's score from being attributed
  // to a different player during an in-progress submission.

  const points = correct * POINTS_PER_QUESTION;

  container.innerHTML = `
    <div class="game-panel">

      <div class="mini-eyebrow">
        CHALLENGE COMPLETE
      </div>

      <h2 tabindex="-1">
        Nice work!
      </h2>

      <p>
        Saving your score…
      </p>

      <div class="spinner"></div>

    </div>
  `;

  revealStage(".game-panel");

  try {
    // Existing score-saving system remains unchanged.
    const result = await store.submitScore("tech-sprint", points);

    setGameplayActive(false);

    showResult(result);
  } catch (error) {
    // Do not display internal database error details
    // to students.
    console.error("Tech Sprint score save failed:", error);

    container.innerHTML = `
      <div class="game-panel">

        <div class="mini-eyebrow">
          SCORE NOT SAVED
        </div>

        <h2 tabindex="-1">
          Let's try that again.
        </h2>

        <p>
          We couldn't save your score.
          Your answers are still here.
          Check your connection and try again
          so your points can count.
        </p>

        <button
          type="button"
          class="button button-primary"
          id="retrySave"
        >
          Retry saving
          ${icon("refresh", 17)}
        </button>

      </div>
    `;

    revealStage(".game-panel");

    container.querySelector("#retrySave").addEventListener("click", complete);
  } finally {
    saving = false;
  }
}

// ============================================================
// RESULTS SCREEN
// ============================================================

function showResult(result) {
  const resultTitle =
    correct === QUESTIONS_PER_ROUND
      ? "Perfect score!"
      : correct >= 3
        ? "Nicely done!"
        : "Keep exploring!";

  container.innerHTML = `
    <div class="game-panel result-panel">

      <div class="result-icon">
        ${icon("trophy", 34)}
      </div>

      <div class="mini-eyebrow">
        CHALLENGE COMPLETE
      </div>

      <h2 tabindex="-1">
        ${resultTitle}
      </h2>

      <p>
        You answered ${correct} of
        ${QUESTIONS_PER_ROUND} questions correctly.
        ${
          correct === QUESTIONS_PER_ROUND
            ? "Amazing work!"
            : "Play again for another set of questions and a chance to improve your score."
        }
      </p>

      <div class="result-stats">

        <div>
          <span>THIS ROUND</span>

          <strong>
            ${result.points}
            <small>/100</small>
          </strong>
        </div>

        <div>
          <span>YOUR BEST</span>

          <strong>
            ${result.best}
            <small>/100</small>
          </strong>
        </div>

        <div>
          <span>POINTS GAINED</span>

          <strong>
            +${result.gained}
          </strong>
        </div>

      </div>

      <div class="result-actions">

        <button
          type="button"
          class="button button-primary"
          id="replay"
        >
          Play again
          ${icon("refresh", 17)}
        </button>

        <a
          class="button button-light"
          href="../../index.html"
        >
          Back to Game Hub
          ${icon("arrow", 17)}
        </a>

      </div>

    </div>
  `;

  revealStage(".game-panel");

  container.querySelector("#replay").addEventListener("click", () => {
    // Return to intro. A fresh set of questions
    // will be generated when Start is clicked.
    step = 0;
    correct = 0;
    chosen = null;
    currentQuestions = [];

    showIntro();

    revealStage(".game-panel");
  });
}

// ============================================================
// INITIALIZATION
// ============================================================

async function main() {
  try {
    store = await initStore();

    initChrome(store);

    showIntro();
  } catch (error) {
    console.error("Tech Sprint initialization failed:", error);

    container.innerHTML = `
      <div class="game-panel">

        <div class="mini-eyebrow">
          CONNECTION ISSUE
        </div>

        <h2>
          We couldn't open Tech Sprint.
        </h2>

        <p>
          Check your internet connection and
          refresh the page to try again.
        </p>

        <button
          type="button"
          class="button button-primary"
          id="reloadTechSprint"
        >
          Try again
          ${icon("refresh", 17)}
        </button>

      </div>
    `;

    container
      .querySelector("#reloadTechSprint")
      .addEventListener("click", () => {
        window.location.reload();
      });
  }
}

main();
