const vscode = require('vscode');

module.exports = function (context, bookshelfInstance) {
  context.subscriptions.push(
    vscode.commands.registerCommand('fishread.bookshelf.refresh', () => {
      bookshelfInstance.refresh();
    })
  );
};
