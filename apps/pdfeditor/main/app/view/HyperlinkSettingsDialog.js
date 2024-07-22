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
 *  Created on 04/23/24
 *
 */


if (Common === undefined)
    var Common = {};

var c_oHyperlinkType = {
    InternalLink:0,
    WebLink: 1
};

define([], function () { 'use strict';

    PDFE.Views.HyperlinkSettingsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 350,
            style: 'min-width: 230px;',
            cls: 'modal-dlg',
            id: 'window-hyperlink-settings',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height: 319px;">',
                    '<div class="input-row" style="margin-bottom: 10px;">',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-hyperlink-external">', this.textExternalLink,'</button>',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-hyperlink-internal">', this.textInternalLink,'</button>',
                    '</div>',
                    '<div id="id-external-link">',
                        '<div class="input-row">',
                            '<label>' + this.strLinkTo + '</label>',
                        '</div>',
                        '<div id="id-dlg-hyperlink-url" class="input-row" style="margin-bottom: 5px;"></div>',
                    '</div>',
                    '<div id="id-internal-link" class="hidden">',
                        '<div class="input-row">',
                            '<label>' + this.strLinkTo + '</label>',
                        '</div>',
                        '<div id="id-dlg-hyperlink-list" style="width:100%; height: 171px;"></div>',
                    '</div>',
                    '<div class="input-row">',
                        '<label>' + this.strDisplay + '</label>',
                    '</div>',
                    '<div id="id-dlg-hyperlink-display" class="input-row" style="margin-bottom: 5px;"></div>',
                    '<div class="input-row">',
                        '<label>' + this.textTipText + '</label>',
                    '</div>',
                    '<div id="id-dlg-hyperlink-tip" class="input-row" style="margin-bottom: 5px;"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.slides = this.options.slides;
            this.api = this.options.api;
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
                validateOnBlur: false,
                style       : 'width: 100%;',
                iconCls: 'toolbar__icon btn-browse',
                placeHolder: me.appOptions.isDesktopApp ? me.txtUrlPlaceholder : '',
                btnHint: me.textSelectFile,
                validation  : function(value) {
                    var trimmed = $.trim(value);
                    if (trimmed.length>2083) return me.txtSizeLimit;

                    me.urlType = me.api.asc_getUrlType(trimmed);
                    return (me.urlType!==AscCommon.c_oAscUrlType.Invalid) ? true : me.txtNotUrl;
                }
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
                style       : 'width: 100%;'
            }).on('changed:after', function() {
                me.isTextChanged = true;
            });
            me.inputDisplay._input.on('input', function (e) {
                me.isAutoUpdate = ($(e.target).val()=='');
            });

            me.inputTip = new Common.UI.InputField({
                el          : $('#id-dlg-hyperlink-tip'),
                style       : 'width: 100%;',
                maxLength   : Asc.c_oAscMaxTooltipLength
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
            me.btnOk.setDisabled(true);

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            me.internalList.on('entervalue', _.bind(me.onPrimary, me));
            me.externalPanel = $window.find('#id-external-link');
            me.internalPanel = $window.find('#id-internal-link');
        },

        getFocusedComponents: function() {
            return [this.btnExternal, this.btnInternal, this.inputUrl, this.internalList, this.inputDisplay, this.inputTip].concat(this.getFooterButtons());
        },

        setSettings: function (props) {
            if (props) {
                var me = this;

                var type = me.parseUrl(props.get_Value());
                (type == c_oHyperlinkType.WebLink) ? me.btnExternal.toggle(true) : me.btnInternal.toggle(true);
                me.ShowHideElem(type, props.get_Value());
                
                if (props.get_Text()!==null) {
                    me.inputDisplay.setValue(props.get_Text());
                    me.inputDisplay.setDisabled(false);
                    me.isAutoUpdate = (me.inputDisplay.getValue()=='' || type == c_oHyperlinkType.WebLink && me.inputUrl.getValue()==me.inputDisplay.getValue());
                } else {
                    this.inputDisplay.setValue(this.textDefault);
                    this.inputDisplay.setDisabled(true);
                }
                this.isTextChanged = false;
                this.inputTip.setValue(props.get_ToolTip());

                me._originalProps = props;
            }
        },

        getSettings: function () {
            var me      = this,
                props   = new Asc.CHyperlinkProperty();
            var def_display = '',
                type = this.btnExternal.isActive() ? c_oHyperlinkType.WebLink : c_oHyperlinkType.InternalLink;
            if (type==c_oHyperlinkType.InternalLink) {//InternalLink
                var url = "ppaction://hlink";
                var tip = '';
                var txttip = me.inputTip.getValue();
                var rec = this.internalList.getSelectedRec();
                if (rec) {
                    url = url + rec.get('type');
                    tip = rec.get('tiptext');
                }
                props.put_Value( url );
                props.put_ToolTip(_.isEmpty(txttip) ? tip : txttip);
                def_display = tip;
            } else {
                var url = $.trim(me.inputUrl.getValue());
                if (me.urlType!==AscCommon.c_oAscUrlType.Unsafe && ! /(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url) )
                    url = ( (me.urlType==AscCommon.c_oAscUrlType.Email) ? 'mailto:' : 'http://' ) + url;
                url = url.replace(new RegExp("%20",'g')," ");
                props.put_Value( url );
                props.put_ToolTip(me.inputTip.getValue());
                def_display = url;
            }

            if (!me.inputDisplay.isDisabled() && (me.isTextChanged || _.isEmpty(me.inputDisplay.getValue()))) {
                if (_.isEmpty(me.inputDisplay.getValue()) || type==c_oHyperlinkType.WebLink && me.isAutoUpdate)
                    me.inputDisplay.setValue(def_display);
                props.put_Text(me.inputDisplay.getValue());
            }
            else
                props.put_Text(null);

            return props;
        },

        onBtnClick: function(event) {
            if (event.currentTarget && event.currentTarget.attributes['result'])
                this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state == 'ok') {
                    var checkurl = (this.btnExternal.isActive()) ? this.inputUrl.checkValidate() : true,
                        checkdisp = this.inputDisplay.checkValidate();
                    if (checkurl !== true)  {
                        this.isInputFirstChange = true;
                        this.inputUrl.focus();
                        return;
                    }
                    if (checkdisp !== true) {
                        this.inputDisplay.focus();
                        return;
                    }
                    !this._originalProps.get_Value() &&  Common.Utils.InternalSettings.set("pdfe-settings-link-type", this.btnInternal.isActive());
                }
                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        ShowHideElem: function(value, url) {
            this.externalPanel.toggleClass('hidden', value !== c_oHyperlinkType.WebLink);
            this.internalPanel.toggleClass('hidden', value !== c_oHyperlinkType.InternalLink);
            if (value==c_oHyperlinkType.InternalLink) {
                if (url===null || url===undefined || url=='' )
                    url = "ppaction://hlinkshowjump?jump=firstslide";
                var store = this.internalList.store;
                if (store.length<1) {
                    var arr = [], i = 0;
                    arr.push(new Common.UI.TreeViewModel({
                        name : this.txtFirst,
                        level: 0,
                        index: i++,
                        hasParent: false,
                        isEmptyItem: false,
                        isNotHeader: true,
                        hasSubItems: false,
                        type: "showjump?jump=firstslide",
                        tiptext: this.txtFirst,
                        selected: url == "ppaction://hlinkshowjump?jump=firstslide"
                    }));
                    arr.push(new Common.UI.TreeViewModel({
                        name : this.txtLast,
                        level: 0,
                        index: i++,
                        hasParent: false,
                        isEmptyItem: false,
                        isNotHeader: true,
                        hasSubItems: false,
                        type: "showjump?jump=lastslide",
                        tiptext: this.txtLast,
                        selected: url == "ppaction://hlinkshowjump?jump=lastslide"
                    }));
                    arr.push(new Common.UI.TreeViewModel({
                        name : this.txtNext,
                        level: 0,
                        index: i++,
                        hasParent: false,
                        isEmptyItem: false,
                        isNotHeader: true,
                        hasSubItems: false,
                        type: "showjump?jump=nextslide",
                        tiptext: this.txtNext,
                        selected: url == "ppaction://hlinkshowjump?jump=nextslide"
                    }));
                    arr.push(new Common.UI.TreeViewModel({
                        name : this.txtPrev,
                        level: 0,
                        index: i++,
                        hasParent: false,
                        isEmptyItem: false,
                        isNotHeader: true,
                        hasSubItems: false,
                        type: "showjump?jump=previousslide",
                        tiptext: this.txtPrev,
                        selected: url == "ppaction://hlinkshowjump?jump=previousslide"
                    }));
                    arr.push(new Common.UI.TreeViewModel({
                        name : this.textPages,
                        level: 0,
                        index: i++,
                        hasParent: false,
                        isEmptyItem: false,
                        isNotHeader: true,
                        hasSubItems: this.api.getCountPages()>0
                    }));
                    var mask = "ppaction://hlinksldjumpslide",
                        indSlide = url.indexOf(mask),
                        slideNum = (0 == indSlide) ? parseInt(url.substring(mask.length)) : -1;
                    for (var i=0; i<this.api.getCountPages(); i++) {
                        arr.push(new Common.UI.TreeViewModel({
                            name : this.txtPage + ' ' + (i+1),
                            level: 1,
                            index: arr.length,
                            hasParent: false,
                            isEmptyItem: false,
                            isNotHeader: true,
                            hasSubItems: false,
                            type: 'sldjumpslide' + i,
                            tiptext: this.txtPage + ' ' + (i+1),
                            selected: i==slideNum
                        }));
                    }
                    store.reset(arr);
                }
                var rec = this.internalList.getSelectedRec();
                rec && this.internalList.scrollToRecord(rec);
                this.btnOk.setDisabled(!rec || rec.get('index')==4);
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
                    this.inputDisplay.setValue(rec && (rec.get('level') || rec.get('index')<4) ? rec.get('name') : '');
                } else {
                    this.inputDisplay.setValue(this.inputUrl.getValue());
                }
                this.isTextChanged = true;
            }
        },

        parseUrl: function(url) {
            if (url===null || url===undefined || url=='' )
                return Common.Utils.InternalSettings.get("pdfe-settings-link-type") ? c_oHyperlinkType.InternalLink : c_oHyperlinkType.WebLink;

            var indAction = url.indexOf("ppaction://hlink");
            if (0 == indAction)
            {
                return c_oHyperlinkType.InternalLink;
            } else  {
                this.inputUrl.setValue(url ? url.replace(new RegExp(" ",'g'), "%20") : '');
                return c_oHyperlinkType.WebLink;
            }
        },

        onSelectItem: function(picker, item, record, e){
            if (!record) return;
            this.btnOk.setDisabled(record.get('index')==4);
            if (this.isAutoUpdate) {
                this.inputDisplay.setValue((record.get('level') || record.get('index')<4) ? record.get('name') : '');
                this.isTextChanged = true;
            }
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

        textTitle:          'Hyperlink Settings',
        textInternalLink:   'Place in Document',
        textExternalLink:   'External Link',
        textEmptyLink:      'Enter link here',
        textEmptyDesc:      'Enter caption here',
        textEmptyTooltip:   'Enter tooltip here',
        txtPage:            'Page',
        strDisplay:         'Display',
        textTipText:        'Screen Tip Text',
        strLinkTo:          'Link To',
        txtEmpty:           'This field is required',
        txtNotUrl:          'This field should be a URL in the format \"http://www.example.com\"',
        txtNext:            'Next Page',
        txtPrev:            'Previous Page',
        txtFirst:           'First Page',
        txtLast:            'Last Page',
        textDefault:        'Selected text',
        textPages: 'Pages',
        txtSizeLimit: 'This field is limited to 2083 characters',
        txtUrlPlaceholder: 'Enter the web address or select a file',
        textSelectFile: 'Select file'
    }, PDFE.Views.HyperlinkSettingsDialog || {}))
});