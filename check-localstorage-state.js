// 在浏览器环境中运行的脚本，用于检查localStorage状态
const scriptContent = `
console.log('=== localStorage State Check ===');

// 检查localStorage中的aqua-do-state
const aquaDoState = localStorage.getItem('aqua-do-state');
if (aquaDoState) {
  try {
    const parsedState = JSON.parse(aquaDoState);
    console.log('aqua-do-state found:');
    console.log('- Tasks count:', parsedState.tasks ? parsedState.tasks.length : 'N/A');
    console.log('- Lists count:', parsedState.lists ? parsedState.lists.length : 'N/A');
    
    // 检查inbox任务
    if (parsedState.tasks) {
      const inboxTasks = parsedState.tasks.filter(task => task.listId === 'inbox');
      console.log('- Inbox tasks count:', inboxTasks.length);
      inboxTasks.forEach((task, index) => {
        console.log(\`  Inbox Task \${index + 1}: \${task.id} - \${task.title}\`);
      });
    }
    
    // 检查inbox列表
    if (parsedState.lists) {
      const inboxList = parsedState.lists.find(list => list.id === 'inbox');
      console.log('- Inbox list exists:', !!inboxList);
      if (inboxList) {
        console.log('  Inbox list:', inboxList);
      }
    }
  } catch (error) {
    console.log('Error parsing aqua-do-state:', error.message);
  }
} else {
  console.log('No aqua-do-state found in localStorage');
}

// 检查所有localStorage项
console.log('\\n=== All localStorage Items ===');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(\`Key: \${key}, Value length: \${value.length}\`);
  if (key === 'aqua-do-state') {
    console.log('  (Already shown above)');
  }
}

console.log('\\n=== Check Complete ===');
`;

// 创建HTML文件来运行脚本
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>LocalStorage Check</title>
</head>
<body>
    <h1>LocalStorage State Check</h1>
    <p>Open browser console to see results</p>
    <script>
        ${scriptContent}
    </script>
</body>
</html>
`;

// 保存HTML文件
const fs = require('fs');
fs.writeFileSync('./public/check-storage.html', htmlContent);
console.log('Created check-storage.html in public folder');
console.log('Open http://localhost:9004/check-storage.html in your browser to see results');