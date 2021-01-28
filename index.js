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
  const invoke = function(eventName) {
    if (!_hasEvent(eventName)) {
      console.warn(`Tried to invoke nonexistent event ${eventName}!`);
      return false;
    }
    _events.get(eventName).callListeners();
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

    const callListeners = function() {
      if (_listeners.length < 1) {
        console.warn(`Tried to invoke ${eventName}, but it did not have any listeners!`);
        return false;
      }
      _listeners.forEach(listener => listener());
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
// - creates the board and gets the players
// - hands control back and forth between players when a valid move is played
// - if a winning move is played, show the win screen
// - (the win screen should have an eventlistener that will goto 0)
const GameFlow = (function() {
  return {};
})();

// Get all my dom references, generate anything I need, and 
const DOM = (function() {
})();

// * GAMEBOARD MODULE
const GameBoard = (function(boardSize = 3) {
  const _board = [boardSize * boardSize];

  // I'm honestly not sure how to make a propper {get; private set;}
  function getBoard() {
    return [..._board];
  }

  // there are 3 possible outcomes: invalid, continue, or game over
  // I might want to have 3 possible return values...
  function updateBoard(boardIndex, player) {
    if (!_trySet(boardIndex, player)) {
      return false;
    }

    if (isGameOver()) {
      // trigger game over stuff ... somehow
      return '???????'; // not sure what if anything this outcome should return
    }

    return true;
  }

  // return bool, sets board if valid
  function _trySet(boardIndex, player) {
    if (_board[boardIndex] !== null) {
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

  return { getBoard, updateBoard };
})();

let GameBoardView; //? Maybe have paired modules for logic & ui?

// * PLAYER FACTORY
// not sure if I should use inheritance to player(human) + player(npc)...
const MakePlayer = (function(type) {
  let isTheirTurn = false;
  return {}
});