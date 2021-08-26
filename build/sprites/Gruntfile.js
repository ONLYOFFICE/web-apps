module.exports = function (grunt, rootpathprefix) {
    const sprite_name = 'iconssmall';
    const sprite_name_big = 'iconsbig';
    const sprite_name_huge = 'iconshuge';

    const helpers = {
        parselang: (name, options) => {
            if (/\((\S+)\)$/.test(name)) {
                let _match = /(.+)\((\S+)\)$/.exec(name);
                return '[applang=' + _match[2] + '] ' + options.fn({name:_match[1]});
            } 
            
            return options.fn({name:name});
        },
        half: num => {return num/2;},
        scaled: (num, factor) => {return num / factor;}
    };

    const _prefix = rootpathprefix || '../../';
    const configTemplate = opts => {
        let _editor_res_root = `${_prefix}apps/${opts.editor}/main/resources`,
            _common_res_root = `${_prefix}apps/common/main/resources`,
            _scaled_path = `${opts.scale}/${opts.extpath ? opts.extpath : '.'}`;
        return {
            src: [`${_editor_res_root}/img/toolbar/${_scaled_path}/*.png`, `${_common_res_root}/img/toolbar/${_scaled_path}/*.png`],
            dest: `${_editor_res_root}/img/${opts.scale != '1x' ? opts.spritename + '@' + opts.scale : opts.spritename}.png`,
            destCss: `${_editor_res_root}/less/sprites/${opts.spritename}@${opts.scale}.less`,
            cssTemplate: `${_common_res_root}/img/toolbar/${_scaled_path}/.css.handlebars`,
            algorithm: 'top-down',
            cssHandlebarsHelpers: helpers
        };
    };
    
    grunt.initConfig({
        sprite: {
            'word-1x': configTemplate({
                editor:'documenteditor',
                spritename: sprite_name,
                scale: '1x'
            }),
            'word-big-1x': configTemplate({
                editor:'documenteditor',
                spritename: sprite_name_big,
                scale: '1x',
                extpath: 'big'
            }),
            'word-huge-1x': configTemplate({
                editor:'documenteditor',
                spritename: sprite_name_huge,
                scale: '1x',
                extpath: 'huge'
            }),
            'word-2x': configTemplate({
                editor:'documenteditor',
                spritename: sprite_name,
                scale: '2x'
            }),
            'word-big-2x': configTemplate({
                editor:'documenteditor',
                spritename: sprite_name_big,
                scale: '2x',
                extpath: 'big'
            }),
            'word-huge-2x': configTemplate({
                editor:'documenteditor',
                spritename: sprite_name_huge,
                scale: '2x',
                extpath: 'huge'
            }),

            'word1.25x': configTemplate({
                editor:'documenteditor',
                spritename: sprite_name,
                scale: '1.25x'
            }),
            'word-big-1.25x': configTemplate({
                editor:'documenteditor',
                spritename: sprite_name_big,
                scale: '1.25x',
                extpath: 'big'
            }),
            'word-huge-1.25x': configTemplate({
                editor:'documenteditor',
                spritename: sprite_name_huge,
                scale: '1.25x',
                extpath: 'huge'
            }),

            'word1.5x': configTemplate({
                editor:'documenteditor',
                spritename: sprite_name,
                scale: '1.5x'
            }),
            'word-big-1.5x': configTemplate({
                editor:'documenteditor',
                spritename: sprite_name_big,
                scale: '1.5x',
                extpath: 'big'
            }),
            'word-huge-1.5x': configTemplate({
                editor:'documenteditor',
                spritename: sprite_name_huge,
                scale: '1.5x',
                extpath: 'huge'
            }),

            'word1.75x': configTemplate({
                editor:'documenteditor',
                spritename: sprite_name,
                scale: '1.75x'
            }),
            'word-big-1.75x': configTemplate({
                editor:'documenteditor',
                spritename: sprite_name_big,
                scale: '1.75x',
                extpath: 'big'
            }),
            'word-huge-1.75x': configTemplate({
                editor:'documenteditor',
                spritename: sprite_name_huge,
                scale: '1.75x',
                extpath: 'huge'
            }),

            'slide-1x': configTemplate({
                editor:'presentationeditor',
                spritename: sprite_name,
                scale: '1x'
            }),
            'slide-big-1x': configTemplate({
                editor:'presentationeditor',
                spritename: sprite_name_big,
                scale: '1x',
                extpath: 'big'
            }),

            'slide-2x': configTemplate({
                editor:'presentationeditor',
                spritename: sprite_name,
                scale: '2x'
            }),
            'slide-big-2x': configTemplate({
                editor:'presentationeditor',
                spritename: sprite_name_big,
                scale: '2x',
                extpath: 'big'
            }),

            'slide-1.5x': configTemplate({
                editor:'presentationeditor',
                spritename: sprite_name,
                scale: '1.5x'
            }),
            'slide-big-1.5x': configTemplate({
                editor:'presentationeditor',
                spritename: sprite_name_big,
                scale: '1.5x',
                extpath: 'big'
            }),

            'slide-1.25x': configTemplate({
                editor:'presentationeditor',
                spritename: sprite_name,
                scale: '1.25x'
            }),
            'slide-big-1.25x': configTemplate({
                editor:'presentationeditor',
                spritename: sprite_name_big,
                scale: '1.25x',
                extpath: 'big'
            }),

            'slide-1.75x': configTemplate({
                editor:'presentationeditor',
                spritename: sprite_name,
                scale: '1.75x'
            }),
            'slide-big-1.75x': configTemplate({
                editor:'presentationeditor',
                spritename: sprite_name_big,
                scale: '1.75x',
                extpath: 'big'
            }),

            'cell-1x': configTemplate({
                editor:'spreadsheeteditor',
                spritename: sprite_name,
                scale: '1x'
            }),
            'cell-big-1x': configTemplate({
                editor:'spreadsheeteditor',
                spritename: sprite_name_big,
                scale: '1x',
                extpath: 'big'
            }),

            'cell-2x': configTemplate({
                editor:'spreadsheeteditor',
                spritename: sprite_name,
                scale: '2x'
            }),
            'cell-big-2x': configTemplate({
                editor:'spreadsheeteditor',
                spritename: sprite_name_big,
                scale: '2x',
                extpath: 'big'
            }),

            'cell-1.5x': configTemplate({
                editor:'spreadsheeteditor',
                spritename: sprite_name,
                scale: '1.5x'
            }),
            'cell-big-1.5x': configTemplate({
                editor:'spreadsheeteditor',
                spritename: sprite_name_big,
                scale: '1.5x',
                extpath: 'big'
            }),

            'cell-1.25x': configTemplate({
                editor:'spreadsheeteditor',
                spritename: sprite_name,
                scale: '1.25x'
            }),
            'cell-big-1.25x': configTemplate({
                editor:'spreadsheeteditor',
                spritename: sprite_name_big,
                scale: '1.25x',
                extpath: 'big'
            }),

            'cell-1.75x': configTemplate({
                editor:'spreadsheeteditor',
                spritename: sprite_name,
                scale: '1.75x'
            }),
            'cell-big-1.75x': configTemplate({
                editor:'spreadsheeteditor',
                spritename: sprite_name_big,
                scale: '1.75x',
                extpath: 'big'
            }),
        }
    });

    // Load in `grunt-spritesmith`
    grunt.loadNpmTasks('grunt-spritesmith');

    grunt.registerTask('word-icons', ['sprite:word-1x', 'sprite:word-big-1x', 'sprite:word-huge-1x', 'sprite:word-2x', 'sprite:word-big-2x', 'sprite:word-huge-2x',
                                        'sprite:word1.25x', 'sprite:word-big-1.25x', 'sprite:word-huge-1.25x',
                                        'sprite:word1.5x', 'sprite:word-big-1.5x', 'sprite:word-huge-1.5x',
                                        'sprite:word1.75x', 'sprite:word-big-1.75x', 'sprite:word-huge-1.75x']);
    grunt.registerTask('slide-icons', ['sprite:slide-1x', 'sprite:slide-big-1x','sprite:slide-2x', 'sprite:slide-big-2x',
                                        'sprite:slide-1.5x', 'sprite:slide-big-1.5x',
                                        'sprite:slide-1.25x', 'sprite:slide-big-1.25x',
                                        'sprite:slide-1.75x', 'sprite:slide-big-1.75x']);
    grunt.registerTask('cell-icons', ['sprite:cell-1x', 'sprite:cell-big-1x','sprite:cell-2x', 'sprite:cell-big-2x',
                                        'sprite:cell-1.5x', 'sprite:cell-big-1.5x',
                                        'sprite:cell-1.25x', 'sprite:cell-big-1.25x',
                                        'sprite:cell-1.75x', 'sprite:cell-big-1.75x']);

    grunt.registerTask('all-icons-sprite', ['word-icons','slide-icons','cell-icons']);
    grunt.registerTask('default', ['all-icons-sprite']);
};