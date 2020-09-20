// action types
export const RESET_PAGE_ORIENT = 'RESET_PAGE_ORIENT';

// action creators
export const resetPageOrient = value => {
    return {
        type: RESET_PAGE_ORIENT,
        isPortrait: value
    }
};