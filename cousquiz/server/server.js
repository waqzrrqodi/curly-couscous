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
let playerIds = ['bob', 'seb', 'joe', 'holgis', 'mike', 'dave', 'dave-clone'];
let playerScores = [];

// WebSocket connection handling
io.on('connection', (socket) => {
  playersCount++;
  console.log('A user connected');
  console.log('Players count:', playersCount);
  io.emit('players-count', playersCount); // Send players count to all clients
  let playerId = playerIds[playersCount - 1];
  socket.playerId = playerId;
  io.emit('player-id', playerId); // Send playerId to client

  console.log('Assigned playerId:', playerId);

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
// questions[0].question will get the first question from the array
// questions[0].option1 will get the option for the first question
// questions[0].answer will get the answer for the first question
getQuestions().then((fetchedQuestions) => {
  questions = fetchedQuestions;
//   console.log('Questions fetched:', questions);
//   console.log('Questions count:', questions.length);
//   console.log('First question:', questions[0]);
});

// Route for starting the game
app.post('/start-game', (req, res) => {
    // Send first question and options to clients
    // Send timer duration to clients
    console.log('Game started');
    console.log('First question:', questions[0].question);
    io.emit('game-started', true);
    io.emit('question', questions[0].question);
    io.emit('questionId', questions[0].id)
    io.emit('option1', questions[0].option1);
    io.emit('option2', questions[0].option2);
    io.emit('option3', questions[0].option3);
    io.emit('option4', questions[0].option4);
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

// Route for getting next question for all players
app.post('/next-question', (req, res) => {
  const { questionId } = req.body;
  // Send next question and options to clients
  // Send timer duration to clients
  io.emit('question', questions[questionId]);
  io.emit('option1', questions[questionId].option1);
  io.emit('option2', questions[questionId].option2);
  io.emit('option3', questions[questionId].option3);
  io.emit('option4', questions[questionId].option4);
  io.emit('timer', 10);
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
