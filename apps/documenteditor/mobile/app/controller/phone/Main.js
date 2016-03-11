Ext.define('DE.controller.phone.Main', {
    extend: 'DE.controller.Main',

    requires: [
        'Ext.Anim'
    ],

    config: {
        refs: {
            viewToolbar         : 'viewtoolbar',
            searchToolbar       : 'searchtoolbar',
            readableBtn         : '#id-tb-btn-readable',
            searchButton        : '#id-tb-btn-search',
            incFontSizeButton   : '#id-tb-btn-incfontsize',
            decFontSizeButton   : '#id-tb-btn-decfontsize',
            shareButton         : '#id-tb-btn-view-share'
        }
    },

    launch: function() {
        this.callParent(arguments);
    },
    
    initControl: function() {
        this.callParent(arguments);
    },
    
    initApi: function() {
        this.callParent(arguments);
    },

    setApi: function(o){
        this.api = o;
        var viewToolbar     = this.getViewToolbar();

        viewToolbar         && viewToolbar.show();
        this.api            && this.api.asc_enableKeyEvents(false);
    },

    setReadableMode: function(readable) {
        var readableBtn         = this.getReadableBtn(),
            searchButton        = this.getSearchButton(),
            incFontSizeButton   = this.getIncFontSizeButton(),
            decFontSizeButton   = this.getDecFontSizeButton(),
            shareButton         = this.getShareButton();

        if (readable) {
            readableBtn && readableBtn.show();
            searchButton && searchButton.hide();
            incFontSizeButton && incFontSizeButton.show();
            decFontSizeButton && decFontSizeButton.show();
            shareButton && shareButton.hide();
        } else {
            readableBtn && readableBtn.hide();
            searchButton && searchButton.show();
            incFontSizeButton && incFontSizeButton.hide();
            decFontSizeButton && decFontSizeButton.hide();
            shareButton && shareButton.show();
        }
    }
}); 