// Global variables
const tiles = []; // Array to store tile elements
const candyColors = ["red", "yellow", "orange", "purple", "green", "blue"]; // Array of candy colors

//GAME MODES - moves or score
var gameMode = "moves";
// var gameMode = "score";

const maxMoves = 25; // Maximum number of moves allowed
const scoreGoal = 20; // Score goal when game mode is "score"

let pointsPerCandy = 1;
let firstMoveMade = false; // Flag to track if the first move has been made
let colorBombActivated = false; // Flag to track if a color bomb has been activated
let firstClickedTile = null; // Reference to the first clicked tile during a move
let specialCandyAdded = false; // Flag to track if a special candy has been added during a move
let score = 0; // Player's score
let movesLeft = maxMoves; // Number of moves left
let previousWidth = window.innerWidth;
let startX, startY;
let numRows; // Number of rows on the game board
let numCols; // Number of columns on the game board
let width = numRows; // Width of the game board

const board = document.getElementById("game-board"); // Reference to the game board element
board.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
board.style.gridTemplateRows = `repeat(${numRows}, 1fr)`;

//URLs for the candies image
const candyImageUrls = {
  green: "images/green-candy.png",
  yellow: "images/yellow-candy.png",
  blue: "images/blue-candy.png",
  red: "images/red-candy.png",
  purple: "images/purple-candy.png",
  orange: "images/orange-candy.png",
};

const specialCandyImageUrls = {
  green: "images/green-special.png",
  yellow: "images/yellow-special.png",
  blue: "images/blue-special.png",
  red: "images/red-special.png",
  purple: "images/purple-special.png",
  orange: "images/orange-special.png",
};

//URL for the color bomb image
const colorBombUrl = "images/color-bomb.png";

//URL for the specialCandy ::before pseudo element
const specialCandyImageUrl = "images/special-candy-pattern.png";

// Regex to match common mobile devices
function isMobileDevice() {
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

  // Return true if the user agent matches mobile devices, false otherwise
  return mobileRegex.test(navigator.userAgent);
}

// Function to adjust numRows and numCols based on screen size
function adjustBoardSize() {
  const windowWidth = window.innerWidth;

  // Set different values for numRows and numCols based on window size
  if (windowWidth < 500) {
    numRows = 9;
    numCols = 6;
  } else if (windowWidth < 1200) {
    numRows = 8;
    numCols = 8;
  } else {
    numRows = 8;
    numCols = 8;
  }

  // Update the game board with the new values
  updateBoard();
}

