/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
