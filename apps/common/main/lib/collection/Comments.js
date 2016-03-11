/**
 *  Comments.js
 *
 *  Created by Alexey Musinov on 17.01.14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Collections = Common.Collections || {};

define([
    'underscore',
    'backbone',
    'common/main/lib/model/Comment'
], function(_, Backbone){
    'use strict';

    Common.Collections.Comments = Backbone.Collection.extend({
        model: Common.Models.Comment,

        clearEditing: function () {
            this.each(function(comment) {
                comment.set('editText', false);
                comment.set('editTextInPopover', false);
                comment.set('showReply', false);
                comment.set('showReplyInPopover', false);
                comment.set('hideAddReply', false);
            });
        },

        getCommentsReplysCount: function(userid) {
            var cnt = 0;
            this.each(function(comment) {
                if (comment.get('userid')==userid) cnt++;
                var rpl = comment.get('replys');
                if (rpl && rpl.length>0) {
                    rpl.forEach(function(reply) {
                        if (reply.get('userid')==userid) cnt ++;
                    });
                }
            });
            return cnt;
        }
    });
});
