const vscode = require('vscode');
const path = require('path');
const main = require('../main');

class BookShelfProvider {
  _onDidChangeTreeData = new vscode.EventEmitter();

  onDidChangeTreeData = this._onDidChangeTreeData.event;

  getTreeItem(element) {
    return element;
  }

  getChildren() {
    return Promise.resolve(
      main.bookshelf
        .get()
        .map(
          ({ label, path, size, progress, byteSize }) =>
            new Item(label, path, size, progress, byteSize)
        )
    );
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }
}

class Item extends vscode.TreeItem {
  constructor(label, path, size, progress, byteSize) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.path = path;
    this.size = size;
    this.progress = progress;
    this.command = {
      title: '打开',
      command: 'fishread.bookshelf.open',
      arguments: [
        {
          label,
          path,
          progress,
          size,
          byteSize,
        },
      ],
    };
  }

  get tooltip() {
    return this.path;
  }

  get description() {
    return ((this.progress / this.size) * 100).toFixed(2) + '%';
  }

  iconPath = {
    light: path.join(__filename, '../../../static/images/book.svg'),
    dark: path.join(__filename, '../../../static/images/book.svg'),
  };
}

module.exports = function () {
  const provider = new BookShelfProvider();
  vscode.window.createTreeView('bookshelf', {
    treeDataProvider: provider,
  });
  return provider;
};
