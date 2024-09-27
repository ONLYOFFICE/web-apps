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
 *  HyperlinkSettingsDialog.js
 *
 *  Created on 2/20/14
 *
 */


if (Common === undefined)
    var Common = {};

var c_oHyperlinkType = {
    InternalLink:0,
    WebLink: 1
};

define([], function () { 'use strict';

    DE.Views.HyperlinkSettingsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 350,
            style: 'min-width: 230px;',
            cls: 'modal-dlg',
            id: 'window-hyperlink',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height: 319px;">',
                    '<div class="input-row" style="margin-bottom: 10px;">',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-hyperlink-external">', this.textExternal,'</button>',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-hyperlink-internal">', this.textInternal,'</button>',
                    '</div>',
                    '<div id="id-external-link">',
                        '<div class="input-row">',
                            '<label>' + this.textUrl + '</label>',
                        '</div>',
                        '<div id="id-dlg-hyperlink-url" class="input-row" style="margin-bottom: 5px;"></div>',
                    '</div>',
                    '<div id="id-internal-link">',
                        '<div class="input-row">',
                            '<label>' + this.textUrl + '</label>',
                        '</div>',
                        '<div id="id-dlg-hyperlink-list" style="width:100%; height: 171px;"></div>',
                    '</div>',
                    '<div class="input-row">',
                        '<label>' + this.textDisplay + '</label>',
                    '</div>',
                    '<div id="id-dlg-hyperlink-display" class="input-row" style="margin-bottom: 5px;"></div>',
                    '<div class="input-row">',
                        '<label>' + this.textTooltip + '</label>',
                    '</div>',
                    '<div id="id-dlg-hyperlink-tip" class="input-row" style="margin-bottom: 5px;"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.api = this.options.api;
            this._originalProps = null;
            this.urlType = AscCommon.c_oAscUrlType.Invalid;
            this.appOptions = this.options.appOptions;

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

            var config = {
                el          : $('#id-dlg-hyperlink-url'),
                allowBlank  : false,
                blankError  : me.txtEmpty,
                style       : 'width: 100%;',
                validateOnBlur: false,
                iconCls: 'toolbar__icon btn-browse',
                placeHolder: me.appOptions.isDesktopApp ? me.txtUrlPlaceholder : '',
                btnHint: me.textSelectFile,
                validation  : function(value) {
                    var trimmed = $.trim(value);
                    if (trimmed.length>2083) return me.txtSizeLimit;

                    me.urlType = me.api.asc_getUrlType(trimmed);
                    return (me.urlType!==AscCommon.c_oAscUrlType.Invalid) ? true : me.txtNotUrl;
                },
                ariaLabel   : me.textUrl
            };
            me.inputUrl = me.appOptions.isDesktopApp ? new Common.UI.InputFieldBtn(config) : new Common.UI.InputField(config);
            me.inputUrl._input.on('input', function (e) {
                me.isInputFirstChange && me.inputUrl.showError();
                me.isInputFirstChange = false;
                var val = $(e.target).val();
                if (me.isAutoUpdate) {
                    me.inputDisplay.setValue(val);
                    me.isTextChanged = true;
                }
                me.btnOk.setDisabled($.trim(val)=='');
            });
            me.appOptions.isDesktopApp && me.inputUrl.on('button:click', _.bind(me.onSelectFile, me));

            me.inputDisplay = new Common.UI.InputField({
                el          : $('#id-dlg-hyperlink-display'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;',
                ariaLabel   : me.textDisplay
            }).on('changed:after', function() {
                me.isTextChanged = true;
            });
            me.inputDisplay._input.on('input', function (e) {
                me.isAutoUpdate = ($(e.target).val()=='');
            });

            me.inputTip = new Common.UI.InputField({
                el          : $('#id-dlg-hyperlink-tip'),
                style       : 'width: 100%;',
                maxLength   : Asc.c_oAscMaxTooltipLength,
                ariaLabel   : me.textTooltip
            });

            me.internalList = new Common.UI.TreeView({
                el: $('#id-dlg-hyperlink-list'),
                store: new Common.UI.TreeViewStore(),
                enableKeyEvents: true,
                tabindex: 1
            });
            me.internalList.on('item:select', _.bind(this.onSelectItem, this));

            me.btnOk = _.find(this.getFooterButtons(), function (item) {
                return (item.$el && item.$el.find('.primary').addBack().filter('.primary').length>0);
            }) || new Common.UI.Button({ el: $window.find('.primary') });

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            me.internalList.on('entervalue', _.bind(me.onPrimary, me));
            me.externalPanel = $window.find('#id-external-link');
            me.internalPanel = $window.find('#id-internal-link');
        },

        getFocusedComponents: function() {
            return [this.btnExternal, this.btnInternal, this.inputUrl, this.internalList, this.inputDisplay, this.inputTip].concat(this.getFooterButtons());
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
                        type: Asc.c_oAscHyperlinkAnchor.Heading,
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
                        type: Asc.c_oAscHyperlinkAnchor.Bookmark,
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
                    this.internalList.collapseAll();
                }
                var rec = this.internalList.getSelectedRec();
                this.btnOk.setDisabled(!rec || rec.get('level')==0 && rec.get('index')>0);
                var me = this;
                _.delay(function(){
                    me.inputDisplay.focus();
                },50);
            } else {
                this.btnOk.setDisabled($.trim(this.inputUrl.getValue())=='');
                var me = this;
                _.delay(function(){
                    me.inputUrl.focus();
                },50);
            }
        },

        onLinkTypeClick: function(type, btn, event) {
            this.ShowHideElem(type);
            if (this.isAutoUpdate) {
                if (type==c_oHyperlinkType.InternalLink) {
                    var rec = this.internalList.getSelectedRec();
                    this.inputDisplay.setValue(rec && (rec.get('level') || rec.get('index')==0)? rec.get('name') : '');
                } else {
                    this.inputDisplay.setValue(this.inputUrl.getValue());
                }
                this.isTextChanged = true;
            }
        },

        onSelectItem: function(picker, item, record, e){
            this.btnOk.setDisabled(record.get('level')==0 && record.get('index')>0);
            if (this.isAutoUpdate) {
                this.inputDisplay.setValue((record.get('level') || record.get('index')==0) ? record.get('name') : '');
                this.isTextChanged = true;
            }
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);
        },

        setSettings: function (props) {
            if (props) {
                var me = this;

                var bookmark = props.get_Bookmark(),
                    type = (bookmark === null || bookmark=='') ? ((props.get_Value() || !Common.Utils.InternalSettings.get("de-settings-link-type")) ? c_oHyperlinkType.WebLink : c_oHyperlinkType.InternalLink) : c_oHyperlinkType.InternalLink;

                (type == c_oHyperlinkType.WebLink) ? me.btnExternal.toggle(true) : me.btnInternal.toggle(true);
                me.ShowHideElem(type);

                if (type == c_oHyperlinkType.WebLink) {
                    if (props.get_Value()) {
                        me.inputUrl.setValue(props.get_Value().replace(new RegExp(" ",'g'), "%20"));
                    } else {
                        me.inputUrl.setValue('');
                    }
                    this.btnOk.setDisabled($.trim(this.inputUrl.getValue())=='');
                } else {
                    if (props.is_TopOfDocument())
                        this.internalList.selectByIndex(0);
                    else if (props.is_Heading()) {
                        var rec = this.internalList.store.findWhere({type: Asc.c_oAscHyperlinkAnchor.Heading, headingParagraph: props.get_Heading() });
                        if (rec) {
                            this.internalList.expandRecord(this.internalList.store.at(1));
                            this.internalList.scrollToRecord(this.internalList.selectRecord(rec));
                        }
                    } else {
                        var rec = this.internalList.store.findWhere({type: Asc.c_oAscHyperlinkAnchor.Bookmark, name: bookmark});
                        if (rec) {
                            this.internalList.expandRecord(this.internalList.store.findWhere({type: Asc.c_oAscHyperlinkAnchor.Bookmark, level: 0}));
                            this.internalList.scrollToRecord(this.internalList.selectRecord(rec));
                        }
                    }
                    var rec = this.internalList.getSelectedRec();
                    this.btnOk.setDisabled(!rec || rec.get('level')==0 && rec.get('index')>0);
                }

                if (props.get_Text() !== null) {
                    me.inputDisplay.setValue(props.get_Text());
                    me.inputDisplay.setDisabled(false);
                    me.isAutoUpdate = (me.inputDisplay.getValue()=='' || type == c_oHyperlinkType.WebLink && me.inputUrl.getValue()==me.inputDisplay.getValue());
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
                display = '',
                type = this.btnExternal.isActive() ? c_oHyperlinkType.WebLink : c_oHyperlinkType.InternalLink;

            if (type==c_oHyperlinkType.WebLink) {//WebLink
                var url     = $.trim(me.inputUrl.getValue());

                if (me.urlType!==AscCommon.c_oAscUrlType.Unsafe && ! /(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url) )
                    url = ( (me.urlType==AscCommon.c_oAscUrlType.Email) ? 'mailto:' : 'http://' ) + url;

                url = url.replace(new RegExp("%20",'g')," ");
                props.put_Value(url);
                props.put_Bookmark(null);
                display = url;
            } else {
                var rec = this.internalList.getSelectedRec();
                if (rec) {
                    props.put_Bookmark(rec.get('name'));
                    if (rec.get('index')==0)
                        props.put_TopOfDocument();
                    var para = rec.get('headingParagraph');
                    if (para)
                        props.put_Heading(para);
                    display = rec.get('name');
                }
            }

            if (!me.inputDisplay.isDisabled() && ( me.isTextChanged || _.isEmpty(me.inputDisplay.getValue()))) {
                if (_.isEmpty(me.inputDisplay.getValue()) || type==c_oHyperlinkType.WebLink && me.isAutoUpdate)
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
                            this.isInputFirstChange = true;
                            this.inputUrl.focus();
                            return;
                        }
                    } else {
                        var rec = this.internalList.getSelectedRec();
                        if (!rec || rec.get('level')==0 && rec.get('index')>0)
                            return;
                    }
                    if (this.inputDisplay.checkValidate() !== true) {
                        this.inputDisplay.focus();
                        return;
                    }
                    (!this._originalProps.get_Bookmark() && !this._originalProps.get_Value()) &&  Common.Utils.InternalSettings.set("de-settings-link-type", this.btnInternal.isActive()); // save last added hyperlink
                }

                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        onSelectFile: function() {
            var me = this;
            if (me.api) {
                var callback = function(result) {
                    if (result) {
                        me.inputUrl.setValue(result);
                        if (me.inputUrl.checkValidate() !== true)
                            me.isInputFirstChange = true;
                        if (me.isAutoUpdate) {
                            me.inputDisplay.setValue(result);
                            me.isTextChanged = true;
                        }
                        me.btnOk.setDisabled($.trim(result)=='');
                    }
                };

                me.api.asc_getFilePath(callback); // change sdk function
            }
        },

        textUrl:            'Link to',
        textDisplay:        'Display',
        txtEmpty:           'This field is required',
        txtNotUrl:          'This field should be a URL in the format \"http://www.example.com\"',
        textTooltip:        'ScreenTip text',
        textDefault:        'Selected text',
        textTitle:          'Hyperlink Settings',
        textExternal:       'External Link',
        textInternal:       'Place in Document',
        txtBeginning: 'Beginning of document',
        txtHeadings: 'Headings',
        txtBookmarks: 'Bookmarks',
        txtSizeLimit: 'This field is limited to 2083 characters',
        txtUrlPlaceholder: 'Enter the web address or select a file',
        textSelectFile: 'Select file'
    }, DE.Views.HyperlinkSettingsDialog || {}))
});