// Function to update the game board with the new numRows and numCols
function updateBoard() {
  // Update grid-template-columns and grid-template-rows for the game board
  board.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${numRows}, 1fr)`;
}

window.addEventListener("resize", function () {
  const newWidth = window.innerWidth;

  // Check if the size has changed significantly
  if (Math.abs(newWidth - previousWidth) > 50) {
    // If size has changed enough, update previous width and reload page
    previousWidth = newWidth;
    location.reload();
  }
});

// Function to update the remaining moves in the DOM
function updateMovesLeft() {
  // Check if the game mode is "moves"
  if (gameMode === "moves") {
    document.getElementById("moves").textContent = movesLeft;
    if (movesLeft === 0) {
      checkGameOver();
    }
  }
}

function updateScore() {
  if (gameMode === "score" || gameMode === "moves") {
    document.getElementById("score").textContent = score;
  }
  if (gameMode === "score" && score >= scoreGoal) {
    checkGameOver();
  }
}

// Function to fill an empty tile with new candy if the image fails to load
function fillEmptyTile(tile) {
  const randomColorIndex = Math.floor(Math.random() * candyColors.length);
  const randomColor = candyColors[randomColorIndex];
  const candy = createCandy(randomColor);
  tile.appendChild(candy);
}

// Function to check if there are any empty tiles on the board
function checkEmptyTiles() {
  let emptyTilesExist = false;
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const tile = document.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
      );
      const candy = tile.querySelector(".candy");
      if (!candy) {
        emptyTilesExist = true;
        break;
      }
    }
    if (emptyTilesExist) {
      break;
    }
  }
  return emptyTilesExist;
}

// Helper function to get the color of a candy tile
function getTileColor(row, col) {
  const tile = document.querySelector(
    `.tile[data-row='${row}'][data-col='${col}']`
  );
  if (tile) {
    const candy = tile.querySelector(".candy");
    if (candy) {
      return candy.dataset.color;
    }
  }
  return null;
}

// Function to create the game board
function createBoard() {
  const board = document.getElementById("game-board");
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.dataset.row = row;
      tile.dataset.col = col;
      board.appendChild(tile);
    }
  }
  fillBoardWithCandies();
}

async function fillBoardWithCandies() {
  // Loop through each column from left to right
  for (let col = 0; col < numCols; col++) {
    // Add a delay for each column
    await delay(100);
    // Loop through each row in the current column
    for (let row = 0; row < numRows; row++) {
      let tile = document.querySelector(
        `.tile[data-row='${row}'][data-col='${col}']`
      );
      const randomColorIndex = Math.floor(Math.random() * candyColors.length);
      const randomColor = candyColors[randomColorIndex];
      let candy = createCandy(randomColor);

      // Handle image loading error
      candy.onerror = function () {
        console.error("Error loading candy image for tile:", tile);
        tile.removeChild(candy); // Remove the candy from the empty tile
        fillEmptyTile(tile); // Fill the empty tile with new candy
      };

      tile.appendChild(candy);
    }
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to move existing candies down when squares/tiles become empty
function moveDownEmptyTiles() {
  for (let col = 0; col < numCols; col++) {
    let emptySpaces = 0;
    for (let row = numRows - 1; row >= 0; row--) {
      const tile = document.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
      );
      const candy = tile.querySelector(".candy");
      if (!candy) {
        emptySpaces++;
      } else if (emptySpaces > 0) {
        const newTile = document.querySelector(
          `[data-row="${row + emptySpaces}"][data-col="${col}"]`
        );
        const movingCandy = candy;

        movingCandy.style.transition =
          "transform 0.5s ease-out, opacity 0.5s ease-out"; // Increase transition duration here
        movingCandy.classList.add("fall-animation");
        newTile.appendChild(movingCandy);
        setTimeout(() => {
          movingCandy.classList.remove("fall-animation");
          movingCandy.style.transition = "";
        }, 500); // Match transition duration here
      }
    }
  }
}

// Function to fill the board with new candies from above with a delay between columns
function fillEmptyTilesFromTop() {
  for (let col = 0; col < numCols; col++) {
    (function (col) {
      // Using a closure to preserve the value of col in the setTimeout function
      setTimeout(() => {
        let emptySpaces = 0;
        for (let row = 0; row < numRows; row++) {
          const tile = document.querySelector(
            `[data-row="${row}"][data-col="${col}"]`
          );
          const candy = tile.querySelector(".candy");
          if (!candy) {
            emptySpaces++;
            const randomColorIndex = Math.floor(
              Math.random() * candyColors.length
            );
            const randomColor = candyColors[randomColorIndex];
            const newCandy = createCandy(randomColor);
            newCandy.classList.add("fall-animation");
            tile.appendChild(newCandy);

            setTimeout(() => {
              newCandy.classList.remove("fall-animation");
            }, 300);
          } else {
            // Break the loop if candy is found in the column
            break;
          }
        }
      }, col * 100); // Adjust the delay as needed
    })(col);
  }
}

// Function to create a candy node with an image
function createCandy(color) {
  const candy = document.createElement("div");
  candy.classList.add("candy");
  candy.style.backgroundImage = `url('${candyImageUrls[color]}')`;
  candy.dataset.color = color;
  candy.addEventListener("dragstart", handleDragStart);
  return candy;
}

// Function to create a special candy with a specific color
function createSpecialCandy(color) {
  const specialCandy = document.createElement("div");
  specialCandy.classList.add("candy", "special-candy");
  // specialCandy.style.backgroundImage = `url('${candyImageUrls[color]}')`;
  specialCandy.style.backgroundImage = `url('${specialCandyImageUrls[color]}')`;
  specialCandy.dataset.color = color;
  specialCandy.dataset.special = "true";
  specialCandy.addEventListener("dragstart", handleDragStart);
  // Add the background image for the ::before pseudo element
  const style = document.createElement("style");
  specialCandy.appendChild(style);
  return specialCandy;
}

// Function to add special candy to the board
function addSpecialCandyToBoard(color, row, col) {
  const tile = document.querySelector(
    `.tile[data-row='${row}'][data-col='${col}']`
  );
  if (tile) {
    const specialCandy = createSpecialCandy(color);
    tile.appendChild(specialCandy);
  }
}

// Function to create a color-bomb
function createColorBomb() {
  const colorBomb = document.createElement("div");
  colorBomb.classList.add("candy", "color-bomb");
  colorBomb.addEventListener("dragstart", handleDragStart);
  colorBomb.style.backgroundImage = `url('${colorBombUrl}')`;
  return colorBomb;
}

// Function to add a color-bomb to the board
function addColorBombToBoard(row, col) {
  const tile = document.querySelector(
    `.tile[data-row='${row}'][data-col='${col}']`
  );
  if (tile) {
    const colorBomb = createColorBomb(); // Create the color-bomb element
    tile.appendChild(colorBomb); // Add the color-bomb to the board
  }
}

// Function to handle touch-start events
function handleTouchStart(event) {
  const touch = event.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
}

// Function to handle touch-end events
function handleTouchEnd(event) {
  dragging = false;
  event.preventDefault();
}
let dragging = false;
// Function to handle touch-move events
function handleTouchMove(event) {
  if (dragging) {
    return;
  }
  // Prevent default behavior for touch events
  event.preventDefault();

  dragging = true;

  // Get current tile
  const currentTile = event.currentTarget;
  const touch = event.touches[0];
  const endX = touch.clientX;
  const endY = touch.clientY;

  const deltaX = endX - startX;
  const deltaY = endY - startY;

  // Calculate absolute changes in x and y
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal swipe
    if (deltaX > 0) {
      // Right swipe
      // Get references to the two affected candies
      const tile1 = currentTile;
      const tile2 = document.querySelector(
        `[data-row='${currentTile.dataset.row}'][data-col='${
          parseInt(currentTile.dataset.col) + 1
        }']`
      );

      swapCandies(tile1, tile2);

      // Reset first clicked candy to null to prepare for next move
      currentTile.classList.remove("selected");
      firstClickedTile = null;
    }
    // Left swipe
    if (deltaX < 0) {
      const tile1 = currentTile;
      const tile2 = document.querySelector(
        `[data-row='${currentTile.dataset.row}'][data-col='${
          parseInt(currentTile.dataset.col) - 1
        }']`
      );

      swapCandies(tile1, tile2);

      currentTile.classList.remove("selected");
      firstClickedTile = null;
    }
  } else {
    // Vertikalt swipe (down)
    if (deltaY > 0) {
      const tile1 = currentTile;
      const tile2 = document.querySelector(
        `[data-row='${parseInt(currentTile.dataset.row) + 1}'][data-col='${
          currentTile.dataset.col
        }']`
      );

      swapCandies(tile1, tile2);

      currentTile.classList.remove("selected");
      firstClickedTile = null;
    }
    // Vertikalt swipe (up)
    if (deltaY < 0) {
      const tile1 = currentTile;
      const tile2 = document.querySelector(
        `[data-row='${parseInt(currentTile.dataset.row) - 1}'][data-col='${
          currentTile.dataset.col
        }']`
      );
      swapCandies(tile1, tile2);

      currentTile.classList.remove("selected");
      firstClickedTile = null;
    }
  }
}

