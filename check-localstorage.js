// 模拟浏览器localStorage
const localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  clear() {
    this.data = {};
  }
};

// 模拟window对象
global.window = { localStorage };

// 读取实际的localStorage数据文件（如果存在）
const fs = require('fs');
const path = require('path');

const localStoragePath = path.join(__dirname, 'localstorage.json');
if (fs.existsSync(localStoragePath)) {
  try {
    const data = fs.readFileSync(localStoragePath, 'utf8');
    localStorage.data = JSON.parse(data);
  } catch (error) {
    console.log('No existing localStorage data or error reading it');
  }
}

// 检查aqua-do-state
const item = window.localStorage.getItem('aqua-do-state');
if (item) {
  try {
    const state = JSON.parse(item);
    console.log('Current tasks in localStorage:');
    console.log(JSON.stringify(state.tasks, null, 2));
    console.log('\nCurrent lists in localStorage:');
    console.log(JSON.stringify(state.lists, null, 2));
    
    // 检查inbox任务
    const inboxTasks = state.tasks.filter(task => task.listId === 'inbox');
    console.log('\nInbox tasks in localStorage:');
    console.log(JSON.stringify(inboxTasks, null, 2));
    console.log('\nInbox task count:', inboxTasks.length);
  } catch (error) {
    console.error('Error parsing localStorage data', error);
  }
} else {
  console.log('No aqua-do-state found in localStorage');
}