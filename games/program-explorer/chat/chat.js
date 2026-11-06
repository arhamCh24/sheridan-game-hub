export function initProgramChat({ knowledgeMarkdown, statusNote, onOpenQuiz }) {
  const messages = document.querySelector('#chatMessages');
  const input = document.querySelector('#userInput');
  const welcomeMessage = messages.querySelector('.message.bot').cloneNode(true);
  let chatHistory = [];
  let isSending = false;
  let chatSessionId = 0;
  let chatRequestController = null;

  messages.addEventListener('click', event => {
    if (!event.target.closest('#quizInlineLink')) return;
    event.preventDefault();
    onOpenQuiz();
    document.querySelector('#quizTab').focus();
  });
  document.querySelector('#resetChatButton').addEventListener('click', resetChat);
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
      if (!apiUrl || apiUrl.includes('<your-worker>')) throw new Error('Set CHAT_API_URL in chat/chat-config.js to your deployed chat service.');
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
        ? 'I could not connect to the chat service. Check that the backend is running and its address is set in chat/chat-config.js.'
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

  return { sendMessage: sendChatMessage };
}
