(function() {
    var path        = require('path'),
        util        = require('util'),
        fs          = require('fs'),
        watchr      = require('watchr'),
        less        = require('less'),
        cwd         = process.cwd(),
        watchPath   = process.argv.length === 3 ? path.resolve(cwd, process.argv[2]) : cwd;

    var options = {
        compress: false,
        yuicompress: false,
        optimization: 1,
        silent: false,
        paths: [],
        color: true,
        strictImports: false
    };

    var parseLessFile = function(input, output){
        return function (e, data) {
            if (e) {
                console.log('lessc:', e.message);
            }

            new(less.Parser)({
                paths: [path.dirname(input)],
                optimization: options.optimization,
                filename: input
            }).parse(data, function (err, tree) {
                    if (err) {
                        less.writeError(err, options);
                    } else {
                        try {
                            var css = tree.toCSS({ compress: options.compress });
                            if (output) {
                                var fd = fs.openSync(output, "w");
                                fs.writeSync(fd, css, 0, "utf8");
                            } else {
                                console.log('WARNING: output is undefined');
                                util.print(css);
                            }
                        } catch (e) {
                            less.writeError(e, options);
                        }
                    }
                });
        };
    };

    console.log('>>> Script is polling for changes. Press Ctrl-C to Stop.');

    watchr.watch({
        path: watchPath,
        listener: function(eventName, filePath, fileCurrentStat, filePreviousStat) {
            if (eventName == 'change' || eventName == 'update') {
                console.log('>>> Change detected at', new Date().toLocaleTimeString(), 'to:', path.basename(filePath));

                var baseFilePath = path.basename(filePath, '.less');
                fs.readFile(filePath, 'utf-8', parseLessFile(filePath, '../css/' + baseFilePath + '.css'));

                console.log('overwrite', baseFilePath + '.css');
            }
        },
        next: function(err, watcher) {
            if (err) {
                console.log('!!! epic fail');
                throw err;
            }

            console.log('Now watching:', watchPath);
        }
    });

})();
