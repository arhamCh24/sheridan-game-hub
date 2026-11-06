const chatTab = document.querySelector('#chatTab');
const quizTab = document.querySelector('#quizTab');
const compareTab = document.querySelector('#compareTab');
const chatPanel = document.querySelector('#chatPanel');
const quizPanel = document.querySelector('#quizPanel');
const comparePanel = document.querySelector('#comparePanel');
const messages = document.querySelector('#chatMessages');
const input = document.querySelector('#userInput');
const statusNote = document.querySelector('#knowledgeStatus');
const quizContent = document.querySelector('#quizContent');
const programChecklist = document.querySelector('#programChecklist');
const comparisonResults = document.querySelector('#comparisonResults');
const compareSelectedButton = document.querySelector('#compareSelectedButton');
const exportComparisonButton = document.querySelector('#exportComparisonButton');
const compareSelectionCount = document.querySelector('#compareSelectionCount');
const programPicker = document.querySelector('#programPicker');
const programPickerToggle = document.querySelector('#programPickerToggle');
const programPickerStatus = document.querySelector('#programPickerStatus');
const MAX_COMPARE_PROGRAMS = 3;
const FIREBASE_SDK_VERSION = '12.19.0';
const FIREBASE_APP_NAME = 'program-explorer-offline-data';
const FIREBASE_CONFIG = Object.freeze({
  apiKey: 'AIzaSyBzz28k956PafBpkqOiOQY9hzprNP_xoSU',
  authDomain: 'findtheundercover-dea9c.firebaseapp.com',
  projectId: 'findtheundercover-dea9c',
  storageBucket: 'findtheundercover-dea9c.firebasestorage.app',
  messagingSenderId: '503099339526',
  appId: '1:503099339526:web:2b33b817ab4c3863212487'
});
const FIREBASE_QUESTIONS_COLLECTION = 'offline-flow-questions';
const FIREBASE_QUIZ_CONFIG_COLLECTION = 'quiz-config';
const SESSION_CACHE_PREFIX = 'program-explorer:firebase:v1:';
const welcomeMessage = messages.querySelector('.message.bot').cloneNode(true);

let programs = [];
let knowledgeMarkdown = '';
let chatHistory = [];
let isSending = false;
let chatSessionId = 0;
let chatRequestController = null;
let selectedProgramNames = new Set();
let offlineFirestorePromise = null;
const localFallbackDocumentPromises = Object.create(null);

function readSessionCache(key, isValid) {
  try {
    const raw = window.sessionStorage.getItem(`${SESSION_CACHE_PREFIX}${key}`);
    if (raw === null) return null;
    const value = JSON.parse(raw);
    if (isValid(value)) return value;
    window.sessionStorage.removeItem(`${SESSION_CACHE_PREFIX}${key}`);
  } catch (error) {
    console.warn('Could not read the Program Explorer session cache.', error);
  }
  return null;
}

function writeSessionCache(key, value) {
  try {
    window.sessionStorage.setItem(`${SESSION_CACHE_PREFIX}${key}`, JSON.stringify(value));
  } catch (error) {
    console.warn('Could not write the Program Explorer session cache.', error);
  }
}

async function loadKnowledge() {
  try {
    const response = await fetch('program-knowledge.md');
    if (!response.ok) throw new Error('Could not load program-knowledge.md');
    knowledgeMarkdown = await response.text();
    programs = parsePrograms(knowledgeMarkdown);
    if (programs.length !== 14) console.warn(`Expected 14 FAST programs; loaded ${programs.length}.`);
    if (programs.length < 2) throw new Error('The knowledge file needs at least two programs.');
    const offlineQuiz = await fetch('offline-questions.json').then(response => {
      if (!response.ok) throw new Error(`Could not load local gateway question (${response.status}).`);
      return response.json();
    });
    if (!Array.isArray(offlineQuiz.questions) || offlineQuiz.questions.length !== 1) {
      throw new Error('The local gateway question is missing or invalid.');
    }
    const backgroundQuestion = offlineQuiz.questions[0];
    if (typeof backgroundQuestion.question !== 'string' || !Array.isArray(backgroundQuestion.options)) {
      throw new Error('The local gateway question is invalid.');
    }
    const backgroundOptions = backgroundQuestion.options.filter(option => typeof option.text === 'string');
    if (backgroundOptions.length < 2) throw new Error('The local gateway question needs at least two options.');
    firstQuizQuestion.question = backgroundQuestion.question;
    firstQuizQuestion.options = backgroundOptions.map(option => option.text);
    backgroundFlows = Object.fromEntries(backgroundOptions.map(option => [option.text, option.flow]));
    await loadQuizConfigFromFirestore();
    statusNote.textContent = '';
    renderProgramChecklist();
    renderQuiz();
  } catch (error) {
    statusNote.textContent = `Could not load Program Explorer data: ${error.message}`;
    quizContent.textContent = 'The quiz needs the program guide and local gateway question to load first.';
  }
}

