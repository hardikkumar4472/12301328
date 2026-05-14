const express = require('express');
const logger = require('./middleware');
const app = express();
const port = 3000;
app.use(logger);
app.get('/', (req, res) => {
  res.send('Server is running and logging requests.');
});
app.get('/test', (req, res) => {
  res.json({ message: 'Success' });
});
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
