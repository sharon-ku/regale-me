/**
Regale Me
Sharon Ku

Client-side script
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
// total number of pages in a book
let totalPages;
// number of sets in the book
let numSets;

// where the input values will be stored;
let inputText = {};

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
    numSets = Math.ceil(firstBook.pages.length / 2) + 1;
    console.log(numSets);

    // For each set:
    for (let i = 0; i < numSets; i++) {
      let setNumber = i;
      // create checkbox that tracks page flipping + new sheet
      createNewSet(setNumber);
    } // for each set end

    // Pages in database plus cover page and first inner page
    totalPages = firstBook.pages.length + 2;

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
        let lastPageNumber = j;
        let pageNumber = j - 2;
        let lastPagePrompt = firstBook.pages[pageNumber].prompt;
        fillUpLastPage(j, lastPagePrompt);

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


    // Handle button clicks:
    // // If the "Next" button is clicked:
    nextButtonClicked();
    // // If the "Submit" button clicked:
    submitButtonClicked();


    // --------------------------------
    // * HANDLE INITIAL PAGE FLIPPING
    // --------------------------------/
    handleInitialPageFlipping();

    // /********************************
    // * UNUSED
    // ********************************/
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


  /********************************
   * HANDLE BUTTON CLICKS
  ********************************/

  // -----------------
  // * Next button
  // -----------------/
  function nextButtonClicked() {
    $("#open-prompt-button").click(function () {
      console.log(`clicked Next button`);
      console.log($(`.messageInputText`).val());

      // Check if the messageInputText box is filled, if it's empty:
      if ($(`.messageInputText`).val() === ``) {
        alert("Please continue the story :)");

      } // end if
      // If the messageInputText box is filled:
      else {
        // Hide "Next" button
        $(this).hide();
        // Have the promptInput box + submit button fade in
        $(".promptInputText").fadeIn("slow");
        $("#submit-text-button").fadeIn("slow");
        $("#submit-text-button").css("display", "initial");
      } // end else
    }); // end open-prompt-button click
  } // nextButtonClicked end

  // -----------------
  // * Submit button
  // -----------------/
  function submitButtonClicked() {
    $("#submit-text-button").click(function () {
      // If the promptInputText box is empty:
      if ($(`.promptInputText`).val() === ``) {
        alert("Please enter a prompt for the next writer :)");
      } // end if

      // If the messageInputText box is empty:
      else if ($(`.messageInputText`).val() === ``) {
        alert("Please continue the story :)");
      } // end if

      // If all forms are filled:
      else {
        // send message info to server
        sendMessageInformation();

        // hide message form
        $(`#message-form`).hide();

        console.log(`message form hidden`);

        // update latest page with new message
        updateLatestMessage();

        // add a new page after ths latest page
        let newPageNumber = totalPages;
        // // increase totalPages by 1
        // totalPages += 1;
        // console.log(`totalPages = ` + totalPages);
        // remove previous message form
        $(`#message-form`).remove();


        fillUpLastPage(newPageNumber, inputText.promptInputText);

        console.log(`added a new page to continue story`);




      } // else end
    }); // submit-text-button click end
  } // submitButtonClicked() end


  /********************************
   * CLIENTSOCKET: RESET BUTTON CLICKS
   ********************************/

  // display books from database
  clientSocket.on("resetButtonClicks", function () {
    // "Next" button clicked:
    nextButtonClicked();
    // "Submit" button clicked:
    submitButtonClicked();

    console.log(`button clicks reset`);
  }); //client socket resetButtonClicks end


  /********************************
   * UPDATE PAGE CONTENT
   ********************************/

  // -----------------
  // * Create 1 new set
  // -----------------/
  function createNewSet(setNumber) {
    // create checkbox that tracks page flipping
    $(`<input type="checkbox" id="c${setNumber + 1}">`).insertBefore(".flip-book");

    // create a sheet for each set of pages
    $(".flip-book").append(`<div class="flip" id="p${setNumber + 1}"></div>`);
  }

  let firstTimeUpdatingPage = true;

  // -----------------
  // * Update latest page when new message
  // -----------------/
  // Update latest page with new message
  function updateLatestMessage() {
    if (!firstTimeUpdatingPage) {
      // increase totalPages by 1
      totalPages += 1;
      console.log(`totalPages = ` + totalPages);
    } else {
      firstTimeUpdatingPage = false;
    }

    let latestPage = totalPages - 1;
    // front or back page:
    let latestPageSide;
    let setNumber;

    // Update the latest page:
    if (latestPage % 2 == 0) {
      latestPageSide = `front`;
      setNumber = (latestPage / 2) + 1;

      // add Next button
      $(`#p${setNumber}>div.${latestPageSide}`).append(`
      <label for="c${setNumber}" class="next-btn">Next</label>
    `);
    } else {
      latestPageSide = `back`;
      setNumber = (latestPage / 2) + 0.5;
      // create a new set
      createNewSet(setNumber);
      // increase numSet by 1
      numSets += 1;
      // handle page flipping for latest set number
      handleLatestPageFlipping(numSets);
      console.log(`latestSetNumber IS` + numSets);
    }



    console.log(`latestPageSide=` + latestPageSide);


    // Add message on latest page
    $(`#p${setNumber}>div.${latestPageSide}`).append(`
      <p class="pageText">${inputText.messageInputText}</p>
    `);

    console.log(`updated p${latestPage - 2}`);
  }

  // -----------------
  // * Fill up last page
  // -----------------/
  // Else if it's the last page, add prompt plus input field
  function fillUpLastPage(j, prompt) {

    // If it's an even-number page
    if (j % 2 == 0) {
      let setNumber = (j / 2) + 1;

      // Add input form
      addInputForm(setNumber, `front`, prompt);

      console.log(`added last page even: p${j - 2}`);

    } else {
      let setNumber = (j / 2) + 0.5;
      // Put on back page (odd-number page)

      // Add input form
      addInputForm(setNumber, `back`, prompt);

      // Add back button
      $(`#p${setNumber}>div.back`).append(`
          <label for="c${setNumber}" class="back-btn">Back</label>
        `);

      console.log(`added last page odd: p${j - 2}`);
    } // else odd page end
  } // fillUpLastPage end



  // -----------------
  // * Fill up last page
  // -----------------/
  // Else if it's the last page, add prompt plus input field
  function fillUpLastPage(j, prompt) {

    // If it's an even-number page
    if (j % 2 == 0) {
      let setNumber = (j / 2) + 1;

      // Add input form
      addInputForm(setNumber, `front`, prompt);

      console.log(`added last page even: p${j - 2}`);

    } else {
      let setNumber = (j / 2) + 0.5;
      // Put on back page (odd-number page)

      // Add input form
      addInputForm(setNumber, `back`, prompt);

      // Add back button
      $(`#p${setNumber}>div.back`).append(`
        <label for="c${setNumber}" class="back-btn">Back</label>
      `);

      console.log(`added last page odd: p${j - 2}`);
    } // else odd page end
  } // fillUpLastPage end

  // -----------------
  // * Add input form
  // -----------------/
  // Add messageInputText and promptInputText forms
  function addInputForm(setNumber, pageSide, prompt) {
    $(`#p${setNumber}`).append(`
        <div class=${pageSide}>
        <h2 class="prompt">${prompt}</h2>
        <form id="message-form" action="">
          <textarea class="messageInputText" name="messageInputText" form="message-form" placeholder="Continue the story here..." required></textarea>
          <button type="button" id="open-prompt-button">Next</button>
          <textarea class="promptInputText" name="promptInputText" form="message-form" placeholder="And add a prompt for the next writer..." required></textarea>
          <input type="submit" id="submit-text-button" value="Submit">
        </form>
        </div>
      `);
  }

  // -----------------
  // * Send message information
  // -----------------/
  function sendMessageInformation() {
    event.preventDefault();
    // console.log(`first thing ` + $("#message-form")[0]);
    let closeMessageForm = new FormData($("#message-form")[0]);

    console.log("checking data" + closeMessageForm);

    // Display the key/value pairs: logs info from classes inputText and promptInputText
    for (var pair of closeMessageForm.entries()) {
      console.log(pair[0] + ", " + pair[1]);
      inputText[pair[0]] = pair[1];
    }

    console.log(`new information check1` + inputText.messageInputText);
    console.log(`new information check2` + inputText.promptInputText);
    // console.log(`inputText is:` + inputText);

    clientSocket.emit(`sendMessage`, {
      newMessage: inputText.messageInputText,
      newPrompt: inputText.promptInputText
    });

    // // deletes text in search bar
    // document.getElementById(`message-form`).reset();

  }



  /***********************
   *  updateBooks
   **********************/

  // display books from database
  clientSocket.on("updateBooks", function (firstBook) {
    console.log(`updated the book`);
  }); //client socket updateBooks end

} //setup end

