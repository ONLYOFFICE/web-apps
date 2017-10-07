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

    Common.Views.ReviewChanges = Common.UI.BaseView.extend(_.extend((function(){
        var template =
            '<section id="review-changes-panel" class="panel" data-tab="review">' +
                '<div class="group">' +
                    '<span id="slot-set-lang" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="group no-group-mask" style="padding-left: 0;">' +
                    '<span id="slot-btn-spelling" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="separator long"/>' +
                '<div class="group">' +
                    '<span id="slot-btn-sharing" class="btn-slot text x-huge"></span>' +
                    '<span id="slot-btn-coauthmode" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="separator long comments"/>' +
                '<div class="group">' +
                    '<span class="btn-slot text x-huge slot-comment"></span>' +
                '</div>' +
                '<div class="separator long review"/>' +
                '<div class="group">' +
                    '<span id="btn-review-on" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="group no-group-mask" style="padding-left: 0;">' +
                    '<span id="btn-review-view" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="separator long review"/>' +
                '<div class="group move-changes">' +
                    '<span id="btn-change-prev" class="btn-slot text x-huge"></span>' +
                    '<span id="btn-change-next" class="btn-slot text x-huge"></span>' +
                    '<span id="btn-change-accept" class="btn-slot text x-huge"></span>' +
                    '<span id="btn-change-reject" class="btn-slot text x-huge"></span>' +
                '</div>' +
            '</section>';

        function setEvents() {
            var me = this;

            if ( me.appConfig.canReview ) {
                this.btnPrev.on('click', function (e) {
                    me.fireEvent('reviewchange:preview', [me.btnPrev, 'prev']);
                });

                this.btnNext.on('click', function (e) {
                    me.fireEvent('reviewchange:preview', [me.btnNext, 'next']);
                });

                this.btnAccept.on('click', function (e) {
                    me.fireEvent('reviewchange:accept', [me.btnAccept, 'current']);
                });

                this.btnAccept.menu.on('item:click', function (menu, item, e) {
                    me.fireEvent('reviewchange:accept', [menu, item]);
                });

                this.btnReject.on('click', function (e) {
                    me.fireEvent('reviewchange:reject', [me.btnReject, 'current']);
                });

                this.btnReject.menu.on('item:click', function (menu, item, e) {
                    me.fireEvent('reviewchange:reject', [menu, item]);
                });

                function _click_turnpreview(btn, e) {
                    if (me.appConfig.canReview) {
                        Common.NotificationCenter.trigger('reviewchanges:turn', btn.pressed ? 'on' : 'off');
                    }
                };

                this.btnsTurnReview.forEach(function (button) {
                    button.on('click', _click_turnpreview.bind(me));
                    Common.NotificationCenter.trigger('edit:complete', me);
                });

                this.btnReviewView.menu.on('item:click', function (menu, item, e) {
                    me.fireEvent('reviewchanges:view', [menu, item]);
                });
            }

            this.btnsSpelling.forEach(function(button) {
                button.on('click', function (b, e) {
                    Common.NotificationCenter.trigger('spelling:turn', b.pressed ? 'on' : 'off');
                    Common.NotificationCenter.trigger('edit:complete', me);
                });
            });

            this.btnDocLang.on('click', function (btn, e) {
                me.fireEvent('lang:document', this);
            });

            this.btnSharing && this.btnSharing.on('click', function (btn, e) {
                Common.NotificationCenter.trigger('collaboration:sharing');
            });

            this.btnCoAuthMode && this.btnCoAuthMode.menu.on('item:click', function (menu, item, e) {
                me.fireEvent('collaboration:coauthmode', [menu, item]);
            });
        }

        return {
            // el: '#review-changes-panel',

            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                // this.store = this.options.store;
                // this.popoverChanges = this.options.popoverChanges;
                this.appConfig = options.mode;

                if ( this.appConfig.canReview ) {
                    this.btnPrev = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'review-prev',
                        caption: this.txtPrev
                    });

                    this.btnNext = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'review-next',
                        caption: this.txtNext
                    });

                    this.btnAccept = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        caption: this.txtAccept,
                        split: true,
                        iconCls: 'review-save'
                    });

                    this.btnReject = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        caption: this.txtReject,
                        split: true,
                        iconCls: 'review-deny'
                    });

                    this.btnTurnOn = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'btn-ic-review',
                        caption: this.txtTurnon,
                        enableToggle: true
                    });
                    this.btnsTurnReview = [this.btnTurnOn];

                    this.btnReviewView = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'btn-ic-reviewview',
                        caption: this.txtView,
                        menu: true
                    });
                }

                if (!!this.appConfig.sharingSettingsUrl && this.appConfig.sharingSettingsUrl.length && this._readonlyRights!==true) {
                    this.btnSharing = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'btn-ic-sharing',
                        caption: this.txtSharing
                    });
                }

                if (!this.appConfig.isOffline && this.appConfig.canCoAuthoring) {
                    this.btnCoAuthMode = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'btn-ic-reviewview',
                        caption: this.txtCoAuthMode,
                        menu: true
                    });
                }

                this.btnSetSpelling = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'btn-ic-docspell',
                    caption: this.txtSpelling,
                    enableToggle: true
                });
                this.btnsSpelling = [this.btnSetSpelling];

                this.btnDocLang = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'btn-ic-doclang',
                    caption: this.txtDocLang,
                    disabled: true
                });

                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                this.boxSdk = $('#editor_sdk');
                if ( el ) el.html( this.getPanel() );

                return this;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    if ( config.canReview ) {
                        me.btnPrev.updateHint(me.hintPrev);
                        me.btnNext.updateHint(me.hintNext);
                        me.btnTurnOn.updateHint(me.tipReview);

                        me.btnAccept.setMenu(
                            new Common.UI.Menu({
                                items: [
                                    {
                                        caption: me.txtAcceptCurrent,
                                        value: 'current'
                                    },
                                    {
                                        caption: me.txtAcceptAll,
                                        value: 'all'
                                    }
                                ]
                            })
                        );
                        me.btnAccept.updateHint([me.tipAcceptCurrent, me.txtAcceptChanges]);

                        me.btnReject.setMenu(
                            new Common.UI.Menu({
                                items: [
                                    {
                                        caption: me.txtRejectCurrent,
                                        value: 'current'
                                    },
                                    {
                                        caption: me.txtRejectAll,
                                        value: 'all'
                                    }
                                ]
                            })
                        );
                        me.btnReject.updateHint([me.tipRejectCurrent, me.txtRejectChanges]);

                        me.btnReviewView.setMenu(
                            new Common.UI.Menu({
                                cls: 'ppm-toolbar',
                                items: [
                                    {
                                        caption: me.txtMarkup,
                                        checkable: true,
                                        toggleGroup: 'menuReviewView',
                                        checked: true,
                                        value: 'markup'
                                    },
                                    {
                                        caption: me.txtFinal,
                                        checkable: true,
                                        toggleGroup: 'menuReviewView',
                                        checked: false,
                                        value: 'final'
                                    },
                                    {
                                        caption: me.txtOriginal,
                                        checkable: true,
                                        toggleGroup: 'menuReviewView',
                                        checked: false,
                                        value: 'original'
                                    }
                                ]
                            }));
                        me.btnReviewView.updateHint(me.tipReviewView);

                        me.btnAccept.setDisabled(config.isReviewOnly);
                        me.btnReject.setDisabled(config.isReviewOnly);
                    } else {
                        me.$el.find('.separator.review')
                            .hide()
                            .next('.group').hide();
                    }

                    if ( !config.canComments || !config.canCoAuthoring) {
                        $('.separator.comments', me.$el)
                            .hide()
                            .next('.group').hide();
                    }

                    me.btnDocLang.updateHint(me.tipSetDocLang);
                    me.btnSetSpelling.updateHint(me.tipSetSpelling);

                    me.btnSharing && me.btnSharing.updateHint(me.tipSharing);
                    if (me.btnCoAuthMode) {
                        me.btnCoAuthMode.setMenu(
                            new Common.UI.Menu({
                                cls: 'ppm-toolbar',
                                items: [
                                    {
                                        caption: me.strFast,
                                        checkable: true,
                                        toggleGroup: 'menuCoauthMode',
                                        checked: true,
                                        value: 1
                                    },
                                    {
                                        caption: me.strStrict,
                                        checkable: true,
                                        toggleGroup: 'menuCoauthMode',
                                        checked: false,
                                        value: 0
                                    }
                                ]
                            }));
                        me.btnCoAuthMode.updateHint(me.tipCoAuthMode);
                    }

                    setEvents.call(me);
                });
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));

                if ( this.appConfig.canReview ) {
                    this.btnPrev.render(this.$el.find('#btn-change-prev'));
                    this.btnNext.render(this.$el.find('#btn-change-next'));
                    this.btnAccept.render(this.$el.find('#btn-change-accept'));
                    this.btnReject.render(this.$el.find('#btn-change-reject'));
                    this.btnTurnOn.render(this.$el.find('#btn-review-on'));
                    this.btnReviewView.render(this.$el.find('#btn-review-view'));
                }

                this.btnSetSpelling.render(this.$el.find('#slot-btn-spelling'));
                this.btnDocLang.render(this.$el.find('#slot-set-lang'));

                this.btnSharing && this.btnSharing.render(this.$el.find('#slot-btn-sharing'));
                this.btnCoAuthMode && this.btnCoAuthMode.render(this.$el.find('#slot-btn-coauthmode'));

                return this.$el;
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getPopover: function (sdkViewName) {
                if (this.appConfig.canReview && _.isUndefined(this.popover)) {
                    this.popover = new Common.Views.ReviewChangesPopover({
                        store: this.options.popoverChanges,
                        delegate: this,
                        renderTo: sdkViewName
                    });
                }

                return this.popover;
            },

            getButton: function(type, parent) {
                if ( type == 'turn' && parent == 'statusbar' ) {
                    var button = new Common.UI.Button({
                        cls         : 'btn-toolbar',
                        iconCls     : 'btn-ic-review',
                        hintAnchor  : 'top',
                        hint        : this.tipReview,
                        enableToggle: true
                    });

                    this.btnsTurnReview.push(button);

                    return button;
                } else
                if ( type == 'spelling' ) {
                    button = new Common.UI.Button({
                        cls: 'btn-toolbar',
                        iconCls: 'btn-ic-docspell',
                        hintAnchor  : 'top',
                        hint: this.tipSetSpelling,
                        enableToggle: true
                    });
                    this.btnsSpelling.push(button);

                    return button;
                }
            },

            getUserName: function (username) {
                return Common.Utils.String.htmlEncode(username);
            },

            turnChanges: function(state) {
                this.btnsTurnReview.forEach(function(button) {
                    if ( button && button.pressed != state ) {
                        button.toggle(state, true);
                    }
                }, this);
            },

            markChanges: function(status) {
                this.btnsTurnReview.forEach(function(button) {
                    if ( button ) {
                        var _icon_el = $('.icon', button.cmpEl);
                        _icon_el[status ? 'addClass' : 'removeClass']('btn-ic-changes');
                    }
                }, this);
            },

            turnSpelling: function (state) {
                this.btnsSpelling.forEach(function(button) {
                    if ( button && button.pressed != state ) {
                        button.toggle(state, true);
                    }
                }, this);
            },

            turnCoAuthMode: function (fast) {
                if (this.btnCoAuthMode) {
                    this.btnCoAuthMode.menu.items[0].setChecked(fast, true);
                    this.btnCoAuthMode.menu.items[1].setChecked(!fast, true);
                }
            },

            SetDisabled: function (state) {
                this.btnsSpelling && this.btnsSpelling.forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state);
                    }
                }, this);
                this.btnsTurnReview && this.btnsTurnReview.forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state);
                    }
                }, this);
            },

            onLostEditRights: function() {
                this._readonlyRights = true;
                if (!this.rendered)
                    return;

                 this.btnSharing && this.btnSharing.setDisabled(true);
            },

            txtAccept: 'Accept',
            txtAcceptCurrent: 'Accept current Changes',
            txtAcceptAll: 'Accept all Changes',
            txtReject: 'Reject',
            txtRejectCurrent: 'Reject current Changes',
            txtRejectAll: 'Reject all Changes',
            hintNext: 'To Next Change',
            hintPrev: 'To Previous Change',
            txtPrev: 'Previous',
            txtNext: 'Next',
            txtTurnon: 'Turn On',
            txtSpelling: 'Spell checking',
            txtDocLang: 'Language',
            tipSetDocLang: 'Set Document Language',
            tipSetSpelling: 'Spell checking',
            tipReview: 'Review',
            txtAcceptChanges: 'Accept Changes',
            txtRejectChanges: 'Reject Changes',
            txtView: 'Display Mode',
            txtMarkup: 'All changes (Editing)',
            txtFinal: 'All changes accepted (Preview)',
            txtOriginal: 'All changes rejected (Preview)',
            tipReviewView: 'Select the way you want the changes to be displayed',
            tipAcceptCurrent: 'Accept current changes',
            tipRejectCurrent: 'Reject current changes',
            txtSharing: 'Sharing',
            tipSharing: 'Manage document access rights',
            txtCoAuthMode: 'Co-editing Mode',
            tipCoAuthMode: 'Set co-editing mode',
            strFast: 'Fast',
            strStrict: 'Strict'
        }
    }()), Common.Views.ReviewChanges || {}));

    Common.Views.ReviewChangesDialog = Common.UI.Window.extend(_.extend({
        options: {
            width       : 283,
            height      : 90,
            title       : 'Review Changes',
            modal       : false,
            cls         : 'review-changes modal-dlg',
            alias       : 'Common.Views.ReviewChangesDialog'
        },

        initialize : function(options) {
            _.extend(this.options, options || {});

            this.template = [
                '<div class="box">',
                    '<div class="input-row">',
                        '<div id="id-review-button-prev" style=""></div>',
                        '<div id="id-review-button-next" style=""></div>',
                        '<div id="id-review-button-accept" style=""></div>',
                        '<div id="id-review-button-reject" style="margin-right: 0;"></div>',
                    '</div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.popoverChanges = this.options.popoverChanges;
            this.mode = this.options.mode;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.btnPrev = new Common.UI.Button({
                cls: 'dlg-btn iconic',
                iconCls: 'img-commonctrl prev',
                hint: this.txtPrev,
                hintAnchor: 'top'
            });
            this.btnPrev.render( this.$window.find('#id-review-button-prev'));

            this.btnNext = new Common.UI.Button({
                cls: ' dlg-btn iconic',
                iconCls: 'img-commonctrl next',
                hint: this.txtNext,
                hintAnchor: 'top'
            });
            this.btnNext.render( this.$window.find('#id-review-button-next'));

            this.btnAccept = new Common.UI.Button({
                cls         : 'btn-toolbar',
                caption     : this.txtAccept,
                split       : true,
                disabled    : this.mode.isReviewOnly,
                menu        : new Common.UI.Menu({
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
            this.btnAccept.render(this.$window.find('#id-review-button-accept'));

            this.btnReject = new Common.UI.Button({
                cls         : 'btn-toolbar',
                caption     : this.txtReject,
                split       : true,
                disabled    : this.mode.isReviewOnly,
                menu        : new Common.UI.Menu({
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
            this.btnReject.render(this.$window.find('#id-review-button-reject'));

            var me = this;
            this.btnPrev.on('click', function (e) {
                me.fireEvent('reviewchange:preview', [me.btnPrev, 'prev']);
            });

            this.btnNext.on('click', function (e) {
                me.fireEvent('reviewchange:preview', [me.btnNext, 'next']);
            });

            this.btnAccept.on('click', function (e) {
                me.fireEvent('reviewchange:accept', [me.btnAccept, 'current']);
            });

            this.btnAccept.menu.on('item:click', function (menu, item, e) {
                me.fireEvent('reviewchange:accept', [menu, item]);
            });

            this.btnReject.on('click', function (e) {
                me.fireEvent('reviewchange:reject', [me.btnReject, 'current']);
            });

            this.btnReject.menu.on('item:click', function (menu, item, e) {
                me.fireEvent('reviewchange:reject', [menu, item]);
            });

            return this;
        },

        textTitle: 'Review Changes',
        txtPrev: 'To previous change',
        txtNext: 'To next change',
        txtAccept: 'Accept',
        txtAcceptCurrent: 'Accept Current Change',
        txtAcceptAll: 'Accept All Changes',
        txtReject: 'Reject',
        txtRejectCurrent: 'Reject Current Change',
        txtRejectAll: 'Reject All Changes'
    }, Common.Views.ReviewChangesDialog || {}));
});