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

module.exports = (grunt) => {
    grunt.registerTask('forms-app-init', function() {
        const packageFile = global.packageFile;
        if ( !global.packageFile )
            grunt.log.ok('no package file'.red);
        else {
            let configpath;
            if (!!process.env['OO_BRANDING']) {
                configpath = `../../${process.env['OO_BRANDING']}/web-apps/build/appforms.json`;
                if (!grunt.file.exists(configpath))
                    configpath = null;
            }

            const config = !configpath ? require('./appforms.json') : require(configpath);
            if ( config ) {
                //packageFile.tasks.deploy.push(...config.tasks.deploy);
                packageFile.forms = config.forms;
            }
        }

        grunt.initConfig({
            pkg: packageFile,

            clean: {
                options: {
                    force: true
                },
                postbuild: packageFile.forms.clean.postbuild,
                prebuild: packageFile.forms.clean.prebuild
            },

            requirejs: {
                options: {
                    optimize: "none",
                },
                compile: {
                    options: packageFile.forms.js.requirejs.options
                },
                postload: {
                    options: packageFile.forms.js.postload.options
                },
            },

            less: {
                production: {
                    options: {
                        compress: true,
                        ieCompat: false,
                        modifyVars: packageFile.forms.less.vars,
                        plugins: [
                            new (require('less-plugin-clean-css'))()
                        ]
                    },
                    files: {
                        "<%= pkg.forms.less.files.dest %>": packageFile.forms.less.files.src
                    }
                }
            },

            concat: {
                options: {
                    stripBanners: true,
                    banner: global.copyright
                },
                dist: {
                    src: [packageFile.forms.js.requirejs.options.out],
                    dest: packageFile.forms.js.requirejs.options.out
                }
            },

            copy: {
                localization: {
                    files: packageFile.forms.copy.localization
                },
                indexhtml: {
                    files: packageFile.forms.copy.indexhtml
                }
            },

            replace: {
                varsEnviroment: {
                    src: [`${packageFile.forms.js.requirejs.options.dir}/**/*.js`],
                    overwrite: true,
                    replacements: [{
                        from: /\{\{PRODUCT_VERSION\}\}/g,
                        to: packageFile.version
                    }, ...global.jsreplacements]
                },
            },

            inline: {
                dist: {
                    src: packageFile.forms.inline.src
                }
            },

            terser: {
                options: {
                    format: {
                        comments: false,
                        preamble: "/* minified by terser */",
                    },
                },
                build: {
                    src: [packageFile.forms.js.requirejs.options.out],
                    dest: packageFile.forms.js.requirejs.options.out
                },
                postload: {
                    src: packageFile.forms.js.postload.options.out,
                    dest: packageFile.forms.js.postload.options.out,
                },
                iecompat: {
                    options: {
                        sourceMap: false,
                    },
                    files: [{
                        expand: true,
                        cwd: packageFile.forms.js.babel.files[0].dest,
                        src: `*.js`,
                        dest: packageFile.forms.js.babel.files[0].dest
                    }]
                },
            },

            babel: {
                options: {
                    sourceMap: false,
                    presets: [['@babel/preset-env', {modules: false}]]
                },
                dist: {
                    files: packageFile.forms.js.babel.files
                }
            },
        });
    });

    const runTasks = function() {
        if (packageFile) {
            let maintasks = ['forms-app-init', 'clean:prebuild', 'requirejs', 'less', 'copy',
                                'inline', 'replace:varsEnviroment', 'clean:postbuild'];

            if (!!global.brandingPath) {
                const cfgfile = `${brandingPath}/appforms.json`;
                if (grunt.file.exists(cfgfile)) {
                    const cfg = require(cfgfile);

                    if (!!cfg.forms.branding?.tasks) {
                        maintasks = cfg.forms.branding.tasks;
                    }
                }
            }

            grunt.task.run(maintasks);
        } else {
            grunt.log.error().writeln('Is not load configure file.'.red);
        }
    };

    grunt.registerTask('deploy-app-forms', runTasks);
}
