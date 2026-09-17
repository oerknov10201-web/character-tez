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
let pieces = [];
let score = 0;

let best =
    Number(localStorage.getItem("blockBlastBest")) || 0;

let dragging = null;

bestElement.textContent = best;


// ==========================
// BLOK SHAKLLARI
// ==========================

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


// ==========================
// RANGLAR
// ==========================

const colors = [
    "#ff5c7a",
    "#ff9f43",
    "#ffd32a",
    "#20bf6b",
    "#2d98da",
    "#8854d0",
    "#00cec9"
];


// ==========================
// O'YINNI BOSHLASH
// ==========================

function startGame() {

    grid = Array.from(
        { length: SIZE },
        () => Array(SIZE).fill(null)
    );

    score = 0;

    scoreElement.textContent = score;

    gameOverScreen.classList.add("hidden");

    createPieces();

    drawBoard();
}


// ==========================
// DOSKA
// ==========================

function drawBoard() {

    board.innerHTML = "";

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            const cell =
                document.createElement("div");

            cell.className = "cell";

            cell.dataset.row = row;
            cell.dataset.col = col;

            if (grid[row][col]) {

                cell.classList.add("filled");

                cell.style.background =
                    grid[row][col];
            }

            board.appendChild(cell);
        }
    }
}


// ==========================
// 3 TA BLOK
// ==========================

function createPieces() {

    pieces = [];

    piecesContainer.innerHTML = "";

    for (let i = 0; i < 3; i++) {

        const shape =
            shapes[
                Math.floor(
                    Math.random() * shapes.length
                )
            ];

        const color =
            colors[
                Math.floor(
                    Math.random() * colors.length
                )
            ];

        pieces.push({
            shape: shape,
            color: color
        });

        createPieceElement(
            shape,
            color,
            i
        );
    }
}


// ==========================
// BLOKNI CHIQARISH
// ==========================

function createPieceElement(
    shape,
    color,
    index
) {

    const piece =
        document.createElement("div");

    piece.className = "piece";

    const miniGrid =
        document.createElement("div");

    miniGrid.className = "mini-grid";

    miniGrid.style.gridTemplateColumns =
        `repeat(${shape[0].length}, 23px)`;

    shape.forEach(row => {

        row.forEach(value => {

            const cell =
                document.createElement("div");

            cell.className = "mini-cell";

            if (value) {

                cell.style.background =
                    color;

            } else {

                cell.style.visibility =
                    "hidden";
            }

            miniGrid.appendChild(cell);
        });
    });

    piece.appendChild(miniGrid);


    // MUHIM:
    // Faqat bosish emas, USHLAB SUDRASH
    piece.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            startDrag(
                event,
                index
            );
        }
    );

    piecesContainer.appendChild(piece);
}


// ==========================
// BLOKNI USHLASH
// ==========================

function startDrag(event, index) {

    if (!pieces[index]) return;

    const element =
        piecesContainer.children[index];

    dragging = {

        index: index,

        shape: pieces[index].shape,

        color: pieces[index].color,

        element: element,

        startX: event.clientX,

        startY: event.clientY,

        moved: false
    };

    element.style.opacity = "0.55";

    showPreview(
        event.clientX,
        event.clientY
    );
}


// ==========================
// SUDRASH
// ==========================

document.addEventListener(
    "pointermove",
    event => {

        if (!dragging) return;


        const dx =
            Math.abs(
                event.clientX -
                dragging.startX
            );

        const dy =
            Math.abs(
                event.clientY -
                dragging.startY
            );


        // Kamida 8px harakat bo'lsa
        // bu DRAG hisoblanadi
        if (dx > 8 || dy > 8) {

            dragging.moved = true;
        }


        if (dragging.moved) {

            showPreview(
                event.clientX,
                event.clientY
            );
        }
    }
);


// ==========================
// BLOKNI QO'YISH
// ==========================

document.addEventListener(
    "pointerup",
    event => {

        if (!dragging) return;

        const data = dragging;

        removePreview();

        data.element.style.opacity = "1";


        // MUHIM:
        // Agar foydalanuvchi faqat BOSGAN bo'lsa,
        // hech narsa qilmaymiz.
        if (!data.moved) {

            dragging = null;

            return;
        }


        const position =
            getBoardPosition(
                event.clientX,
                event.clientY,
                data.shape
            );


        if (
            position &&
            canPlace(
                data.shape,
                position.row,
                position.col
            )
        ) {

            placePiece(
                data.shape,
                data.color,
                position.row,
                position.col
            );

            pieces[data.index] = null;

            data.element.style.visibility =
                "hidden";

            clearLines();


            // 3 ta blok tugadi
            if (
                pieces.every(
                    piece => piece === null
                )
            ) {

                setTimeout(
                    createPieces,
                    250
                );
            }

            setTimeout(
                checkGameOver,
                300
            );
        }


        dragging = null;
    }
);


// ==========================
// DOSKADAGI JOY
// ==========================

