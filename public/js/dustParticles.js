
/********************************
 * DUST PARTICLES
********************************/
let d = new Dust(PIXI);

gameLoop();

function gameLoop() {
    requestAnimationFrame(gameLoop);
    d.update();
    // console.log(`updating dust`);
}

// import { Sprite, Texture } from 'pixi.js';

// PIXI.Texture.addToCache["star.png"];

// const starTexture = Texture.from('star.png');
let starTexture = PIXI.Texture.from('assets/images/star.png');

//Create the `ParticleContainer` and add it to the `stage`
let starContainer = new PIXI.ParticleContainer(
    15000,
    { alpha: true, scale: true, rotation: true, uvs: true }
);
app.stage.addChild(starContainer);

//Create star particles and add them to the `starContainer`
let stars = d.create(
    128, 128,
    () => new PIXI.Sprite(
        // PIXI.utils.TextureCache["star.png"]
        starTexture
    ),
    starContainer,
    50
);

// let particles = stars;

//  PARTICLE EMITTER

let particleStream = d.emitter(
    100,
    () => d.create()
);

// let particleStream = d.emitter(
//     100,
//     () => particles.create(
//         128, 128,
//         () => new PIXI.Sprite(
//             // PIXI.utils.TextureCache["star.png"]
//             starTexture
//         ),
//         app.stage,
//         30,
//         0.1,
//         false,
//         3.14, 6.28,
//         16, 32,
//         2, 5
//     )
// );

particleStream.play();
// particleStream.stop();