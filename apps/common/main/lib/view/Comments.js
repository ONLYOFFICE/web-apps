/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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
 *  Comments.js
 *
 *  View
 *
 *  Created by Alexey Musinov on 16.01.14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([
    'text!common/main/lib/template/Comments.template',
    'text!common/main/lib/template/CommentsPanel.template',
    'common/main/lib/util/utils',
    'common/main/lib/component/Button',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/DataView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/Window'
], function (commentsTemplate, panelTemplate) {
    'use strict';

    function replaceWords (template, words) {
        var word,
            value,
            tpl = template;

        for (word in words) {
            if (undefined !== word) {
                value = words[word];
                tpl = tpl.replace(new RegExp(word,'g'), value);
            }
        }

        return tpl;
    }

    Common.Views.Comments = Common.UI.BaseView.extend(_.extend({
        el: '#left-panel-comments',
        template: _.template(panelTemplate),

        addCommentHeight: 45,
        newCommentHeight: 110,
        textBoxAutoSizeLocked: undefined, // disable autosize textbox
        viewmode: false,

        initialize: function (options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            this.store = this.options.store;
        },
        render: function () {
            var me = this;

            if (!this.rendered) {
                this.$el.html(this.template({
                    textAddCommentToDoc: me.textAddCommentToDoc,
                    textAddComment: me.textAddComment,
                    textCancel: me.textCancel,
                    textEnterCommentHint: me.textEnterCommentHint,
                    maxCommLength: Asc.c_oAscMaxCellOrCommentLength
                }));

                this.buttonAddCommentToDoc = new Common.UI.Button({
                    el: $('.btn.new', this.$el),
                    enableToggle: false
                });
                this.buttonAdd = new Common.UI.Button({
                    action: 'add',
                    el: $('.btn.add', this.$el),
                    enableToggle: false
                });
                this.buttonCancel = new Common.UI.Button({
                    el: $('.btn.cancel', this.$el),
                    enableToggle: false
                });

                this.buttonAddCommentToDoc.on('click', _.bind(this.onClickShowBoxDocumentComment, this));
                this.buttonAdd.on('click', _.bind(this.onClickAddDocumentComment, this));
                this.buttonCancel.on('click', _.bind(this.onClickCancelDocumentComment, this));

                this.txtComment = $('#comment-msg-new', this.el);
                this.txtComment.keydown(function (event) {
                    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.keyCode == Common.UI.Keys.RETURN) {
                        me.onClickAddDocumentComment();
                        event.stopImmediatePropagation();
                    } else if (event.keyCode === Common.UI.Keys.TAB) {
                        var $this, end, start;
                        start = this.selectionStart;
                        end = this.selectionEnd;
                        $this = $(this);
                        $this.val($this.val().substring(0, start) + '\t' + $this.val().substring(end));
                        this.selectionStart = this.selectionEnd = start + 1;

                        event.stopImmediatePropagation();
                        event.preventDefault();
                    }
                });
            }
            var CommentsPanelDataView = Common.UI.DataView.extend((function() {

                return {

                    options : {
                        handleSelect: false,
                        scrollable: true,
                        listenStoreEvents: false,
                        template: _.template('<div class="dataview-ct inner"></div>')
                    },

                    getTextBox: function () {
                        var text = $(this.el).find('textarea');
                        return (text && text.length) ? text : undefined;
                    },
                    setFocusToTextBox: function () {
                        var text = $(this.el).find('textarea');
                        if (text && text.length) {
                            var val = text.val();
                            text.focus();
                            text.val('');
                            text.val(val);
                        }
                    },
                    getActiveTextBoxVal: function () {
                        var text = $(this.el).find('textarea');
                        return (text && text.length) ? text.val().trim() : '';
                    },
                    autoHeightTextBox: function () {
                        var view = this,
                            textBox = $(this.el).find('textarea'),
                            domTextBox = null,
                            minHeight = 50,
                            lineHeight = 0,
                            scrollPos = 0,
                            oldHeight = 0,
                            newHeight = 0;

                        function updateTextBoxHeight() {
                            if (domTextBox.scrollHeight > domTextBox.clientHeight) {
                                textBox.css({height: (domTextBox.scrollHeight + lineHeight) + 'px'});
                            } else {
                                oldHeight = domTextBox.clientHeight;
                                if (oldHeight >= minHeight) {

                                    textBox.css({height: minHeight + 'px'});

                                    if (domTextBox.scrollHeight > domTextBox.clientHeight) {
                                        newHeight = Math.max(domTextBox.scrollHeight + lineHeight, minHeight);
                                        textBox.css({height: newHeight + 'px'});
                                    }
                                }
                            }

                            view.autoScrollToEditButtons();
                        }

                        if (textBox && textBox.length) {
                            domTextBox = textBox.get(0);

                            if (domTextBox) {
                                lineHeight = parseInt(textBox.css('lineHeight'), 10) * 0.25;
                                updateTextBoxHeight();
                                textBox.bind('input propertychange', updateTextBoxHeight)
                            }
                        }

                        this.textBox = textBox;
                    },
                    clearTextBoxBind: function () {
                        if (this.textBox) {
                            this.textBox.unbind('input propertychange');
                            this.textBox = undefined;
                        }
                    },
                    autoScrollToEditButtons: function () {
                        var button = $('#id-comments-change'),  // TODO: add to cache
                            btnBounds = null,
                            contentBounds = this.el.getBoundingClientRect(),
                            moveY = 0,
                            padding = 7;

                        if (button.length) {
                            btnBounds = button.get(0).getBoundingClientRect();
                            if (btnBounds && contentBounds) {
                                moveY = contentBounds.bottom - (btnBounds.bottom + padding);
                                if (moveY < 0) {
                                    this.scroller.scrollTop(this.scroller.getScrollTop() - moveY);
                                }
                            }
                        }
                    }
                }
            })());
            if (CommentsPanelDataView) {
                if (this.commentsView) {
                    this.commentsView.onResetItems();
                } else {
                    this.commentsView = new CommentsPanelDataView({
                        el: $('.messages-ct',me.el),
                        store: me.store,
                        itemTemplate: _.template(replaceWords(commentsTemplate, {
                            textAddReply: me.textAddReply,
                            textAdd: me.textAdd,
                            textCancel: me.textCancel,
                            textEdit: me.textEdit,
                            textReply: me.textReply,
                            textClose: me.textClose,
                            maxCommLength: Asc.c_oAscMaxCellOrCommentLength
                        }))
                    });

                    var addtooltip = function (dataview, view, record) {
                        if (view.tipsArray) {
                            view.tipsArray.forEach(function(item){
                                item.remove();
                            });
                        }

                        var arr = [],
                            btns = $(view.el).find('.btn-resolve');
                        btns.tooltip({title: me.textResolve, placement: 'cursor'});
                        btns.each(function(idx, item){
                            arr.push($(item).data('bs.tooltip').tip());
                        });
                        btns = $(view.el).find('.btn-resolve-check');
                        btns.tooltip({title: me.textOpenAgain, placement: 'cursor'});
                        btns.each(function(idx, item){
                            arr.push($(item).data('bs.tooltip').tip());
                        });
                        view.tipsArray = arr;
                    };
                    this.commentsView.on('item:add', addtooltip);
                    this.commentsView.on('item:remove', addtooltip);
                    this.commentsView.on('item:change', addtooltip);

                    this.commentsView.on('item:click', function (picker, item, record, e) {
                        var btn, showEditBox, showReplyBox, commentId, replyId, hideAddReply;

                        function readdresolves() {
                            me.update();
                        }

                        btn = $(e.target);
                        if (btn) {
                            showEditBox = record.get('editText');
                            showReplyBox = record.get('showReply');
                            commentId = record.get('uid');
                            replyId =  btn.attr('data-value');

                            if (btn.hasClass('btn-edit')) {
                                if (!_.isUndefined(replyId)) {
                                    me.fireEvent('comment:closeEditing', [commentId]);
                                    me.fireEvent('comment:editReply', [commentId, replyId]);

                                    me.commentsView.reply = replyId;

                                    this.autoHeightTextBox();

                                    readdresolves();

                                    me.hookTextBox();

                                    this.autoScrollToEditButtons();
                                    this.setFocusToTextBox();
                                } else {

                                    if (!showEditBox) {
                                        me.fireEvent('comment:closeEditing');
                                        record.set('editText', true);

                                        this.autoHeightTextBox();
                                        readdresolves();
                                        this.setFocusToTextBox();
                                        me.hookTextBox();
                                    }
                                }
                            } else if (btn.hasClass('btn-delete')) {
                                if (!_.isUndefined(replyId)) {
                                    me.fireEvent('comment:removeReply', [commentId, replyId]);
                                } else {
                                    me.fireEvent('comment:remove', [commentId]);
                                    Common.NotificationCenter.trigger('edit:complete', me);
                                }

                                me.fireEvent('comment:closeEditing');
                                readdresolves();
                            } else if (btn.hasClass('user-reply')) {
                                me.fireEvent('comment:closeEditing');
                                record.set('showReply', true);

                                readdresolves();

                                this.autoHeightTextBox();
                                me.hookTextBox();

                                this.autoScrollToEditButtons();
                                this.setFocusToTextBox();
                            } else if (btn.hasClass('btn-reply', false)) {
                                if (showReplyBox) {
                                    me.fireEvent('comment:addReply', [commentId, this.getActiveTextBoxVal()]);
                                    me.fireEvent('comment:closeEditing');

                                    readdresolves();
                                }
                            } else if (btn.hasClass('btn-close', false)) {

                                me.fireEvent('comment:closeEditing', [commentId]);

                            } else if (btn.hasClass('btn-inner-edit', false)) {
                                if (!_.isUndefined(me.commentsView.reply)) {
                                    me.fireEvent('comment:changeReply', [commentId, me.commentsView.reply, this.getActiveTextBoxVal()]);
                                    me.commentsView.reply = undefined;
                                } else if (showEditBox) {
                                    me.fireEvent('comment:change', [commentId, this.getActiveTextBoxVal()]);
                                }

                                me.fireEvent('comment:closeEditing');

                                readdresolves();

                            } else if (btn.hasClass('btn-inner-close', false)) {
                                me.fireEvent('comment:closeEditing');

                                me.commentsView.reply = undefined;

                                readdresolves();
                            } else if (btn.hasClass('btn-resolve', false)) {
                                var tip = btn.data('bs.tooltip');
                                if (tip) tip.dontShow = true;

                                me.fireEvent('comment:resolve', [commentId]);

                                readdresolves();
                            } else if (btn.hasClass('btn-resolve-check', false)) {
                                var tip = btn.data('bs.tooltip');
                                if (tip) tip.dontShow = true;

                                me.fireEvent('comment:resolve', [commentId]);

                                readdresolves();
                            } else if (!btn.hasClass('msg-reply') &&
                                !btn.hasClass('btn-resolve-check') &&
                                !btn.hasClass('btn-resolve')) {
                                me.fireEvent('comment:show', [commentId, false]);
                            }
                        }
                    });
                }
            }

            if (!this.rendered) this.setupLayout();
            this.update();
            this.rendered = true;

            return this;
        },
        update: function () {
            this.updateLayout();
            this.updateScrolls();
        },
        updateScrolls: function () {
            if (this.commentsView && this.commentsView.scroller) {
                this.commentsView.scroller.update({minScrollbarLength: 40, alwaysVisibleY: true});
            }
        },

        showEditContainer: function (show) {
            var addCommentLink  = $('.add-link-ct', this.el),
                newCommentBlock = $('.new-comment-ct', this.el),
                commentMsgBlock = $('.messages-ct', this.el),
                container = $('#comments-box', this.el);

            this.layout.freezePanels(!show);

            if (!show) {
                addCommentLink.css({display: 'table-row'});
                newCommentBlock.css({display: 'none'});
            } else {
                addCommentLink.css({display: 'none'});
                newCommentBlock.css({display: 'table-row'});

                this.txtComment.val('');
                this.txtComment.focus();

                this.textBoxAutoSizeLocked = undefined;
            }

            this.updateLayout();
            this.updateScrolls();
        },

        onClickShowBoxDocumentComment: function () {
            this.fireEvent('comment:closeEditing');
            this.showEditContainer(true);
        },
        onClickAddDocumentComment: function () {
            this.fireEvent('comment:add', [this, this.txtComment.val().trim(), undefined, false, true]);
            this.txtComment.val('');
        },
        onClickCancelDocumentComment: function () {
            this.showEditContainer(false);
        },

        saveText: function (clear) {
            if (this.commentsView && this.commentsView.cmpEl.find('.lock-area').length<1) {
                this.textVal = undefined;
                if (!clear) {
                    this.textVal = this.commentsView.getActiveTextBoxVal();
                } else {
                    this.commentsView.clearTextBoxBind();
                }
            }
        },
        loadText: function () {
            if (this.textVal && this.commentsView) {
                var textBox = this.commentsView.getTextBox();
                textBox && textBox.val(this.textVal);
            }
        },

        hookTextBox: function () {
            var me = this,
                textBox = this.commentsView.getTextBox();

            textBox && textBox.keydown(function (event) {
                if ((event.ctrlKey || event.metaKey) && !event.altKey && event.keyCode == Common.UI.Keys.RETURN) {
                    var buttonChangeComment = $('#id-comments-change');
                    if (buttonChangeComment && buttonChangeComment.length) {
                        buttonChangeComment.click();
                    }

                    event.stopImmediatePropagation();
                } else if (event.keyCode === Common.UI.Keys.TAB) {
                    var $this, end, start;
                    start = this.selectionStart;
                    end = this.selectionEnd;
                    $this = $(this);
                    $this.val($this.val().substring(0, start) + '\t' + $this.val().substring(end));
                    this.selectionStart = this.selectionEnd = start + 1;

                    event.stopImmediatePropagation();
                    event.preventDefault();
                }
            });
        },

        setupLayout: function () {
            var me = this, parent = $(me.el);

            var add = $('.new-comment-ct', me.el),
                to = $('.add-link-ct', me.el),
                container = $('#comments-box', me.el),
                items = container.find(' > .layout-item');

            me.layout = new Common.UI.VBoxLayout({
                box: container,
                freeze: true,
                items: [
                    {el: items[0], rely: true,
                        resize: {
                            hidden: false,
                            autohide: false,
                            fmin: (function () {

                                var height = container.height();

                                if (add.css('display') !== 'none') {
                                    if (height * 0.5 < me.newCommentHeight)
                                        return height - me.newCommentHeight;
                                }

                                return height * 0.5;
                            }),
                            fmax: (function () {

                                if (add.css('display') !== 'none')
                                    return container.height() - me.newCommentHeight;

                                return container.height() - me.addCommentHeight;
                            })
                        }},
                    {el: items[1], stretch: true},
                    {el: items[2], stretch: true}
                ]
            });
            me.layout.on('layout:resizedrag', function() {
                me.updateScrolls();
                me.textBoxAutoSizeLocked = true;
            }, this);

            $(window).on('resize', function() {
                if (parent.css('display') !== 'none') {

                   var height = $('#comments-box', me.el).height();
                   var addcmt = $('.new-comment-ct', me.el);
                   var tocmt = $('.add-link-ct', me.el);

                   if (addcmt.css('display') !== 'none') {
                        me.layout.setResizeValue(0,
                            Math.max(-me.newCommentHeight,
                                Math.min(height - (addcmt.height() + 4), height - me.newCommentHeight)));
                    }
                    else {
                        me.layout.setResizeValue(0,
                            Math.max(-me.addCommentHeight,
                                Math.min(height - (tocmt.height()), height - me.addCommentHeight)));
                    }

                    me.updateScrolls();
                }
            });

            this.autoHeightTextBox();
        },

        changeLayout: function(mode) {
            var me = this,
                add = $('.new-comment-ct', this.el),
                to = $('.add-link-ct', this.el),
                msgs = $('.messages-ct', this.el);
            msgs.toggleClass('stretch', !mode.canComments);
            if (!mode.canComments) {
                add.hide(); to.hide();
                this.layout.changeLayout([{el: msgs[0], rely: false, stretch: true}]);
            } else {
                var container = $('#comments-box', this.el),
                    items = container.find(' > .layout-item');
                to.show();
                this.layout.changeLayout([{el: items[0], rely: true,
                    resize: {
                        hidden: false,
                        autohide: false,
                        fmin: (function () {
                            var height = container.height();
                            if (add.css('display') !== 'none') {
                                if (height * 0.5 < me.newCommentHeight)
                                    return height - me.newCommentHeight;
                            }
                            return height * 0.5;
                        }),
                        fmax: (function () {
                            if (add.css('display') !== 'none')
                                return container.height() - me.newCommentHeight;
                            return container.height() - me.addCommentHeight;
                        })
                }},
                {el: items[1], stretch: true},
                {el: items[2], stretch: true}]);
            }
        },

        updateLayout: function () {
            var container = $('#comments-box', this.el), add = $('.new-comment-ct', this.el);
            if (add.css('display') !== 'none') {
                this.layout.setResizeValue(0, container.height() - this.newCommentHeight);
            } else {
                this.layout.setResizeValue(0, container.height() - this.addCommentHeight);
            }
        },

        autoHeightTextBox: function () {
            var me = this, domTextBox = null, lineHeight = 0, minHeight = 44;
            var textBox = $('#comment-msg-new', this.el);
            if (textBox.length<1) return;

            function updateTextBoxHeight() {

                var textBox, controlHeight, contentHeight, height, oldHeight,
                    textBoxMinHeightIndent = 44 + 4;    // 4px - autosize line height + big around border

                textBox = $('#comment-msg-new', me.el);
                height = $('#comments-box', me.el).height();

                if (0 == textBox.val().length) {
                    me.layout.setResizeValue(0, Math.max(-me.newCommentHeight, height - me.newCommentHeight));
                    me.textBoxAutoSizeLocked = undefined;
                    return;
                }

                if (!_.isUndefined(me.textBoxAutoSizeLocked))
                    return;

                controlHeight = textBox.height();
                contentHeight = textBox.get(0).scrollHeight;

                // calculate text content height

                textBox.css({height: minHeight + 'px'});

                controlHeight = textBox.height();
                contentHeight = Math.max(textBox.get(0).scrollHeight + lineHeight, textBoxMinHeightIndent);

                textBox.css({height: '100%'});

                height = $('#comments-box', me.el).height();

                me.layout.setResizeValue(0,
                    Math.max(-me.newCommentHeight,
                        Math.min(height - contentHeight - textBoxMinHeightIndent, height - me.newCommentHeight)));
            }

            lineHeight = parseInt(textBox.css('lineHeight'), 10) * 0.25;
            updateTextBoxHeight();
            textBox.bind('input propertychange', updateTextBoxHeight);

            this.textBox = textBox;
        },

        getFixedQuote: function (quote) {
            return Common.Utils.String.ellipsis(Common.Utils.String.htmlEncode(quote), 120, true);
        },
        getUserName: function (username) {
            return Common.Utils.String.htmlEncode(username);
        },

        pickLink: function (message) {
            var arr = [], offset, len;
            message = Common.Utils.String.htmlEncode(message);

            message.replace(Common.Utils.ipStrongRe, function(subStr) {
                offset = arguments[arguments.length-2];
                arr.push({start: offset, end: subStr.length+offset, str: '<a href="' + subStr + '" target="_blank" data-can-copy="true">' + subStr + '</a>'});
                return '';
            });

            if (message.length<1000 || message.search(/\S{255,}/)<0)
                message.replace(Common.Utils.hostnameStrongRe, function(subStr) {
                    var ref = (! /(((^https?)|(^ftp)):\/\/)/i.test(subStr) ) ? ('http://' + subStr) : subStr;
                    offset = arguments[arguments.length-2];
                    len = subStr.length;
                    var elem = _.find(arr, function(item){
                        return ( (offset>=item.start) && (offset<item.end) ||
                            (offset<=item.start) && (offset+len>item.start));
                    });
                    if (!elem)
                        arr.push({start: offset, end: len+offset, str: '<a href="' + ref + '" target="_blank" data-can-copy="true">' + subStr + '</a>'});
                    return '';
                });

            message.replace(Common.Utils.emailStrongRe, function(subStr) {
                var ref = (! /((^mailto:)\/\/)/i.test(subStr) ) ? ('mailto:' + subStr) : subStr;
                offset = arguments[arguments.length-2];
                len = subStr.length;
                var elem = _.find(arr, function(item){
                    return ( (offset>=item.start) && (offset<item.end) ||
                             (offset<=item.start) && (offset+len>item.start));
                });
                if (!elem)
                    arr.push({start: offset, end: len+offset, str: '<a href="' + ref + '">' + subStr + '</a>'});
                return '';
            });

            arr = _.sortBy(arr, function(item){ return item.start; });

            var str_res = (arr.length>0) ? ( message.substring(0, arr[0].start) + arr[0].str) : message;
            for (var i=1; i<arr.length; i++) {
                str_res += (message.substring(arr[i-1].end, arr[i].start) + arr[i].str);
            }
            if (arr.length>0) {
                str_res += message.substring(arr[i-1].end, message.length);
            }

            return str_res;
        },

        textComments            : 'Comments',
        textAnonym              : 'Guest',
        textAddCommentToDoc     : 'Add Comment to Document',
        textAddComment          : 'Add Comment',
        textCancel              : 'Cancel',
        textAddReply            : 'Add Reply',
        textReply               : 'Reply',
        textClose               : 'Close',
        textResolved            : 'Resolved',
        textResolve             : 'Resolve',
        textEnterCommentHint    : 'Enter your comment here',
        textEdit                : 'Edit',
        textAdd                 : "Add",
        textOpenAgain           : "Open Again",
        textHintAddComment      : 'Add Comment'
    }, Common.Views.Comments || {}))
});