function getBoardPosition(
    x,
    y,
    shape
) {

    const cells =
        board.querySelectorAll(".cell");

    if (!cells.length) return null;

    const first =
        cells[0].getBoundingClientRect();

    const second =
        cells[1].getBoundingClientRect();

    const pitch =
        second.left - first.left;

    const rect =
        board.getBoundingClientRect();

    const xInside =
        x - rect.left - 7;

    const yInside =
        y - rect.top - 7;

    let col =
        Math.floor(
            xInside / pitch
        );

    let row =
        Math.floor(
            yInside / pitch
        );


    col -= Math.floor(
        shape[0].length / 2
    );

    row -= Math.floor(
        shape.length / 2
    );


    return {
        row: row,
        col: col
    };
}


// ==========================
// PREVIEW
// ==========================

function showPreview(x, y) {

    removePreview();

    if (!dragging) return;

    if (!dragging.moved) return;

    const position =
        getBoardPosition(
            x,
            y,
            dragging.shape
        );

    if (!position) return;


    const valid =
        canPlace(
            dragging.shape,
            position.row,
            position.col
        );


    for (
        let r = 0;
        r < dragging.shape.length;
        r++
    ) {

        for (
            let c = 0;
            c < dragging.shape[r].length;
            c++
        ) {

            if (
                !dragging.shape[r][c]
            ) continue;


            const row =
                position.row + r;

            const col =
                position.col + c;


            if (
                row < 0 ||
                row >= SIZE ||
                col < 0 ||
                col >= SIZE
            ) continue;


            const cell =
                board.querySelector(
                    `.cell[data-row="${row}"][data-col="${col}"]`
                );


            if (cell) {

                cell.classList.add(
                    "preview"
                );

                cell.style.background =
                    valid
                        ? dragging.color
                        : "#ff4d4d";
            }
        }
    }
}


// ==========================
// PREVIEWNI O'CHIRISH
// ==========================

function removePreview() {

    board
        .querySelectorAll(".preview")
        .forEach(cell => {

            cell.classList.remove(
                "preview"
            );

            const row =
                Number(cell.dataset.row);

            const col =
                Number(cell.dataset.col);


            if (grid[row][col]) {

                cell.style.background =
                    grid[row][col];

            } else {

                cell.style.background = "";
            }
        });
}


// ==========================
// JOYLASHTIRISH MUMKINMI?
// ==========================

function canPlace(
    shape,
    startRow,
    startCol
) {

    for (
        let r = 0;
        r < shape.length;
        r++
    ) {

        for (
            let c = 0;
            c < shape[r].length;
            c++
        ) {

            if (!shape[r][c])
                continue;


            const row =
                startRow + r;

            const col =
                startCol + c;


            if (
                row < 0 ||
                row >= SIZE ||
                col < 0 ||
                col >= SIZE
            ) {

                return false;
            }


            if (grid[row][col]) {

                return false;
            }
        }
    }

    return true;
}


// ==========================
// BLOKNI QO'YISH
// ==========================

function placePiece(
    shape,
    color,
    startRow,
    startCol
) {

    let blocks = 0;

    for (
        let r = 0;
        r < shape.length;
        r++
    ) {

        for (
            let c = 0;
            c < shape[r].length;
            c++
        ) {

            if (shape[r][c]) {

                grid[startRow + r]
                    [startCol + c] =
                    color;

                blocks++;
            }
        }
    }


    score += blocks * 10;

    updateScore();

    drawBoard();
}


// ==========================
// QATOR / USTUN
// ==========================

function clearLines() {

    let cleared = 0;


    // QATOR
    for (
        let row = SIZE - 1;
        row >= 0;
        row--
    ) {

        if (
            grid[row].every(
                cell => cell !== null
            )
        ) {

            grid.splice(row, 1);

            grid.unshift(
                Array(SIZE).fill(null)
            );

            cleared++;

            row++;
        }
    }


    // USTUN
    for (
        let col = SIZE - 1;
        col >= 0;
        col--
    ) {

        let full = true;

        for (
            let row = 0;
            row < SIZE;
            row++
        ) {

            if (!grid[row][col]) {

                full = false;

                break;
            }
        }


        if (full) {

            for (
                let row = 0;
                row < SIZE;
                row++
            ) {

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


// ==========================
// OCHKO
// ==========================

function updateScore() {

    scoreElement.textContent =
        score;


    if (score > best) {

        best = score;

        bestElement.textContent =
            best;

        localStorage.setItem(
            "blockBlastBest",
            best
        );
    }
}


// ==========================
// MOS JOY TOPISH
// ==========================

function findFirstPosition(shape) {

    for (
        let row = 0;
        row < SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < SIZE;
            col++
        ) {

            if (
                canPlace(
                    shape,
                    row,
                    col
                )
            ) {

                return {
                    row: row,
                    col: col
                };
            }
        }
    }

    return null;
}


// ==========================
// GAME OVER
// ==========================

function checkGameOver() {

    const available =
        pieces.filter(
            piece => piece !== null
        );


    if (available.length === 0)
        return;


    for (const piece of available) {

        if (
            findFirstPosition(
                piece.shape
            )
        ) {

            return;
        }
    }


    finalScore.textContent =
        score;

    gameOverScreen.classList.remove(
        "hidden"
    );
}


// ==========================
// QAYTA BOSHLASH
// ==========================

restartButton.addEventListener(
    "click",
    startGame
);

playAgain.addEventListener(
    "click",
    startGame
);


// ==========================
// O'YIN
// ==========================

startGame();
