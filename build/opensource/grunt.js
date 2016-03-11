module.exports = function(grunt) {
    var defaultConfig, packageFile, deployConfig, deployFile;

    grunt.loadNpmTasks('grunt-contrib');

    grunt.registerTask('sdk-init', function() {
        grunt.initConfig({
            clean: packageFile['sdk']['clean'],

            copy: {
                sdk: {
                    files: packageFile['sdk']['copy']
                }
            }
        });
    });

    grunt.registerTask('api-init', function() {
        grunt.initConfig({
            clean: packageFile['api']['clean'],

            copy: {
                api: {
                    files: packageFile['api']['copy']
                }
            }
        });
    });

    grunt.registerTask('bootstrap-init', function() {
        grunt.initConfig({
            clean: packageFile['bootstrap']['clean'],

            copy: {
                script: {
                    files: packageFile['bootstrap']["copy"]["script"]
                },
                css: {
                    files: packageFile['bootstrap']["copy"]["css"]
                },
                images: {
                    files: packageFile['bootstrap']["copy"]["images"]
                }
            }
        });
    });

    grunt.registerTask('extjs-init', function() {
        grunt.initConfig({
            clean: packageFile['extjs']['clean'],

            copy: {
                script: {
                    files: packageFile['extjs']["copy"]["script"]
                },
                css: {
                    files: packageFile['extjs']["copy"]["css"]
                },
                images: {
                    files: packageFile['extjs']["copy"]["images"]
                }
            }
        });
    });

    grunt.registerTask('megapixel-init', function() {
        grunt.initConfig({
            clean: packageFile['megapixel']['clean'],

            copy: {
                script: {
                    files: packageFile['megapixel']["copy"]["script"]
                }
            }
        });
    });

    grunt.registerTask('touch-init', function() {
        grunt.initConfig({
            clean: packageFile['touch']['clean'],

            copy: {
                script: {
                    files: packageFile['touch']["copy"]["script"]
                }
            }
        });
    });

    grunt.registerTask('jquery-init', function() {
        grunt.initConfig({
            clean: packageFile['jquery']['clean'],

            copy: {
                scripts: {
                    files: packageFile['jquery']["copy"]["script"]
                }
            }
        });
    });

    grunt.registerTask('sockjs-init', function() {
        grunt.initConfig({
            clean: packageFile['sockjs']['clean'],

            copy: {
                script: {
                    files: packageFile['sockjs']["copy"]["script"]
                }
            }
        });
    });

    grunt.registerTask('xregexp-init', function() {
        grunt.initConfig({
            clean: packageFile['xregexp']['clean'],

            copy: {
                script: {
                    files: packageFile['xregexp']["copy"]["script"]
                }
            }
        });
    });

    grunt.registerTask('underscore-init', function() {
        grunt.initConfig({
            clean: packageFile['underscore']['clean'],

            copy: {
                script: {
                    files: packageFile['underscore']["copy"]["script"]
                }
            }
        });
    });

    grunt.registerTask('zeroclipboard-init', function() {
        grunt.initConfig({
            clean: packageFile['zeroclipboard']['clean'],

            copy: {
                script: {
                    files: packageFile['zeroclipboard']["copy"]["script"]
                }
            }
        });
    });

    grunt.registerTask('main-app-init', function() {
        grunt.initConfig({
            pkg: '<json:' + defaultConfig + '>',

            clean: packageFile['main']['clean'],

            meta: {
                banner: '/*\n' +
                    ' * (c) Copyright Ascensio System SIA 2010-<%= grunt.template.today("yyyy") %>\n' +
                    ' *\n' +
                    ' * This program is freeware. You can redistribute it and/or modify it under the\n' +
                    ' * terms of the GNU Affero General Public License (AGPL) version 3 as published\n' +
                    ' * by the Free Software Foundation. In accordance with Section 7(a) of the GNU\n' +
                    ' * AGPL its Section 15 shall be amended to the effect that Ascensio System SIA\n' +
                    ' * expressly excludes the warranty of non-infringement of any third-party\n' +
                    ' * rights.\n' +
                    ' *\n' +
                    ' * This program is distributed WITHOUT ANY WARRANTY; without even the implied\n' +
                    ' * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For \n' +
                    ' * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html\n' +
                    ' *\n' +
                    ' * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,\n' +
                    ' * EU, LV-1021. Email: server@teamlab.com  For information about other Ascensio\n' +
                    ' * System SIA products and services, please, consult <%= pkg.homepage %>.\n' +
                    ' *\n' +
                    ' * The  interactive user interfaces in modified source and object code versions \n' +
                    ' * of TeamLab Office must display Appropriate Legal Notices, as required under\n' +
                    ' * Section 5 of the GNU AGPL version 3.\n' +
                    ' *\n' +
                    ' * Pursuant to Article 7 §3(b) of the License you must retain the original\n' +
                    ' * TeamLab logo when distributing the program. If the display of the logo in\n' +
                    ' * its graphic form is not reasonably feasible for technical reasons, you must\n' +
                    ' * include the words "Powered by TeamLab" in every copy of the program you\n' +
                    ' * distribute. Pursuant to Article 7 §3(e) we decline to grant you any rights\n' +
                    ' * under trademark law for use of our trademarks.\n' +
                    ' *\n' +
                    ' * Version: <%= pkg.version %> (build:<%= pkg.build %>)\n' +
                    ' */'
            },

            min: {
                scriptsview: {
                    src: ['<banner:meta.banner>'].concat(packageFile['main']["js"]['srcview']),
                    dest: packageFile['main']["js"]['destview']
                },
                scriptsedit: {
                    src: ['<banner:meta.banner>'].concat(packageFile['main']["js"]['srcedit']),
                    dest: packageFile['main']["js"]['destedit']
                }
            },

            mincss: {
                styles: {
                    files: {
                        "<%= pkg.main.css.destview %>" : packageFile['main']["css"]['srcview']
                        ,"<%= pkg.main.css.destedit %>" : packageFile['main']["css"]['srcedit']
                    }
                }
            },

            copy: {
                localization: {
                    files: packageFile['main']['copy']["localization"]
                },
                help: {
                    files: packageFile['main']['copy']["help"]
                },
                'index-page': {
                    files: packageFile['main']['copy']["index-page"]
                },
                'images-app': {
                    files: packageFile['main']['copy']["images-app"]
                },
                'images-common': {
                    files: packageFile['main']['copy']["images-common"]
                }
            }
        });
    });

    grunt.registerTask('mobile-app-init', function() {
        grunt.initConfig({
            pkg: '<json:' + defaultConfig + '>',

            clean: packageFile['mobile']['clean'],

            meta: {
                banner: '/*\n' +
                    ' * Copyright (c) Ascensio System SIA <%= grunt.template.today("yyyy") %>. All rights reserved\n' +
                    ' *\n' +
                    ' * <%= pkg.homepage %>\n' +
                    ' *\n' +
                    ' * Version: <%= pkg.version %> (build:<%= pkg.build %>)\n' +
                    ' */'
            },

            min: {
                scrips: {
                    src: ['<banner:meta.banner>'].concat(packageFile['mobile']["js"]['src']),
                    dest: packageFile['mobile']["js"]['dist']
                }
            },

            mincss: {
                styles: {
                    files: {
                        "<%= pkg.mobile.css.normal.dist %>" : packageFile['mobile']["css"]['normal']['src'],
                        "<%= pkg.mobile.css.retina.dist %>" : packageFile['mobile']["css"]['retina']['src']
                    }
                }
            },

            copy: {
                localization: {
                    files: packageFile['mobile']['copy']["localization"]
                },
                'index-page': {
                    files: packageFile['mobile']['copy']["index-page"]
                },
                'images-app': {
                    files: packageFile['mobile']['copy']["images-app"]
                }
            }
        });
    });

    grunt.registerTask('embed-app-init', function() {
        grunt.initConfig({
            pkg: '<json:' + defaultConfig + '>',

            clean: packageFile['embed']['clean'],

            meta: {
                banner: '/*\n' +
                    ' * Copyright (c) Ascensio System SIA <%= grunt.template.today("yyyy") %>. All rights reserved\n' +
                    ' *\n' +
                    ' * <%= pkg.homepage %>\n' +
                    ' *\n' +
                    ' * Version: <%= pkg.version %> (build:<%= pkg.build %>)\n' +
                    ' */'
            },

            min: {
                scrips: {
                    src: ['<banner:meta.banner>'].concat(packageFile['embed']["js"]['src']),
                    dest: packageFile['embed']["js"]['dist']
                }
            },

            mincss: {
                styles: {
                    files: {
                        "<%= pkg.embed.css.dist %>" : packageFile['embed']["css"]['src']
                    }
                }
            },

            copy: {
                'index-page': {
                    files: packageFile['embed']['copy']["index-page"]
                },
                'images-app': {
                    files: packageFile['embed']['copy']["images-app"]
                }
            }
        });
    });

    grunt.registerTask('increment-build', function() {
        var pkg = grunt.file.readJSON(defaultConfig);
        pkg.build = parseInt(pkg.build) + 1;
        grunt.file.write(defaultConfig, JSON.stringify(pkg, null, 4));
    });



    grunt.registerTask('deploy-api',                    'api-init clean copy');
    grunt.registerTask('deploy-sdk',                    'sdk-init clean copy');

    grunt.registerTask('deploy-3rdparty-bootstrap',     'bootstrap-init clean copy');
    grunt.registerTask('deploy-3rdparty-extjs',         'extjs-init clean copy');
    grunt.registerTask('deploy-3rdparty-megapixel',     'megapixel-init clean copy');
    grunt.registerTask('deploy-3rdparty-touch',         'touch-init clean copy');
    grunt.registerTask('deploy-3rdparty-jquery',        'jquery-init clean copy');
    grunt.registerTask('deploy-3rdparty-sockjs',        'sockjs-init clean copy');
    grunt.registerTask('deploy-3rdparty-xregexp',       'xregexp-init clean copy');
    grunt.registerTask('deploy-3rdparty-underscore',    'underscore-init clean copy');
    grunt.registerTask('deploy-3rdparty-zeroclipboard', 'zeroclipboard-init clean copy');

    grunt.registerTask('deploy-app-main',               'main-app-init clean min mincss copy');
    grunt.registerTask('deploy-app-mobile',             'mobile-app-init clean min mincss copy');
    grunt.registerTask('deploy-app-embed',              'embed-app-init clean min mincss copy');



    grunt.registerTask('init-build-documenteditor', 'Initialize build DocumentEditor.', function(){
        defaultConfig = 'documenteditor.json';
        packageFile = require('./' + defaultConfig);

        if (packageFile)
            grunt.log.ok('DocumentEditor config loaded successfully'.green);
        else
            grunt.log.error().writeln('Could not load config file'.red);
    });

    grunt.registerTask('init-build-spreadsheeteditor', 'Initialize build SpreadsheetEditor.', function(){
        defaultConfig = 'spreadsheeteditor.json';
        packageFile = require('./' + defaultConfig);

        if (packageFile)
            grunt.log.ok('SpreadsheetEditor config loaded successfully'.green);
        else
            grunt.log.error().writeln('Could not load config file'.red);
    });

    grunt.registerTask('init-build-presentationeditor', 'Initialize build PresentationEditor.', function(){
        defaultConfig = 'presentationeditor.json';
        packageFile = require('./' + defaultConfig);

        if (packageFile)
            grunt.log.ok('PresentationEditor config loaded successfully'.green);
        else
            grunt.log.error().writeln('Could not load config file'.red);
    });

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

    grunt.registerTask('deploy-documenteditor',     'init-build-documenteditor deploy-app');
    grunt.registerTask('deploy-spreadsheeteditor',  'init-build-spreadsheeteditor deploy-app');
    grunt.registerTask('deploy-presentationeditor', 'init-build-presentationeditor deploy-app');

    grunt.registerTask('default', 'deploy-documenteditor deploy-spreadsheeteditor deploy-presentationeditor');
};