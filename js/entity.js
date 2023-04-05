'use strict';


import { World } from "./world.js";


export class Entity {
    /**
     * 
     * @param {Object} position 
     * @param {Number} position.x
     * @param {Number} position.y
     * @param {Object} size 
     * @param {Number} size.x
     * @param {Number} size.y
     * @param {String} tag
     * @param {String} colour
     * @param {World} world
     */
    constructor({ x, y } = {}, { width, height }, tag='entity', world=null) {
        this.position = { x, y };
        this.size = { width, height };
        this.tag = tag;
        this.world = world;
    }

    /**
     * 
     * @returns {Object}
     */
    centre() {
        return {
            x: this.position.x + this.size.width/2,
            y: this.position.y + this.size.height/2,
        }
    }

    /**
     * 
     * @returns {Object}
     */
    rect() {
        return { ...this.position, ...this.size };
    }

    /**
     * Called when the entity is first added to the world
     */
    created() {
        
    }

    /**
     * Called when the entity is removed from the world
     */
    destroyed() {

    }

    destroy() {
        this.world.destroyEntity(this);
    }
 
    /**
     * 
     * @param {Object} rectangle
     * @param {Number} rectangle.x 
     * @param {Number} rectangle.y 
     * @param {Number} rectangle.width 
     * @param {Number} rectangle.height
     * @returns {Boolean}
     */
    intersects({ x, y, width, height }) {
        return x < this.position.x + this.size.width  && this.position.x < x + width
            && y < this.position.y + this.size.height && this.position.y < y + height;
    }

    /**
     * 
     * @param {KeyboardEvent} event 
     */
    onkeydown(event) {

    }

    /**
     * 
     * @param {KeyboardEvent} event 
     */
    onkeyup(event) {

    }

    /**
     * 
     * @param {MouseEvent} event 
     */
    onclick(event) {

    }

    /**
     * 
     * @param {FocusEvent} event 
     */
    onwindowblur(event) {

    }

    /**
     * Called every frame
     * @param {Number} timeDeltaMS - The time elapsed since the last frame in milliseconds
     */
    update(timeDeltaMS) {

    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context ds
     */
    render(context) {
        context.strokeStyle = "#FF00FF";
        context.strokeRect(
            this.position.x, this.position.y, 
            this.size.width, this.size.height,
        );
    }
}
