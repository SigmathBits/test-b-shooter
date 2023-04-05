'use strict';


import { BULLET_SIZE, BULLET_SPEED } from "./constants.js";

import { Entity } from "./entity.js";


export class Bullet extends Entity {
    /**
     * 
     * @param {Object} position 
     * @param {Object} directionVector - A normalised direction vector 
     * @param {Number} directionVector.x
     * @param {Number} directionVector.y
     */
    constructor(position, { x, y }) {
        super(position, { width: BULLET_SIZE, height: BULLET_SIZE }, 'bullet');
        
        this.direction = { x, y };
    }

    update(timeDeltaMS) {
        if (this.position.x + this.size.width < this.world.viewport.x || this.position.x > this.world.viewport.x + window.innerWidth
            || this.position.y + this.size.height < this.world.viewport.y || this.position.y > this.world.viewport.y + window.innerHeight) {
           this.destroy();
           return;
       }

       for (const target of this.world.entitiesByTag('target')) {
           if (Math.abs(this.x - target.x) > 2*BULLET_SPEED || Math.abs(this.y - target.y) > 2*BULLET_SPEED) {
               break;
           }

           if (this.intersects(target.rect())) {
               this.destroy();
               this.world.destroyEntity(target);
               break;
           }
       }

        this.position.x += BULLET_SPEED * this.direction.x * timeDeltaMS / 1000;
        this.position.y += BULLET_SPEED * this.direction.y * timeDeltaMS / 1000;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     */
    render(context) {
        const centre = this.centre();
        
        context.fillStyle = "#22FF33";
        context.beginPath();
        context.arc(centre.x, centre.y, this.size.width/2, 0, 2 * Math.PI);
        context.fill();
    }
}
