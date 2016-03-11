Ext.define('Common.controller.PopClip', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
            popClip     : 'popclip',
            cutButton   : '#id-btn-popclip-cut',
            copyButton  : '#id-btn-popclip-copy',
            pasteButton : '#id-btn-popclip-paste'
        },

        control: {
            cutButton   : {
                tap : 'onTapCutButton'
            },
            copyButton   : {
                tap : 'onTapCopyButton'
            },
            pasteButton   : {
                tap : 'onTapPasteButton'
            }
        }
    },

    init: function() {
    },

    launch: function() {
    },

    setApi: function(o) {
        this.api = o;
    },

    setMode: function(mode){
        var cutButton   = this.getCutButton(),
            copyButton  = this.getCopyButton(),
            pasteButton = this.getPasteButton(),
            popclip     = this.getPopClip();

        if (mode === 'view') {
            cutButton   && cutButton.hide();
            pasteButton && pasteButton.hide();
            popclip     && popclip.hide();
        } else {
            cutButton   && cutButton.show();
            pasteButton && pasteButton.show();
            popclip     && popclip.hide();
        }
    },

    onTapCutButton: function() {
        this.api && this.api.Cut();

        var popclip = this.getPopClip();
        popclip && popclip.hide();
    },

    onTapCopyButton: function() {
        this.api && this.api.Copy();

        var popclip = this.getPopClip();
        popclip && popclip.hide();
    },

    onTapPasteButton: function() {
        this.api && this.api.Paste();

        var popclip = this.getPopClip();
        popclip && popclip.hide();
    }
});
