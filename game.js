
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 20;
const ROWS = 21;
const COLS = 19;

canvas.width = COLS * TILE_SIZE;
canvas.height = ROWS * TILE_SIZE;

// Maze layout: 1 = wall, 0 = path, 2 = pellet, 3 = power pellet
const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1],
    [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
    [1, 1, 1, 1, 2, 1, 0, 1, 1, 0, 1, 1, 0, 1, 2, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
    [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
    [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
    [1, 3, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2, 3, 1],
    [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1],
    [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

let score = 0;
let lives = 3;
let totalPellets = 0;

// Pac-Man
const pacman = {
    x: 9,
    y: 15,
    dx: 0,
    dy: 0,
    radius: TILE_SIZE / 2 - 2,
    speed: 2,
    mouthOpen: 0.2, // angle for mouth animation
    mouthOpening: true,
};

// Ghosts
const ghosts = [
    { x: 8, y: 9, dx: 1, dy: 0, color: 'red', radius: TILE_SIZE / 2 - 2 },
    { x: 9, y: 9, dx: -1, dy: 0, color: 'pink', radius: TILE_SIZE / 2 - 2 },
    { x: 10, y: 9, dx: 1, dy: 0, color: 'cyan', radius: TILE_SIZE / 2 - 2 },
    { x: 9, y: 8, dx: 0, dy: 1, color: 'orange', radius: TILE_SIZE / 2 - 2 },
];
const GHOST_SPEED = 1.5;

// --- Drawing Functions ---
function drawMaze() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const tile = maze[row][col];
            if (tile === 1) { // Wall
                ctx.fillStyle = 'blue';
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (tile === 2) { // Pellet
                ctx.beginPath();
                ctx.arc(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2, 2, 0, 2 * Math.PI);
                ctx.fillStyle = 'white';
                ctx.fill();
            } else if (tile === 3) { // Power Pellet
                ctx.beginPath();
                ctx.arc(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'yellow';
                ctx.fill();
            }
        }
    }
}

function drawPacman() {
    ctx.save();
    ctx.translate(pacman.x * TILE_SIZE + TILE_SIZE / 2, pacman.y * TILE_SIZE + TILE_SIZE / 2);
    
    let angle = 0;
    if (pacman.dx > 0) angle = 0; // Right
    else if (pacman.dx < 0) angle = Math.PI; // Left
    else if (pacman.dy > 0) angle = 0.5 * Math.PI; // Down
    else if (pacman.dy < 0) angle = 1.5 * Math.PI; // Up
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.arc(0, 0, pacman.radius, pacman.mouthOpen * Math.PI, (2 - pacman.mouthOpen) * Math.PI);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.restore();
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        const gx = ghost.x * TILE_SIZE + TILE_SIZE / 2;
        const gy = ghost.y * TILE_SIZE + TILE_SIZE / 2;
        
        ctx.beginPath();
        ctx.arc(gx, gy, ghost.radius, Math.PI, 0);
        ctx.lineTo(gx + ghost.radius, gy + ghost.radius);
        ctx.lineTo(gx - ghost.radius, gy + ghost.radius);
        ctx.closePath();
        ctx.fillStyle = ghost.color;
        ctx.fill();

        // Eyes
        ctx.fillStyle = 'white';
        const eyeOffsetX = TILE_SIZE / 4;
        const eyeOffsetY = -TILE_SIZE / 8;
        ctx.beginPath();
        ctx.arc(gx - eyeOffsetX, gy + eyeOffsetY, 3, 0, 2 * Math.PI); // Left eye
        ctx.arc(gx + eyeOffsetX, gy + eyeOffsetY, 3, 0, 2 * Math.PI); // Right eye
        ctx.fill();

        // Pupils
        ctx.fillStyle = 'black';
        const pupilOffsetX = ghost.dx * 1;
        const pupilOffsetY = ghost.dy * 1;
        ctx.beginPath();
        ctx.arc(gx - eyeOffsetX + pupilOffsetX, gy + eyeOffsetY + pupilOffsetY, 1.5, 0, 2 * Math.PI);
        ctx.arc(gx + eyeOffsetX + pupilOffsetX, gy + eyeOffsetY + pupilOffsetY, 1.5, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${score}`, 10, TILE_SIZE - 4);
}

function drawLives() {
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Lives: ${lives}`, canvas.width - 70, TILE_SIZE - 4);
}

// --- Game Logic ---
function updatePacman() {
    // Animate mouth
    if (pacman.mouthOpening) {
        pacman.mouthOpen += 0.05;
        if (pacman.mouthOpen >= 0.4) pacman.mouthOpening = false;
    } else {
        pacman.mouthOpen -= 0.05;
        if (pacman.mouthOpen <= 0.05) pacman.mouthOpening = true;
    }

    // Movement
    const targetX = pacman.x + pacman.dx;
    const targetY = pacman.y + pacman.dy;

    // Check for wall collision at the center of the tile
    if (maze[Math.round(targetY)][Math.round(targetX)] !== 1) {
         pacman.x += pacman.dx / TILE_SIZE * pacman.speed;
         pacman.y += pacman.dy / TILE_SIZE * pacman.speed;
    }


    // Handle screen wrapping (tunnels)
    if (pacman.x < -1) pacman.x = COLS;
    if (pacman.x > COLS) pacman.x = -1;

    // Eat pellets
    const currentGridX = Math.round(pacman.x);
    const currentGridY = Math.round(pacman.y);
    if (maze[currentGridY] && maze[currentGridY][currentGridX] === 2) {
        maze[currentGridY][currentGridX] = 0;
        score += 10;
        totalPellets--;
    } else if (maze[currentGridY] && maze[currentGridY][currentGridX] === 3) {
        maze[currentGridY][currentGridX] = 0;
        score += 50;
        // TODO: Activate power mode
    }
}

function updateGhosts() {
    ghosts.forEach(ghost => {
        const possibleMoves = [];
        const { x, y, dx, dy } = ghost;

        // Check potential new directions (don't allow reversing)
        if (dx === 0) { // currently moving vertically
            if (maze[Math.round(y)][Math.round(x - 1)] !== 1) possibleMoves.push({ dx: -1, dy: 0 });
            if (maze[Math.round(y)][Math.round(x + 1)] !== 1) possibleMoves.push({ dx: 1, dy: 0 });
        }
        if (dy === 0) { // currently moving horizontally
            if (maze[Math.round(y - 1)][Math.round(x)] !== 1) possibleMoves.push({ dx: 0, dy: -1 });
            if (maze[Math.round(y + 1)][Math.round(x)] !== 1) possibleMoves.push({ dx: 0, dy: 1 });
        }

        const nextGridX = Math.round(x + dx);
        const nextGridY = Math.round(y + dy);

        // If ghost hits a wall or is at an intersection, choose a new direction
        if (maze[nextGridY][nextGridX] === 1 || possibleMoves.length > 0) {
            const currentMoveValid = maze[Math.round(y + dy)][Math.round(x + dx)] !== 1;
            if (currentMoveValid) {
                 possibleMoves.push({dx, dy}); // prefer to continue straight
            }
            
            if(possibleMoves.length > 0) {
                const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                ghost.dx = move.dx;
                ghost.dy = move.dy;
            }
        }

        ghost.x += ghost.dx / TILE_SIZE * GHOST_SPEED;
        ghost.y += ghost.dy / TILE_SIZE * GHOST_SPEED;

        // Handle screen wrapping
        if (ghost.x < -1) ghost.x = COLS;
        if (ghost.x > COLS) ghost.x = -1;
    });
}


function checkCollisions() {
    ghosts.forEach(ghost => {
        const dx = pacman.x - ghost.x;
        const dy = pacman.y - ghost.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (pacman.radius + ghost.radius) / TILE_SIZE) {
            lives--;
            if (lives <= 0) {
                alert("Game Over!");
                document.location.reload();
            } else {
                // Reset positions
                pacman.x = 9;
                pacman.y = 15;
                pacman.dx = 0;
                pacman.dy = 0;
            }
        }
    });
}


function checkWin() {
    if (totalPellets === 0) {
        alert("You Win!");
        // TODO: Reset for next level
        document.location.reload();
    }
}

// --- Game Loop ---
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawMaze();
    drawPacman();
    drawGhosts();
    drawScore();
    drawLives();

    updatePacman();
    updateGhosts();
    
    checkCollisions();
    checkWin();

    requestAnimationFrame(gameLoop);
}

// --- Input Handling ---
window.addEventListener('keydown', (e) => {
    // Use integers for direction to avoid floating point issues
    if (e.key === 'ArrowUp') {
        if (maze[Math.round(pacman.y - 1)][Math.round(pacman.x)] !== 1) {
            pacman.dx = 0;
            pacman.dy = -1;
        }
    } else if (e.key === 'ArrowDown') {
        if (maze[Math.round(pacman.y + 1)][Math.round(pacman.x)] !== 1) {
            pacman.dx = 0;
            pacman.dy = 1;
        }
    } else if (e.key === 'ArrowLeft') {
         if (maze[Math.round(pacman.y)][Math.round(pacman.x - 1)] !== 1) {
            pacman.dx = -1;
            pacman.dy = 0;
        }
    } else if (e.key === 'ArrowRight') {
         if (maze[Math.round(pacman.y)][Math.round(pacman.x + 1)] !== 1) {
            pacman.dx = 1;
            pacman.dy = 0;
        }
    }
});

// --- Initialization ---
function init() {
    // Count total pellets
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (maze[row][col] === 2) {
                totalPellets++;
            }
        }
    }
    gameLoop();
}

init();
