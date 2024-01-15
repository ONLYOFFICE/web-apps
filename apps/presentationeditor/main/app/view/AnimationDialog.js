/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
 *  AnimationDialog.js
 *
 *  Created by Olga Sharova on 29/11/21
 *  Copyright (c) 2021 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window'
], function () { 'use strict';
    PE.Views.AnimationDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 350,
            header: true,
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },
        initialize : function(options) {
            _.extend(this.options,  {
                title: this.textTitle
            }, options || {});
            this.template = [
                '<div class="box">',
                    '<div class = "input-row" id = "animation-group"></div>',
                    '<div class = "input-row" id = "animation-level" style = "margin-top: 16px; "></div>',
                    '<div class = "input-row" id = "animation-list" style = "margin-top: 16px;  height: 216px;"></div>',
                    // '<div class = "input-row" id = "animation-setpreview" style = "margin-top: 16px;"></div>',
                '</div>'
            ].join('');
            this.allEffects = Common.define.effectData.getEffectFullData();
            this.options.tpl = _.template(this.template)(this.options);
            this.api = this.options.api;
            this._state=[];
            this.handler =   this.options.handler;
            this.lockEmphasis = !!this.options.lockEmphasis;
            this.EffectGroupData = Common.define.effectData.getEffectGroupData();
            this._state.activeGroup = this.EffectGroupData[0].id;
            this._state.activeGroupValue = this.EffectGroupData[0].value;
            this.EffectGroupData.forEach(function (item) {item.displayValue = item.caption;});
            if ((this.options.activeEffect != undefined) && (this.options.activeEffect != AscFormat.ANIM_PRESET_NONE) && (this.options.activeEffect !== AscFormat.ANIM_PRESET_MULTIPLE)){
                this._state.activeEffect = this.options.activeEffect;
                this._state.activeGroupValue = this.options.groupValue;
                var group = _.findWhere(this.EffectGroupData, {value: this._state.activeGroupValue})
                this._state.activeGroup = group.id;
                var itemEffect = _.findWhere(this.allEffects, {
                    group: this._state.activeGroup,
                    value: this._state.activeEffect
                });
                if(itemEffect)
                    this.activeLevel = itemEffect.level;

            }
            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var $window = this.getChild();

            this.cmbGroup = new Common.UI.ComboBox({
                el      : $('#animation-group'),
                cls: 'input-group-nr',
                editable: false,
                style   : 'width: 100%;',
                menuStyle: 'min-width: 100%;',
                takeFocusOnClose: true,
                data    : this.EffectGroupData,
                value   : (this._state.activeEffect != undefined)?this._state.activeGroup:undefined
            });
            this.cmbGroup.on('selected', _.bind(this.onGroupSelect,this));

            this.cmbLevel = new Common.UI.ComboBox({
                el      : $('#animation-level'),
                cls: 'input-group-nr',
                editable: false,
                valueField: 'id',
                style   : 'width: 100%;',
                menuStyle: 'min-width: 100%;',
                takeFocusOnClose: true
            });
            this.cmbLevel.on('selected', _.bind(this.onLevelSelect,this));

            this.lstEffectList = new Common.UI.ListView({
                el      : $('#animation-list'),
                itemTemplate: _.template('<div id="<%= id %>" class="list-item" style=""><%= displayValue %></div>'),
                scrollAlwaysVisible: true,
                tabindex: 1
            });
            this.lstEffectList.on('item:select', _.bind(this.onEffectListItem,this));
            this.lstEffectList.on('entervalue', _.bind(this.onPrimary, this));

            // this.chPreview = new  Common.UI.CheckBox({
            //     el      : $('#animation-setpreview'),
            //     labelText : this.textPreviewEffect,
            //     value: !Common.Utils.InternalSettings.get("pe-animation-no-preview")
            // }).on('change', _.bind(this.onPreviewChange, this));

            this.cmbGroup.setValue(this._state.activeGroupValue);
            this.fillLevel();

            this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return [ this.cmbGroup, this.cmbLevel, this.lstEffectList/*, this.chPreview*/].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.lstEffectList;
        },

        onGroupSelect: function (combo, record) {
            this._state.activeGroup = record.id;
            this._state.activeGroupValue = record.value;
            this.activeLevel = undefined;
            this._state.activeEffect = undefined;
            this.fillLevel();
        },

        fillLevel: function ()
        {
            this.cmbLevel.store.reset(Common.define.effectData.getLevelEffect(this._state.activeGroup == 'menu-effect-group-path'));
            var item = (this.activeLevel)?this.cmbLevel.store.findWhere({id: this.activeLevel}):this.cmbLevel.store.at(0);
            this.cmbLevel.setValue(item.get('id'), item.get('displayValue'));
            this.activeLevel = item.get('id');
            this.fillEffect();
        },

        onLevelSelect: function (combo, record) {
            this.activeLevel = record.id;
            this._state.activeEffect = undefined;
            this.fillEffect();
        },

        fillEffect: function () {
            var arr = _.where(this.allEffects, {group: this._state.activeGroup, level: this.activeLevel }),
                lockEmphasis = this.lockEmphasis,
                currentIndex;
            arr = _.reject(arr, function (item) {
                return !!item.notsupported;
            });
            if (this._state.activeGroup==='menu-effect-group-emphasis') {
                arr.forEach(function(item, index){
                    if (lockEmphasis && !(item.value === AscFormat.EMPHASIS_GROW_SHRINK || item.value === AscFormat.EMPHASIS_SPIN ||
                                        item.value === AscFormat.EMPHASIS_TRANSPARENCY || item.value === AscFormat.EMPHASIS_PULSE ||
                                        item.value === AscFormat.EMPHASIS_TEETER || item.value === AscFormat.EMPHASIS_BLINK))
                        item.disabled = lockEmphasis;
                    else if (currentIndex===undefined)
                        currentIndex = index;
                });

            }
            this.lstEffectList.store.reset(arr);
            var  item = this.lstEffectList.store.findWhere({value: this._state.activeEffect});
            if(!item)
                item = this.lstEffectList.store.at(currentIndex || 0);
            this.lstEffectList.selectRecord(item);
            this.lstEffectList.scrollToRecord(item, true);
            this._state.activeEffect = item.get('value');
        },

        onEffectListItem: function (lisvView, itemView, record){
            if (record) {
                this._state.activeEffect = record.get('value');
            }
        },

        onPreviewChange: function (field, newValue, oldValue, eOpts) {
            Common.Utils.InternalSettings.set("pe-animation-no-preview", field.getValue()!=='checked');
        },

        onBtnClick: function (event)
        {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                this.options.handler.call(this, state, this._state);
            }

            this.close();
        },

        textTitle: 'More Effects',
        textPreviewEffect: 'Preview Effect'

    }, PE.Views.AnimationDialog || {}));
});