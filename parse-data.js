const fs = require('fs');

console.log('=== Parse Data Script ===');

// 读取数据文件
const dataFile = fs.readFileSync('./src/lib/data.ts', 'utf8');

console.log('File size:', dataFile.length);

// 使用更简单的正则表达式查找任务
console.log('\n=== Finding Tasks ===');
const taskMatches = dataFile.match(/id:\s*['"]TASK-\d+['"][\s\S]*?listId:\s*['"][^'"]+['"]/g);
console.log('Task matches found:', taskMatches ? taskMatches.length : 0);

if (taskMatches) {
  let inboxCount = 0;
  taskMatches.forEach((match, index) => {
    console.log(`Task ${index + 1}: ${match}`);
    if (match.includes("listId: 'inbox'") || match.includes('listId: "inbox"')) {
      inboxCount++;
    }
  });
  console.log('Inbox tasks count:', inboxCount);
}

// 查找inbox列表
console.log('\n=== Finding Inbox List ===');
const inboxListMatch = dataFile.match(/id:\s*['"]inbox['"]/);
console.log('Inbox list found:', !!inboxListMatch);

// 检查是否有localStorage文件
console.log('\n=== Checking localStorage Files ===');
const directories = ['.', './public', './.next', './.next/standalone', './.next/standalone/public'];
const files = ['localStorage.json', 'storage.json'];

directories.forEach(dir => {
  files.forEach(file => {
    const fullPath = `${dir}/${file}`;
    try {
      if (fs.existsSync(fullPath)) {
        console.log(`Found file: ${fullPath}`);
        const content = fs.readFileSync(fullPath, 'utf8');
        console.log(`  File size: ${content.length} characters`);
      }
    } catch (error) {
      // 文件不存在或无法读取
    }
  });
});

console.log('\n=== Parse Complete ===');