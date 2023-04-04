'use strict';


import { ENEMY_MAX_SPEED, ENEMY_MIN_SPEED, FPS, WORLD_HEIGHT, WORLD_WIDTH } from "./constants.js";
import { randomIntegerBetween, randomNumberBetween, clamp } from "./general.js";

import { Entity } from "./entity.js"
import { Explosion } from "./explosion.js";


export class Enemy extends Entity {
    constructor(position, size) {
        super(position, size, 'enemy', "#FF0000");

        this.velocity = { x: 0, y: 0 };
        
        this.newVelocityTimer = 0;
    }

    destroyed() {
        const explosion = new Explosion(this.centre(), { width: 2*this.size.width, height: 2*this.size.height });
        this.world.addEntity(explosion);
    }

    /**
     * 
     * @param {Number} timeDeltaMS 
     */
    update(timeDeltaMS) {
        if (this.newVelocityTimer <= 0) {
            const speed = randomNumberBetween(ENEMY_MIN_SPEED, ENEMY_MAX_SPEED);
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
}
