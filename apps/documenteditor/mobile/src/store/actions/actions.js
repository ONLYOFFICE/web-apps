
export const SETTINGS_PAGE_ORIENTATION_CHANGED = 'PAGE_ORIENTATION_CHANGED';

export const changePageOrientation = isPortrait => {
    return {
        type: SETTINGS_PAGE_ORIENTATION_CHANGED,
        isPortrait: isPortrait
    }
};
