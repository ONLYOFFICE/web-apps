import {makeObservable, action, observable} from 'mobx';
import { LocalStorage } from '../../../../common/mobile/utils/LocalStorage.mjs';

export class storeApplicationSettings {
    constructor() {
        makeObservable(this, {
            unitMeasurement: observable,
            macrosMode: observable,
            macrosRequest: observable,
            formulaLang: observable, 
            regCode: observable, 
            regExample: observable, 
            regData: observable, 
            isRefStyle: observable, 
            isComments: observable, 
            isResolvedComments: observable, 
            initRegData: action, 
            getRegCode: action, 
            changeRegCode: action, 
            setRegExample: action, 
            changeUnitMeasurement: action, 
            changeMacrosSettings: action,
            changeMacrosRequest: action,
            changeDisplayComments: action, 
            changeDisplayResolved: action, 
            changeRefStyle: action, 
            changeFormulaLang: action,
            directionMode: observable,
            changeDirectionMode: action
        });
    }
    
    directionMode = LocalStorage.getItem('mode-direction') || 'ltr';
    unitMeasurement = Common.Utils.Metric.getCurrentMetric();
    macrosMode = 0;
    macrosRequest = 0;
    formulaLang = LocalStorage.getItem('sse-settings-func-lang') || this.getFormulaLanguages()[0].value;
    regCode = undefined;
    regExample = '';
    regData = [];
    isRefStyle = false;
    isComments = true;
    isResolvedComments = true; 

    changeDirectionMode(value) {
        this.directionMode = value;
    }

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
            { value: 0x042C }, { value: 0x0402 }, { value: 0x0405 }, { value: 0x0C07 }, { value: 0x0407 },  {value: 0x0807}, { value: 0x0408 }, { value: 0x0C09 }, { value: 0x0809 }, { value: 0x0409 }, { value: 0x0C0A }, { value: 0x080A },
            { value: 0x040B }, { value: 0x040C }, { value: 0x100C }, { value: 0x0410 }, { value: 0x0810 }, { value: 0x0411 }, { value: 0x0412 }, { value: 0x0426 }, { value: 0x040E }, { value: 0x0413 }, { value: 0x0415 }, { value: 0x0416 },
            { value: 0x0816 }, { value: 0x0419 }, { value: 0x041B }, { value: 0x0424 }, { value: 0x081D }, { value: 0x041D }, { value: 0x041F }, { value: 0x0422 }, { value: 0x042A }, { value: 0x0804 }, { value: 0x0404 }
        ];

        return regDataCode;
    }

    initRegData() {
        const regDataCodes = this.getRegDataCodes();

        regDataCodes.forEach(item => {
            let langInfo = Common.util.LanguageInfo.getLocalLanguageName(item.value);
            this.regData.push({code: item.value, displayName: langInfo[1], langName: langInfo[0]});
        })
    }

    getRegCode() {
        const regData = this.regData;
        let value = Number(LocalStorage.getItem('sse-settings-regional'));
        
        regData.forEach(obj => {
            if(obj.code === value) {
                this.regCode = obj.code;
            }
        });

        if(!this.regCode) {
            this.regCode = 0x0409;
        }

        return this.regCode;
    }

    changeRegCode(value) {
        this.regCode = value;
    }

    setRegExample(value) {
        this.regExample = value;
    }

    changeUnitMeasurement(value) {
        this.unitMeasurement = +value;
    }

    changeMacrosSettings(value) {
        this.macrosMode = +value;
    }

    changeMacrosRequest(value) {
        this.macrosRequest = value;
    }

    changeDisplayComments(value) {
        this.isComments = value;
        if (!value) this.changeDisplayResolved(value);
    }

    changeDisplayResolved(value) {
        this.isResolvedComments = value;
    }

    changeRefStyle(value) {
        this.isRefStyle = value;
    }

    changeFormulaLang(value) {
        this.formulaLang = value;
    }
}