// Game constants and state
const MAZE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,2,1,1,2,1,1,1,0,1,1,1,1],
    [2,2,2,1,0,1,2,2,2,2,2,2,2,2,1,0,1,2,2,2],
    [1,1,1,1,0,1,2,1,1,2,2,1,1,2,1,0,1,1,1,1],
    [0,0,0,0,0,2,2,1,2,2,2,2,1,2,2,0,0,0,0,0],
    [1,1,1,1,0,1,2,1,1,1,1,1,1,2,1,0,1,1,1,1],
    [2,2,2,1,0,1,2,2,2,2,2,2,2,2,1,0,1,2,2,2],
    [1,1,1,1,0,1,1,1,2,1,1,2,1,1,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const INITIAL_PACMAN_POSITION = { x: 9, y: 15 };

let gameState = {
    pacman: { ...INITIAL_PACMAN_POSITION },
    score: 0,
    dots: [],
    gameOver: false,
    gameWon: false,
    level: 1
};

let direction = 'right';
let gameInterval = null;

// DOM elements
const gameBoard = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const statusCard = document.getElementById('status-card');
const statusElement = document.getElementById('status');
const restartContainer = document.getElementById('restart-container');
const restartButton = document.getElementById('restart-btn');

// Initialize dots from maze
function initializeDots() {
    return MAZE.map(row => row.map(cell => cell === 0));
}

// Initialize game
function initGame() {
    gameState = {
        pacman: { ...INITIAL_PACMAN_POSITION },
        score: 0,
        dots: initializeDots(),
        gameOver: false,
        gameWon: false,
        level: 1
    };
    direction = 'right';
    
    renderGame();
    updateUI();
    
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    gameInterval = setInterval(movePacman, 200);
    
    showToast("New game started!");
}

// Render the game board
function renderGame() {
    gameBoard.innerHTML = '';
    
    MAZE.forEach((row, y) => {
        row.forEach((cell, x) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            
            const isPacman = gameState.pacman.x === x && gameState.pacman.y === y;
            const hasDot = gameState.dots[y] && gameState.dots[y][x];
            
            if (cell === 1) {
                cellElement.classList.add('wall');
            } else {
                cellElement.classList.add('empty');
            }
            
            // Add dot
            if (hasDot && !isPacman) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                cellElement.appendChild(dot);
            }
            
            // Add Pacman
            if (isPacman) {
                const pacman = document.createElement('div');
                pacman.className = 'pacman';
                cellElement.appendChild(pacman);
            }
            
            gameBoard.appendChild(cellElement);
        });
    });
}

// Update UI elements
function updateUI() {
    scoreElement.textContent = gameState.score.toLocaleString();
    levelElement.textContent = gameState.level;
    
    if (gameState.gameOver || gameState.gameWon) {
        statusCard.style.display = 'block';
        statusElement.textContent = gameState.gameWon ? 'YOU WIN!' : 'GAME OVER';
        statusElement.className = `stat-value ${gameState.gameWon ? 'win' : 'game-over'}`;
        restartContainer.style.display = 'block';
        
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
    } else {
        statusCard.style.display = 'none';
        restartContainer.style.display = 'none';
    }
}

// Move Pacman
function movePacman() {
    if (gameState.gameOver || gameState.gameWon) return;
    
    const { pacman } = gameState;
    let newX = pacman.x;
    let newY = pacman.y;
    
    // Calculate new position based on direction
    switch (direction) {
        case 'up':
            newY = Math.max(0, pacman.y - 1);
            break;
        case 'down':
            newY = Math.min(MAZE.length - 1, pacman.y + 1);
            break;
        case 'left':
            newX = Math.max(0, pacman.x - 1);
            break;
        case 'right':
            newX = Math.min(MAZE[0].length - 1, pacman.x + 1);
            break;
    }
    
    // Check for wall collision
    if (MAZE[newY][newX] === 1) {
        return; // Don't move if hitting a wall
    }
    
    // Update pacman position
    gameState.pacman = { x: newX, y: newY };
    
    // Check if pacman eats a dot
    if (gameState.dots[newY][newX]) {
        gameState.dots[newY][newX] = false;
        gameState.score += 10;
    }
    
    // Check win condition (all dots eaten)
    const hasDotsLeft = gameState.dots.some(row => row.some(dot => dot));
    if (!hasDotsLeft) {
        gameState.gameWon = true;
        showToast("Congratulations! You won!");
    }
    
    renderGame();
    updateUI();
}

// Handle keyboard input
function handleKeyPress(event) {
    switch (event.key) {
        case 'ArrowUp':
            event.preventDefault();
            direction = 'up';
            break;
        case 'ArrowDown':
            event.preventDefault();
            direction = 'down';
            break;
        case 'ArrowLeft':
            event.preventDefault();
            direction = 'left';
            break;
        case 'ArrowRight':
            event.preventDefault();
            direction = 'right';
            break;
        case ' ':
            event.preventDefault();
            if (gameState.gameOver || gameState.gameWon) {
                initGame();
            }
            break;
    }
}

// Simple toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: hsl(220, 13%, 12%);
        color: hsl(0, 0%, 100%);
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        border: 1px solid hsl(221, 83%, 53%);
        z-index: 1000;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        animation: slideInRight 0.3s ease-out;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 2000);
}

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Event listeners
document.addEventListener('keydown', handleKeyPress);
restartButton.addEventListener('click', initGame);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);
// Mobile touch controls
document.querySelectorAll('.control-btn').forEach(button => {
  button.addEventListener('click', () => {
    direction = button.getAttribute('data-dir');
  });
});
