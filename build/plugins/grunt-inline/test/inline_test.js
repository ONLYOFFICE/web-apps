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
      'tmp/css.min.html',
      'test/expected/css.min.html',
      'Should compile css inline');

    assertFileEquality(test,
      'tmp/img.min.html',
      'test/expected/img.min.html',
      'Should compile image inline');

    assertFileEquality(test,
      'tmp/html.min.html',
      'test/expected/html.min.html',
      'Should compile html inline');

    assertFileEquality(test,
      'tmp/script.min.html',
      'test/expected/script.min.html',
      'Should compile script inline');

    test.done();
};