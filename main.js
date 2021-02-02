/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/events.js":
/*!***********************!*\
  !*** ./src/events.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Events\": () => (/* binding */ Events)\n/* harmony export */ });\n//* CUSTOM EVENT HANDLER\nconst Events = (function EventHandler() {\n  // create a new event, if one with that name doesn't already exist\n  const publish = function(eventName) {\n    if (_hasEvent(eventName)) {\n      console.warn(`Tried to publish ${eventName} event, but that event already exists!`);\n      return false;\n    }\n    _events.set(eventName, _createEvent(eventName));\n    return true;\n  }\n\n  // call all subscribed functions\n  const invoke = function(eventName, ...args) {\n    if (!_hasEvent(eventName)) {\n      console.warn(`Tried to invoke nonexistent event ${eventName}!`);\n      return false;\n    }\n    _events.get(eventName).callListeners(...args);\n    return true;\n  };\n\n  //TODO: Use Spread operator to allow multiple functions to be passed as arguments?\n  // If the event exists in _events, add this function to its listeners\n  const subscribe = function(eventName, func) {\n    if (!_hasEvent(eventName)) {\n      console.warn(`Tried to subscribe ${func} from nonexistent event ${eventName}!`);\n      return false;\n    }\n    return _events.get(eventName).addListener(func);\n  };\n\n  // Try to remove a listener, if the function exists in the event eventname\n  const unsubscribe = function(eventName, func) {\n    if (!_hasEvent(eventName)) {\n      console.warn(`Tried to unsubscribe ${func} from nonexistent event ${eventName}!`);\n      return false;\n    }\n    return _events.get(eventName).removeListener(func);\n  };\n\n  // Remove event from _events\n  const destroyEvent = function(eventName) {\n    if (!_events.delete(eventName)) {\n      console.warn(`tried to destroy nonexistent event ${eventName}!`);\n      return false;\n    }\n    return true;\n  };\n\n  const resetEvents = () => _events.clear();\n\n  // functions to be called when the event is invoked\n  const _events = new Map();\n  \n  // an event contains a name and a list of listeners\n  const _hasEvent = function(eventName) {\n    return _events.has(eventName);\n  };\n\n  const _createEvent = function(eventName) {\n    const _listeners = [];\n\n    const getName = function() { return eventName };\n\n    const addListener = function(listener) {\n      if (_containsListener(listener)) {\n        console.warn(`tried to add listener ${listener} to ${eventName}, but it was already subscribed!`);\n        return false;\n      }\n      _listeners.push(listener);\n      return true;\n    };\n\n    const removeListener = function(listener) {\n      if (_containsListener(listener)) {\n        console.warn(`tried to unsubscribe ${listener} from ${eventName}, but it isn't subscribed!`);\n        return false;\n      }\n      _listeners.splice(_listeners.indexOf(listener), 1);\n      return true;\n    };\n\n    const callListeners = function(...args) {\n      if (_listeners.length < 1) {\n        console.warn(`Tried to invoke ${eventName}, but it did not have any listeners!`);\n        return false;\n      }\n      _listeners.forEach(listener => args ? listener(...args) : listener());\n      return true;\n    };\n\n    const _containsListener = function(listener) {\n      return _listeners.includes(listener);\n    };\n\n    return { getName, addListener, removeListener, callListeners }\n  };\n\n  return { publish, invoke, subscribe, unsubscribe, destroyEvent, resetEvents };\n})();\n\n\n\n//# sourceURL=webpack://tic-tac-toe/./src/events.js?");

/***/ }),

