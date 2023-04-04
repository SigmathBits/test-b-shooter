'use strict';


import { EXPLOSION_DURATION_MS } from "./constants.js";

import { Entity } from "./entity.js";


export class Explosion extends Entity {
    constructor({ x, y }, size) {
        const position = { x: x - size.width/2, y: y - size.height/2 };
        super(position, size, 'explosion');
    }

    created() {
        setTimeout(this.destroy.bind(this), EXPLOSION_DURATION_MS);
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     */
    render(context) {
        const centre = this.centre();

        context.fillStyle = "#EE8800";
        context.beginPath();
        context.arc(centre.x, centre.y, this.size.width/2, 0, 2 * Math.PI);
        context.fill();
    }
}