// Function to add touch event listeners to tiles to handle swipe
function addTouchListeners() {
  const tiles = document.querySelectorAll(".tile");
  tiles.forEach((tile) => {
    tile.addEventListener("touchstart", handleTouchStart);
    tile.addEventListener("touchmove", handleTouchMove);
    tile.addEventListener("touchend", handleTouchEnd); // Lägg till touchend event-lyssnare
  });
}

// Function to remove touch event listeners
function removeTouchListeners() {
  const tiles = document.querySelectorAll(".tile");
  tiles.forEach((tile) => {
    tile.removeEventListener("touchstart", handleTouchStart);
    tile.removeEventListener("touchmove", handleTouchMove);
    tile.removeEventListener("touchend", handleTouchEnd); // Ta bort touchend event-lyssnare
  });
}

// Funktion för att hantera dragover event
function handleDragOver(event) {
  event.preventDefault();
}

// Funktion för att hantera dragstart event
function handleDragStart(event) {
  const candy = event.target;
  const tile1 = candy.closest(".tile");
  event.dataTransfer.setData(
    "text/plain",
    tile1.dataset.row + "-" + tile1.dataset.col
  ); // Skicka med row och col som data
}

function handleDrop(event) {
  event.preventDefault();
  const dropData = event.dataTransfer.getData("text/plain").split("-"); // Hämta row och col från data
  const tileRow = parseInt(dropData[0]);
  const tileCol = parseInt(dropData[1]);
  const tile1 = document.querySelector(
    `.tile[data-row="${tileRow}"][data-col="${tileCol}"]`
  );
  const tile2 = event.target.closest(".tile");

  // Perform candy swap if both tile1 and tile2 exist and are adjacent
  if (tile1 && tile2 && areAdjacent(tile1, tile2)) {
    swapCandies(tile1, tile2);
  }
}

