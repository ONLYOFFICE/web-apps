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
 *  SmartArtTextPane.js
 *
 *  Shared SmartArt text pane view for all editors.
 *  Displays SmartArt data as a bulleted text outline
 *  and allows inline editing with live sync to the SmartArt shapes.
 *
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button'
], function ($, _, Backbone) {
    'use strict';

    Common.Views = Common.Views || {};

    Common.Views.SmartArtTextPane = Backbone.View.extend(_.extend({

        template: _.template([
            '<div class="smartart-text-pane">',
                '<div class="smartart-text-pane-header">',
                    '<span class="smartart-text-pane-title"><%= scope.txtTitle %></span>',
                '</div>',
                '<div class="smartart-text-pane-toolbar">',
                    '<div id="smartart-btn-add-node" class="margin-right-4"></div>',
                    '<div id="smartart-btn-remove-node" class="margin-right-4"></div>',
                    '<div id="smartart-btn-promote" class="margin-right-4"></div>',
                    '<div id="smartart-btn-demote" class="margin-right-4"></div>',
                    '<div id="smartart-btn-move-up" class="margin-right-4"></div>',
                    '<div id="smartart-btn-move-down"></div>',
                '</div>',
                '<div class="smartart-text-pane-content">',
                    '<div class="smartart-text-list" tabindex="0"></div>',
                '</div>',
            '</div>'
        ].join('')),

        events: {},

        options: {
            alias: 'SmartArtTextPane'
        },

        initialize: function () {
            this._initSettings = true;
            this._noApply = true;
            this._locked = false;
            this._textPaneData = [];
            this._activeNodeId = null;
            this._suppressSync = false;

            this.render();
        },

        render: function () {
            var el = this.$el || $(this.el);
            el.html(this.template({
                scope: this
            }));

            this.btnAddNode = new Common.UI.Button({
                parentEl: el.find('#smartart-btn-add-node'),
                cls: 'btn-toolbar x-huge icon-top',
                iconCls: 'toolbar__icon btn-zoomup',
                caption: this.txtAddNode,
                hint: this.txtAddNodeHint
            });
            this.btnAddNode.on('click', _.bind(this.onAddNode, this));

            this.btnRemoveNode = new Common.UI.Button({
                parentEl: el.find('#smartart-btn-remove-node'),
                cls: 'btn-toolbar x-huge icon-top',
                iconCls: 'toolbar__icon btn-zoomdown',
                caption: this.txtRemoveNode,
                hint: this.txtRemoveNodeHint
            });
            this.btnRemoveNode.on('click', _.bind(this.onRemoveNode, this));

            this.btnPromote = new Common.UI.Button({
                parentEl: el.find('#smartart-btn-promote'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-decoffset',
                hint: this.txtPromoteHint
            });
            this.btnPromote.on('click', _.bind(this.onPromote, this));

            this.btnDemote = new Common.UI.Button({
                parentEl: el.find('#smartart-btn-demote'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-incoffset',
                hint: this.txtDemoteHint
            });
            this.btnDemote.on('click', _.bind(this.onDemote, this));

            this.btnMoveUp = new Common.UI.Button({
                parentEl: el.find('#smartart-btn-move-up'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-arrow-up',
                hint: this.txtMoveUpHint
            });
            this.btnMoveUp.on('click', _.bind(this.onMoveUp, this));

            this.btnMoveDown = new Common.UI.Button({
                parentEl: el.find('#smartart-btn-move-down'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-arrow-down',
                hint: this.txtMoveDownHint
            });
            this.btnMoveDown.on('click', _.bind(this.onMoveDown, this));

            this.textListEl = el.find('.smartart-text-list');
            this.textListEl.on('keydown', _.bind(this.onKeyDown, this));
        },

        setApi: function (api) {
            this.api = api;
            if (this.api) {
                this.api.asc_registerCallback('asc_onSmartArtDataChanged', _.bind(this.onSmartArtDataChanged, this));
            }
            return this;
        },

        setLocked: function (locked) {
            this._locked = locked;
            this.disableControls(locked);
        },

        disableControls: function (disabled) {
            this.btnAddNode && this.btnAddNode.setDisabled(disabled);
            this.btnRemoveNode && this.btnRemoveNode.setDisabled(disabled);
            this.btnPromote && this.btnPromote.setDisabled(disabled);
            this.btnDemote && this.btnDemote.setDisabled(disabled);
            this.btnMoveUp && this.btnMoveUp.setDisabled(disabled);
            this.btnMoveDown && this.btnMoveDown.setDisabled(disabled);
        },

        /**
         * Called by the RightMenu controller when SmartArt selection changes.
         * @param {Object} props - Shape/image properties from asc_onFocusObject
         */
        ChangeSettings: function (props) {
            if (!this.api) return;

            var data = this.api.asc_getSmartArtTextPaneData();
            if (data) {
                this._textPaneData = data;
                this.renderTextList(data);
            }
        },

        /**
         * Called from the SDK when SmartArt data changes (e.g., after text edit in shape).
         * @param {Array} data - Text pane data array
         */
        onSmartArtDataChanged: function (data) {
            if (this._suppressSync) return;
            if (data) {
                this._textPaneData = data;
                this.renderTextList(data);
            }
        },

        /**
         * Renders the bulleted text list from the SmartArt data model.
         * @param {Array} data - Array of {id, text, level, pointType}
         */
        renderTextList: function (data) {
            if (!this.textListEl) return;

            var html = '';
            var activeId = this._activeNodeId;

            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                var indent = item.level * 20;
                var bulletChar = item.level === 0 ? '\u2022' : '\u25E6';
                var isActive = (item.id === activeId) ? ' smartart-text-item-active' : '';
                var displayText = item.text || '';

                html += '<div class="smartart-text-item' + isActive + '" data-point-id="' + item.id + '" data-level="' + item.level + '" style="padding-left: ' + (10 + indent) + 'px;">';
                html += '<span class="smartart-text-bullet">' + bulletChar + '</span>';
                html += '<span class="smartart-text-input" contenteditable="true" data-point-id="' + item.id + '">' + _.escape(displayText) + '</span>';
                html += '</div>';
            }

            if (data.length === 0) {
                html = '<div class="smartart-text-empty">' + this.txtNoData + '</div>';
            }

            this.textListEl.html(html);

            // Bind events to the input spans
            var me = this;
            this.textListEl.find('.smartart-text-input').on('input', function (e) {
                me.onTextInput(e);
            });
            this.textListEl.find('.smartart-text-input').on('focus', function (e) {
                var pointId = $(this).data('point-id');
                me._activeNodeId = pointId;
                me.textListEl.find('.smartart-text-item-active').removeClass('smartart-text-item-active');
                $(this).closest('.smartart-text-item').addClass('smartart-text-item-active');
            });
        },

        /**
         * Handles text input in a text pane entry.
         */
        onTextInput: function (e) {
            if (!this.api || this._locked) return;

            var target = $(e.target);
            var pointId = target.data('point-id');
            var newText = target.text();

            if (pointId) {
                this._suppressSync = true;
                this.api.asc_setSmartArtNodeText(String(pointId), newText);
                this._suppressSync = false;
            }
        },

        /**
         * Handles keyboard shortcuts in the text list.
         */
        onKeyDown: function (e) {
            if (!this.api || this._locked) return;

            var activeEl = this.textListEl.find('.smartart-text-item-active');
            var pointId = this._activeNodeId;

            if (!pointId) return;

            if (e.keyCode === 9 && !e.shiftKey) { // Tab = demote
                e.preventDefault();
                this.api.asc_demoteSmartArtNode(String(pointId));
            } else if (e.keyCode === 9 && e.shiftKey) { // Shift+Tab = promote
                e.preventDefault();
                this.api.asc_promoteSmartArtNode(String(pointId));
            } else if (e.keyCode === 13) { // Enter = add sibling
                e.preventDefault();
                this.onAddNode();
            } else if (e.keyCode === 8) { // Backspace on empty = remove
                var inputEl = activeEl.find('.smartart-text-input');
                if (inputEl.length && inputEl.text().length === 0) {
                    e.preventDefault();
                    this.api.asc_removeSmartArtNode(String(pointId));
                }
            }
        },

        /**
         * Add a sibling node after the active node.
         */
        onAddNode: function () {
            if (!this.api || this._locked) return;

            var pointId = this._activeNodeId;
            // Find the parent of the active node from the data
            var parentId = null;
            var position = -1;

            if (pointId && this._textPaneData) {
                // Find the active item in the data to determine its parent
                // Since we don't have direct parent info in the flat list,
                // we use the API which will figure out the correct parent
                var activeItem = null;
                for (var i = 0; i < this._textPaneData.length; i++) {
                    if (this._textPaneData[i].id === pointId) {
                        activeItem = this._textPaneData[i];
                        break;
                    }
                }
            }

            var newId = this.api.asc_addSmartArtNode({
                parentPointId: null,
                position: -1
            });

            if (newId) {
                this._activeNodeId = newId;
            }
        },

        /**
         * Remove the active node.
         */
        onRemoveNode: function () {
            if (!this.api || this._locked || !this._activeNodeId) return;
            this.api.asc_removeSmartArtNode(String(this._activeNodeId));
            this._activeNodeId = null;
        },

        /**
         * Promote (decrease depth) of the active node.
         */
        onPromote: function () {
            if (!this.api || this._locked || !this._activeNodeId) return;
            this.api.asc_promoteSmartArtNode(String(this._activeNodeId));
        },

        /**
         * Demote (increase depth) of the active node.
         */
        onDemote: function () {
            if (!this.api || this._locked || !this._activeNodeId) return;
            this.api.asc_demoteSmartArtNode(String(this._activeNodeId));
        },

        /**
         * Move active node up among siblings.
         */
        onMoveUp: function () {
            if (!this.api || this._locked || !this._activeNodeId) return;
            this.api.asc_moveSmartArtNodeUp(String(this._activeNodeId));
        },

        /**
         * Move active node down among siblings.
         */
        onMoveDown: function () {
            if (!this.api || this._locked || !this._activeNodeId) return;
            this.api.asc_moveSmartArtNodeDown(String(this._activeNodeId));
        },

        // Localization strings
        txtTitle: 'Type your text here',
        txtAddNode: 'Add',
        txtRemoveNode: 'Remove',
        txtAddNodeHint: 'Add Shape After',
        txtRemoveNodeHint: 'Remove Shape',
        txtPromoteHint: 'Promote',
        txtDemoteHint: 'Demote',
        txtMoveUpHint: 'Move Up',
        txtMoveDownHint: 'Move Down',
        txtNoData: 'No SmartArt data'

    }, Common.Views.SmartArtTextPane || {}));
});
