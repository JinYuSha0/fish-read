const vscode = acquireVsCodeApi();
const callbasks = {};

const p = document.createElement('p');
p.className = 'book';
document.body.append(p);

function callVscode(data, cb) {
  if (typeof data === 'string') {
    data = { cmd: data };
  }
  if (cb) {
    const cbid = Math.random().toString(36).slice(2);
    data.cbid = cbid;
    callbasks[cbid] = cb;
  }
  vscode.postMessage(data);
}

function onContentChange(data) {
  p.innerText = data.trim();
  document.body.scrollTop = document.documentElement.scrollTop = 0;
}

window.addEventListener('message', (event) => {
  const { cmd, cbid, data } = event.data;
  switch (cmd) {
    case 'vscodeCallback':
      (callbasks[cbid] || function () {})(data);
      delete callbasks[cbid];
      break;
    case 'contentChange':
      onContentChange(data);
      break;
    default:
      break;
  }
});

window.onload = function () {
  callVscode('currPage', function ({ content }) {
    p.innerText = content;
  });
};
