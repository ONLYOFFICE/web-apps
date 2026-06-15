/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		inline: {
			dist: {
				src: ['test/dist/*.html'],
				dest: ['tmp/']
			}
		},

		clean: {
			tests: ['tmp/']
		},

		htmlmin: {
			dist: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				files: {
					'tmp/css.min.html': 'tmp/css.html',
					'tmp/img.min.html': 'tmp/img.html',
					'tmp/html.min.html': 'tmp/html.html',
					'tmp/script.min.html': 'tmp/script.html',
					'tmp/css_greedy.min.html': 'tmp/css_greedy.html',
					'tmp/img_greedy.min.html': 'tmp/img_greedy.html',
					'tmp/html_greedy.min.html': 'tmp/html_greedy.html',
					'tmp/script_greedy.min.html': 'tmp/script_greedy.html'
				}
			}
		},

		// Unit tests
		nodeunit: {
			tests: ['test/*_test.js']
		}
	});

	grunt.loadTasks('tasks');

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	grunt.registerTask('test', ['clean', 'inline', 'htmlmin', 'nodeunit']);
	// By default, run all tests
	grunt.registerTask('default', ['test']);
};
