const vscode = require('vscode');
const main = require('../main');
const chardet = require('chardet');

module.exports = function (context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('fishread.openfile', async () => {
      try {
        let file = await vscode.window.showOpenDialog({
          canSelectFiles: true,
          canSelectFolders: false,
          canSelectMany: false,
          filters: {
            Text: ['txt'],
          },
          title: '选择文件',
        });
        if (file && file[0]) {
          try {
            file = file[0];
            const encoding = await chardet.detectFile(file.path);
            file.encoding = encoding;
            main.bookshelf.add(file);
            vscode.window.showInformationMessage('选择文件成功');
          } catch (err) {
            vscode.window.showWarningMessage(err.message);
          }
        }
      } catch (err) {
        vscode.window.showErrorMessage('选择文件失败' + err.message);
      }
    })
  );
};
