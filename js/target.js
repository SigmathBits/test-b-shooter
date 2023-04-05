'use strict';


import { TARGET_MAX_SPEED, TARGET_MIN_SPEED, FPS, WORLD_HEIGHT, WORLD_WIDTH } from "./constants.js";
import { randomIntegerBetween, randomNumberBetween, clamp, loadImage } from "./general.js";

import { Entity } from "./entity.js"
import { Explosion } from "./explosion.js";


export class Target extends Entity {
    constructor(position, size) {
        super(position, size, 'target');

        this.velocity = { x: 0, y: 0 };
        
        this.newVelocityTimer = 0;

        this.spriteIndex = 0;
        this.sprite = null;

        this.muted = false;
    }

    async created() {
        this.spriteIndex = randomIntegerBetween(0, 2);
        this.sprite = await loadImage('img/asteroid-spritesheet.png');
    }

    destroyed() {
        const explosion = new Explosion(this.centre(), this.muted);
        this.world.addEntity(explosion);
    }

    /**
     * 
     * @param {Number} timeDeltaMS 
     */
    update(timeDeltaMS) {
        if (this.newVelocityTimer <= 0) {
            const speed = randomNumberBetween(TARGET_MIN_SPEED, TARGET_MAX_SPEED);
            const direction = randomNumberBetween(0, 2 * Math.PI);
            
            this.velocity = {
                x: speed * Math.cos(direction),
                y: speed * Math.sin(direction),
            }

            this.newVelocityTimer = randomIntegerBetween(0.5*FPS, 5*FPS);  // Between 0.5 and 5 seconds
        }

        this.position.x += this.velocity.x * timeDeltaMS / 1000;
        this.position.y += this.velocity.y * timeDeltaMS / 1000;

        if (this.position.x < 0 || WORLD_WIDTH < this.position.x + this.size.width) {
            this.velocity.x *= -1;
        }
        if (this.position.y < 0 || WORLD_HEIGHT < this.position.y + this.size.height) {
            this.velocity.y *= -1;
        }

        this.position.x = clamp(this.position.x, 0, WORLD_WIDTH - this.size.width);
        this.position.y = clamp(this.position.y, 0, WORLD_HEIGHT - this.size.height);

        this.newVelocityTimer--;
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
