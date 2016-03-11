Ext.define('DE.controller.tablet.panel.ParagraphAlignment', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
            paraAlignPanel          : 'paragraphalignmentpanel',
            paraAlignsToggle        : '#id-toggle-paragraphalignment',
            paragraphAlignmentButton: '#id-tb-btn-align',
            paraAlignLeft           : '#id-btn-paragraphalignment-left',
            paraAlignCenter         : '#id-btn-paragraphalignment-center',
            paraAlignRight          : '#id-btn-paragraphalignment-right',
            paraAlignFill           : '#id-btn-paragraphalignment-fill'
        },

        control: {
            paraAlignPanel  : {
                show    : 'onParaAlignPanelShow',
                hide    : 'onParaAlignPanelHide'
            },
            paraAlignLeft   : {
                tap     : 'onParaAlignLeftTap'
            },
            paraAlignCenter : {
                tap     : 'onParaAlignCenterTap'
            },
            paraAlignRight  : {
                tap     : 'onParaAlignRightTap'
            },
            paraAlignFill   : {
                tap     : 'onParaAlignFillTap'
            }
        },

        handleApiEvent  : false
    },

    init: function() {
    },

    launch: function() {
    },

    onParaAlignPanelShow: function(cmp) {
        this.setHandleApiEvent(true);

        // update ui data
        this.api && this.api.UpdateInterfaceState();
    },

    onParaAlignPanelHide: function(cmp) {
        this.setHandleApiEvent(false);
    },

    setApi: function(o) {
        this.api = o;

        if (this.api) {
            this.api.asc_registerCallback('asc_onPrAlign', Ext.bind(this.onApiParagraphAlign, this));
        }
    },

    onParaAlignLeftTap: function(btn) {
        if (this.api) {
            this.api.put_PrAlign(1);

            Common.component.Analytics.trackEvent('ToolBar', 'Align');
        }
    },

    onParaAlignCenterTap: function(btn) {
        if (this.api) {
            this.api.put_PrAlign(2);

            Common.component.Analytics.trackEvent('ToolBar', 'Align');
        }
    },

    onParaAlignRightTap: function(btn) {
        if (this.api) {
            this.api.put_PrAlign(0);

            Common.component.Analytics.trackEvent('ToolBar', 'Align');
        }
    },

    onParaAlignFillTap: function(btn) {
        if (this.api) {
            this.api.put_PrAlign(3);

            Common.component.Analytics.trackEvent('ToolBar', 'Align');
        }
    },

    toggleSegmentedButton: function(btn) {
        var toggler = this.getParaAlignsToggle();

        if (toggler) {
            var pressedButtonsNew = [];

            if (btn)
                pressedButtonsNew.push(btn);

            toggler.setPressedButtons(pressedButtonsNew);
        }
    },

    onApiParagraphAlign: function(v) {
        var paragraphAlignmentButton = this.getParagraphAlignmentButton();

        if (paragraphAlignmentButton && Ext.isDefined(v)) {
            switch(v) {
                case 0: paragraphAlignmentButton.setIconCls('align-right');  break;
                case 1: paragraphAlignmentButton.setIconCls('align-left');   break;
                case 2: paragraphAlignmentButton.setIconCls('align-center'); break;
                default:
                case 3: paragraphAlignmentButton.setIconCls('align-fill');
            }
        }

        if (this.getHandleApiEvent()) {
            if (!Ext.isDefined(v)) {
                this.toggleSegmentedButton();
                return;
            }

            switch(v) {
                case 0: this.toggleSegmentedButton(this.getParaAlignRight());  break;
                case 1: this.toggleSegmentedButton(this.getParaAlignLeft());   break;
                case 2: this.toggleSegmentedButton(this.getParaAlignCenter()); break;
                default:
                case 3: this.toggleSegmentedButton(this.getParaAlignFill());
            }
        }
    }
});