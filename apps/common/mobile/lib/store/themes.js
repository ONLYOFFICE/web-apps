import {action, observable, makeObservable} from 'mobx';

export class storeThemes {
    constructor() {
        makeObservable(this, {
			isConfigSelectTheme: observable,
			setConfigSelectTheme: action,
			colorTheme: observable,
			setColorTheme: action,
            systemColorTheme: observable,
            setSystemColorTheme: action,
            resetSystemColorTheme: action,
            setTranslationsThemes: action
        });
    }

    themes = {
		dark: {
			id: 'theme-dark',
			type: 'dark',
		},
		light: {
			id: 'theme-light',
			type: 'light',
		},
		system: {
			id: 'theme-system',
			type: 'system',
		}
	}

    nameColors = [
		"canvas-background",
		"canvas-content-background",
		"canvas-page-border",

		"canvas-ruler-background",
		"canvas-ruler-border",
		"canvas-ruler-margins-background",
		"canvas-ruler-mark",
		"canvas-ruler-handle-border",
		"canvas-ruler-handle-border-disabled",

		"canvas-high-contrast",
		"canvas-high-contrast-disabled",

		"canvas-cell-border",
		"canvas-cell-title-border",
		"canvas-cell-title-border-hover",
		"canvas-cell-title-border-selected",
		"canvas-cell-title-hover",
		"canvas-cell-title-text",
		"canvas-cell-title-background",
		"canvas-cell-title-background-selected",

		"canvas-scroll-thumb",
		"canvas-scroll-thumb-hover",
		"canvas-scroll-thumb-pressed",
		"canvas-scroll-thumb-border",
		"canvas-scroll-thumb-border-hover",
		"canvas-scroll-thumb-border-pressed",
		"canvas-scroll-arrow",
		"canvas-scroll-arrow-hover",
		"canvas-scroll-arrow-pressed",
		"canvas-scroll-thumb-target",
		"canvas-scroll-thumb-target-hover",
		"canvas-scroll-thumb-target-pressed",
	];

	isConfigSelectTheme = true;
    setConfigSelectTheme(value) {
        this.isConfigSelectTheme = value;
    }

    colorTheme;
    setColorTheme(theme) {
        this.colorTheme = theme;
    }

    systemColorTheme;
    setSystemColorTheme(theme) {
        this.systemColorTheme = theme;
    }

    resetSystemColorTheme() {
        this.systemColorTheme = null;
    }

    setTranslationsThemes(translations) {
        for(let key in this.themes) {
            this.themes[key].text = translations[key];
        }
    }
}