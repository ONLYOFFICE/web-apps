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
 *  Created by Julia Radzhabova on 4/19/14
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
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/RadioBox',
    'common/main/lib/component/Window'
], function () { 'use strict';

    PE.Views.HyperlinkSettingsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 350,
            style: 'min-width: 230px;',
            cls: 'modal-dlg',
            id: 'window-hyperlink-settings'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height: 250px;">',
                    '<div class="input-row" style="margin-bottom: 10px;">',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-hyperlink-external" style="border-top-right-radius: 0;border-bottom-right-radius: 0;">', this.textExternalLink,'</button>',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-hyperlink-internal" style="border-top-left-radius: 0;border-bottom-left-radius: 0;">', this.textInternalLink,'</button>',
                    '</div>',
                    '<div id="id-external-link">',
                        '<div class="input-row">',
                            '<label>' + this.strLinkTo + ' *</label>',
                        '</div>',
                        '<div id="id-dlg-hyperlink-url" class="input-row" style="margin-bottom: 5px;"></div>',
                    '</div>',
                    '<div id="id-internal-link" class="hidden" style="margin-top: 15px;">',
                        '<div id="id-dlg-hyperlink-radio-next" style="display: block;margin-bottom: 5px;"></div>',
                        '<div id="id-dlg-hyperlink-radio-prev" style="display: block;margin-bottom: 5px;"></div>',
                        '<div id="id-dlg-hyperlink-radio-first" style="display: block;margin-bottom: 5px;"></div>',
                        '<div id="id-dlg-hyperlink-radio-last"  style="display: block;margin-bottom: 5px;"></div>',
                        '<div id="id-dlg-hyperlink-radio-slide" style="display: inline-block;margin-bottom: 5px;margin-right: 10px;"></div>',
                        '<div id="id-dlg-hyperlink-slide" style="display: inline-block;margin-bottom: 10px;"></div>',
                    '</div>',
                    '<div class="input-row">',
                        '<label>' + this.strDisplay + '</label>',
                    '</div>',
                    '<div id="id-dlg-hyperlink-display" class="input-row" style="margin-bottom: 5px;"></div>',
                    '<div class="input-row">',
                        '<label>' + this.textTipText + '</label>',
                    '</div>',
                        '<div id="id-dlg-hyperlink-tip" class="input-row" style="margin-bottom: 5px;"></div>',
                    '</div>',
                    '<div class="footer right">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + this.okButtonText + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel">' + this.cancelButtonText + '</button>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.slides = this.options.slides;
            this.api = this.options.api;

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
                validateOnBlur: false,
                style       : 'width: 100%;',
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

            me.radioNext = new Common.UI.RadioBox({
                el: $('#id-dlg-hyperlink-radio-next'),
                labelText: this.txtNext,
                name: 'asc-radio-slide',
                checked: true
            });

            me.radioPrev = new Common.UI.RadioBox({
                el: $('#id-dlg-hyperlink-radio-prev'),
                labelText: this.txtPrev,
                name: 'asc-radio-slide'
            });

            me.radioFirst = new Common.UI.RadioBox({
                el: $('#id-dlg-hyperlink-radio-first'),
                labelText: this.txtFirst,
                name: 'asc-radio-slide'
            });

            me.radioLast = new Common.UI.RadioBox({
                el: $('#id-dlg-hyperlink-radio-last'),
                labelText: this.txtLast,
                name: 'asc-radio-slide'
            });

            me.radioSlide = new Common.UI.RadioBox({
                el: $('#id-dlg-hyperlink-radio-slide'),
                labelText: this.txtSlide,
                name: 'asc-radio-slide'
            });

            me.cmbSlides = new Common.UI.ComboBox({
                el: $('#id-dlg-hyperlink-slide'),
                cls: 'input-group-nr',
                style: 'width: 50px;',
                menuStyle: 'min-width: 50px; max-height: 200px;',
                data: this.slides
            });
            me.cmbSlides.setValue(0);
            me.cmbSlides.on('selected', _.bind(function(combo, record) {
                me.radioSlide.setValue(true);
            }, me))
            .on('changed:after', _.bind(function(combo, record) {
                me.radioSlide.setValue(true);
                if (record.value>me.slides.length)
                    combo.setValue(me.slides.length-1);
                else if (record.value<1)
                    combo.setValue(0);
                else
                    combo.setValue(record.value-1);
            }, me));

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            me.externalPanel = $window.find('#id-external-link');
            me.internalPanel = $window.find('#id-internal-link');
        },

        setSettings: function (props) {
            if (props) {
                var me = this;

                var type = me.parseUrl(props.get_Value());
                (type == c_oHyperlinkType.WebLink) ? me.btnExternal.toggle(true) : me.btnInternal.toggle(true);
                me.ShowHideElem(type);
                
                if (props.get_Text()!==null) {
                    me.inputDisplay.setValue(props.get_Text());
                    me.inputDisplay.setDisabled(false);
                } else {
                    this.inputDisplay.setValue(this.textDefault);
                    this.inputDisplay.setDisabled(true);
                }
                this.isTextChanged = false;
                this.inputTip.setValue(props.get_ToolTip());

                if (type==c_oHyperlinkType.WebLink) {
                    _.delay(function(){
                        me.inputUrl.cmpEl.find('input').focus();
                    },50);
                }
            }
        },

        getSettings: function () {
            var me      = this,
                props   = new Asc.CHyperlinkProperty();
            var def_display = '';
            if (this.btnInternal.isActive()) {//InternalLink
                var url = "ppaction://hlink";
                var tip = '';
                var txttip = me.inputTip.getValue();
                if (this.radioSlide.getValue()) {
                    url = url + "sldjumpslide" + (this.cmbSlides.getValue());
                    tip = this.txtSlide + ' ' + (this.cmbSlides.getValue()+1);
                } else if (this.radioFirst.getValue()) {
                    url = url + "showjump?jump=firstslide";
                    tip = this.txtFirst;
                } else if (this.radioLast.getValue()) {
                    url = url + "showjump?jump=lastslide";
                    tip = this.txtLast;
                } else if (this.radioNext.getValue()) {
                    url = url + "showjump?jump=nextslide";
                    tip = this.txtNext;
                } else if (this.radioPrev.getValue()) {
                    url = url + "showjump?jump=previousslide";
                    tip = this.txtPrev;
                }
                props.put_Value( url );
                props.put_ToolTip(_.isEmpty(txttip) ? tip : txttip);
                def_display = tip;
            } else {
                var url = $.trim(me.inputUrl.getValue());
                if (! /(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url) )
                    url = ( (me.isEmail) ? 'mailto:' : 'http://' ) + url;
                url = url.replace(new RegExp("%20",'g')," ");
                props.put_Value( url );
                props.put_ToolTip(me.inputTip.getValue());
                def_display = url;
            }

            if (!me.inputDisplay.isDisabled() && (me.isTextChanged || _.isEmpty(me.inputDisplay.getValue()))) {
                if (_.isEmpty(me.inputDisplay.getValue()))
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
                        this.inputUrl.cmpEl.find('input').focus();
                        return;
                    }
                    if (checkdisp !== true) {
                        this.inputDisplay.cmpEl.find('input').focus();
                        return;
                    }
                }

                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        ShowHideElem: function(value) {
            this.externalPanel.toggleClass('hidden', value !== c_oHyperlinkType.WebLink);
            this.internalPanel.toggleClass('hidden', value !== c_oHyperlinkType.InternalLink);
        },

        onLinkTypeClick: function(type, btn, event) {
            this.ShowHideElem(type);
        },

        parseUrl: function(url) {
            if (url===null || url===undefined || url=='' )
                return c_oHyperlinkType.WebLink;

            var indAction = url.indexOf("ppaction://hlink");
            if (0 == indAction)
            {
                if (url == "ppaction://hlinkshowjump?jump=firstslide")
                {
                    this.radioFirst.setValue(true);
                }
                else if (url == "ppaction://hlinkshowjump?jump=lastslide")
                {
                    this.radioLast.setValue(true);
                }
                else if (url == "ppaction://hlinkshowjump?jump=nextslide")
                {
                    this.radioNext.setValue(true);
                }
                else if (url == "ppaction://hlinkshowjump?jump=previousslide")
                {
                    this.radioPrev.setValue(true);
                }
                else
                {
                    this.radioSlide.setValue(true);
                    var mask = "ppaction://hlinksldjumpslide";
                    var indSlide = url.indexOf(mask);
                    if (0 == indSlide)
                    {
                        var slideNum = parseInt(url.substring(mask.length));
                        if (slideNum >= 0 && slideNum < this.slides.length)
                            this.cmbSlides.setValue(slideNum);
                    }
                }
                return c_oHyperlinkType.InternalLink;
            } else  {
                this.inputUrl.setValue(url ? url.replace(new RegExp(" ",'g'), "%20") : '');
                return c_oHyperlinkType.WebLink;
            }
        },

        textTitle:          'Hyperlink Settings',
        textInternalLink:   'Slide In This Presentation',
        textExternalLink:   'External Link',
        textEmptyLink:      'Enter link here',
        textEmptyDesc:      'Enter caption here',
        textEmptyTooltip:   'Enter tooltip here',
        txtSlide:           'Slide',
        strDisplay:         'Display',
        textTipText:        'Screen Tip Text',
        strLinkTo:          'Link To',
        txtEmpty:           'This field is required',
        txtNotUrl:          'This field should be a URL in the format \"http://www.example.com\"',
        strPlaceInDocument: 'Select a Place in This Document',
        cancelButtonText:   'Cancel',
        okButtonText:       'Ok',
        txtNext:            'Next Slide',
        txtPrev:            'Previous Slide',
        txtFirst:           'First Slide',
        txtLast:            'Last Slide',
        textDefault:        'Selected text'
    }, PE.Views.HyperlinkSettingsDialog || {}))
});