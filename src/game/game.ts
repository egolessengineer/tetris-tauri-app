import { io, Socket } from "socket.io-client";

// Define types
export type BlockCoordinates = [number, number];
export type BlockTemplate = Record<string, BlockCoordinates[]>;

// Define variables
const board: BlockCoordinates[] = [];
export const blockTemplate: BlockTemplate = {
  square: [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ],
  stick: [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
  lz: [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
  rz: [
    [0, 1],
    [1, 1],
    [1, 0],
    [2, 0],
  ],
  t: [
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 0],
  ],
  ll: [
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
  ],
  rl: [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
  ],
  stickR: [
    [2, -3],
    [2, -2],
    [2, -1],
    [2, 0],
  ],
  lzR: [
    [0, 1],
    [0, 2],
    [1, 1],
    [1, 0],
  ],
  rzR: [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 2],
  ],
  tR: [
    [1, 2],
    [1, 1],
    [1, 0],
    [0, 1],
  ],
  tB: [
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2],
  ],
  tL: [
    [1, 2],
    [1, 1],
    [1, 0],
    [2, 1],
  ],
  llR: [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
  ],
  llB: [
    [0, 1],
    [1, 1],
    [2, 1],
    [2, 0],
  ],
  llL: [
    [0, 0],
    [1, 0],
    [1, 1],
    [1, 2],
  ],
  rlR: [
    [0, -1],
    [0, 0],
    [0, 1],
    [1, -1],
  ],
  rlB: [
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  rlL: [
    [1, 1],
    [2, 1],
    [2, 0],
    [2, -1],
  ],
};

let myBoard: GameBoardClass | null = null;

export interface GameAreaInterface {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  frameNo: number;
  interval: number;
  key: string | boolean;
  start: () => void;
  clear: () => void;
}

// const startGame = (): void => {
//   myGameArea.start();
//   for (let i = 0; i < 22; i++) {
//     const boardBlock: BlockCoordinates = [i % 11, 19 - Math.floor(i / 11)];
//     board.push(boardBlock);
//   }
//   board.splice(Math.floor(Math.random() * 10) + 11, 1);
//   board.splice(Math.floor(Math.random() * 10), 1);
//   myBoard = new GameBoardClass(0, 0, 0, 0, board, 3, blockTemplate, myGameArea);
//   myBoard.nextShape();
// };

// Create the myGameArea object with proper TypeScript typing
// const myGameArea: GameAreaInterface = {
//   canvas: document.createElement("canvas"),
//   context: null as unknown as CanvasRenderingContext2D, // Will be initialized in start()
//   frameNo: 0,
//   interval: 0,
//   key: false,

//   start: function (): void {
//     this.canvas.width = window.innerWidth - 20;
//     this.canvas.height = window.innerHeight - 20;
//     this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
//     document.body.insertBefore(this.canvas, document.body.childNodes[0]);
//     this.frameNo = 0;
//     this.interval = window.setInterval(updateGameArea, 20);

//     window.addEventListener("keydown", (e: KeyboardEvent): void => {
//       myGameArea.key = e.key;
//     });

//     window.addEventListener("keyup", (e: KeyboardEvent): void => {
//       myGameArea.key = false;
//       // myGameArea.sensitiveKey = e.key;
//     });
//   },

//   clear: function (): void {
//     this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
//   },
// };

// Create a function to initialize the game board
export const createGameBoard = (gameArea: GameAreaInterface, blockTemplate: BlockTemplate): { board: BlockCoordinates[]; gameBoard: GameBoardClass } => {
  const board: BlockCoordinates[] = [];

  for (let i = 0; i < 22; i++) {
    const boardBlock: BlockCoordinates = [i % 11, 19 - Math.floor(i / 11)];
    board.push(boardBlock);
  }

  board.splice(Math.floor(Math.random() * 10) + 11, 1);
  board.splice(Math.floor(Math.random() * 10), 1);

  const gameBoard = new GameBoardClass(0, 0, 0, 0, board, 3, blockTemplate, gameArea);
  gameBoard.nextShape();

  return { board, gameBoard };
};