function areAdjacent(tile1, tile2) {
  const rowDiff = Math.abs(
    parseInt(tile1.dataset.row) - parseInt(tile2.dataset.row)
  );
  const colDiff = Math.abs(
    parseInt(tile1.dataset.col) - parseInt(tile2.dataset.col)
  );

  // Check if the tiles are adjacent horizontally or vertically
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

// Funktion för att lägga till drag and drop event-lyssnare till plattor för att hantera drag and drop
function addDragAndDropListeners() {
  const tiles = document.querySelectorAll(".tile");
  tiles.forEach((tile) => {
    tile.addEventListener("dragover", handleDragOver);
    tile.addEventListener("drop", handleDrop);
  });
}

// Funktion för att ta bort drag and drop event-lyssnare
function removeDragAndDropListeners() {
  const candies = document.querySelectorAll(".candy");
  candies.forEach((candy) => {
    candy.removeAttribute("draggable"); // Disable draggable attribute
    candy.removeEventListener("dragstart", handleDragStart);
  });

  const tiles = document.querySelectorAll(".tile");
  tiles.forEach((tile) => {
    tile.removeEventListener("dragover", handleDragOver);
    tile.removeEventListener("drop", handleDrop);
  });
}

// Function to swap candies between two tiles
function swapCandies(tile1, tile2) {
  firstMoveMade = true;
  const candy1 =
    tile1.querySelector(".candy") || tile1.querySelector(".special-candy");
  const candy2 =
    tile2.querySelector(".candy") || tile2.querySelector(".special-candy");

  // Get the positions of both candies
  const rect1 = candy1.getBoundingClientRect();
  const rect2 = candy2.getBoundingClientRect();

  // Calculate the distance the candies need to move
  const dx = rect2.left - rect1.left;
  const dy = rect2.top - rect1.top;

  // Use transform to move the candies
  candy1.style.transform = `translate(${dx}px, ${dy}px)`;
  candy2.style.transform = `translate(${-dx}px, ${-dy}px)`;

  // Wait for the transition effect to complete before finishing the candy swap
  setTimeout(() => {
    // Swap the candies
    tile1.appendChild(candy2);
    tile2.appendChild(candy1);

    // Check if the move results in a match
    const matches = checkMatches();
    const isSpecialToSpecialMove =
      candy1.classList.contains("special-candy") &&
      candy2.classList.contains("special-candy");

    const isColorBombMove =
      candy1.classList.contains("color-bomb") ||
      candy2.classList.contains("color-bomb");

    if (matches.length > 0 || isSpecialToSpecialMove || isColorBombMove) {
      if (isSpecialToSpecialMove) {
        handleSpecialToSpecialMove(tile1, tile2);
      }
      if (isColorBombMove) {
        // Get the color of the non-color-bomb candy
        const colorCandy = candy1.classList.contains("color-bomb")
          ? candy2
          : candy1;
        const color = colorCandy.dataset.color;
        activateColorBomb(tile1, tile2, color);
      }
      // Reset the transform for both candies if there is a match
      candy1.style.transform = "";
      candy2.style.transform = "";

      // Only decrement movesLeft and updateMovesLeft if the game mode is "moves"
      if (gameMode === "moves") {
        movesLeft--; // Decrease the remaining moves by one
        updateMovesLeft(); // Update the remaining moves in the DOM
      }
      if (gameMode === "score") {
        updateScore();
      }
    } else {
      tile1.appendChild(candy1);
      tile2.appendChild(candy2);
      // If the move doesn't result in a match or is a special to special move, reset the candies' positions
      candy1.style.transform = "";
      candy2.style.transform = "";
      console.log("Invalid move, no matches.");
    }

    if (movesLeft === 0 && gameMode === "moves") {
      setTimeout(() => {
        checkGameOver(); // Check if the game is over after the last move
      }, 1000); // Adjust timeout as needed depending on the length of your animation
    }
  }, 200); // Match the transition time here
}

// Function to activate a color-bomb
function activateColorBomb(tile1, tile2, color) {
  // Loop through each tile on the board
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const tile = document.querySelector(
        `.tile[data-row='${r}'][data-col='${c}']`
      );
      if (tile) {
        const candy = tile.querySelector(".candy");
        if (candy) {
          if (candy.classList.contains("color-bomb")) {
            // Remove the color-bomb
            removeCandy(tile);
          } else if (candy.dataset.color === color) {
            // Remove the candy if its color matches the color-bomb's color
            removeCandy(tile);
            colorBombActivated = true;
          }
        }
      }
    }
  }
}

