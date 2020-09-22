const vscode = require('vscode');

exports.activate = function (context) {
  // 视图
  const bookshelf = require('./view/bookshelf')(); // 书架列表

  // 命令
  require('./command/openfile')(context); // 打开文件
  require('./command/delete')(context); // 删除
  require('./command/refresh')(context, bookshelf); // 刷新书架
  require('./command/open')(context); // 打开书本
  require('./command/nextPage')(context); // 下一页
  require('./command/prevPage')(context); // 上一页

  // 事件
  vscode.workspace.onDidChangeConfiguration(() => {
    bookshelf.refresh();
  });
};

exports.deactivate = function () {
  console.log('扩展已被释放');
};
