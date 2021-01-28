// I'd like to use a pubsub pattern to mediate between my DOM & my Logic
// I'm trying to do it without direct reference first, so we'll see how THAT goes...
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
  const invoke = function(eventName, args) {
    if (!_hasEvent(eventName)) {
      console.warn(`Tried to invoke nonexistent event ${eventName}!`);
      return false;
    }
    _events.get(eventName).callListeners(args);
    return true;
  };

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

  // Event factory
  // (might be cool to make any argument after the first be immediately added as an event)
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

    const callListeners = function(args) {
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

// * GAMEFLOW MODULE
// - hands control back and forth between players when a valid move is played
// - if a winning move is played, show the win screen
// - (the win screen should have an eventlistener that will goto 0)
const GameFlow = (function() {
  function init() {
    Events.publish('movePlayed');
    Events.publish('boardUpdated');
    Events.subscribe('movePlayed', _playMove);
    DOM.init();

    _players.push(CreatePlayer('X'));
    _players.push(CreatePlayer('O'));
    _currentPlayer = 0;
  }

  const _players = [];
  let _currentPlayer;

  function _playMove(tileIndex) {
    //? Not sure if everything should go through GameFlow first,
    //? Or if gameBoard can listen for movePlayed instead... that probably makes more sense
    console.log(`_playMove(${tileIndex})`);
    // push the update to the board so it can check outcome 
    // (invalid, valid-nonwinning, valid-winning)
    if (GameBoard.updateBoard(tileIndex, _players[_currentPlayer])) {
      // Based on outcome call an event
      // If the move is valid, invoke the update board event
      Events.invoke('boardUpdated');

      // increment the turn
      _incrementTurn();
    }
  }

  function _incrementTurn() {
    _currentPlayer = (_currentPlayer + 1) % _players.length;
    console.log(`current player: ${_players[_currentPlayer].mark}`);
  }

  return { init };
})();

// Get all my dom references, generate anything I need
// ... and define dom event functions??? (eg, "makeBoard" to spawn the gameboard)
const DOM = (function() {
  function init() {
    _createBoard();
    Events.subscribe('boardUpdated', _updateBoard);
  }

  const _gameBoard = document.querySelector('.game-board');

  const _boardTiles = [];

  function _createBoard(boardSize = 3) {
    for (let i = 0; i < (boardSize * boardSize); i++) {
      _boardTiles.push(_createBoardTile(i));
    }
    _boardTiles.forEach(tile => {
      _gameBoard.appendChild(tile);
    });
  }

  function _updateBoard() {
    //? Could maybe use Dependency Injection thru event, 
    //? instead of directly interfacing w GameBoard module?
    const newState = GameBoard.getBoard();
    for (let i = 0; i < newState.length; i++) {
      const mark = newState[i] ? newState[i].mark :'';
      _boardTiles[i].textContent = mark;
    }
  }

  // "Making" a tile doesn't automatically embed it in the page
  // i = index of the tile in the board array
  function _createBoardTile(i) {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.setAttribute('data-tile-index', i);
    tile.addEventListener('click', onClick);

    // TODO: Move event registers to a more appropriate module
    // ? UI Triggers seems like a mostly separate concern from rendering
    function onClick() {
      Events.invoke('movePlayed', [i]);
    }

    return tile;
  }

  return { init };
})();

// * GAMEBOARD MODULE
const GameBoard = (function(boardSize = 3) {
  // there are 3 possible outcomes: invalid, continue, or game over
  //? Too many concerns?
  function updateBoard(boardIndex, player) {
    if (!_trySet(boardIndex, player)) {
      return false;
    }

    if (isGameOver()) {
      // trigger game over stuff ... somehow
      return '???????'; // not sure what if anything this outcome should return
    }

    // TODO: invoke "board updated" event
    return true;
  }
  
  const getBoard = () => [..._board];
  
  const _board = [];

  // return bool, sets board if valid
  function _trySet(boardIndex, player) {
    if (_board[boardIndex]) {
      return false;
    }

    _board[boardIndex] = player;
    return true;
  }

  // I'm not sure where to put isGameOver, but this will go along with that
  // Returns {x,y} coordinates on board based on board index & board size
  function _xy(boardIndex) {
    return {
      x: Math.floor(boardIndex / boardSize), // [0, 1, 2] = 0, [3, 4, 5] = 1, etc
      y: boardIndex % boardSize,             // [0, 3, 6] = 0, [1, 4, 7] = 1, etc
    };
  }
  
  function isGameOver() {
    // Check horizontal
    // Check vertical
    // Check both diagonal directions
    return false;
  }

  return { updateBoard, getBoard };
})();

//* PLAYER FACTORY
//? not sure if I should use inheritance to player(human) + player(npc)...
const CreatePlayer = (function(mark) {
  //TODO: Not sure yet what player-specific functionality I'd need...
  return { mark };
});


GameFlow.init();