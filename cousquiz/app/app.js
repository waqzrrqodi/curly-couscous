$(document).ready(function() {
    // Initialize the WebSocket connection
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

    socket.on('game-started', function() {
  // Handle game start event
  console.log('Game started');

  // Listen for the 'question' event
  socket.on('question', function(question) {
    // Update the UI with the received question
    $('#question').text(question);
  });

  // Listen for the 'options' event
  socket.on('option1', function(option1) {
    // Update the UI with the received option
    $('#option1').text(option1);
  });

  // Listen for the 'options' event
  socket.on('option2', function(option2) {
    // Update the UI with the received option
    $('#option2').text(option2);
  });

  // Listen for the 'options' event
  socket.on('option3', function(option3) {
    // Update the UI with the received option
    $('#option3').text(option3);
  });

  socket.on('option4', function(option4) {
    // Update the UI with the received option
    $('#option4').text(option4);
  });

  // Listen for the 'timer' event
  socket.on('timer', function(timerDuration) {
    // Start the timer with the received duration
    startTimer(timerDuration);
  });
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

    // Function to get next question
    function nextQuestion(questionId) {
      $.post('/next-question', { questionId }, function(data) {
        // Display next question and options on the UI
        displayQuestion(data.question);
        displayOptions(data.options);
        startTimer(data.timerDuration);
      });
    }

    // Event listener for option selection
    $('#options').on('click', 'li', function() {
      const selectedOption = $(this).text();
      submitAnswer(playerId, questionId, selectedOption);
    });
  
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
  let timer = duration * 100; // Multiply by 10 to get timer in tenths of a second
  const $timer = $('#timer');
  const $progressBar = $('#timerBar'); // Get the progress bar
  $timer.text(timer / 100); // Divide by 10 to display timer in seconds
  $progressBar.attr('max', duration * 100); // Set the max value of the progress bar to the duration in tenths of a second
  $progressBar.val(0); // Set the initial value of the progress bar to 0
  const interval = setInterval(() => {
    timer--;
    $timer.text(timer / 100); // Divide by 10 to display timer in seconds
    $progressBar.val(duration * 100 - timer); // Update the value of the progress bar

    // Check if the remaining percentage is 30% or less
    if ((timer / (duration * 100)) * 100 <= 30) {
      // Change the color of the progress bar to 'danger'
      $progressBar.removeClass('is-primary').addClass('is-danger');
    }

    if (timer === 0) {
      clearInterval(interval);
      // Implement logic for timeout
    }
  }, 10); // Update every 100 milliseconds
}

  $('#testButton').click(function() {
    console.log('Test button clicked');
    startTimer(10); // Start the timer with a duration of 10 seconds
  });
  });
  