/***/ "./src/globalvars.js":
/*!***************************!*\
  !*** ./src/globalvars.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"BOARD_SIZE\": () => (/* binding */ BOARD_SIZE)\n/* harmony export */ });\nconst BOARD_SIZE = 3;\n\n\n\n//# sourceURL=webpack://tic-tac-toe/./src/globalvars.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./events */ \"./src/events.js\");\n/* harmony import */ var _view__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./view */ \"./src/view.js\");\n/* harmony import */ var _xy__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./xy */ \"./src/xy.js\");\n/* harmony import */ var _globalvars__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./globalvars */ \"./src/globalvars.js\");\n\n\n\n\n\n\n\n//* GAME MODEL / LOGIC\nconst GameFlow = (function ModelGameFlow() {\n  let _players = [];\n  let _currentPlayerIndex;\n  let _turnCounter;\n\n  function init() {\n    _initModeStart();\n  }\n\n  function getCurrentPlayer() {\n    return _players[_currentPlayerIndex];\n  }\n\n  function getPlayers() {\n    return _players;\n  }\n\n  function _initModeStart() {\n    _events__WEBPACK_IMPORTED_MODULE_0__.Events.publish('startButtonPressed'); //args: string 'pvp' or 'pve'\n    _events__WEBPACK_IMPORTED_MODULE_0__.Events.subscribe('startButtonPressed', _initModeGame);\n    _view__WEBPACK_IMPORTED_MODULE_1__.StartView.init();\n  }\n\n  function _initModeGame(mode) {\n    _view__WEBPACK_IMPORTED_MODULE_1__.StartView.clearView();\n    _events__WEBPACK_IMPORTED_MODULE_0__.Events.publish('movePlayed');   //args: an XY object\n    _events__WEBPACK_IMPORTED_MODULE_0__.Events.publish('boardUpdated'); //args: bool if game over\n    _events__WEBPACK_IMPORTED_MODULE_0__.Events.publish('gameOver');     //args: the winning player\n    _events__WEBPACK_IMPORTED_MODULE_0__.Events.subscribe('boardUpdated', _incrementTurn);\n    _events__WEBPACK_IMPORTED_MODULE_0__.Events.subscribe('gameOver', _initModeEnd);\n    MainGameBoard.init();\n    _view__WEBPACK_IMPORTED_MODULE_1__.BoardView.init(MainGameBoard);\n    _initializePlayers(mode);\n  }\n\n  function _initModeEnd(winningPlayer) {\n    _events__WEBPACK_IMPORTED_MODULE_0__.Events.publish('restart');\n    _events__WEBPACK_IMPORTED_MODULE_0__.Events.subscribe('restart', _restart);\n    _view__WEBPACK_IMPORTED_MODULE_1__.EndView.init(winningPlayer);\n  }\n\n  function _restart() {\n    _view__WEBPACK_IMPORTED_MODULE_1__.EndView.clearView();\n    _view__WEBPACK_IMPORTED_MODULE_1__.BoardView.clearView();\n    _events__WEBPACK_IMPORTED_MODULE_0__.Events.resetEvents();\n    init();\n  }\n\n  function _initializePlayers(mode) {\n    _players = [];\n    _players.push(CreatePlayer('X', 'human'));\n    if (mode === 'pve') {\n      _players.push(CreatePlayer('O', 'ai'));\n    } else {\n      _players.push(CreatePlayer('O', 'human'));\n    }\n    _currentPlayerIndex = 0;\n    _turnCounter = 0;\n  }\n\n  function _incrementTurn(isGameOver) {\n    _currentPlayerIndex = (_currentPlayerIndex + 1) % _players.length;\n    _turnCounter++;\n    \n    if (!isGameOver) {\n      if (_turnCounter >= (_globalvars__WEBPACK_IMPORTED_MODULE_3__.BOARD_SIZE * _globalvars__WEBPACK_IMPORTED_MODULE_3__.BOARD_SIZE)) {\n        _events__WEBPACK_IMPORTED_MODULE_0__.Events.invoke('gameOver', null);\n      } else if (_players[_currentPlayerIndex].type === 'ai') {\n        _players[_currentPlayerIndex].takeTurn();\n      }\n    }\n  }\n\n  return { init, getCurrentPlayer, getPlayers };\n})();\n\n// (Because of Minimax, I'm making a trillion copies of this\n// ... but the *statefulness* is passed in as a primitive object...\n// ... So, this would probably be a great chance to use PROTOTYPES)\nconst GameBoard = (function(board = []) {\n  let _count = 0;\n\n  function init() {\n    board = [];\n    //TODO: How to properly initialize a 2D array?\n    for(let i = 0; i < _globalvars__WEBPACK_IMPORTED_MODULE_3__.BOARD_SIZE; i++) {\n      board.push([]);\n    }\n\n    _events__WEBPACK_IMPORTED_MODULE_0__.Events.subscribe('movePlayed', _movePlayed);\n  }\n\n  function trySet(xy, player) {\n    if (!board[xy.x]) {\n      board[xy.x] = [];\n    }\n\n    if (board[xy.x][xy.y]) {\n      return false;\n    }\n\n    board[xy.x][xy.y] = player;\n    _count++;\n    return true;\n  }\n\n  function getBoard() {\n    return board;\n  }\n\n  function getBoardCopy() {\n    const copy = [];\n    board.forEach(column => copy.push([...column]));\n    return copy;\n  }\n\n  function getTurnCount() {\n    return _count;\n  }\n\n  function checkWinner(player) {\n    const winPatterns = [\n      // Rows\n      [ [0,0],[1,0],[2,0] ],\n      [ [0,1],[1,1],[2,1] ],\n      [ [0,2],[1,2],[2,2] ],\n      // Columns\n      [ [0,0],[0,1],[0,2] ],\n      [ [1,0],[1,1],[1,2] ],\n      [ [2,0],[2,1],[2,2] ],\n      // Diagonals\n      [ [0,0],[1,1],[2,2] ],\n      [ [0,2],[1,1],[2,0] ],\n    ];\n    for (const winPattern of winPatterns) {\n      if (!_isWinPattern(winPattern, player)) {\n        continue;\n      } else {\n        return true;\n      }\n    }\n    return false;\n  }\n\n  function _isWinPattern(winPattern, player) { \n    for (const xy of winPattern) {\n      if (board[xy[0]][xy[1]] !== player) {\n        return false;\n      }\n    }\n    return true;\n  }\n\n  function _movePlayed(xy) {\n    const player = GameFlow.getCurrentPlayer()\n    let isGameOver = false;\n\n    if (!trySet(xy, player)) {\n      if (player.type === 'ai') {\n        console.warn(`ai tried to make an illegal move (${xy.x},${xy.y})`);\n      }\n      return;\n    }\n\n    if (checkWinner(player)) {\n      _events__WEBPACK_IMPORTED_MODULE_0__.Events.invoke('gameOver', player);\n      isGameOver = true;\n    }\n\n    _events__WEBPACK_IMPORTED_MODULE_0__.Events.invoke('boardUpdated', isGameOver);\n  }\n\n  return { init, trySet, getBoard, getTurnCount, checkWinner, getBoardCopy };\n});\nconst MainGameBoard = GameBoard();\n\n\nconst AI = (function AI() {\n  function getPosition() {\n    return _getPositionAlgo();\n  }\n\n  function setAI(difficulty) {\n    _getPositionAlgo = difficulty === 'hard' ? _getMinimaxPos : _getRandomPos;\n  }\n\n  let _getPositionAlgo = _getMinimaxPos;\n\n  function _getRandomPos() {\n    const gameBoard = MainGameBoard.getBoard();\n\n    let pos;\n    do {\n      const x = Math.floor(Math.random() * _globalvars__WEBPACK_IMPORTED_MODULE_3__.BOARD_SIZE);\n      const y = Math.floor(Math.random() * _globalvars__WEBPACK_IMPORTED_MODULE_3__.BOARD_SIZE);\n      pos = (0,_xy__WEBPACK_IMPORTED_MODULE_2__.CreateXY)(x, y);\n    } while (gameBoard[pos.x][pos.y]);\n\n    return pos;\n  }\n\n  function _getMinimaxPos() {\n    const board = MainGameBoard.getBoardCopy();\n    const gameBoardCopy = GameBoard(board);\n    const curPlayer = GameFlow.getCurrentPlayer();\n    \n    return _minimax(\n      gameBoardCopy, \n      GameFlow.getPlayers().indexOf(curPlayer)\n    ).xy;\n  }\n\n  // A recursive function\n  // player = player whose turn it is on this iteration\n  // rootPlayer = the AI who's running the minimax\n  // : { xy:XY, val:number }\n  function _minimax(gameBoard, turn, depth = 1) {\n    const moves = [];\n    const maxing = GameFlow.getPlayers()[turn] === GameFlow.getCurrentPlayer();\n    \n    let movesRemaining = 0;\n    // Get a list of valid moves based on this board\n    for (let y = 0; y < _globalvars__WEBPACK_IMPORTED_MODULE_3__.BOARD_SIZE; y++) {\n      for (let x = 0; x < _globalvars__WEBPACK_IMPORTED_MODULE_3__.BOARD_SIZE; x++) {\n        if (!gameBoard.getBoard()[x] || !gameBoard.getBoard()[x][y]) {\n          moves.push({ xy: (0,_xy__WEBPACK_IMPORTED_MODULE_2__.CreateXY)(x, y) });\n          movesRemaining++;\n        }\n      }\n    }\n    const turnCount = 9 - movesRemaining;\n\n    if (moves.length === 0) {\n      console.error('minimax couldn\\'t find any valid moves!')\n      console.log(`current turn in simulation: ${gameBoard.getTurnCount()}, depth: ${depth}`);\n    }\n\n    // Populate scores list, recursing minimax if game isn't over\n    // (some instead of forEach so I can short-circuit on a win)\n    //TODO: OPTIMIZE...\n    moves.some(move => {\n      const board = gameBoard.getBoardCopy();\n      const newGameBoard = GameBoard(board);\n\n      newGameBoard.trySet(move.xy, GameFlow.getPlayers()[turn]);\n\n      if (newGameBoard.checkWinner(GameFlow.getPlayers()[turn])) {\n        if (maxing) {\n          move.val = 10;\n          return true;\n        } else {\n          move.val = -10;\n        }\n      } else if (turnCount >= 8) {\n        move.val = 0;\n      } else {\n        const nextTurn = (turn + 1) % GameFlow.getPlayers().length;\n        move.val = _minimax(newGameBoard, nextTurn, depth + 1).val;\n      }\n      return false;\n    });\n\n    // Return the greatest move if maxing, or least if not\n    moves.sort((a, b) => maxing ? b.val - a.val : a.val - b.val);\n    return moves[0];\n  }\n\n  return { setAI, getPosition };\n})();\n\n\n//* FACTORIES NOT CONTAINED WITHIN A SPECIFIC MODULE\n\nconst CreatePlayer = (function Player(mark, type) {\n  function takeTurn() {\n    if (type !== 'ai') {\n      return false;\n    }\n    const xy = AI.getPosition(mark);\n    _events__WEBPACK_IMPORTED_MODULE_0__.Events.invoke('movePlayed', xy);\n  }\n\n  return { mark, type, takeTurn };\n});\n\n\nGameFlow.init();\n\n//# sourceURL=webpack://tic-tac-toe/./src/index.js?");

