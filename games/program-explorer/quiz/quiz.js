export function initProgramQuiz({ programs, knowledgeMarkdown, switchMode, selectProgramsForComparison, sendChatMessage, statusNote }) {
  const quizContent = document.querySelector('#quizContent');
  const quizPanel = document.querySelector('#quizPanel');
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
  const OFFLINE_QUESTIONS_URL = new URL('./offline-questions.json', import.meta.url);
  const OFFLINE_FLOW_QUESTIONS_URL = new URL('./offline-flow-questions.json', import.meta.url);
  const FIREBASE_QUESTION_READ_ATTEMPTS = 3;
  const SESSION_CACHE_PREFIX = 'program-explorer:firebase:v2:';
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
    let firestoreError;
    for (let attempt = 1; attempt <= FIREBASE_QUESTION_READ_ATTEMPTS; attempt++) {
      try {
        const data = await loadOfflineFirestoreDocument(collectionName, documentId);
        if (!isValid(data)) throw new Error(`Firestore document ${collectionName}/${documentId} has an invalid structure.`);
        return data;
      } catch (error) {
        firestoreError = error;
        if (attempt < FIREBASE_QUESTION_READ_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }

    try {
      const data = await loadLocalFallbackDocument(fileName, documentId);
      if (!isValid(data)) throw new Error(`Local backup ${fileName} document "${documentId}" has an invalid structure.`);
      console.warn(`Using ${fileName} because ${collectionName}/${documentId} could not be loaded after ${FIREBASE_QUESTION_READ_ATTEMPTS} attempts.`, firestoreError);
      return data;
    } catch (localError) {
      throw new Error(`${firestoreError.message} Local backup failed: ${localError.message}`);
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
      OFFLINE_FLOW_QUESTIONS_URL,
      documentId,
      isValid
    );
    writeSessionCache(cacheKey, data);
    offlineQuizFlows[flow] = data;
    return data;
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
        quizError = `Could not load offline quiz questions after retrying Firebase and checking the local backup: ${error.message}`;
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

  async function loadQuizData() {
    try {
      const offlineQuiz = await fetch(OFFLINE_QUESTIONS_URL).then(response => {
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
      renderQuiz();
    } catch (error) {
      statusNote.textContent = `Could not load Program Explorer quiz data: ${error.message}`;
      quizContent.textContent = 'The quiz needs the local gateway question to load first.';
    }
  }

  void loadQuizData();
  return { reset: resetQuiz };
}
