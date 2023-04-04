'use strict';


import { DEBUG, FPS, WORLD_HEIGHT, WORLD_WIDTH, PLAYER_SIZE, ENEMY_COUNT, ENEMY_SIZE } from "./constants.js";
import { clamp, randomIntegerBetween } from "./general.js";

import { World } from "./world.js";
import { Player } from "./player.js";
import { Enemy } from "./enemy.js";


const MS_PER_MINUTE = 60*1_000;


class Game {
    constructor() {
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.renderingContext = document.getElementById('play-area').getContext('2d');

        this.world = new World({ width: WORLD_WIDTH, height: WORLD_HEIGHT });
        this.player = new Player({ x: this.world.size.width / 2, y: this.world.size.height / 2 }, { width: PLAYER_SIZE, height: PLAYER_SIZE });

        this.timeRemainingMS = 0;
        
        this._lastTimeMS = 0;

        this._DEBUG_FPSData = [];
        this._DEBUG_drawCount = 0;
    }

    run() {
        this.renderingContext.canvas.width = window.innerWidth;
        this.renderingContext.canvas.height = window.innerHeight;
        window.addEventListener('resize', () => {
            this.renderingContext.canvas.width = window.innerWidth;
            this.renderingContext.canvas.height = window.innerHeight;
        });

        // Create Entities
        for (let i = 0; i < ENEMY_COUNT; i++) {
            const enemy = new Enemy({
                    x: randomIntegerBetween(0, this.world.size.width), 
                    y: randomIntegerBetween(0, this.world.size.height),
                }, 
                { width: ENEMY_SIZE, height: ENEMY_SIZE },
            );
            this.world.addEntity(enemy);
        }

        this.world.addEntity(this.player);

        this.world.setEntityProcessOrder(['player', 'bullet', 'enemy', 'explosion']);
        this.world.setup();

        // Start
        requestAnimationFrame(this.update.bind(this));
        this.updateUI();

        setTimeout(this.gameOver.bind(this), MS_PER_MINUTE);

        if (!DEBUG) {
            document.getElementById('debug').remove();
        }
    }

    gameOver() {
        this.world.destroyEntity(this.player);

        const missedEnemies = this.world.entitiesByTag('enemy').length;
        const hitEnemies = ENEMY_COUNT - missedEnemies;

        document.getElementById('shot-count').innerHTML = `${this.player.shotCount}`;
        document.getElementById('accuracy').innerHTML = `${this.player.shotCount ? Math.round(100 * hitEnemies / this.player.shotCount) : 0}%`;
        document.getElementById('hit-count').innerHTML = `${hitEnemies} (${Math.round(100 * hitEnemies / ENEMY_COUNT)}%)`;
        document.getElementById('miss-count').innerHTML = `${missedEnemies} (${Math.round(100 * missedEnemies / ENEMY_COUNT)}%)`;

        document.getElementById('game-over').classList.remove('hidden');
    }

    /**
     * 
     * @param {Number} timeMS - The absolute time in milliseconds
     */
    update(timeMS) {
        setTimeout(() => { requestAnimationFrame(this.update.bind(this)) }, 1000 / FPS);

        const timeDeltaMS = timeMS - this._lastTimeMS;
        this.timeRemainingMS = MS_PER_MINUTE - timeMS;

        this.world.update(timeDeltaMS);

        this.world.viewport = {
            x: clamp(this.player.position.x + this.player.size.width/2 - window.innerWidth/2, 0, this.world.size.width - window.innerWidth),
            y: clamp(this.player.position.y + this.player.size.height/2 - window.innerHeight/2, 0, this.world.size.height - window.innerHeight),
        }

        // === Rendering ===
        this.renderingContext.clearRect(0, 0, this.world.size.width, this.world.size.height);

        // DEBUG: background grid
        if (DEBUG) {
            for (let x = 0; x < this.world.size.width; x += 50) {
                for (let y = 0; y < this.world.size.height; y += 50) {
                    this.renderingContext.fillStyle = "#000000";
                    this.renderingContext.fillRect(x, y, 5, 5);
                }
            }
        }

        const draws = this.world.render(this.renderingContext);

        if (DEBUG) {
            this._DEBUG_FPSData.push((1000 / timeDeltaMS));
            if (this._DEBUG_FPSData.length > 2*FPS) {  // average past two seconds of framerates
                this._DEBUG_FPSData.shift();
            }
            this._DEBUG_drawCount = draws;
        }
        
        this._lastTimeMS = timeMS;
    }

    updateUI() {
        const rawSeconds = Math.ceil(this.timeRemainingMS / 1_000);
        const minutes = Math.max(Math.floor(rawSeconds / 60), 0)
        const seconds = Math.max(rawSeconds % 60, 0);

        document.getElementById('timer').innerHTML = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        
        if (DEBUG) {
            const averageFPS = this._DEBUG_FPSData.length ? this._DEBUG_FPSData.reduce((a, b) => a + b) / this._DEBUG_FPSData.length : 0;
            document.getElementById('average-fps').innerText = averageFPS.toPrecision(3);
            document.getElementById('draw-count').innerText = this._DEBUG_drawCount.toString();
        }
        
        setTimeout(this.updateUI.bind(this), 250);
    }
}


function main() {
    const game = new Game();

    game.run();

    console.log(" === Test B - Shooter Loaded! === ");
}


window.addEventListener('load', main);
