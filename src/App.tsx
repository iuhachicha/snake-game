import { useEffect, useMemo, useRef, useState } from 'preact/hooks';

type Direction = 'up' | 'down' | 'left' | 'right';

type Point = {
  x: number;
  y: number;
};

const BOARD_SIZE = 20;
const INITIAL_SPEED_MS = 150;
const SPEED_FLOOR_MS = 60;

const INITIAL_SNAKE: Point[] = [
  { x: Math.floor(BOARD_SIZE / 2), y: Math.floor(BOARD_SIZE / 2) },
  { x: Math.floor(BOARD_SIZE / 2) - 1, y: Math.floor(BOARD_SIZE / 2) },
];

function randomFood(snake: Point[]): Point {
  while (true) {
    const candidate = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };

    const isOnSnake = snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y);
    if (!isOnSnake) {
      return candidate;
    }
  }
}

function move(head: Point, direction: Direction): Point {
  switch (direction) {
    case 'up':
      return { x: head.x, y: head.y - 1 };
    case 'down':
      return { x: head.x, y: head.y + 1 };
    case 'left':
      return { x: head.x - 1, y: head.y };
    case 'right':
      return { x: head.x + 1, y: head.y };
    default:
      return head;
  }
}

function isOpposite(a: Direction, b: Direction): boolean {
  return (
    (a === 'up' && b === 'down') ||
    (a === 'down' && b === 'up') ||
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left')
  );
}

export default function App() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>(() => randomFood(INITIAL_SNAKE));
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED_MS);
  const [gameStatus, setGameStatus] = useState<'running' | 'over'>('running');
  const directionRef = useRef<Direction>('right');

  const resetGame = () => {
    const startingSnake = [...INITIAL_SNAKE];
    directionRef.current = 'right';
    setSnake(startingSnake);
    setFood(randomFood(startingSnake));
    setScore(0);
    setSpeed(INITIAL_SPEED_MS);
    setGameStatus('running');
  };

  const handleDirectionChange = (nextDirection: Direction) => {
    const currentDirection = directionRef.current;
    if (nextDirection === currentDirection || isOpposite(currentDirection, nextDirection)) {
      return;
    }
    directionRef.current = nextDirection;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameStatus === 'over' && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        resetGame();
        return;
      }

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          handleDirectionChange('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          handleDirectionChange('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          handleDirectionChange('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleDirectionChange('right');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, resetGame]);

  useEffect(() => {
    if (gameStatus !== 'running') {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSnake((currentSnake) => {
        const head = currentSnake[0];
        const nextHead = move(head, directionRef.current);

        const hitsWall =
          nextHead.x < 0 || nextHead.x >= BOARD_SIZE || nextHead.y < 0 || nextHead.y >= BOARD_SIZE;
        const willGrow = nextHead.x === food.x && nextHead.y === food.y;
        const bodyToCheck = willGrow ? currentSnake : currentSnake.slice(0, -1);
        const hitsSelf = bodyToCheck.some(
          (segment) => segment.x === nextHead.x && segment.y === nextHead.y,
        );

        if (hitsWall || hitsSelf) {
          setGameStatus('over');
          return currentSnake;
        }

        if (willGrow) {
          const grownSnake = [nextHead, ...currentSnake];
          setFood(randomFood(grownSnake));
          setScore((previousScore) => previousScore + 1);
          setSpeed((previousSpeed) => Math.max(SPEED_FLOOR_MS, previousSpeed - 5));
          return grownSnake;
        }

        const movedSnake = [nextHead, ...currentSnake.slice(0, -1)];
        return movedSnake;
      });
    }, speed);

    return () => window.clearInterval(intervalId);
  }, [food, gameStatus, speed]);

  const boardCells = useMemo(() => {
    const cells: Array<'empty' | 'snake' | 'head' | 'food'> = new Array(BOARD_SIZE * BOARD_SIZE).fill(
      'empty',
    );

    snake.forEach((segment, index) => {
      const position = segment.y * BOARD_SIZE + segment.x;
      cells[position] = index === 0 ? 'head' : 'snake';
    });

    const foodPosition = food.y * BOARD_SIZE + food.x;
    cells[foodPosition] = 'food';

    return cells;
  }, [snake, food]);

  return (
    <div className="app">
      <header className="hud">
        <h1>Snaky</h1>
        <div className="stats">
          <span className="stat">
            Score
            <strong>{score}</strong>
          </span>
          <span className="stat">
            Speed
            <strong>{Math.round((1000 / speed) * 10) / 10} steps/sec</strong>
          </span>
        </div>
      </header>

      <main>
        <div
          className="board"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
          }}
        >
          {boardCells.map((type, index) => (
            <div key={index} className={`cell ${type}`} />
          ))}
        </div>

        {gameStatus === 'over' && (
          <div className="overlay">
            <div className="overlay-content">
              <h2>Game Over</h2>
              <p>Your snake crashed. Final score: {score}</p>
              <button type="button" onClick={resetGame}>
                Play Again
              </button>
              <p className="hint">Tip: press Space or Enter to restart quickly.</p>
            </div>
          </div>
        )}
      </main>

      <footer>
        <h2>Controls</h2>
        <p>Use Arrow keys or WASD to steer the snake and collect food without hitting walls or yourself.</p>
        <button type="button" onClick={resetGame} disabled={gameStatus === 'running'}>
          Restart
        </button>
      </footer>
    </div>
  );
}
