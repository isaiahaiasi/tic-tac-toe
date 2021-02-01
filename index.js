const BOARD_SIZE = 3;


//* CUSTOM EVENT HANDLER
const Events = (function EventHandler() {
  // create a new event, if one with that name doesn't already exist
  const publish = function(eventName) {
    if (_hasEvent(eventName)) {
      console.warn(`Tried to publish ${eventName} event, but that event already exists!`);
      return false;
    }
    _events.set(eventName, _createEvent(eventName));
    return true;
  }

  // call all subscribed functions
  const invoke = function(eventName, ...args) {
    if (!_hasEvent(eventName)) {
      console.warn(`Tried to invoke nonexistent event ${eventName}!`);
      return false;
    }
    _events.get(eventName).callListeners(...args);
    return true;
  };

  //TODO: Use Spread operator to allow multiple functions to be passed as arguments
  // If the event exists in _events, add this function to its listeners
  const subscribe = function(eventName, func) {
    if (!_hasEvent(eventName)) {
      console.warn(`Tried to subscribe ${func} from nonexistent event ${eventName}!`);
      return false;
    }
    return _events.get(eventName).addListener(func);
  };

  // Try to remove a listener, if the function exists in the event eventname
  const unsubscribe = function(eventName, func) {
    if (!_hasEvent(eventName)) {
      console.warn(`Tried to unsubscribe ${func} from nonexistent event ${eventName}!`);
      return false;
    }
    return _events.get(eventName).removeListener(func);
  };

  // Remove event from _events
  const destroyEvent = function(eventName) {
    if (!_events.delete(eventName)) {
      console.warn(`tried to destroy nonexistent event ${eventName}!`);
      return false;
    }
    return true;
  };

  const resetEvents = () => _events.clear();

  // functions to be called when the event is invoked
  const _events = new Map();
  
  // an event contains a name and a list of listeners
  const _hasEvent = function(eventName) {
    return _events.has(eventName);
  };

  const _createEvent = function(eventName) {
    const _listeners = [];

    const getName = function() { return eventName };

    const addListener = function(listener) {
      if (_containsListener(listener)) {
        console.warn(`tried to add listener ${listener} to ${eventName}, but it was already subscribed!`);
        return false;
      }
      _listeners.push(listener);
      return true;
    };

    const removeListener = function(listener) {
      if (_containsListener(listener)) {
        console.warn(`tried to unsubscribe ${listener} from ${eventName}, but it isn't subscribed!`);
        return false;
      }
      _listeners.splice(_listeners.indexOf(listener), 1);
      return true;
    };

    const callListeners = function(...args) {
      if (_listeners.length < 1) {
        console.warn(`Tried to invoke ${eventName}, but it did not have any listeners!`);
        return false;
      }
      _listeners.forEach(listener => args ? listener(...args) : listener());
      return true;
    };

    const _containsListener = function(listener) {
      return _listeners.includes(listener);
    };

    return { getName, addListener, removeListener, callListeners }
  };

  return { publish, invoke, subscribe, unsubscribe, destroyEvent, resetEvents };
})();


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
    BoardView.init();
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
const GameBoard = (function(newBoard = []) {
  let _board = newBoard;
  let _count = 0;

  function init() {
    _board = [];
    //TODO: How to properly initialize a 2D array?
    for(let i = 0; i < BOARD_SIZE; i++) {
      _board.push([]);
    }

    Events.subscribe('movePlayed', _movePlayed);
  }

  function trySet(xy, player) {
    if (_board[xy.x][xy.y]) {
      return false;
    }

    _board[xy.x][xy.y] = player;
    _count++;
    return true;
  }

  function getBoard() {
    return _board;
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
      if (_board[xy[0]][xy[1]] !== player) {
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

  return { init, trySet, getBoard, getTurnCount, checkWinner };
});
const MainGameBoard = GameBoard();


const AI = (function AI() {
  function getPosition() {
    return _getPositionAlgo();
  }

  function setAI(difficulty) {
    _getPositionAlgo = difficulty === 'hard' ? _getMinimaxPos : _getRandomPos;
  }

  let _getPositionAlgo = _getRandomPos;

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
    const board = [...MainGameBoard.getBoard()];
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

    // Get a list of valid moves based on this board
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (!gameBoard.getBoard()[x] || !gameBoard.getBoard()[x][y]) {
          moves.push({ xy: CreateXY(x, y) });
        }
      }
    }

    // Populate scores list, recursing minimax if game isn't over
    // (some instead of forEach so I can short-circuit on a win,
    //  since I'm only evaluating win/lose/tie, not anything like 'fewer moves to win')
    moves.forEach(move => {
      const board = [...gameBoard.getBoard()];
      const newGameBoard = GameBoard(board);
      newGameBoard.trySet(move.xy, GameFlow.getPlayers()[turn]);

      if (newGameBoard.checkWinner(GameFlow.getPlayers()[turn])) {
        if (maxing) {
          move.val = 10;
          console.log(`Minimax val @ pos [${move.xy.x}, ${move.xy.y}]:
              (depth ${depth}): ${move.val} (turn count: ${newGameBoard.getTurnCount()})`);
          return true;
        } else {
          move.val = -10;
        }
      } else if (newGameBoard.getTurnCount() >= 9) {
        move.val = 0;
      } else {
        const nextTurn = (turn + 1) % GameFlow.getPlayers().length;
        move.val = _minimax(newGameBoard, nextTurn, depth + 1).val;
      }
      
    });

    // Return the greatest move if maxing, or least if not
    moves.sort((a, b) => maxing ? b.val - a.val : a.val - b.val);
    return moves[0];
  }

  return { setAI, getPosition };
})();


