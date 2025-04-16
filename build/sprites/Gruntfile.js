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
        half: num => {return num/2;},
        scaled: (num, factor) => {return num / factor;},
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

    const generate_sprite_tasks = function(editor, strscale, mod2=false) {
        const alias = {"word": "documenteditor",
                        "cell": "spreadsheeteditor",
                        "slide": "presentationeditor",
                        "pdf": "pdfeditor",
                        "draw": "visieditor"}

        const spritename = {'small': sprite_name,
                            'big': sprite_name_big,
                            'huge' : sprite_name_huge};

        let out = {};
        ['small', 'big', 'huge'].forEach((ext, i) => {
            out[`${editor}${mod2?'-mod2':''}${i?'-'+ext:''}-${strscale}`] = configTemplate({
                editor:`${alias[editor]}`,
                spritename: spritename[ext],
                scale: `${strscale}`,
                extpath: i ? ext : '',
                mod2: mod2,
            })
        });

        return out
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
            ...generate_sprite_tasks('word', '1x'),

            ...generate_sprite_tasks('word', '1x', true),

            ...generate_sprite_tasks('word', '2x'),
            ...generate_sprite_tasks('word', '2x', true),

            ...generate_sprite_tasks('word', '1.25x'),
            ...generate_sprite_tasks('word', '1.25x', true),

            ...generate_sprite_tasks('word', '1.5x'),
            ...generate_sprite_tasks('word', '1.5x', true),

            ...generate_sprite_tasks('word', '1.75x'),
            ...generate_sprite_tasks('word', '1.75x', true),

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

            'pdf-1x': configTemplate({
                editor:'pdfeditor',
                spritename: sprite_name,
                scale: '1x'
            }),
            'pdf-big-1x': configTemplate({
                editor:'pdfeditor',
                spritename: sprite_name_big,
                scale: '1x',
                extpath: 'big'
            }),
            'pdf-huge-1x': configTemplate({
                editor:'pdfeditor',
                spritename: sprite_name_huge,
                scale: '1x',
                extpath: 'huge'
            }),
            'pdf-2x': configTemplate({
                editor:'pdfeditor',
                spritename: sprite_name,
                scale: '2x'
            }),
            'pdf-big-2x': configTemplate({
                editor:'pdfeditor',
                spritename: sprite_name_big,
                scale: '2x',
                extpath: 'big'
            }),
            'pdf-huge-2x': configTemplate({
                editor:'pdfeditor',
                spritename: sprite_name_huge,
                scale: '2x',
                extpath: 'huge'
            }),

            'pdf1.25x': configTemplate({
                editor:'pdfeditor',
                spritename: sprite_name,
                scale: '1.25x'
            }),
            'pdf-big-1.25x': configTemplate({
                editor:'pdfeditor',
                spritename: sprite_name_big,
                scale: '1.25x',
                extpath: 'big'
            }),
            'pdf-huge-1.25x': configTemplate({
                editor:'pdfeditor',
                spritename: sprite_name_huge,
                scale: '1.25x',
                extpath: 'huge'
            }),

            'pdf1.5x': configTemplate({
                editor:'pdfeditor',
                spritename: sprite_name,
                scale: '1.5x'
            }),
            'pdf-big-1.5x': configTemplate({
                editor:'pdfeditor',
                spritename: sprite_name_big,
                scale: '1.5x',
                extpath: 'big'
            }),
            'pdf-huge-1.5x': configTemplate({
                editor:'pdfeditor',
                spritename: sprite_name_huge,
                scale: '1.5x',
                extpath: 'huge'
            }),

            'pdf1.75x': configTemplate({
                editor:'pdfeditor',
                spritename: sprite_name,
                scale: '1.75x'
            }),
            'pdf-big-1.75x': configTemplate({
                editor:'pdfeditor',
                spritename: sprite_name_big,
                scale: '1.75x',
                extpath: 'big'
            }),
            'pdf-huge-1.75x': configTemplate({
                editor:'pdfeditor',
                spritename: sprite_name_huge,
                scale: '1.75x',
                extpath: 'huge'
            }),

            'draw-1x': configTemplate({
                editor:'visioeditor',
                spritename: sprite_name,
                scale: '1x'
            }),
            'draw-big-1x': configTemplate({
                editor:'visioeditor',
                spritename: sprite_name_big,
                scale: '1x',
                extpath: 'big'
            }),
            'draw-2x': configTemplate({
                editor:'visioeditor',
                spritename: sprite_name,
                scale: '2x'
            }),
            'draw-big-2x': configTemplate({
                editor:'visioeditor',
                spritename: sprite_name_big,
                scale: '2x',
                extpath: 'big'
            }),
            'draw-1.5x': configTemplate({
                editor:'visioeditor',
                spritename: sprite_name,
                scale: '1.5x'
            }),
            'draw-big-1.5x': configTemplate({
                editor:'visioeditor',
                spritename: sprite_name_big,
                scale: '1.5x',
                extpath: 'big'
            }),

            'draw-1.25x': configTemplate({
                editor:'visioeditor',
                spritename: sprite_name,
                scale: '1.25x'
            }),
            'draw-big-1.25x': configTemplate({
                editor:'visioeditor',
                spritename: sprite_name_big,
                scale: '1.25x',
                extpath: 'big'
            }),

            'draw-1.75x': configTemplate({
                editor:'visioeditor',
                spritename: sprite_name,
                scale: '1.75x'
            }),
            'draw-big-1.75x': configTemplate({
                editor:'visioeditor',
                spritename: sprite_name_big,
                scale: '1.75x',
                extpath: 'big'
            }),
        },
        svg_sprite: {
            options: {
                svg: {
                    rootAttributes: {
                        //xmlns:'http://www.w3.org/2000/svg',
                    },
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
            deiconssmall: {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/2.5x/*.svg`,
                        `${_prefix}apps/documenteditor/main/resources/img/toolbar/2.5x/*.svg`],
                dest: `${_prefix}apps/documenteditor/main/resources/img/`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `iconssmall@2.5x.svg`,
                        },
                    },
                }
            },
            deiconssmall_v2: {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/v2/2.5x/*.svg`,
                        `${_prefix}apps/documenteditor/main/resources/img/toolbar/v2/2.5x/*.svg`],
                dest: `${_prefix}apps/documenteditor/main/resources/img/v2`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `iconssmall@2.5x.svg`,
                        },
                    },
                }
            },
            deiconsbig: {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/2.5x/big/*.svg`,
                        `${_prefix}apps/documenteditor/main/resources/img/toolbar/2.5x/big/*.svg`],
                dest: `${_prefix}apps/documenteditor/main/resources/img/`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `iconsbig@2.5x.svg`,
                        },
                    },
                }
            },
            deiconsbig_v2: {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/v2/2.5x/big/*.svg`,
                        `${_prefix}apps/documenteditor/main/resources/img/toolbar/v2/2.5x/big/*.svg`],
                dest: `${_prefix}apps/documenteditor/main/resources/img/v2`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `iconsbig@2.5x.svg`,
                        },
                    },
                }
            },
            deiconshuge: {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/2.5x/huge/*.svg`,
                        `${_prefix}apps/documenteditor/main/resources/img/toolbar/2.5x/huge/*.svg`],
                dest: `${_prefix}apps/documenteditor/main/resources/img/`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `iconshuge@2.5x.svg`,
                        },
                    },
                }
            },
            deiconshuge_v2: {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/v2/2.5x/huge/*.svg`,
                        `${_prefix}apps/documenteditor/main/resources/img/toolbar/v2/2.5x/huge/*.svg`],
                dest: `${_prefix}apps/documenteditor/main/resources/img/v2/`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `iconshuge@2.5x.svg`,
                        },
                    },
                }
            },
            peiconssmall: {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/2.5x/*.svg`,
                        `${_prefix}apps/presentationeditor/main/resources/img/toolbar/2.5x/*.svg`],
                dest: `${_prefix}apps/presentationeditor/main/resources/img/`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `iconssmall@2.5x.svg`,
                        },
                    },
                }
            },
            peiconsbig: {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/2.5x/big/*.svg`,
                        `${_prefix}apps/presentationeditor/main/resources/img/toolbar/2.5x/big/*.svg`],
                dest: `${_prefix}apps/presentationeditor/main/resources/img/`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `iconsbig@2.5x.svg`,
                        },
                    },
                }
            },
            peiconshuge: {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/2.5x/huge/*.svg`,
                        `${_prefix}apps/presentationeditor/main/resources/img/toolbar/2.5x/huge/*.svg`],
                dest: `${_prefix}apps/presentationeditor/main/resources/img/`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `iconshuge@2.5x.svg`,
                        },
                    },
                }
            },
            sseiconssmall: {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/2.5x/*.svg`,
                        `${_prefix}apps/spreadsheeteditor/main/resources/img/toolbar/2.5x/*.svg`],
                dest: `${_prefix}apps/spreadsheeteditor/main/resources/img/`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `iconssmall@2.5x.svg`,
                        },
                    },
                }
            },
            sseiconsbig: {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/2.5x/big/*.svg`,
                        `${_prefix}apps/spreadsheeteditor/main/resources/img/toolbar/2.5x/big/*.svg`],
                dest: `${_prefix}apps/spreadsheeteditor/main/resources/img/`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `iconsbig@2.5x.svg`,
                        },
                    },
                }
            },
            sseiconshuge: {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/2.5x/huge/*.svg`,
                        `${_prefix}apps/spreadsheeteditor/main/resources/img/toolbar/2.5x/huge/*.svg`],
                dest: `${_prefix}apps/spreadsheeteditor/main/resources/img/`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `iconshuge@2.5x.svg`,
                        },
                    },
                }
            },
            pdfeiconssmall: {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/2.5x/*.svg`,
                    `${_prefix}apps/pdfeditor/main/resources/img/toolbar/2.5x/*.svg`],
                dest: `${_prefix}apps/pdfeditor/main/resources/img/`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `iconssmall@2.5x.svg`,
                        },
                    },
                }
            },
            pdfeiconsbig: {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/2.5x/big/*.svg`,
                    `${_prefix}apps/pdfeditor/main/resources/img/toolbar/2.5x/big/*.svg`],
                dest: `${_prefix}apps/pdfeditor/main/resources/img/`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `iconsbig@2.5x.svg`,
                        },
                    },
                }
            },
            pdfeiconshuge: {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/2.5x/huge/*.svg`,
                    `${_prefix}apps/pdfeditor/main/resources/img/toolbar/2.5x/huge/*.svg`],
                dest: `${_prefix}apps/pdfeditor/main/resources/img/`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `iconshuge@2.5x.svg`,
                        },
                    },
                }
            },
            veiconssmall: {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/2.5x/*.svg`,
                    `${_prefix}apps/visioeditor/main/resources/img/toolbar/2.5x/*.svg`],
                dest: `${_prefix}apps/visioeditor/main/resources/img/`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `iconssmall@2.5x.svg`,
                        },
                    },
                }
            },
            veiconsbig: {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/2.5x/big/*.svg`,
                    `${_prefix}apps/visioeditor/main/resources/img/toolbar/2.5x/big/*.svg`],
                dest: `${_prefix}apps/visioeditor/main/resources/img/`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `iconsbig@2.5x.svg`,
                        },
                    },
                }
            },
            veiconshuge: {
                src: [`${_prefix}apps/common/main/resources/img/toolbar/2.5x/huge/*.svg`,
                    `${_prefix}apps/visioeditor/main/resources/img/toolbar/2.5x/huge/*.svg`],
                dest: `${_prefix}apps/visioeditor/main/resources/img/`,
                options: {
                    mode: {
                        symbol: {
                            inline: true,
                            dest: './',
                            sprite: `iconshuge@2.5x.svg`,
                        },
                    },
                }
            },
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
                                        'sprite:pdf1.25x', 'sprite:pdf-big-1.25x', 'sprite:pdf-huge-1.25x',
                                        'sprite:pdf1.5x', 'sprite:pdf-big-1.5x', 'sprite:pdf-huge-1.5x',
                                        'sprite:pdf1.75x', 'sprite:pdf-big-1.75x', 'sprite:pdf-huge-1.75x']);

    grunt.registerTask('draw-icons', ['sprite:draw-1x', 'sprite:draw-big-1x', 'sprite:draw-2x', 'sprite:draw-big-2x',
                                        'sprite:draw-1.25x', 'sprite:draw-big-1.25x',
                                        'sprite:draw-1.5x', 'sprite:draw-big-1.5x',
                                        'sprite:draw-1.75x', 'sprite:draw-big-1.75x']);

    grunt.registerTask('all-icons-sprite', ['word-icons','slide-icons','cell-icons','pdf-icons','draw-icons','svg_sprite']);
    grunt.registerTask('default', ['all-icons-sprite']);
};