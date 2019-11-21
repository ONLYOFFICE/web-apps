module.exports = function (grunt) {
    const sprite_name = 'iconssmall';
    const sprite_name_big = 'iconsbig';
    
	const fs = require('fs');
	const path = '../../apps/documenteditor/main/resources/img/' + sprite_name + '.png';
	const path2x = '../../apps/documenteditor/main/resources/img/' + sprite_name + '@2x.png';
	
	try {
		// fs.unlinkSync(path);
		// fs.unlinkSync(path2x);
		//file removed
	} catch(err) {
		console.error(err)
	}
	
    const helpers = {
        parselang: (name, options) => {
            if (/\((\S+)\)$/.test(name)) {
                let _match = /(.+)\((\S+)\)$/.exec(name);                
                return '[applang=' + _match[2] + '] ' + options.fn({name:_match[1]});
            } 
            
            return options.fn({name:name});
        },
        half: num => {num/2;}
    };
    
	// Configure grunt
	grunt.initConfig({
		sprite:{
			word_small: {
				src: ['../../apps/documenteditor/main/resources/img/toolbar/1x/*.png', '../../apps/common/main/resources/img/toolbar/1x/*.png'],
				dest: '../../apps/documenteditor/main/resources/img/' + sprite_name + '.png',
				destCss: '../../apps/documenteditor/main/resources/less/sprites/'+ sprite_name +'@1x.less',
				cssTemplate: '../../apps/documenteditor/main/resources/img/toolbar/1x/.css.handlebars',
				algorithm: 'top-down',
                cssHandlebarsHelpers: helpers
			},
			word_big: {
				src: ['../../apps/documenteditor/main/resources/img/toolbar/1x/big/*.png', '../../apps/common/main/resources/img/toolbar/1x/big/*.png'],
				dest: '../../apps/documenteditor/main/resources/img/' + sprite_name_big + '.png',
				destCss: '../../apps/documenteditor/main/resources/less/sprites/' + sprite_name_big + '@1x.less',
				cssTemplate: '../../apps/documenteditor/main/resources/img/toolbar/1x/big/.css.handlebars',
				algorithm: 'top-down',
                cssHandlebarsHelpers: helpers
			},
			scale2x: {
				src: '../../apps/documenteditor/main/resources/img/toolbar/2x/*.png',
				dest: '../../apps/documenteditor/main/resources/img/' + sprite_name + '@2x.png',
				destCss: '../../apps/documenteditor/main/resources/less/sprites/toolbar@2x.less',
				cssTemplate: '../../apps/documenteditor/main/resources/img/toolbar/2x/.css.handlebars',
				algorithm: 'top-down',
                cssHandlebarsHelpers: helpers
			},
			slide_small: {
				src: ['../../apps/presentationeditor/main/resources/img/toolbar/1x/*.png', '../../apps/common/main/resources/img/toolbar/1x/*.png'],
				dest: '../../apps/presentationeditor/main/resources/img/' + sprite_name + '.png',
				destCss: '../../apps/presentationeditor/main/resources/less/sprites/'+ sprite_name +'@1x.less',
				cssTemplate: '../../apps/presentationeditor/main/resources/img/toolbar/1x/.css.handlebars',
				algorithm: 'top-down',
                cssHandlebarsHelpers: helpers
			},
			slide_big: {
				src: ['../../apps/presentationeditor/main/resources/img/toolbar/1x/big/*.png', '../../apps/common/main/resources/img/toolbar/1x/big/*.png'],
				dest: '../../apps/presentationeditor/main/resources/img/' + sprite_name_big + '.png',
				destCss: '../../apps/presentationeditor/main/resources/less/sprites/'+ sprite_name_big +'@1x.less',
				cssTemplate: '../../apps/presentationeditor/main/resources/img/toolbar/1x/big/.css.handlebars',
				algorithm: 'top-down',
                cssHandlebarsHelpers: helpers
			},
			cell_small: {
				src: ['../../apps/spreadsheeteditor/main/resources/img/toolbar/1x/*.png', '../../apps/common/main/resources/img/toolbar/1x/*.png'],
				dest: '../../apps/spreadsheeteditor/main/resources/img/' + sprite_name + '.png',
				destCss: '../../apps/spreadsheeteditor/main/resources/less/sprites/'+ sprite_name +'@1x.less',
				cssTemplate: '../../apps/spreadsheeteditor/main/resources/img/toolbar/1x/.css.handlebars',
				algorithm: 'top-down',
                cssHandlebarsHelpers: helpers
			},
			cell_big: {
				src: ['../../apps/spreadsheeteditor/main/resources/img/toolbar/1x/big/*.png', '../../apps/common/main/resources/img/toolbar/1x/big/*.png'],
				dest: '../../apps/spreadsheeteditor/main/resources/img/' + sprite_name_big + '.png',
				destCss: '../../apps/spreadsheeteditor/main/resources/less/sprites/'+ sprite_name_big +'@1x.less',
				cssTemplate: '../../apps/spreadsheeteditor/main/resources/img/toolbar/1x/big/.css.handlebars',
				algorithm: 'top-down',
                cssHandlebarsHelpers: helpers
			}
		}
	});
	
	// Load in `grunt-spritesmith`
	grunt.loadNpmTasks('grunt-spritesmith');

	grunt.registerTask('word-icons', ['sprite:word_small', 'sprite:word_big', 'sprite:scale2x']);
	grunt.registerTask('slide-icons', ['sprite:slide_small', 'sprite:slide_big']);
	grunt.registerTask('cell-icons', ['sprite:cell_small', 'sprite:cell_big']);
    
	grunt.registerTask('default', ['word-icons','slide-icons','cell-icons']);
};