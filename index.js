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
  const _boardSize = 3;
  function init() {
    initModeStart();
  }

  function initModeStart() {
    Events.publish('startButtonPressed'); //args: string 'pvp' or 'pve'
    Events.subscribe('startButtonPressed', initModeGame);
    StartView.init();
  }

  function initModeGame() {
    StartView.clearView();
    Events.publish('movePlayed');   //args: an XY object
    Events.publish('boardUpdated'); //args: bool if game over
    Events.publish('gameOver');     //args: the winning player
    Events.subscribe('boardUpdated', _incrementTurn);
    Events.subscribe('gameOver', initModeEnd);
    GameBoard.init(_boardSize);
    BoardView.init(_boardSize);

    _players.push(CreatePlayer('X'));
    _players.push(CreatePlayer('O'));
    _currentPlayer = 0;
    _turnCounter = 0;
  }

  function initModeEnd(winningPlayer) {
    Events.publish('restart');
    Events.subscribe('restart', restart);
    EndView.init(winningPlayer);
    console.log(`winning player: ${winningPlayer.mark}`);
  }

  function restart() {
    EndView.clearView();
    BoardView.clearView();
    Events.resetEvents();
    init();
  }

  function getCurrentPlayer() {
    return _players[_currentPlayer];
  }

  const _players = [];
  let _currentPlayer;
  let _turnCounter;

  function _incrementTurn(isGameOver) {
    _currentPlayer = (_currentPlayer + 1) % _players.length;
    _turnCounter++;
    
    if (!isGameOver && _turnCounter >= (_boardSize * _boardSize)) {
      Events.invoke('gameOver', null);
      console.log('IT\'s A TIE!!!');
    }
  }

  return { init, getCurrentPlayer };
})();


const GameBoard = (function ModelGameBoard() {
  let _boardSize;
  let _board;
  
  function init(boardSize) {
    _board = [];
    _boardSize = boardSize;

    //TODO: How to properly initialize a 2D array?
    for(let i = 0; i < _boardSize; i++) {
      _board.push([]);
    }

    Events.subscribe('movePlayed', _movePlayed);
    GameOverChecker.init();
  }

  //TODO: research proper getters--I don't want to allow _board to be mutated
  const getBoard = () => _board;

  function getXYFromIndex(i) {
    return CreateXY(Math.floor(i / _boardSize), i % _boardSize);
  }

  function _movePlayed(xy) {
    const player = GameFlow.getCurrentPlayer()
    let isGameOver = false;

    if (!_trySet(xy, player)) {
      return;
    }

    if (GameOverChecker.isGameOver(xy, player)) {
      console.log('winner winner chicken dinner!');
      Events.invoke('gameOver', player);
      isGameOver = true;
    }

    Events.invoke('boardUpdated', isGameOver);
  }

  function _trySet(xy, player) {
    if (_board[xy.x][xy.y]) {
      return false;
    }

    _board[xy.x][xy.y] = player;
    return true;
  }

  const GameOverChecker = (function GameBoardCheckGameOver() {
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
          return false;
        }
      }
      return true;
    }

    function _getRowWinner(xy, player) {
      for (let i =0; i < _boardSize; i++) {
        if (!_board[i] || !_board[i][xy.y] || _board[i][xy.y] !== player) {
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

  function init(boardSize) {
    _generateBoard(boardSize);
    Events.subscribe('boardUpdated', _updateBoard);
    Events.subscribe('gameOver', _displayGameOverScreen);
  }

  function clearView() {
    View.clearView(_boardContainer);
    _boardTiles = [];
  }

  function _generateBoard(boardSize) {
    _boardContainer = document.createElement('div');
    _boardContainer.classList.add('game-board');

    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
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
    const newBoardState = GameBoard.getBoard();

    _boardTiles.forEach(tile => {
      const newTileState = newBoardState[tile.xy.x][tile.xy.y];
      tile.node.textContent =  newTileState ? newTileState.mark : '';
    });
  }

  function _displayGameOverScreen(winningPlayer) {
    if (winningPlayer) {
      _boardTiles.forEach(tile => {
        tile.clearEventListener();
      });
    } else {
      console.log('dom says... it\'s a tie????');
    }
  }

  return { init, clearView };
})();

const StartView = (function ViewStart() {
  let viewContainer;

  function init() {
    viewContainer = View.createFromTemplate('#start-tmpl', '#start-menu');
    View.assignButton(viewContainer, '#btn-start-pvp', invokeStartPvP);
    
    function invokeStartPvP() {
      Events.invoke('startButtonPressed');
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
    viewContainer.querySelector('a').textContent = winningPlayer.mark;
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

//! STUB?
const CreatePlayer = (function Player(mark) {
  return { mark };
});

GameFlow.init();