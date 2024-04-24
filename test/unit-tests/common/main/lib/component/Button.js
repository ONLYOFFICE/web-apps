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

/**
 *  Button.js
 *
 *  Unit test
 *
 *  Created by Alexander Yuzhin on 6/20/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'backbone',
    '../../../../../../../web-apps — копия/apps/common/main/lib/component/Button.js',
    '../../../../../apps/common/main/lib/component/Menu.js'
],function() {
    var chai    = require('chai'),
        should  = chai.should();

    describe('Common.UI.Button', function(){
        var button,
            domPlaceholder = document.createElement('div');

        it('Create simple button', function(){
            $('body').append(domPlaceholder);

            button = new Common.UI.Button({
                id: 'id-btn-simple',
                caption: 'test'
            });

            button.render($(domPlaceholder));

            should.exist(button);
            $('#id-btn-simple').should.have.length(1);
        });

        it('Button caption', function(){
            button.caption.should.equal('test');
        });

        it('Button update caption', function(){
            button.setCaption('update caption');

            // object
            button.caption.should.equal('update caption');

            // dom
            assert.equal(button.cmpEl.find('button:first').andSelf().filter('button').text(), 'update caption', 'dom caption');
        });

        it('Button toggle', function(){
            button.toggle();
            assert.equal(button.isActive(), true, 'should by active');
            button.toggle();
            assert.equal(button.isActive(), false, 'should NOT by active');

            button.toggle(false);
            assert.equal(button.isActive(), false, 'should NOT by active');
            button.toggle(true);
            assert.equal(button.isActive(), true, 'should by active');

            button.toggle(false);
        });

        it('Button disable', function(){
            assert.equal(button.isDisabled(), false, 'should NOT by disable');

            button.setDisabled(true);
            assert.equal(button.isDisabled(), true, 'should by disable');

            button.setDisabled(false);
            assert.equal(button.isDisabled(), false, 'should NOT by disable');
        });

        it('Remove simple button', function(){
            button.remove();
            $('#id-btn-simple').should.have.length(0);

            button = null;
//            domPlaceholder.remove();
        });

        it('Create split button', function(){
            $('body').append(domPlaceholder);

            button = new Common.UI.Button({
                id      : 'id-btn-split',
                caption : 'split',
                split   : true,
                menu        : new Common.UI.Menu({
                    items: [
                        {
                            caption: 'print',
                            value: 'print'
                        }
                    ]
                })
            });

            button.render($(domPlaceholder));

            should.exist(button);
            $('#id-btn-split').should.have.length(1);
            $('#id-btn-split button').should.have.length(2);
        });

        it('Remove split button', function(){
            button.remove();
            $('#id-btn-split').should.have.length(0);

            button = null;
//            domPlaceholder.remove();
        });
    });
});