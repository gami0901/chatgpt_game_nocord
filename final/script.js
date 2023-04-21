const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const turnText = document.getElementById("turnText");
const passButton = document.getElementById("passButton");
const scoreText = document.getElementById("scoreText");

const playerAScoreText = document.getElementById("playerAScore");
const playerBScoreText = document.getElementById("playerBScore");

canvas.width = 600;
canvas.height = 600;
const gridSize = 10;
const pointRadius = 5;

let player = "A";
let selectedPoint = null;
let points = [];
let lines = { A: [], B: [] };
let linesDrawnThisTurn = 0;
let scoreA = 0;
let scoreB = 0;

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
        const index = points.findIndex((point) => point.x === gridX && point.y === gridY && point.player === player);
        if (index !== -1) {
          const targetPoint = points[index];
          if (!lineExists(player, selectedPoint, targetPoint) && validLine(player, selectedPoint, targetPoint)) {
            drawLine(selectedPoint.x, selectedPoint.y, targetPoint.x, targetPoint.y, player);
            lines[player].push({ x1: selectedPoint.x, y1: selectedPoint.y, x2: targetPoint.x, y2: targetPoint.y });
            linesDrawnThisTurn += 1;

            if (linesDrawnThisTurn === 2) {
                const rectanglesCount = countNewRectangles(player, selectedPoint, targetPoint);
                
                // スコアを更新
                if (player === "A") {
                    scoreA += rectanglesCount;
                } else {
                    scoreB += rectanglesCount;
                }
                updateScoreText();
            }

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

function countNewRectangles(player, pointA, pointB) {
  const pointCGroup = findConnectedPoints(pointB, player).filter(
    (pointC) => !(pointC.x === pointA.x && pointC.y === pointA.y)
  );

  let rectanglesCount = 0;

  for (const pointC of pointCGroup) {
      const connectedLines = lines[player].filter((line) =>
          (line.x1 === pointC.x && line.y1 === pointC.y) || (line.x2 === pointC.x && line.y2 === pointC.y)
      );

      for (const line of connectedLines) {
          const pointD = {
              x: line.x1 === pointC.x && line.y1 === pointC.y ? line.x2 : line.x1,
              y: line.x1 === pointC.x && line.y1 === pointC.y ? line.y2 : line.y1,
          };

          if (
              !(
                  (pointD.x === pointA.x && pointD.y === pointA.y) ||
                  (pointD.x === pointB.x && pointD.y === pointB.y) ||
                  pointCGroup.some((pointC) => pointC.x === pointD.x && pointC.y === pointD.y)
              )
          ) {
              if (validLine(player, pointA, pointD)) {
                  rectanglesCount++;
              }
          }
      }
  }

  return rectanglesCount;
}
  
function onClickPassButton() {
    passButton.disabled = true;
    selectedPoint = null;
    nextTurn();
}

function canFormRectangle(player, pointA, pointB) {
    const pointCGroup = findConnectedPoints(pointB, player).filter(
      (pointC) => !(pointC.x === pointA.x && pointC.y === pointA.y)
    );
  
    for (const pointC of pointCGroup) {
      const connectedLines = lines[player].filter((line) =>
        (line.x1 === pointC.x && line.y1 === pointC.y) || (line.x2 === pointC.x && line.y2 === pointC.y)
      );
  
      for (const line of connectedLines) {
        const pointD = {
          x: line.x1 === pointC.x && line.y1 === pointC.y ? line.x2 : line.x1,
          y: line.x1 === pointC.x && line.y1 === pointC.y ? line.y2 : line.y1,
        };
  
        if (
          !(
            (pointD.x === pointA.x && pointD.y === pointA.y) ||
            (pointD.x === pointB.x && pointD.y === pointB.y) ||
            pointCGroup.some((pointC) => pointC.x === pointD.x && pointC.y === pointD.y)
          )
        ) {
          return validLine(player, pointA, pointD);
        }
      }
    }
  
    return false;
  }

  function findConnectedPoints(targetPoint, player) {
    const connectedLines = lines[player].filter(
        (line) =>
            (line.x1 === targetPoint.x && line.y1 === targetPoint.y) ||
            (line.x2 === targetPoint.x && line.y2 === targetPoint.y)
    );
    let connectedPoints = [];
    for (const line of connectedLines) {
        const point = {
            x: line.x1 === targetPoint.x && line.y1 === targetPoint.y ? line.x2 : line.x1,
            y: line.x1 === targetPoint.x && line.y1 === targetPoint.y ? line.y2 : line.y1,
        };
        connectedPoints.push(point);
    }
    return connectedPoints;
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
            (line.x1 === point2.x && line.x1 === point2.x && line.y1 === point2.y && line.x2 === point1.x && line.y2 === point1.y)
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

    const myLines = lines[player];
    for (const line of myLines) {
        if (linesIntersect({ x1: point1.x, y1: point1.y, x2: point2.x, y2: point2.y }, line)) {
            return false;
        }
    }

    // Check if the line overlaps any of the opponent's points
    const opponentPoints = points.filter((point) => point.player === opponent);
    for (const point of opponentPoints) {
      if (
        (point.x === point1.x && point.y === point1.y) ||
        (point.x === point2.x && point.y === point2.y) ||
        pointOnLineSegment(point, point1, point2)
      ) {
        return false;
      }
    }

    return true;
}

function pointOnLineSegment(point, linePoint1, linePoint2) {
    const crossProduct = (point.y - linePoint1.y) * (linePoint2.x - linePoint1.x) - (point.x - linePoint1.x) * (linePoint2.y - linePoint1.y);
    if (Math.abs(crossProduct) > 0.0001) {
      return false;
    }
  
    const dotProduct = (point.x - linePoint1.x) * (linePoint2.x - linePoint1.x) + (point.y - linePoint1.y) * (linePoint2.y - linePoint1.y);
    if (dotProduct < 0) {
      return false;
    }
  
    const squaredLength = Math.pow(linePoint2.x - linePoint1.x, 2) + Math.pow(linePoint2.y - linePoint1.y, 2);
    if (dotProduct > squaredLength) {
      return false;
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

function countRectangles(player) {
  const playerLines = lines[player];
  let rectangles = 0;

  for (let i = 0; i < playerLines.length; i++) {
    const line1 = playerLines[i];
    for (let j = i + 1; j < playerLines.length; j++) {
      const line2 = playerLines[j];

      if (shareTwoDistinctPoints(line1, line2)) {
        const commonPoints = findCommonPoints(line1, line2);
        const otherPoints = findOtherPoints(line1, line2);

        if (validLine(player, otherPoints[0], otherPoints[1])) {
          rectangles++;
        }
      }
    }
  }

  return rectangles;
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
  playerAScoreText.textContent = `Player A score: ${scoreA}`;
  playerBScoreText.textContent = `Player B score: ${scoreB}`;
}