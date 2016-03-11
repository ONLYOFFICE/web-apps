Ext.define('SSE.controller.ApiEvents', {
    mixins: {
        observable: "Ext.mixin.Observable"
    },

    view            : undefined,
    widget          : undefined,
    element         : undefined,
    handlers        : undefined,
    settings        : undefined,
    enableKeyEvents : false,
    isSelectMode    : false,
    hasCursor       : false,

    constructor: function(config){
        this.initConfig(config);
        this.callParent(arguments);
        return this;
    },

    init: function (view, widgetElem, canvasElem, handlers, settings) {
        this.view     = view;
        this.widget   = widgetElem;
        this.element  = canvasElem;
        this.handlers = new window.Asc.asc_CHandlersList(handlers);
        this.settings = $.extend(true, {}, this.defaults, settings);

        return this;
    },

    destroy: function () {
        $(window).off("." + this.namespace);
        return this;
    },

    enableKeyEventsHandler: function (f) {
        this.enableKeyEvents = !!f;
    }
});