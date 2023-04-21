const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const turnText = document.getElementById("turnText");
const scoreText = document.getElementById("scoreText");
const passButton = document.getElementById("passButton");

canvas.width = 600;
canvas.height = 600;
const gridSize = 40;
const pointRadius = 5;

let player = "A";
let selectedPoint = null;
let points = [];
let lines = { A: [], B: [] };
let score = { A: 0, B: 0 };

canvas.addEventListener("click", onClickCanvas);
passButton.addEventListener("click", onClickPassButton);
updateTurnText();
updateScoreText();

function onClickCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const gridX = Math.round(x / gridSize) * gridSize;
    const gridY = Math.round(y / gridSize) * gridSize;

    if (selectedPoint) {
        if (gridX === selectedPoint.x && gridY === selectedPoint.y) {
            selectedPoint = null;
            updateTurnText();
        } else {
            const index = points.findIndex((point) => point.x === gridX && point.y === gridY && point.player === player);
            if (index !== -1) {
                const targetPoint = points[index];
                if (!lineExists(player, selectedPoint, targetPoint)) {
                    drawLine(selectedPoint.x, selectedPoint.y, targetPoint.x, targetPoint.y, player);
                    lines[player].push({ x1: selectedPoint.x, y1: selectedPoint.y, x2: targetPoint.x, y2: targetPoint.y });
                    selectedPoint = null;
                    checkForSquares(player);
                    nextTurn();
                }
            }
        }
    } else {
        if (!pointExists(gridX, gridY)) {
            drawPoint(gridX, gridY, player);
            points.push({ x: gridX, y: gridY, player: player });
            selectedPoint = { x: gridX, y: gridY };
            updateTurnText();
        }
    }
}

function onClickPassButton() {
    if (selectedPoint) {
        selectedPoint = null;
        nextTurn();
    }
}

function pointExists(x, y) {
    return points.some((point) => point.x === x && point.y === y);
}

function drawPoint(x, y, player) {
    ctx.beginPath();
    ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
    ctx.fillStyle = player === "A" ? "red" : "blue";
    ctx.fill();
    ctx.closePath();
}

function lineExists(player, point1, point2) {
    return lines[player].some(
        (line) =>
            (line.x1 === point1.x && line.y1 === point1.y && line.x2 === point2.x && line.y2 === point2.y) ||
            (line.x1 === point2.x && line.y1 === point2.y && line.x2 === point1.x && line.y2 === point1.y)
    );
}

function drawLine(x1, y1, x2, y2, player) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = player === "A" ? "red" : "blue";
    ctx.stroke();
    ctx.closePath();
}

function nextTurn() {
    player = player === "A" ? "B" : "A";
    updateTurnText();
}

function updateTurnText() {
    if (selectedPoint) {
        turnText.textContent = `Player ${player} (selecting line)`;
    } else {
        turnText.textContent = `Player ${player} (placing point)`;
    }
}

function updateScoreText() {
    scoreText.textContent = `Score - Player A: ${score.A}, Player B: ${score.B}`;
}

function checkForSquares(player) {
    const linesOfPlayer = lines[player];
    for (let i = 0; i < linesOfPlayer.length; i++) {
        for (let j = i + 1; j < linesOfPlayer.length; j++) {
            const line1 = linesOfPlayer[i];
            const line2 = linesOfPlayer[j];
            if (isSquare(line1, line2)) {
                score[player]++;
                updateScoreText();
            }
        }
    }
}

function isSquare(line1, line2) {
    const points1 = [{ x: line1.x1, y: line1.y1 }, { x: line1.x2, y: line1.y2 }];
    const points2 = [{ x: line2.x1, y: line2.y1 }, { x: line2.x2, y: line2.y2 }];

    for (const point1 of points1) {
        for (const point2 of points2) {
            if (point1.x === point2.x && point1.y === point2.y) {
                return false;
            }
        }
    }

    const diagonalLength = Math.sqrt(Math.pow(line1.x1 - line1.x2, 2) + Math.pow(line1.y1 - line1.y2, 2));
    if (Math.abs(diagonalLength - Math.sqrt(Math.pow(line2.x1 - line2.x2, 2) + Math.pow(line2.y1 - line2.y2, 2))) > 1) {
        return false;
    }

    return true;
}