//* MODULES FOR MANIPULATING THE DOM
const View = (function View() {
  const _main = document.querySelector('main');

  function getMain() {
    return _main;
  }

  function createFromTemplate(templateSelector, contentSelector) {
    const viewTemplate = document.querySelector(templateSelector).content;
    return viewTemplate.querySelector(contentSelector).cloneNode(true);
  }

  function assignButton(container, buttonSelector, func) {
    const btn = container.querySelector(buttonSelector);
    btn.addEventListener('click', func);
    return btn;
  }

  const clearView = (viewContainer) => viewContainer?.remove();

  return { getMain, createFromTemplate, assignButton, clearView };
})();

const BoardView = (function ViewBoard() {
  let _boardTiles = [];
  let _boardContainer;

  function init() {
    _generateBoard();
    Events.subscribe('boardUpdated', _updateBoard);
    Events.subscribe('gameOver', _handleGameOver);
  }

  function clearView() {
    View.clearView(_boardContainer);
    _boardTiles = [];
  }

  function _generateBoard() {
    _boardContainer = document.createElement('div');
    _boardContainer.classList.add('game-board');

    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        _boardTiles.push(_createBoardTile(x, y));
      }
    }

    _boardTiles.forEach(tile => {
      _boardContainer.appendChild(tile.node);
    });

    View.getMain().appendChild(_boardContainer);
  }

  const _createBoardTile = function(x, y) {
    const xy = CreateXY(x,y);
    const node = document.createElement('div');

    node.classList.add('tile');
    node.addEventListener('click', _onClick);

    //? Move UI event triggers to a more appropriate module?
    function _onClick() {
      Events.invoke('movePlayed', xy);
    }

    function clearEventListener() {
      node.removeEventListener('click', _onClick);
    }

    return { xy, node, clearEventListener };
  }

  //TODO: This should only re-render the tiles that have actually changed
  //TODO: (if I want to render a large number of tiles)
  function _updateBoard() {
    //? Could maybe use Dependency Injection thru event, 
    //? instead of directly interfacing w GameBoard module?
    const newBoardState = MainGameBoard.getBoard();

    _boardTiles.forEach(tile => {
      const newTileState = newBoardState[tile.xy.x][tile.xy.y];
      tile.node.textContent =  newTileState ? newTileState.mark : '';
    });
  }

  function _handleGameOver() {
    _boardTiles.forEach(tile => {
      tile.clearEventListener();
    });
  }

  return { init, clearView };
})();

const StartView = (function ViewStart() {
  let viewContainer;

  function init() {
    viewContainer = View.createFromTemplate('#start-tmpl', '#start-menu');
    View.assignButton(viewContainer, '#btn-start-pvp', invokeStartPvP);
    View.assignButton(viewContainer, '#btn-start-pve', invokeStartPvE);
    
    function invokeStartPvP() {
      Events.invoke('startButtonPressed', 'pvp');
    }

    function invokeStartPvE() {
      Events.invoke('startButtonPressed', 'pve');
    }

    document.querySelector('main').appendChild(viewContainer);
  }

  const clearView = () => View.clearView(viewContainer);

  return { init, clearView };
})();

const EndView = (function ViewEnd() {
  let viewContainer;
  function init(winningPlayer) {
    viewContainer = View.createFromTemplate('#end-tmpl', '#end-menu');

    if(winningPlayer) {
      viewContainer.querySelector('a').textContent = winningPlayer.mark;
    } else {
      viewContainer.querySelector('p').textContent = 'It\'s a tie!';
    }
    View.assignButton(viewContainer, 'button', invokeRestart)

    document.querySelector('main').appendChild(viewContainer);
  }

  function invokeRestart() {
    Events.invoke('restart');
  }

  const clearView = () => View.clearView(viewContainer);

  return {init, clearView};
})();


//* FACTORIES NOT CONTAINED WITHIN A SPECIFIC MODULE
const CreateXY = (function XY(x, y) {
  const xy = { x, y };
  Object.freeze(xy);
  return xy;
});

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