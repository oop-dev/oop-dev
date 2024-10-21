// src/utils/router.js
export const to = (url) => {
    if (typeof uni !== 'undefined') {
        uni.navigateTo({
            url: url.startsWith('/') ? url : '/' + url,
        });
    } else {
        console.error('uni object is not defined');
    }
};
