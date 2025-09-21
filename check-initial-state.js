// 模拟浏览器环境
global.window = {
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  }
};

// 导入初始数据
const data = require('./src/lib/data.ts');

console.log('=== Initial Data Check ===');
console.log('Total tasks:', data.initialTasks.length);
console.log('Total lists:', data.initialLists.length);
console.log('Total tags:', data.initialTags.length);
console.log('Total events:', data.initialEvents.length);

// 检查inbox任务
const inboxTasks = data.initialTasks.filter(task => task.listId === 'inbox');
console.log('\n=== Inbox Tasks ===');
console.log('Inbox tasks count:', inboxTasks.length);

inboxTasks.forEach(task => {
  console.log(`- ${task.id}: ${task.title}`);
});