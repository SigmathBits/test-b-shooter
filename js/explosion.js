'use strict';


import { FPS, EXPLOSION_DURATION_MS, EXPLOSION_SIZE } from "./constants.js";
import { loadImage } from "./general.js";

import { Entity } from "./entity.js";


export class Explosion extends Entity {
    /**
     * 
     * @param {Object} centre 
     * @param {Number} centre.x 
     * @param {Number} centre.y
     * @param {Boolean} muted 
     */
    constructor({ x, y }, muted=false) {
        const position = { x: x - EXPLOSION_SIZE/2, y: y - EXPLOSION_SIZE/2 };
        super(position, { width: EXPLOSION_SIZE, height: EXPLOSION_SIZE }, 'explosion');

        this.spriteIndex = 0;
        this.sprite = null;
        
        this.spriteFrameDuration = Math.round(EXPLOSION_DURATION_MS / 2 / 1000 * FPS);

        this.muted = muted;
    }

    async created() {
        this.sprite = await loadImage('img/explosion-spritesheet.png');

        if (!this.muted) {
            const explosionSound = new Audio('sfx/170144__timgormly__8-bit-explosion2.wav');
            explosionSound.volume = 0.1;
            explosionSound.play();
        }

        setTimeout(this.destroy.bind(this), EXPLOSION_DURATION_MS);
    }

    update() {
        if (this.spriteFrameDuration <= 0) {
            this.spriteIndex = 1;
        }

        this.spriteFrameDuration--;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     */
    render(context) {
        if (!this.sprite) return;

        context.drawImage(
            this.sprite,
            this.spriteIndex * this.size.width, 0,
            this.size.width, this.size.height,
            this.position.x, this.position.y,
            this.size.width, this.size.height,
        );
    }
}