// Create a function to initialize the game area
export const createGameArea = (canvas: HTMLCanvasElement, updateGameArea: () => void): GameAreaInterface => {
  const gameArea: GameAreaInterface = {
    canvas,
    context: canvas.getContext("2d") as CanvasRenderingContext2D,
    frameNo: 0,
    interval: 0,
    key: false,

    start: function (): void {
      this.frameNo = 0;
      this.interval = window.setInterval(updateGameArea, 20);
    },

    clear: function (): void {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
  };

  return gameArea;
};

export class GameBoardClass {
  board: BlockCoordinates[];
  pieceNum: number;
  shape: BlockCoordinates[];
  nextPieceNum: number;
  score: number;
  linesToRemove: number[];
  animationFrame: number;
  private blockTemplate: BlockTemplate;
  private gameArea: GameAreaInterface;

  constructor(
    // @ts-ignore
    xBlocks: number,
    // @ts-ignore
    yBlocks: number,
    // @ts-ignore
    blockSize: number,
    // @ts-ignore
    boardPos: number,
    board: BlockCoordinates[],
    shape: number,
    blockTemplate: BlockTemplate,
    gameArea: GameAreaInterface
  ) {
    this.board = [...board];
    this.pieceNum = shape;
    this.shape = [];
    this.nextPieceNum = Math.round(Math.random() * 6);
    this.score = 0;
    this.linesToRemove = [];
    this.animationFrame = 0;
    this.blockTemplate = blockTemplate;
    this.gameArea = gameArea;
  }

  nextShape = (): void => {
    this.pieceNum = this.nextPieceNum;
    this.nextPieceNum = Math.round(Math.random() * 6);
    this.shape = [];
    this.newShape();
  };

  newShape = (): void => {
    const keys = Object.keys(this.blockTemplate);
    for (const block of this.blockTemplate[keys[this.pieceNum]]) {
      this.shape.push([...block]);
    }
    for (const block of this.shape) {
      block[0] += 4;
    }
  };

  checkEnd = (): void => {
    for (const block of this.board) {
      if (block[1] === 0) {
        alert("gameEnd");
        this.restart();
      }
    }
  };

  restart = (): void => {
    this.board = [];
    for (let i = 0; i < 22; i++) {
      const boardBlock: BlockCoordinates = [i % 11, 19 - Math.floor(i / 11)];
      this.board.push(boardBlock);
    }
    this.board.splice(Math.floor(Math.random() * 10) + 11, 1);
    this.board.splice(Math.floor(Math.random() * 10), 1);
    this.nextShape();
  };

  removeLine = (): void => {
    let lineCheck: number[] = [];
    this.linesToRemove = [];

    for (const block of this.board) {
      lineCheck[block[1]] ??= 0;
      lineCheck[block[1]]++;
    }

    for (let i = 19; i >= 0; i--) {
      if (lineCheck[i] === 11) {
        this.linesToRemove.push(i);
      }
    }

    if (this.linesToRemove.length > 0) {
      this.animationFrame = 0;
    }
  };

  animateLineRemoval = (): void => {
    const ctx = this.gameArea.context;
    ctx.fillStyle = `rgba(255, 165, 0, ${0.5 + 0.5 * Math.sin(this.animationFrame / 3)})`;

    for (const line of this.linesToRemove) {
      ctx.fillRect(80, 180 + line * 30, 330, 28);
    }

    this.animationFrame++;

    if (this.animationFrame > 3) {
      let removeLineIndex = 0;
      for (const line of this.linesToRemove) {
        for (let j = 0; j < this.board.length; j++) {
          if (this.board[j][1] === removeLineIndex + line) {
            this.board.splice(j, 1);
            j--;
          }
        }
        removeLineIndex++;
        for (let j = 0; j < this.board.length; j++) {
          if (this.board[j][1] < removeLineIndex + line) this.board[j][1] += 1;
        }
      }

      if (this.linesToRemove.length >= 2) {
        this.score += this.linesToRemove.length;
      }

      this.linesToRemove = [];
    }
  };

  update = (): void => {
    const ctx = this.gameArea.context;
    ctx.fillStyle = "#1e1e2f";
    ctx.fillRect(79, 179, 330, 600);

    // Draw Board
    ctx.fillStyle = "#4caf50";
    for (const block of this.board) {
      ctx.fillRect(80 + block[0] * 30, 180 + block[1] * 30, 28, 28);
    }

    // Draw current piece
    ctx.fillStyle = "#ffeb3b";
    for (const block of this.shape) {
      ctx.fillRect(80 + block[0] * 30, 180 + block[1] * 30, 28, 28);
    }

    // Draw next piece preview
    ctx.fillStyle = "#03a9f4";
    const keys = Object.keys(this.blockTemplate);
    const nextShapeTemplate = this.blockTemplate[keys[this.nextPieceNum]];
    for (const block of nextShapeTemplate) {
      ctx.fillRect(200 + block[0] * 30, 80 + block[1] * 30, 28, 28);
    }

    // Display score
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${this.score}`, 210, 40);

    // Animate line removal if needed
    if (this.linesToRemove.length > 0) {
      this.animateLineRemoval();
    }
  };

  checkLanding = (): boolean => {
    for (const block of this.shape) {
      for (const underBlock of this.board) {
        if (underBlock[0] !== block[0]) {
          continue;
        }
        if (block[1] + 1 === underBlock[1]) {
          this.land();
          return true;
        }
      }
      if (block[1] + 1 === 20) {
        this.land();
        return true;
      }
    }
    return false;
  };

  land = (): void => {
    this.board = [...this.board, ...this.shape];
    this.shape = [];
    this.removeLine();
    this.checkEnd();
    this.nextShape();
  };

  newPos = (): void => {
    this.checkLanding();
    for (const block of this.shape) {
      block[1] += 1;
    }
  };

  moveLeft = (): void => {
    let canMove = true;
    for (const block of this.shape) {
      if (block[0] == 0) {
        canMove = false;
        break;
      }
      for (const underBlock of this.board) {
        if (underBlock[1] !== block[1]) continue;
        else if (block[0] - 1 === underBlock[0]) canMove = false;
      }
    }
    if (canMove) {
      for (const block of this.shape) {
        block[0] -= 1;
      }
    }
  };

  moveRight = (): void => {
    let canMove = true;
    for (const block of this.shape) {
      if (block[0] == 10) {
        canMove = false;
        break;
      }
      for (const underBlock of this.board) {
        if (underBlock[1] !== block[1]) continue;
        else if (block[0] + 1 === underBlock[0]) canMove = false;
      }
    }
    if (canMove) {
      for (const block of this.shape) {
        block[0] += 1;
      }
    }
  };

  rotate = (): void => {
    let tempX = 0;
    let tempY = 0;
    const keys = Object.keys(this.blockTemplate);
    tempX = this.shape[0][0] - this.blockTemplate[keys[this.pieceNum]][0][0];
    tempY = this.shape[0][1] - this.blockTemplate[keys[this.pieceNum]][0][1];

    switch (this.pieceNum) {
      case 1:
        if (tempY > 0) {
          for (let i = 0; i < this.shape.length; i++) {
            this.shape[i][0] = tempX + this.blockTemplate.stickR[i][0];
            this.shape[i][1] = tempY + this.blockTemplate.stickR[i][1];
          }
          this.pieceNum = 7;
        }
        break;
      case 2:
        for (let i = 0; i < this.shape.length; i++) {
          this.shape[i][0] = tempX + this.blockTemplate.lzR[i][0];
          this.shape[i][1] = tempY + this.blockTemplate.lzR[i][1];
        }
        this.pieceNum = 8;
        break;
      case 3:
        for (let i = 0; i < this.shape.length; i++) {
          this.shape[i][0] = tempX + this.blockTemplate.rzR[i][0];
          this.shape[i][1] = tempY + this.blockTemplate.rzR[i][1];
        }
        this.pieceNum = 9;
        break;
      case 4:
        for (let i = 0; i < this.shape.length; i++) {
          this.shape[i][0] = tempX + this.blockTemplate.tR[i][0];
          this.shape[i][1] = tempY + this.blockTemplate.tR[i][1];
        }
        this.pieceNum = 10;
        break;
      case 5:
        for (let i = 0; i < this.shape.length; i++) {
          this.shape[i][0] = tempX + this.blockTemplate.llR[i][0];
          this.shape[i][1] = tempY + this.blockTemplate.llR[i][1];
        }
        this.pieceNum = 13;
        break;
      case 6:
        for (let i = 0; i < this.shape.length; i++) {
          this.shape[i][0] = tempX + this.blockTemplate.rlR[i][0];
          this.shape[i][1] = tempY + this.blockTemplate.rlR[i][1];
        }
        this.pieceNum = 16;
        break;
      case 7:
        if (tempX >= 0 && tempX < 8) {
          for (let i = 0; i < this.shape.length; i++) {
            this.shape[i][0] = tempX + this.blockTemplate.stick[i][0];
            this.shape[i][1] = tempY + this.blockTemplate.stick[i][1];
          }
          this.pieceNum = 1;
        }
        break;
      case 8:
        if (tempX >= 0 && tempX < 9) {
          for (let i = 0; i < this.shape.length; i++) {
            this.shape[i][0] = tempX + this.blockTemplate.lz[i][0];
            this.shape[i][1] = tempY + this.blockTemplate.lz[i][1];
          }
          this.pieceNum = 2;
        }
        break;
      case 9:
        if (tempX >= 0 && tempX < 9) {
          for (let i = 0; i < this.shape.length; i++) {
            this.shape[i][0] = tempX + this.blockTemplate.rz[i][0];
            this.shape[i][1] = tempY + this.blockTemplate.rz[i][1];
          }
          this.pieceNum = 3;
        }
        break;
      case 10:
        if (tempX >= 0 && tempX < 9) {
          for (let i = 0; i < this.shape.length; i++) {
            this.shape[i][0] = tempX + this.blockTemplate.tB[i][0];
            this.shape[i][1] = tempY + this.blockTemplate.tB[i][1];
          }
          this.pieceNum = 11;
        }
        break;
      case 11:
        for (let i = 0; i < this.shape.length; i++) {
          this.shape[i][0] = tempX + this.blockTemplate.tL[i][0];
          this.shape[i][1] = tempY + this.blockTemplate.tL[i][1];
        }
        this.pieceNum = 12;
        break;
      case 12:
        if (tempX >= 0 && tempX < 9) {
          for (let i = 0; i < this.shape.length; i++) {
            this.shape[i][0] = tempX + this.blockTemplate.t[i][0];
            this.shape[i][1] = tempY + this.blockTemplate.t[i][1];
          }
          this.pieceNum = 4;
        }
        break;
      case 13:
        if (tempX >= 0 && tempX < 9) {
          for (let i = 0; i < this.shape.length; i++) {
            this.shape[i][0] = tempX + this.blockTemplate.llB[i][0];
            this.shape[i][1] = tempY + this.blockTemplate.llB[i][1];
          }
          this.pieceNum = 14;
        }
        break;
      case 14:
        for (let i = 0; i < this.shape.length; i++) {
          this.shape[i][0] = tempX + this.blockTemplate.llL[i][0];
          this.shape[i][1] = tempY + this.blockTemplate.llL[i][1];
        }
        this.pieceNum = 15;
        break;
      case 15:
        if (tempX >= 0 && tempX < 9) {
          for (let i = 0; i < this.shape.length; i++) {
            this.shape[i][0] = tempX + this.blockTemplate.ll[i][0];
            this.shape[i][1] = tempY + this.blockTemplate.ll[i][1];
          }
          this.pieceNum = 5;
        }
        break;
      case 16:
        if (tempX >= 0 && tempX < 9) {
          for (let i = 0; i < this.shape.length; i++) {
            this.shape[i][0] = tempX + this.blockTemplate.rlB[i][0];
            this.shape[i][1] = tempY + this.blockTemplate.rlB[i][1];
          }
          this.pieceNum = 17;
        }
        break;
      case 17:
        for (let i = 0; i < this.shape.length; i++) {
          this.shape[i][0] = tempX + this.blockTemplate.rlL[i][0];
          this.shape[i][1] = tempY + this.blockTemplate.rlL[i][1];
        }
        this.pieceNum = 18;
        break;

      case 18:
        if (tempX >= 0 && tempX < 9) {
          for (let i = 0; i < this.shape.length; i++) {
            this.shape[i][0] = tempX + this.blockTemplate.rl[i][0];
            this.shape[i][1] = tempY + this.blockTemplate.rl[i][1];
          }
          this.pieceNum = 6;
        }
        break;

      default:
        break;
    }
  };

  drop = (): void => {
    while (!this.checkLanding()) {
      for (const block of this.shape) {
        block[1] += 1;
      }
    }
  };
}

// Helper function to check intervals
// export const everyInterval = (n: number): boolean => {
//   if (myGameArea.frameNo % n == 0) {
//     return true;
//   }
//   return false;
// };

export const everyInterval = (gameArea: GameAreaInterface, n: number): boolean => {
  if (gameArea.frameNo % n === 0) {
    return true;
  }
  return false;
};

// Main game loop
// const updateGameArea = (): void => {
//   myGameArea.frameNo += 1;
//   myGameArea.clear();
//   inputProcess();

//   if (everyInterval(30)) {
//     myBoard?.newPos();
//   }

//   myBoard?.update();
// };

// Process user input
// const inputProcess = (): void => {
//   if (myGameArea.key && myGameArea.key === "a") {
//     myBoard?.moveLeft();
//     myBoard?.checkLanding();
//     myGameArea.key = false;
//   }

//   if (myGameArea.key && myGameArea.key === "d") {
//     myBoard?.moveRight();
//     myBoard?.checkLanding();
//     myGameArea.key = false;
//   }

//   if (myGameArea.key && myGameArea.key === "s") {
//     myBoard?.rotate();
//     myGameArea.key = false;
//   }

//   if (myGameArea.key && myGameArea.key === "Shift") {
//     myBoard?.drop();
//     myGameArea.key = false;
//   }

//   // if (myGameArea.sensitiveKey && myGameArea.sensitiveKey === 's') {
//   //   myBoard.rotate();
//   //   myGameArea.sensitiveKey = false;
//   // }
//   // if (myGameArea.sensitiveKey && myGameArea.sensitiveKey === 'Shift') {
//   //   myBoard.drop();
//   //   myGameArea.sensitiveKey = false;
//   // }
// };

// Define types for socket events
export interface GameState {
  board: BlockCoordinates[];
  score: number;
}

export interface Player {
  id: string;
  state: GameState;
}

interface ServerToClientEvents {
  updatePlayers: (players: Player[]) => void;
}

interface ClientToServerEvents {
  updateState: (state: GameState) => void;
}

// Create the socket connection with proper typing
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("http://localhost:3000");

// Send initial game state to the server
socket.emit("updateState", {
  board: board,
  score: 0,
});

// Listen for updates from the server
socket.on("updatePlayers", (players) => {
  console.log("Updated players:", players);
  // Optionally, display other players' boards and scores
});

// Update server with the current game state periodically
setInterval(() => {
  if (myBoard) {
    socket.emit("updateState", {
      // @ts-ignore
      board: myBoard.board,
      // @ts-ignore
      score: myBoard.score,
    });
  }
}, 1000);
