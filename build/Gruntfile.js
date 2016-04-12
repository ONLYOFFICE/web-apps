module.exports = function(grunt) {
    var _ = require('lodash'),
        defaultConfig,
        packageFile;


    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-mocha');

    function doRegisterTask(name, callbackConfig) {
        return grunt.registerTask(name + '-init', function() {
            var additionalConfig = {},
                initConfig = {};

            if (_.isFunction(callbackConfig)) {
                additionalConfig = callbackConfig.call(this, defaultConfig, packageFile);
            }

            if (!_.isUndefined(packageFile[name]['clean'])) {
                initConfig['clean'] = {
                    options: {
                        force: true
                    },
                    files: packageFile[name]['clean']
                }
            }

            if (!_.isUndefined(packageFile[name]['copy'])) {
                initConfig['copy'] = packageFile[name]['copy'];
            }

            grunt.initConfig(_.assign(initConfig, additionalConfig || {}));
        });
    }

    function doRegisterInitializeAppTask(name, appName, configFile) {
        return grunt.registerTask('init-build-' + name, 'Initialize build ' + appName, function(){
            defaultConfig = configFile;
            packageFile = require('./' + defaultConfig);

            if (packageFile)
                grunt.log.ok(appName + ' config loaded successfully'.green);
            else
                grunt.log.error().writeln('Could not load config file'.red);
        });
    }

    grunt.initConfig({
        mocha: {
            test: {
                options: {
                    reporter: 'Spec'
                },
                src: [
                    '../test/common/index.html'
                ]
            }
        },

        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true
                },
                force: true
            },
            common: ['../apps/common/main/lib/**/*.js']
        }
    });

    doRegisterTask('sdk');
    doRegisterTask('api', function(defaultConfig, packageFile){
        // var pkg = grunt.file.readJSON(defaultConfig);
        // var config = { copy: pkg['api']['copy'] };
        // config.copy.options = {
        //     process: function(content, src, dest) {
        //         if (/api\.js$/.test(src)) {
        //             return content.replace(/(\#{2}BN\#)/, "." + (process.env['BUILD_NUMBER'] || packageFile.build));
        //         }

        //         return content;
        //     }
        // };
        // return config;
    });
    doRegisterTask('sockjs');
    doRegisterTask('xregexp');
    doRegisterTask('megapixel');
    doRegisterTask('touch');
    doRegisterTask('jquery');
    doRegisterTask('underscore');
    doRegisterTask('zeroclipboard');
    doRegisterTask('bootstrap');
    doRegisterTask('jszip');
    doRegisterTask('jsziputils');
    doRegisterTask('jsrsasign');
    doRegisterTask('requirejs', function(defaultConfig, packageFile) {
        return {
            uglify: {
                pkg: grunt.file.readJSON(defaultConfig),

                options: {
                    banner: '/** vim: et:ts=4:sw=4:sts=4\n' +
                        ' * @license RequireJS 2.1.2 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.\n' +
                        ' * Available via the MIT or new BSD license.\n' +
                        ' * see: http://github.com/jrburke/requirejs for details\n' +
                        ' */\n'
                },
                build: {
                    src:  packageFile['requirejs']['min']['src'],
                    dest: packageFile['requirejs']['min']['dest']
                }
            }
        }
    });

    grunt.registerTask('main-app-init', function() {
        grunt.initConfig({
            pkg: grunt.file.readJSON(defaultConfig),

            clean: {
                options: {
                    force: true
                },
                files: packageFile['main']['clean']
            },

            less: {
                production: {
                    options: {
                        compress: true,
                        plugins: [
                            // new (require('less-plugin-clean-css'))()
                        ]
                    },
                    files: {
                        "<%= pkg.main.less.files.dest %>": packageFile['main']['less']['files']['src']
                    }
                }
            },

            requirejs: {
                compile: {
                    options: packageFile['main']['js']['requirejs']['options']
                }
            },

            replace: {
                fixLessUrl: {
                    src: ['<%= pkg.main.less.files.dest %>'],
                    overwrite: true,
                    replacements: packageFile['main']['less']['replacements']
                }
            },

            concat: {
                options: {
                    stripBanners: true,
                    banner: '/*\n' +
                    ' * Copyright (c) Ascensio System SIA <%= grunt.template.today("yyyy") %>. All rights reserved\n' +
                    ' *\n' +
                    ' * <%= pkg.homepage %> \n' +
                    ' *\n' +
                    ' * Version: ' + process.env['PRODUCT_VERSION'] + ' (build:' + process.env['BUILD_NUMBER'] + ')\n' +
                    ' */\n'
                },
                dist: {
                    src: [packageFile['main']['js']['requirejs']['options']['out']],
                    dest: packageFile['main']['js']['requirejs']['options']['out']
                }
            },

            imagemin: {
                options: {
                    optimizationLevel: 3
                },
                dynamic: {
                    files: []
                        .concat(packageFile['main']['imagemin']['images-app'])
                        .concat(packageFile['main']['imagemin']['images-common'])
                }
            },

            copy: {
                localization: {
                    files: packageFile['main']['copy']['localization']
                },
                help: {
                    files: packageFile['main']['copy']['help']
                },
                'index-page': {
                    files: packageFile['main']['copy']['index-page']
                }
            }
        });
    });

    grunt.registerTask('lessPostFix', function(){
        if (packageFile.main.less.embedImages) {
            grunt.config('replace.urlToUri', {
                    src: ['<%= pkg.main.less.files.dest %>'],
                    overwrite: true,
                    replacements: [{
                        from: /url\(\'?(?!data\:image)([^\)\'\"]+)\'?/g,
                        to: function(matchedWord, index, fullText, regexMatches) {
                            return 'data-uri(\'' + regexMatches + '\'';
                        }
                    },{
                        from: /filter\:\s?alpha\(opacity\s?=\s?[0-9]{1,3}\)\;/g,
                        to: ''
                    }]                
            });

            grunt.config('less.uriPostfix', {
                    options: {
                        compress: true,
                        ieCompat: false
                    },
                    files: {
                        "<%= pkg.main.less.files.dest %>": "<%= pkg.main.less.files.dest %>"
                    }
            });

            grunt.config('clean.files', '<%= pkg.main.clean %>/resources/img');

            grunt.task.run('replace:urlToUri', 'less:uriPostfix', 'clean');
        }

        grunt.config('replace.writeVersion', {
                    src: ['<%= pkg.api.copy.script.dest %>' + '/documents/api.js'],
                    overwrite: true,
                    replacements: [{
                        from: /(\#{2}BN\#)/,
                        to: function(matchedWord, index, fullText, regexMatches) {
                    // return content.replace(/(\#{2}BN\#)/, "." + (process.env['BUILD_NUMBER'] || packageFile.build));
                            return "." + (process.env['BUILD_NUMBER'] || packageFile.build);
                        }
                    }]                
        });

        grunt.task.run('replace:writeVersion');
    });

    grunt.registerTask('mobile-app-init', function() {
        grunt.initConfig({
            pkg: grunt.file.readJSON(defaultConfig),

            clean: {
                options: {
                    force: true
                },
                files: packageFile['mobile']['clean']
            },

            uglify: {
                options: {
                    banner: '/*\n' +
                            ' * Copyright (c) Ascensio System SIA <%= grunt.template.today("yyyy") %>. All rights reserved\n' +
                            ' *\n' +
                            ' * <%= pkg.homepage %>\n' +
                            ' *\n' +
                            ' * Version: <%= pkg.version %> (build:<%= pkg.build %>)\n' +
                            ' */\n'
                },
                build: {
                    src: packageFile['mobile']['js']['src'],
                    dest: packageFile['mobile']['js']['dist']
                }
            },

            cssmin: {
                styles: {
                    files: {
                        "<%= pkg.mobile.css.normal.dist %>" : packageFile['mobile']['css']['normal']['src'],
                        "<%= pkg.mobile.css.retina.dist %>" : packageFile['mobile']['css']['retina']['src']
                    }
                }
            },

            copy: {
                localization: {
                    files: packageFile['mobile']['copy']['localization']
                },
                'index-page': {
                    files: packageFile['mobile']['copy']['index-page']
                },
                'images-app': {
                    files: packageFile['mobile']['copy']['images-app']
                }
            }
        });
    });

    grunt.registerTask('embed-app-init', function() {
        grunt.initConfig({
            pkg: grunt.file.readJSON(defaultConfig),

            clean: {
                options: {
                    force: true
                },
                files: packageFile['embed']['clean']
            },

            uglify: {
                options: {
                    banner: '/*\n' +
                            ' * Copyright (c) Ascensio System SIA <%= grunt.template.today("yyyy") %>. All rights reserved\n' +
                            ' *\n' +
                            ' * <%= pkg.homepage %>\n' +
                            ' *\n' +
                            ' * Version: <%= pkg.version %> (build:<%= pkg.build %>)\n' +
                            ' */\n'
                },
                build: {
                    src: packageFile['embed']['js']['src'],
                    dest: packageFile['embed']['js']['dist']
                }
            },

            less: {
                production: {
                    options: {
                        cleancss: true
                    },
                    files: {
                        "<%= pkg.embed.less.files.dist %>": packageFile['embed']['less']['files']['src']
                    }
                }
            },

            replace: {
                fixLessUrl: {
                    src: ['<%= pkg.embed.less.files.dist %>'],
                    overwrite: true,
                    replacements: packageFile['embed']['less']['replacements']
                }
            },

            copy: {
                'index-page': {
                    files: packageFile['embed']['copy']['index-page']
                },
                'images-app': {
                    files: packageFile['embed']['copy']['images-app']
                }
            }
        });
    });


    grunt.registerTask('increment-build', function() {
        var pkg = grunt.file.readJSON(defaultConfig);
        pkg.build = parseInt(pkg.build) + 1;
        grunt.file.write(defaultConfig, JSON.stringify(pkg, null, 4));
    });


    grunt.registerTask('deploy-api',                    ['api-init', 'clean', 'copy']);
    grunt.registerTask('deploy-sdk',                    ['sdk-init', 'clean', 'copy']);

    grunt.registerTask('deploy-sockjs',                 ['sockjs-init', 'clean', 'copy']);
    grunt.registerTask('deploy-xregexp',                ['xregexp-init', 'clean', 'copy']);
    grunt.registerTask('deploy-megapixel',              ['megapixel-init', 'clean', 'copy']);
    grunt.registerTask('deploy-touch',                  ['touch-init', 'clean', 'copy']);
    grunt.registerTask('deploy-jquery',                 ['jquery-init', 'clean', 'copy']);
    grunt.registerTask('deploy-underscore',             ['underscore-init', 'clean', 'copy']);
    grunt.registerTask('deploy-zeroclipboard',          ['zeroclipboard-init', 'clean', 'copy']);
    grunt.registerTask('deploy-bootstrap',              ['bootstrap-init', 'clean', 'copy']);
    grunt.registerTask('deploy-jszip',                  ['jszip-init', 'clean', 'copy']);
    grunt.registerTask('deploy-jsziputils',             ['jsziputils-init', 'clean', 'copy']);
    grunt.registerTask('deploy-jsrsasign',              ['jsrsasign-init', 'clean', 'copy']);
    grunt.registerTask('deploy-requirejs',              ['requirejs-init', 'clean', 'uglify']);

    grunt.registerTask('deploy-app-main',               ['main-app-init', 'clean', 'less', 'replace:fixLessUrl', 'requirejs', 'concat', 'imagemin', 'copy', 'lessPostFix']);
    grunt.registerTask('deploy-app-mobile',             ['mobile-app-init', 'clean', 'uglify', 'cssmin:styles', 'copy']);
    grunt.registerTask('deploy-app-embed',              ['embed-app-init', 'clean', 'uglify', 'less', 'replace:fixLessUrl', 'copy']);


    doRegisterInitializeAppTask('documenteditor',       'DocumentEditor',       'documenteditor.json');
    doRegisterInitializeAppTask('spreadsheeteditor',    'SpreadsheetEditor',    'spreadsheeteditor.json');
    doRegisterInitializeAppTask('presentationeditor',   'PresentationEditor',   'presentationeditor.json');


    grunt.registerTask('deploy-app', 'Deploy application.', function(){
        if (packageFile) {
            if (packageFile['tasks']['deploy'])
                grunt.task.run(packageFile['tasks']['deploy']);
            else
                grunt.log.error().writeln('Not found "deploy" task in configure'.red);
        } else {
            grunt.log.error().writeln('Is not load configure file.'.red);
        }
    });

    grunt.registerTask('deploy-documenteditor',     ['init-build-documenteditor', 'deploy-app']);
    grunt.registerTask('deploy-spreadsheeteditor',  ['init-build-spreadsheeteditor', 'deploy-app']);
    grunt.registerTask('deploy-presentationeditor', ['init-build-presentationeditor', 'deploy-app']);

    grunt.registerTask('default', ['deploy-documenteditor', 'deploy-spreadsheeteditor', 'deploy-presentationeditor']);
};