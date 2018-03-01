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
    '../../../../../apps/common/main/lib/component/Button.js',
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