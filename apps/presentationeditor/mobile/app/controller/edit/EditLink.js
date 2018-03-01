/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 *  EditLink.js
 *  Presentation Editor
 *
 *  Created by Julia Radzhabova on 12/06/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'core',
    'presentationeditor/mobile/app/view/edit/EditLink'
], function (core) {
    'use strict';

    PE.Controllers.EditLink = Backbone.Controller.extend(_.extend((function() {
        // Private
        var _stack = [],
            _linkObject = undefined,
            c_oHyperlinkType = {
                InternalLink:0,
                WebLink: 1
            },
            c_oSlideLink = {
                Next: 0,
                Previouse: 1,
                Last: 2,
                First: 3,
                Num: 4
            },
            _linkType = c_oHyperlinkType.WebLink,
            _slideLink = 0,
            _slideNum = 0,
            _slidesCount = 0;

        return {
            models: [],
            collections: [],
            views: [
                'EditLink'
            ],

            initialize: function () {
                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));
                Common.NotificationCenter.on('editcategory:show',  _.bind(this.categoryShow, this));

                this.addListeners({
                    'EditLink': {
                        'page:show' : this.onPageShow
                    }
                });

                var me = this;
                uiApp.onPageBack('editlink-type editlink-slidenumber', function (page) {
                    me.initSettings();
                });
            },

            setApi: function (api) {
                var me = this;
                me.api = api;

                me.api.asc_registerCallback('asc_onFocusObject', _.bind(me.onApiFocusObject, me));
            },

            onLaunch: function () {
                this.createView('EditLink').render();
            },

            initEvents: function () {
                var me = this;

                $('#edit-link-edit').single('click',    _.bind(me.onEditLink, me));
                $('#edit-link-remove').single('click',  _.bind(me.onRemoveLink, me));
            },

            categoryShow: function (e) {
                var $target = $(e.currentTarget);

                if ($target && $target.prop('id') === 'edit-link' && _linkObject) {
                    var url = _linkObject.get_Value();
                    if (url===null || url===undefined || url=='' )
                        _linkType = c_oHyperlinkType.WebLink;
                    else {
                        var indAction = url.indexOf("ppaction://hlink");
                        if (0 == indAction) {
                            if (url == "ppaction://hlinkshowjump?jump=firstslide") {
                                _slideLink = 2;
                            } else if (url == "ppaction://hlinkshowjump?jump=lastslide") {
                                _slideLink = 3;
                            }
                            else if (url == "ppaction://hlinkshowjump?jump=nextslide") {
                                _slideLink = 0;
                            }
                            else if (url == "ppaction://hlinkshowjump?jump=previousslide") {
                                _slideLink = 1;
                            }
                            else {
                                _slideLink = 4;
                                _slidesCount = this.api.getCountPages();
                                var mask = "ppaction://hlinksldjumpslide",
                                    indSlide = url.indexOf(mask);
                                if (0 == indSlide) {
                                    _slideNum = parseInt(url.substring(mask.length));
                                    if (_slideNum < 0) _slideNum = 0;
                                    if (_slideNum >= _slidesCount) _slideNum = _slidesCount - 1;
                                } else
                                    _slideNum = 0;
                            }
                            _linkType = c_oHyperlinkType.InternalLink;
                        } else {
                            _linkType = c_oHyperlinkType.WebLink;
                        }
                    }

                    var text = _linkObject.get_Text();
                    if (text !== false) {
                        $('#edit-link-display input').val((text !== null) ? text : this.textDefault);
                        $('#edit-link-display').toggleClass('disabled', text === null);
                    }
                    if (_linkType==c_oHyperlinkType.WebLink) {
                        var value = _linkObject.get_Value();
                        $('#edit-link-url input').val(value ? [value.replace(new RegExp(" ", 'g'), "%20")] : '');
                    }
                    $('#edit-link-tip input').val([_linkObject.get_ToolTip()]);

                    this.initSettings();
                }
            },

            initSettings: function (pageId) {
                var me = this;

                if (pageId == '#editlink-type') {
                    $('#page-editlink-type input').val([_linkType]);
                } else if (pageId == '#editlink-slidenumber') {
                    _slidesCount = me.api.getCountPages();
                    $('#page-editlink-slidenumber input').val([_slideLink]);
                    $('#editlink-slide-number .item-after label').text(_slideNum+1);
                } else {
                    $('#edit-link-type .item-after').text((_linkType==c_oHyperlinkType.WebLink) ? me.textExternalLink : me.textInternalLink);
                    $('#edit-link-url')[(_linkType==c_oHyperlinkType.WebLink) ? 'show' : 'hide']();
                    $('#edit-link-number')[(_linkType==c_oHyperlinkType.WebLink) ? 'hide' : 'show']();

                    if (_linkType==c_oHyperlinkType.WebLink) {
                        _.delay(function () {
                            $('.page[data-page=editlink-link] input[type=url]').focus();
                        }, 1000);
                    } else {
                        var slidename = '';
                        switch (_slideLink) {
                            case 0:
                                slidename = me.textNext;
                                break;
                            case 1:
                                slidename = me.textPrev;
                                break;
                            case 2:
                                slidename = me.textFirst;
                                break;
                            case 3:
                                slidename = me.textLast;
                                break;
                            case 4:
                                slidename = me.textSlide + ' ' + (_slideNum+1);
                                break;
                        }
                        $('#edit-link-number .item-after').text(slidename);
                    }

                    $('#edit-link-edit').toggleClass('disabled', (_linkType==c_oHyperlinkType.WebLink) && _.isEmpty($('#edit-link-url input').val()));
                }
            },

            onPageShow: function (view, pageId) {
                var me = this;

                $('#page-editlink-type li').single('click',  _.buffered(me.onLinkType, 100, me));
                $('#page-editlink-slidenumber li').single('click', _.buffered(me.onSlideLink, 100, me));
                $('#editlink-slide-number .button').single('click',_.buffered(me.onSlideNumber, 100, me));
                me.initSettings(pageId);
            },

            // Handlers

            onEditLink: function () {
                var me      = this,
                    display = $('#edit-link-display input').val(),
                    tip     = $('#edit-link-tip input').val(),
                    props   = new Asc.CHyperlinkProperty(),
                    def_display = '';

                if (_linkType==c_oHyperlinkType.WebLink) {
                    var url = $('#edit-link-url input').val(),
                        urltype = me.api.asc_getUrlType($.trim(url)),
                        isEmail = (urltype == 2);
                    if (urltype < 1) {
                        uiApp.alert(me.txtNotUrl);
                        return;
                    }

                    url = url.replace(/^\s+|\s+$/g,'');
                    if (! /(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url) )
                        url = (isEmail ? 'mailto:' : 'http://' ) + url;
                    url = url.replace(new RegExp("%20",'g')," ");

                    props.put_Value( url );
                    props.put_ToolTip(tip);
                    def_display = url;
                } else {
                    var url = "ppaction://hlink";
                    var slidetip = '';
                    switch (_slideLink) {
                        case 0:
                            url = url + "showjump?jump=nextslide";
                            slidetip = this.textNext;
                            break;
                        case 1:
                            url = url + "showjump?jump=previousslide";
                            slidetip = this.textPrev;
                            break;
                        case 2:
                            url = url + "showjump?jump=firstslide";
                            slidetip = this.textFirst;
                            break;
                        case 3:
                            url = url + "showjump?jump=lastslide";
                            slidetip = this.textLast;
                            break;
                        case 4:
                            url = url + "sldjumpslide" + _slideNum;
                            slidetip = this.textSlide + ' ' + (_slideNum+1);
                            break;
                    }
                    props.put_Value( url );
                    props.put_ToolTip(_.isEmpty(tip) ? slidetip : tip);
                    def_display = slidetip;
                }

                if (!$('#edit-link-display').hasClass('disabled')) {
                    props.put_Text(_.isEmpty(display) ? def_display : display);
                } else
                    props.put_Text(null);

                me.api.change_Hyperlink(props);

                PE.getController('EditContainer').hideModal();
            },

            onRemoveLink: function () {
                this.api && this.api.remove_Hyperlink();
                PE.getController('EditContainer').hideModal();
            },

            onLinkType: function (e) {
                var $target = $(e.currentTarget).find('input');

                if ($target && this.api) {
                    _linkType = parseFloat($target.prop('value'));
                }
            },

            onSlideLink: function (e) {
                var $target = $(e.currentTarget).find('input');

                if ($target && this.api) {
                    _slideLink = parseFloat($target.prop('value'));
                }
            },

            onSlideNumber: function (e) {
                var $button = $(e.currentTarget),
                    slide = _slideNum;

                if ($button.hasClass('decrement')) {
                    slide = Math.max(0, --slide);
                } else {
                    slide = Math.min(_slidesCount-1, ++slide);
                }
                _slideNum = slide;
                $('#editlink-slide-number .item-after label').text(slide+1);
            },

            // API handlers

            onApiFocusObject: function (objects) {
                _stack = objects;

                var links = [];

                _.each(_stack, function (object) {
                    if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Hyperlink) {
                        links.push(object);
                    }
                });

                if (links.length > 0) {
                    var object = links[links.length - 1]; // get top
                    _linkObject = object.get_ObjectValue();
                } else {
                    _linkObject = undefined;
                }
            },

            // Helpers

            _closeIfNeed: function () {
                if (!this._isImageInStack()) {
                    PE.getController('EditContainer').hideModal();
                }
            },

            txtNotUrl: 'This field should be a URL in the format \"http://www.example.com\"',
            textDefault: 'Selected text',
            textNext: 'Next Slide',
            textPrev: 'Previous Slide',
            textFirst: 'First Slide',
            textLast: 'Last Slide',
            textSlide: 'Slide',
            textExternalLink: 'External Link',
            textInternalLink: 'Slide in this Presentation'
        };
    })(), PE.Controllers.EditLink || {}))
});