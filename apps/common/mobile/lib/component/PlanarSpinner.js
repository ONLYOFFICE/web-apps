Ext.define('Common.component.PlanarSpinner', {
    extend: 'Ext.field.Spinner',
    xtype: 'planarspinnerfield',

    config: {

    },

    constructor: function() {
        var me = this;
        me.callParent(arguments);
        me.addCls('planar-spinner');
    },

    updateComponent: function(newComponent) {
        this.callParent(arguments);

        var innerElement = this.innerElement,
            cls = this.getCls();

        if (newComponent) {
            this.spinDownButton = Ext.widget('button', {
                cls     : 'x-button x-button-base ' + cls + '-button ' + cls + '-button-down',
                iconCls : 'spinner-down'
            });

            this.spinUpButton = Ext.widget('button', {
                cls     : 'x-button x-button-base ' + cls + '-button ' + cls + '-button-up',
                iconCls : 'spinner-up'
            });

            this.downRepeater = this.createRepeater(this.spinDownButton.element, this.onSpinDown);
            this.upRepeater = this.createRepeater(this.spinUpButton.element,     this.onSpinUp);
        }
    },

    updateGroupButtons: function(newGroupButtons, oldGroupButtons) {
        var me = this,
            innerElement = me.innerElement,
            cls = me.getBaseCls() + '-grouped-buttons';

        me.getComponent();

        if (newGroupButtons != oldGroupButtons) {
            if (newGroupButtons) {
                this.addCls(cls);
                innerElement.insertFirst(me.spinDownButton.element);
                innerElement.appendChild(me.spinUpButton.element);
            } else {
                this.removeCls(cls);
                innerElement.insertFirst(me.spinDownButton.element);
                innerElement.appendChild(me.spinUpButton.element);
            }
        }
    }
});
