import { Events } from './events';
import { View, StartView, BoardView, EndView } from './view';
import { CreateXY } from './xy';

import { BOARD_SIZE } from './globalvars';


//* GAME MODEL / LOGIC
const GameFlow = (function ModelGameFlow() {
  let _players = [];
  let _currentPlayerIndex;
  let _turnCounter;

  function init() {
    _initModeStart();
  }

  function getCurrentPlayer() {
    return _players[_currentPlayerIndex];
  }

  function getPlayers() {
    return _players;
  }

  function _initModeStart() {
    Events.publish('startButtonPressed'); //args: string 'pvp' or 'pve'
    Events.subscribe('startButtonPressed', _initModeGame);
    StartView.init();
  }

  function _initModeGame(mode) {
    StartView.clearView();
    Events.publish('movePlayed');   //args: an XY object
    Events.publish('boardUpdated'); //args: bool if game over
    Events.publish('gameOver');     //args: the winning player
    Events.subscribe('boardUpdated', _incrementTurn);
    Events.subscribe('gameOver', _initModeEnd);
    MainGameBoard.init();
    BoardView.init(MainGameBoard);
    _initializePlayers(mode);
  }

  function _initModeEnd(winningPlayer) {
    Events.publish('restart');
    Events.subscribe('restart', _restart);
    EndView.init(winningPlayer);
  }

  function _restart() {
    EndView.clearView();
    BoardView.clearView();
    Events.resetEvents();
    init();
  }

  function _initializePlayers(mode) {
    _players = [];
    _players.push(CreatePlayer('X', 'human'));
    if (mode === 'pve') {
      _players.push(CreatePlayer('O', 'ai'));
    } else {
      _players.push(CreatePlayer('O', 'human'));
    }
    _currentPlayerIndex = 0;
    _turnCounter = 0;
  }

  function _incrementTurn(isGameOver) {
    _currentPlayerIndex = (_currentPlayerIndex + 1) % _players.length;
    _turnCounter++;
    
    if (!isGameOver) {
      if (_turnCounter >= (BOARD_SIZE * BOARD_SIZE)) {
        Events.invoke('gameOver', null);
      } else if (_players[_currentPlayerIndex].type === 'ai') {
        _players[_currentPlayerIndex].takeTurn();
      }
    }
  }

  return { init, getCurrentPlayer, getPlayers };
})();

// (Because of Minimax, I'm making a trillion copies of this
// ... but the *statefulness* is passed in as a primitive object...
// ... So, this would probably be a great chance to use PROTOTYPES)
const GameBoard = (function(board = []) {
  let _count = 0;

  function init() {
    board = [];
    //TODO: How to properly initialize a 2D array?
    for(let i = 0; i < BOARD_SIZE; i++) {
      board.push([]);
    }

    Events.subscribe('movePlayed', _movePlayed);
  }

  function trySet(xy, player) {
    if (!board[xy.x]) {
      board[xy.x] = [];
    }

    if (board[xy.x][xy.y]) {
      return false;
    }

    board[xy.x][xy.y] = player;
    _count++;
    return true;
  }

  function getBoard() {
    return board;
  }

  function getBoardCopy() {
    const copy = [];
    board.forEach(column => copy.push([...column]));
    return copy;
  }

  function getTurnCount() {
    return _count;
  }

  function checkWinner(player) {
    const winPatterns = [
      // Rows
      [ [0,0],[1,0],[2,0] ],
      [ [0,1],[1,1],[2,1] ],
      [ [0,2],[1,2],[2,2] ],
      // Columns
      [ [0,0],[0,1],[0,2] ],
      [ [1,0],[1,1],[1,2] ],
      [ [2,0],[2,1],[2,2] ],
      // Diagonals
      [ [0,0],[1,1],[2,2] ],
      [ [0,2],[1,1],[2,0] ],
    ];
    for (const winPattern of winPatterns) {
      if (!_isWinPattern(winPattern, player)) {
        continue;
      } else {
        return true;
      }
    }
    return false;
  }

  function _isWinPattern(winPattern, player) { 
    for (const xy of winPattern) {
      if (board[xy[0]][xy[1]] !== player) {
        return false;
      }
    }
    return true;
  }

  function _movePlayed(xy) {
    const player = GameFlow.getCurrentPlayer()
    let isGameOver = false;

    if (!trySet(xy, player)) {
      if (player.type === 'ai') {
        console.warn(`ai tried to make an illegal move (${xy.x},${xy.y})`);
      }
      return;
    }

    if (checkWinner(player)) {
      Events.invoke('gameOver', player);
      isGameOver = true;
    }

    Events.invoke('boardUpdated', isGameOver);
  }

  return { init, trySet, getBoard, getTurnCount, checkWinner, getBoardCopy };
});
const MainGameBoard = GameBoard();


