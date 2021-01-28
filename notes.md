# STRUCTURE
## preliminary thoughts:
- gameflow obj: definitely a module
- gameboard obj: very likely a module
- player: I'll use a factory, just to make sure I know how to use it,
   ...but I might want to have some shared parent b/t human player & npc player

- I definitely want to use a pubsub pattern to interface w the dom, even tho it's crazy I have to write my own implementation?? Totally pegged that as an es6 feature, tbh


## SPEC
- gameboard is an array inside a Gameboard object
- set up html & write js function to render contents of gameboard array to the webpage
- add functions to let players add marks to specific spot on board, then tie it to the dom
- check for game over
- clean up the interface to allow players to put in their names, include a start/restart button, and add a display element congratulating the winner
- EC: create an AI for the player to play against
  - subgoal: unbeatable AI using minimax ([there's a cs50 video that's apparently really good for this](https://www.youtube.com/watch?v=WbzNRTTrX0g&list=WL&index=5))

## Necessary Functionality:
- Create board array
- Display board w board array data
- Get players (there needs to be UI logic, to know whether it should be pvp or pve)
- Let players input a move
- Check if move is valid
- If Move is valid, update board
- If move is valid, check if there's a winner
- If there isn't a winner, let the next player play
- If there IS a winner, don't let any more moves be made
- If there IS a winner, display the winner graphic
- IF there IS a winner, UI should let player reset game