/**
 * @private
 * Utility class used by Ext.slider.Slider - should never need to be used directly.
 */
Ext.define('Ext.slider.Thumb', {
    extend: 'Ext.Component',
    xtype : 'thumb',

    config: {
        /**
         * @cfg
         * @inheritdoc
         */
        baseCls: Ext.baseCSSPrefix + 'thumb',

        /**
         * @cfg {String} pressedCls
         * The CSS class to add to the Slider when it is pressed.
         * @accessor
         */
        pressedCls: Ext.baseCSSPrefix + 'thumb-pressing',

        /**
         * @cfg
         * @inheritdoc
         */
        draggable: {
            direction: 'horizontal'
        }
    },

    // Strange issue where the thumbs translation value is not being set when it is not visible. Happens when the thumb 
    // is contained within a modal panel.
    platformConfig: [
        {
            platform: ['ie10'],
            draggable: {
                translatable: {
                    translationMethod: 'csstransform'
                }
            }
        }
    ],

    elementWidth: 0,

    initialize: function() {
        this.callParent();

        this.getDraggable().onBefore({
            dragstart: 'onDragStart',
            drag: 'onDrag',
            dragend: 'onDragEnd',
            scope: this
        });

        this.getDraggable().on({
            touchstart: 'onPress',
            touchend: 'onRelease',
            scope: this
        });

        this.element.on('resize', 'onElementResize', this);
    },

    getTemplate: function() {
        if (Ext.theme.is.Blackberry || Ext.theme.is.Blackberry103) {
            return [
                {
                    tag: 'div',
                    className: Ext.baseCSSPrefix + 'thumb-inner',
                    reference: 'innerElement'
                }
            ]
        } else {
            return this.template;
        }
    },


    /**
     * @private
     */
    updatePressedCls: function(pressedCls, oldPressedCls) {
        var element = this.element;

        if (element.hasCls(oldPressedCls)) {
            element.replaceCls(oldPressedCls, pressedCls);
        }
    },

    // @private
    onPress: function() {
        var me = this,
            element = me.element,
            pressedCls = me.getPressedCls();

        if (!me.getDisabled()) {
            element.addCls(pressedCls);
        }
    },

    // @private
    onRelease: function(e) {
        this.fireAction('release', [this, e], 'doRelease');
    },

    // @private
    doRelease: function(me, e) {
        if (!me.getDisabled()) {
            me.element.removeCls(me.getPressedCls());
        }
    },

    onDragStart: function() {
        if (this.isDisabled()) {
            return false;
        }

        this.relayEvent(arguments);
    },

    onDrag: function() {
        if (this.isDisabled()) {
            return false;
        }

        this.relayEvent(arguments);
    },

    onDragEnd: function() {
        if (this.isDisabled()) {
            return false;
        }

        this.relayEvent(arguments);
    },

    onElementResize: function(element, info) {
        this.elementWidth = info.width;
    },

    getElementWidth: function() {
        return this.elementWidth;
    }
});
