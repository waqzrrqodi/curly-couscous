$(document).ready(function() {
    const socket = io('http://localhost:3000'); // Connect to the WebSocket server
  
    // Disable Start Game button initially
    $('#start-game-btn').prop('disabled', true);
  
    // Function to enable Start Game button if at least 2 players have joined
    function updateStartButton(playersCount) {
      if (playersCount >= 2) {
        $('#start-game-btn').prop('disabled', false);
      } else {
        $('#start-game-btn').prop('disabled', true);
      }
    }
  
    // Event listener for Start Game button
    $('#start-game-btn').click(function() {
      startGame();
    });
  
    // Listen for 'players-count' event from the server
    socket.on('players-count', function(playersCount) {
      updateStartButton(playersCount);
      // Display players count on the UI with text before it
        $('#players').text(`Players: ${playersCount}`);
    });
  
    // Function to fetch questions and start the game
    function startGame() {
      $.post('http://localhost:3000/start-game', function(data) {
        // Display game UI with questions and options
        $('#lobby').hide();
        $('#game').show();
        displayQuestion(data.question);
        displayOptions(data.options);
        startTimer(data.timerDuration);
      });
    }
  
    // Function to submit answer
    function submitAnswer(playerId, questionId, selectedOption) {
      $.post('/submit-answer', { playerId, questionId, selectedOption }, function(data) {
        // Handle response - update UI with result and score
      });
    }
  
    // Function to display question
    function displayQuestion(question) {
      $('#question').text(question.name);
    }
  
    // Function to display options
    function displayOptions(options) {
      const $optionsList = $('#options');
      $optionsList.empty();
      options.forEach(option => {
        const $optionItem = $('<li>').text(option);
        $optionsList.append($optionItem);
      });
    }
  
    // Function to start timer
    function startTimer(duration) {
      // Implement timer logic
      let timer = duration;
        const $timer = $('#timer');
        $timer.text(timer);
        const interval = setInterval(() => {
          timer--;
          $timer.text(timer);
          if (timer === 0) {
            clearInterval(interval);
            // Implement logic for timeout
          }
        }, 1000);
    }
  });
  