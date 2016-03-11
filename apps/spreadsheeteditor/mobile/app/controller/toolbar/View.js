    Ext.define('SSE.controller.toolbar.View', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
            viewToolbar         : 'viewtoolbar',
            searchToolbar       : 'searchtoolbar',
            worksheetPanel      : '#id-worksheets-panel',
            doneButton          : '#id-tb-btn-view-done',
            searchButton        : '#id-tb-btn-search',
            fullscreenButton    : '#id-tb-btn-fullscreen',
            shareButton         : '#id-tb-btn-view-share',
            worksheetsButton    : '#id-tb-btn-pages'
        },

        control: {
            doneButton      : {
                tap         : 'onTapDoneButton'
            },
            searchButton    : {
                tap         : 'onTapSearchButton'
            },
            fullscreenButton: {
                tap         : 'onTapFullscreenButton'
            },
            shareButton     : {
                tap         : 'onTapShareButton'
            },
            worksheetsButton: {
                tap         : 'onTapWorksheets'
            },
            '#id-worksheets-panel seworksheetlist list': {
                itemtap     : 'onSelectWorksheet'
            }
        },

        searchMode      : false,
        fullscreenMode  : false
    },

    launch: function() {
        this.callParent(arguments);

        Common.Gateway.on('init', Ext.bind(this.loadConfig, this));
    },

    initControl: function() {
        this.callParent(arguments);
    },

    initApi: function() {
        //
    },

    setApi: function(o){
        this.api = o;

        if (this.api) {
            this.api.asc_registerCallback('asc_onTapEvent', Ext.bind(this.onSingleTapDocument, this));
        }
    },

    loadConfig: function(data) {
        var doneButton = this.getDoneButton();

        if (doneButton && data && data.config && data.config.canBackToFolder !== false &&
            data.config.customization && data.config.customization.goback && data.config.customization.goback.url){
            this.gobackUrl = data.config.customization.goback.url;
            doneButton.show();
        }
    },

    applySearchMode: function(search){
        if (!Ext.isBoolean(search)) {
            Ext.Logger.error('Invalid parameters.');
        } else {
            var me              = this,
                searchToolbar   = me.getSearchToolbar(),
                searchButton    = me.getSearchButton();

            if (searchToolbar) {
                if (search) {
                    searchButton && searchButton.addCls('x-button-pressing');

                    if (me.getFullscreenMode()) {
                        searchToolbar.show({
                            easing: 'ease-out',
                            preserveEndState: true,
                            autoClear: false,
                            from: {
                                top     : '22px',
                                opacity : 0.3
                            },
                            to: {
                                top     : '44px',
                                opacity : 0.9
                            }
                        });
                    } else {
                        searchToolbar.show();
                    }
                } else {
                    if (me.getFullscreenMode()) {
                        searchToolbar.hide({
                            easing: 'ease-in',
                            to: {
                                top     : '22px',
                                opacity : 0.3
                            }
                        });
                    } else {
                        searchToolbar.hide();
                    }
                }
            }
            return search;
        }
    },

    applyFullscreenMode: function(fullscreen) {
        if (!Ext.isBoolean(fullscreen)) {
            Ext.Logger.error('Invalid parameters.');
        } else {
            var viewToolbar     = this.getViewToolbar(),
                searchToolbar   = this.getSearchToolbar(),
                fullscreenButton= this.getFullscreenButton(),
                popClipCmp      = Ext.ComponentQuery.query('popclip');

            if (popClipCmp.length > 0) {
                popClipCmp[0].hide();
            }

            if (viewToolbar && searchToolbar) {
                if (fullscreen) {
                    fullscreenButton && fullscreenButton.addCls('x-button-pressing');

                    viewToolbar.setStyle({
                        position    : 'absolute',
                        left        : 0,
                        top         : 0,
                        right       : 0,
                        opacity     : 0.9,
                        'z-index'   : 17
                    });

                    searchToolbar.setStyle({
                        position    : 'absolute',
                        left        : 0,
                        top         : '44px',
                        right       : 0,
                        opacity     : 0.9,
                        'z-index'   : 16
                    });

                    this.setHiddenToolbars(true);
                } else {
                    viewToolbar.setStyle({
                        position    : 'initial',
                        opacity     : 1
                    });
                    searchToolbar.setStyle({
                        position    : 'initial',
                        opacity     : 1
                    });

                    viewToolbar.setDocked('top');
                    searchToolbar.setDocked('top');
                }
            }

            return fullscreen;
        }
    },

    setHiddenToolbars: function(hide) {
        var viewToolbar     = this.getViewToolbar(),
            searchToolbar   = this.getSearchToolbar();

        if (viewToolbar && searchToolbar){
            if (hide){
                viewToolbar.hide({
                    easing  : 'ease-out',
                    from    : {opacity : 0.9},
                    to      : {opacity : 0}
                });
                searchToolbar.hide({
                    easing  : 'ease-out',
                    from    : {opacity : 0.9},
                    to      : {opacity : 0}
                });
            } else {
                viewToolbar.show({
                    preserveEndState: true,
                    easing  : 'ease-in',
                    from    : {opacity : 0},
                    to      : {opacity : 0.9}
                });
                this.getSearchMode() && searchToolbar.show({
                    preserveEndState: true,
                    easing  : 'ease-in',
                    from    : {opacity : 0},
                    to      : {opacity : 0.9}
                });
            }
        }
    },

    onTapDoneButton: function() {
        if (this.gobackUrl) window.parent.location.href = this.gobackUrl;
    },

//    onTapEditModeButton: function() {
//        var mainController = this.getApplication().getController('tablet.Main');
//
//        if (this.getReadableMode())
//            this.setReadableMode(false);
//
//        if (mainController)
//            mainController.setMode('edit');
//    },

//    onTapReaderButton: function() {
//        this.setReadableMode(!this.getReadableMode());
//    },

    onTapSearchButton: function(btn) {
        this.setSearchMode(!this.getSearchMode());
    },

    onTapFullscreenButton: function(btn) {
        this.setFullscreenMode(!this.getFullscreenMode());
		if ( this.api )
			this.api.asc_Resize();
    },

    onTapShareButton: function() {
        this.api && this.api.asc_Print();
        Common.component.Analytics.trackEvent('ToolBar View', 'Share');
    },

    onSingleTapDocument: function() {
        var viewToolbar = this.getViewToolbar();
        if (viewToolbar && this.getFullscreenMode()) {
            this.setHiddenToolbars(!viewToolbar.isHidden());
        }
    },

    onTapWorksheets: function(){
        var worksheetPanel = this.getWorksheetPanel(),
            worksheetsButton = this.getWorksheetsButton();

        if (worksheetPanel){
            worksheetPanel.showBy(worksheetsButton);
        }
    },

    onSelectWorksheet: function(dataview, index, target, record, event, eOpts){
        var worksheetPanel = this.getWorksheetPanel();

        if (worksheetPanel)
            worksheetPanel.hide();
    }

//    onTapIncFontSizeButton: function() {
//        this.api && this.api.IncreaseReaderFontSize();
//    },
//
//    onTapDecFontSizeButton: function() {
//        this.api && this.api.DecreaseReaderFontSize();
//    }
});