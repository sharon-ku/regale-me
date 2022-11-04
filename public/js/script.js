/**
Title of Project
Author Name

This is a template. You must fill in the title,
author, and this description to match your project!
*/

"use strict";

// To allow client to connect to socket
let clientSocket;
let socketId = -1;
let running = false;

// Create a PIXI canvas
// For nice resolution on circle, source: https://stackoverflow.com/questions/41932258/how-do-i-antialias-graphics-circle-in-pixijs
let app = new PIXI.Application({
    transparent: false,
    // width: 999, //640
    // height: 487, //360
    backgroundColor: 0xbdb6b5,
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
 * PIXI BOOK SETUP
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
 * BOOK DOM SETUP
********************************/

/* ----------------------------------------
setup()
-----------------------------------------*/
setup();

function setup() {
    // // grab user data from local storage and store it in userInfo variable
    // userInfo = JSON.parse(localStorage.getItem(`user`))[0];
    // console.log(userInfo);
    // // now delete user data from local storage
    // localStorage.removeItem(`user`);

    // FOR WORKING WEBSITE, UNCOMMENT THIS:
    //   clientSocket = io();

    // FOR TESTS, UNCOMMENT THIS;
    clientSocket = io.connect("http://localhost:4200");

    clientSocket.on("connect", function (data) {
        console.log("connected");
        // put code here that should only execute once the client is connected
        /*********************************************************************************************/
        // NEW:: pass the userID from db so server can CONNECT the userID and socket id together ... */
        /********************************************************************************************/
        // clientSocket.emit("join", userInfo);
        clientSocket.emit("join");
        // handler for receiving client id
        clientSocket.on("joinedClientId", function (data) {
            // socketId = data;
            // console.log("myId " + socketId);
            console.log("script" + data);

            clientSocket.emit("requestBooks");

            // only start draw once running is true
            running = true;
        });
    });

    // display books from database
    clientSocket.on("newBooks", function (firstBook) {

        let numSets = Math.ceil(firstBook.pages.length / 2);
        console.log(numSets);

        for (let i = 0; i < numSets; i++) {
            $(`<input type="checkbox" id="c${i + 1}">`).insertBefore(".flip-book");
            console.log(`added checkbox`);
        }

        $(".flip-book").append(`
        <div class="flip" id="p1">
          <div class="front">
            <h2 class="prompt">Apple</h2>
            <p class="pageText">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatem sequi ut, totam
              temporibus eveniet
              aliquam officiis quasi laboriosam dolor eligendi sit! Corrupti dicta nulla non, harum blanditiis vero iusto
              sapiente?</p>
            <label for="c1" class="next-btn">Next</label>
          </div>
  
          <div class="back">
            <h2 class="prompt">back1</h2>
            <p class="pageText">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatem sequi ut, totam
              temporibus eveniet
              aliquam officiis quasi laboriosam dolor eligendi sit! Corrupti dicta nulla non, harum blanditiis vero iusto
              sapiente?</p>
  
            <label for="c1" class="back-btn">Back</label>
          </div>
  
  
        </div>
  
        <div class="flip" id="p2">
          <div class="front">
            <h2 class="prompt">Strawberry</h2>
            <p class="pageText">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatem sequi ut, totam
              temporibus eveniet
              aliquam officiis quasi laboriosam dolor eligendi sit! Corrupti dicta nulla non, harum blanditiis vero iusto
              sapiente?</p>
            <label for="c2" class="next-btn">Next</label>
          </div>
  
          <div class="back">
            <h2 class="prompt">back2</h2>
            <p class="pageText">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatem sequi ut, totam
              temporibus eveniet
              aliquam officiis quasi laboriosam dolor eligendi sit! Corrupti dicta nulla non, harum blanditiis vero iusto
              sapiente?</p>
            <label for="c2" class="back-btn">Back</label>
          </div>
        </div>
  
        <div class="flip" id="p3">
          <div class="front">
            <h2 class="prompt">Pineapple</h2>
            <p class="pageText">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatem sequi ut, totam
              temporibus eveniet
              aliquam officiis quasi laboriosam dolor eligendi sit! Corrupti dicta nulla non, harum blanditiis vero iusto
              sapiente?</p>
            <label for="c3" class="next-btn">Next</label>
          </div>
  
          <div class="back">
            <h2 class="prompt">back3</h2>
            <p class="pageText">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatem sequi ut, totam
              temporibus eveniet
              aliquam officiis quasi laboriosam dolor eligendi sit! Corrupti dicta nulla non, harum blanditiis vero iusto
              sapiente?</p>
     
            <label for="c3" class="back-btn">Back</label>
          </div>
        </div>
  
        
        `);


        // Create correct number of pages
        for (let i = 0; i < firstBook.pages.length; i++) {
            // If it's an even-number page
            if (i % 2 == 0) {

            } else {
                // Put on back page (odd-number page)

            }
        }


        // Grab book content from Mongo
        for (let i = 0; i < firstBook.pages.length; i++) {
            // If it's an even-number page
            if (i % 2 == 0) {
                $(`#p${(i / 2) + 1}>.front>.prompt`).text(firstBook.pages[i].prompt);
                $(`#p${(i / 2) + 1}>.front>.pageText`).text(firstBook.pages[i].pageText);
            } else {
                // Put on back page (odd-number page)
                $(`#p${(i / 2) + 0.5}>.back>.prompt`).text(firstBook.pages[i].prompt);
                $(`#p${(i / 2) + 0.5}>.back>.pageText`).text(firstBook.pages[i].pageText);
            }
        }

        /********************************
 * HANDLE PAGE FLIPPING
********************************/
        // numPages will be number of dB pages
        // let numPages = 6;
        // numSheets = Math.ceil(numPages / 2)
        let numSheets = 3;

        setPageZIndex();

        // Set initial z-index of all pages
        function setPageZIndex() {
            for (let i = 1; i < numSheets + 1; i++) {
                $(`#p${i}`).css({ "z-index": `${(numSheets + 1) - i}` });
            }
        }

        // Flip pages by changing CSS
        for (let i = 1; i < numSheets + 1; i++) {
            $(`#c${i}`).change(function () {
                // If page is flipped forward
                if (this.checked) {

                    $(`#c${i}:checked~.flip-book>#p${i}`).css({ "transform": "rotateY(-180deg)", "z-index": `${i}` });
                } else {
                    // If page is flipped backward
                    $(`.flip-book>#p${i}`).css({ "transform": "" });

                    // Reset z-index of that specific page
                    $(`#p${i}`).css({ "z-index": `${(numSheets + 1) - i}` });
                }
            });
        }



        // // fill up book content
        // // left page
        // $(`#left-page>.prompt`).text(firstBook.pages[0].prompt);
        // $(`#left-page>.pageText`).text(firstBook.pages[0].pageText);

        // // right page
        // $(`#right-page>.prompt`).text(firstBook.pages[1].prompt);
        // $(`#right-page>.pageText`).text(firstBook.pages[1].pageText);


        // create books
        // for (let i = 0; i < results.length; i++) {
        //     console.log(results[i]);
        //     // keep some distance from borders

        //     //   let x = results[i].x;
        //     //   let y = results[i].y;
        //     //   let image = random(podImages);
        //     //   let taken = results[i].taken;

        //     //   // resize canvas to windowWidth and windowHeight
        //     //   let pod = new Greenhouse(x, y, image, windowWidth, windowHeight, taken);
        //     //   pods.push(pod);
        // }

        // Request the user greenhouse positions to be found
        // clientSocket.emit("getUserPodPositions");
    });

}

// /********************************
//  * HANDLE PAGE FLIPPING
// ********************************/
// // numPages will be number of dB pages
// // let numPages = 6;
// // numSheets = Math.ceil(numPages / 2)
// let numSheets = 3;

// setPageZIndex();

// // Set initial z-index of all pages
// function setPageZIndex() {
//     for (let i = 1; i < numSheets + 1; i++) {
//         $(`#p${i}`).css({ "z-index": `${(numSheets + 1) - i}` });
//     }
// }

// // Flip pages by changing CSS
// for (let i = 1; i < numSheets + 1; i++) {
//     $(`#c${i}`).change(function () {
//         // If page is flipped forward
//         if (this.checked) {

//             $(`#c${i}:checked~.flip-book>#p${i}`).css({ "transform": "rotateY(-180deg)", "z-index": `${i}` });
//         } else {
//             // If page is flipped backward
//             $(`.flip-book>#p${i}`).css({ "transform": "" });

//             // Reset z-index of that specific page
//             $(`#p${i}`).css({ "z-index": `${(numSheets + 1) - i}` });
//         }
//     });
// }



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
    // Fix book position to middle of page
    book.position.set(app.screen.width, app.screen.height);
}

resize();
// end resize document