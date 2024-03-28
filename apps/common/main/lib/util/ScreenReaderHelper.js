
const helper = function() {
    let $elem;

    const set_enabled = function(enabled) {
        if ( enabled ) {
            if ( !$elem ) {
                if ( ($elem = $('div[aria-live]')).length == 0 ) {
                    const tmpl = '<div aria-live="assertive" class="sr-only" style=""></div>'
                    $elem = $(tmpl).appendTo($('body'));
                }
            }
        } else {
            if ( $elem ) {
                $elem.remove($elem);
                $elem = undefined;
            }
        }
    }

    const set_text_to_speech = function(text) {
        if ( !$elem ){
            set_enabled(true);
        }

        $elem.text('');
        setTimeout(e => {
            $elem.text(text);
        }, 0);
    }

    return {
        setEnabled: set_enabled,
        disable: function() { set_enabled(false); },
        speech: set_text_to_speech,
    }
}

!window.Common && (window.Common = {});
!Common.Utils && (Common.Utils = {});

Common.Utils.ScreeenReaderHelper = new helper();