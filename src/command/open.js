const utils = require('../utils');
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const main = require('../main');
const { setCurrPanel, addPanel, delPanel, findPanel } = require('../currPanel');

function invokeCallback(panel, message, resp) {
  // 错误码在400-600之间的，默认弹出错误提示
  if (
    typeof resp == 'object' &&
    resp.code &&
    resp.code >= 400 &&
    resp.code < 600
  ) {
    utils.showError(resp.message || '发生未知错误');
  }
  panel.webview.postMessage({
    cmd: 'vscodeCallback',
    cbid: message.cbid,
    data: resp,
  });
}

function getWebViewContent(context, templatePath) {
  const resourcePath = utils.getExtensionFileAbsolutePath(
    context,
    templatePath
  );
  const dirPath = path.dirname(resourcePath);
  let html = fs.readFileSync(resourcePath, 'utf-8');
  html = html.replace(
    /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g,
    (m, $1, $2) => {
      return (
        $1 +
        vscode.Uri.file(path.resolve(dirPath, $2))
          .with({ scheme: 'vscode-resource' })
          .toString() +
        '"'
      );
    }
  );
  return html;
}

const messageHandler = {
  async currPage(context, message, bookInfo) {
    const content = await main.Drive.currPage(bookInfo);
    invokeCallback(context.panel, message, { content });
  },
};

module.exports = function (context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('fishread.bookshelf.open', (bookInfo) => {
      const { label, path, progress, size } = bookInfo;
      let tragetPanel = null;
      if (!(tragetPanel = findPanel(path))) {
        const panel = vscode.window.createWebviewPanel(
          path, // 视图id
          label, // 标题
          vscode.ViewColumn.One, // 显示在编辑器的哪个部位
          {
            enableScripts: true, // 启用JS，默认禁用
          }
        );
        addPanel(panel);
        panel.webview.html = getWebViewContent(
          context,
          'static/html/book.html'
        );
        const ownContext = { panel };
        panel.webview.onDidReceiveMessage(
          (message) => {
            if (messageHandler[message.cmd]) {
              messageHandler[message.cmd](ownContext, message, bookInfo);
            } else {
              utils.showError('未找到命令:' + message.cmd);
            }
          },
          undefined,
          context.subscriptions
        );
        panel.onDidDispose(
          () => {
            setCurrPanel(null);
            delPanel(panel);
          },
          null,
          context.subscriptions
        );
        panel.onDidChangeViewState(({ webviewPanel }) => {
          if (webviewPanel.active) {
            setCurrPanel(webviewPanel);
          } else {
            setCurrPanel(null);
          }
        });
      } else {
        // todo
        console.log('多开', tragetPanel);
      }
    })
  );
};
