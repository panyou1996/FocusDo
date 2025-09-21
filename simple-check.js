const fs = require('fs');

// 读取数据文件
const dataFile = fs.readFileSync('./src/lib/data.ts', 'utf8');

console.log('=== File Analysis ===');
console.log('File size:', dataFile.length, 'characters');

// 检查是否包含inbox相关数据
console.log('\n=== Inbox Data Check ===');
console.log('Contains "listId: \'inbox\'":', dataFile.includes("listId: 'inbox'"));
console.log('Contains "id: \'inbox\'":', dataFile.includes("id: 'inbox'"));

// 计算任务数量
const taskMatches = dataFile.match(/id:\s*['"]TASK-/g);
console.log('Total tasks found:', taskMatches ? taskMatches.length : 0);

// 查找inbox任务
const inboxTaskMatches = dataFile.match(/id:\s*['"]TASK-.*?listId:\s*['"]inbox['"]/g);
console.log('Inbox tasks found:', inboxTaskMatches ? inboxTaskMatches.length : 0);

// 查找inbox列表
const inboxListMatches = dataFile.match(/id:\s*['"]inbox['"]/g);
console.log('Inbox list found:', inboxListMatches ? inboxListMatches.length : 0);

console.log('\n=== Sample Data ===');
// 显示文件的前200个字符
console.log('First 200 characters:');
console.log(dataFile.substring(0, 200));