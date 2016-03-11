/**
 *  Comments.js
 *
 *  Created by Alexey Musinov on 16.01.14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Models = Common.Models || {};

define([
    'underscore',
    'backbone',
    'common/main/lib/component/BaseView'
], function(_, Backbone){
    'use strict';

    Common.Models.Comment = Backbone.Model.extend({
        defaults: {
            uid                 : 0,                        //  asc
            userid              : 0,
            username            : 'Guest',
            date                : undefined,
            quote               : '',
            comment             : '',
            resolved            : false,
            lock                : false,
            lockuserid          : '',
            unattached          : false,

            id                  : Common.UI.getId(),        //  internal
            time                : 0,
            showReply           : false,
            showReplyInPopover  : false,
            editText            : false,
            editTextInPopover   : false,
            last                : undefined,
            replys              : [],
            hideAddReply        : false,
            scope               : null,
            hide                : false,
            hint                : false,
            dummy               : undefined
        }
    });
    Common.Models.Reply = Backbone.Model.extend({
        defaults: {
            time                : 0,                    //  acs
            userid              : 0,
            username            : 'Guest',
            reply               : '',
            date                : undefined,

            id                  : Common.UI.getId(),    //  internal
            editText            : false,
            editTextInPopover   : false,
            scope               : null
        }
    });
});
