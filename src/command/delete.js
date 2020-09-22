const vscode = require('vscode');
const main = require('../main');

module.exports = function (context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'fishread.bookshelf.delete',
      async (item) => {
        const res = await vscode.window.showQuickPick([
          {
            label: '是',
            value: true,
          },
          {
            label: '否',
            value: false,
          },
        ]);
        if (res.value) {
          main.bookshelf.delete(item.path);
        }
      }
    )
  );
};