/***/ }),

/***/ "./src/view.js":
/*!*********************!*\
  !*** ./src/view.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"View\": () => (/* binding */ View),\n/* harmony export */   \"StartView\": () => (/* binding */ StartView),\n/* harmony export */   \"BoardView\": () => (/* binding */ BoardView),\n/* harmony export */   \"EndView\": () => (/* binding */ EndView)\n/* harmony export */ });\n/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./events */ \"./src/events.js\");\n/* harmony import */ var _xy__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./xy */ \"./src/xy.js\");\n/* harmony import */ var _globalvars__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./globalvars */ \"./src/globalvars.js\");\n \n//! Currently this code has invokes & subscribes for specific methods... BAD BAD BAD\n//! Event handling needs to be grouped together, because otherwise it will be literally impossible to track\n//! Probably, there should be a generic API for \"View\"-type objects (more reason to make View a prototype),\n//! Which would expose the functions that should interface with the event system in a generic way\n//! OR, failing that, AT LEAST interact only with the EVENTS MODULE ITSELF, \n//! & not the specific events I publish in a totally different file\n\n // This seems like an acceptable dependancy\n\n\n// This makes sense to me as a global var, since I got rid of the code that would accept multiple board sizes...\n// Nonetheless, it still feels... smelly...\n\n//* MODULES FOR MANIPULATING THE DOM\nconst View = (function View() {\n  const _main = document.querySelector('main');\n\n  function getMain() {\n    return _main;\n  }\n\n  function createFromTemplate(templateSelector, contentSelector) {\n    const viewTemplate = document.querySelector(templateSelector).content;\n    return viewTemplate.querySelector(contentSelector).cloneNode(true);\n  }\n\n  function assignButton(container, buttonSelector, func) {\n    const btn = container.querySelector(buttonSelector);\n    btn.addEventListener('click', func);\n    return btn;\n  }\n\n  const clearView = (viewContainer) => viewContainer?.remove();\n\n  return { getMain, createFromTemplate, assignButton, clearView };\n})();\n\nconst BoardView = (function ViewBoard() {\n  let _boardTiles = [];\n  let _boardContainer;\n  let _gameBoard;\n\n  function init(gameBoard) {\n    _generateBoard();\n    _gameBoard = gameBoard;\n    _events__WEBPACK_IMPORTED_MODULE_0__.Events.subscribe('boardUpdated', _updateBoard);\n    _events__WEBPACK_IMPORTED_MODULE_0__.Events.subscribe('gameOver', _handleGameOver);\n  }\n\n  function clearView() {\n    View.clearView(_boardContainer);\n    _boardTiles = [];\n  }\n\n  function _generateBoard() {\n    _boardContainer = document.createElement('div');\n    _boardContainer.classList.add('game-board');\n\n    for (let y = 0; y < _globalvars__WEBPACK_IMPORTED_MODULE_2__.BOARD_SIZE; y++) {\n      for (let x = 0; x < _globalvars__WEBPACK_IMPORTED_MODULE_2__.BOARD_SIZE; x++) {\n        _boardTiles.push(_createBoardTile(x, y));\n      }\n    }\n\n    _boardTiles.forEach(tile => {\n      _boardContainer.appendChild(tile.node);\n    });\n\n    View.getMain().appendChild(_boardContainer);\n  }\n\n  const _createBoardTile = function(x, y) {\n    const xy = (0,_xy__WEBPACK_IMPORTED_MODULE_1__.CreateXY)(x,y);\n    const node = document.createElement('div');\n\n    node.classList.add('tile');\n    node.addEventListener('click', _onClick);\n\n    //? Move UI event triggers to a more appropriate module?\n    function _onClick() {\n      _events__WEBPACK_IMPORTED_MODULE_0__.Events.invoke('movePlayed', xy);\n    }\n\n    function clearEventListener() {\n      node.removeEventListener('click', _onClick);\n    }\n\n    return { xy, node, clearEventListener };\n  }\n\n  //TODO: This should only re-render the tiles that have actually changed\n  //TODO: (if I want to render a large number of tiles)\n  function _updateBoard() {\n    //? Could maybe use Dependency Injection thru event, \n    //? instead of directly interfacing w GameBoard module?\n    const newBoardState = _gameBoard.getBoard();\n\n    _boardTiles.forEach(tile => {\n      const newTileState = newBoardState[tile.xy.x][tile.xy.y];\n      tile.node.textContent =  newTileState ? newTileState.mark : '';\n    });\n  }\n\n  function _handleGameOver() {\n    _boardTiles.forEach(tile => {\n      tile.clearEventListener();\n    });\n  }\n\n  return { init, clearView };\n})();\n\nconst StartView = (function ViewStart() {\n  let viewContainer;\n\n  function init() {\n    viewContainer = View.createFromTemplate('#start-tmpl', '#start-menu');\n    View.assignButton(viewContainer, '#btn-start-pvp', invokeStartPvP);\n    View.assignButton(viewContainer, '#btn-start-pve', invokeStartPvE);\n    \n    function invokeStartPvP() {\n      _events__WEBPACK_IMPORTED_MODULE_0__.Events.invoke('startButtonPressed', 'pvp');\n    }\n\n    function invokeStartPvE() {\n      _events__WEBPACK_IMPORTED_MODULE_0__.Events.invoke('startButtonPressed', 'pve');\n    }\n\n    document.querySelector('main').appendChild(viewContainer);\n  }\n\n  const clearView = () => View.clearView(viewContainer);\n\n  return { init, clearView };\n})();\n\nconst EndView = (function ViewEnd() {\n  let viewContainer;\n  function init(winningPlayer) {\n    viewContainer = View.createFromTemplate('#end-tmpl', '#end-menu');\n\n    if(winningPlayer) {\n      viewContainer.querySelector('a').textContent = winningPlayer.mark;\n    } else {\n      viewContainer.querySelector('p').textContent = 'It\\'s a tie!';\n    }\n    View.assignButton(viewContainer, 'button', invokeRestart)\n\n    document.querySelector('main').appendChild(viewContainer);\n  }\n\n  function invokeRestart() {\n    _events__WEBPACK_IMPORTED_MODULE_0__.Events.invoke('restart');\n  }\n\n  const clearView = () => View.clearView(viewContainer);\n\n  return {init, clearView};\n})();\n\n\n\n//# sourceURL=webpack://tic-tac-toe/./src/view.js?");

/***/ }),

/***/ "./src/xy.js":
/*!*******************!*\
  !*** ./src/xy.js ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"CreateXY\": () => (/* binding */ CreateXY)\n/* harmony export */ });\nconst CreateXY = (function XY(x, y) {\n  const xy = { x, y };\n  Object.freeze(xy);\n  return xy;\n});\n\n\n\n//# sourceURL=webpack://tic-tac-toe/./src/xy.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./src/index.js");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;