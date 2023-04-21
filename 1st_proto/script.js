const canvas = document.getElementById("gameBoard");
const ctx = canvas.getContext("2d");

const gridSize = 40;
const pointRadius = 4;
const players = ["A", "B"];
let currentPlayer = 0;
let points = { A: [], B: [] };
let score = { A: 0, B: 0 };

canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const gridX = Math.round(x / gridSize) * gridSize;
    const gridY = Math.round(y / gridSize) * gridSize;

    const player = players[currentPlayer];
    points[player].push({ x: gridX, y: gridY });

    drawPoint(gridX, gridY, player);
    checkForSquare(player);

    currentPlayer = (currentPlayer + 1) % 2;
});

function drawPoint(x, y, player) {
    ctx.beginPath();
    ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
    ctx.fillStyle = player === "A" ? "red" : "blue";
    ctx.fill();
    ctx.closePath();
}

function checkForSquare(player) {
    const playerPoints = points[player];

    for (let i = 0; i < playerPoints.length; i++) {
        for (let j = 0; j < playerPoints.length; j++) {
            if (playerPoints[i].x === playerPoints[j].x || playerPoints[i].y === playerPoints[j].y) continue;

            const dx = Math.abs(playerPoints[i].x - playerPoints[j].x);
            const dy = Math.abs(playerPoints[i].y - playerPoints[j].y);
            if (dx !== dy) continue;

            const corner1 = { x: playerPoints[i].x, y: playerPoints[j].y };
            const corner2 = { x: playerPoints[j].x, y: playerPoints[i].y };

            if (pointExists(playerPoints, corner1) && pointExists(playerPoints, corner2)) {
                drawSquare(playerPoints[i], playerPoints[j], corner1, corner2, player);
                score[player]++;
                updateScore(player);
            }
        }
    }
}

function pointExists(pointsArray, point) {
    return pointsArray.some((p) => p.x === point.x && p.y === point.y);
}

function drawSquare(p1, p2, corner1, corner2, player) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(corner1.x, corner1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(corner2.x, corner2.y);
    ctx.closePath();
    ctx.strokeStyle = player === "A" ? "red" : "blue";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function updateScore(player) {
    document.getElementById(`score${player}`).textContent = score[player];
}
