
class LocalStorage {
    constructor() {
        Common.Gateway.on('internalcommand', data => {
            if (data.type == 'localstorage') {
                this._store = data.keys;
            }
        });

        this._store = {};
        this._prefix = 'mobile-';
        this._common_keys = ['guest-id', 'guest-username'];

        try {
            this._isAllowed = !!window.localStorage;
        } catch (e) {
            this._isAllowed = false;
        }
    }

    get id() {
        return this._storeName;
    }

    set id(name) {
        this._storeName = name;
    }

    set keysFilter(value) {
        this._filter = value;
    }

    get keysFilter() {
        return this._filter;
    }

    get prefix() {
        return this._prefix;
    }

    set prefix(p) {
        this._prefix = p;
    }

    sync() {
        if ( !this._isAllowed )
            Common.Gateway.internalMessage('localstorage', {cmd:'get', keys:this._filter});
    }

    save() {
        if ( !this._isAllowed )
            Common.Gateway.internalMessage('localstorage', {cmd:'set', keys:this._store});
    }

    setItem(name, value, just) {
        if ( !this._common_keys.includes(value) )
            name = this._prefix + name;

        if ( this._isAllowed ) {
            try {
                localStorage.setItem(name, value);
            } catch (error){}
        } else {
            this._store[name] = value;

            if ( just===true ) {
                Common.Gateway.internalMessage('localstorage', {cmd:'set', keys: {name: value}});
            }
        }
    }

    getItem(name) {
        if ( !this._common_keys.includes(name) )
            name = this._prefix + name;

        if ( this._isAllowed )
            return localStorage.getItem(name);
        else return this._store[name]===undefined ? null : this._store[name];
    };

    setJson(name, value, just) {
        this.setItem(name, JSON.stringify(value), just);
    }

    getJson(name, fallbackValue = null) {
        try {
            const stored = this.getItem(name);
            return stored ? JSON.parse(stored) : fallbackValue;
        } catch {
            return fallbackValue;
        }
    }

    setBool(name, value, just) {
        this.setItem(name, value ? 1 : 0, just);
    }

    getBool(name, defValue) {
        const value = this.getItem(name);
        return (value !== null) ? (parseInt(value) != 0) : !!defValue;
    }

    itemExists(name) {
        return this.getItem(name) !== null;
    }
}

const instance = new LocalStorage();
export {instance as LocalStorage};