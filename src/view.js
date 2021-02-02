import { Events } from './events'; 
//! Currently this code has invokes & subscribes for specific methods... BAD BAD BAD
//! Event handling needs to be grouped together, because otherwise it will be literally impossible to track
//! Probably, there should be a generic API for "View"-type objects (more reason to make View a prototype),
//! Which would expose the functions that should interface with the event system in a generic way
//! OR, failing that, AT LEAST interact only with the EVENTS MODULE ITSELF, 
//! & not the specific events I publish in a totally different file

import { CreateXY } from './xy'; // This seems like an acceptable dependancy

import { BOARD_SIZE } from './globalvars';
// This makes sense to me as a global var, since I got rid of the code that would accept multiple board sizes...
// Nonetheless, it still feels... smelly...

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
  let _gameBoard;

  function init(gameBoard) {
    _generateBoard();
    _gameBoard = gameBoard;
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
    const newBoardState = _gameBoard.getBoard();

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

export { View, StartView, BoardView, EndView };