// Not sure how to separate my "Logic" and "UI". MVC/MVP/MVVM/etc are kind of confusing,
// and I'm not sure they'd be the correct direction anyway.
// I might start with just trying to lay out the needed functionality, and split
// it up into different modules where I see patterns and repeated functionality...

// Get all my dom references, generate anything I need, and 
const DOM = (function() {
})();

// I'd like to use a pubsub pattern to mediate between my DOM & my Logic
// I'm trying to do it without direct reference first, so we'll see how THAT goes...
const Events = (function() {
  // create a new event, if one with that name doesn't already exist
  const publish = function(eventName) { }

  // call all subscribed functions
  const invoke = function(eventName) { }

  // If an event with eventname exists in the record of events, add this function to its listeners
  const subscribe = function(eventName, func) { }

  // try to remove a listener, if the named function exists in the event eventname
  const unsubscribe = function(eventName, func) { }

  // DestroyEvent(eventName) - removes event eventName from record of events, & all its listeners
  const destroyEvent = function(eventName) { }

  // record of events
  // an event contains a name and a list of listeners
  // functions to be called when the event is invoked
  let _events = new Map();

  // Event factory
  const _createEvent = function(eventName) {
    const _listeners = [];

    const _containsListener = function(listener) {
      return _listeners.includes(listener);
    };

    const getName = function() { return eventName };

    const addListener = function(listener) {
      if (_containsListener(listener)) {
        return false;
      }

      _listeners.push(listener);
      return true;
    };

    const removeListener = function(listener) {
      if (_containsListener(listener)) {
        return false;
      }

      _listeners.splice(_listeners.indexOf(listener), 1);
      return true;
    };

    const callListeners = function() {
      _listeners.forEach(listener => listener());
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