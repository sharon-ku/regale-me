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
  backgroundColor: 0xC86637,
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
    // calculate number of sheets/sets
    let numSets = Math.ceil(firstBook.pages.length / 2) + 1;
    console.log(numSets);

    // For each set:
    for (let i = 0; i < numSets; i++) {
      // create checkbox that tracks page flipping
      $(`<input type="checkbox" id="c${i + 1}">`).insertBefore(".flip-book");

      // create a sheet for each set of pages
      $(".flip-book").append(`<div class="flip" id="p${i + 1}"></div>`);
    } // for each set end

    // Pages in database plus cover page and first inner page
    let totalPages = firstBook.pages.length + 2;

    // Grab book content from Mongo
    for (let j = 0; j < totalPages; j++) {
      // If it's the cover page
      if (j === 0) {
        fillUpCoverPage(j);
        console.log(`added cover`);
      } //if j=0 end

      // On the back of cover page
      else if (j === 1) {
        fillUpFirstInnerPage(j);
        console.log(`added inner page 1`);
      }

      // If it's neither the first nor last page:
      else if (j != totalPages - 1) {
        fillUpInBetweenPages(j);
        console.log(`added p${j - 2}`);
      } // if neither first nor last end

      // Else if it's the last page, add prompt plus input field
      else if (j === totalPages - 1) {
        fillUpLastPage(j);
        
      } // else last page end
    } // for grab book end

    // If it's cover page, put cover page image and title
    function fillUpCoverPage(j) {
      let setNumber = (j / 2) + 1;
      $(`#p${setNumber}`).append(`
        <div class="front">
        <div id="cover-page"><img src="assets/images/page-cover.png" alt="cover page"></div>
        <p class="cover-title">${firstBook.title}</p>
        <label for="c${setNumber}" class="next-btn">Next</label>
        </div>
      `);
    }

    // If it's first inner page (back of cover), put image
    function fillUpFirstInnerPage(j) {
      // Put on back page (odd-number page)
      let setNumber = (j / 2) + 0.5;
      $(`#p${setNumber}`).append(`
      <div class="back">
      <div id="inner-page-image"><img src="assets/images/page-left.png" alt="inner page"></div>
      <label for="c${setNumber}" class="back-btn">Back</label>
      </div>
    `);
    }

    // If it's neither the first or last page, fill page with prompt and text
    function fillUpInBetweenPages(j) {
      let pageNumber = j - 2;

      // If it's an even-number page
      if (j % 2 == 0) {
        let setNumber = (j / 2) + 1;

        $(`#p${setNumber}`).append(`
          <div class="front">
          <div id="inner-page-image"><img src="assets/images/page-right.png" alt="inner page"></div>
          <h2 class="prompt">${firstBook.pages[pageNumber].prompt}</h2>
          <p class="pageText">${firstBook.pages[pageNumber].pageText}</p>
          <label for="c${setNumber}" class="next-btn">Next</label>
          </div>
        `);

      } else {
        let setNumber = (j / 2) + 0.5;

        // Put on back page (odd-number page)
        $(`#p${setNumber}`).append(`
          <div class="back">
          <div id="inner-page-image"><img src="assets/images/page-left.png" alt="inner page"></div>
          <h2 class="prompt">${firstBook.pages[pageNumber].prompt}</h2>
          <p class="pageText">${firstBook.pages[pageNumber].pageText}</p>
          <label for="c${setNumber}" class="back-btn">Back</label>
          </div>
        `);
      } // else odd page end
    }

    // Else if it's the last page, add prompt plus input field
    function fillUpLastPage(j) {
      let pageNumber = j - 2;

      // If it's an even-number page
      if (j % 2 == 0) {
        let setNumber = (j / 2) + 1;
        $(`#p${setNumber}`).append(`
        <div class="front">
        <h2 class="prompt">${firstBook.pages[pageNumber].prompt}</h2>
        <form id="message-form" action="">
          <textarea class="messageInputText" name="messageInputText" form="message-form" placeholder="Continue the story here..." required></textarea>
          <textarea class="promptInputText" name="promptInputText" form="message-form" placeholder="And add a prompt for the next writer... [This will appear at the top of the next page.]" required></textarea>
          <input type="submit" id="submit-text-button" value="Submit">
        </form>
        </div>
      `);

      console.log(`added last page even: p${j - 2}`);

      } else {
        let setNumber = (j / 2) + 0.5;
        // Put on back page(odd - number page)
        $(`#p${setNumber}`).append(`
          <div class="back">
          <h2 class="prompt">${firstBook.pages[pageNumber].prompt}</h2>
          <form id="message-form" action="">
            <textarea class="messageInputText" name="messageInputText" form="message-form" placeholder="Continue the story here..." required></textarea>
            <textarea class="promptInputText" name="promptInputText" form="message-form" placeholder="And add a prompt for the next writer... [This will appear at the top of the next page.]" required></textarea>
            <input type="submit" id="submit-text-button" value="Submit">
          </form>
          <label for="c${setNumber}" class="back-btn">Back</label>
          </div>
        `);

        console.log(`added last page odd: p${j - 2}`);
      } // else odd page end
    } // fillUpLastPage end


    // submit message
    $("#submit-text-button").click(function () {
      event.preventDefault();
      // console.log(`first thing ` + $("#message-form")[0]);
      let closeMessageForm = new FormData($("#message-form")[0]);

      console.log("checking data" + closeMessageForm);

      let inputText = {};

      // Display the key/value pairs: logs info from classes inputText and promptInputText
      for (var pair of closeMessageForm.entries()) {
        console.log(pair[0] + ", " + pair[1]);
        inputText[pair[0]] = pair[1];
      }

      console.log(`new information check1` + inputText.messageInputText);
      console.log(`new information check2` + inputText.promptInputText);
      console.log(`inputText is:` + inputText);

      clientSocket.emit(`sendMessage`, {
        newMessage: inputText.messageInputText,
        newPrompt: inputText.promptInputText
      });

      // deletes text in search bar
      document.getElementById(`message-form`).reset();
      // $("#messageBox").empty();
    });



    // // UNUSED: Grab book content from Mongo
    // for (let i = 0; i < firstBook.pages.length; i++) {
    //   // If it's an even-number page
    //   if (i % 2 == 0) {
    //     $(`#p${(i / 2) + 1}>.front>.prompt`).text(firstBook.pages[i].prompt);
    //     $(`#p${(i / 2) + 1}>.front>.pageText`).text(firstBook.pages[i].pageText);
    //   } else {
    //     // Put on back page (odd-number page)
    //     $(`#p${(i / 2) + 0.5}>.back>.prompt`).text(firstBook.pages[i].prompt);
    //     $(`#p${(i / 2) + 0.5}>.back>.pageText`).text(firstBook.pages[i].pageText);
    //   }
    // }

    /********************************
    * HANDLE PAGE FLIPPING
    ********************************/
    // numPages will be number of dB pages
    // let numPages = 6;
    // numSheets = Math.ceil(numPages / 2)
    // let numSheets = 3;
    // calculate number of sheets/sets
    let numSheets = Math.ceil(firstBook.pages.length / 2) + 1;

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
          
          // Hide the front page underneath
          setTimeout(() => {
            $(`#p${i}>.front`).css({ "display": "none" });
          }, 1000);
          

        } else {
          // If page is flipped backward
          $(`.flip-book>#p${i}`).css({ "transform": "" });
          // Reset z-index of that specific page
          $(`#p${i}`).css({ "z-index": `${(numSheets + 1) - i}` });

          // Reshow the hidden front page underneath
          $(`#p${i}>.front`).css({ "display": "block" });
        }
      });
    } //setup end


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
  }); //client socket newBooks end


  // display books from database
  clientSocket.on("updateBooks", function (firstBook) {
    console.log(`updated the book`);
  }); //client socket updateBooks end

} //setup end

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