async function getOfflineFirestore() {
  if (!offlineFirestorePromise) {
    offlineFirestorePromise = (async () => {
      const sdkBase = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;
      const [appSdk, firestoreSdk] = await Promise.all([
        import(`${sdkBase}/firebase-app.js`),
        import(`${sdkBase}/firebase-firestore.js`)
      ]);
      const firebaseApp = appSdk.getApps().find(app => app.name === FIREBASE_APP_NAME)
        || appSdk.initializeApp(FIREBASE_CONFIG, FIREBASE_APP_NAME);
      return { db: firestoreSdk.getFirestore(firebaseApp), firestoreSdk };
    })().catch(error => {
      offlineFirestorePromise = null;
      throw error;
    });
  }
  return offlineFirestorePromise;
}

async function loadQuizConfigFromFirestore() {
  const cachedConfig = readSessionCache('quiz-config', value =>
    value && typeof value === 'object' && Object.hasOwn(value, 'responseTimeoutMs')
      && (value.responseTimeoutMs === null || (Number.isFinite(value.responseTimeoutMs) && value.responseTimeoutMs >= 0))
  );
  if (cachedConfig) {
    if (Number.isFinite(cachedConfig.responseTimeoutMs)) {
      QUIZ_RESPONSE_TIMEOUT_MS = cachedConfig.responseTimeoutMs;
    }
    return;
  }

  try {
    const { db, firestoreSdk } = await getOfflineFirestore();
    const snapshot = await firestoreSdk.getDocs(
      firestoreSdk.query(
        firestoreSdk.collection(db, FIREBASE_QUIZ_CONFIG_COLLECTION),
        firestoreSdk.limit(1)
      )
    );
    const remoteTimeout = snapshot.docs[0]?.data()?.responseTimeoutMs;
    if (Number.isFinite(remoteTimeout) && remoteTimeout >= 0) {
      QUIZ_RESPONSE_TIMEOUT_MS = remoteTimeout;
      writeSessionCache('quiz-config', { responseTimeoutMs: remoteTimeout });
    } else {
      writeSessionCache('quiz-config', { responseTimeoutMs: null });
    }
  } catch (error) {
    writeSessionCache('quiz-config', { responseTimeoutMs: null });
    console.warn(`Could not load ${FIREBASE_QUIZ_CONFIG_COLLECTION}; using the local timeout setting.`, error);
  }
}

async function loadOfflineFirestoreDocument(collectionName, documentId) {
  const { db, firestoreSdk } = await getOfflineFirestore();
  const snapshot = await firestoreSdk.getDoc(
    firestoreSdk.doc(db, collectionName, documentId)
  );
  if (!snapshot.exists()) throw new Error(`Firestore document ${collectionName}/${documentId} does not exist.`);
  return snapshot.data();
}

async function loadLocalFallbackDocument(fileName, documentId) {
  if (!localFallbackDocumentPromises[fileName]) {
    localFallbackDocumentPromises[fileName] = fetch(fileName).then(response => {
      if (!response.ok) throw new Error(`Could not load ${fileName} (${response.status}).`);
      return response.json();
    }).catch(error => {
      delete localFallbackDocumentPromises[fileName];
      throw error;
    });
  }
  const documents = await localFallbackDocumentPromises[fileName];
  const document = Array.isArray(documents)
    ? documents.find(item => item.id === documentId)
    : documents[documentId];
  if (!document) throw new Error(`Local backup ${fileName} has no document "${documentId}".`);
  return document;
}

async function loadFirestoreOrLocalDocument(collectionName, fileName, documentId, isValid) {
  try {
    const data = await loadOfflineFirestoreDocument(collectionName, documentId);
    if (!isValid(data)) throw new Error(`Firestore document ${collectionName}/${documentId} has an invalid structure.`);
    return data;
  } catch (firestoreError) {
    try {
      const data = await loadLocalFallbackDocument(fileName, documentId);
      if (!isValid(data)) throw new Error(`Local backup ${fileName} document "${documentId}" has an invalid structure.`);
      console.warn(`Using ${fileName} because ${collectionName}/${documentId} could not be loaded.`, firestoreError);
      return data;
    } catch (localError) {
      throw new Error(`${firestoreError.message} Local backup failed: ${localError.message}`);
    }
  }
}

