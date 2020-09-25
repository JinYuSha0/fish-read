const vscode = require('vscode');
const utils = require('./utils');
const fs = require('fs');

exports.bookshelf = {
  get: function () {
    return vscode.workspace.getConfiguration().get('fishread.bookshelf.list');
  },
  add: function (file) {
    const list = this.get();
    const { path, encoding } = file;
    if (!list.find((o) => o.path === path)) {
      list.push(
        new this.item(
          utils.getFileName(path),
          path,
          utils.getFileSize(path),
          encoding
        )
      );
      this.update(list);
    } else {
      throw new Error('文件已经存在');
    }
  },
  delete: function (path) {
    const list = this.get().filter((o) => o.path !== path);
    this.update(list);
  },
  update: function (list) {
    vscode.workspace
      .getConfiguration()
      .update('fishread.bookshelf.list', list, true);
  },
  updateOne: function (path, bookInfo) {
    if (bookInfo.progress < 0) {
      bookInfo.progress = 0;
      bookInfo.byteSize = 0;
    }
    const list = this.get();
    let index = list.findIndex((book) => book.path === path);
    list.splice(index, 1, bookInfo);
    this.update(list);
  },
  findOne: function (path) {
    const list = this.get();
    const bookInfo = list.find((book) => book.path === path);
    return bookInfo || null;
  },
  item: function (label, path, size, encoding, progress) {
    this.label = label;
    this.path = path;
    this.size = size;
    this.encoding = encoding;
    this.progress = progress || 0;
    this.byteSize = 0;
  },
};

exports.Drive = {
  getPageSize: function () {
    return vscode.workspace.getConfiguration().get('fishread.book.pageSize');
  },
  currPage: async function (bookInfo) {
    const pageSize = this.getPageSize();
    bookInfo = utils.cloneDeep(bookInfo);
    const { progress, byteSize } = bookInfo;
    let content = '';
    if (bookInfo.byteSize > 0) {
      content = await readContentPointStartEnd(
        bookInfo,
        progress,
        progress + byteSize
      );
    } else {
      const res = await nextPage(bookInfo, pageSize);
      content = res.content;
      bookInfo.byteSize = res.byteSize;
      exports.bookshelf.updateOne(bookInfo.path, bookInfo);
    }
    return content;
  },
  nextPage: async function (bookInfo) {
    const pageSize = this.getPageSize();
    bookInfo = utils.cloneDeep(bookInfo);
    const { content, byteSize } = await nextPage(bookInfo, pageSize);
    bookInfo.progress += bookInfo.byteSize;
    bookInfo.byteSize = byteSize;
    exports.bookshelf.updateOne(bookInfo.path, bookInfo);
    return content;
  },
  prevPage: async function (bookInfo, update) {
    const pageSize = this.getPageSize();
    bookInfo = utils.cloneDeep(bookInfo);
    const { content, byteSize } = await prevPage(bookInfo, pageSize);
    bookInfo.progress -= byteSize;
    bookInfo.byteSize = byteSize;
    exports.bookshelf.updateOne(bookInfo.path, bookInfo);
    return content;
  },
  contentChange: function (panel, resp) {
    panel.webview.postMessage({
      cmd: 'contentChange',
      data: resp,
    });
  },
};

function nextPage(bookInfo, num) {
  if (num === 0 || !bookInfo) {
    return Promise.resolve({
      content: '',
      byteSize: 0,
    });
  }
  return new Promise((resolve, reject) => {
    const countSize = Math.abs(num * 4);
    const { path, progress, size, encoding, byteSize } = bookInfo;
    let start = progress + byteSize,
      end = start + countSize,
      byteArray = [];
    const rs = fs.createReadStream(path, {
      flags: 'r',
      encoding,
      start: start <= 0 ? 0 : start,
      end: end >= size ? size : end,
      autoClose: true,
    });
    rs.once('error', (error) => {
      reject(error);
    });
    rs.on('data', (chunk) => {
      byteArray = byteArray.concat(chunk);
    });
    rs.on('end', () => {
      const content = byteArray.toString().slice(0, num);
      // 转换为字节数组
      const fixNumberBuffer = Buffer.from(content, encoding);
      resolve({
        content,
        byteSize: fixNumberBuffer.length,
      });
      rs.destroy();
    });
  });
}

function prevPage(bookInfo, num) {
  if (num === 0 || !bookInfo) {
    return Promise.resolve({
      content: '',
      byteSize: 0,
    });
  }
  return new Promise((resolve, reject) => {
    const countSize = Math.abs(num * 4);
    const { path, progress, size, encoding, byteSize } = bookInfo;
    let start = progress - countSize,
      end = progress,
      byteArray = [];

    const rs = fs.createReadStream(path, {
      flags: 'r',
      encoding,
      start: start <= 0 ? 0 : start,
      end: end,
      autoClose: true,
    });
    rs.once('error', (error) => {
      reject(error);
    });
    rs.on('data', (chunk) => {
      byteArray = byteArray.concat(chunk);
    });
    rs.on('end', () => {
      let content = byteArray.toString();
      content = content.slice(content.length - num, content.length);
      // 转换为字节数组
      const fixNumberBuffer = Buffer.from(content, encoding);
      resolve({
        content,
        byteSize: fixNumberBuffer.length,
      });
      rs.destroy();
    });
  });
}

function readContentPointStartEnd(bookInfo, start, end) {
  return new Promise((resolve, reject) => {
    let byteArray = [];
    const { path, progress, size, encoding, byteSize } = bookInfo;
    const rs = fs.createReadStream(path, {
      flags: 'r',
      encoding,
      start,
      end,
      autoClose: true,
    });
    rs.once('error', (error) => {
      reject(error);
    });
    rs.on('data', (chunk) => {
      byteArray = byteArray.concat(chunk);
    });
    rs.on('end', () => {
      const content = byteArray.toString();
      // 转换为字节数组
      resolve(content);
      rs.destroy();
    });
  });
}
