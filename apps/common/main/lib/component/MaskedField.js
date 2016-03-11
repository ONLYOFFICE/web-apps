if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView'
], function () {
    'use strict';

    Common.UI.MaskedField = Common.UI.BaseView.extend({
        options : {
            maskExp: '',
            maxLength: 999
        },

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            var me = this,
                el = $(this.el);

            el.addClass('masked-field user-select');
            el.attr('maxlength', me.options.maxLength);
            el.on('keypress', function(e) {
                var charCode = String.fromCharCode(e.which);
                if(!me.options.maskExp.test(charCode) && !e.ctrlKey && e.keyCode !== Common.UI.Keys.DELETE && e.keyCode !== Common.UI.Keys.BACKSPACE &&
                    e.keyCode !== Common.UI.Keys.LEFT && e.keyCode !== Common.UI.Keys.RIGHT && e.keyCode !== Common.UI.Keys.HOME &&
                    e.keyCode !== Common.UI.Keys.END && e.keyCode !== Common.UI.Keys.ESC && e.keyCode !== Common.UI.Keys.INSERT &&
                    e.keyCode !== Common.UI.Keys.TAB /* || el.val().length>=me.options.maxLength*/){
                    if (e.keyCode==Common.UI.Keys.RETURN) me.trigger('changed', me, el.val());
                    e.preventDefault();
                    e.stopPropagation();
                }

            });
            el.on('input', function(e) {
                me.trigger('change', me, el.val());
            });
            el.on('blur',  function(e) {
                me.trigger('changed', me, el.val());
            });
        },

        render : function() {
            return this;
        },

        setValue: function(value) {
            if (this.options.maskExp.test(value) && value.length<=this.options.maxLength)
                $(this.el).val(value);
        },

        getValue: function() {
            $(this.el).val();
        }
    });
});