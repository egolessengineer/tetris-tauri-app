import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

import {
  //   BlockCoordinates,
  GameAreaInterface,
  GameBoardClass,
  GameState,
  //   Player,
  blockTemplate,
  createGameArea,
  createGameBoard,
  everyInterval,
} from "./game";

interface ServerToClientEvents {
  updatePlayers: (players: Record<string, GameState>) => void;
}

interface ClientToServerEvents {
  updateState: (state: GameState) => void;
}

const TetrisGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  // Refs for game objects
  const gameAreaRef = useRef<GameAreaInterface | null>(null);
  const gameBoardRef = useRef<GameBoardClass | null>(null);
  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Process user input
  const inputProcess = (): void => {
    if (!gameAreaRef.current || !gameBoardRef.current) return;

    if (gameAreaRef.current.key && gameAreaRef.current.key === "a") {
      gameBoardRef.current.moveLeft();
      gameBoardRef.current.checkLanding();
      gameAreaRef.current.key = false;
    }

    if (gameAreaRef.current.key && gameAreaRef.current.key === "d") {
      gameBoardRef.current.moveRight();
      gameBoardRef.current.checkLanding();
      gameAreaRef.current.key = false;
    }

    if (gameAreaRef.current.key && gameAreaRef.current.key === "s") {
      gameBoardRef.current.rotate();
      gameAreaRef.current.key = false;
    }

    if (gameAreaRef.current.key && gameAreaRef.current.key === "Shift") {
      gameBoardRef.current.drop();
      gameAreaRef.current.key = false;
    }
  };

  // Main game loop
  const updateGameArea = (): void => {
    if (!gameAreaRef.current || !gameBoardRef.current) return;

    gameAreaRef.current.frameNo += 1;
    gameAreaRef.current.clear();
    inputProcess();

    if (everyInterval(gameAreaRef.current, 30)) {
      gameBoardRef.current.newPos();
    }

    gameBoardRef.current.update();

    // Update score in React state
    setScore(gameBoardRef.current.score);
  };

  // Start game function
  const startGame = (): void => {
    if (!canvasRef.current) return;

    // Setup canvas size
    canvasRef.current.width = window.innerWidth - 20;
    canvasRef.current.height = window.innerHeight - 20;

    // Create game area
    gameAreaRef.current = createGameArea(canvasRef.current, updateGameArea);

    // Create game board
    const { gameBoard } = createGameBoard(gameAreaRef.current, blockTemplate);
    gameBoardRef.current = gameBoard;

    // Start game
    gameAreaRef.current.start();
    setGameStarted(true);

    // Setup socket connection
    socketRef.current = io("http://localhost:3000");

    // Send initial game state to the server
    socketRef.current.emit("updateState", {
      board: gameBoardRef.current.board,
      score: 0,
    });

    // Listen for updates from the server
    socketRef.current.on("updatePlayers", (players) => {
      console.log("Updated players:", players);
      // Optionally, display other players' boards and scores
    });

    // Update server with the current game state periodically
    intervalRef.current = window.setInterval(() => {
      if (gameBoardRef.current) {
        socketRef.current?.emit("updateState", {
          board: gameBoardRef.current.board,
          score: gameBoardRef.current.score,
        });
      }
    }, 1000);
  };

  // Function to handle window resize
  const handleResize = () => {
    if (canvasRef.current && gameAreaRef.current) {
      // Update canvas size
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;

      // Clear and redraw if game is started
      if (gameStarted && gameBoardRef.current) {
        gameAreaRef.current.clear();
        gameBoardRef.current.update();
      }
    }
  };

  // Setup key event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameAreaRef.current) {
        gameAreaRef.current.key = e.key;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameAreaRef.current) {
        gameAreaRef.current.key = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);
    };
  }, [gameStarted]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (gameAreaRef.current?.interval) {
        clearInterval(gameAreaRef.current.interval);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center bg-black text-center w-full h-screen overflow-hidden">
      <div className="text-white">Tetris Game</div>
      {!gameStarted && (
        <div className="flex justify-between items-center w-96 mt-10">
          <p className="text-white">Score: {score}</p>
          <button onClick={startGame}>Start Game</button>
        </div>
      )}
      <canvas ref={canvasRef} className="bg-black border border-black" />
    </div>
  );
};

export default TetrisGame;
