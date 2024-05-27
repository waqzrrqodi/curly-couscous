const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mysql = require("mysql");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

const port = 3000;

// MySQL connection setup
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "questionGame",
});

connection.connect();

app.use(express.json());

let playersCount = 0;
let questionCount = 0;
let playerIds = ["bob", "seb", "joe", "holgis", "mike", "dave", "dave-clone"];
let usedPlayerIds = [];
let playerScores = [];
let playerAnswers = [];
let timer = 1000;

// WebSocket connection handling
io.on("connection", (socket) => {
  playersCount++;
  console.log("A user connected");
  console.log("Players count:", playersCount);
  io.emit("players-count", playersCount); // Send players count to all clients
  let playerId = playerIds[playersCount - 1];
  if (usedPlayerIds.includes(playerId)) {
    playerId = playerIds[playersCount];
  }
  usedPlayerIds.push(playerId);
  socket.playerId = playerId;

  // Generate random number between 0 and 99
  let randomNum = Math.floor(Math.random() * 100);

  // Add the random numbers to the player's name
  let playerName = playerId + randomNum.toString();

  socket.emit("player-id", playerName); // Send playerId to client

  console.log("Assigned playerId:", playerId);
  console.log("Assigned playerName:", playerName);

  socket.on("disconnect", () => {
    playersCount--;
    usedPlayerIds = usedPlayerIds.filter((id) => id !== playerId);
    console.log("A user disconnected");
    console.log("Players count:", playersCount);
    io.emit("players-count", playersCount); // Send players count to all clients
  });

  socket.on("submit-answer", (data) => {
    const { playerId, questionId, selectedOption } = data;

    let isCorrect = false;
    if (selectedOption === questions[questionCount].answer) {
      isCorrect = true;
    }

    if (isCorrect) {
      let playerScore = playerScores.find(
        (player) => player.playerId === playerId
      );
      if (playerScore) {
        playerScore.score += 1;

        if (playerScore.score === 10) {
          io.emit("win", playerId);
        }
      } else {
        playerScores.push({ playerId, score: 1 });
      }
    }

    playerAnswers.push({ playerId, isCorrect });

    if (playerAnswers.length === playersCount) {
      // Calculate scores
      io.emit("all-answers", playerAnswers, playerScores);
      // Stop the timer-sync
      io.emit("timer-sync", 0);
      timer = 0;

      playerAnswers = [];
      if (questionCount === questions.length - 1) {
        questionCount = 0;
      }
      questionCount++;
    }

    console.log("Question ID:", questionId);
    console.log("Selected option:", selectedOption);
    console.log("Answer:", questions[questionCount].answer);
    console.log("Answrs:", questions.answer);
    console.log("Is correct:", isCorrect);

    // Send 'answer' event back to the client
    socket.emit("answer", { playerId, isCorrect });
  });

  socket.on("next-question", () => {
    io.emit("next-question-go", true);
    io.emit("question", questions[questionCount].question);
    io.emit("option1", questions[questionCount].option1);
    io.emit("option2", questions[questionCount].option2);
    io.emit("option3", questions[questionCount].option3);
    io.emit("option4", questions[questionCount].option4);
    io.emit("timer-sync", "start");
    timerSync();
  });
});

// Fetching questions from database and put them in random order for the game in list
function getQuestions() {
  return new Promise((resolve, reject) => {
    // Database structure: id, question, answer, option1, option2, option3, option4
    connection.query("SELECT * FROM questions", (error, results) => {
      if (error) {
        reject(error);
      } else {
        const questions = results;
        resolve(questions);
      }
    });
  });
}

let questions = [];
let questionsOrdered = [];
// Fetch questions from database and store them in questions array
// questions[0].question will get the first question from the array
// questions[0].option1 will get the option for the first question
// questions[0].answer will get the answer for the first question
getQuestions().then((fetchedQuestions) => {
  questionsOrdered = fetchedQuestions;
  questions = [...questionsOrdered].sort(() => Math.random() - 0.5);
});

function timerSync() {
  timer = 1000;
  let interval = setInterval(() => {
    timer--;
    io.emit("timer-sync", timer);
    if (timer === 0) {
      clearInterval(interval);
    }
  }, 10);
}

// Route for starting the game
app.post("/start-game", (req, res) => {
  // Send first question and options to clients
  // Send timer duration to clients
  console.log("Game started");
  console.log("First question:", questions[0].question);
  io.emit("game-started", true);
  io.emit("question", questions[0].question);
  io.emit("questionId", questions[0].id);
  io.emit("option1", questions[0].option1);
  io.emit("option2", questions[0].option2);
  io.emit("option3", questions[0].option3);
  io.emit("option4", questions[0].option4);
  io.emit("timer", 10);
  playerScores = [];
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
