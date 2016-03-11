Ext.define('Common.store.SettingsList', {
    extend: 'Ext.data.Store',
    config: {
        model: 'Common.model.SettingItem',
        grouper: {
            groupFn : function(record) {
                return record.get('group');
            },
            sorterFn : function(){
                return 0;
            }
        }
    }
});