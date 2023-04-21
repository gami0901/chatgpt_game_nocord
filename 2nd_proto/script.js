const canvas = document.getElementById("gameBoard");
const ctx = canvas.getContext("2d");
const passButton = document.getElementById("pass");
const turnText = document.getElementById("turn");

let player = "A";
let points = { A: [], B: [] };
let selectedPoint = null;

canvas.addEventListener("click", (e) => {
    const x = e.clientX - canvas.offsetLeft;
    const y = e.clientY - canvas.offsetTop;

    if (pointExists(x, y)) {
        if (selectedPoint && selectedPoint.player === player) {
            drawLine(selectedPoint.x, selectedPoint.y, x, y, player);
            points[player].push({ x: selectedPoint.x, y: selectedPoint.y, connectedTo: { x, y } });
            selectedPoint = null;
        }
    } else {
        drawPoint(x, y, player);
        points[player].push({ x, y });
        selectedPoint = { x, y, player };
    }

    nextTurn();
});

passButton.addEventListener("click", () => {
    selectedPoint = null;
    nextTurn();
});

function pointExists(x, y) {
    for (const point of [...points.A, ...points.B]) {
        if (Math.abs(point.x - x) < 10 && Math.abs(point.y - y) < 10) {
            return true;
        }
    }
    return false;
}

function drawPoint(x, y, player) {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = player === "A" ? "red" : "blue";
    ctx.fill();
    ctx.closePath();
}

function drawLine(x1, y1, x2, y2, player) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = player === "A" ? "red" : "blue";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function nextTurn() {
    player = player === "A" ? "B" : "A";
    turnText.textContent = `Player ${player}`;
}