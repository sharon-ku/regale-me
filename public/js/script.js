/**
Title of Project
Author Name

This is a template. You must fill in the title,
author, and this description to match your project!
*/

"use strict";

// Create a PIXI canvas
// For nice resolution on circle, source: https://stackoverflow.com/questions/41932258/how-do-i-antialias-graphics-circle-in-pixijs
let app = new PIXI.Application({
    transparent: false,
    // width: 999, //640
    // height: 487, //360
    width: window.innerWidth,
    height: window.innerHeight,
    autoResize: true,
    // resolution: devicePixelRatio,
    antialias: true,
});
document.body.appendChild(app.view);

// // Lets create a red square, this isn't 
// // necessary only to show something that can be position
// // to the bottom-right corner
// const rect = new PIXI.Graphics()
//     .beginFill(0xff0000)
//     .drawRect(-100, -100, 100, 100);

// // Add it to the stage
// app.stage.addChild(rect);

/********************************
 * BOOK SETUP
********************************/
let book = new PIXI.Graphics()
    .beginFill(0xffffff);


book.drawRect(app.screen.width / 2, app.screen.height / 2, 800, 500);
// center the sprite's anchor point
// book.anchor.set(0.5);
// book.x = app.screen.width / 2;
// book.y = app.screen.height / 2;
book.pivot.x = book.width / 2;
book.pivot.y = book.height / 2;
// // Add it to the stage
app.stage.addChild(book);



/********************************
 * RESIZE DOCUMENT AUTOMATICALLY
 * https://jsfiddle.net/bigtimebuddy/oaLwp0p9/
********************************/


// Listen for window resize events
window.addEventListener('resize', resize);

// Resize function window
function resize() {
    // Resize the renderer
    app.renderer.resize(window.innerWidth, window.innerHeight);

    // You can use the 'screen' property as the renderer visible
    // area, this is more useful than view.width/height because
    // it handles resolution
    // rect.position.set(app.screen.width, app.screen.height);
    // book.position.set(app.screen.width, app.screen.height);
}

resize();
// end resize document