const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

const port = 3000;

// MySQL connection setup
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'questionGame'
});

connection.connect();

app.use(express.json());

let playersCount = 0;

// WebSocket connection handling
io.on('connection', (socket) => {
  playersCount++;
  console.log('A user connected');
  console.log('Players count:', playersCount);
  io.emit('players-count', playersCount); // Send players count to all clients

  socket.on('disconnect', () => {
    playersCount--;
    console.log('A user disconnected');
    console.log('Players count:', playersCount);
    io.emit('players-count', playersCount); // Send players count to all clients
  });
});

// Fetching questions from database and put them in random order for the game in list
function getQuestions() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM questions', (error, results) => {
      if (error) {
        reject(error);
      } else {
        const questions = results.sort(() => Math.random() - 0.5);
        resolve(questions);
      }
    });
  });
}

let questions = [];
// Fetch questions from database and store them in questions array
getQuestions().then((fetchedQuestions) => {
  questions = fetchedQuestions;
});
console.log(questions);

// Route for starting the game
app.post('/start-game', (req, res) => {
    // Send first question and options to clients
    // Send timer duration to clients
    io.emit('game-started', true);
    io.emit('question', questions[0]);
    io.emit('options', questions[0].options);
    io.emit('timer', 10);
});

// Route for submitting answers
app.post('/submit-answer', (req, res) => {
  const { playerId, questionId, selectedOption } = req.body;
  // Logic for checking answer with options
  // Send response to client if answer is correct and update score
    // Send response to client if answer is wrong
    let isCorrect = false;
    if (selectedOption === questions[questionId].answer) {
      isCorrect = true;
    }
    io.emit('answer', { playerId, isCorrect });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
