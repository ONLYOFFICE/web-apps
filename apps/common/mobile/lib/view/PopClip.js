Ext.define('Common.view.PopClip', {
    extend: 'Ext.Container',
    alias: 'widget.popclip',

    requires: ([
        'Ext.Panel',
        'Ext.SegmentedButton'
    ]),

    config: {
        style   : 'position: absolute; z-index: 9090; background-color: transparent; width: 2px; height: 2px;'
    },

    initialize: function() {
        var me = this;

        me.popClipCmp = me.add({
            xtype   : 'panel',
            layout  : 'fit',
            ui      : 'settings',
            style   : 'padding: 1px;',
            hidden  : true,
            items   : [
                {
                    xtype   : 'container',
                    items   : [
                        {
                            xtype   : 'segmentedbutton',
                            style   : 'margin: 0',
                            ui      : 'base',
                            allowToggle: false,
                            items   : [
                                {
                                    id      : 'id-btn-popclip-cut',
                                    ui      : 'base',
                                    style   : 'font-size: 0.7em; border: 0; box-shadow: none;',
                                    cls     : 'text-offset-12',
                                    text    : this.cutButtonText
                                },
                                {
                                    id      : 'id-btn-popclip-copy',
                                    ui      : 'base',
                                    style   : 'font-size: 0.7em; border: 0; box-shadow: none;',
                                    cls     : 'text-offset-12',
                                    text    : this.copyButtonText
                                },
                                {
                                    id      : 'id-btn-popclip-paste',
                                    ui      : 'base',
                                    style   : 'font-size: 0.7em; border: 0; box-shadow: none;',
                                    cls     : 'text-offset-12',
                                    text    : this.pasteButtonText
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        this.callParent(arguments);
    },

    show: function(animation) {
        if (Ext.isDefined(this.isAnim))
            return;

        this.callParent(arguments);

        var popClip = this.popClipCmp;
        popClip.showBy(this, 'bc-tc?');
        popClip.hide();

        popClip.show();
        popClip.alignTo(this, 'bc-tc?');

        this.isAnim = true;

        Ext.Anim.run(popClip, 'pop', {
            out         : false,
            duration    : 250,
            easing      : 'ease-out',
            autoClear   : false
        });

        popClip.element.on('transitionend', function(){
            Ext.isDefined(this.isAnim) && delete this.isAnim;
        }, this, {single: true});
    },

    hide: function(animation) {
        var me = this;

        var safeHide = function(arguments) {
            if (Ext.isDefined(me.isAnim)) {
                Ext.defer(safeHide, 50, me, arguments);
            } else {
                Ext.bind(me.callParent, me, arguments);
                me.popClipCmp.hide();
            }
        };

        safeHide(arguments);
    },

    cutButtonText   : 'Cut',
    copyButtonText  : 'Copy',
    pasteButtonText : 'Paste'

});