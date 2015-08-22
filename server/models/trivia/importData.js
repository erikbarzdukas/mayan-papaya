var Trivia = require('./triviaModel');
var data1 = require('./triviaData');
var data2 = require('./output');
var mongoose = require('mongoose');


/** 
 * Only need to do this if mongo is not already connected 
 * through app.js
 */
mongoURI = process.env.MONGOLAB_URI || 'mongodb://localhost/TriviaWithFriends';
try {
  mongoose.connect(mongoURI);
} catch (e) {
  console.log("Already connected to Mongo? -> ", e);
}

console.log("\n");
console.log("*--------------------------------------*");
console.log("|          Beginning data import       |");
console.log("*--------------------------------------*");

for(var i = 0; data1[i] || data2[i]; i++) {

  /** 
   * First 150 questions are in data1, rest
   * are in data2
   */
  var data;
  if(i < 150) {
    data = data1;
  } else {
    data = data2;
  }

  var question = new Trivia({
    id: i,
    question: data[i].question,
    content: data[i].content,
    answer: data[i].answer,
    level: data[i].level
  });
 
  question.save()
}

console.log("\n");
console.log("*--------------------------------------*");
console.log("|          Imported Q's to DB!         |");
console.log("*--------------------------------------*");
