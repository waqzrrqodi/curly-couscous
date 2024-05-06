$(document).ready(function() {
    // Initialize the WebSocket connection
    const socket = io('http://localhost:3000'); // Connect to the WebSocket server
    let questionId;
    let playerId;
  
    // Disable Start Game button initially
    $('#start-game-btn').prop('disabled', true);
    $('#game').hide();
  
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
      $('#lobby').hide();
        $('#game').show();
      startGame();
    });

    // Event listener for Next Question button
    $('#next-question-btn').click(function() {
      nextQuestion();
    });
  
    // Listen for 'players-count' event from the server
    socket.on('players-count', function(playersCount) {
      updateStartButton(playersCount);
      // Display players count on the UI with text before it
        $('#players').text(`Players: ${playersCount}`);
    });

    // Listen for 'player-id' event from the server
socket.on('player-id', function(id) {
  // Display playerId on the UI
  $('.username').text(`Username: ${id}`);
  playerId = id;
  // edit server-connect-text to say "waiting for players to join..."
  $('#server-connect-text').text('Waiting for players to join...');
}
);

    socket.on('game-started', function() {
  // Handle game start event
  console.log('Game started');
  $('#lobby').hide();
        $('#game').show();

  // Listen for the 'question' event
  socket.on('question', function(question) {
    // Update the UI with the received question
    $('#question').text(question);
  });

  socket.on('answer', function(answer) {
    // Update the UI with the received answer
    // $('#answer').text(answer);
    console.log('Answer:', answer);
  });

  socket.on('all-answers', function(playerAnswers) {
    // Update the UI with the received answers
    $('#question').hide();
    ['option1', 'option2', 'option3', 'option4'].forEach(function(optionId) {
      $('#' + optionId).hide();
    });

    // Display the answers

    // example of how the answers display:
    // Player answers: [
//   { playerId: 'seb', isCorrect: true },
//   { playerId: 'joe', isCorrect: true },
//   { playerId: 'joe', isCorrect: false },
//   { playerId: 'seb', isCorrect: true }
// ]
$('#playerAnswers').show().html(
  playerAnswers.map(answer => {
    let emoji = answer.isCorrect ? '✔️' : '❌';
    return `<p>${answer.playerId}: ${emoji}</p>`;
  }).join('')
);
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

    socket.on('questionId', function(id) {
    // Update the UI with the received questionId
    console.log('Question ID:', id);
    questionId = id;
  });

  // Listen for the 'timer' event
  socket.on('timer', function(timerDuration) {
    // Start the timer with the received duration
    startTimer(timerDuration);
  });

      // Event listener for option selection
      let optionButtons = ['option1', 'option2', 'option3', 'option4'];

      optionButtons.forEach(function(optionId) {
        let button = document.getElementById(optionId);
  
        button.addEventListener('click', function() {
          
          // selectedOption is the text content of the button
          let selectedOption = button.textContent;
          console.log('Selected option:', selectedOption);
          console.log('Player ID:', playerId);
          console.log('Question ID:', questionId);
          socket.emit('submit-answer', { playerId, questionId, selectedOption });

          // Disable all option buttons after selecting an option
          optionButtons.forEach(function(optionId) {
            document.getElementById(optionId).disabled = true;
          });
        });
      });
      

});
  
    // Function to fetch questions and start the game
    function startGame() {
      $.post('http://localhost:3000/start-game', function(data) {
        // Display game UI with questions and options
        displayQuestion(data.question);
        displayOptions(data.options);
        startTimer(data.timerDuration);
      });
    }

    function nextQuestion() {
      $.post('http://localhost:3000/next-question', function(data) {
        // Display game UI with questions and options
        displayQuestion(data.question);
        displayOptions(data.options);
        startTimer(data.timerDuration);
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
  