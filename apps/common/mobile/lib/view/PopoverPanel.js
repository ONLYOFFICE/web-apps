Ext.define('Common.view.PopoverPanel', {
    extend: 'Ext.Panel',
    alias: 'widget.commonpopoverpanel',

    config: {
        showAnimation   : {
            type    : 'fadeIn',
            duration: 100
        },
        hideAnimation   : {
            type    : 'fadeOut',
            duration: 100
        },
        modal       : {
            cls     : 'transparent'
        }
    }
});