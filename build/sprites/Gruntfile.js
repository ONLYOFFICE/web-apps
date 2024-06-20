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
        },
    });

    // Load in `grunt-spritesmith`
    grunt.loadNpmTasks('grunt-spritesmith');
    grunt.loadNpmTasks('grunt-svg-sprite');

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
    grunt.registerTask('pdf-icons', ['sprite:pdf-1x', 'sprite:pdf-big-1x', 'sprite:pdf-huge-1x', 'sprite:pdf-2x', 'sprite:pdf-big-2x', 'sprite:pdf-huge-2x',
                                        'sprite:pdf1.25x', 'sprite:pdf-big-1.25x', 'sprite:pdf-huge-1.25x',
                                        'sprite:pdf1.5x', 'sprite:pdf-big-1.5x', 'sprite:pdf-huge-1.5x',
                                        'sprite:pdf1.75x', 'sprite:pdf-big-1.75x', 'sprite:pdf-huge-1.75x']);

    grunt.registerTask('all-icons-sprite', ['word-icons','slide-icons','cell-icons','pdf-icons','svg_sprite']);
    grunt.registerTask('default', ['all-icons-sprite']);
};