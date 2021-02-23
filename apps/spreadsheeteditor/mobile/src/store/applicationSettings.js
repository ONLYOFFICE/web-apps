import {action, observable} from 'mobx';

export class storeApplicationSettings {
   
    @observable unitMeasurement = Common.Utils.Metric.getCurrentMetric();
    @observable macrosMode = 0;
    @observable formulaLang = Common.Locale.currentLang || dataLang[0].value;
    @observable regSettings = 0x0409;
    @observable regData = [];
    @observable isRefStyle = false;
    @observable isComments = true;
    @observable isResolvedComments = true;

    getFormulaLanguages() {
        const dataLang = [
            { value: 'en', displayValue: 'English', exampleValue: ' SUM; MIN; MAX; COUNT' },
            { value: 'de', displayValue: 'Deutsch', exampleValue: ' SUMME; MIN; MAX; ANZAHL' },
            { value: 'es', displayValue: 'Spanish', exampleValue: ' SUMA; MIN; MAX; CALCULAR' },
            { value: 'fr', displayValue: 'French', exampleValue: ' SOMME; MIN; MAX; NB' },
            { value: 'it', displayValue: 'Italian', exampleValue: ' SOMMA; MIN; MAX; CONTA.NUMERI' },
            { value: 'ru', displayValue: 'Russian', exampleValue: ' СУММ; МИН; МАКС; СЧЁТ' },
            { value: 'pl', displayValue: 'Polish', exampleValue: ' SUMA; MIN; MAX; ILE.LICZB' }
        ]

        return dataLang;
    }

    getRegDataCodes() {
        const regDataCode = [
            { value: 0x042C }, { value: 0x0402 }, { value: 0x0405 }, { value: 0x0407 },  {value: 0x0807}, { value: 0x0408 }, { value: 0x0C09 }, { value: 0x0809 }, { value: 0x0409 }, { value: 0x0C0A }, { value: 0x080A },
            { value: 0x040B }, { value: 0x040C }, { value: 0x0410 }, { value: 0x0411 }, { value: 0x0412 }, { value: 0x0426 }, { value: 0x0413 }, { value: 0x0415 }, { value: 0x0416 },
            { value: 0x0816 }, { value: 0x0419 }, { value: 0x041B }, { value: 0x0424 }, { value: 0x081D }, { value: 0x041D }, { value: 0x041F }, { value: 0x0422 }, { value: 0x042A }, { value: 0x0804 }
        ];

        return regDataCode;
    }

    // @action initRegData() {
    //     const regDataCodes = this.getRegDataCodes();
    //     regDataCodes.forEach(item => {
    //         let langInfo = Common.util.LanguageInfo.getLocalLanguageName(item.value);
    //         this.regData.push({code: item.value, displayName: langInfo[1], langName: langInfo[0]});
    //     })
    // }

    // @action initRegSettings() {
    //     const regData = this.getRegDataCodes();
    //     let value = Number(Common.localStorage.getItem('sse-settings-regional'));

    //     if(!value) {
    //         this.regSettings = 0x0409;
    //     } else {
    //         regData.forEach(obj => {
    //             if(obj.value === value) {
    //                 this.regSettings = obj.value;
    //             }
    //         });
    //     }
    // }

    @action changeRegSettings(value) {
        this.regSettings = value;
    }

    @action changeUnitMeasurement(value) {
        this.unitMeasurement = +value;
    }

    @action changeMacrosSettings(value) {
        this.macrosMode = +value;
    }

    @action changeDisplayComments(value) {
        this.isComments = value;
        if (!value) this.changeDisplayResolved(value);
    }

    @action changeDisplayResolved(value) {
        this.isResolvedComments = value;
    }

    @action changeRefStyle(value) {
        this.isRefStyle = value;
    }

    @action changeFormulaLang(value) {
        this.formulaLang = value;
    }
}