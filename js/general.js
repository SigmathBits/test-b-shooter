'use strict';


/**
 * Return a random integer within the range [min, max)
 * @param {Number} min 
 * @param {Number} max 
 * @returns {Number}
 */
export function randomIntegerBetween(min, max) {
    return Math.floor(min + (max - min)*Math.random());
}


/**
 * Return a random decimal number within the range (min, max)
 * @param {Number} min 
 * @param {Number} max 
 * @returns {Number}
 */
export function randomNumberBetween(min, max) {
    return min + (max - min)*Math.random();
}


/**
 * Clamps a value between a min and max value
 * @param {Number} value 
 * @param {Number} min 
 * @param {Number} max 
 * @returns {Numbers}
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}


/**
 * Normalise a vector object using its x and y properties
 * @param {Object} vector 
 * @param {Number} vector.x 
 * @param {Number} vector.y
 * @returns {Object}
 */
export function normalised({ x, y }) {
    const magnitude = Math.sqrt(x**2 + y**2);
    if (magnitude === 0) return { x: 0, y: 0 };

    return {
        x: x / magnitude,
        y: y / magnitude,
    }
}
