const app = require('./app')
const PORT = process.env.PORT || 3000

app.listen(PORT, function() {
  console.log('listening on http://localhost:' + PORT)
})