/********************************
 * HANDLE PAGE FLIPPING
 ********************************/

function handleInitialPageFlipping() {
  // // calculate number of sheets/sets
  // let numSheets = Math.ceil(firstBook.pages.length / 2) + 1;

  setInitialPageZIndex();

  // Flip pages by changing CSS
  for (let i = 1; i < numSets + 1; i++) {
    let setNumber = i;
    flipOnePage(setNumber);
  } // for-loop flip pages end
} // handleInitialPageFlipping() end

// Set initial z-index of all pages
function setInitialPageZIndex() {
  for (let i = 1; i < numSets + 1; i++) {
    let setNumber = i;
    setOnePageZIndex(setNumber);
  }
} // setPageZIndex end

// Handle page flipping for latest page
function handleLatestPageFlipping(setNumber) {
  let i = setNumber;
  // Set page index for one page
  setOnePageZIndex(i);

  // Handle one page flipping
  flipOnePage(i);
  console.log(`handled latest page flipping`);
}

// Set page index for one page
function setOnePageZIndex(i) {
  $(`#p${i}`).css({ "z-index": `${(numSets + 1) - i}` });
}

// Handle one page flipping
function flipOnePage(i) {
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
      $(`#p${i}`).css({ "z-index": `${(numSets + 1) - i}` });

      // Reshow the hidden front page underneath
      $(`#p${i}>.front`).css({ "display": "block" });
    }
  });
}



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