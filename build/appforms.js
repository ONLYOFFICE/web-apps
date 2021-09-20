
module.exports = (grunt) => {
    grunt.registerTask('forms-app-init', function() {
        const packageFile = global.packageFile;
        if ( !global.packageFile )
            grunt.log.ok('no package file'.red);
        else {
            const config = require('./appforms.json');
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
                compile: {
                    options: packageFile.forms.js.requirejs.options
                }
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

            inline: {
                dist: {
                    src: packageFile.forms.inline.src
                }
            }

        });
    });
    
    grunt.registerTask('deploy-app-forms', ['forms-app-init', 'clean:prebuild', /*'imagemin',*/ 'less',
                                                            'requirejs', 'concat', 'copy', 'inline', /*'json-minify',*/
                                                            /*'replace:writeVersion',*/ /*'replace:prepareHelp',*/ 'clean:postbuild']);
}