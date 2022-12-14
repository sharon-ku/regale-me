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

/********************************
 * BG MUSIC
********************************/

// Play bg music
let natureMusic = new Audio("assets/sounds/forgottenland.mp3");
natureMusic.volume = 0.5;
// Start soundtrack on click
document.body.addEventListener(`click`, () => {
  natureMusic.play();
  natureMusic.loop = true;
});

/********************************
 * FLOATING ITEMS
********************************/

const titleFigure = document.querySelector(`.title-figure`);

// Create flying petals
createPetals();



// Create petals at start of scene
function createPetals() {
  // All the petal names
  let petalNames = [`flower`, `leaf`];
  // Number of images available per petal
  let numPetalImages = [4, 4];
  // How many petals for each category do I want
  let numEachImage = [3, 3];

  // Create card decoration images
  for (let j = 0; j < petalNames.length; j++) {
    for (let i = 0; i < numEachImage[j]; i++) {
      addPetalImage(petalNames[j], numPetalImages[j]);
    }
  }

  // Put all petals in a random position
  repositionPetalsRandomly();
}

// Add petal image in HTML
function addPetalImage(petalName, numImages) {
  for (let i = 0; i < numImages; i++) {
    titleFigure.innerHTML += `
      <img
        class="petal-image not-selectable"
        src="assets/images/${petalName}${i}.png"
        alt=""
      />
      `;
  }
}

// Put petals in a random position on page
function repositionPetalsRandomly() {
  // space around page where petals will not appear
  let bufferZone = 0;

  // place petals randomly
  $(`.petal-image`).each(function () {
    $(this).css({
      left: window.innerWidth + Math.random() * 3.5 * window.innerWidth,
      top: -500 + Math.random() * window.innerHeight,
      // left: "window.innerWidth + Math.random() * (window.innerWidth)",
      // top:
      //   "-window.innerHeight + Math.random() * (window.innerHeight - 2 * bufferZone)",
    });
  });

  // animate petals randomly
  $(`.petal-image`).each(function () {
    let randomFlyingSpeed = 40 + Math.random() * 20;
    $(this).css({
      animation: `petal-fly ${randomFlyingSpeed}s linear infinite`,
      // left:
      //   "bufferZone + Math.random() * (window.innerWidth - 2 * bufferZone)",
      // top:
      //   "bufferZone + Math.random() * (window.innerHeight - 2 * bufferZone)",
      // right: "window.outerWidth + Math.random() * (window.outerWidth)",
      // top:
      //   "-window.innerHeight + Math.random() * (window.innerHeight - 2 * bufferZone)",
    });
  });
}



/********************************
 * BOOK DOM SETUP
********************************/
// total number of pages in a book
let totalPages;
// number of sets in the book
let numSets;

// where the input values will be stored
let inputText = {};

