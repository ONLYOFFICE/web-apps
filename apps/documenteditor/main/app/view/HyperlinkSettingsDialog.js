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
 *  HyperlinkSettingsDialog.js
 *
 *  Created by Alexander Yuzhin on 2/20/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


if (Common === undefined)
    var Common = {};

var c_oHyperlinkType = {
    InternalLink:0,
    WebLink: 1
};

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/InputField',
    'common/main/lib/component/Window'
], function () { 'use strict';

    DE.Views.HyperlinkSettingsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 350,
            style: 'min-width: 230px;',
            cls: 'modal-dlg'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height: 260px;">',
                    '<div class="input-row" style="margin-bottom: 10px;">',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-hyperlink-external" style="border-top-right-radius: 0;border-bottom-right-radius: 0;">', this.textExternal,'</button>',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-hyperlink-internal" style="border-top-left-radius: 0;border-bottom-left-radius: 0;">', this.textInternal,'</button>',
                    '</div>',
                    '<div id="id-external-link">',
                        '<div class="input-row">',
                            '<label>' + this.textUrl + ' *</label>',
                        '</div>',
                        '<div id="id-dlg-hyperlink-url" class="input-row" style="margin-bottom: 5px;"></div>',
                    '</div>',
                    '<div id="id-internal-link">',
                        '<div id="id-dlg-hyperlink-list" style="width:100%; height: 130px;border: 1px solid #cfcfcf;"></div>',
                    '</div>',
                    '<div class="input-row">',
                        '<label>' + this.textDisplay + '</label>',
                    '</div>',
                    '<div id="id-dlg-hyperlink-display" class="input-row" style="margin-bottom: 5px;"></div>',
                    '<div class="input-row">',
                        '<label>' + this.textTooltip + '</label>',
                    '</div>',
                    '<div id="id-dlg-hyperlink-tip" class="input-row" style="margin-bottom: 5px;"></div>',
                '</div>',
                '<div class="footer right">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + this.okButtonText + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel">' + this.cancelButtonText + '</button>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.api = this.options.api;
            this._originalProps = null;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild();

            me.btnExternal = new Common.UI.Button({
                el: $('#id-dlg-hyperlink-external'),
                enableToggle: true,
                toggleGroup: 'hyperlink-type',
                allowDepress: false,
                pressed: true
            });
            me.btnExternal.on('click', _.bind(me.onLinkTypeClick, me, c_oHyperlinkType.WebLink));

            me.btnInternal = new Common.UI.Button({
                el: $('#id-dlg-hyperlink-internal'),
                enableToggle: true,
                toggleGroup: 'hyperlink-type',
                allowDepress: false
            });
            me.btnInternal.on('click', _.bind(me.onLinkTypeClick, me, c_oHyperlinkType.InternalLink));

            me.inputUrl = new Common.UI.InputField({
                el          : $('#id-dlg-hyperlink-url'),
                allowBlank  : false,
                blankError  : me.txtEmpty,
                style       : 'width: 100%;',
                validateOnBlur: false,
                validation  : function(value) {
                    var urltype = me.api.asc_getUrlType($.trim(value));
                    me.isEmail = (urltype==2);
                    return (urltype>0) ? true : me.txtNotUrl;
                }
            });

            me.inputDisplay = new Common.UI.InputField({
                el          : $('#id-dlg-hyperlink-display'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;'
            }).on('changed:after', function() {
                me.isTextChanged = true;
            });

            me.inputTip = new Common.UI.InputField({
                el          : $('#id-dlg-hyperlink-tip'),
                style       : 'width: 100%;',
                maxLength   : Asc.c_oAscMaxTooltipLength
            });

            me.internalList = new Common.UI.TreeView({
                el: $('#id-dlg-hyperlink-list'),
                store: new Common.UI.TreeViewStore(),
                enableKeyEvents: true
            });
            me.internalList.on('item:select', _.bind(this.onSelectItem, this));

            me.btnOk = new Common.UI.Button({
                el: $window.find('.primary')
            });

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            me.internalList.on('entervalue', _.bind(me.onPrimary, me));
            me.externalPanel = $window.find('#id-external-link');
            me.internalPanel = $window.find('#id-internal-link');
        },

        ShowHideElem: function(value) {
            this.externalPanel.toggleClass('hidden', value !== c_oHyperlinkType.WebLink);
            this.internalPanel.toggleClass('hidden', value !== c_oHyperlinkType.InternalLink);
            var store = this.internalList.store;
            if (value==c_oHyperlinkType.InternalLink) {
                if (store.length<1) {
                    var anchors = this.api.asc_GetHyperlinkAnchors(),
                        count = anchors.length,
                        prev_level = 0,
                        header_level = 0,
                        arr = [];
                    arr.push(new Common.UI.TreeViewModel({
                        name : this.txtBeginning,
                        level: 0,
                        index: 0,
                        hasParent: false,
                        isEmptyItem: false,
                        isNotHeader: true,
                        hasSubItems: false
                    }));
                    arr.push(new Common.UI.TreeViewModel({
                        name : this.txtHeadings,
                        level: 0,
                        index: 1,
                        hasParent: false,
                        isEmptyItem: false,
                        isNotHeader: false,
                        hasSubItems: false
                    }));

                    for (var i=0; i<count; i++) {
                        var anchor = anchors[i],
                            level = anchors[i].asc_GetHeadingLevel()+1,
                            hasParent = true;
                        if (anchor.asc_GetType()== Asc.c_oAscHyperlinkAnchor.Heading){
                            if (level>prev_level)
                                arr[arr.length-1].set('hasSubItems', true);
                            if (level<=header_level) {
                                header_level = level;
                                hasParent = false;
                            }
                            arr.push(new Common.UI.TreeViewModel({
                                name : anchor.asc_GetHeadingText(),
                                level: level,
                                index: i+2,
                                hasParent: hasParent,
                                type: Asc.c_oAscHyperlinkAnchor.Heading,
                                headingParagraph: anchor.asc_GetHeadingParagraph()
                            }));
                            prev_level = level;
                        }
                    }
                    arr.push(new Common.UI.TreeViewModel({
                        name : this.txtBookmarks,
                        level: 0,
                        index: arr.length,
                        hasParent: false,
                        isEmptyItem: false,
                        isNotHeader: false,
                        hasSubItems: false
                    }));

                    prev_level = 0;
                    for (var i=0; i<count; i++) {
                        var anchor = anchors[i],
                            hasParent = true;
                        if (anchor.asc_GetType()== Asc.c_oAscHyperlinkAnchor.Bookmark){
                            if (prev_level<1)
                                arr[arr.length-1].set('hasSubItems', true);
                            arr.push(new Common.UI.TreeViewModel({
                                name : anchor.asc_GetBookmarkName(),
                                level: 1,
                                index: arr.length,
                                hasParent: false,
                                type: Asc.c_oAscHyperlinkAnchor.Bookmark
                            }));
                            prev_level = 1;
                        }
                    }
                    store.reset(arr);
                }
                var rec = this.internalList.getSelectedRec();
                this.btnOk.setDisabled(rec.length<1 || rec[0].get('level')==0 && rec[0].get('index')>0);

            } else
                this.btnOk.setDisabled(false);
        },

        onLinkTypeClick: function(type, btn, event) {
            this.ShowHideElem(type);
        },

        onSelectItem: function(picker, item, record, e){
            this.btnOk.setDisabled(record.get('level')==0 && record.get('index')>0);
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);

            var me = this;
            _.delay(function(){
                me.inputUrl.cmpEl.find('input').focus();
            },50);
        },

        setSettings: function (props) {
            if (props) {
                var me = this;

                var bookmark = props.get_Bookmark(),
                    type = (bookmark === null || bookmark=='') ? c_oHyperlinkType.WebLink : c_oHyperlinkType.InternalLink;

                (type == c_oHyperlinkType.WebLink) ? me.btnExternal.toggle(true) : me.btnInternal.toggle(true);
                me.ShowHideElem(type);

                if (type == c_oHyperlinkType.WebLink) {
                    if (props.get_Value()) {
                        me.inputUrl.setValue(props.get_Value().replace(new RegExp(" ",'g'), "%20"));
                    } else {
                        me.inputUrl.setValue('');
                    }
                } else {
                    if (props.is_TopOfDocument())
                        this.internalList.selectByIndex(0);
                    else if (props.is_Heading()) {
                        var heading = props.get_Heading(),
                            rec = this.internalList.store.findWhere({type: Asc.c_oAscHyperlinkAnchor.Heading, headingParagraph: heading });
                        if (rec)
                            this.internalList.scrollToRecord(this.internalList.selectRecord(rec));
                    } else {
                        var rec = this.internalList.store.findWhere({type: Asc.c_oAscHyperlinkAnchor.Bookmark, name: bookmark});
                        if (rec)
                            this.internalList.scrollToRecord(this.internalList.selectRecord(rec));
                    }
                }

                if (props.get_Text() !== null) {
                    me.inputDisplay.setValue(props.get_Text());
                    me.inputDisplay.setDisabled(false);
                } else {
                    me.inputDisplay.setValue(this.textDefault);
                    me.inputDisplay.setDisabled(true);
                }

                this.isTextChanged = false;

                me.inputTip.setValue(props.get_ToolTip());
                me._originalProps = props;
            }
        },

        getSettings: function () {
            var me      = this,
                props   = new Asc.CHyperlinkProperty(),
                display = '';

            if (this.btnExternal.isActive()) {//WebLink
                var url     = $.trim(me.inputUrl.getValue());

                if (! /(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url) )
                    url = ( (me.isEmail) ? 'mailto:' : 'http://' ) + url;

                url = url.replace(new RegExp("%20",'g')," ");
                props.put_Value(url);
                props.put_Bookmark(null);
                display = url;
            } else {
                var rec = this.internalList.getSelectedRec();
                if (rec.length>0) {
                    props.put_Bookmark(rec[0].get('name'));
                    if (rec[0].get('index')==0)
                        props.put_TopOfDocument();
                    var para = rec[0].get('headingParagraph');
                    if (para)
                        props.put_Heading(para);
                    display = rec[0].get('name');
                }
            }

            if (!me.inputDisplay.isDisabled() && ( this.isTextChanged || _.isEmpty(me.inputDisplay.getValue()))) {
                if (_.isEmpty(me.inputDisplay.getValue()))
                    me.inputDisplay.setValue(display);
                props.put_Text(me.inputDisplay.getValue());
            } else {
                props.put_Text(null);
            }

            props.put_ToolTip(me.inputTip.getValue());
            props.put_InternalHyperlink(me._originalProps.get_InternalHyperlink());

            return props;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state == 'ok') {
                    if (this.btnExternal.isActive()) {//WebLink
                        if (this.inputUrl.checkValidate() !== true)  {
                            this.inputUrl.cmpEl.find('input').focus();
                            return;
                        }
                    } else {
                        var rec = this.internalList.getSelectedRec();
                        if (rec.length<1 || rec[0].get('level')==0 && rec[0].get('index')>0)
                            return;
                    }
                    if (this.inputDisplay.checkValidate() !== true) {
                        this.inputDisplay.cmpEl.find('input').focus();
                        return;
                    }
                }

                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        textUrl:            'Link to',
        textDisplay:        'Display',
        cancelButtonText:   'Cancel',
        okButtonText:       'Ok',
        txtEmpty:           'This field is required',
        txtNotUrl:          'This field should be a URL in the format \"http://www.example.com\"',
        textTooltip:        'ScreenTip text',
        textDefault:        'Selected text',
        textTitle:          'Hyperlink Settings',
        textExternal:       'External Link',
        textInternal:       'Place in Document',
        txtBeginning: 'Beginning of document',
        txtHeadings: 'Headings',
        txtBookmarks: 'Bookmarks'
    }, DE.Views.HyperlinkSettingsDialog || {}))
});