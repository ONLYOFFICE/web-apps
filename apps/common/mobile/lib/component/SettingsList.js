Ext.define('Common.component.SettingsList', {
    extend: 'Ext.List',
    alias: 'widget.settingslist',

    config: {
        disableSelection: true,
        pinHeaders      : false,
        grouped         : true,
        cls             : 'settings',
        ui              : 'round',
        itemTpl         : Ext.create('Ext.XTemplate',
            '<tpl for=".">',
                '<tpl if="this.hasIcon(icon)">',
                    '<span class="list-icon {icon}"></span>',
                '</tpl>',
                '<tpl if="this.hasIcon(icon)">',
                    '<strong class="icon-offset">{setting}</strong>',
                '<tpl else>',
                    '<strong>{setting}</strong>',
                '</tpl>',
                '<tpl if="this.hasChild(child)">',
                    '<span class="list-icon disclosure"></span>',
                '</tpl>',
            '</tpl>',
            {
                hasIcon: function(icon){
                    return !Ext.isEmpty(icon);
                },
                hasChild: function(child){
                    return !Ext.isEmpty(child);
                }
            }
        )
    },

    //
    // Workaround Sencha Touch bug
    // See https://sencha.jira.com/browse/TOUCH-3718
    //

    findGroupHeaderIndices: function() {
        var me = this,
            store = me.getStore(),
            storeLn = store.getCount(),
            groups = store.getGroups(),
            groupLn = groups.length,
            headerIndices = me.headerIndices = {},
            footerIndices = me.footerIndices = {},
            i, previousIndex, firstGroupedRecord, storeIndex;


        me.groups = groups;

        for (i = 0; i < groupLn; i++) {
            firstGroupedRecord = groups[i].children[0];
            storeIndex = store.indexOf(firstGroupedRecord);
            headerIndices[storeIndex] = true;

            previousIndex = storeIndex - 1;
            if (previousIndex >= 0) {
                footerIndices[previousIndex] = true;
            }
        }

        footerIndices[storeLn - 1] = true;

        return headerIndices;
    }
});