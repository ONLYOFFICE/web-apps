Ext.define('DE.controller.tablet.panel.FontStyle', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
            fontStylePanel      : 'fontstylepanel',
            fontStylesToggle    : '#id-toggle-fontstyles',
            fontStyleBold       : '#id-btn-fontstyle-bold',
            fontStyleItalic     : '#id-btn-fontstyle-italic',
            fontStyleUnderline  : '#id-btn-fontstyle-underline'
        },

        control: {
            fontStylePanel  : {
                show    : 'onFontStyleShow',
                hide    : 'onFontStyleHide'
            },
            fontStyleBold   : {
                tap     : 'onBoldButtonTap'
            },
            fontStyleItalic : {
                tap     : 'onItalicButtonTap'
            },
            fontStyleUnderline: {
                tap     : 'onUnderlineButtonTap'
            }
        },

        handleApiEvent  : false
    },

    init: function() {
    },

    launch: function() {
    },

    setApi: function(o) {
        this.api = o;

        if (this.api) {
            this.api.asc_registerCallback('asc_onBold',         Ext.bind(this.onApiBold, this));
            this.api.asc_registerCallback('asc_onItalic',       Ext.bind(this.onApiItalic, this));
            this.api.asc_registerCallback('asc_onUnderline',    Ext.bind(this.onApiUnderline, this));
        }
    },

    onFontStyleShow: function(cmp){
        this.setHandleApiEvent(true);

        // update ui data
        this.api && this.api.UpdateInterfaceState();
    },

    onFontStyleHide: function(cmp){
        this.setHandleApiEvent(false);
    },

    _toggleSegmentedButton: function(btn, toggle) {
        var toggler = this.getFontStylesToggle();

        if (toggler && btn) {
            var pressedButtonsOld = toggler.getPressedButtons().slice(),
                pressedButtonsNew = toggler.getPressedButtons(),
                pressedIndex = pressedButtonsNew.indexOf(btn);

            if (toggle) {
                if (pressedIndex < 0)
                    pressedButtonsNew.push(btn)
            } else {
                if (pressedIndex > -1)
                    pressedButtonsNew.splice(pressedIndex, 1);
            }

//            toggler.setPressedButtons(pressedButtons);
            toggler.updatePressedButtons(pressedButtonsNew, pressedButtonsOld);
        }
    },

    onApiBold: function(on) {
        if (this.getHandleApiEvent())
            this._toggleSegmentedButton(this.getFontStyleBold(), on);
    },

    onApiItalic: function(on) {
        if (this.getHandleApiEvent())
            this._toggleSegmentedButton(this.getFontStyleItalic(), on);
    },

    onApiUnderline: function(on) {
        if (this.getHandleApiEvent())
            this._toggleSegmentedButton(this.getFontStyleUnderline(), on);
    },

    onBoldButtonTap: function(btn) {
        var toggler = this.getFontStylesToggle();

        if (toggler && this.api) {
            this.api.put_TextPrBold(toggler.isPressed(btn));

            Common.component.Analytics.trackEvent('ToolBar', 'Bold');
        }
    },

    onItalicButtonTap: function(btn) {
        var toggler = this.getFontStylesToggle();

        if (toggler && this.api) {
            this.api.put_TextPrItalic(toggler.isPressed(btn));

            Common.component.Analytics.trackEvent('ToolBar', 'Italic');
        }
    },

    onUnderlineButtonTap: function(btn) {
        var toggler = this.getFontStylesToggle();
        if (toggler && this.api) {
            this.api.put_TextPrUnderline(toggler.isPressed(btn));

            Common.component.Analytics.trackEvent('ToolBar', 'Underline');
        }
    }
});