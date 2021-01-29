const Events = (function() {
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

  return { publish, invoke, subscribe, unsubscribe, destroyEvent };
})();

const GameFlow = (function() {
  const _boardSize = 3;
  function init() {
    Events.publish('movePlayed'); // Passes an XY object
    Events.publish('boardUpdated'); // Does not pass an argument
    Events.publish('gameOver'); // Passes the winning player
    Events.subscribe('boardUpdated', _playMove);
    GameBoard.init(_boardSize);
    DOM.init(_boardSize);

    _players.push(CreatePlayer('X'));
    _players.push(CreatePlayer('O'));
    _currentPlayer = 0;
    _turnCounter = 0;
  }

  function getCurrentPlayer() {
    return _players[_currentPlayer];
  }

  const _players = [];
  let _currentPlayer;
  let _turnCounter;

  function _playMove() {
    _incrementTurn();
  }

  function _incrementTurn() {
    _currentPlayer = (_currentPlayer + 1) % _players.length;
    _turnCounter++;
    console.log(_turnCounter);
    if (_turnCounter >= _boardSize * _boardSize) {
      Events.invoke('gameOver', null);
      console.log('IT\'s A TIE!!!');
    }
  }

  return { init, getCurrentPlayer };
})();

const DOM = (function() {
  function init(boardSize) {
    _createBoard(boardSize);
    Events.subscribe('boardUpdated', _updateBoard);
    Events.subscribe('gameOver', _displayGameOverScreen);
  }

  const _gameBoard = document.querySelector('.game-board');

  const _boardTiles = [];

  function _createBoard(boardSize) {

    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        _boardTiles.push(_createBoardTile(x, y));
      }
    }
    _boardTiles.forEach(tile => {
      _gameBoard.appendChild(tile.node);
    });
  }

  const _createBoardTile = function(x, y) {
    const xy = CreateXY(x,y);
    const node = document.createElement('div');

    node.classList.add('tile');
    node.addEventListener('click', _onClick);

    //TODO: Move event registers to a more appropriate module?
    // (UI triggers seems like a mostly separate concern from rendering)
    function _onClick() {
      Events.invoke('movePlayed', xy);
    }

    function clearEventListener() {
      node.removeEventListener('click', _onClick);
    }

    return { xy, node, clearEventListener };
  }

  function _updateBoard() {
    //? Could maybe use Dependency Injection thru event, 
    //? instead of directly interfacing w GameBoard module?
    const newBoardState = GameBoard.getBoard();
    _boardTiles.forEach(tile => {
      const newTileState = newBoardState[tile.xy.x][tile.xy.y];
      tile.node.textContent =  newTileState ? newTileState.mark : '';
    });
  }

  function _displayGameOverScreen(winningPlayer) {
    if (winningPlayer) {
      console.log(`congratulations, ${winningPlayer.mark}!`);
      _boardTiles.forEach(tile => {
        tile.clearEventListener();
      });
    } else {
      console.log('dom says... it\'s a tie????');
    }
    
  }

  return { init };
})();

const GameBoard = (function() {
  let _boardSize;

  //TODO: Find a decent resource for how to declare an empty 2d array...
  const _board = [];

  function init(boardSize) {
    _boardSize = boardSize;
    for(let i = 0; i < _boardSize; i++) {
      _board.push([]);
    }
    Events.subscribe('movePlayed', _movePlayed);
    GameOverChecker.init();
  }

  // Not sure how to handle {get; private set;} so I'm just returning a copy
  const getBoard = () => _board;

  function getXYFromIndex(i) {
    return CreateXY(Math.floor(i / _boardSize), i % _boardSize);
  }

  function _movePlayed(xy) {
    //? Not sure it was worth moving event invocation out of GameFlow,
    //?  if I'm still tightly coupling this
    // Especially bc there will be more logic around WHICH player once I have AI vs HUMAN...
    const player = GameFlow.getCurrentPlayer()
    if (!_trySet(xy, player)) {
      return false;
    }

    if (GameOverChecker.isGameOver(xy, player)) {
      console.log('winner winner chicken dinner!');
      Events.invoke('gameOver', player);
    }

    Events.invoke('boardUpdated');
    return true;
  }

  function _trySet(xy, player) {
    if (_board[xy.x][xy.y]) {
      return false;
    }

    _board[xy.x][xy.y] = player;
    return true;
  }

  // This was getting unwieldy enought that I wanted to encapsulate it
  const GameOverChecker = (function() {
    let _diagonalFallingPositions = [];
    let _diagonalRisingPositions = [];

    function init() {
      _diagonalFallingPositions = _getDiagonalFallingPositions();
      _diagonalRisingPositions = _getDiagonalRisingPositions();
    }

    function isGameOver(xy, player) {
      return (
        _getColumnWinner(xy, player) ||
        _getRowWinner(xy, player) ||
        _getDiagonalWinner(player)
      );
    }

    function _getColumnWinner(xy, player) {
      for (let i = 0; i < _boardSize; i++) {
        if (!_board[xy.x] || !_board[xy.x][i] || _board[xy.x][i] !== player) {
          console.log(`Failed column win check @ ${xy.x},${i}`);
          return false;
        }
      }
      return true;
    }

    function _getRowWinner(xy, player) {
      for (let i =0; i < _boardSize; i++) {
        if (!_board[i] || !_board[i][xy.y] || _board[i][xy.y] !== player) {
          console.log(`Failed row win check @ ${i},${xy.y}`);
          return false;
        }
      }
      return true;
    }

    function _getDiagonalWinner(player) {
      return (
        _checkWinnerInXYSet(_diagonalFallingPositions, player) ||
        _checkWinnerInXYSet(_diagonalRisingPositions, player)
      );
    }

    function _checkWinnerInXYSet(positions, player) {
      for(let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        if (_board[pos.x][pos.y] !== player) {
          return false;
        }
      }
      return true;
    }

    // Falling diagonal = "\" ([0,0], [1,1], etc)
    function _getDiagonalFallingPositions() {
      const diagonalPositions = [];
      for (let y = 0; y < _boardSize; y++) {
        for (let x = 0; x < _boardSize; x++){
          if (x === y) {
            diagonalPositions.push(CreateXY(x,y));
          }
        }
      }
      return diagonalPositions;
    }

    // Rising diagonal = "/" ([0, _boardSize - 1], [1, _boardSize - 2], etc)
    function _getDiagonalRisingPositions() {
      const diagonalPositions = [];
      for (let y = 0; y < _boardSize; y++) {
        for (let x = 0; x < _boardSize; x++){
          if ((x + y + 1) === _boardSize) {
            diagonalPositions.push(CreateXY(x,y));
          }
        }
      }
      return diagonalPositions;
    }

    return { init, isGameOver };
  })();

  return { init, getBoard, getXYFromIndex };
})();

//? not sure if I should use inheritance for player(human) + player(npc)...
const CreatePlayer = (function(mark) {
  //TODO: Not sure yet what player-specific functionality I'd need...
  return { mark };
});

// This feels like over-architecting
const CreateXY = (function(x, y) {
  const xy = { x, y };
  Object.freeze(xy);
  return xy;
});

GameFlow.init();