module.exports = function(grunt) {
    var _ = require('lodash'),
        defaultConfig,
        packageFile;

    var copyright = '/*\n' +
                    ' * Copyright (c) Ascensio System SIA <%= grunt.template.today("yyyy") %>. All rights reserved\n' +
                    ' *\n' +
                    ' * <%= pkg.homepage %> \n' +
                    ' *\n' +
                    ' * Version: <%= pkg.version %> (build:<%= pkg.build %>)\n' +
                    ' */\n';


    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
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
        return {
            pkg: packageFile,
            replace: {
                  writeVersion: {
                      src: ['<%= pkg.api.copy.script.dest %>' +  '/**/*.js'],
                      overwrite: true,
                      replacements: [{
                          from: /\{\{PRODUCT_VERSION\}\}/,
                          to: packageFile.version
                      }]
                  }
            }
        }
    });
    doRegisterTask('sockjs');
    doRegisterTask('xregexp');
    doRegisterTask('megapixel');
    doRegisterTask('jquery');
    doRegisterTask('underscore');
    doRegisterTask('zeroclipboard');
    doRegisterTask('bootstrap');
    doRegisterTask('jszip');
    doRegisterTask('jsziputils');
    doRegisterTask('requirejs', function(defaultConfig, packageFile) {
        return {
            uglify: {
                pkg: packageFile,

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
            pkg: packageFile,

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
                        ieCompat: false,
                        modifyVars: packageFile['main']['less']['vars'],
                        plugins: [
                            new (require('less-plugin-clean-css'))()
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
                writeVersion: {
                    src: ['<%= pkg.main.js.requirejs.options.out %>'],
                    overwrite: true,
                    replacements: [{
                        from: /\{\{PRODUCT_VERSION\}\}/,
                        to: packageFile.version
                    }]
                }
            },

            concat: {
                options: {
                    stripBanners: true,
                    banner: copyright
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

    grunt.registerTask('mobile-app-init', function() {
        grunt.initConfig({
            pkg: packageFile,

            clean: {
                options: {
                    force: true
                },
                'deploy': packageFile['mobile']['clean']['deploy'],
                'template-backup': packageFile.mobile.copy['template-backup'][0].dest
            },

            requirejs: {
                compile: {
                    options: packageFile['mobile']['js']['requirejs']['options']
                }
            },

            concat: {
                options: {
                    stripBanners: true,
                    banner: copyright
                },
                dist: {
                    src: packageFile.mobile.js.requirejs.options.out,
                    dest: packageFile.mobile.js.requirejs.options.out
                }
            },

            cssmin: {
                // options: {level: { 1: { roundingPrecision: 'all=3' }}}, // to round fw7 numbers in styles. need clean-css 4.0
                target: {
                    files: {
                        "<%= pkg.mobile.css.ios.dist %>" : packageFile['mobile']['css']['ios']['src'],
                        "<%= pkg.mobile.css.material.dist %>" : packageFile['mobile']['css']['material']['src']
                    }
                }
            },

            htmlmin: {
                dist: {
                    options: {
                        removeComments: true,
                        collapseWhitespace: true
                    },
                    files: packageFile['mobile']['htmlmin']['templates']
                }
            },

            copy: {
                'template-backup': {
                    files: packageFile['mobile']['copy']['template-backup']
                },
                'template-restore': {
                    files: packageFile['mobile']['copy']['template-restore']
                },
                'localization': {
                    files: packageFile['mobile']['copy']['localization']
                },
                'index-page': {
                    files: packageFile['mobile']['copy']['index-page']
                },
                'images-app': {
                    files: packageFile['mobile']['copy']['images-app']
                }
            },
            
            replace: {
                writeVersion: {
                    src: ['<%= pkg.mobile.js.requirejs.options.out %>'],
                    overwrite: true,
                    replacements: [{
                        from: /\{\{PRODUCT_VERSION\}\}/,
                        to: packageFile.version
                    }]
                },
                fixResourceUrl: {
                    src: ['<%= pkg.mobile.js.requirejs.options.out %>',
                            '<%= pkg.mobile.css.ios.dist %>',
                            '<%= pkg.mobile.css.material.dist %>'],
                    overwrite: true,
                    replacements: [{
                        from: /(?:\.{2}\/){4}common\/mobile\/resources\/img/g,
                        to: '../img'
                    },{
                        from: /(?:\.{2}\/){2}common\/mobile/g,
                        to: '../mobile'
                    }]
                }
            }
        });
    });

    grunt.registerTask('embed-app-init', function() {
        grunt.initConfig({
            pkg: packageFile,

            clean: {
                options: {
                    force: true
                },
                postbuild: packageFile['embed']['clean']['postbuild'],
                prebuild: packageFile['embed']['clean']['prebuild']
            },

            uglify: {
                options: {
                    banner: copyright
                },
                build: {
                    src: packageFile['embed']['js']['src'],
                    dest: packageFile['embed']['js']['dist']
                }
            },

            less: {
                production: {
                    options: {
                        compress: true,
                        ieCompat: false
                    },
                    files: {
                        "<%= pkg.embed.less.files.dist %>": packageFile['embed']['less']['files']['src']
                    }
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
        packageFile.version = (process.env['PRODUCT_VERSION'] || pkg.version);
        packageFile.build = (process.env['BUILD_NUMBER'] || pkg.build);
        grunt.file.write(defaultConfig, JSON.stringify(pkg, null, 4));
    });


    grunt.registerTask('deploy-api',                    ['api-init', 'clean', 'copy', 'replace:writeVersion']);
    grunt.registerTask('deploy-sdk',                    ['sdk-init', 'clean', 'copy']);

    grunt.registerTask('deploy-sockjs',                 ['sockjs-init', 'clean', 'copy']);
    grunt.registerTask('deploy-xregexp',                ['xregexp-init', 'clean', 'copy']);
    grunt.registerTask('deploy-megapixel',              ['megapixel-init', 'clean', 'copy']);
    grunt.registerTask('deploy-jquery',                 ['jquery-init', 'clean', 'copy']);
    grunt.registerTask('deploy-underscore',             ['underscore-init', 'clean', 'copy']);
    grunt.registerTask('deploy-bootstrap',              ['bootstrap-init', 'clean', 'copy']);
    grunt.registerTask('deploy-jszip',                  ['jszip-init', 'clean', 'copy']);
    grunt.registerTask('deploy-jsziputils',             ['jsziputils-init', 'clean', 'copy']);
    grunt.registerTask('deploy-requirejs',              ['requirejs-init', 'clean', 'uglify']);

    grunt.registerTask('deploy-app-main',               ['main-app-init', 'clean', 'imagemin', 'less', 'requirejs', 'concat',
                                                            'copy', 'replace:writeVersion']);

    grunt.registerTask('deploy-app-mobile',             ['mobile-app-init', 'clean:deploy', 'cssmin', 'copy:template-backup',
                                                            'htmlmin', 'requirejs', 'concat', 'copy:template-restore',
                                                            'clean:template-backup', 'copy:localization', 'copy:index-page',
                                                            'copy:images-app', 'replace:writeVersion', 'replace:fixResourceUrl']);

    grunt.registerTask('deploy-app-embed',              ['embed-app-init', 'clean:prebuild', 'uglify', 'less', 'copy', 
                                                            'clean:postbuild']);

    doRegisterInitializeAppTask('common',               'Common',               'common.json');
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

    grunt.registerTask('deploy-common-component',             ['init-build-common', 'deploy-app']);
    grunt.registerTask('deploy-documenteditor-component',     ['init-build-documenteditor', 'deploy-app']);
    grunt.registerTask('deploy-spreadsheeteditor-component',  ['init-build-spreadsheeteditor', 'deploy-app']);
    grunt.registerTask('deploy-presentationeditor-component', ['init-build-presentationeditor', 'deploy-app']);
    // This task is called from the Makefile, don't delete it.
    grunt.registerTask('deploy-documents-component',          ['deploy-common-component']);   

    grunt.registerTask('deploy-documenteditor',     ['deploy-common-component', 'deploy-documenteditor-component']);
    grunt.registerTask('deploy-spreadsheeteditor',  ['deploy-common-component', 'deploy-spreadsheeteditor-component']);
    grunt.registerTask('deploy-presentationeditor', ['deploy-common-component', 'deploy-presentationeditor-component']);

    grunt.registerTask('default', ['deploy-common-component',
                                   'deploy-documenteditor-component',
                                   'deploy-spreadsheeteditor-component',
                                   'deploy-presentationeditor-component']);
};