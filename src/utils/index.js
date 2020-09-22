const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

exports.getCurrUserHomePath = function () {
  return process.env.HOME || process.env.USERPROFILE;
};

exports.getFileName = function (filepath) {
  return filepath.match(/.*\/(.*)/)[1];
};

exports.getFileSize = function (filepath) {
  const statInfo = fs.statSync(filepath);
  return statInfo.size;
};

exports.showError = function (message) {
  vscode.window.showErrorMessage(message);
};

exports.getExtensionFileAbsolutePath = function (context, relativePath) {
  return path.join(context.extensionPath, relativePath);
};

exports.cloneDeep = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};
