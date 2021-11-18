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

        const obj = LocalStorage.getItem("ui-theme");
        let theme = this.themes_map.light;
        if ( !!obj )
            theme = this.themes_map[JSON.parse(obj).type];
        else
        if ( window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ) {
            theme = this.themes_map['dark'];
            LocalStorage.setItem("ui-theme", JSON.stringify(theme));
        }

        const $$ = Dom7;
        const $body = $$('body');
        $body.attr('class') && $body.attr('class',  $body.attr('class').replace(/\s?theme-type-(?:dark|light)/, ''));
        $body.addClass(`theme-type-${theme.type}`);
    }

    get isCurrentDark() {
        const obj = LocalStorage.getItem("ui-theme");
        return !!obj ? JSON.parse(obj).type === 'dark' : false;
    }

    switchDarkTheme(dark) {
        const theme = this.themes_map[dark ? 'dark' : 'light'];
        LocalStorage.setItem("ui-theme", JSON.stringify(theme));

        const $body = $$('body');
        $body.attr('class') && $body.attr('class',  $body.attr('class').replace(/\s?theme-type-(?:dark|light)/, ''));
        $body.addClass(`theme-type-${theme.type}`);
    }
}

const themes = new ThemesController()
export {themes as Themes}