async function loadOfflineFlow(flow) {
  if (offlineQuizFlows[flow]?.questions) return offlineQuizFlows[flow];
  const documentId = `flow_${flow.toLowerCase()}`;
  const isValid = document => document?.questions && typeof document.questions === 'object';
  const cacheKey = `questions:${documentId}`;
  const cachedDocument = readSessionCache(cacheKey, isValid);
  if (cachedDocument) {
    offlineQuizFlows[flow] = cachedDocument;
    return cachedDocument;
  }
  const data = await loadFirestoreOrLocalDocument(
    FIREBASE_QUESTIONS_COLLECTION,
    'offline-flow-questions.json',
    documentId,
    isValid
  );
  writeSessionCache(cacheKey, data);
  offlineQuizFlows[flow] = data;
  return data;
}

function parsePrograms(markdown) {
  return markdown.split(/^# Program Name:\s*/m).slice(1).map(section => {
    const [heading, ...lines] = section.split('\n');
    return {
      name: heading.trim(),
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

function renderProgramChecklist() {
  programChecklist.replaceChildren();
  for (const program of programs) {
    const label = document.createElement('label');
    label.className = 'program-check-option';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = program.name;
    checkbox.checked = selectedProgramNames.has(program.name);
    checkbox.disabled = selectedProgramNames.size >= MAX_COMPARE_PROGRAMS && !checkbox.checked;
    checkbox.addEventListener('change', () => {
      if (checkbox.checked && selectedProgramNames.size >= MAX_COMPARE_PROGRAMS) {
        checkbox.checked = false;
        compareSelectionCount.textContent = `You can compare up to ${MAX_COMPARE_PROGRAMS} programs.`;
        return;
      }
      if (checkbox.checked) selectedProgramNames.add(program.name);
      else selectedProgramNames.delete(program.name);
      comparisonResults.replaceChildren();
      updateCompareSelection();
    });
    const name = document.createElement('span');
    name.textContent = program.name;
    label.append(checkbox, name);
    programChecklist.append(label);
  }
  updateCompareSelection();
}

function updateCompareSelection() {
  const count = selectedProgramNames.size;
  programChecklist.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.disabled = count >= MAX_COMPARE_PROGRAMS && !checkbox.checked;
  });
  compareSelectionCount.textContent = count < 2
    ? `${count} selected · Select at least two programs.`
    : count === MAX_COMPARE_PROGRAMS
      ? `${count} programs selected · Maximum reached.`
      : `${count} programs selected.`;
  compareSelectedButton.disabled = count < 2;
  exportComparisonButton.disabled = count < 2;
  programPickerStatus.textContent = `${count} ${count === 1 ? 'program is' : 'programs are'} selected`;
  if (count === 0) setProgramPickerExpanded(true);
}

function setProgramPickerExpanded(expanded) {
  programPicker.hidden = !expanded;
  programPickerToggle.setAttribute('aria-expanded', String(expanded));
  programPickerToggle.textContent = expanded ? 'Hide program choices ↑' : 'Choose programs ↓';
  comparePanel.classList.toggle('program-picker-collapsed', !expanded);
}

function selectProgramsForComparison(names) {
  selectedProgramNames = new Set(names.filter(name => programs.some(program => program.name === name)));
  renderProgramChecklist();
  renderComparisonTable();
  switchMode('compare');
}

function renderComparisonTable() {
  const selected = programs.filter(program => selectedProgramNames.has(program.name));
  if (selected.length < 2) {
    comparisonResults.replaceChildren();
    if (selectedProgramNames.size === 0) setProgramPickerExpanded(true);
    return;
  }

  const fields = [
    ['Credential', 'credential'],
    ['Duration', 'duration'],
    ['Co-op', 'coop'],
    ['Curriculum', 'curriculum'],
    ['Key highlights', 'highlights'],
    ['Career paths', 'careers']
  ];
  const wrapper = document.createElement('div');
  wrapper.className = 'comparison-table-wrap';
  const table = document.createElement('table');
  table.className = 'comparison-table';
  table.style.tableLayout = 'fixed';
  const head = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const detailHeader = document.createElement('th');
  detailHeader.scope = 'col';
  detailHeader.textContent = 'Program details';
  headerRow.append(detailHeader);
  for (const program of selected) {
    const header = document.createElement('th');
    header.scope = 'col';
    header.textContent = program.name;
    headerRow.append(header);
  }
  head.append(headerRow);
  const body = document.createElement('tbody');
  for (const [label, field] of fields) {
    const row = document.createElement('tr');
    const rowHeader = document.createElement('th');
    rowHeader.scope = 'row';
    rowHeader.textContent = label;
    row.append(rowHeader);
    for (const program of selected) {
      const cell = document.createElement('td');
      cell.append(createComparisonList(program, field));
      row.append(cell);
    }
    body.append(row);
  }
  table.append(head, body);
  wrapper.append(table);
  comparisonResults.replaceChildren(wrapper, createMobileComparison(selected, fields));
  setProgramPickerExpanded(false);
}

function createMobileComparison(selected, fields) {
  const cards = document.createElement('div');
  cards.className = 'comparison-mobile-cards';
  for (const [label, field] of fields) {
    const card = document.createElement('article');
    card.className = 'comparison-mobile-card';
    const heading = document.createElement('h3');
    heading.textContent = label;
    card.append(heading);
    const comparisons = document.createElement('div');
    comparisons.className = 'comparison-mobile-values';
    for (const program of selected) {
      const comparison = document.createElement('div');
      comparison.className = 'comparison-mobile-value';
      const programName = document.createElement('h4');
      programName.textContent = program.name;
      const description = document.createElement('div');
      description.append(createComparisonList(program, field));
      comparison.append(programName, description);
      comparisons.append(comparison);
    }
    card.append(comparisons);
    cards.append(card);
  }
  return cards;
}

function createComparisonList(program, field) {
  const items = formatComparisonItems(program[field]);
  if (!items.length) items.push('Not listed in the program guide.');
  const list = document.createElement('ul');
  list.className = 'comparison-bullets';
  for (const item of items) {
    const bullet = document.createElement('li');
    bullet.textContent = item;
    list.append(bullet);
  }
  return list;
}

function formatComparisonItems(value) {
  if (!value) return [];
  const maxLength = 145;
  return value.split(/;\s*/).map(item => item.trim()).filter(Boolean).map(item => {
    if (item.length <= maxLength) return item;
    const shortened = item.slice(0, maxLength).replace(/\s+\S*$/, '').trimEnd();
    return `${shortened}…`;
  });
}

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
messages.addEventListener('click', event => {
  if (!event.target.closest('#quizInlineLink')) return;
  event.preventDefault();
  resetQuiz();
  switchMode('quiz');
  quizTab.focus();
});
document.querySelector('#resetChatButton').addEventListener('click', resetChat);
compareSelectedButton.addEventListener('click', renderComparisonTable);
programPickerToggle.addEventListener('click', () => {
  const isExpanded = programPickerToggle.getAttribute('aria-expanded') === 'true';
  setProgramPickerExpanded(!isExpanded);
});
window.addEventListener('resize', () => {
  if (window.innerWidth <= 700 && programPicker.hidden) {
    setProgramPickerExpanded(true);
  }
});
exportComparisonButton.addEventListener('click', () => {
  window.print();
});
document.querySelector('#clearCompareButton').addEventListener('click', () => {
  selectedProgramNames.clear();
  comparisonResults.replaceChildren();
  renderProgramChecklist();
});

document.querySelector('#chatForm').addEventListener('submit', event => {
  event.preventDefault();
  void sendChatMessage(input.value.trim());
});

async function sendChatMessage(question) {
  if (!question || isSending) return;
  const requestSessionId = chatSessionId;
  const controller = new AbortController();
  chatRequestController = controller;
  addMessage(question, 'user');
  input.value = '';
  isSending = true;
  input.disabled = true;
  document.querySelector('#chatForm button').disabled = true;
  const loading = addTypingIndicator();
  let answerStarted = false;
  const thinkingTimer = setTimeout(() => {
    if (requestSessionId !== chatSessionId || answerStarted || !loading.isConnected) return;
    const note = document.createElement('span');
    note.className = 'typing-note';
    note.textContent = 'I’m working through your question. Responses may take a little longer when the service is busy.';
    loading.append(note);
    messages.scrollTop = messages.scrollHeight;
  }, 2000);
  try {
    const apiUrl = window.CHAT_API_URL;
    if (!apiUrl || apiUrl.includes('<your-worker>')) throw new Error('Set CHAT_API_URL in chat-config.js to your deployed chat service.');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: question,
        history: chatHistory.slice(-12),
        knowledge: knowledgeMarkdown
      }),
      signal: controller.signal
    });
    if (requestSessionId !== chatSessionId) return;
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || `Chat service returned ${response.status}.`);
    }
    const answer = await readChatAnswer(response, partialAnswer => {
      answerStarted = true;
      clearTimeout(thinkingTimer);
      loading.classList.remove('typing-message');
      renderChatAnswer(loading, partialAnswer);
      messages.scrollTop = messages.scrollHeight;
    });
    if (requestSessionId !== chatSessionId) return;
    if (!answer) throw new Error('The chat service returned an empty response.');
    answerStarted = true;
    loading.classList.remove('typing-message');
    renderChatAnswer(loading, answer);
    chatHistory.push({ role: 'user', text: question }, { role: 'model', text: answer });
    statusNote.textContent = '';
  } catch (error) {
    if (requestSessionId !== chatSessionId || error.name === 'AbortError') return;
    loading.textContent = error.message.includes('Failed to fetch')
      ? 'I could not connect to the chat service. Check that the backend is running and its address is set in chat-config.js.'
      : error.message;
    statusNote.textContent = 'Chat service unavailable';
  } finally {
    clearTimeout(thinkingTimer);
    if (requestSessionId === chatSessionId) {
      isSending = false;
      chatRequestController = null;
      input.disabled = false;
      document.querySelector('#chatForm button').disabled = false;
      input.focus();
    }
  }
}

