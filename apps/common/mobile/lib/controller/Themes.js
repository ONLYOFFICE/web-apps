import { Dom7 } from 'framework7'
import { LocalStorage } from "../../utils/LocalStorage";

class ThemesController {
    constructor() {
        this.themes_map = {
            dark : {
                id: 'theme-dark',
                type:'dark'
            },
            light: {
                id: 'theme-light',
                type: 'light'
            }};
    }

    init() {
        const obj = LocalStorage.getItem("ui-theme");
        let theme = this.themes_map.light;
        if ( !!obj )
            theme = this.themes_map[JSON.parse(obj).type];
        else
        if ( window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ) {
            theme = this.themes_map['dark'];
            LocalStorage.setItem("ui-theme", JSON.stringify(theme));
        }

        this.switchDarkTheme(theme, true);

        $$(window).on('storage', e => {
            if ( e.key == LocalStorage.prefix + 'ui-theme' ) {
                if ( !!e.newValue ) {
                    this.switchDarkTheme(JSON.parse(e.newValue), true);
                }
            }
        });
    }

    get isCurrentDark() {
        const obj = LocalStorage.getItem("ui-theme");
        return !!obj ? JSON.parse(obj).type === 'dark' : false;
    }

    switchDarkTheme(dark) {
        const theme = typeof dark == 'object' ? dark : this.themes_map[dark ? 'dark' : 'light'];
        const refresh_only = !!arguments[1];

        if ( !refresh_only )
            LocalStorage.setItem("ui-theme", JSON.stringify(theme));

        const $body = $$('body');
        $body.attr('class') && $body.attr('class',  $body.attr('class').replace(/\s?theme-type-(?:dark|light)/, ''));
        $body.addClass(`theme-type-${theme.type}`);

        const on_engine_created = api => {
            api.asc_setSkin(theme.id);
        };

        const api = Common.EditorApi ? Common.EditorApi.get() : undefined;
        if(!api) Common.Notifications.on('engineCreated', on_engine_created);
        else on_engine_created(api);
    }
}

const themes = new ThemesController()
export {themes as Themes}