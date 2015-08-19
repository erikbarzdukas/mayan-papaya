(function() {

  var app = angular.module('Trivia', ['Profile']);

  //factory to get and hold question data
  //also has methods for cleaning and augmenting question data
  app.factory('Questions', ['$http', function($http) {
    var obj = {};

    obj.getQuestions = function() { // retrieves questions from backend
      return $http.get('/api/trivia').success(function(data) {
        // using Angular $http service to query our questions route
        // success cb executes when request returns
        // route returns a list of questions
        obj.questions = data;
      });
    };

    obj.updateUser = function(user){
      return $http.put('/api/users', {
        username: user.username,
        score: user.score,
        correct: user.correct,
        correctStreak: user.correctStreak,
        answered: user.answered
      });
    };

    return obj;
  }]);


  app.controller('TriviaController', ['$scope', '$http', 'Questions', '$interval', '$location', 'ProfileFactory', function($scope, $http, Questions, $interval, $location, ProfileFactory) {

    //sample trivia api response for chai test
    $scope.questions = [
      {
        "id": 46207,
        "answer": "England",
        "question": "This country's 1689 Bill of Rights stated that no Roman Catholic would ever rule it",
        "value": 100,
        "airdate": "2000-11-23T12:00:00.000Z",
        "created_at": "2014-02-11T23:13:46.149Z",
        "updated_at": "2014-02-11T23:13:46.149Z",
        "category_id": 5724,
        "game_id": null,
        "invalid_count": null,
        "category": {
          "id": 5724,
          "title": "catholicism",
          "created_at": "2014-02-11T23:13:46.044Z",
          "updated_at": "2014-02-11T23:13:46.044Z",
          "clues_count": 10
        }
      }
    ];

    $scope.updateUser = Questions.updateUser;
    $scope.username = ProfileFactory.getUsername();
    // $scope.userList = [];

    // initialize game data
    $scope.gameDataInit = function() {
      $scope.answered = 0;
      $scope.correct = 0;
      $scope.correctStreak = 0;
      $scope.currentStreak = 0;
      $scope.score = 0;
    };

    //for question navigation
    $scope.navLoc = Math.floor(Math.random() * 150);
    $scope.questionCount = 0;
    $scope.nextLoc = function() {
      //TODO make more dynamic
      $scope.navLoc = Math.floor(Math.random() * 150);
      $scope.setCountdown();
      $scope.questionCount++;
      if ($scope.questionCount === 10) {
        $scope.updateUser({
          username: $scope.username,
          score: $scope.score,
          correct: $scope.correct,
          correctStreak: $scope.correctStreak,
          answered: $scope.answered

        });
        $location.path("/trivia/endgame"); // render endgame view
      }
    };

    //for getting trivia questions from the jService API
    $scope.getQuestions = function() {
      Questions.getQuestions()
        .success(function(data) {
          $scope.questions = data;
        });
    };
    $scope.getQuestions();

    //for handling user answers to trivia
   $scope.checkAnswer = function(question, answer) {
      $scope.answered++;
      var id = question.id;
      var value = question.value;
      var userAns = question.userAnswer;
      if(answer === question.correct) {
        $scope.correct++;
        $scope.currentStreak++;
        $scope.score += Math.floor(Math.sqrt(+question.level) * 50 + $scope.counter);
      } else {
        $scope.currentStreak = 0;
      }
      if($scope.currentStreak > $scope.correctStreak){
        $scope.correctStreak = $scope.currentStreak;
      }
      $scope.nextLoc();
//       return $http.post('/api/trivia', {
//        id: id,
//        value: value,
//        userAns: userAns
//      }).then(function (res) {
//        var q = res.data;
//        if(q.correct){
//          $scope.correct++;
//          $scope.currentStreak++;
//          $scope.score += value;
//        }else{
//          $scope.currentStreak = 0;
//        }
//        if($scope.currentStreak > $scope.correctStreak){
//          $scope.correctStreak = $scope.currentStreak;
//        }
//        $scope.nextLoc();
//      });
    };



    //Timer uses timeout function
    //cancels a task associated with the promise
    $scope.setCountdown = function() {
      //resets the timer
      if(angular.isDefined($scope.gameTimer)) {
        $interval.cancel($scope.gameTimer);
        $scope.gameTimer = undefined;
      }
      //initialize timer number
      $scope.counter = 15;
      //countdown
      $scope.gameTimer = $interval(function() {
        $scope.counter--;
        if($scope.counter === 0) {
          $scope.nextLoc();
          $scope.setCountdown();
        }
      }, 1000);
    };
    //cancel timer if user navigates away from questions
    $scope.$on('$destroy', function() {
      $interval.cancel($scope.gameTimer);
    });

    // Request a new game from the server;
    // on success, we receive a code for our game room / socket namespace
    $scope.newGame = function() {
      return $http.get('/api/game').success(function(data) {

        // TODO: handle intial game setup ...
        // - set up socket connection?
        // - update the view?
        // * set some state info that indicates that this user
        // initiated the game -> gets a start button to start gameplay
        $scope.code = data.code;
        $scope.initiatedGame = true;
        $scope.socket = io(window.location.origin + '/' + $scope.code);
        console.log("TriviaController: newGame " + $scope.code);

        $scope.socket.emit('newuser', $scope.username);
        
        $scope.socket.on('startgame', function() {
          console.log("Socket: startgame");
          $scope.startGame();
        });

        $scope.socket.on('userlist', function(userList) {
          console.log('Socket : On : userlist: ' + userList);
          $scope.userList = userList;
          $scope.$apply();
          console.log("$scope.userList: " + $scope.userList);
        });

      });
    };

    $scope.joinGame = function() {
      // $scope.code should be set from the form model

      return $http.put('/api/game/join', {code: $scope.code})
      .success(function(data) {
        console.log("TriviaController: joinGame " + $scope.code);
        $scope.initiatedGame = false;
        $scope.socket = io(window.location.origin + '/' + $scope.code);
        $scope.socket.emit('newuser', $scope.username);

        $scope.socket.on('startgame', function() {
          console.log("Socket: startgame");
          $scope.startGame();
        });

        $scope.socket.on('userlist', function(userList) {
          console.log('Socket : On : userlist: ' + userList);
          $scope.userList = userList;
          $scope.$apply();
          console.log("$scope.userList: " + $scope.userList);
        });
      }).error(function(data) {
        // TODO: handle the error and prevent the user from being redirected
        // to the start game view.
        console.log("TriviaController: joinGame error with code " + $scope.code);
      });
    };

    $scope.initiateGame = function() {
      $scope.socket.emit('startgame');
    };

    $scope.startGame = function() {
      // start timers ...
      console.log("TriviaController: startGame");

      // if ($scope.initiatedGame) {
      //   $scope.socket.emit('startgame');
      // }

      $scope.$apply(function() {
        $location.path("/trivia/play"); // render play view
        console.log("$location.path: " + $location.path());
      });
    };

  }]);

})();
