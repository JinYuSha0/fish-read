const vscode = require('vscode');
const utils = require('../utils');
const main = require('../main');
const { getCurrPanel } = require('../currPanel');

module.exports = function (context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('fishread.book.nextPage', async () => {
      const currPanel = getCurrPanel();
      if (currPanel) {
        const bookInfo = main.bookshelf.findOne(currPanel.viewType);
        const content = await main.Drive.nextPage(bookInfo);
        main.Drive.contentChange(currPanel, content);
      } else {
        utils.showError('未知页面');
      }
    })
  );
};