// Function to handle a special-to-special candy move
function handleSpecialToSpecialMove(tile1, tile2) {
  // Get the positions of the two special candies
  const row1 = parseInt(tile1.dataset.row);
  const col1 = parseInt(tile1.dataset.col);
  const row2 = parseInt(tile2.dataset.row);
  const col2 = parseInt(tile2.dataset.col);

  // Remove the row and column for the first special candy
  removeRowAndColumn(row1, col1);

  // Remove the row and column for the second special candy
  removeRowAndColumn(row2, col2);
}

function checkMatches() {
  let matches = [];
  let matchedTiles = new Array(numRows)
    .fill(null)
    .map(() => new Array(numCols).fill(false));

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      if (matchedTiles[row][col]) {
        continue;
      }

      const candyColor = getTileColor(row, col);

      let horizontalMatches = 1;
      for (let i = col + 1; i < numCols; i++) {
        if (getTileColor(row, i) === candyColor) {
          horizontalMatches++;
        } else {
          break;
        }
      }

      let verticalMatches = 1;
      for (let i = row + 1; i < numRows; i++) {
        if (getTileColor(i, col) === candyColor) {
          verticalMatches++;
        } else {
          break;
        }
      }

      if (horizontalMatches >= 3 && horizontalMatches <= 5) {
        for (let i = col; i < col + horizontalMatches; i++) {
          matchedTiles[row][i] = true;
        }
        if (candyColor) {
          // Ensure candyColor is defined
          matches.push({
            type: "horizontal",
            row,
            col,
            length: horizontalMatches,
            color: candyColor,
            isEntireRowOrColumn: horizontalMatches === width - col,
          });
        }
      }

      if (verticalMatches >= 3 && verticalMatches <= 5) {
        for (let i = row; i < row + verticalMatches; i++) {
          matchedTiles[i][col] = true;
        }
        if (candyColor) {
          // Ensure candyColor is defined
          matches.push({
            type: "vertical",
            row,
            col,
            length: verticalMatches,
            color: candyColor,
            isEntireRowOrColumn: verticalMatches === width - row,
          });
        }
      }
    }
  }

  return matches;
}

