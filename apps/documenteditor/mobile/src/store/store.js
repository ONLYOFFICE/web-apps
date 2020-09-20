import { createStore, applyMiddleware } from 'redux';
import { rootReducer, initialState } from './reducers/root'
import thunk from 'redux-thunk';

const store = createStore(rootReducer, initialState, applyMiddleware(thunk));

!window.Common && (window.Common = {});
Common.Store = { get: () => store };

export { store };