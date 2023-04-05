'use strict';


import { PLAYER_SPEED, MAX_BULLET_COUNT, BULLET_SIZE } from "./constants.js";
import { normalised, clamp, loadImage } from "./general.js";

import { Entity } from "./entity.js";
import { Bullet } from "./bullet.js";
import { Explosion } from "./explosion.js";


export class Player extends Entity {
    constructor(position, size) {
        super(position, size, 'player');

        this.sprite = null;
        
        this.shotCount = 0;
        
        this.keyMap = {
            left: false, right: false,
            up: false, down: false,
        };
        
        this.muted = false;
    }

    async created() {
        this.sprite = await loadImage('img/ufo.png');
    }

    destroyed() {
        const explosion = new Explosion(this.centre(), this.muted);

        this.world.addEntity(explosion);
    }

    /**
     * 
     * @param {KeyboardEvent} event 
     */
    onkeydown(event) {
        if (event.repeat) return;

        switch (event.key.toLowerCase()) {
            case 'a':
                this.keyMap.left = true;
                break;
            case 'd':
                this.keyMap.right = true;
                break;
            case 'w':
                this.keyMap.up = true;
                break;
            case 's':
                this.keyMap.down = true;
                break;
            default:
                break;
        }
    }

    /**
     * 
     * @param {KeyboardEvent} event 
     */
    onkeyup(event) {
        switch (event.key.toLowerCase()) {
            case 'a':
                this.keyMap.left = false;
                break;
            case 'd':
                this.keyMap.right = false;
                break;
            case 'w':
                this.keyMap.up = false;
                break;
            case 's':
                this.keyMap.down = false;
                break;
            default:
                break;
        }
    }

    /**
     * 
     * @param {FocusEvent} event 
     */
    onwindowblur(event) {
        this.keyMap = {
            left: false, right: false,
            up: false, down: false,
        };
    }

    /**
     * 
     * @param {MouseEvent} event 
     */
    onclick(event) {
        if (this.world.entitiesByTag('bullet').length >= MAX_BULLET_COUNT) return;

        const playerCentre = this.centre();
        const cursorPosition = { x: this.world.viewport.x + event.x, y: this.world.viewport.y + event.y };

        const position = {
            x: playerCentre.x - BULLET_SIZE/2,
            y: playerCentre.y - BULLET_SIZE/2,
        };

        const direction = normalised({
            x: cursorPosition.x - playerCentre.x,
            y: cursorPosition.y - playerCentre.y,
        });

        const bullet = new Bullet(position, direction);
        this.world.addEntity(bullet);

        if (!this.muted) {
            const fireSound = new Audio('sfx/328011__astrand__retro-blaster-fire.wav');
            fireSound.volume = 0.5;
            fireSound.play();
        }

        this.shotCount++;
    }

    /**
     * 
     * @param {Number} timeDeltaMS 
     */
    update(timeDeltaMS) {
        const input = normalised({ x: this.keyMap.right - this.keyMap.left, y: this.keyMap.down - this.keyMap.up });

        const velocity = { x: PLAYER_SPEED * input.x, y: PLAYER_SPEED * input.y };

        this.position.x += velocity.x * timeDeltaMS / 1000;
        this.position.y += velocity.y * timeDeltaMS / 1000;

        this.position.x = clamp(this.position.x, 0, this.world.size.width - this.size.width);
        this.position.y = clamp(this.position.y, 0, this.world.size.height - this.size.height);

        this.world.viewport = {
            x: clamp(this.position.x + this.size.width/2 - window.innerWidth/2, 0, this.world.size.width - window.innerWidth),
            y: clamp(this.position.y + this.size.height/2 - window.innerHeight/2, 0, this.world.size.height - window.innerHeight),
        }
    }

    /**
     * @param {CanvasRenderingContext2D} context
     */
    render(context) {
        if (!this.sprite) return;

        context.drawImage(this.sprite, this.position.x, this.position.y);
    }
}
