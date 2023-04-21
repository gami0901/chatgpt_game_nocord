const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const turnText = document.getElementById("turnText");
const passButton = document.getElementById("passButton");

canvas.width = 600;
canvas.height = 600;
const gridSize = 40;
const pointRadius = 5;

let player = "A";
let selectedPoint = null;
let points = [];
let lines = { A: [], B: [] };
let linesDrawnThisTurn = 0;

canvas.addEventListener("click", onClickCanvas);
passButton.addEventListener("click", onClickPassButton);
updateTurnText();

function onClickCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const gridX = Math.round(x / gridSize) * gridSize;
    const gridY = Math.round(y / gridSize) * gridSize;

    if (selectedPoint) {
        const index = points.findIndex((point) => point.x === gridX && point.y === gridY && point.player === player);
        if (index !== -1) {
            const targetPoint = points[index];
            if (!lineExists(player, selectedPoint, targetPoint) && validLine(player, selectedPoint, targetPoint)) {
                drawLine(selectedPoint.x, selectedPoint.y, targetPoint.x, targetPoint.y, player);
                lines[player].push({ x1: selectedPoint.x, y1: selectedPoint.y, x2: targetPoint.x, y2: targetPoint.y });
                linesDrawnThisTurn += 1;
                if (linesDrawnThisTurn < 2 && canFormRectangle(player, selectedPoint, targetPoint)) {
                    passButton.disabled = false;
                    updateTurnText();
                } else {
                    selectedPoint = null;
                    passButton.disabled = true;
                    nextTurn();
                }
            }
        }
    } else {
        if (!pointExists(gridX, gridY)) {
            drawPoint(gridX, gridY, player);
            points.push({ x: gridX, y: gridY, player: player });
            selectedPoint = { x: gridX, y: gridY };
            linesDrawnThisTurn = 0;
            passButton.disabled = false;
            updateTurnText();
        }
    }
}

function onClickPassButton() {
    passButton.disabled = true;
    selectedPoint = null;
    nextTurn();
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
        
        function linesIntersect(line1, line2) {
            const det = (line1.x2 - line1.x1) * (line2.y2 - line2.y1) - (line1.y2 - line1.y1) * (line2.x2 - line2.x1);
            if (det === 0) {
                return false;
            }
        
            const lambda = ((line2.y2 - line2.y1) * (line2.x2 - line1.x1) + (line2.x1 - line2.x2) * (line2.y2 - line1.y1)) / det;
            const gamma = ((line1.y1 - line1.y2) * (line2.x2 - line1.x1) + (line1.x2 - line1.x1) * (line2.y2 - line1.y1)) / det;
        
            return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
        }
        
        function validLine(player, point1, point2) {
            const opponent = player === "A" ? "B" : "A";
        
            // Check if the line intersects any of the opponent's lines
            const opponentLines = lines[opponent];
            for (const line of opponentLines) {
                if (linesIntersect({ x1: point1.x, y1: point1.y, x2: point2.x, y2: point2.y }, line)) {
                    return false;
                }
            }
        
            // Check if the line overlaps any of the opponent's points
            const opponentPoints = points.filter((point) => point.player === opponent);
            for (const point of opponentPoints) {
                if (
                    (point.x === point1.x && point.y === point1.y) ||
                    (point.x === point2.x && point.y === point2.y)
                ) {
                    return false;
                }
            }
        
            return true;
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

function canFormRectangle(player, point1, point2) {
    const linesWithSharedPoints1 = lines[player].filter(
        (line) => (line.x1 === point1.x && line.y1 === point1.y) || (line.x2 === point1.x && line.y2 === point1.y)
    );

    for (const line of linesWithSharedPoints1) {
        const thirdPoint = line.x1 === point1.x && line.y1 === point1.y ? { x: line.x2, y: line.y2 } : { x: line.x1, y: line.y1 };

        if (pointExists(thirdPoint.x, thirdPoint.y)) {
            const linesWithSharedPoints2 = lines[player].filter(
                (line) => (line.x1 === point2.x && line.y1 === point2.y) || (line.x2 === point2.x && line.y2 === point2.y)
            );
            for (const line of linesWithSharedPoints2) {
                const fourthPoint = line.x1 === point2.x && line.y1 === point2.y ? { x: line.x2, y: line.y2 } : { x: line.x1, y: line.y1 };
                if (fourthPoint.x === thirdPoint.x && fourthPoint.y === thirdPoint.y) {
                    return true;
                }
            }
        }
    }
    return false;
}

function validLine(player, point1, point2) {
    const opponent = player === "A" ? "B" : "A";

    // Check if the line intersects any of the opponent's lines
    const opponentLines = lines[opponent];
    for (const line of opponentLines) {
        if (linesIntersect({ x1: point1.x, y1: point1.y, x2: point2.x, y2: point2.y }, line)) {
            return false;
        }
    }

    // Check if the line overlaps any of the opponent's points
    const opponentPoints = points.filter((point) => point.player === opponent);
    for (const point of opponentPoints) {
        if (
            (point.x === point1.x && point.y === point1.y) ||
            (point.x === point2.x && point.y === point2.y)
        ) {
            return false;
        }
    }

    return true;
}


        
