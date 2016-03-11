Ext.define('SSE.controller.WorksheetList', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
            worksheetList: {
                selector: 'seworksheetlist list'
            }

        }
    },

    init: function() {
        this.control({
            'seworksheetlist list': {
                itemtap: this._worksheetSelect
            }
        })
    },

    setApi: function(o) {
        this.api = o;

        if (this.api){
            this.api.asc_registerCallback('asc_onEndAction', Ext.bind(this.onLongActionEnd, this));
        }
    },

    _worksheetSelect: function(dataview, index, target, record, event, eOpts){
        if (this.api){
            var dataIndex = record.data.index;
            if ((dataIndex > -1) && (this.api.asc_getActiveWorksheetIndex() != dataIndex))
                this.api.asc_showWorksheet(dataIndex);
        }
    },

    _loadWorksheets: function(){
        if (this.api) {
            var worksheetsStore = Ext.getStore('Worksheets'),
                worksheetList = this.getWorksheetList();

            if (worksheetsStore && worksheetList){
                worksheetsStore.removeAll(false);

                var worksheetsCount = this.api.asc_getWorksheetsCount();
                if (worksheetsCount){
                    for(var i = 0; i < worksheetsCount; i++){
                        var result = {
                            text    : this.api.asc_getWorksheetName(i),
                            index   : i
                        };
                        worksheetsStore.add(result);
                    }

                    var rec = worksheetsStore.findRecord('index', this.api.asc_getActiveWorksheetIndex());
                    if (rec)
                        worksheetList.select(rec);
                    else
                        worksheetList.select(worksheetsStore.getAt(0));
                }
            }

        }
    },

    onLongActionEnd: function(type, id) {
        if (type === c_oAscAsyncActionType['BlockInteraction']){
            switch (id) {
                case c_oAscAsyncAction['Open']:
                    this._loadWorksheets();
                    break;
            }
        }
    }
});