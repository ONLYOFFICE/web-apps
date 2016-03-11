Ext.define('Common.component.RepeatableButton', {
    extend: 'Ext.Button',
    xtype: 'repeatablebutton',
    requires: ['Ext.util.TapRepeater'],

    initialize: function() {
        this.callParent(arguments);

        this.repeater = this.createRepeater(this.element, this.onRepeatTap);
    },

    // @private
    destroy: function() {
        var me = this;
        Ext.destroy(me.repeater);

        me.callParent(arguments);
    },

    // @private
    createRepeater: function(el, fn) {
        var me = this,
            repeater = Ext.create('Ext.util.TapRepeater', {
                el          : el,
                accelerate  : true,
                delay       : 500
            });

        repeater.on({
            tap         : fn,
            touchstart  : 'onTouchStart',
            touchend    : 'onTouchEnd',
            scope       : me
        });

        return repeater;
    },

    // @private
    onRepeatTap: function(e) {
        this.fireAction('tap', [this, e, true], 'doTap');
    },

    // @private
    doTap: function(me, e, handle) {
        if (Ext.isBoolean(handle) && handle) {
            this.callParent(arguments);
        } else {
            return false;
        }
    },

    // @private
    onTouchStart: function(repeater) {
        if (!this.getDisabled()) {
            this.element.addCls(Ext.baseCSSPrefix + 'button-pressing');
        }
    },

    // @private
    onTouchEnd: function(repeater) {
        this.element.removeCls(Ext.baseCSSPrefix + 'button-pressing');
    }
});