const AI = (function AI() {
  function getPosition() {
    return _getPositionAlgo();
  }

  function setAI(difficulty) {
    _getPositionAlgo = difficulty === 'hard' ? _getMinimaxPos : _getRandomPos;
  }

  let _getPositionAlgo = _getMinimaxPos;

  function _getRandomPos() {
    const gameBoard = MainGameBoard.getBoard();

    let pos;
    do {
      const x = Math.floor(Math.random() * BOARD_SIZE);
      const y = Math.floor(Math.random() * BOARD_SIZE);
      pos = CreateXY(x, y);
    } while (gameBoard[pos.x][pos.y]);

    return pos;
  }

  function _getMinimaxPos() {
    const board = MainGameBoard.getBoardCopy();
    const gameBoardCopy = GameBoard(board);
    const curPlayer = GameFlow.getCurrentPlayer();
    
    return _minimax(
      gameBoardCopy, 
      GameFlow.getPlayers().indexOf(curPlayer)
    ).xy;
  }

  // A recursive function
  // player = player whose turn it is on this iteration
  // rootPlayer = the AI who's running the minimax
  // : { xy:XY, val:number }
  function _minimax(gameBoard, turn, depth = 1) {
    const moves = [];
    const maxing = GameFlow.getPlayers()[turn] === GameFlow.getCurrentPlayer();
    
    let movesRemaining = 0;
    // Get a list of valid moves based on this board
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (!gameBoard.getBoard()[x] || !gameBoard.getBoard()[x][y]) {
          moves.push({ xy: CreateXY(x, y) });
          movesRemaining++;
        }
      }
    }
    const turnCount = 9 - movesRemaining;

    if (moves.length === 0) {
      console.error('minimax couldn\'t find any valid moves!')
      console.log(`current turn in simulation: ${gameBoard.getTurnCount()}, depth: ${depth}`);
    }

    // Populate scores list, recursing minimax if game isn't over
    // (some instead of forEach so I can short-circuit on a win)
    //TODO: OPTIMIZE...
    moves.some(move => {
      const board = gameBoard.getBoardCopy();
      const newGameBoard = GameBoard(board);

      newGameBoard.trySet(move.xy, GameFlow.getPlayers()[turn]);

      if (newGameBoard.checkWinner(GameFlow.getPlayers()[turn])) {
        if (maxing) {
          move.val = 10;
          return true;
        } else {
          move.val = -10;
        }
      } else if (turnCount >= 8) {
        move.val = 0;
      } else {
        const nextTurn = (turn + 1) % GameFlow.getPlayers().length;
        move.val = _minimax(newGameBoard, nextTurn, depth + 1).val;
      }
      return false;
    });

    // Return the greatest move if maxing, or least if not
    moves.sort((a, b) => maxing ? b.val - a.val : a.val - b.val);
    return moves[0];
  }

  return { setAI, getPosition };
})();


//* FACTORIES NOT CONTAINED WITHIN A SPECIFIC MODULE

const CreatePlayer = (function Player(mark, type) {
  function takeTurn() {
    if (type !== 'ai') {
      return false;
    }
    const xy = AI.getPosition(mark);
    Events.invoke('movePlayed', xy);
  }

  return { mark, type, takeTurn };
});


GameFlow.init();