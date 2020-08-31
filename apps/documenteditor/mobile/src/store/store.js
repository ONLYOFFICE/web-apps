import { createStore } from 'redux'
import { rootReducer, initialState } from './reducers/root'

const store = createStore(rootReducer, initialState);

!window.Common && (window.Common = {});
Common.Store = { get: () => store };

export { store };