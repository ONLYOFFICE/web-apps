/**
 * Created by Maxim.Kadushkin on 2/5/2021.
 */

define([
    'core'
], function () {
    'use strict';

    Common.UI.Scaling = new (function() {
        const scales_map = {
            'pixel-ratio__1'    : 1,
            'pixel-ratio__1_25' : 1.25,
            'pixel-ratio__1_5'  : 1.5,
            'pixel-ratio__1_75' : 1.75,
            'pixel-ratio__2'    : 2,
            'pixel-ratio__2_5'  : 2.5,
        }

        let _body_classes = document.body.className;

        const _from_class_list = function (str) {
            const reg_ratio = /(pixel-ratio__[\w-]+)/.exec(str);
            if ( reg_ratio && (reg_ratio[1] in scales_map) ) {
                return reg_ratio[1];
            }

            return 'pixel-ratio__1';
        }

        let _current_ratio_str = _from_class_list(_body_classes);

        const _callback = function (records, observer) {
            const _changed_ratio = _from_class_list(document.body.className);
            if ( _changed_ratio != _current_ratio_str ) {
                $('[ratio]').trigger('app:scaling', {ratio: scales_map[_changed_ratio]});

                _current_ratio_str = _changed_ratio;
            }
        };

        (new MutationObserver(_callback.bind(this)))
            .observe(document.body, {
                attributes : true,
                attributeFilter : ['class'],
            })

        return {
            currentRatio: function () { return scales_map[_current_ratio_str] },
            currentRatioSelector: function () { return _current_ratio_str },
        };
    });
});