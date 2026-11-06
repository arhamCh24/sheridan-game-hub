import { initProgramChat } from './chat/chat.js';
import { initProgramComparison } from './comparison/comparison.js';
import { initProgramQuiz } from './quiz/quiz.js';

const chatTab = document.querySelector('#chatTab');
const quizTab = document.querySelector('#quizTab');
const compareTab = document.querySelector('#compareTab');
const chatPanel = document.querySelector('#chatPanel');
const quizPanel = document.querySelector('#quizPanel');
const comparePanel = document.querySelector('#comparePanel');
const statusNote = document.querySelector('#knowledgeStatus');
const quizContent = document.querySelector('#quizContent');

function switchMode(mode) {
  const chatActive = mode === 'chat';
  const quizActive = mode === 'quiz';
  chatTab.classList.toggle('is-active', chatActive);
  quizTab.classList.toggle('is-active', quizActive);
  compareTab.classList.toggle('is-active', mode === 'compare');
  chatTab.setAttribute('aria-selected', String(chatActive));
  quizTab.setAttribute('aria-selected', String(quizActive));
  compareTab.setAttribute('aria-selected', String(mode === 'compare'));
  chatPanel.hidden = !chatActive;
  quizPanel.hidden = !quizActive;
  comparePanel.hidden = mode !== 'compare';
}

chatTab.addEventListener('click', () => switchMode('chat'));
quizTab.addEventListener('click', () => switchMode('quiz'));
compareTab.addEventListener('click', () => switchMode('compare'));

function parsePrograms(markdown) {
  return markdown.split(/^# Program Name:\s*/m).slice(1).map(section => {
    const [heading, ...lines] = section.split('\n');
    return {
      name: heading.trim(),
      homepage: `https://www.sheridancollege.ca/programs${readProgramField(lines, 'Homepage')}`,
      credential: readProgramField(lines, 'Credential Level'),
      duration: readProgramField(lines, 'Duration'),
      coop: readProgramField(lines, 'Co-op'),
      curriculum: readProgramField(lines, 'Core Curriculum & Technical Skills'),
      highlights: readProgramField(lines, 'Key Program Highlights'),
      careers: readProgramField(lines, 'Career Paths & Job Titles')
    };
  });
}

function readProgramField(lines, label) {
  const fieldIndex = lines.findIndex(line => line.startsWith(`- **${label}**:`));
  if (fieldIndex < 0) return '';
  const firstValue = lines[fieldIndex].replace(`- **${label}**:`, '').trim();
  const values = firstValue ? [firstValue] : [];
  for (let index = fieldIndex + 1; index < lines.length && /^\s+- /.test(lines[index]); index++) {
    values.push(lines[index].replace(/^\s+- /, '').trim());
  }
  return values.join('; ');
}

async function loadProgramGuide() {
  try {
    const response = await fetch('program-knowledge.md');
    if (!response.ok) throw new Error('Could not load program-knowledge.md');
    const knowledgeMarkdown = await response.text();
    const programs = parsePrograms(knowledgeMarkdown);
    if (programs.length !== 14) console.warn(`Expected 14 FAST programs; loaded ${programs.length}.`);
    if (programs.length < 2) throw new Error('The knowledge file needs at least two programs.');

    const comparison = initProgramComparison(programs, switchMode);
    let chat;
    const quiz = initProgramQuiz({
      programs,
      knowledgeMarkdown,
      switchMode,
      selectProgramsForComparison: comparison.selectProgramsForComparison,
      sendChatMessage: message => chat.sendMessage(message),
      statusNote
    });
    chat = initProgramChat({
      knowledgeMarkdown,
      statusNote,
      onOpenQuiz: () => {
        quiz.reset();
        switchMode('quiz');
      }
    });
  } catch (error) {
    statusNote.textContent = `Could not load Program Explorer data: ${error.message}`;
    quizContent.textContent = 'The quiz needs the program guide to load first.';
  }
}

void loadProgramGuide();
