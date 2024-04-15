const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Create connection
const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'questionGame'
});

// Connect to MySQL
db.connect((err) => {
    if(err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        // Here you would add your logic to check the username and password against your database
        // If the username and password are valid, call done(null, user)
        // If the username and password are not valid, call done(null, false)
        // If there is an error, call done(err)
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    // Here you would add your logic to find the user by id in your database
    // If the user is found, call done(null, user)
    // If the user is not found, call done(new Error('User not found'))
    // If there is an error, call done(err)
});

app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('startGame', () => {
        let sql = 'SELECT * FROM questions';
        db.query(sql, (err, results) => {
            if(err) throw err;
            io.emit('questions', results);
        });
    });

    io.on('connection', (socket) => {
        // ...
    
        socket.on('answer', (data) => {
            // Here you would add your logic to check if the answer is correct and update the scores
            // Then emit a scoreUpdate event to all clients with the updated scores
            io.emit('scoreUpdate', scores);
        });
    
        // Emit gameEnd event when the game ends
        function endGame() {
            io.emit('gameEnd', finalScores);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));