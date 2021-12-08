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
            height: 426,
            header: true,
            cls: 'animation-dlg',
            buttons: ['ok', 'cancel']
        },
        initialize : function(options) {
            _.extend(this.options,  {
                title: this.textTitle
            }, options || {});
            this.template = [
                '<div class="box" style="width: 318px; margin: 0 auto">',
                    '<div class = "input-row" id = "animation-group"></div>',
                    '<div class = "input-row" id = "animation-level" ></div>',
                    '<div class = "input-row" id = "animation-list" style = "margin-top: 16px;  height: 216px;"></div>',
                    '<div class = "input-row" id = "animation-setpreview" style = "margin: 16px 0;"></div>',
                '</div>'
            ].join('');
            this.allEffects = Common.define.effectData.getEffectFullData();
            this.options.tpl = _.template(this.template)(this.options);
            this.api = this.options.api;
            this._state=[];
            this.handler =   this.options.handler;
            this.EffectGroupData = Common.define.effectData.getEffectGroupData();
            this.EffectGroupData.forEach(function (item) {item.displayValue = item.caption;});
            if (this.options.Effect != undefined) {
                this._state.activeEffect = this.options.Effect;
                var itemEffect= this.allEffects.findWhere({value: this._state.activeEffect});
                this._state.activeGroup = itemEffect.group;
                this._state.activeGroupValue = this.EffectGroupData.findWhere({id: this._state.activeGroup});
                this.activeLevel = itemEffect.level;
            }
            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var $window = this.getChild();

            var footer = $window.find('.footer');
            footer.css({"text-align": "center"});

            this.cmbGroup = new Common.UI.ComboBox({
                el      : $('#animation-group'),
                cls: 'input-group-nr',
                editable: false,
                style   : 'margin-top: 16px; width: 100%;',
                takeFocusOnClose: true,
                data    : this.EffectGroupData,
                value   : (this._state.activeEffect != undefined)?this._state.activeGroup:undefined
            });
            this.cmbGroup.on('selected', _.bind(this.onGroupSelect,this));

            this.cmbLevel = new Common.UI.ComboBox({
                el      : $('#animation-level'),
                cls: 'input-group-nr',
                editable: false,
                style   : 'margin-top: 16px; width: 100%;',
                takeFocusOnClose: true
            });
            this.cmbLevel.on('selected', _.bind(this.onLevelSelect,this));

            this.lstEffectList = new Common.UI.ListView({
                el      : $('#animation-list'),
                itemTemplate: _.template('<div id="<%= id %>" class="list-item" style=""><%= displayValue %></div>'),
                scroll  : true
            });
            this.lstEffectList.on('item:select', _.bind(this.onEffectListItem,this));

            this.chPreview = new  Common.UI.CheckBox({
                el      : $('#animation-setpreview'),
                labelText : this.textPreviewEffect
            });
            this.cmbGroup.selectRecord(this.cmbGroup.store.models[0]);
            this.onGroupSelect(undefined,this.cmbGroup.store.models[0]);

            this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        onGroupSelect: function (combo, record) {
            this._state.activeGroup = record.id;
            this._state.activeGroupValue = record.get('value');
            this.cmbLevel.store.reset(Common.define.effectData.getLevelEffect(record.id == 'menu-effect-group-path'));
            this.cmbLevel.selectRecord(this.cmbLevel.store.models[0]);
            this.onLevelSelect(undefined,this.cmbLevel.store.models[0]);
        },

        onLevelSelect: function (combo, record) {
            this.activeLevel = record.id;
            var arr = _.where(this.allEffects, {group: this._state.activeGroup, level: this.activeLevel });
            this.lstEffectList.store.reset(arr);
            this.lstEffectList.selectRecord(this.lstEffectList.store.models[0]);
        },

        onEffectListItem: function (lisvView, itemView, record){
            if (record) {
                this._state.activeEffect = record.get('value');
            }
        },

        onBtnClick: function (event)
        {
            this._handleInput(event.currentTarget.attributes['result'].value);
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