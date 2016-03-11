module.exports = function(grunt) {
    var defaultConfig, packageFile, deployConfig, deployFile;

    grunt.loadNpmTasks('grunt-contrib');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-replace');

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
                    ' * Copyright (c) Ascensio System SIA <%= grunt.template.today("yyyy") %>. All rights reserved\n' +
                    ' *\n' +
                    ' * <%= pkg.homepage %> \n' +
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

    grunt.registerTask('init-obfuscate-app', 'Obfuscate application.', function(){
        grunt.initConfig({
          exec: {
            obfuscate_string: {
              command: function() {
                    var exec_string = '.\\bin\\ObfuscateStrings.exe';
                    exec_string += ' -api ' + packageFile['obf']['api'];
                    exec_string += ' -pat ' + packageFile['obf']['pat'];
                    exec_string += ' ' + packageFile['obf']['keys'];
                    for(var i in packageFile['obf']['apply']){
                        exec_string += ' -apply ' + packageFile['obf']['apply'][i] + ' ' + packageFile['obf']['apply'][i];
                    }
                    return exec_string;
                },
              stdout: false
            }
          }
        });
    });
    
    grunt.registerTask('init-obfuscate-api', 'Obfuscate api.', function(){
        grunt.initConfig({
          exec: {
            obfuscate_api: {
              command: function() {
                    var exec_string = '.\\bin\\ObfuscateJSApi.exe -verbose';
                    exec_string += ' -ccvars ' + packageFile['obf_api']['ccvars'];
                    exec_string += ' -ccprops ' + packageFile['obf_api']['ccprops'];
                    exec_string += ' -api ' + packageFile['obf_api']['api'];
                    for(var i in packageFile['obf_api']['clientjs']){
                        exec_string += ' -clientjs ' + packageFile['obf_api']['clientjs'][i] + ' ' + packageFile['obf_api']['clientjs'][i];
                    }
                    exec_string += ' -ccres ' + packageFile['obf_api']['ccres'] + ' ' + packageFile['obf_api']['ccres'];
                    return exec_string;
                },
              stdout: false
            }
          }
        });
    });
    
    grunt.registerTask('obfuscate-api',             'init-obfuscate-api exec');
    grunt.registerTask('obfuscate-app',             'init-obfuscate-app exec');
    
    grunt.registerTask('deploy-documenteditor',     'init-build-documenteditor deploy-app');
    grunt.registerTask('deploy-spreadsheeteditor',  'init-build-spreadsheeteditor deploy-app');
    grunt.registerTask('deploy-presentationeditor', 'init-build-presentationeditor deploy-app');

    grunt.registerTask('obfuscate-documenteditor',     'deploy-documenteditor obfuscate-api obfuscate-app');
    grunt.registerTask('obfuscate-spreadsheeteditor',  'deploy-spreadsheeteditor obfuscate-app');
    grunt.registerTask('obfuscate-presentationeditor', 'deploy-presentationeditor obfuscate-api obfuscate-app');
	
	grunt.registerTask('obfuscate-all', 'obfuscate-documenteditor obfuscate-spreadsheeteditor obfuscate-presentationeditor');
	
	grunt.registerTask('init-deploy-isa209', 'Initialize deploy to isa209.', function(){
        deployConfig = 'isa209.json';
		
		deployFile = require('./' + deployConfig);
		
        if (deployFile)		
            grunt.log.ok('isa209 config loaded successfully'.green);
        else
            grunt.log.error().writeln('Could not load config file'.red);
	});
	
	grunt.registerTask('init-deploy-testserver', 'Initialize deploy to testserver.', function(){
        deployConfig = 'testserver.json';
		
		deployFile = require('./' + deployConfig);
		
        if (deployFile)		
            grunt.log.ok('testserver config loaded successfully'.green);
        else
            grunt.log.error().writeln('Could not load config file'.red);
	});
	
	grunt.registerTask('init-deploy-com', 'Initialize deploy to com.', function(){
        deployConfig = 'com.json';
		
		deployFile = require('./' + deployConfig);
		
        if (deployFile)		
            grunt.log.ok('com config loaded successfully'.green);
        else
            grunt.log.error().writeln('Could not load config file'.red);
	});
	
	grunt.registerTask('init-deploy-com.eu', 'Initialize deploy to com.', function(){
        deployConfig = 'com.eu.json';
		
		deployFile = require('./' + deployConfig);
		
        if (deployFile)		
            grunt.log.ok('com config loaded successfully'.green);
        else
            grunt.log.error().writeln('Could not load config file'.red);
	});
	
	grunt.registerTask('init-deploy-nct', 'Initialize deploy to nct.', function(){
        deployConfig = 'nct.json';
		
		deployFile = require('./' + deployConfig);
		
        if (deployFile)		
            grunt.log.ok('nct config loaded successfully'.green);
        else
            grunt.log.error().writeln('Could not load config file'.red);
	});

	grunt.registerTask('init-deploy-doc-test', 'Initialize deploy to doc-test.', function(){
        deployConfig = 'doc-test.json';
		
		deployFile = require('./' + deployConfig);
		
        if (deployFile)		
            grunt.log.ok('doc-test config loaded successfully'.green);
        else
            grunt.log.error().writeln('Could not load config file'.red);
	});
	
	grunt.registerTask('run-deploy-task', 'Run deploy task.', function(){
        if (deployFile) {
            if (deployFile['tasks']['deploy'])
                grunt.task.run(deployFile['tasks']['deploy']);
            else
                grunt.log.error().writeln('Not found "deploy" task in configure'.red);
        } else {
            grunt.log.error().writeln('Is not load configure file.'.red);
        }
    });
	
	grunt.registerTask('insert-version-to-url', function() {
		var dst_folder = 'v' + deployFile['version']['major'] + '.' + deployFile['version']['minor'];
		
		if(undefined !== process.env['BUILD_NUMBER'])
		{
			grunt.log.ok('Use Jenkins build number as minor version!'.yellow);			
			dst_folder = 'v' + deployFile['version']['major'] + '.' + process.env['BUILD_NUMBER'];
		}
		
		//change current config:
		//set version's named folder as rootDir for archived sources
		if(undefined !== deployFile['compress'])
			deployFile['compress']['dist']['options']['rootDir'] = dst_folder;
		
		if(undefined !== deployFile['dst'])
			deployFile['dst'] = deployFile['dst'] + '/' + dst_folder;

		//add version's named folder to full path url
		var full_url = deployFile['replace']['url']['options']['variables'];
		for(var i in full_url){	
			full_url[i] = full_url[i] + dst_folder + '/';
		}
    });
	
	grunt.registerTask('increment-deploy-version', function() {

		var pkg = grunt.file.readJSON(deployConfig);
        pkg.version.minor = parseInt(pkg.version.minor) + 1;
		
		//write changes
        grunt.file.write(deployConfig, JSON.stringify(pkg, null, 4));
    });
	
	grunt.registerTask('init-deploy-compress', function(){
		grunt.initConfig({
			pkg: '<json:' + deployConfig + '>',
			compress: deployFile['compress']
		});
    });
	
	grunt.registerTask('deploy-compress-all', 'init-deploy-compress'); 
   
	grunt.registerTask('init-deploy-configure', 'Init configure task.', function(){
		var replace_path_array = {};
		
		if(deployFile['path']){
			//Generate structure for the replace tasks
			//for each pattern
			for(var i in deployFile['path']['pattern']){
				//and for each file
				for(var j in deployFile['path']['src_path']){
					var replace_task_name = 'path_subtask_' + i + j;
					replace_path_array[replace_task_name] = {};				
					replace_path_array[replace_task_name]['options'] = {};
					var find = deployFile['path']['pattern'][i];
					
					var replace = '';
					//find the count of slash
					var start_index = 0;
					while(true){
						start_index = deployFile['path']['src_path'][j].indexOf('/', start_index + 1);
						//add up folder to replace string per each slash
						if(start_index != -1)
							replace = replace + '../';
						else
							break;
					}
					//find the begin of file name
					var last_slash = deployFile['path']['src_path'][j].lastIndexOf('/');
					//and add path to file to replace string whithout file name
					if(last_slash != -1)
						replace = replace + deployFile['path']['src_path'][j].substring(0, last_slash + 1);
					replace = replace + find;
					
					replace_path_array[replace_task_name]['options']['variables'] = {};
					replace_path_array[replace_task_name]['options']['variables'][find] = replace;
					replace_path_array[replace_task_name]['options']['prefix'] = "";
					var file = deployFile['path']['base_path'] + '/' + deployFile['path']['src_path'][j];
					replace_path_array[replace_task_name]['files'] = {};
					replace_path_array[replace_task_name]['files'][file] = file;
					grunt.log.ok(JSON.stringify(replace_path_array[replace_task_name], null, 4).green);				
				}
			}
		}
		//Copy replace task from configuration file
		for(var i in deployFile['replace']){
			replace_path_array[i] = deployFile['replace'][i];
		}
		
        grunt.initConfig({
			pkg: deployFile,
			pkg_origin: '<json:' + deployConfig + '>',
			clean: [ '<%= pkg_origin.dst %>/' ],
			copy: {
                all: {
                    files: {
						'<%= pkg.dst %>/': '<%= pkg.src %>/**'
					}
                }
			},
			replace: replace_path_array 
        });
    });
	
	grunt.registerTask('deploy-configure-all', 'init-deploy-configure clean copy replace'); 
	
    grunt.registerTask('deploy-to-isa209', 'init-deploy-isa209 run-deploy-task');
	grunt.registerTask('deploy-to-testserver', 'init-deploy-testserver run-deploy-task');
	grunt.registerTask('deploy-to-com', 'init-deploy-com run-deploy-task');
	grunt.registerTask('deploy-to-com.eu', 'init-deploy-com.eu run-deploy-task');
	grunt.registerTask('deploy-to-nct', 'init-deploy-nct run-deploy-task');
	grunt.registerTask('deploy-to-doc-test', 'init-deploy-doc-test run-deploy-task');
	grunt.registerTask('deploy-to-all', 'deploy-to-isa209 deploy-to-testserver deploy-to-com deploy-to-com.eu deploy-to-nct deploy-to-doc-test');
    
    grunt.registerTask('default', 'deploy-documenteditor deploy-spreadsheeteditor deploy-presentationeditor');
};