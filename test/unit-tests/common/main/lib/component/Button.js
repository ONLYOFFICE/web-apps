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