// History management for undo/redo
export class HistoryManager {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistory = 50;
  }

  push(state) {
    // Remove any history after current index
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new state
    this.history.push(JSON.parse(JSON.stringify(state)));

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  undo() {
    if (this.canUndo()) {
      this.currentIndex--;
      return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
    }
    return null;
  }

  redo() {
    if (this.canRedo()) {
      this.currentIndex++;
      return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
    }
    return null;
  }

  canUndo() {
    return this.currentIndex > 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
  }

  getCurrentState() {
    return this.history[this.currentIndex];
  }
}
