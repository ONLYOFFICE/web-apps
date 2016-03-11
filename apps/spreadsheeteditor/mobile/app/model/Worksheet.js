Ext.define('SSE.model.Worksheet', {
    extend: 'Ext.data.Model',
    config: {
        fields: [
            { name:'index', type: 'int'  },
            { name:'text', type:'string' }
        ]
    }
});