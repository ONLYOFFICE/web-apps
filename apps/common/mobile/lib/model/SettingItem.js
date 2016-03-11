Ext.define('Common.model.SettingItem', {
    extend: 'Ext.data.Model',
    config: {
        fields: [
            'id',
            'setting',
            'icon',
            'child',
            'group'
        ]
    }
});