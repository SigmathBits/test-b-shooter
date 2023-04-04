'use strict';


import { Entity } from "./entity.js";


export class World {
    /**
     * 
     * @param {Object} size
     * @param {Number} size.width
     * @param {Number} size.height 
     * @param {Object} viewport
     * @param {Number} viewport.x
     * @param {Number} viewport.y
     */
    constructor({ width, height }, { x = 0, y = 0 } = {}) {
        this.size = { width, height };
        this.viewport = { x, y };

        /**
         * @type {Object} - object map of tags to arrays of Entites
         */
        this.entities = {};

        /**
         * @type {String[]} - Entity process order by tags
         */
        this._entityProcessOrder = [];
    }

    setup() {
        window.addEventListener('keydown', this.onkeydown.bind(this));
        window.addEventListener('keyup', this.onkeyup.bind(this));
        window.addEventListener('click', this.onclick.bind(this));
        window.addEventListener('blur', this.onwindowblur.bind(this));
    }

    /**
     * @returns {Entity[]}
     */
    allEntities() {
        const entityOrder = Object.keys(this.entities);

        for (const tag of this._entityProcessOrder) {
            const index = entityOrder.indexOf(tag);
            if (index === -1) continue;

            entityOrder.splice(index, 1);
            entityOrder.push(tag);
        }
        
        const allEntities = [];
        for (const tag of entityOrder) {
            allEntities.push(...this.entities[tag]);
        }

        return allEntities;
    }

    /**
     * 
     * @param {Entity[]} tag 
     * @returns 
     */
    entitiesByTag(tag) {
        return this.entities[tag] || [];
    }

    /**
     * Set order to process and render Entities by tag
     * @param {String[]} entityOrder 
     */
    setEntityProcessOrder(entityOrder) {
        this._entityProcessOrder = entityOrder;
    }

    /**
     * 
     * @param {Entity} entity 
     */
    addEntity(entity) {
        if (this.entities[entity.tag]) {
            this.entities[entity.tag].push(entity);
        } else {
            this.entities[entity.tag] = [entity];
        }
        
        entity.world = this;
        entity.created();
    }

    /**
     * 
     * @param {Entity} entity 
     * @returns 
     */
    destroyEntity(entity) {
        const index = this.entities[entity.tag].indexOf(entity);
        if (index === -1) return;

        this.entities[entity.tag].splice(index, 1);

        entity.destroyed();
    }

    /**
     * 
     * @param {KeyboardEvent} event 
     */
    onkeydown(event) {
        for (const entity of this.allEntities()) {
            entity.onkeydown(event);
        }
    }

    /**
     * 
     * @param {KeyboardEvent} event 
     */
    onkeyup(event) {
        for (const entity of this.allEntities()) {
            entity.onkeyup(event);
        }
    }

    /**
     * @param {MouseEvent} event
     */
    onclick(event) {
        for (const entity of this.allEntities()) {
            entity.onclick(event);
        }
    }

    /**
     * @param {FocusEvent} event
     */
    onwindowblur(event) {
        for (const entity of this.allEntities()) {
            entity.onwindowblur();
        }
    }

    /**
     * 
     * @param {Number} timeDeltaMS 
     */
    update(timeDeltaMS) {
        for (const entity of this.allEntities()) {
            entity.update(timeDeltaMS);
        }
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     * @returns {Number} The number of draws
     */
    render(context) {
        var draws = 0;
        for (const entity of this.allEntities().reverse()) {
            // Only render what is on screen
            if (this.viewport.x < entity.position.x + entity.size.width && entity.position.x < this.viewport.x + window.innerWidth
                 && this.viewport.y < entity.position.y + entity.size.height && entity.position.y < this.viewport.y + window.innerHeight) {
                entity.render(context);
                draws++;
            }
        }

        context.setTransform(1, 0, 0, 1, -this.viewport.x, -this.viewport.y);

        return draws;
    }
}
