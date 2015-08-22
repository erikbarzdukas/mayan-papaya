import re
import json

f = open('moreQuestions.txt');

qArray = [];

q = {}

id = 150;

for line in f.readlines():
  
  if line[0:2] == 'Q:':
    
    question = line.split(' ', 1)[1].split(' (')[0]
    level = re.search(r'\d+', line.split(' ', 1)[1].split(' (')[1]).group()
    
    q = {}
    q['question'] = question
    q['level'] = level
    q['content'] = []

  if line[0:2] == 'a)' or line[0:2] == 'b)' or line[0:2] == 'c)' or line[0:2] == 'd)':
    q['content'].append(line.split(') ')[1].split('\n')[0])

    

  if line[0] == 'A':
  
    answerString = line.split(': ')[1]

    solution = -1
    
    for index, answer in enumerate(q['content']):
      regex = re.compile(answer, re.I)

      if regex.search(answerString):
        solution = index

    
    if solution > -1:
      q['id'] = id
      id += 1
      q['answer'] = solution;
      qArray.append(q)

out = open('output.json', 'w')

#print json.JSONEncoder().encode(qArray)
out.write(json.JSONEncoder().encode(qArray))



