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
 *
 *  FormatRulesManagerDlg.js
 *
 *  Created on 14.04.2020
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/FormatRulesManagerDlg.template',
    'common/main/lib/view/AdvancedSettingsWindow',
], function (contentTemplate) {
    'use strict';

    SSE.Views = SSE.Views || {};

    var _CustomItem = Common.UI.DataViewItem.extend({
        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            var me = this;

            me.template = me.options.template || me.template;

            me.listenTo(me.model, 'change:name', function() {
                me.render();
                me.trigger('change', me, me.model);
            });
            me.listenTo(me.model, 'change:lock', function() {
                me.render();
                me.trigger('change', me, me.model);
            });
            me.listenTo(me.model, 'change:tip', function() {
                var el = me.$el || $(me.el),
                    tip = el.data('bs.tooltip');
                if (tip) {
                    var zIndex = tip.options.zIndex;
                    el.removeData('bs.tooltip');
                    el.tooltip({
                        title       : me.model.get('tip'),
                        placement   : 'cursor',
                        zIndex      : zIndex
                    });
                }
            });
            me.listenTo(me.model, 'change:selected', function() {
                var el = me.$el || $(me.el);
                el.toggleClass('selected', me.model.get('selected') && me.model.get('allowSelected'));
                me.onSelectChange(me.model, me.model.get('selected') && me.model.get('allowSelected'));
            });
            me.listenTo(me.model, 'remove', me.remove);
        }
    });

    SSE.Views.FormatRulesManagerDlg =  Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'FormatRulesManagerDlg',
            separator: false,
            contentWidth: 560
        },

        initialize: function (options) {
            var me = this;
            _.extend(this.options, {
                title: this.txtTitle,
                contentStyle: 'padding: 0;',
                contentTemplate: _.template(contentTemplate)({scope: this})
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.props      = options.props;
            this.langId      = options.langId;
            this.rules     = [];
            this.rulesStores = {};
            this.rulesDeleted = [];
            this.listSettings = {data: [], start: 0, end: 0, min: 0, max: 0};
            this.locked     = options.locked || false;
            this.userTooltip = true;
            this.wrapEvents = {
                onLockCFManager: _.bind(this.onLockCFManager, this),
                onUnLockCFManager: _.bind(this.onUnLockCFManager, this),
                onLockCFRule: _.bind(this.onLockCFRule, this),
                onUnLockCFRule: _.bind(this.onUnLockCFRule, this)
            };
            this.nLastScroll = -1000;
            this.itemHeight = 30;
            this.previewListHeight = 203;
            this.maxItemsCount = parseInt(this.previewListHeight/this.itemHeight);
            this._keydowncounter = 0;
            this._keydownTimer = undefined;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.cmbScope = new Common.UI.ComboBox({
                el          : $('#format-manager-combo-scope'),
                menuStyle   : 'min-width: 100%;max-height: 211px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [],
                takeFocusOnClose: true
            }).on('selected', function(combo, record) {
                me.refreshRuleList(record);
            });

            this.rulesList = new Common.UI.ListView({
                el: $('#id-preview-data', this.$window),
                store: new Common.UI.DataViewStore(),
                emptyText: '',
                headers: [
                    {name: this.textRules, width: 198},
                    {name: this.textApply, width: 196},
                    {name: this.textFormat, width: 130}
                ],
                isRTL: true,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div class="list-item" style="width: 100%;display:inline-block;" id="format-manager-item-<%= ruleIndex %>">',
                        '<div style="width:197px;padding-<% if (Common.UI.isRTL()) { %>left<% } else {%>right<% } %>: 10px;display: inline-block;vertical-align: middle;overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><%= Common.Utils.String.htmlEncode(name) %></div>',
                        '<div style="width:197px;padding-<% if (Common.UI.isRTL()) { %>left<% } else {%>right<% } %>: 10px;display: inline-block;vertical-align: middle;"><div id="format-manager-txt-rule-<%= ruleIndex %>" style=""></div></div>',
                        '<div style="width:128px;display: inline-block;vertical-align: middle;"><div id="format-manager-item-preview-<%= ruleIndex %>" style="height:22px;background-color: #ffffff;"></div></div>',
                        '<% if (lock) { %>',
                            '<div class="lock-user"><%=Common.Utils.String.htmlEncode(lockuser)%></div>',
                        '<% } %>',
                    '</div>'
                ].join('')),
                allowScrollbar: false,
                tabindex: 1
            });
            this.rulesList.moveKeys = [];
            this.rulesList.createNewItem = function(record) {
                return new _CustomItem({
                    template: this.itemTemplate,
                    model: record
                });
            };
            this.rulesList.on('item:select', _.bind(this.onSelectRule, this))
                            .on('item:keydown', _.bind(this.onKeyDown, this))
                            .on('item:keyup', _.bind(this.onKeyUp, this))
                            .on('item:dblclick', _.bind(this.onEditRule, this,true))
                            .on('entervalue', _.bind(function (e) {!!e.store.length && this.onEditRule(true);},this));

            this.btnNew = new Common.UI.Button({
                el: $('#format-manager-btn-new')
            });
            this.btnNew.on('click', _.bind(this.onEditRule, this, false));

            this.btnEdit = new Common.UI.Button({
                el: $('#format-manager-btn-edit')
            });
            this.btnEdit.on('click', _.bind(this.onEditRule, this, true));

            this.btnDelete = new Common.UI.Button({
                el: $('#format-manager-btn-delete')
            });
            this.btnDelete.on('click', _.bind(this.onDeleteRule, this));

            this.btnUp = new Common.UI.Button({
                parentEl: $('#format-manager-btn-up'),
                cls: 'btn-toolbar bg-white',
                iconCls: 'caret-up',
                scaling: false,
                hint: this.textUp
            });
            this.btnUp.on('click', _.bind(this.onMoveClick, this, true));

            this.btnDown = new Common.UI.Button({
                parentEl: $('#format-manager-btn-down'),
                cls: 'btn-toolbar bg-white',
                iconCls: 'caret-down',
                scaling: false,
                hint: this.textDown
            });
            this.btnDown.on('click', _.bind(this.onMoveClick, this, false));

            this.previewPanel = this.$window.find('#id-preview-data');
            this.previewParent = this.previewPanel.parent();
            this.previewScrolled = this.$window.find('#id-preview');
            this.previewInner = this.previewScrolled.find('> div:first-child');

            this.previewPanel.css('height', this.previewListHeight + 'px');
            this.previewScrolled.css('height', this.previewListHeight + 'px');

            this.afterRender();
        },

        getDefaultFocusableComponent: function () {
            return this.cmbScope;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        _setDefaults: function (props) {
            Common.UI.FocusManager.add(this, this.cmbScope);
            Common.UI.FocusManager.add(this, this.btnNew);
            Common.UI.FocusManager.add(this, this.btnEdit);
            Common.UI.FocusManager.add(this, this.btnUp);
            Common.UI.FocusManager.add(this, this.btnDown);
            Common.UI.FocusManager.add(this, this.btnDelete);
            Common.UI.FocusManager.add(this, this.rulesList);

            this.rulesList.on('item:add', _.bind(this.addControls, this));
            this.rulesList.on('item:change', _.bind(this.addControls, this));
            this.currentSheet = this.api.asc_getActiveWorksheetIndex();
            this.refreshScopeList();
            this.refreshRuleList(this.cmbScope.getSelectedRecord());

            this.api.asc_registerCallback('asc_onLockCFManager', this.wrapEvents.onLockCFManager);
            this.api.asc_registerCallback('asc_onUnLockCFManager', this.wrapEvents.onUnLockCFManager);
            this.api.asc_registerCallback('asc_onLockCFRule', this.wrapEvents.onLockCFRule);
            this.api.asc_registerCallback('asc_onUnLockCFRule', this.wrapEvents.onUnLockCFRule);

            Common.UI.FocusManager.add(this, this.getFooterButtons());
        },

        refreshScopeList: function() {
            var wc = this.api.asc_getWorksheetsCount(), i = -1;
            var items = [
                { value: Asc.c_oAscSelectionForCFType.selection, displayValue: this.textSelection, sheetIndex: -1 },
                { value: Asc.c_oAscSelectionForCFType.worksheet, displayValue: this.textThisSheet, sheetIndex: -1 },
                { value: Asc.c_oAscSelectionForCFType.table, displayValue: this.textThisTable, sheetIndex: -1 },
                { value: Asc.c_oAscSelectionForCFType.pivot, displayValue: this.textThisPivot, sheetIndex: -1 }
            ];
            // if (wc>1) {
            //     while (++i < wc) {
            //         if (!this.api.asc_isWorksheetHidden(i) && i!==this.currentSheet) {
            //             items.push({
            //                 displayValue:this.api.asc_getWorksheetName(i),
            //                 value: Asc.c_oAscSelectionForCFType.worksheet,
            //                 sheetIndex: i
            //             });
            //         }
            //     }
            // }
            this.cmbScope.setData(items);
            this.cmbScope.setValue(Asc.c_oAscSelectionForCFType.selection);
        },

        refreshRuleList: function(scope) {
            this.rules = [];

            var sheetIndex = (scope.sheetIndex>-1) ? scope.sheetIndex : this.currentSheet;
            var ruleStore = this.rulesStores[sheetIndex];
            if (!ruleStore) {
                ruleStore = [];

                var obj = this.api.asc_getCF(Asc.c_oAscSelectionForCFType.worksheet, sheetIndex);
                var rules = obj[0];
                this.currentRange = obj[1];
                if (rules) {
                    for (var i=0; i<rules.length; i++) {
                        var rule = rules[i],
                            name = this.getRuleName(rule),
                            location = rule.asc_getLocation(),
                            idlock = rule.asc_getIsLock();
                        ruleStore.push({
                            ruleIndex: i, // connect store and list with controls. is not changed
                            ruleId: rule.asc_getId(),
                            name: name,
                            tip: name,
                            range: location[1],
                            activeSheet: location[0],
                            priority: rule.asc_getPriority(), // priority of the rule, is changed when move or when new rule is added
                            ruleChanged: false, // true if was edited in FormatRulesEditDlg or was created, need to send this rule to sdk if true
                            props: rule,
                            lock: (idlock!==null && idlock!==undefined),
                            lockuser: (idlock) ? (this.isUserVisible(idlock) ? this.getUserName(idlock) : this.lockText) : this.guestText
                        });
                    }
                }
                this.rulesStores[sheetIndex] = ruleStore;
            }
            this.nLastScroll = -1000;
            this.updateRulesCount(true);

            if (!this.scrollerY)
                this.scrollerY = new Common.UI.Scroller({
                    el: this.previewScrolled,
                    minScrollbarLength: 20,
                    wheelSpeed: 20,
                    scrollYStyle: this.rulesList.scrollYStyle,
                    onChange: _.bind(function(){
                        if (this.scrollerY) {
                            this._preventUpdateScroll = true;
                            this.onScrollEnd();
                            this._preventUpdateScroll = false;
                            this.previewParent.height(this.previewListHeight);
                            this.previewParent.css({top: this.scrollerY.getScrollTop()});
                        }
                    }, this)
                });
            this.scrollerY.update();
            this.scrollerY.scrollTop(0);
            if (this.listSettings.data.length>0) {
                this.listSettings.current = 0;
                this.rulesList.selectByIndex(0);
            }
            this.updateButtons();
        },

        onScrollEnd: function(){
            if(this.scrollerY.getScrollTop() === this.nLastScroll){
                return;
            }

            this.nLastScroll = this.scrollerY.getScrollTop();

            var startPos = this.scrollerY.getScrollTop(),
                start = Math.floor(startPos/this.itemHeight+0.5),
                end = start + this.maxItemsCount - 1;
            if (end>this.listSettings.data.length-1) {
                end = this.listSettings.data.length-1;
                start = Math.max(0, end - this.maxItemsCount + 1);
            }
            this.previewDataBlock(start, end);
        },

        previewDataBlock: function(start, end) {
            this.listSettings.start = start;
            this.listSettings.end = end;
            var ruleStore = this.rulesStores[this.currentSheet],
                arr = [];
            this.rulesList.store.remove(this.rulesList.store.models);
            for (var i=start; i<=end; i++) {
                arr.push(ruleStore[this.listSettings.data[i]]);
            }
            this.rulesList.store.add(arr);
            if (this.listSettings.current<=this.listSettings.end)
                this.rulesList.selectByIndex(this.listSettings.current-this.listSettings.start);
            if (!this._preventUpdateScroll) {
                this.scrollerY.update({
                    minScrollbarLength: 20,
                    wheelSpeed: 20
                });
                this.scrollerY.scrollTop(this.listSettings.start * this.itemHeight);
            }
            if (this.userTooltip===true && this.rulesList.cmpEl.find('.lock-user').length>0)
                this.rulesList.cmpEl.on('mouseover',  _.bind(this.onMouseOverLock, this)).on('mouseout',  _.bind(this.onMouseOutLock, this));
        },

        onMouseOverLock: function (evt, el, opt) {
            if (this.userTooltip===true && $(evt.target).hasClass('lock-user')) {
                var me = this,
                    tipdata = $(evt.target).tooltip({title: this.tipIsLocked,trigger:'manual'}).data('bs.tooltip');

                this.userTooltip = tipdata.tip();
                this.userTooltip.css('z-index', parseInt(this.$window.css('z-index')) + 10);
                tipdata.show();

                setTimeout(function() { me.userTipHide(); }, 5000);
            }
        },

        userTipHide: function () {
            if (typeof this.userTooltip == 'object') {
                this.userTooltip.remove();
                this.userTooltip = undefined;
                this.rulesList.cmpEl.off('mouseover').off('mouseout');
            }
        },

        onMouseOutLock: function (evt, el, opt) {
            if (typeof this.userTooltip == 'object') this.userTipHide();
        },

        getRuleName: function(rule) {
            var name = '';
            switch (rule.asc_getType()) {
                case Asc.c_oAscCFType.aboveAverage:
                    name = this.textAbove;
                    var above = rule.asc_getAboveAverage(),
                        eq = rule.asc_getEqualAverage(),
                        stddev = rule.asc_getStdDev();
                    subtype = (above) ? 0 : 1;
                    if (eq)
                        subtype += 2;
                    else if (stddev) {
                        subtype += (2 + stddev*2);
                    }
                    switch (subtype) {
                        case 0:
                            name = this.textAbove;
                            break;
                        case 1:
                            name = this.textBelow;
                            break;
                        case 2:
                            name = this.textEqAbove;
                            break;
                        case 3:
                            name = this.textEqBelow;
                            break;
                        case 4:
                            name = this.text1Above;
                            break;
                        case 5:
                            name = this.text1Below;
                            break;
                        case 6:
                            name = this.text2Above;
                            break;
                        case 7:
                            name = this.text2Below;
                            break;
                        case 8:
                            name = this.text3Above;
                            break;
                        case 9:
                            name = this.text3Below;
                            break;
                    }
                    break;
                case Asc.c_oAscCFType.beginsWith:
                    name = this.textBeginsWith + ' ' + (rule.asc_getContainsText() || '');
                    break;
                case Asc.c_oAscCFType.cellIs:
                    name = this.textCellValue;
                    var subtype = rule.asc_getOperator(),
                        op;
                    switch (subtype) {
                        case Asc.c_oAscCFOperator.greaterThan:
                            op = '>';
                            name = name + ' ' + op + ' ' + (rule.asc_getValue1() || '');
                            break;
                        case Asc.c_oAscCFOperator.greaterThanOrEqual:
                            op = '>=';
                            name = name + ' ' + op + ' ' + (rule.asc_getValue1() || '');
                            break;
                        case Asc.c_oAscCFOperator.lessThan:
                            op = '<';
                            name = name + ' ' + op + ' ' + (rule.asc_getValue1() || '');
                            break;
                        case Asc.c_oAscCFOperator.lessThanOrEqual:
                            op = '<=';
                            name = name + ' ' + op + ' ' + (rule.asc_getValue1() || '');
                            break;
                        case Asc.c_oAscCFOperator.equal:
                            op = '=';
                            name = name + ' ' + op + ' ' + (rule.asc_getValue1() || '');
                            break;
                        case Asc.c_oAscCFOperator.notEqual:
                            op = '<>';
                            name = name + ' ' + op + ' ' + (rule.asc_getValue1() || '');
                            break;
                        case Asc.c_oAscCFOperator.between:
                            name = name + ' ' + Common.Utils.String.format(this.textBetween, (rule.asc_getValue1() || ''), (rule.asc_getValue2() || ''));
                            break;
                        case Asc.c_oAscCFOperator.notBetween:
                            name = name + ' ' + Common.Utils.String.format(this.textNotBetween, (rule.asc_getValue1() || ''), (rule.asc_getValue2() || ''));
                            break;
                    }
                    break;
                case Asc.c_oAscCFType.colorScale:
                    name = this.textColorScale;
                    break;
                case Asc.c_oAscCFType.containsBlanks:
                    name = this.textContainsBlank;
                    break;
                case Asc.c_oAscCFType.containsErrors:
                    name = this.textContainsError;
                    break;
                case Asc.c_oAscCFType.containsText:
                    name = this.textContains + ' ' + (rule.asc_getContainsText() || '');
                    break;
                case Asc.c_oAscCFType.dataBar:
                    name = Common.define.conditionalData.textDataBar;
                    break;
                case Asc.c_oAscCFType.duplicateValues:
                    name = this.textDuplicate;
                    break;
                case Asc.c_oAscCFType.expression:
                    name = Common.define.conditionalData.textFormula + ': ' + (rule.asc_getValue1() || '');
                    break;
                case Asc.c_oAscCFType.iconSet:
                    name = this.textIconSet;
                    break;
                case Asc.c_oAscCFType.notContainsBlanks:
                    name = this.textNotContainsBlank;
                    break;
                case Asc.c_oAscCFType.notContainsErrors:
                    name = this.textNotContainsError;
                    break;
                case Asc.c_oAscCFType.notContainsText:
                    name = this.textNotContains + ' ' + (rule.asc_getContainsText() || '');
                    break;
                case Asc.c_oAscCFType.timePeriod:
                    var subtype = rule.asc_getTimePeriod();
                    switch (subtype) {
                        case Asc.c_oAscTimePeriod.yesterday:
                            name = Common.define.conditionalData.textYesterday;
                            break;
                        case Asc.c_oAscTimePeriod.today:
                            name = Common.define.conditionalData.textToday;
                            break;
                        case Asc.c_oAscTimePeriod.tomorrow:
                            name = Common.define.conditionalData.textTomorrow;
                            break;
                        case Asc.c_oAscTimePeriod.last7Days:
                            name = Common.define.conditionalData.textLast7days;
                            break;
                        case Asc.c_oAscTimePeriod.lastWeek:
                            name = Common.define.conditionalData.textLastWeek;
                            break;
                        case Asc.c_oAscTimePeriod.thisWeek:
                            name = Common.define.conditionalData.textThisWeek;
                            break;
                        case Asc.c_oAscTimePeriod.nextWeek:
                            name = Common.define.conditionalData.textNextWeek;
                            break;
                        case Asc.c_oAscTimePeriod.lastMonth:
                            name = Common.define.conditionalData.textLastMonth;
                            break;
                        case Asc.c_oAscTimePeriod.thisMonth:
                            name = Common.define.conditionalData.textThisMonth;
                            break;
                        case Asc.c_oAscTimePeriod.nextMonth:
                            name = Common.define.conditionalData.textNextMonth;
                            break;
                    }
                    break;
                case Asc.c_oAscCFType.top10:
                    name = rule.asc_getBottom() ? Common.define.conditionalData.textBottom : Common.define.conditionalData.textTop;
                    name = name + ' ' + (rule.asc_getRank()) + (rule.asc_getPercent() ? '%' : '');
                    break;
                case Asc.c_oAscCFType.uniqueValues:
                    name = this.textUnique;
                    break;
                case Asc.c_oAscCFType.endsWith:
                    name = this.textEnds + ' ' + (rule.asc_getContainsText() || '');
                    break;
            }
            return name;
        },

        addControls: function(listView, itemView, item) {
            if (!item) return;

            var me = this,
                i = item.get('ruleIndex'),
                cmpEl = this.rulesList.cmpEl.find('#format-manager-item-' + i);

            if (!this.rules[i])
                this.rules[i] = {};
            var rule = this.rules[i];
            var input = new Common.UI.InputFieldBtn({
                el          : cmpEl.find('#format-manager-txt-rule-' + i),
                name        : 'range',
                style       : 'width: 100%;',
                btnHint     : this.textSelectData,
                allowBlank  : true,
                disabled    : !item.get('activeSheet') || item.get('lock'),
                validateOnChange: true
            }).on('changed:after', function(input, newValue, oldValue, e) {
                if (rule.dataRangeValid !== newValue) {
                    if (me.isRangeValid(newValue)) {
                        rule.dataRangeValid = newValue;
                        item.set('ruleChanged', true);
                        item.get('props').asc_setLocation(rule.dataRangeValid);
                        item.set('range', rule.dataRangeValid);
                        me.rulesStores[me.currentSheet][item.get('indexInStore')].ruleChanged = true;
                        me.rulesStores[me.currentSheet][item.get('indexInStore')].range = rule.dataRangeValid;
                    } else
                        rule.txtDataRange.setValue(rule.dataRangeValid);
                }

            }).on('button:click', _.bind(this.onSelectData, this, rule, item));
            input.cmpEl.on('dblclick', 'input', function (e){e.stopPropagation();});
            Common.UI.FocusManager.add(this, input);

            var val = item.get('range');
            (val!==null) && input.setValue(val);
            rule.txtDataRange = input;
            rule.dataRangeValid = val;
            rule.previewDiv = 'format-manager-item-preview-' + i;
            me.drawRulePreview(item);

            cmpEl.on('mousedown', 'input', function(){
                me.rulesList.selectRecord(item);
            });
        },

        drawRulePreview: function(rule) {
            var props = rule.get('props'),
                type = props.asc_getType(),
                text = '';

            if (type == Asc.c_oAscCFType.containsText || type == Asc.c_oAscCFType.notContainsText || type == Asc.c_oAscCFType.beginsWith ||
                type == Asc.c_oAscCFType.endsWith || type == Asc.c_oAscCFType.containsBlanks || type == Asc.c_oAscCFType.notContainsBlanks ||
                type == Asc.c_oAscCFType.duplicateValues || type == Asc.c_oAscCFType.uniqueValues ||
                type == Asc.c_oAscCFType.containsErrors || type == Asc.c_oAscCFType.notContainsErrors ||
                type == Asc.c_oAscCFType.timePeriod || type == Asc.c_oAscCFType.aboveAverage ||
                type == Asc.c_oAscCFType.top10 || type == Asc.c_oAscCFType.cellIs || type == Asc.c_oAscCFType.expression) {
                text = props.asc_getDxf() ? Common.define.conditionalData.exampleText : Common.define.conditionalData.noFormatText;
            }
            props.asc_getPreview(this.rules[rule.get('ruleIndex')].previewDiv, text);
        },

        isRangeValid: function(range) {
            return (Asc.c_oAscError.ID.No === this.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.ConditionalFormattingRule, range, true));
        },

        onSelectData: function(rule, item) {
            var me = this;
            if (me.api) {
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        if (me.isRangeValid(dlg.getSettings())) {
                            rule.dataRangeValid = dlg.getSettings();
                            item.set('ruleChanged', true);
                            item.get('props').asc_setLocation(rule.dataRangeValid);
                            item.set('range', rule.dataRangeValid);
                            me.rulesStores[me.currentSheet][item.get('indexInStore')].ruleChanged = true;
                            me.rulesStores[me.currentSheet][item.get('indexInStore')].range = rule.dataRangeValid;
                        }
                        rule.txtDataRange.setValue(rule.dataRangeValid);
                    }
                };

                var win = new SSE.Views.CellRangeDialog({
                    handler: handlerDlg
                }).on('close', function() {
                    me.show();
                });

                var xy = me.$window.offset();
                me.hide();
                win.show(xy.left + 160, xy.top + 125);
                win.setSettings({
                    api     : me.api,
                    range   : !_.isEmpty(rule.txtDataRange.getValue()) ? rule.txtDataRange.getValue() : rule.dataRangeValid,
                    type    : Asc.c_oAscSelectionDialogType.ConditionalFormattingRule,
                    validation: function() {return true;}
                });
            }
        },

        onEditRule: function (isEdit) {
            var me = this,
                xy = me.$window.offset(),
                rec = this.rulesList.getSelectedRec(),
                previewRec;

            var win = new SSE.Views.FormatRulesEditDlg({
                api: me.api,
                props   : (isEdit && rec) ? rec.get('props') : null,
                isEdit  : isEdit,
                langId  : me.langId,
                handler : function(result, settings) {
                    if (result == 'ok' && settings) {
                        var name = me.getRuleName(settings);
                        if (isEdit) {
                            var item = me.rulesStores[me.currentSheet][rec.get('indexInStore')];
                            item.name = item.tip = name;
                            item.ruleChanged = true;
                            item.props = settings;
                            rec.set('name', name);
                            rec.set('tip', name);
                            rec.set('ruleChanged', true);
                            rec.set('props', settings);
                            previewRec = rec;
                        } else {
                            settings.asc_setLocation(me.currentRange);
                            var ruleStore = me.rulesStores[me.currentSheet];
                            previewRec = ruleStore.unshift({
                                ruleIndex: me.rules.length,
                                name: name,
                                tip: name,
                                range: me.currentRange,
                                activeSheet: true,
                                ruleChanged: true,
                                priority: 1,
                                props: settings,
                                lock: false,
                                lockuser: ''
                            });
                            me.updateRulesPriority(ruleStore);
                        }
                    }
                }
            }).on('close', function() {
                me.show();
                if (isEdit) {
                    previewRec && me.drawRulePreview(previewRec);
                } else if (previewRec) {
                    me.cmbScope.setValue(Asc.c_oAscSelectionForCFType.selection);
                    me.refreshRuleList(me.cmbScope.getSelectedRecord());
                }
            });

            me.hide();
            win.show();
        },

        onDeleteRule: function () {
            var store = this.rulesList.store,
                rec = this.rulesList.getSelectedRec();
            if (rec) {
                var id = rec.get('ruleId');
                (id!==undefined) && this.rulesDeleted.push(id);
                this.rules[rec.get('ruleIndex')] = undefined;
                this.rulesStores[this.currentSheet].splice(rec.get('indexInStore'), 1);
                var index = store.indexOf(rec);
                this.updateRulesCount(true);
                var start = this.listSettings.start;
                var end = start + this.maxItemsCount - 1;
                if (end>this.listSettings.data.length-1) {
                    end = this.listSettings.data.length-1;
                    start = Math.max(0, end - this.maxItemsCount + 1);
                }
                this.previewDataBlock(start, end);
                (this.listSettings.data.length>0) && this.rulesList.selectByIndex(Math.min(index, store.length-1));
            }
            this.updateButtons();
        },

        onMoveClick: function(up) {
            var ruleStore = this.rulesStores[this.currentSheet],
                rec = this.rulesList.getSelectedRec(),
                selectedIndex = this.rulesList.store.indexOf(rec);
            if (rec) {
                var index = rec.get('indexInStore'),
                    newindex = up ? this.getPrevRuleIndex(index) : this.getNextRuleIndex(index),
                    newrec = ruleStore[newindex],
                    prioritynew = newrec.priority;
                rec = ruleStore[index];
                newrec.priority = rec.priority;
                rec.priority = prioritynew;
                ruleStore.splice(newindex, 1, rec);
                ruleStore.splice(index, 1, newrec);

                var start = selectedIndex===0 && up ? this.listSettings.start-1 : (!up && selectedIndex>=this.maxItemsCount-1 ? this.listSettings.start+1 : this.listSettings.start);
                var end = start + this.maxItemsCount - 1;
                if (end>this.listSettings.data.length-1) {
                    end = this.listSettings.data.length-1;
                    start = Math.max(0, end - this.maxItemsCount + 1);
                }
                up ? this.listSettings.current-- : this.listSettings.current++;
                this.updateRulesCount();
                this.previewDataBlock(start, end);
            }
            this.updateMoveButtons();
        },

        onSelectRule: function(lisvView, itemView, record) {
            var idx = _.indexOf(lisvView.store.models, record);
            this.listSettings.current = this.listSettings.start + idx;
            this.userTipHide();
            this.updateButtons();
        },

        updateButtons: function() {
            var rec = this.rulesList.getSelectedRec(),
                lock = rec ? rec.get('lock') : false;
            this.btnNew.setDisabled(this.locked);
            this.btnDelete.setDisabled(this.listSettings.data.length<1 || lock);
            this.btnEdit.setDisabled(this.listSettings.data.length<1 || lock);
            this.updateMoveButtons();
        },

        updateMoveButtons: function() {
            var rec = this.rulesList.getSelectedRec(),
                index = rec ? this.rulesList.store.indexOf(rec) : -1;
            this.btnUp.setDisabled(index+this.listSettings.start<1 || this.locked);
            this.btnDown.setDisabled(index<0 || index+this.listSettings.start>=this.listSettings.data.length-1 || this.locked);
        },

        getPrevRuleIndex: function(index) {
            if (this.cmbScope.getValue() === Asc.c_oAscSelectionForCFType.worksheet) {
                return Math.max(0, index-1);
            } else {
                var ruleStore = this.rulesStores[this.currentSheet];
                for (var i=index-1; i>=this.listSettings.min; i--) {
                    if (ruleStore[i].cls!=='hidden') {
                        return i;
                    }
                }
                return this.listSettings.min;
            }
        },

        getNextRuleIndex: function(index) {
            if (this.cmbScope.getValue() == Asc.c_oAscSelectionForCFType.worksheet) {
                return Math.min(this.listSettings.data.length-1, index+1);
            } else {
                var ruleStore = this.rulesStores[this.currentSheet];
                for (var i=index+1; i<=this.listSettings.max; i++) {
                    if (ruleStore[i].cls!=='hidden') {
                        return i;
                    }
                }
                return this.listSettings.max;
            }
        },

        updateRulesCount: function(updateData) {
            var ruleStore = this.rulesStores[this.currentSheet],
                scope = this.cmbScope.getSelectedRecord(),
                me = this;
            updateData && (this.listSettings.data = []);
            this.listSettings.min = -1;
            this.listSettings.max = 0;

            ruleStore.forEach(function(item, index){
                var hidden = scope.value!==Asc.c_oAscSelectionForCFType.worksheet && !item.props.asc_checkScope(scope.value);
                item.cls = hidden ? 'hidden' : undefined;
                item.indexInStore = index;
                if (!hidden) {
                    updateData && me.listSettings.data.push(index);
                    me.listSettings.max = index;
                    (me.listSettings.min<0) && (me.listSettings.min=index);
                }
            });
            updateData && this.previewInner.height(this.listSettings.data.length*this.itemHeight + this.rulesList.headerHeight);
        },

        updateRulesPriority: function(store) {
            for (var i=1; i<store.length; i++) {
                store[i].priority++;
            }
        },

        getSettings: function() {
            var sheets = [];
            for (var sheet in this.rulesStores) {
                if (this.rulesStores.hasOwnProperty(sheet)) {
                    var store = this.rulesStores[sheet];
                    var arr = [];
                    store && store.forEach(function(item) {
                        var props = item.props;
                        if (item.priority!==props.asc_getPriority()) {
                            props.asc_setPriority(item.priority);
                            item.ruleChanged = true;
                        }
                        if (item.ruleChanged)
                            arr.push(props);
                    });
                    (arr.length>0) && (sheets[sheet] = arr);
                }
            }
            return {rules: sheets, deleted: this.rulesDeleted};
        },

        onKeyDown: function (list, record, e) {
            if (e.keyCode==Common.UI.Keys.UP || e.keyCode==Common.UI.Keys.DOWN) {
                e.preventDefault();
                e.stopPropagation();
            }

            if (this._keydowncounter===0) {
                this._keydowncounter++;
                this.onKeyEvent(list, e);
            } else {
                if (!this._keyEventBusy) {
                    this._keyEventBusy = true;
                    var me = this;
                    this._keydownTimer = setTimeout(function() {
                        me.onKeyEvent(list, e, true);
                    }, 1);
                }
            }
        },

        onKeyUp: function (list, e) {
            this._keydowncounter = 0;
            if (this._keydownTimer) {
                clearTimeout(this._keydownTimer);
                this._keydownTimer = undefined;
            }
            this._keyEventBusy = undefined;
        },

        onKeyEvent: function (list, e, repeat) {
            if (e.keyCode==Common.UI.Keys.DELETE && !this.btnDelete.isDisabled() && !/form-control/.test(e.target.className)) {
                this.onDeleteRule();
            } else if (e.keyCode==Common.UI.Keys.UP || e.keyCode==Common.UI.Keys.DOWN) {
                var rec = list.getSelectedRec();
                var idx = _.indexOf(list.store.models, rec);
                if (idx>=0) {
                    if (e.keyCode==Common.UI.Keys.UP) {
                        if (idx>0) {
                            idx--;
                            this.listSettings.current--;
                            list.selectByIndex(idx);
                        } else if (this.listSettings.start>0) {
                            this.listSettings.current--;
                            this.previewDataBlock(this.listSettings.start-1, this.listSettings.end-1);
                        }
                    }
                    if (e.keyCode==Common.UI.Keys.DOWN) {
                        if (idx<list.store.length-1) {
                            idx++;
                            this.listSettings.current++;
                            list.selectByIndex(idx);
                        } else if (this.listSettings.end<this.listSettings.data.length-1) {
                            this.listSettings.current++;
                            this.previewDataBlock(this.listSettings.start+1, this.listSettings.end+1);
                        }
                    }
                }
            }
            var me = this;
            if (repeat)
                this._keydownTimer = setTimeout(function() {
                    me.onKeyEvent(list, e, true);
                }, 1);
        },

        close: function () {
            this.userTipHide();
            this.api.asc_unregisterCallback('asc_onLockCFManager', this.wrapEvents.onLockCFManager);
            this.api.asc_unregisterCallback('asc_onUnLockCFManager', this.wrapEvents.onUnLockCFManager);
            this.api.asc_unregisterCallback('asc_onLockCFRule', this.wrapEvents.onLockCFRule);
            this.api.asc_unregisterCallback('asc_onUnLockCFRule', this.wrapEvents.onUnLockCFRule);
            this._keydownTimer && clearTimeout(this._keydownTimer);
            Common.UI.Window.prototype.close.call(this);
        },

        onLockCFManager: function(index) {
            if (this.currentSheet !== index) return;
            this.locked = true;
            this.updateButtons();
            if (this.userTooltip===true && this.rulesList.cmpEl.find('.lock-user').length>0)
                this.rulesList.cmpEl.on('mouseover',  _.bind(this.onMouseOverLock, this)).on('mouseout',  _.bind(this.onMouseOutLock, this));
        },

        onUnLockCFManager: function(index) {
            if (this.currentSheet !== index) return;
            this.locked = false;
            this.updateButtons();
        },

        onLockCFRule: function(index, ruleId, userId) {
            if (this.currentSheet !== index) return;

            var ruleStore = this.rulesStores[this.currentSheet],
                rec = _.findWhere(ruleStore, {ruleId: ruleId});
            if (rec) {
                rec.lockuser = (userId) ? (this.isUserVisible(userId) ? this.getUserName(userId) : this.lockText) : this.guestText;
                rec.lock = true;
            }

            rec = this.rulesList.store.findWhere({ruleId: ruleId});
            if (rec) {
                rec.set('lockuser', ruleStore[rec.get('indexInStore')].lockuser);
                rec.set('lock', true);
                this.updateButtons();
            }
            if (this.userTooltip===true && this.rulesList.cmpEl.find('.lock-user').length>0)
                this.rulesList.cmpEl.on('mouseover',  _.bind(this.onMouseOverLock, this)).on('mouseout',  _.bind(this.onMouseOutLock, this));
        },

        onUnLockCFRule: function(index, ruleId) {
            if (this.currentSheet !== index) return;

            var ruleStore = this.rulesStores[this.currentSheet],
                rec = _.findWhere(ruleStore, {ruleId: ruleId});
            if (rec) {
                rec.lockuser = '';
                rec.lock = false;
            }

            rec = this.rulesList.store.findWhere({ruleId: ruleId});
            if (rec) {
                rec.set('lockuser', '');
                rec.set('lock', false);
                this.updateButtons();
            }
        },

        getUserName: function(id){
            var usersStore = SSE.getCollection('Common.Collections.Users');
            if (usersStore){
                var rec = usersStore.findUser(id);
                if (rec)
                    return AscCommon.UserInfoParser.getParsedName(rec.get('username'));
            }
            return this.guestText;
        },

        isUserVisible: function(id){
            var usersStore = SSE.getCollection('Common.Collections.Users');
            if (usersStore){
                var rec = usersStore.findUser(id);
                if (rec)
                    return !rec.get('hidden');
            }
            return true;
        },

        txtTitle: 'Conditional Formatting',
        textNew: 'New',
        textEdit: 'Edit',
        textDelete: 'Delete',
        textUp: 'Move rule up',
        textDown: 'Move rule down',
        textSelection: 'Current selection',
        textThisSheet: 'This worksheet',
        textThisTable: 'This table',
        textThisPivot: 'This pivot',
        textScope: 'Show formatting rules for',
        textRules: 'Rules',
        textApply: 'Apply to',
        textFormat: 'Format',
        textSelectData: 'Select data',
        textAbove: 'Above average',
        textBelow: 'Below average',
        textEqAbove: 'Equal to or above average',
        textEqBelow: 'Equal to or below average',
        text1Above: '1 std dev above average',
        text1Below: '1 std dev below average',
        text2Above: '2 std dev above average',
        text2Below: '2 std dev below average',
        text3Above: '3 std dev above average',
        text3Below: '3 std dev below average',
        textBeginsWith: 'Cell value begins with',
        textCellValue: 'Cell value',
        textBetween: 'is between {0} and {1}',
        textNotBetween: 'is not between {0} and {1}',
        textColorScale: 'Graded color scale',
        textContainsBlank: 'Cell contains a blank value',
        textContainsError: 'Cell contains an error',
        textContains: 'Cell value contains',
        textNotContains: 'Cell value does not contain',
        textNotContainsError: 'Cell does not contain an error',
        textNotContainsBlank: 'Cell does not contain a blank value',
        textEnds: 'Cell value ends with',
        textIconSet: 'Icon set',
        textDuplicate: 'Duplicate values',
        textUnique: 'Unique values',
        tipIsLocked: 'This element is being edited by another user.',
        guestText: 'Guest',
        lockText: 'Locked'

    }, SSE.Views.FormatRulesManagerDlg || {}));
});