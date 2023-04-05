'use strict';


import { DEBUG, FPS, UI_FPS, WORLD_HEIGHT, WORLD_WIDTH, PLAYER_SIZE, TARGET_COUNT, TARGET_SIZE, GAME_DURATION_MS } from "./constants.js";
import { loadImage, randomIntegerBetween } from "./general.js";

import { World } from "./world.js";
import { Player } from "./player.js";
import { Target } from "./target.js";


class Game {
    constructor() {
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.renderingContext = document.getElementById('play-area').getContext('2d');

        this.world = new World({ width: WORLD_WIDTH, height: WORLD_HEIGHT });
        this.player = new Player({ x: this.world.size.width / 2, y: this.world.size.height / 2 }, { width: PLAYER_SIZE, height: PLAYER_SIZE });

        this.muted = false;

        this.backgroundImage = null;

        this.timeRemainingMS = GAME_DURATION_MS;
        
        this._lastFrameTimeMS = 0;

        this._DEBUG_FPSData = [];
        this._DEBUG_drawCount = 0;
    }

    async run() {
        this.backgroundImage = await loadImage('img/space-background.png');

        this.renderingContext.canvas.width = window.innerWidth;
        this.renderingContext.canvas.height = window.innerHeight;
        window.addEventListener('resize', () => {
            this.renderingContext.canvas.width = window.innerWidth;
            this.renderingContext.canvas.height = window.innerHeight;
        });

        document.getElementById('mute-button').addEventListener('click', this.muteToggled.bind(this));

        // Create Entities
        for (let i = 0; i < TARGET_COUNT; i++) {
            const target = new Target({
                    x: randomIntegerBetween(0, this.world.size.width), 
                    y: randomIntegerBetween(0, this.world.size.height),
                }, 
                { width: TARGET_SIZE, height: TARGET_SIZE },
            );
            this.world.addEntity(target);
        }

        this.world.addEntity(this.player);

        this.world.setEntityProcessOrder(['player', 'bullet', 'target', 'explosion']);
        this.world.setup();

        // Start
        requestAnimationFrame(this.update.bind(this));
        this.updateUI();

        setTimeout(this.gameOver.bind(this), GAME_DURATION_MS);

        if (!DEBUG) {
            document.getElementById('debug').remove();
        }
    }

    /**
     * 
     * @param {MouseEvent} event 
     */
    muteToggled(event) {
        console.debug("Mute clicked!")
        this.muted = !this.muted;

        document.getElementById('mute-button-cross').classList.toggle('hidden', !this.muted);

        this.player.muted = this.muted;
        for (const target of this.world.entitiesByTag('target')) {
            target.muted = this.muted;
        }

        event.preventDefault();
    }

    gameOver() {
        this.world.destroyEntity(this.player);

        const missedTargets = this.world.entitiesByTag('target').length;
        const hitTargets = TARGET_COUNT - missedTargets;

        document.getElementById('shot-count').innerHTML = `${this.player.shotCount}`;
        document.getElementById('accuracy').innerHTML = `${this.player.shotCount ? Math.round(100 * hitTargets / this.player.shotCount) : 0}%`;
        document.getElementById('hit-count').innerHTML = `${hitTargets} (${Math.round(100 * hitTargets / TARGET_COUNT)}%)`;
        document.getElementById('miss-count').innerHTML = `${missedTargets} (${Math.round(100 * missedTargets / TARGET_COUNT)}%)`;

        document.getElementById('game-over').classList.remove('hidden');
    }

    /**
     * 
     * @param {Number} timeMS - The absolute time in milliseconds
     */
    update(timeMS) {
        setTimeout(() => { requestAnimationFrame(this.update.bind(this)) }, 1000 / FPS);

        const timeDeltaMS = timeMS - this._lastFrameTimeMS;
        this.timeRemainingMS = GAME_DURATION_MS - timeMS;

        this.world.update(timeDeltaMS);

        // === Rendering ===
        this.renderingContext.clearRect(0, 0, this.world.size.width, this.world.size.height);
        this.renderingContext.drawImage(this.backgroundImage, 0, 0);

        const draws = this.world.render(this.renderingContext);

        if (DEBUG) {
            this._DEBUG_FPSData.push((1000 / timeDeltaMS));
            if (this._DEBUG_FPSData.length > 2*FPS) {  // average past two seconds of framerates
                this._DEBUG_FPSData.shift();
            }
            this._DEBUG_drawCount = draws;
        }
        
        this._lastFrameTimeMS = timeMS;
    }

    updateUI() {
        const rawSeconds = Math.ceil(this.timeRemainingMS / 1_000);
        const minutes = Math.max(Math.floor(rawSeconds / 60), 0)
        const seconds = Math.max(rawSeconds % 60, 0);

        const timerElement = document.getElementById('timer');
        timerElement.innerHTML = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        if (rawSeconds <= 10) {
            timerElement.style.color = "red";
        }
        
        if (DEBUG) {
            const averageFPS = this._DEBUG_FPSData.length ? this._DEBUG_FPSData.reduce((a, b) => a + b) / this._DEBUG_FPSData.length : 0;
            document.getElementById('average-fps').innerText = averageFPS.toPrecision(3);
            document.getElementById('draw-count').innerText = this._DEBUG_drawCount.toString();
        }
        
        setTimeout(this.updateUI.bind(this), 1000 / UI_FPS);
    }
}


async function main() {
    const game = new Game();

    await game.run();

    console.log(" === Test B - Shooter Loaded! === ");
}


window.addEventListener('load', main);
