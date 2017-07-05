/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 *  ReviewChanges.js
 *
 *  View
 *
 *  Created by Julia.Radzhabova on 05.08.15
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([
    'text!common/main/lib/template/ReviewChangesPopover.template',
    'common/main/lib/util/utils',
    'common/main/lib/component/Button',
    'common/main/lib/component/DataView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/Window'
], function (popoverTemplate) {
    'use strict';

    Common.Views.ReviewChangesPopover = Common.UI.Window.extend({

        // Window

        initialize : function (options) {
            var _options = {};

            _.extend(_options, {
                closable : false,
                width    : 265,
                height   : 120,
                header   : false,
                modal    : false
            }, options);

            this.template = options.template || [
                '<div class="box">',
                    '<div id="id-review-popover" class="comments-popover dataview-ct"></div>',
                    '<div id="id-review-arrow" class="comments-arrow review"></div>',
                '</div>'
            ].join('');

            this.store      = options.store;
            this.delegate   = options.delegate;

            _options.tpl    = _.template(this.template)(_options);

            this.arrow      = {margin: 20, width: 12, height: 34};
            this.sdkBounds  = {width: 0, height: 0, padding: 10, paddingTop: 20};

            Common.UI.Window.prototype.initialize.call(this, _options);
        },
        render: function () {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                t = this.delegate,
                window = this.$window;

            window.css({
                height: '',
                minHeight: '',
                overflow: 'hidden',
                position: 'absolute',
                zIndex: '991'
            });

            var body = window.find('.body');
            if (body) {
                body.css('position', 'relative');
            }

            window.on('click', function() {
                window.css({zIndex: '991'});
                Common.NotificationCenter.trigger('review:click');
            });
            Common.NotificationCenter.on('comments:click', function() {
                window.css({zIndex: '990'});
            });

            var PopoverDataView = Common.UI.DataView.extend((function() {

                var parentView = me;

                return {
                    options : {
                        handleSelect: false,
                        scrollable: true,
                        template: _.template('<div class="dataview-ct inner" style="overflow-y: hidden;">'+
                                            '</div>' +
                                            '<div class="lock-area" style="cursor: default;"></div>' +
                                            '<div class="lock-author" style="cursor: default;"></div>'
                        )
                    }
                }
            })());
            if (PopoverDataView) {
                if (this.reviewChangesView) {
                    this.reviewChangesView.render($('#id-review-popover'));
                    this.reviewChangesView.onResetItems();
                } else {
                    this.reviewChangesView = new PopoverDataView({
                        el: $('#id-review-popover'),
                        store: me.store,
                        itemTemplate: _.template(popoverTemplate)
                    });

                    this.reviewChangesView.on('item:click', function (picker, item, record, e) {
                        var btn = $(e.target);
                        if (btn) {
                            if (btn.hasClass('btn-accept')) {
                                t.fireEvent('reviewchange:accept', [record.get('changedata')]);
                            } else if (btn.hasClass('btn-reject')) {
                                t.fireEvent('reviewchange:reject', [record.get('changedata')]);
                            } else if (btn.hasClass('btn-delete')) {
                                t.fireEvent('reviewchange:delete', [record.get('changedata')]);
                            }
                        }
                    });
                }
            }
        },
        show: function (animate, lock, lockuser) {
            this.options.animate = animate;

            var me = this;

//            this.calculateSizeOfContent();

            Common.UI.Window.prototype.show.call(this);
            if (this.reviewChangesView.scroller) {
                this.reviewChangesView.scroller.update({minScrollbarLength: 40, alwaysVisibleY: true});
            }

            this.reviewChangesView.cmpEl.find('.lock-area').toggleClass('hidden', !lock);
            this.reviewChangesView.cmpEl.find('.lock-author').toggleClass('hidden', !lock || _.isEmpty(lockuser)).text(lockuser);
        },
        hide: function () {
            if (this.handlerHide) {
                this.handlerHide ();
            }

            Common.UI.Window.prototype.hide.call(this);

            if (!_.isUndefined(this.e) && this.e.keyCode == Common.UI.Keys.ESC) {
                this.e.preventDefault();
                this.e.stopImmediatePropagation();
                this.e = undefined;
            }
        },

        update: function () {
            if (this.reviewChangesView && this.reviewChangesView.scroller) {
                this.reviewChangesView.scroller.update({minScrollbarLength: 40, alwaysVisibleY: true});
            }
        },

        isVisible: function () {
            return (this.$window && this.$window.is(':visible'));
        },

        setLeftTop: function (posX, posY, leftX, loadInnerValues) {
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

            var reviewChangesView = $('#id-review-popover'),
                arrowView = $('#id-review-arrow'),
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

            if (reviewChangesView && arrowView && editorView && editorView.get(0)) {
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

                        leftPos = Math.min(sdkBoundsLeft + posX + this.arrow.width, sdkBoundsLeft + this.sdkBounds.width - this.$window.outerWidth());
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
                                sdkBoundsTopPos -= this.sdkBounds.paddingTop;
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

            this.calculateSizeOfContent();
        },
        calculateSizeOfContent: function (testVisible) {
            if (testVisible && !this.$window.is(':visible'))
                return;

            this.$window.css({overflow: 'hidden'});

            var arrowView = $('#id-review-arrow'),
                reviewChangesView = $('#id-review-popover'),
                contentBounds = null,
                editorView = null,
                editorBounds = null,
                sdkBoundsHeight = 0,
                sdkBoundsTop = 0,
                sdkBoundsLeft = 0,
                sdkPanelTop  = '',
                sdkPanelHeight = 0,
                arrowPosY = 0,
                windowHeight = 0,
                outerHeight = 0,
                topPos = 0,
                sdkBoundsTopPos = 0;

            if (reviewChangesView && arrowView && reviewChangesView.get(0)) {
                reviewChangesView.css({height: '100%'});

                contentBounds = reviewChangesView.get(0).getBoundingClientRect();
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
                                    sdkBoundsTopPos -= this.sdkBounds.paddingTop;
                                }
                            }

                            outerHeight = Math.max(reviewChangesView.outerHeight(), this.$window.outerHeight());

                            if (sdkBoundsHeight <= outerHeight) {
                                this.$window.css({
                                    maxHeight: sdkBoundsHeight - sdkPanelHeight + 'px',
                                    top: sdkBoundsTop + sdkPanelHeight + 'px'});

                                reviewChangesView.css({height: sdkBoundsHeight - sdkPanelHeight - 3 + 'px'});

                               // arrowPosY = Math.max(this.arrow.margin, this.arrowPosY - sdkPanelHeight - this.arrow.width);
                                arrowPosY = Math.min(arrowPosY, sdkBoundsHeight - (sdkPanelHeight + this.arrow.margin + this.arrow.width));

                                arrowView.css({top: arrowPosY + 'px'});
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
        }
    });

    Common.Views.ReviewChanges = Common.UI.BaseView.extend(_.extend({
        el: '#review-changes-panel',

        options: {},

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);
            
            this.template = [
                    '<div class="review-group" style="">',
                        '<div id="id-review-button-prev" style=""></div>',
                        '<div id="id-review-button-next" style=""></div>',
                        '<div class="separator"/>',
                    '</div>',
                    '<div class="review-group" style="">',
                        '<div id="id-review-button-accept" style=""></div>',
                        '<div id="id-review-button-reject" style=""></div>',
                        '<div class="separator"/>',
                    '</div>',
                    '<div class="review-group">',
                        '<div id="id-review-button-close" style=""></div>',
                    '</div>'
            ].join('');

            this.store = this.options.store;
            this.popoverChanges = this.options.popoverChanges;
        },

        render: function() {
            var el = $(this.el),
                me = this;
            el.addClass('review-changes');
            el.html(_.template(this.template)({
                scope: this
            }));

            this.btnPrev = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'img-commonctrl review-prev',
                value: 1,
                hint: this.txtPrev,
                hintAnchor: 'top'
            });
            this.btnPrev.render( $('#id-review-button-prev'));

            this.btnNext = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'img-commonctrl review-next',
                value: 2,
                hint: this.txtNext,
                hintAnchor: 'top'
            });
            this.btnNext.render( $('#id-review-button-next'));

            this.btnAccept = new Common.UI.Button({
                cls         : 'btn-toolbar',
                caption     : this.txtAccept,
                split       : true,
                menu        : new Common.UI.Menu({
                    menuAlign: 'bl-tl',
                    style: 'margin-top:-5px;',
                    items: [
                        this.mnuAcceptCurrent = new Common.UI.MenuItem({
                            caption: this.txtAcceptCurrent,
                            value: 'current'
                        }),
                        this.mnuAcceptAll = new Common.UI.MenuItem({
                            caption: this.txtAcceptAll,
                            value: 'all'
                        })
                    ]
                })
            });
            this.btnAccept.render($('#id-review-button-accept'));

            this.btnReject = new Common.UI.Button({
                cls         : 'btn-toolbar',
                caption     : this.txtReject,
                split       : true,
                menu        : new Common.UI.Menu({
                    menuAlign: 'bl-tl',
                    style: 'margin-top:-5px;',
                    items: [
                        this.mnuRejectCurrent = new Common.UI.MenuItem({
                            caption: this.txtRejectCurrent,
                            value: 'current'
                        }),
                        this.mnuRejectAll = new Common.UI.MenuItem({
                            caption: this.txtRejectAll,
                            value: 'all'
                        })
                    ]
                })
            });
            this.btnReject.render($('#id-review-button-reject'));

            this.btnClose = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'img-commonctrl review-close',
                hint: this.txtClose,
                hintAnchor: 'top'
            });
            this.btnClose.render( $('#id-review-button-close'));
            this.btnClose.on('click', _.bind(this.onClose, this));

            this.boxSdk = $('#editor_sdk');

            Common.NotificationCenter.on('layout:changed', _.bind(this.onLayoutChanged, this));
        },

        onClose: function(event) {
            this.hide();
            this.fireEvent('hide', this);
        },

        show: function () {
            Common.UI.BaseView.prototype.show.call(this);
            this.fireEvent('show', this);
        },

        onLayoutChanged: function(area) {
            if (area=='rightmenu' && this.boxSdk) {
                this.$el.css('right', ($('body').width() - this.boxSdk.offset().left - this.boxSdk.width() + 15) + 'px');
            }
        },

        getPopover: function (sdkViewName) {
            if (_.isUndefined(this.popover)) {
                this.popover = new Common.Views.ReviewChangesPopover({
                    store    : this.popoverChanges,
                    delegate : this,
                    renderTo : sdkViewName
                });
            }

            return this.popover;
        },

        getUserName: function (username) {
            return Common.Utils.String.htmlEncode(username);
        },

        txtPrev: 'To previous change',
        txtNext: 'To next change',
        txtAccept: 'Accept',
        txtAcceptCurrent: 'Accept current Changes',
        txtAcceptAll: 'Accept all Changes',
        txtReject: 'Reject',
        txtRejectCurrent: 'Reject current Changes',
        txtRejectAll: 'Reject all Changes',
        txtClose: 'Close'
    }, Common.Views.ReviewChanges || {}))
});