function renderChatAnswer(container, text) {
  container.replaceChildren();
  const appendText = (parent, value) => {
    value.split('\n').forEach((line, index) => {
      if (index) parent.append(document.createElement('br'));
      if (line) parent.append(document.createTextNode(line));
    });
  };

  const boldPattern = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  for (const match of text.matchAll(boldPattern)) {
    appendText(container, text.slice(lastIndex, match.index));
    const bold = document.createElement('strong');
    appendText(bold, match[1]);
    container.append(bold);
    lastIndex = match.index + match[0].length;
  }
  appendText(container, text.slice(lastIndex));
}

async function readChatAnswer(response, onPartialAnswer) {
  const contentType = response.headers.get('content-type') || '';
  const isEventStream = contentType.includes('text/event-stream');
  const isLineStream = contentType.includes('application/x-ndjson') || contentType.includes('application/ndjson');
  const isPlainStream = contentType.startsWith('text/plain');

  if (!response.body?.getReader || (!isEventStream && !isLineStream && !isPlainStream)) {
    const result = await response.json().catch(() => ({}));
    if (result.error) throw new Error(result.error);
    return result.answer || '';
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let answer = '';

  const publish = chunk => {
    if (typeof chunk !== 'string' || !chunk) return;
    answer = chunk.startsWith(answer) ? chunk : answer + chunk;
    onPartialAnswer(answer);
  };
  const processLine = line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (isEventStream && !trimmed.startsWith('data:')) return;
    const data = isEventStream ? trimmed.slice(5).trim() : trimmed;
    if (!data || data === '[DONE]') return;
    try {
      const payload = JSON.parse(data);
      if (payload.error) throw new Error(payload.error);
      const chunk = payload.choices?.[0]?.delta?.content
        ?? payload.delta?.content
        ?? payload.delta?.text
        ?? payload.token
        ?? payload.content
        ?? payload.answer
        ?? payload.text;
      publish(chunk);
    } catch (error) {
      if (error instanceof SyntaxError) publish(data);
      else throw error;
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    if (isPlainStream) {
      publish(buffer);
      buffer = '';
    } else {
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';
      lines.forEach(processLine);
    }
    if (done) break;
  }
  if (buffer.trim()) processLine(buffer);
  return answer;
}

function resetChat() {
  chatSessionId++;
  chatRequestController?.abort();
  chatRequestController = null;
  chatHistory = [];
  isSending = false;
  messages.replaceChildren(welcomeMessage.cloneNode(true));
  input.value = '';
  input.disabled = false;
  document.querySelector('#chatForm button').disabled = false;
  statusNote.textContent = '';
  input.focus();
}

function addMessage(text, role) {
  const bubble = document.createElement('div');
  bubble.className = `message ${role}`;
  bubble.textContent = text;
  messages.append(bubble);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}

function addTypingIndicator() {
  const bubble = document.createElement('div');
  bubble.className = 'message bot typing-message';
  bubble.setAttribute('role', 'status');
  bubble.setAttribute('aria-label', 'The assistant is thinking');
  bubble.innerHTML = '<span class="typing-label">Thinking</span><span class="typing-dots" aria-hidden="true"><i></i><i></i><i></i></span>';
  messages.append(bubble);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}

const firstQuizQuestion = { question: '', options: [] };
let offlineQuizFlows = {};
let backgroundFlows = Object.create(null);
let selectedLocalFlow = null;
let localQuizMode = false;
let quizRequestId = 0;
let quizRequestController = null;
let QUIZ_RESPONSE_TIMEOUT_MS = Number.isFinite(window.QUIZ_CONFIG?.responseTimeoutMs)
  ? Math.max(0, window.QUIZ_CONFIG.responseTimeoutMs)
  : 2500;
let quizQuestions = [firstQuizQuestion];
let quizAnswers = [];
let currentQuestion = 0;
let quizRecommendations = [];
let quizLoading = false;
let quizError = '';

function makeLocalQuizQuestion(questionId) {
  const flowQuestions = selectedLocalFlow && offlineQuizFlows[selectedLocalFlow]?.questions;
  const item = flowQuestions?.[questionId];
  if (!item || typeof item.question !== 'string' || !Array.isArray(item.options)) return null;
  return {
    id: questionId,
    offlineId: questionId,
    offlineFlow: selectedLocalFlow,
    question: item.question,
    options: item.options.map(option => option.text).filter(Boolean)
  };
}

function resolveCatalogProgramName(name) {
  return programs.find(program => program.name === name) || null;
}

function setLocalRecommendation(result) {
  if (!result?.primary) throw new Error('The selected answer has no recommendation configured.');
  quizRecommendations = [result.primary, result.secondary].filter(Boolean).map(name => ({
    name,
    catalogName: name
  }));
  currentQuestion = quizQuestions.length;
}

async function showLocalQuizFallback(controller, requestId) {
  if (!selectedLocalFlow) return false;
  controller?.abort();
  if (quizRequestController === controller) quizRequestController = null;
  try {
    await loadOfflineFlow(selectedLocalFlow);
  } catch (error) {
    if (requestId === quizRequestId) {
      quizError = `Could not load offline questions from Firebase: ${error.message}`;
    }
    return false;
  }
  if (requestId !== quizRequestId) return true;
  localQuizMode = true;
  quizQuestions = [firstQuizQuestion];
  quizAnswers = quizAnswers.slice(0, 1);
  quizRecommendations = [];
  const firstQuestionId = selectedLocalFlow === 'A' ? 'A1' : 'B1';
  const firstLocalQuestion = makeLocalQuizQuestion(firstQuestionId);
  if (!firstLocalQuestion) return false;
  quizQuestions.push(firstLocalQuestion);
  currentQuestion = 1;
  return true;
}

async function requestQuizStep() {
  const requestId = ++quizRequestId;
  let fallbackAttempted = false;
  quizLoading = true;
  quizError = '';
  renderQuiz();
  try {
    if (localQuizMode) {
      await new Promise(resolve => setTimeout(resolve, 200));
      if (requestId !== quizRequestId) return;
      await loadOfflineFlow(selectedLocalFlow);
      if (requestId !== quizRequestId) return;
      const previousQuestion = quizQuestions[currentQuestion];
      const previousId = previousQuestion?.offlineId;
      const questionFlow = previousQuestion?.offlineFlow || selectedLocalFlow;
      const previousDefinition = offlineQuizFlows[questionFlow]?.questions?.[previousId];
      const answer = quizAnswers[currentQuestion];
      const chosenOption = previousDefinition?.options?.find(option => option.text === answer);
      if (!chosenOption) throw new Error('Could not match your answer to the offline quiz flow.');

      let nextQuestionId = null;
      if (chosenOption.redirect_to_flow_a) {
        selectedLocalFlow = 'A';
        await loadOfflineFlow('A');
        nextQuestionId = chosenOption.redirect_to_flow_a;
      } else if (chosenOption.next_question) {
        selectedLocalFlow = questionFlow;
        nextQuestionId = chosenOption.next_question;
      } else if (chosenOption.result) {
        setLocalRecommendation(chosenOption.result);
      } else {
        throw new Error('The selected answer has no next question or recommendation.');
      }
      if (nextQuestionId) {
        const nextQuestion = makeLocalQuizQuestion(nextQuestionId);
        if (!nextQuestion) throw new Error(`Offline quiz question ${nextQuestionId} is missing.`);
        quizQuestions.push(nextQuestion);
        currentQuestion = quizQuestions.length - 1;
      }
    } else {
      const controller = new AbortController();
      quizRequestController = controller;
      const quizUrl = new URL(window.CHAT_API_URL);
      quizUrl.pathname = quizUrl.pathname.replace(/\/api\/chat\/?$/, '/api/quiz');
      const requestPromise = fetch(quizUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          answers: quizAnswers.map((answer, index) => ({
            question: quizQuestions[index].question,
            answer,
            ...(index === 0 && backgroundFlows[answer] ? { flow: backgroundFlows[answer] } : {})
          })),
          knowledge: knowledgeMarkdown
        })
      }).then(async response => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || `Quiz service returned ${response.status}.`);
        return result;
      });
      let timeoutId;
      const outcome = await Promise.race([
        requestPromise.then(result => ({ type: 'response', result }), error => ({ type: 'error', error })),
        new Promise(resolve => {
          timeoutId = setTimeout(() => resolve({ type: 'timeout' }), QUIZ_RESPONSE_TIMEOUT_MS);
        })
      ]);
      clearTimeout(timeoutId);
      if (requestId !== quizRequestId) return;

      if (outcome.type === 'timeout' || outcome.type === 'error') {
        fallbackAttempted = true;
        if (await showLocalQuizFallback(controller, requestId)) return;
        if (quizError) throw new Error(quizError);
        if (outcome.type === 'error') throw outcome.error;
        throw new Error('The quiz service did not respond. Please try again.');
      }

      const result = outcome.result;
      if (result.type === 'question' && result.question && Array.isArray(result.options) && result.options.length >= 2) {
        quizQuestions.push({ question: result.question, options: result.options });
        currentQuestion = quizQuestions.length - 1;
      } else if (result.type === 'recommendation' && Array.isArray(result.programs) && result.programs.length) {
        quizRecommendations = result.programs.slice(0, 3);
        currentQuestion = quizQuestions.length;
      } else {
        fallbackAttempted = true;
        if (await showLocalQuizFallback(controller, requestId)) return;
        if (quizError) throw new Error(quizError);
        throw new Error('The quiz service returned an incomplete result. Please try again.');
      }
    }
  } catch (error) {
    if (requestId === quizRequestId) {
      if (!localQuizMode && !fallbackAttempted) {
        fallbackAttempted = true;
        if (await showLocalQuizFallback(quizRequestController, requestId)) return;
      }
      if (!quizError) {
        quizError = error.message.includes('Failed to fetch')
          ? 'Could not connect to the quiz service. Please check your connection and try again.'
          : error.message;
      }
    }
  } finally {
    if (requestId === quizRequestId) {
      quizRequestController = null;
      quizLoading = false;
      renderQuiz();
    }
  }
}

