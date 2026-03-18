const BASE_URL = 'https://api.green-api.com';

const elements = {
  idInstance: document.getElementById('idInstance'),
  apiTokenInstance: document.getElementById('apiTokenInstance'),
  chatIdMessage: document.getElementById('chatIdMessage'),
  messageText: document.getElementById('messageText'),
  chatIdFile: document.getElementById('chatIdFile'),
  fileUrl: document.getElementById('fileUrl'),
  responseField: document.getElementById('responseField'),
  getSettingsBtn: document.getElementById('getSettingsBtn'),
  getStateBtn: document.getElementById('getStateBtn'),
  sendMessageBtn: document.getElementById('sendMessageBtn'),
  sendFileBtn: document.getElementById('sendFileBtn')
};

function setResponse(data) {
  if (typeof data === 'string') {
    elements.responseField.value = data;
    return;
  }
  elements.responseField.value = JSON.stringify(data, null, 2);
}

function getCredentials() {
  const idInstance = elements.idInstance.value.trim();
  const apiTokenInstance = elements.apiTokenInstance.value.trim();

  if (!idInstance || !apiTokenInstance) {
    throw new Error('Заполните поля idInstance и ApiTokenInstance');
  }

  return { idInstance, apiTokenInstance };
}

function getFileNameFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const lastSegment = pathname.split('/').filter(Boolean).pop();
    return lastSegment || 'file';
  } catch {
    return 'file';
  }
}

async function request({ method, endpoint, body }) {
  const { idInstance, apiTokenInstance } = getCredentials();
  const url = `${BASE_URL}/waInstance${idInstance}/${endpoint}/${apiTokenInstance}`;

  const options = {
    method,
    headers: {}
  };

  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  setResponse('Загрузка...');

  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({ error: 'Не удалось разобрать ответ сервера' }));

  if (!response.ok) {
    throw new Error(JSON.stringify(data, null, 2));
  }

  setResponse(data);
}

async function handleGetSettings() {
  try {
    await request({ method: 'GET', endpoint: 'getSettings' });
  } catch (error) {
    setResponse(error.message);
  }
}

async function handleGetState() {
  try {
    await request({ method: 'GET', endpoint: 'getStateInstance' });
  } catch (error) {
    setResponse(error.message);
  }
}

async function handleSendMessage() {
  const chatId = elements.chatIdMessage.value.trim();
  const message = elements.messageText.value.trim();

  if (!chatId || !message) {
    setResponse('Заполните поля номера получателя и текста сообщения');
    return;
  }

  try {
    await request({
      method: 'POST',
      endpoint: 'sendMessage',
      body: {
        chatId,
        message
      }
    });
  } catch (error) {
    setResponse(error.message);
  }
}

async function handleSendFile() {
  const chatId = elements.chatIdFile.value.trim();
  const urlFile = elements.fileUrl.value.trim();

  if (!chatId || !urlFile) {
    setResponse('Заполните поля номера получателя и URL файла');
    return;
  }

  try {
    await request({
      method: 'POST',
      endpoint: 'sendFileByUrl',
      body: {
        chatId,
        urlFile,
        fileName: getFileNameFromUrl(urlFile)
      }
    });
  } catch (error) {
    setResponse(error.message);
  }
}

elements.getSettingsBtn.addEventListener('click', handleGetSettings);
elements.getStateBtn.addEventListener('click', handleGetState);
elements.sendMessageBtn.addEventListener('click', handleSendMessage);
elements.sendFileBtn.addEventListener('click', handleSendFile);