// true if someone is currently editing the book
let someoneIsCurrentlyEditing = false;
// true if current client is writing
let iAmTheAuthor = false;

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
        fillUpCoverPage(j, firstBook);
        console.log(`added cover`);
      } //if j=0 end

      // On the back of cover page
      else if (j === 1) {
        fillUpFirstInnerPage(j);
        console.log(`added inner page 1`);
      }

      // If it's neither the first nor last page:
      else if (j != totalPages - 1) {
        fillUpInBetweenPages(j, firstBook);
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

    // --------------------------------
    // * HANDLE BUTTON CLICKS
    // --------------------------------/
    // Set functionality for buttons
    handleButtonClicks();

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
   * PREVENT 2 PEOPLE FROM CONTINUING STORY AT THE SAME TIME
  ********************************/
  // Someone clicked on message input textarea: return true if clicked
  function messageInputTextClicked() {

    $(".messageInputText").focus(function () {
      // If no one is currently editing the page
      if (!someoneIsCurrentlyEditing) {
        console.log(`message input clicked`);
        someoneIsCurrentlyEditing = true;
        iAmTheAuthor = true;
        // Freeze everyone else's last page
        clientSocket.emit(`freezeLastPageForNonWriters`);
        console.log(`freezing last page for other writers`);
      } // if end
    }); //anonymous function end

    $(".messageInputText").focusout(function () {
      console.log(`left textarea`);
    });

  } // messageInputTextClicked() end


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
        // finished editing
        someoneIsCurrentlyEditing = false;

        // send message info to server
        sendMessageInformation();

        // hide message form
        $(`#message-form`).hide();
        console.log(`message form hidden`);

        // update latest page with new message
        updateLatestMessage();

        // add a new page after ths latest page
        let newPageNumber = totalPages;

        // remove previous message form
        $(`#message-form`).remove();

        // filled up last page with new prompt + new form
        fillUpLastPage(newPageNumber, inputText.promptInputText);
        console.log(`added a new page to continue story`);




      } // else end
    }); // submit-text-button click end
  } // submitButtonClicked() end

  /********************************
   * CLIENTSOCKET: FREEZE LAST PAGE FOR NON-WRITERS
   ********************************/
  clientSocket.on("freezeLastPage", function () {
    let lastPage = totalPages;
    blockLastPage(lastPage);
  });

  /********************************
   * CLIENTSOCKET: RESET BUTTON CLICKS
   ********************************/
  // Set functionality of buttons
  function handleButtonClicks() {
    // "Next" button clicked:
    nextButtonClicked();
    // "Submit" button clicked:
    submitButtonClicked();
    // Handle someone clicking input field
    messageInputTextClicked();
  }

  // display books from database
  clientSocket.on("resetButtonClicks", function () {
    // Set functionality for buttons
    handleButtonClicks();

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
      console.log(`latestSetNumber IS ` + numSets);
    }

    console.log(`latestPageSide=` + latestPageSide);

    // Update all page z index
    let highestCheckboxChecked = findHighestSetNumberWithChecked();
    for (let i = setNumber; i > highestCheckboxChecked; i--) {
      $(`#p${i}`).css({ "z-index": `${(numSets + 1) - i}` });

      console.log(`updated p${i}`);
    }




    // Add message on latest page
    $(`#p${setNumber}>div.${latestPageSide}`).append(`
      <p class="pageText">${inputText.messageInputText}</p>
    `);

    console.log(`updated p${latestPage - 2}`);
  }

  // -----------------
  // * Fill up cover page
  // -----------------/

  // If it's cover page, put cover page image and title
  function fillUpCoverPage(j, firstBook) {
    let setNumber = (j / 2) + 1;
    // $(`#p${setNumber}`).append(`
    //   <div class="front">
    //   <div id="cover-page"><img src="assets/images/page-cover.png" alt="cover page"></div>
    //   <p class="cover-title">${firstBook.title}</p>
    //   <label for="c${setNumber}" class="next-btn">> Begin <</label>
    //   </div>
    // `);
    $(`#p${setNumber}`).append(`
    <div class="front" id="cover-page">
    <p class="cover-title">${firstBook.title}</p>
    <label for="c${setNumber}" class="next-btn">??? Begin ???</label>
    </div>
  `);
  } //fillUpCoverPage() end

  // -----------------
  // * Fill up  first inner page
  // -----------------/

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
  } // fillUpFirstInnerPage() end

  // -----------------
  // * Fill up in between pages
  // -----------------/

  // If it's neither the first or last page, fill page with prompt and text
  function fillUpInBetweenPages(j, firstBook) {
    let pageNumber = j - 2;

    // If it's an even-number page
    if (j % 2 == 0) {
      let setNumber = (j / 2) + 1;

      $(`#p${setNumber}`).append(`
        <div class="front">
        <div class="right-page-image"><img src="assets/images/page-right.png" alt="right page"></div>
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
        <div class="left-page-image"><img src="assets/images/page-left.png" alt="left page"></div>
        <h2 class="prompt">${firstBook.pages[pageNumber].prompt}</h2>
        <p class="pageText">${firstBook.pages[pageNumber].pageText}</p>
        <label for="c${setNumber}" class="back-btn">Back</label>
        </div>
      `);
    } // else odd page end
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
  // * Block last page (if someone is already editing it)
  // -----------------/

  function blockLastPage(j) {

    let freezeMessage = `A fellow writer is editing this page right now. Please wait until they finish their masterpiece.`;

    if (firstTimeUpdatingPage) {
      // If it's an even-number page
      if (j % 2 != 0) {
        let setNumber = (j / 2) + 0.5;
        console.log(`totalPages= ` + totalPages);
        $("#message-form").hide();

        $(`#p${setNumber}>div.front`).append(`
        <div class="freeze-message-box">
          <p class="freeze-message">${freezeMessage}</p>
        </div>
      `);

        console.log(`BLOCKED last page front: p${j - 2}`);

      } else {
        // Put on back page (odd-number page)
        let setNumber = (j / 2);
        console.log(`totalPages= ` + totalPages);

        $("#message-form").hide();

        $(`#p${setNumber}>div.back`).append(`
        <div class="freeze-message-box">
          <p class="freeze-message">${freezeMessage}</p>
        </div>
      `);

        console.log(`BLOCKED last page back: p${j - 2}`);
      } // else odd page end


    } //if firstTimeUpdatingPage end

    else {
      // If it's an even-number page
      if (j % 2 == 0) {
        let setNumber = (j / 2) + 1;
        console.log(`totalPages= ` + totalPages);


        $("#message-form").hide();

        $(`#p${setNumber}>div.front`).append(`
        <div class="freeze-message-box">
          <p class="freeze-message">${freezeMessage}</p>
        </div>
      `);

        console.log(`BLOCKED last page front: p${j - 2}`);

      } else {
        // Put on back page (odd-number page)
        let setNumber = (j / 2) + 0.5;
        console.log(`totalPages= ` + totalPages);

        $("#message-form").hide();

        $(`#p${setNumber}>div.back`).append(`
        <div class="freeze-message-box">
          <p class="freeze-message">${freezeMessage}</p>
        </div>
      `);

        console.log(`BLOCKED last page back: p${j - 2}`);
      } // else odd page end
    } // else end

  } // blockLastPage end

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
   *  CLIENTSOCKET: UPDATE BOOKS
   **********************/

  // display books from database
  clientSocket.on("updateBooks", function (firstBook, newMessage, newPrompt) {
    console.log(`updated the book`);

    // Remove freeze message box if it's shown:
    $(`.freeze-message-box`).remove();

    // Log inputText from server:
    inputText.messageInputText = newMessage;
    inputText.promptInputText = newPrompt;

    // hide message form
    $(`#message-form`).hide();
    // console.log(`message form hidden`);

    // update latest page with new message
    updateLatestMessage();

    // add a new page after ths latest page
    let newPageNumber = totalPages;

    // remove previous message form
    $(`#message-form`).remove();

    console.log(`inputTextprompt = ` + inputText.promptInputText);
    console.log(`inputTextmessage = ` + inputText.messageInputText);

    fillUpLastPage(newPageNumber, newPrompt);

    console.log(`ADDED NEW PAGE TO NEW BOOK`);


  }); //client socket updateBooks end

} //setup end

/********************************
 * HANDLE PAGE FLIPPING
 ********************************/

// Find the highest #c that is checked
function findHighestSetNumberWithChecked() {
  let highestSetNumberWithChecked = 0;
  for (let i = 1; i < numSets + 1; i++) {
    // If a checkbox is checked, increase count
    if ($(`#c${i}`).is(':checked')) {
      highestSetNumberWithChecked++;

      console.log(`highestSetNumber = ` + highestSetNumberWithChecked);
    }
  } // for-loop end

  return highestSetNumberWithChecked;
} // findHighest end

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