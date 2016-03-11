Ext.define('SSE.controller.Document', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
        },

        control: {
            '#id-btn-zoom-in': {
                tap: 'onZoomIn'
            },
            '#id-btn-zoom-out': {
                tap: 'onZoomOut'
            }
        }
    },

    _currZoom       : 1,
    _baseZoom       : 1,
    _maxZoom        : 2,
    _incrementZoom  : 0.05,

    init: function() {

    },

    launch: function() {

    },

    setApi: function(o) {
        this.api = o;

        if (this.api) {
            this.api.asc_registerCallback('asc_onDoubleTapEvent',   Ext.bind(this._onDoubleTapDocument, this));
            this.api.asc_registerCallback('asc_onStartAction',      Ext.bind(this._onLongActionBegin, this));
            this.api.asc_registerCallback('asc_onEndAction',        Ext.bind(this._onLongActionEnd, this));

        }
    },

    _onLongActionBegin: function(type, id) {
//        console.log("onStartAction " + arguments[0] + " " + arguments[1]);
    },

    _onLongActionEnd: function(type, id) {
        if (type === c_oAscAsyncActionType['BlockInteraction']) {
            switch (id) {
                case c_oAscAsyncAction['Open']:
                    var i = this.api.asc_getActiveWorksheetIndex();
                    this.api.asc_showWorksheet(i);
                    break;
            }
        }
    },

    _onDoubleTapDocument: function(){
        if (this.api){
            if (this._currZoom != this._baseZoom){
                this._currZoom = this._baseZoom;
            } else {
                this._currZoom = this._maxZoom;
            }

            this.api.asc_setZoom(this._currZoom);
        }
    },

    onZoomIn: function(event, node, opt){
        this._currZoom += this._incrementZoom;

        if (this._currZoom > this._maxZoom)
            this._currZoom = this._maxZoom;

        this.api.asc_setZoom(this._currZoom);
    },

    onZoomOut: function(event, node, opt){
        this._currZoom -= this._incrementZoom;

        if (this._currZoom < this._baseZoom)
            this._currZoom = this._baseZoom;

        this.api.asc_setZoom(this._currZoom);
    }

});
