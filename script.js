const board = document.getElementById("board");
const piecesContainer = document.getElementById("pieces");
const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const restartButton = document.getElementById("restart");

const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");
const playAgain = document.getElementById("playAgain");

const SIZE = 8;

let grid = [];
let score = 0;
let best = Number(localStorage.getItem("blockBlastBest")) || 0;

bestElement.textContent = best;

// Ranglar
const colors = [
    "#ff5c7a",
    "#ff9f43",
    "#ffd32a",
    "#20bf6b",
    "#2d98da",
    "#8854d0",
    "#00cec9"
];

// Blok shakllari
const shapes = [
    [[1]],

    [[1, 1]],

    [[1, 1, 1]],

    [[1, 1, 1, 1]],

    [[1, 1],
     [1, 1]],

    [[1, 0],
     [1, 1]],

    [[0, 1],
     [1, 1]],

    [[1, 1, 1],
     [0, 1, 0]],

    [[1, 1, 0],
     [0, 1, 1]],

    [[1, 1, 1],
     [1, 0, 0]],

    [[1, 0, 0],
     [1, 1, 1]],

    [[1, 1],
     [1, 0],
     [1, 0]],

    [[1, 0],
     [1, 1],
     [0, 1]]
];

let pieces = [];

// O‘yinni boshlash
function startGame() {
    grid = Array.from({ length: SIZE }, () =>
        Array(SIZE).fill(null)
    );

    score = 0;
    scoreElement.textContent = score;

    gameOverScreen.classList.add("hidden");

    drawBoard();
    createPieces();
}

// Doskani chizish
function drawBoard() {
    board.innerHTML = "";

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {

            const cell = document.createElement("div");
            cell.className = "cell";

            if (grid[row][col]) {
                cell.classList.add("filled");
                cell.style.background = grid[row][col];
            }

            cell.dataset.row = row;
            cell.dataset.col = col;

            board.appendChild(cell);
        }
    }
}

// Tasodifiy bloklar yaratish
function createPieces() {
    pieces = [];

    piecesContainer.innerHTML = "";

    for (let i = 0; i < 3; i++) {

        const shape =
            shapes[Math.floor(Math.random() * shapes.length)];

        const color =
            colors[Math.floor(Math.random() * colors.length)];

        pieces.push({
            shape: shape,
            color: color
        });

        createPieceElement(shape, color, i);
    }
}

// Pastdagi blokni chiqarish
function createPieceElement(shape, color, index) {

    const piece = document.createElement("div");
    piece.className = "piece";

    const miniGrid = document.createElement("div");
    miniGrid.className = "mini-grid";

    miniGrid.style.gridTemplateColumns =
        `repeat(${shape[0].length}, 23px)`;

    shape.forEach(row => {

        row.forEach(value => {

            const cell = document.createElement("div");
            cell.className = "mini-cell";

            if (value) {
                cell.style.background = color;
            } else {
                cell.style.visibility = "hidden";
            }

            miniGrid.appendChild(cell);
        });
    });

    piece.appendChild(miniGrid);

    piece.addEventListener("click", () => {
        selectPiece(index);
    });

    piecesContainer.appendChild(piece);
}

// Blok tanlash
function selectPiece(index) {

    if (!pieces[index]) return;

    const piece = pieces[index];

    const possible = findFirstPosition(piece.shape);

    if (!possible) {
        checkGameOver();
        return;
    }

    placePiece(
        piece.shape,
        piece.color,
        possible.row,
        possible.col
    );

    pieces[index] = null;

    const element = piecesContainer.children[index];

    if (element) {
        element.style.visibility = "hidden";
    }

    clearLines();

    if (pieces.every(p => p === null)) {
        setTimeout(createPieces, 250);
    }

    checkGameOver();
}

// Birinchi mos joyni topish
function findFirstPosition(shape) {

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            if (canPlace(shape, row, col)) {
                return { row, col };
            }
        }
    }

    return null;
}

// Joylashtirish mumkinmi?
function canPlace(shape, startRow, startCol) {

    for (let r = 0; r < shape.length; r++) {

        for (let c = 0; c < shape[r].length; c++) {

            if (!shape[r][c]) continue;

            const row = startRow + r;
            const col = startCol + c;

            if (
                row >= SIZE ||
                col >= SIZE ||
                grid[row][col]
            ) {
                return false;
            }
        }
    }

    return true;
}

// Blokni joylashtirish
function placePiece(shape, color, startRow, startCol) {

    for (let r = 0; r < shape.length; r++) {

        for (let c = 0; c < shape[r].length; c++) {

            if (shape[r][c]) {
                grid[startRow + r][startCol + c] = color;
                score += 10;
            }
        }
    }

    updateScore();
    drawBoard();
}

// To‘liq qator va ustunlarni o‘chirish
function clearLines() {

    let cleared = 0;

    // Qatorlar
    for (let row = SIZE - 1; row >= 0; row--) {

        if (grid[row].every(cell => cell !== null)) {

            grid.splice(row, 1);
            grid.unshift(Array(SIZE).fill(null));

            cleared++;
            row++;
        }
    }

    // Ustunlar
    for (let col = SIZE - 1; col >= 0; col--) {

        let full = true;

        for (let row = 0; row < SIZE; row++) {
            if (!grid[row][col]) {
                full = false;
                break;
            }
        }

        if (full) {

            for (let row = 0; row < SIZE; row++) {
                grid[row][col] = null;
            }

            cleared++;
        }
    }

    if (cleared > 0) {

        score += cleared * 100;

        if (cleared >= 2) {
            score += cleared * 50;
        }

        updateScore();
        drawBoard();
    }
}

// Ochko
function updateScore() {

    scoreElement.textContent = score;

    if (score > best) {
        best = score;
        bestElement.textContent = best;

        localStorage.setItem(
            "blockBlastBest",
            best
        );
    }
}

// O‘yin tugaganini tekshirish
function checkGameOver() {

    const availablePieces =
        pieces.filter(piece => piece !== null);

    if (availablePieces.length === 0) return;

    for (const piece of availablePieces) {

        if (findFirstPosition(piece.shape)) {
            return;
        }
    }

    setTimeout(() => {

        finalScore.textContent = score;
        gameOverScreen.classList.remove("hidden");

    }, 200);
}

// Qayta boshlash
restartButton.addEventListener("click", startGame);

playAgain.addEventListener("click", startGame);

// Boshlash
startGame();
const closeGame = document.getElementById("closeGame");

closeGame.addEventListener("click", () => {
    gameOverScreen.classList.add("hidden");
});
