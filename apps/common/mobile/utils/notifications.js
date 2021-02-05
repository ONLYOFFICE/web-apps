
export default class Notifications {
    constructor() {
        this._events = {};
    }

    on(event, callback) {
        const addevent = (e, c) => {
            !this._events[e] && (this._events[e] = []);
            this._events[e].push(c);
        };

        if ( typeof(event) == 'object' )
            for (const i in event)
                addevent(i, event[i])
        else addevent(event, callback);
    }

    off(event, callback) {
        if ( this._events[event] && this._events[event].includes(callback) ) {
            this._events[event].splice(this._events[event].indexOf(callback), 1);
        }
    }

    trigger(event/*, args*/) {
        if ( this._events[event] ) {
            this._events[event].forEach(callback => {
                callback.apply(this, Array.prototype.slice.call(arguments, 1));
            });
        }
    }
}
