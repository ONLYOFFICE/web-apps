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
 *  Comments.js
 *
 *  View
 *
 *  Created on 16.01.14
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

    var CommentsPanelDataView = Common.UI.DataView.extend((function() {
        return {
            options : {
                handleSelect: false,
                scrollable: true,
                listenStoreEvents: false,
                template: _.template('<div class="dataview-ct inner" role="list"></div>')
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
            disableTextBoxButton: function(textboxEl) {
                var button = $(textboxEl.siblings('#id-comments-change')[0]);

                if(textboxEl.val().trim().length > 0) {
                    button.removeAttr('disabled');
                    button.removeClass('disabled');
                } else {
                    button.attr('disabled', true);
                    button.addClass('disabled');
                }
            },
            autoHeightTextBox: function () {
                var view = this,
                    textBox = $(this.el).find('textarea'),
                    domTextBox = null,
                    minHeight = 55,
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

                function onTextareaInput(event) {
                    updateTextBoxHeight();
                    view.disableTextBoxButton($(event.target));
                }

                if (textBox && textBox.length) {
                    domTextBox = textBox.get(0);

                    view.disableTextBoxButton(textBox);
                    if (domTextBox) {
                        lineHeight = parseInt(textBox.css('lineHeight'), 10) * 0.25;
                        updateTextBoxHeight();
                        textBox.bind('input propertychange', onTextareaInput)
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

    Common.Views.Comments = Common.UI.BaseView.extend(_.extend({
        el: '#left-panel-comments',
        template: _.template(panelTemplate),

        addCommentHeight: 45,
        newCommentHeight: 110,
        textBoxAutoSizeLocked: undefined, // disable autoHeightTextBoxsize textbox
        viewmode: false,

        _commentsViewOnItemClick: function (picker, item, record, e) {
            var me = this;
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

                        picker.autoHeightTextBox();

                        readdresolves();

                        me.hookTextBox();

                        picker.autoScrollToEditButtons();
                        picker.setFocusToTextBox();
                    } else {

                        if (!showEditBox) {
                            me.fireEvent('comment:closeEditing');
                            record.set('editText', true);

                            picker.autoHeightTextBox();
                            readdresolves();
                            picker.setFocusToTextBox();
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

                    picker.autoHeightTextBox();
                    me.hookTextBox();

                    picker.autoScrollToEditButtons();
                    picker.setFocusToTextBox();
                } else if (btn.hasClass('btn-reply', false)) {
                    if (showReplyBox) {
                        me.fireEvent('comment:addReply', [commentId, picker.getActiveTextBoxVal()]);
                        me.fireEvent('comment:closeEditing');

                        readdresolves();
                    }
                } else if (btn.hasClass('btn-close', false)) {

                    me.fireEvent('comment:closeEditing', [commentId]);

                } else if (btn.hasClass('btn-inner-edit', false)) {
                    if (!_.isUndefined(me.commentsView.reply)) {
                        me.fireEvent('comment:changeReply', [commentId, me.commentsView.reply, picker.getActiveTextBoxVal()]);
                        me.commentsView.reply = undefined;
                    } else if (showEditBox) {
                        me.fireEvent('comment:change', [commentId, picker.getActiveTextBoxVal()]);
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
                } else if (!btn.hasClass('msg-reply') &&
                    !btn.hasClass('btn-resolve')) {
                    var isTextSelected = false;
                    if (btn.hasClass('user-message')) {
                        if (window.getSelection) {
                            var selection = window.getSelection();
                            isTextSelected = (selection.toString()!=='')
                        } else if (document.selection) {
                            isTextSelected = document.selection;
                        }
                    }
                    me.fireEvent('comment:show', [commentId, false, isTextSelected]);
                }
            }
        },

        initialize: function (options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            this.store = this.options.store;
            this.hasFilters = false;

            var filter = Common.localStorage.getKeysFilter();
            this.appPrefix = (filter && filter.length) ? filter.split(',')[0] : '';

            this.showCommentToDocAtBottom = false;
            !this.showCommentToDocAtBottom && (this.addCommentHeight = 0);
        },

        render: function () {
            var me = this;

            if (!this.rendered) {
                this.$el.html(this.template({
                    textAddCommentToDoc: me.textAddCommentToDoc,
                    textAddComment: me.textAddComment,
                    textCancel: me.textCancel,
                    textEnterCommentHint: me.textEnterCommentHint,
                    maxCommLength: Asc.c_oAscMaxCellOrCommentLength,
                    textComments: me.textComments
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

                this.buttonSort = new Common.UI.Button({
                    parentEl: $('#comments-btn-sort', this.$el),
                    cls: 'btn-toolbar no-caret',
                    iconCls: 'toolbar__icon btn-more',
                    hint: this.textSort,
                    menu: new Common.UI.Menu({
                        style: 'min-width: auto;',
                        items: [
                            {
                                caption: this.mniDateDesc,
                                value: 'date-desc',
                                checkable: true,
                                checked: (Common.localStorage.getItem(this.appPrefix + "comments-sort") || 'date-desc') === 'date-desc',
                                toggleGroup: 'sortcomments'
                            },
                            {
                                caption: this.mniDateAsc,
                                value: 'date-asc',
                                checkable: true,
                                checked: (Common.localStorage.getItem(this.appPrefix + "comments-sort") || 'date-desc') === 'date-asc',
                                toggleGroup: 'sortcomments'
                            },
                            {
                                caption: this.mniAuthorAsc,
                                value: 'author-asc',
                                checkable: true,
                                checked: Common.localStorage.getItem(this.appPrefix + "comments-sort") === 'author-asc',
                                toggleGroup: 'sortcomments'
                            },
                            {
                                caption: this.mniAuthorDesc,
                                value: 'author-desc',
                                checkable: true,
                                checked: Common.localStorage.getItem(this.appPrefix + "comments-sort") === 'author-desc',
                                toggleGroup: 'sortcomments'
                            },
                            {
                                caption: this.mniPositionAsc,
                                value: 'position-asc',
                                checkable: true,
                                visible: this.appPrefix==='de-',
                                checked: Common.localStorage.getItem(this.appPrefix + "comments-sort") === 'position-asc',
                                toggleGroup: 'sortcomments'
                            },
                            {
                                caption: this.mniPositionDesc,
                                value: 'position-desc',
                                checkable: true,
                                visible: this.appPrefix==='de-',
                                checked: Common.localStorage.getItem(this.appPrefix + "comments-sort") === 'position-desc',
                                toggleGroup: 'sortcomments'
                            },
                            {
                                caption: '--',
                                visible: false
                            },
                            this.menuFilterGroups = new Common.UI.MenuItem({
                                caption: this.mniFilterGroups,
                                checkable: false,
                                visible: false,
                                menu: new Common.UI.Menu({
                                    menuAlign: 'tl-tr',
                                    style: 'min-width: auto;',
                                    items: []
                                })
                            }),
                            {
                                caption: '--'
                            },
                            this.mnuAddCommentToDoc = new Common.UI.MenuItem({
                                caption: this.textAddCommentToDoc,
                                checkable: false
                            })
                        ]
                    })
                });

                this.buttonClose = new Common.UI.Button({
                    parentEl: $('#comments-btn-close', this.$el),
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-close',
                    hint: this.textClosePanel
                });

                this.buttonAddNew = new Common.UI.Button({
                    parentEl: $('#comments-btn-add', this.$el),
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-add-comment',
                    hint: this.textHintAddComment
                });

                this.buttonAddCommentToDoc.on('click', _.bind(this.onClickShowBoxDocumentComment, this));
                this.buttonAdd.on('click', _.bind(this.onClickAddDocumentComment, this));
                this.buttonCancel.on('click', _.bind(this.onClickCancelDocumentComment, this));
                this.buttonClose.on('click', _.bind(this.onClickClosePanel, this));
                this.buttonSort.menu.on('item:toggle', _.bind(this.onSortClick, this));
                this.menuFilterGroups.menu.on('item:toggle', _.bind(this.onFilterGroupsClick, this));
                this.mnuAddCommentToDoc.on('click', _.bind(this.onClickShowBoxDocumentComment, this));
                this.buttonAddNew.on('click', _.bind(this.onClickAddNewComment, this));

                this.txtComment = $('#comment-msg-new', this.el);
                this.scrollerNewCommet = new Common.UI.Scroller({el: $('.new-comment-ct') });

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
                        textComment: me.textComment,
                        maxCommLength: Asc.c_oAscMaxCellOrCommentLength
                    })),
                    emptyText: me.txtEmpty
                });

                var addtooltip = function (dataview, view, record) {
                    if (view.tipsArray) {
                        view.tipsArray.forEach(function(item){
                            item.remove();
                        });
                    }

                    var arr = [],
                        btns = $(view.el).find('.btn-resolve:not(.comment-resolved)');
                    btns.tooltip({title: me.textResolve, placement: 'cursor'});
                    btns.each(function(idx, item){
                        arr.push($(item).data('bs.tooltip').tip());
                    });
                    btns = $(view.el).find('.comment-resolved');
                    btns.tooltip({title: me.textOpenAgain, placement: 'cursor'});
                    btns.each(function(idx, item){
                        arr.push($(item).data('bs.tooltip').tip());
                    });
                    btns = $(view.el).find('.i-comment-resolved');
                    btns.tooltip({title: me.textViewResolved, placement: 'cursor'});
                    btns.each(function(idx, item){
                        arr.push($(item).data('bs.tooltip').tip());
                    });
                    view.tipsArray = arr;
                };

                this.commentsView.on({
                    'item:add': addtooltip,
                    'item:remove': addtooltip,
                    'item:change': addtooltip,
                    'item:click': this._commentsViewOnItemClick.bind(this)
                });
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
                this.commentsView.scroller.update({minScrollbarLength: this.commentsView.minScrollbarLength, alwaysVisibleY: true});
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
                commentMsgBlock.toggleClass('stretch', !this.mode.canComments || this.mode.compatibleFeatures || !this.showCommentToDocAtBottom);
            } else {
                addCommentLink.css({display: 'none'});
                newCommentBlock.css({display: 'table-row'});
                commentMsgBlock.toggleClass('stretch', false);

                this.txtComment.val('');
                var me = this;
                setTimeout(function() { me.txtComment.focus();}, 10);

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

        onClickAddNewComment: function () {
            Common.NotificationCenter.trigger('app:comment:add');
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
            var me = this, parent = me.$el;

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
                                Math.min(height - ((addcmt.height() || 0) + 4), height - me.newCommentHeight)));
                    }
                    else {
                        me.layout.setResizeValue(0,
                            Math.max(-me.addCommentHeight,
                                Math.min(height - (tocmt.height() || 0), height - me.addCommentHeight)));
                    }

                    me.updateScrolls();
                }
            });

            this.autoHeightTextBox();
        },

        changeLayout: function(mode) {
            this.mode = mode;

            var me = this,
                add = $('.new-comment-ct', this.el),
                to = $('.add-link-ct', this.el),
                msgs = $('.messages-ct', this.el);
            msgs.toggleClass('stretch', !mode.canComments || mode.compatibleFeatures || !this.showCommentToDocAtBottom);
            this.buttonAddNew.setVisible(mode.canComments);
            if (this.buttonSort && this.buttonSort.menu) {
                var menu = this.buttonSort.menu;
                menu.items[menu.items.length-1].setVisible(mode.canComments && !mode.compatibleFeatures);
                menu.items[menu.items.length-2].setVisible(mode.canComments && !mode.compatibleFeatures);
                this.buttonSort.updateHint(mode.canComments && !mode.compatibleFeatures ? (this.hasFilters ? this.textSortFilterMore : this.textSortMore) : (this.hasFilters ? this.textSortFilter : this.textSort));
            }
            if (!mode.canComments || mode.compatibleFeatures) {
                if (mode.compatibleFeatures) {
                    add.remove(); to.remove();
                } else {
                    add.hide(); to.hide();
                }
                this.layout.changeLayout([{el: msgs[0], rely: false, stretch: true}]);
            } else {
                var container = $('#comments-box', this.el);
                this.showCommentToDocAtBottom ? to.show() : to.remove();
                this.layout.changeLayout([{el: msgs[0], rely: true,
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
                }}].concat(this.showCommentToDocAtBottom ? [{el: to[0], stretch: true}] : []).concat([{el: add[0], stretch: true}]));
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
        disableTextBoxButton: function(textboxEl) {
            var button = $(textboxEl.parent().siblings('.add')[0]);

            if(textboxEl.val().trim().length > 0) {
                button.removeAttr('disabled');
                button.removeClass('disabled');
            } else {
                button.attr('disabled', true);
                button.addClass('disabled');
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

            function onTextareaInput(event) {
                updateTextBoxHeight();
                me.disableTextBoxButton($(event.target));
            }

            me.disableTextBoxButton(textBox);
            lineHeight = parseInt(textBox.css('lineHeight'), 10) * 0.25;
            updateTextBoxHeight();
            textBox.bind('input propertychange', onTextareaInput);

            this.textBox = textBox;
        },

        getFixedQuote: function (quote) {
            return Common.Utils.String.ellipsis(Common.Utils.String.htmlEncode(quote), 120, true);
        },
        getUserName: function (username) {
            return Common.Utils.String.htmlEncode(AscCommon.UserInfoParser.getParsedName(username));
        },
        getEncodedName: function (username) {
            return Common.Utils.String.htmlEncode(username);
        },

        pickLink: function (message) {
            var arr = [], offset, len;
            message.replace(Common.Utils.ipStrongRe, function(subStr) {
                var result = /[\.,\?\+;:=!\(\)]+$/.exec(subStr);
                if (result)
                    subStr = subStr.substring(0, result.index);
                offset = arguments[arguments.length-2];
                arr.push({start: offset, end: subStr.length+offset, str: '<a href="' + subStr + '" target="_blank" data-can-copy="true">' + subStr + '</a>'});
                return '';
            });

            if (message.length<1000 || message.search(/\S{255,}/)<0)
                message.replace(Common.Utils.hostnameStrongRe, function(subStr) {
                    var result = /[\.,\?\+;:=!\(\)]+$/.exec(subStr);
                    if (result)
                        subStr = subStr.substring(0, result.index);
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

            var str_res = (arr.length>0) ? ( Common.Utils.String.htmlEncode(message.substring(0, arr[0].start)) + arr[0].str) : Common.Utils.String.htmlEncode(message);
            for (var i=1; i<arr.length; i++) {
                str_res += (Common.Utils.String.htmlEncode(message.substring(arr[i-1].end, arr[i].start)) + arr[i].str);
            }
            if (arr.length>0) {
                str_res += Common.Utils.String.htmlEncode(message.substring(arr[i-1].end, message.length));
            }
            return str_res;
        },

        pickEMail: function (commentId, message, oldMessage) {
            var old_arr = [];
            if (oldMessage) {
                old_arr = Common.Utils.String.htmlEncode(oldMessage).match(/\B[@+][A-Z0-9._%+-]+@[A-Z0-9._-]+\.[A-Z]+\b/gi);
                old_arr = _.map(old_arr, function(str){
                    return str.slice(1, str.length);
                });
            }
            var arr = Common.Utils.String.htmlEncode(message).match(/\B[@+][A-Z0-9._%+-]+@[A-Z0-9._-]+\.[A-Z]+\b/gi);
            arr = _.map(arr, function(str){
                return str.slice(1, str.length);
            });
            arr = _.difference(arr, old_arr);
            (arr.length>0) && Common.Gateway.requestSendNotify({
                emails: arr,
                actionId: commentId, // comment id
                actionLink: {
                    action: {
                        type: "comment",
                        data: commentId
                    }
                },
                message: message //comment text
            });
        },

        onSortClick: function(menu, item, state) {
            state && this.fireEvent('comment:sort', [item.value]);
        },

        onFilterGroupsClick: function(menu, item, state) {
            state && this.fireEvent('comment:filtergroups', [item.value]);
        },

        onClickClosePanel: function() {
            Common.NotificationCenter.trigger('leftmenu:change', 'hide');
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
        textHintAddComment      : 'Add Comment',
        textSort: 'Sort comments',
        textComment             : 'Comment',
        mniPositionAsc: 'From top',
        mniPositionDesc: 'From bottom',
        mniAuthorAsc: 'Author A to Z',
        mniAuthorDesc: 'Author Z to A',
        mniDateDesc: 'Newest',
        mniDateAsc: 'Oldest',
        textClosePanel: 'Close comments',
        textViewResolved: 'You have not permission for reopen comment',
        mniFilterGroups: 'Filter by Group',
        textAll: 'All',
        txtEmpty: 'There are no comments in the document.',
        textSortFilter: 'Sort and filter comments',
        textSortMore: 'Sort and more',
        textSortFilterMore: 'Sort, filter and more'

    }, Common.Views.Comments || {}))
});