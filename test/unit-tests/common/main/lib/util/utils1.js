/**
 *  utils.js
 *
 *  Unit test
 *
 *  Created by Alexander Yuzhin on 5/7/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    '../../../../../../apps/common/main/lib/util/utils.js'
],function() {
    describe('common.utils.String', function(){
        it('Test format', function(){
            assert.equal('successively: first, second', common.utils.String.format('successively: {0}, {1}', 'first', 'second'));
            assert.equal('revers: second, first',       common.utils.String.format('revers: {1}, {0}', 'first', 'second'));
        });

        it('Test htmlEncode', function(){
            assert.equal('Curly, Larry &amp; Moe', common.utils.String.htmlEncode('Curly, Larry & Moe'));
        });

        it('Test htmlDecode', function(){
            assert.equal('Curly, Larry & Moe', common.utils.String.htmlDecode('Curly, Larry &amp; Moe'));
        });

        it('Test ellipsis', function(){
            assert.equal('Truncate a s...', common.utils.String.ellipsis('Truncate a string and add an ellipsis', 15));
            assert.equal('Truncate a string and add...', common.utils.String.ellipsis('Truncate a string and add an ellipsis', 30, true));
        });
    });
});