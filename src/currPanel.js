let currPanel = null;
const panels = [];

function setCurrPanel(panel) {
  currPanel = panel;
}

function getCurrPanel() {
  return currPanel;
}

function addPanel(panel) {
  panels.push(panel);
}

function delPanel(panel) {
  const index = panels.findIndex((p) => p === panel);
  panels.splice(index, 1);
}

function findPanel(viewType) {
  const temp = panels.find((panel) => panel.viewType === viewType);
  return temp || null;
}

module.exports = {
  currPanel,
  addPanel,
  delPanel,
  findPanel,
  setCurrPanel,
  getCurrPanel,
};
