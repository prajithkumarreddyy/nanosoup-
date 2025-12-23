/**
 * Optimizes Unsplash image URLs by adjusting the width parameter.
 * @param {string} url - The original image URL
 * @param {number} width - The desired width (default: 600)
 * @returns {string} The optimized URL
 */
export const getOptimizedImageUrl = (url, width = 600) => {
    if (!url) return '';
    if (url.includes('images.unsplash.com')) {
        // Replace existing width param or append it
        if (url.includes('w=')) {
            return url.replace(/w=\d+/, `w=${width}`);
        }
        return `${url}&w=${width}`;
    }
    return url;
};