function resetQuiz() {
  quizRequestId++;
  quizRequestController?.abort();
  quizRequestController = null;
  quizQuestions = [firstQuizQuestion];
  quizAnswers = [];
  currentQuestion = 0;
  quizRecommendations = [];
  selectedLocalFlow = null;
  localQuizMode = false;
  quizLoading = false;
  quizError = '';
  renderQuiz();
}

function renderQuiz() {
  const back = document.querySelector('#backButton');
  const restart = document.querySelector('#restartButton');
  const actions = document.querySelector('.quiz-actions');
  const count = document.querySelector('#quizCount');
  const progress = document.querySelector('#progressBar');
  quizContent.replaceChildren();
  actions.querySelector('.compare-recommendations-button')?.remove();
  quizPanel.classList.toggle('showing-recommendations', quizRecommendations.length > 0);

  if (quizRecommendations.length) {
    count.textContent = 'Your recommendations';
    progress.style.width = '100%';
    back.hidden = true;
    restart.hidden = false;
    const card = document.createElement('div');
    card.className = 'result-card';
    const label = document.createElement('p');
    label.className = 'result-label';
    label.textContent = 'Programs that could be a good fit for you';
    card.append(label);
    const programList = document.createElement('div');
    programList.className = 'recommended-program-list';
    quizRecommendations.forEach((recommendation, index) => {
      const program = programs.find(item => item.name === (recommendation.catalogName || recommendation.name));
      const programCard = document.createElement('article');
      programCard.className = 'recommended-program-card';
      const heading = document.createElement('h3');
      heading.textContent = `${index + 1}. ${recommendation.name}`;
      programCard.append(heading);
      if (recommendation.reason) {
        const reason = document.createElement('p');
        reason.textContent = recommendation.reason;
        programCard.append(reason);
      }
      const details = document.createElement('p');
      const credentialLabel = document.createElement('strong');
      credentialLabel.textContent = 'Credential: ';
      const durationLabel = document.createElement('strong');
      durationLabel.textContent = 'Duration: ';
      const coopLabel = document.createElement('strong');
      coopLabel.textContent = 'Co-op: ';
      const highlightsLabel = document.createElement('strong');
      highlightsLabel.textContent = 'Key Program Highlights: ';
      const careersLabel = document.createElement('strong');
      careersLabel.textContent = 'Career paths: ';
      details.append(
        credentialLabel, document.createTextNode(program?.credential || 'Not specified'),
        document.createTextNode(' · '), durationLabel, document.createTextNode(program?.duration || 'Not specified'),
        document.createTextNode(' · '), coopLabel, document.createTextNode(program?.coop || 'Not specified'),
        document.createElement('br'), highlightsLabel, document.createTextNode(program?.highlights || 'Not specified'),
        document.createElement('br'), careersLabel, document.createTextNode(program?.careers || 'Not specified')
      );
      programCard.append(details);
      const learnMore = document.createElement('button');
      learnMore.className = 'text-button learn-more-button';
      learnMore.type = 'button';
      learnMore.textContent = 'Learn more about this program';
      learnMore.hidden = !program;
      learnMore.addEventListener('click', () => {
        switchMode('chat');
        void sendChatMessage(`Tell me more about the ${program.name} program, including its curriculum, key highlights, and career paths.`);
      });
      programCard.append(learnMore);
      programList.append(programCard);
    });
    card.append(programList);
    const comparableRecommendations = quizRecommendations
      .map(item => ({ ...item, catalogName: item.catalogName || resolveCatalogProgramName(item.name) }))
      .filter(item => item.catalogName);
    if (comparableRecommendations.length > 1) {
      const compareRecommendations = document.createElement('button');
      compareRecommendations.className = 'primary-button compare-recommendations-button';
      compareRecommendations.type = 'button';
      compareRecommendations.textContent = 'Compare my recommendations';
      compareRecommendations.addEventListener('click', () => {
        selectProgramsForComparison(comparableRecommendations.map(item => item.catalogName));
      });
      actions.append(compareRecommendations);
    }
    quizContent.append(card);
    return;
  }

  const question = quizQuestions[currentQuestion];
  count.textContent = `Question ${currentQuestion + 1}`;
  const flowLength = Object.keys(offlineQuizFlows[selectedLocalFlow]?.questions || {}).length
    || Math.max(0, ...Object.values(offlineQuizFlows).map(flow => Object.keys(flow.questions || {}).length));
  const totalQuestions = flowLength + 1;
  progress.style.width = `${Math.min(95, ((currentQuestion + 1) / totalQuestions) * 100)}%`;
  progress.classList.toggle('is-loading', quizLoading);
  back.hidden = currentQuestion === 0 || quizLoading;
  restart.hidden = true;

  if (quizLoading) {
    const waiting = document.createElement('div');
    waiting.className = 'quiz-thinking';
    waiting.setAttribute('role', 'status');
    waiting.setAttribute('aria-live', 'polite');
    const spinner = document.createElement('span');
    spinner.className = 'quiz-spinner';
    spinner.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('div');
    const heading = document.createElement('p');
    heading.className = 'quiz-thinking-title';
    heading.textContent = 'Thinking through your answers';
    const detail = document.createElement('p');
    detail.className = 'quiz-thinking-detail';
    detail.textContent = 'Finding a useful next question or program match…';
    copy.append(heading, detail);
    waiting.append(spinner, copy);
    quizContent.append(waiting);
    return;
  }
  if (quizError) {
    const error = document.createElement('p');
    error.className = 'question-panel-title';
    error.textContent = quizError;
    const retry = document.createElement('button');
    retry.className = 'primary-button';
    retry.type = 'button';
    retry.textContent = 'Try again';
    retry.addEventListener('click', requestQuizStep);
    quizContent.append(error, retry);
    return;
  }
  if (!question) return;
  const prompt = document.createElement('h3');
  prompt.className = 'question-panel-title';
  prompt.textContent = question.question;
  const list = document.createElement('div');
  list.className = 'options-list';
  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option';
    const letter = document.createElement('span');
    letter.className = 'option-letter';
    letter.textContent = String.fromCharCode(65 + index);
    const label = document.createElement('span');
    label.textContent = option;
    const indicator = document.createElement('span');
    indicator.className = 'option-indicator';
    indicator.textContent = '○';
    indicator.setAttribute('aria-hidden', 'true');
    button.append(letter, label, indicator);
    button.addEventListener('click', () => {
      quizAnswers[currentQuestion] = option;
      if (currentQuestion === 0) {
        selectedLocalFlow = backgroundFlows[option] || null;
      }
      quizQuestions = quizQuestions.slice(0, currentQuestion + 1);
      quizAnswers = quizAnswers.slice(0, currentQuestion + 1);
      quizRecommendations = [];
      requestQuizStep();
    });
    list.append(button);
  });
  quizContent.append(prompt, list);
}

document.querySelector('#backButton').addEventListener('click', () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    const previousQuestion = quizQuestions[currentQuestion];
    if (currentQuestion === 0) {
      selectedLocalFlow = null;
    } else if (localQuizMode && previousQuestion?.offlineId) {
      selectedLocalFlow = previousQuestion.offlineFlow || selectedLocalFlow;
    }
    quizQuestions = quizQuestions.slice(0, currentQuestion + 1);
    quizAnswers = quizAnswers.slice(0, currentQuestion);
    quizRecommendations = [];
    quizError = '';
    renderQuiz();
  }
});
document.querySelector('#restartButton').addEventListener('click', resetQuiz);
loadKnowledge();
