var grunt = require('grunt');
var fs = require('fs');

function readFile(file) {
  'use strict';

  var contents = grunt.file.read(file);

  if (process.platform === 'win32') {
    contents = contents.replace(/\r\n/g, '\n');
  }

  return contents;
}

function assertFileEquality(test, pathToActual, pathToExpected, message) {
    var actual = readFile(pathToActual);
    var expected = readFile(pathToExpected);
    test.equal(expected, actual, message);
}

exports.inline = function(test) {
    'use strict';

    test.expect(4);

    assertFileEquality(test,
      'tmp/img_greedy.min.html',
      'test/expected/img_greedy.min.html',
      'Should compile two image target without newline characters');

    assertFileEquality(test,
      'tmp/css_greedy.min.html',
      'test/expected/css_greedy.min.html',
      'Should compile two link target without newline characters');

    assertFileEquality(test,
      'tmp/html_greedy.min.html',
      'test/expected/html_greedy.min.html',
      'Should compile two inline target without newline characters');

    assertFileEquality(test,
      'tmp/script_greedy.min.html',
      'test/expected/script_greedy.min.html',
      'Should compile two script target without newline characters');

    test.done();
};