// Function to remove matches
function removeMatches(matches) {
  if (!matches || !Array.isArray(matches)) {
    console.log("No matches to remove.");
    return;
  }

  matches.forEach((match) => {
    const { type, row, col, length, isEntireRowOrColumn, color } = match;

    for (let i = 0; i < length; i++) {
      let tileRow = row + (type === "horizontal" ? 0 : i);
      let tileCol = col + (type === "vertical" ? 0 : i);

      const tile = document.querySelector(
        `.tile[data-row='${tileRow}'][data-col='${tileCol}']`
      );

      // Check if any of the candies in the match are special candies
      let containsSpecialCandy = false;
      for (let j = 0; j < length; j++) {
        let checkRow = row + (type === "horizontal" ? 0 : j);
        let checkCol = col + (type === "vertical" ? 0 : j);
        const checkTile = document.querySelector(
          `.tile[data-row='${checkRow}'][data-col='${checkCol}']`
        );
        if (checkTile && checkTile.querySelector(".candy.special-candy")) {
          containsSpecialCandy = true;
          break;
        }
      }
      // Check if the match contains a special candy and remove accordingly
      if (containsSpecialCandy) {
        if (match.type === "horizontal") {
          removeHorizontalSpecialCandy(tile);
        } else if (match.type === "vertical") {
          removeVerticalSpecialCandy(tile);
        }
      } else {
        removeCandy(tile);
      }
    }

    // Check if a special candy needs to be added
    if (length === 4 && !specialCandyAdded && !isEntireRowOrColumn) {
      setTimeout(() => {
        addSpecialCandyToBoard(match.color, match.row, match.col);
        specialCandyAdded = true;
      }, 300);
    }

    // Check if a color bomb needs to be added
    if (length === 5 && !isEntireRowOrColumn) {
      setTimeout(() => {
        addColorBombToBoard(match.row, match.col);
      }, 300);
    }
  });
  updateBoardAfterMatch();
}

// Function to remove a candy from a tile
function removeCandy(tile) {
  if (tile) {
    const candy = tile.querySelector(".candy");
    if (candy) {
      // Lägg till en CSS-klass för animation
      candy.classList.add("explode-animation");

      // Vänta på att animationen ska slutföras innan du tar bort godiset
      candy.addEventListener("animationend", function () {
        candy.remove();

        if (firstMoveMade) {
          score += pointsPerCandy;
          updateScore();
        }
      });
    }
  }
}

// Function to remove horizontal special candy and its row
function removeHorizontalSpecialCandy(tile) {
  if (!tile) return;

  const row = parseInt(tile.dataset.row);

  const specialCandy = tile.querySelector(".candy.special-candy");
  if (!specialCandy) return;

  // Get all candies in the same row
  const rowTiles = document.querySelectorAll(`.tile[data-row='${row}'] .candy`);

  // Trigger explosion and remove candies
  setTimeout(() => {
    // Set transition properties for candies and special candy
    const transitionDuration = Math.max(rowTiles.length * 20, 300); // Adjust duration as needed
    const transitionDelay = rowTiles.length * 5; // Use the length of rowTiles to determine delay
    rowTiles.forEach((candy, index) => {
      candy.style.transition = `opacity 0.3s, transform 0.3s ${index * 20}ms`; // Adjust delay for each candy
      candy.style.opacity = 0;
      candy.style.transform = "scale(0)";
    });
    specialCandy.style.transition = `opacity 0.3s, transform 0.3s ${transitionDelay}ms`; // Use transitionDelay for special candy
    specialCandy.style.opacity = 0;
    specialCandy.style.transform = "scale(0)";

    // Remove candies and special candy from DOM after transition
    setTimeout(() => {
      rowTiles.forEach((candy) => {
        candy.remove();
      });
      specialCandy.remove();
    }, transitionDuration + transitionDelay);
  }, 100);

  // Update score if first move made
  if (firstMoveMade) {
    score += pointsPerCandy * 8;
    updateScore();
  }
}

// Function to remove vertical special candy and its column
function removeVerticalSpecialCandy(tile) {
  if (!tile) return;

  const col = parseInt(tile.dataset.col);

  const specialCandy = tile.querySelector(".candy.special-candy");
  if (!specialCandy) return;

  // Get all candies in the same column
  const colTiles = document.querySelectorAll(`.tile[data-col='${col}'] .candy`);

  // Trigger explosion and remove candies
  setTimeout(() => {
    // Set transition properties for candies and special candy
    const transitionDuration = Math.max(colTiles.length * 20, 300); // Adjust duration as needed
    const transitionDelay = colTiles.length * 5; // Use the length of colTiles to determine delay
    colTiles.forEach((candy, index) => {
      candy.style.transition = `opacity 0.3s, transform 0.3s ${index * 20}ms`; // Adjust delay for each candy
      candy.style.opacity = 0;
      candy.style.transform = "scale(0)";
    });
    specialCandy.style.transition = `opacity 0.3s, transform 0.3s ${transitionDelay}ms`; // Use transitionDelay for special candy
    specialCandy.style.opacity = 0;
    specialCandy.style.transform = "scale(0)";

    // Remove candies and special candy from DOM after transition
    setTimeout(() => {
      colTiles.forEach((candy) => {
        candy.remove();
      });
      specialCandy.remove();
    }, transitionDuration + transitionDelay);
  }, 100);

  if (firstMoveMade) {
    score += pointsPerCandy * 8;
    updateScore();
  }
}

