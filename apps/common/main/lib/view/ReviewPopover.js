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
 *  ReviewPopover.js
 *
 *  View
 *
 *  Created by Julia Radzhabova on 06.06.2018
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([
    'text!common/main/lib/template/CommentsPopover.template',
    'text!common/main/lib/template/ReviewChangesPopover.template',
    'common/main/lib/util/utils',
    'common/main/lib/component/Button',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/DataView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/Window'
], function (commentsTemplate, reviewTemplate) {
    'use strict';

    function replaceWords(template, words) {
        var word,
            value,
            tpl = template;

        for (word in words) {
            if (undefined !== word) {
                value = words[word];
                tpl = tpl.replace(new RegExp(word, 'g'), value);
            }
        }

        return tpl;
    }

    Common.Views.ReviewPopover = Common.UI.Window.extend(_.extend({

        // Window

        initialize: function (options) {
            var _options = {};

            _.extend(_options, {
                closable: false,
                width: 265,
                height: 120,
                header: false,
                modal: false,
                alias: 'Common.Views.ReviewPopover'
            }, options);

            this.template = options.template || [
                    '<div class="box">',
                    '<div id="id-popover" class="comments-popover" style="overflow-y: hidden;position: relative;">',
                        '<div id="id-review-popover"></div>',
                        '<div id="id-comments-popover"></div>',
                    '</div>',
                    '<div id="id-comments-arrow" class="comments-arrow"></div>',
                    '</div>'
                ].join('');

            this.commentsStore = options.commentsStore;
            this.reviewStore = options.reviewStore;
            this._state = {commentsVisible: false, reviewVisible: false};

            _options.tpl = _.template(this.template)(_options);

            this.arrow = {margin: 20, width: 12, height: 34};
            this.sdkBounds = {width: 0, height: 0, padding: 10, paddingTop: 20};

            Common.UI.Window.prototype.initialize.call(this, _options);
            return this;
        },
        render: function (comments, review) {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                window = this.$window;

            window.css({
                height: '',
                minHeight: '',
                overflow: 'hidden',
                position: 'absolute',
                zIndex: '990'
            });

            var body = window.find('.body');
            if (body) {
                body.css('position', 'relative');
            }

            var CommentsPopoverDataView = Common.UI.DataView.extend((function () {

                var parentView = me;

                return {

                    options: {
                        handleSelect: false,
                        allowScrollbar: false,
                        template: _.template('<div class="dataview-ct inner" style="overflow-y: visible;"></div>')
                    },

                    getTextBox: function () {
                        var text = $(this.el).find('textarea');
                        return (text && text.length) ? text : undefined;
                    },
                    setFocusToTextBox: function (blur) {
                        var text = $(this.el).find('textarea');
                        if (blur) {
                            text.blur();
                        } else {
                            if (text && text.length) {
                                var val = text.val();
                                text.focus();
                                text.val('');
                                text.val(val);
                            }
                        }
                    },
                    getActiveTextBoxVal: function () {
                        var text = $(this.el).find('textarea');
                        return (text && text.length) ? text.val().trim() : '';
                    },
                    autoHeightTextBox: function () {
                        var view = this,
                            textBox = this.$el.find('textarea'),
                            domTextBox = null,
                            minHeight = 50,
                            lineHeight = 0,
                            scrollPos = 0,
                            oldHeight = 0,
                            newHeight = 0;

                        function updateTextBoxHeight() {
                            scrollPos = parentView.scroller.getScrollTop();

                            if (domTextBox.scrollHeight > domTextBox.clientHeight) {
                                textBox.css({height: (domTextBox.scrollHeight + lineHeight) + 'px'});

                                parentView.calculateSizeOfContent();
                            } else {
                                oldHeight = domTextBox.clientHeight;
                                if (oldHeight >= minHeight) {
                                    textBox.css({height: minHeight + 'px'});

                                    if (domTextBox.scrollHeight > domTextBox.clientHeight) {
                                        newHeight = Math.max(domTextBox.scrollHeight + lineHeight, minHeight);
                                        textBox.css({height: newHeight + 'px'});
                                    }

                                    parentView.calculateSizeOfContent();
                                    parentView.setLeftTop(me.arrowPosX, me.arrowPosY, me.leftX);
                                    parentView.calculateSizeOfContent();
                                }
                            }

                            parentView.scroller.scrollTop(scrollPos);
                            parentView.autoScrollToEditButtons();
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
                    }
                }
            })());
            if (CommentsPopoverDataView) {
                if (this.commentsView) {
                    this.commentsView.render($('#id-comments-popover'));
                    this.commentsView.onResetItems();
                } else {
                    this.commentsView = new CommentsPopoverDataView({
                        el: $('#id-comments-popover'),
                        store: me.commentsStore,
                        itemTemplate: _.template(replaceWords(commentsTemplate, {
                                textAddReply: me.textAddReply,
                                textAdd: me.textAdd,
                                textCancel: me.textCancel,
                                textEdit: me.textEdit,
                                textReply: me.textReply,
                                textClose: me.textClose,
                                maxCommLength: Asc.c_oAscMaxCellOrCommentLength
                            })
                        )
                    });

                    var addtooltip = function (dataview, view, record) {
                        if (view.tipsArray) {
                            view.tipsArray.forEach(function (item) {
                                item.remove();
                            });
                        }

                        var arr = [],
                            btns = $(view.el).find('.btn-resolve');
                        btns.tooltip({title: me.textResolve, placement: 'cursor'});
                        btns.each(function (idx, item) {
                            arr.push($(item).data('bs.tooltip').tip());
                        });
                        btns = $(view.el).find('.btn-resolve-check');
                        btns.tooltip({title: me.textOpenAgain, placement: 'cursor'});
                        btns.each(function (idx, item) {
                            arr.push($(item).data('bs.tooltip').tip());
                        });
                        view.tipsArray = arr;
                        this.autoHeightTextBox();
                    };

                    var onCommentsViewMouseOver = function () {
                        me._isMouseOver = true;
                    };

                    var onCommentsViewMouseOut = function () {
                        me._isMouseOver = false;
                    };

                    this.commentsView.on('item:add', addtooltip);
                    this.commentsView.on('item:remove', addtooltip);
                    this.commentsView.on('item:change', addtooltip);
                    this.commentsView.cmpEl.on('mouseover', onCommentsViewMouseOver).on('mouseout', onCommentsViewMouseOut);

                    this.commentsView.on('item:click', function (picker, item, record, e) {
                        var btn, showEditBox, showReplyBox, commentId, replyId, hideAddReply;

                        function readdresolves() {
                            me.update();
                        }

                        btn = $(e.target);
                        if (btn) {
                            showEditBox = record.get('editTextInPopover');
                            showReplyBox = record.get('showReplyInPopover');
                            hideAddReply = record.get('hideAddReply');
                            commentId = record.get('uid');
                            replyId = btn.attr('data-value');

                            if (record.get('hint')) {
                                me.fireEvent('comment:disableHint', [record]);
                                return;
                            }

                            if (btn.hasClass('btn-edit')) {
                                if (!_.isUndefined(replyId)) {
                                    me.fireEvent('comment:closeEditing', [commentId]);
                                    me.fireEvent('comment:editReply', [commentId, replyId, true]);

                                    this.replyId = replyId;

                                    this.autoHeightTextBox();

                                    me.calculateSizeOfContent();
                                    me.setLeftTop(me.arrowPosX, me.arrowPosY, me.leftX);
                                    me.calculateSizeOfContent();

                                    readdresolves();

                                    me.hookTextBox();

                                    me.autoScrollToEditButtons();
                                    this.setFocusToTextBox();
                                } else {
                                    if (!showEditBox) {
                                        me.fireEvent('comment:closeEditing');
                                        record.set('editTextInPopover', true);

                                        me.fireEvent('comment:show', [commentId]);

                                        this.autoHeightTextBox();

                                        me.calculateSizeOfContent();
                                        me.setLeftTop(me.arrowPosX, me.arrowPosY, me.leftX);
                                        me.calculateSizeOfContent();

                                        readdresolves();

                                        me.hookTextBox();

                                        me.autoScrollToEditButtons();
                                        this.setFocusToTextBox();
                                    }
                                }
                            } else if (btn.hasClass('btn-delete')) {
                                if (!_.isUndefined(replyId)) {
                                    me.fireEvent('comment:removeReply', [commentId, replyId]);

                                    me.calculateSizeOfContent();
                                    me.setLeftTop(me.arrowPosX, me.arrowPosY, me.leftX);
                                    me.calculateSizeOfContent();

                                } else {
                                    me.fireEvent('comment:remove', [commentId]);
                                }

                                me.fireEvent('comment:closeEditing');

                                readdresolves();

                            } else if (btn.hasClass('user-reply')) {
                                me.fireEvent('comment:closeEditing');
                                record.set('showReplyInPopover', true);

                                me.calculateSizeOfContent();
                                me.setLeftTop(me.arrowPosX, me.arrowPosY, me.leftX);
                                me.calculateSizeOfContent();

                                readdresolves();

                                this.autoHeightTextBox();
                                me.hookTextBox();

                                me.autoScrollToEditButtons();
                                this.setFocusToTextBox();
                            } else if (btn.hasClass('btn-reply', false)) {
                                if (showReplyBox) {
                                    this.clearTextBoxBind();

                                    me.fireEvent('comment:addReply', [commentId, this.getActiveTextBoxVal()]);
                                    me.fireEvent('comment:closeEditing');
                                    me.calculateSizeOfContent();

                                    readdresolves();
                                }
                            } else if (btn.hasClass('btn-close', false)) {
                                me.fireEvent('comment:closeEditing', [commentId]);
                                me.calculateSizeOfContent();
                                me.fireEvent('comment:show', [commentId]);

                                readdresolves();

                            } else if (btn.hasClass('btn-inner-edit', false)) {

                                if (record.get('dummy')) {
                                    var commentVal = this.getActiveTextBoxVal();
                                    me.clearDummyText();
                                    if (commentVal.length > 0)
                                        me.fireEvent('comment:addDummyComment', [commentVal]);
                                    else {
                                        var text = me.$window.find('textarea:not(.user-message)');
                                        if (text && text.length)
                                            setTimeout(function () {
                                                text.focus();
                                            }, 10);
                                    }
                                    return;
                                }

                                this.clearTextBoxBind();

                                if (!_.isUndefined(this.replyId)) {
                                    me.fireEvent('comment:changeReply', [commentId, this.replyId, this.getActiveTextBoxVal()]);
                                    this.replyId = undefined;
                                    me.fireEvent('comment:closeEditing');
                                } else if (showEditBox) {
                                    me.fireEvent('comment:change', [commentId, this.getActiveTextBoxVal()]);
                                    me.fireEvent('comment:closeEditing');
                                    me.calculateSizeOfContent();
                                }

                                readdresolves();

                            } else if (btn.hasClass('btn-inner-close', false)) {
                                if (record.get('dummy')) {
                                    me.clearDummyText();
                                    me.hide();
                                    return;
                                }

                                if (hideAddReply && this.getActiveTextBoxVal().length > 0) {
                                    me.saveText();
                                    record.set('hideAddReply', false);
                                    this.getTextBox().val(me.textVal);
                                    this.autoHeightTextBox();
                                } else {

                                    this.clearTextBoxBind();

                                    me.fireEvent('comment:closeEditing', [commentId]);
                                }

                                this.replyId = undefined;

                                me.calculateSizeOfContent();
                                me.setLeftTop(me.arrowPosX, me.arrowPosY, me.leftX);
                                me.calculateSizeOfContent();

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
                            }
                        }
                    });
                    me.on({
                        'show': function () {
                            me.commentsView.autoHeightTextBox();
                            me.$window.find('textarea').keydown(function (event) {
                                if (event.keyCode == Common.UI.Keys.ESC) {
                                    me.hide(true); // clear text in dummy comment
                                }
                            });
                        },
                        'animate:before': function () {
                            var text = me.$window.find('textarea');
                            if (text && text.length)
                                text.focus();
                        }
                    });
                }
            }

            var ReviewPopoverDataView = Common.UI.DataView.extend((function() {

                return {
                    options : {
                        handleSelect: false,
                        scrollable: true,
                        template: _.template('<div class="dataview-ct inner" style="overflow-y: visible;">'+
                            '</div>'
                        )
                    }
                }
            })());
            if (ReviewPopoverDataView) {
                if (this.reviewChangesView) {
                    this.reviewChangesView.render($('#id-review-popover'));
                    this.reviewChangesView.onResetItems();
                } else {
                    this.reviewChangesView = new ReviewPopoverDataView({
                        el: $('#id-review-popover'),
                        store: me.reviewStore,
                        itemTemplate: _.template(reviewTemplate)
                    });

                    var addtooltip = function (dataview, view, record) {
                        if (view.tipsArray) {
                            view.tipsArray.forEach(function (item) {
                                item.remove();
                            });
                        }

                        var arr = [],
                            btns = $(view.el).find('.btn-goto');
                        btns.tooltip({title: me.textFollowMove, placement: 'cursor'});
                        btns.each(function (idx, item) {
                            arr.push($(item).data('bs.tooltip').tip());
                        });
                        view.tipsArray = arr;
                    };

                    this.reviewChangesView.on('item:add', addtooltip);
                    this.reviewChangesView.on('item:remove', addtooltip);
                    this.reviewChangesView.on('item:change', addtooltip);

                    this.reviewChangesView.on('item:click', function (picker, item, record, e) {
                        var btn = $(e.target);
                        if (btn) {
                            if (btn.hasClass('btn-accept')) {
                                me.fireEvent('reviewchange:accept', [record.get('changedata')]);
                            } else if (btn.hasClass('btn-reject')) {
                                me.fireEvent('reviewchange:reject', [record.get('changedata')]);
                            } else if (btn.hasClass('btn-delete')) {
                                me.fireEvent('reviewchange:delete', [record.get('changedata')]);
                            } else if (btn.hasClass('btn-goto')) {
                                var tip = btn.data('bs.tooltip');
                                if (tip) tip.dontShow = true;

                                me.fireEvent('reviewchange:goto', [record.get('changedata')]);
                            }
                        }
                    });
                }
            }

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: window.find('#id-popover'),
                    minScrollbarLength  : 40,
                    wheelSpeed: 10,
                    alwaysVisibleY: true
                });
            }
        },

        showComments: function (animate, loadText, focus, showText) {
            this.options.animate = animate;

            var me = this, textBox = this.commentsView.getTextBox();

            if (loadText && this.textVal) {
                textBox && textBox.val(this.textVal);
            }

            if (showText && showText.length) {
                textBox && textBox.val(showText);
            }

            this.show(animate);
            this.hookTextBox();

            this._state.commentsVisible = true;
        },

        showReview: function (animate, lock, lockuser) {
            this.show(animate);
            // this.reviewChangesView.cmpEl.find('.lock-area').toggleClass('hidden', !lock);
            // this.reviewChangesView.cmpEl.find('.lock-author').toggleClass('hidden', !lock || _.isEmpty(lockuser)).text(lockuser);
            this._state.reviewVisible = true;
        },

        show: function (animate, loadText, focus, showText) {
            this.options.animate = animate;

            Common.UI.Window.prototype.show.call(this);
            if (this.scroller) {
                this.scroller.update({minScrollbarLength: 40, alwaysVisibleY: true});
            }
        },

        hideComments: function () {
            if (this.handlerHide) {
                this.handlerHide();
            }
            this.hideTips();
            this._state.commentsVisible = false;
            if (!this._state.reviewVisible)
                this.hide();
            else
                this.calculateSizeOfContent();
        },

        hideReview: function () {
            if (this.handlerHide) {
                this.handlerHide();
            }
            this.hideTips();

            this._state.reviewVisible = false;
            if (!this._state.commentsVisible)
                this.hide();
            else
                this.calculateSizeOfContent();
        },

        hide: function () {
            if (this.handlerHide) {
                this.handlerHide.apply(this, arguments);
            }

            this.hideTips();

            Common.UI.Window.prototype.hide.call(this);

            if (!_.isUndefined(this.e) && this.e.keyCode == Common.UI.Keys.ESC) {
                this.e.preventDefault();
                this.e.stopImmediatePropagation();
                this.e = undefined;
            }
        },

        // CommentsPopover

        update: function (needRender) {
            if (this.commentsView && needRender)
                this.commentsView.onResetItems();
            if (this.scroller) {
                this.scroller.update({minScrollbarLength: 40, alwaysVisibleY: true});
            }
        },

        isVisible: function () {
            return (this.$window && this.$window.is(':visible'));
        },
        setLeftTop: function (posX, posY, leftX, loadInnerValues, retainContent) {
            if (!this.$window)
                this.render();

            if (loadInnerValues) {
                posX = this.arrowPosX;
                posY = this.arrowPosY;
                leftX = this.leftX;
            }

            if (_.isUndefined(posX) && _.isUndefined(posY))
                return;

            this.arrowPosX = posX;
            this.arrowPosY = posY;
            this.leftX = leftX;

            var commentsView = $('#id-popover'),
                arrowView = $('#id-comments-arrow'),
                editorView = $('#editor_sdk'),
                editorBounds = null,
                sdkBoundsHeight = 0,
                sdkBoundsTop = 0,
                sdkBoundsLeft = 0,
                sdkPanelRight = '',
                sdkPanelRightWidth = 0,
                sdkPanelLeft = '',
                sdkPanelLeftWidth = 0,
                sdkPanelThumbs = '', // for PE
                sdkPanelThumbsWidth = 0, // for PE
                sdkPanelTop = '',
                sdkPanelHeight = 0,
                leftPos = 0,
                windowWidth = 0,
                outerHeight = 0,
                topPos = 0,
                sdkBoundsTopPos = 0;

            if (commentsView && arrowView && editorView && editorView.get(0)) {
                editorBounds = editorView.get(0).getBoundingClientRect();
                if (editorBounds) {
                    sdkBoundsHeight = editorBounds.height - this.sdkBounds.padding * 2;

                    this.$window.css({maxHeight: sdkBoundsHeight + 'px'});

                    this.sdkBounds.width = editorBounds.width;
                    this.sdkBounds.height = editorBounds.height;

                    // LEFT CORNER

                    if (!_.isUndefined(posX)) {

                        sdkPanelRight = $('#id_vertical_scroll');
                        if (sdkPanelRight.length) {
                            sdkPanelRightWidth = (sdkPanelRight.css('display') !== 'none') ? sdkPanelRight.width() : 0;
                        } else {
                            sdkPanelRight = $('#ws-v-scrollbar');
                            if (sdkPanelRight.length) {
                                sdkPanelRightWidth = (sdkPanelRight.css('display') !== 'none') ? sdkPanelRight.width() : 0;
                            }
                        }

                        this.sdkBounds.width -= sdkPanelRightWidth;

                        sdkPanelLeft = $('#id_panel_left');
                        if (sdkPanelLeft.length) {
                            sdkPanelLeftWidth = (sdkPanelLeft.css('display') !== 'none') ? sdkPanelLeft.width() : 0;
                        }
                        sdkPanelThumbs = $('#id_panel_thumbnails');
                        if (sdkPanelThumbs.length) {
                            sdkPanelThumbsWidth = (sdkPanelThumbs.css('display') !== 'none') ? sdkPanelThumbs.width() : 0;
                            this.sdkBounds.width -= sdkPanelThumbsWidth;
                        }

                        leftPos = Math.min(sdkBoundsLeft + posX + this.arrow.width, sdkBoundsLeft + this.sdkBounds.width - this.$window.outerWidth() - 25);
                        leftPos = Math.max(sdkBoundsLeft + sdkPanelLeftWidth + this.arrow.width, leftPos);

                        arrowView.removeClass('right').addClass('left');

                        if (!_.isUndefined(leftX)) {
                            windowWidth = this.$window.outerWidth();
                            if (windowWidth) {
                                if ((posX + windowWidth > this.sdkBounds.width - this.arrow.width + 5) && (this.leftX > windowWidth)) {
                                    leftPos = this.leftX - windowWidth + sdkBoundsLeft - this.arrow.width;
                                    arrowView.removeClass('left').addClass('right');
                                } else {
                                    leftPos = sdkBoundsLeft + posX + this.arrow.width;
                                }
                            }
                        }

                        this.$window.css('left', leftPos + 'px');
                    }

                    // TOP CORNER

                    if (!_.isUndefined(posY)) {
                        sdkPanelTop = $('#id_panel_top');
                        sdkBoundsTopPos = sdkBoundsTop;
                        if (sdkPanelTop.length) {
                            sdkPanelHeight = (sdkPanelTop.css('display') !== 'none') ? sdkPanelTop.height() : 0;
                            sdkBoundsTopPos += this.sdkBounds.paddingTop;
                        } else {
                            sdkPanelTop = $('#ws-h-scrollbar');
                            if (sdkPanelTop.length) {
                                sdkPanelHeight = (sdkPanelTop.css('display') !== 'none') ? sdkPanelTop.height() : 0;
                            }
                        }

                        this.sdkBounds.height -= sdkPanelHeight;

                        outerHeight = this.$window.outerHeight();

                        topPos = Math.min(sdkBoundsTop + sdkBoundsHeight - outerHeight, this.arrowPosY + sdkBoundsTop - this.arrow.height);
                        topPos = Math.max(topPos, sdkBoundsTopPos);

                        this.$window.css('top', topPos + 'px');
                    }
                }
            }
            if (!retainContent)
                this.calculateSizeOfContent();
        },
        calculateSizeOfContent: function (testVisible) {
            if (testVisible && !this.$window.is(':visible'))
                return;

            this.$window.css({overflow: 'hidden'});

            var arrowView = $('#id-comments-arrow'),
                commentsView = $('#id-popover'),
                contentBounds = null,
                editorView = null,
                editorBounds = null,
                sdkBoundsHeight = 0,
                sdkBoundsTop = 0,
                sdkBoundsLeft = 0,
                sdkPanelTop = '',
                sdkPanelHeight = 0,
                arrowPosY = 0,
                windowHeight = 0,
                outerHeight = 0,
                topPos = 0,
                sdkBoundsTopPos = 0;

            if (commentsView && arrowView && commentsView.get(0)) {
                var scrollPos = this.scroller.getScrollTop();

                commentsView.css({height: '100%'});

                contentBounds = commentsView.get(0).getBoundingClientRect();
                if (contentBounds) {
                    editorView = $('#editor_sdk');
                    if (editorView && editorView.get(0)) {
                        editorBounds = editorView.get(0).getBoundingClientRect();
                        if (editorBounds) {
                            sdkBoundsHeight = editorBounds.height - this.sdkBounds.padding * 2;
                            sdkBoundsTopPos = sdkBoundsTop;
                            windowHeight = this.$window.outerHeight();

                            // TOP CORNER

                            sdkPanelTop = $('#id_panel_top');
                            if (sdkPanelTop.length) {
                                sdkPanelHeight = (sdkPanelTop.css('display') !== 'none') ? sdkPanelTop.height() : 0;
                                sdkBoundsTopPos += this.sdkBounds.paddingTop;
                            } else {
                                sdkPanelTop = $('#ws-h-scrollbar');
                                if (sdkPanelTop.length) {
                                    sdkPanelHeight = (sdkPanelTop.css('display') !== 'none') ? sdkPanelTop.height() : 0;
                                }
                            }

                            outerHeight = Math.max(commentsView.outerHeight(), this.$window.outerHeight());

                            if (sdkBoundsHeight <= outerHeight) {
                                this.$window.css({
                                    maxHeight: sdkBoundsHeight - sdkPanelHeight + 'px',
                                    top: sdkBoundsTop + sdkPanelHeight + 'px'
                                });

                                commentsView.css({height: sdkBoundsHeight - sdkPanelHeight - 3 + 'px'});

                                // arrowPosY = Math.max(this.arrow.margin, this.arrowPosY - sdkPanelHeight - this.arrow.width);
                                arrowPosY = Math.min(arrowPosY, sdkBoundsHeight - (sdkPanelHeight + this.arrow.margin + this.arrow.width));

                                arrowView.css({top: arrowPosY + 'px'});
                                this.scroller.scrollTop(scrollPos);
                            } else {

                                outerHeight = windowHeight;

                                if (outerHeight > 0) {
                                    if (contentBounds.top + outerHeight > sdkBoundsHeight + sdkBoundsTop || contentBounds.height === 0) {
                                        topPos = Math.min(sdkBoundsTop + sdkBoundsHeight - outerHeight, this.arrowPosY + sdkBoundsTop - this.arrow.height);
                                        topPos = Math.max(topPos, sdkBoundsTopPos);

                                        this.$window.css({top: topPos + 'px'});
                                    }
                                }

                                arrowPosY = Math.max(this.arrow.margin, this.arrowPosY - (sdkBoundsHeight - outerHeight) - this.arrow.width);
                                arrowPosY = Math.min(arrowPosY, outerHeight - this.arrow.margin - this.arrow.width);

                                arrowView.css({top: arrowPosY + 'px'});
                            }
                        }
                    }
                }
            }

            this.$window.css({overflow: ''});
            if (this.scroller) {
                this.scroller.update({minScrollbarLength: 40, alwaysVisibleY: true});
            }
        },
        saveText: function (clear) {
            if (this.commentsView && this.commentsView.cmpEl.find('.lock-area').length < 1) {
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
        getEditText: function () {
            if (this.commentsView) {
                return this.commentsView.getActiveTextBoxVal();
            }

            return undefined;
        },
        saveDummyText: function () {
            if (this.commentsView && this.commentsView.cmpEl.find('.lock-area').length < 1) {
                this.textDummyVal = this.commentsView.getActiveTextBoxVal();
            }
        },
        clearDummyText: function () {
            if (this.commentsView && this.commentsView.cmpEl.find('.lock-area').length < 1) {
                this.textDummyVal = undefined;
                var textBox = this.commentsView.getTextBox();
                textBox && textBox.val('');
                this.commentsView.clearTextBoxBind();
            }
        },
        getDummyText: function() {
            return this.textDummyVal || '';
        },

        hookTextBox: function () {
            var me = this, textBox = this.commentsView.getTextBox();

            textBox && textBox.keydown(function (event) {
                if ((event.ctrlKey || event.metaKey) && !event.altKey && event.keyCode === Common.UI.Keys.RETURN) {
                    var buttonChangeComment = $('#id-comments-change-popover');
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

                me.e = event;
            });
        },

        hideTips: function () {
            if (this.commentsView)
                _.each(this.commentsView.dataViewItems, function (item) {
                    if (item.tipsArray) {
                        item.tipsArray.forEach(function (item) {
                            item.hide();
                        });
                    }
                }, this);
            if (this.reviewChangesView)
                _.each(this.reviewChangesView.dataViewItems, function (item) {
                    if (item.tipsArray) {
                        item.tipsArray.forEach(function (item) {
                            item.hide();
                        });
                    }
                }, this);
        },

        isCommentsViewMouseOver: function () {
            return this._isMouseOver;
        },

        setReviewStore: function(store) {
            this.reviewStore = store;
            if (this.reviewChangesView)
                this.reviewChangesView.setStore(this.reviewStore);
        },

        setCommentsStore: function(store) {
            this.commentsStore = store;
            if (this.commentsView)
                this.commentsView.setStore(this.commentsStore);
        },

        getPopover: function(options) {
            if (!this.popover)
                this.popover = new Common.Views.ReviewPopover(options);
            return this.popover;
        },

        autoScrollToEditButtons: function () {
            var button = $('#id-comments-change-popover'),  // TODO: add to cache
                btnBounds = null,
                contentBounds = this.$window[0].getBoundingClientRect(),
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
        },

        textAddReply            : 'Add Reply',
        textAdd                 : "Add",
        textCancel              : 'Cancel',
        textEdit                : 'Edit',
        textReply               : 'Reply',
        textClose               : 'Close',
        textResolve             : 'Resolve',
        textOpenAgain           : "Open Again",
        textFollowMove          : 'Follow Move'
    }, Common.Views.ReviewPopover || {}))
});