/*
 * (c) Copyright Ascensio System SIA 2010-2024
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */
module.exports = function (grunt, rootpathprefix) {
    const sprite_name = 'iconssmall';
    const sprite_name_big = 'iconsbig';
    const sprite_name_huge = 'iconshuge';
    var self = this;

    const helpers = {
        parselang: (name, options) => {
            if (/\((\S+)\)$/.test(name)) {
                let _match = /(.+)\((\S+)\)$/.exec(name);
                return '[applang=' + _match[2] + '] ' + options.fn({name:_match[1]});
            }

            return options.fn({name:name});
        },
        spritepostfix: () => `${opts.extpath ? opts.extpath : 'small'}-${scaling_table[opts.scale]}`,
    };

    const _prefix = rootpathprefix || '../../';
    const scaling_table = {'1x':'100','1.25x':'125','1.5x':'150','1.75x':'175','2x':'200'};
    const configTemplate = opts => {
        let _editor_res_root = `${_prefix}apps/${opts.editor}/main/resources`,
            _common_res_root = `${_prefix}apps/common/main/resources`,
            _scaled_path = `${opts.scale}/${opts.extpath ? opts.extpath : '.'}`;
        const _mod_path = opts.mod2 ? 'v2/' : '';
        let hbhelpers = {...helpers};
        hbhelpers.spritepostfix = () => `${opts.extpath ? opts.extpath : 'small'}-${scaling_table[opts.scale]}`;
        hbhelpers.extracls = () => opts.mod2 ? '.theme-icons-cls-mod2 ' : '';
        hbhelpers.iesupport = () => !opts.mod2;
        hbhelpers.xpsupport = () => !opts.mod2;

        return {
            src: [`${_editor_res_root}/img/toolbar/${_mod_path}${_scaled_path}/*.png`, `${_common_res_root}/img/toolbar/${_mod_path}${_scaled_path}/*.png`],
            dest: `${_editor_res_root}/img/${_mod_path}${opts.scale != '1x' ? opts.spritename + '@' + opts.scale : opts.spritename}.png`,
            destCss: `${_editor_res_root}/less/sprites/${opts.spritename}@${opts.scale}${opts.mod2?'.mod2':''}.less`,
            cssTemplate: `${_common_res_root}/img/toolbar/${_scaled_path}/.css.handlebars`,
            algorithm: 'top-down',
            cssHandlebarsHelpers: hbhelpers
        };
    };

    const configTemplateV2 = opts => {
        let _editor_res_root = `${_prefix}apps/${opts.editor}/main/resources`,
            _common_res_root = `${_prefix}apps/common/main/resources`,
            _scaled_path = `${opts.scale}/${opts.extpath ? opts.extpath : '.'}`;
        let hbhelpers = {...helpers};
        hbhelpers.spritepostfix = () => `${opts.extpath ? opts.extpath : 'small'}-${scaling_table[opts.scale]}`;
        hbhelpers.extracls = () => '.theme-icons-cls-mod2 ';
        return {
            src: [`${_editor_res_root}/img/toolbar/v2/${_scaled_path}/*.png`, `${_common_res_root}/img/toolbar/v2/${_scaled_path}/*.png`],
            dest: `${_editor_res_root}/img/v2/${opts.scale != '1x' ? opts.spritename + '@' + opts.scale : opts.spritename}.png`,
            destCss: `${_editor_res_root}/less/sprites/${opts.spritename}@${opts.scale}.mod2.less`,
            cssTemplate: `${_common_res_root}/img/toolbar/${_scaled_path}/.css.handlebars`,
            algorithm: 'top-down',
            cssHandlebarsHelpers: hbhelpers
        };
    };
    const generate_sprite_tasks = function(editor, mod2=false) {
        const scalings = ['1x','1.25x','1.5x','1.75x','2x'];

        const alias = {"word": "documenteditor",
                        "cell": "spreadsheeteditor",
                        "slide": "presentationeditor",
                        "pdf": "pdfeditor",
                        "draw": "visioeditor"}

        const spritename = {'small': sprite_name,
                            'big': sprite_name_big,
                            'huge' : sprite_name_huge};

        let out = {};

        scalings.forEach((_scaling_) => {
            ['small', 'big', 'huge'].forEach((ext, i) => {
                out[`${editor}${mod2?'-mod2':''}${i?'-'+ext:''}-${_scaling_}`] = configTemplate({
                    editor:`${alias[editor]}`,
                    spritename: spritename[ext],
                    scale: `${_scaling_}`,
                    extpath: i ? ext : '',
                    mod2: mod2,
                })
            });
        });

        return out
    }

    const generate_svg_sprite_tasks = function(editor, mod2=false) {
        const alias = {"word": "documenteditor",
                        "cell": "spreadsheeteditor",
                        "slide": "presentationeditor",
                        "pdf": "pdfeditor",
                        "draw": "visioeditor"};
        const mod_path = mod2 ? 'v2' : '.';
        const mod_task_name_ext = mod2 ? '-v2' : '';

        let out = {};
        ['small', 'big', 'huge'].forEach((ext, i) => {
            const ext_path = ext == 'small' ? '' : `${ext}/`;
            out[`${editor}${mod_task_name_ext}-${ext}2.5x`] = {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/${mod_path}/2.5x/${ext_path}*.svg`,
                    `${_prefix}apps/${alias[editor]}/main/resources/img/toolbar/${mod_path}/2.5x/${ext_path}*.svg`],
                dest: `${_prefix}apps/${alias[editor]}/main/resources/img/${mod_path}/`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `icons${ext}@2.5x.svg`,
                        },
                    },
                }
            };
        })

        return out;
    }

    grunt.initConfig({
        sprite: {
            // 'word-1x': configTemplate({
            //     editor:'documenteditor',
            //     spritename: sprite_name,
            //     scale: '1x'
            // }),
            // 'word-big-1x': configTemplate({
            //     editor:'documenteditor',
            //     spritename: sprite_name_big,
            //     scale: '1x',
            //     extpath: 'big'
            // }),
            // 'word-huge-1x': configTemplate({
            //     editor:'documenteditor',
            //     spritename: sprite_name_huge,
            //     scale: '1x',
            //     extpath: 'huge'
            // }),
            ...generate_sprite_tasks('word'),
            ...generate_sprite_tasks('word', mod2=true),

            ...generate_sprite_tasks('slide'),
            ...generate_sprite_tasks('slide', mod2=true),

            ...generate_sprite_tasks('cell'),
            ...generate_sprite_tasks('cell', true),

            ...generate_sprite_tasks('pdf'),
            ...generate_sprite_tasks('pdf', true),

            ...generate_sprite_tasks('draw'),
            ...generate_sprite_tasks('draw', true),
        },
        svg_sprite: {
            options: {
                svg: {
                    rootAttributes: {
                        //xmlns:'http://www.w3.org/2000/svg',
                    },
                    namespaceClassnames: false,
                },
                shape: {
                    id: {
                        separator: ""
                    },
                    transform: [{
                        svgo: {
                            plugins: [
                                'removeXMLNS',
                                {
                                    name: "removeAttrs",
                                    params: {
                                      attrs: "(fill|stroke)"
                                    }
                                },
                            ]
                        },
                    }]
                },
                mode: {
                    symbol: {
                    },
                },
            },
            ...generate_svg_sprite_tasks('word'),
            ...generate_svg_sprite_tasks('word', mod=true),

            ...generate_svg_sprite_tasks('slide'),
            ...generate_svg_sprite_tasks('slide', true),

            ...generate_svg_sprite_tasks('cell'),
            ...generate_svg_sprite_tasks('cell', true),

            ...generate_svg_sprite_tasks('pdf'),
            ...generate_svg_sprite_tasks('pdf', mod=true),

            ...generate_svg_sprite_tasks('draw'),
            ...generate_svg_sprite_tasks('draw', true),
        },
    });

    // Load in `grunt-spritesmith`
    grunt.loadNpmTasks('grunt-spritesmith');
    grunt.loadNpmTasks('grunt-svg-sprite');

    grunt.registerTask('word-icons', ['sprite:word-1x', 'sprite:word-mod2-1x', 'sprite:word-big-1x', 'sprite:word-mod2-big-1x', 'sprite:word-huge-1x', 'sprite:word-mod2-huge-1x',
                                        'sprite:word-2x', 'sprite:word-big-2x', 'sprite:word-huge-2x', 'sprite:word-mod2-2x', 'sprite:word-mod2-big-2x', 'sprite:word-mod2-huge-2x',
                                        'sprite:word-1.25x', 'sprite:word-big-1.25x', 'sprite:word-huge-1.25x', 'sprite:word-mod2-1.25x', 'sprite:word-mod2-big-1.25x', 'sprite:word-mod2-huge-1.25x',
                                        'sprite:word-1.5x', 'sprite:word-big-1.5x', 'sprite:word-huge-1.5x', 'sprite:word-mod2-1.5x', 'sprite:word-mod2-big-1.5x', 'sprite:word-mod2-huge-1.5x',
                                        'sprite:word-1.75x', 'sprite:word-big-1.75x', 'sprite:word-huge-1.75x', 'sprite:word-mod2-1.75x', 'sprite:word-mod2-big-1.75x', 'sprite:word-mod2-huge-1.75x']);
    grunt.registerTask('slide-icons', ['sprite:slide-1x', 'sprite:slide-big-1x','sprite:slide-2x', 'sprite:slide-big-2x',
                                        'sprite:slide-1.5x', 'sprite:slide-big-1.5x',
                                        'sprite:slide-1.25x', 'sprite:slide-big-1.25x',
                                        'sprite:slide-1.75x', 'sprite:slide-big-1.75x']);
    grunt.registerTask('cell-icons', ['sprite:cell-1x', 'sprite:cell-big-1x','sprite:cell-2x', 'sprite:cell-big-2x',
                                        'sprite:cell-1.5x', 'sprite:cell-big-1.5x',
                                        'sprite:cell-1.25x', 'sprite:cell-big-1.25x',
                                        'sprite:cell-1.75x', 'sprite:cell-big-1.75x']);
    grunt.registerTask('pdf-icons', ['sprite:pdf-1x', 'sprite:pdf-big-1x', 'sprite:pdf-huge-1x', 'sprite:pdf-2x', 'sprite:pdf-big-2x', 'sprite:pdf-huge-2x',
                                        'sprite:pdf-1.25x', 'sprite:pdf-big-1.25x', 'sprite:pdf-huge-1.25x',
                                        'sprite:pdf-1.5x', 'sprite:pdf-big-1.5x', 'sprite:pdf-huge-1.5x',
                                        'sprite:pdf-1.75x', 'sprite:pdf-big-1.75x', 'sprite:pdf-huge-1.75x']);

    grunt.registerTask('draw-icons', ['sprite:draw-1x', 'sprite:draw-big-1x', 'sprite:draw-2x', 'sprite:draw-big-2x',
                                        'sprite:draw-1.25x', 'sprite:draw-big-1.25x',
                                        'sprite:draw-1.5x', 'sprite:draw-big-1.5x',
                                        'sprite:draw-1.75x', 'sprite:draw-big-1.75x']);
    grunt.registerTask('png_sprite', ['sprite']);

    grunt.registerTask('all-icons-sprite', ['png_sprite','svg_sprite']);
    grunt.registerTask('default', ['all-icons-sprite']);
};