// Function to remove row and column
function removeRowAndColumn(row, col) {
  // Remove the row
  for (let c = 0; c < numCols; c++) {
    if (c !== col) {
      const tile = document.querySelector(
        `.tile[data-row='${row}'][data-col='${c}']`
      );
      if (tile) {
        speicalToSpecialMoveExplosion(tile);
      }
    }
  }

  // Remove the column
  for (let r = 0; r < numRows; r++) {
    if (r !== row) {
      const tile = document.querySelector(
        `.tile[data-row='${r}'][data-col='${col}']`
      );
      if (tile) {
        speicalToSpecialMoveExplosion(tile);
      }
    }
  }
  if (firstMoveMade) {
    score += pointsPerCandy * 16;
    updateScore();
  }
}

// Function to trigger an explosion when a special candy moves
function speicalToSpecialMoveExplosion(tile) {
  if (!tile) return;

  const candy = tile.querySelector(".candy");
  if (!candy) return;

  // Trigger explosion
  setTimeout(() => {
    // Remove the candy with transition effect
    candy.style.opacity = 0;
    candy.style.transform = "scale(0)";
    candy.addEventListener("transitionend", () => {
      candy.remove(); // Remove candy from DOM after transition
    });
  }, 100); // Adjust delay as needed
}

// Main function to update the board after a match
function updateBoardAfterMatch() {
  // Move existing candies down
  moveDownEmptyTiles();

  // Fill empty tiles from the top with a delay between columns
  fillEmptyTilesFromTop();
}

// Function to start the game
function startGame() {
  adjustBoardSize();
  createBoard(); // Create Board
  document.getElementById("score").textContent = "0";
  document.getElementById("moves").textContent = movesLeft; // Update the number of moves in DOM
  if (gameMode === "score") {
    document.getElementById("moves").textContent = "∞ ";
  }
  startMonitoring();
  addTouchListeners();
  addDragAndDropListeners();
}

// Function to continuously monitor the board and remove matches
function monitorBoard() {
  const matches = checkMatches(); // Check for matches
  const emptyTiles = checkEmptyTiles();
  // updateBoardAfterMatch();
  if (matches.length > 0 || colorBombActivated || emptyTiles) {
    removeMatches(matches); // Remove matches
    // updateBoardAfterMatch();
    specialCandyAdded = false;
  }
}

// Call monitor Board continuously to check for matches, move candies down, and refill the board with new candies
function startMonitoring() {
  setInterval(monitorBoard, 500);
}

// Start the game when the page loads
document.addEventListener("DOMContentLoaded", startGame);

// Function to check if the game is over
function checkGameOver() {
  if (movesLeft === 0 && gameMode === "moves") {
    showGameOverModal(score); // Show the game over modal and pass the final score
  }
  if (score >= scoreGoal && gameMode === "score") {
    showGameOverModal(score);
  }
}

// Display modal on game over
function showGameOverModal(score) {
  const modal = document.getElementById("gameOverModal");
  const modalTitle = document.getElementById("modalTitle");
  if (gameMode === "moves") {
    modalTitle.innerHTML = "No Moves Left";
  } else {
    modalTitle.innerHTML = "Target Score Achieved";
  }
  const finalScoreElement = document.getElementById("finalScore");
  finalScoreElement.textContent = score; // Show the final score
  modal.style.display = "block"; // Show the modal
  document.getElementById("score-and-moves-board").style.display = "none";
  document.getElementById("game-title").style.display = "none";
}
