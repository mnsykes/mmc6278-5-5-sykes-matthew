const execSync = require('child_process').execSync;

async function waitForDb() {
  console.log('WAITING FOR MYSQL TO START')
  let count = 0
  const query = `USE music_shop_db; SELECT count(*) FROM inventory;`
  while(count < 30) {
    try {
      // const answer = execSync('docker exec mysql-sandbox mysql -e "SELECT 1 + 1 AS answer"').toString()
      const answer = execSync(`docker exec mysql-sandbox mysql -e "${query}"`).toString()
      if (answer && answer.includes('9'))
        break;
    } catch(err) {
      count++
      console.log('WAITING 1 SEC')
      execSync('sleep 1')
    }
  }
  if (count === 30) {
    console.log('\n\nCould not connect to MySQL')
    process.exit(1)
  }
  execSync('sleep 2')
}

waitForDb()
