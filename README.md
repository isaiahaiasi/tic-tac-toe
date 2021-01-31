# TIC TAC TOE

Another *vintage* Odin Project project. This project follows a series of lessons aimed at teaching various different types of scoping and dealing with objects: constructors, factories, classes, modules, and functional modules. The goal here is to create a program with a very modular structure, with minimal coupling or global state.

[Play it here](https://isaiahaiasi.github.io/tic-tac-toe/)

## Pub Sub 🍺
I opted to implement a ground-up Event system for this project. I realize that this project (or at least *my* version of this project) doesn't really merit such an elaborate system, but I really wanted to get better acquainted with the pub-sub pattern, and start learning where it could be implemented in order to decouple my modules. 

I didn't reference a pre-written implementation, because I treated it as its own mini-challenge. After completing this project, I will look more closely at existing Event system implementations, and will hopefully have a really good framework for understanding why they made different decisions than I did, based on what worked and didn't work with my own system.

## Modularization & Decoupling 🔗
I've been so excited having the ability to encapsulate, namespace, and add private properties to my code, that I might have gone a little module-crazy. I tried to keep as much functionality as possible contained within its own module, only exposing a few methods or variables. 

- **Events module** - Fully agnostic of the rest of the code, so I could theoretically just drop it into future projects, which is exciting! (Even though I should probably just use a prebuilt version, which no doubt better accounts for edge cases and is probably less verbose).
- **GameFlow module** - The managing module. I tried to limit my tight coupling to this module (for example, directly calling other modules' init() functions).
- **GameBoard module** - Holds the state of the board, checking valid positions, and checking for win conditions.
- **View Module** - I tried to make sure my DOM manipulation was decoupled from my game logic, so this module is just a small collection of utility classes for all the other modules that are responsible for directly interfacing with the DOM. My goal was to minimize repetitive code (eg, finding a button and adding an onclick function, copying html from a template, etc).
- **Specific View Modules** - Each particular "view" component (eg, start menu view, board view, etc) gets its own module. I implemented these as IIFEs, but a better solution would have probably been to have them be factories. The reason being, each of these contain their own unique "stateful" information, and currently if I want to, eg, reset the state of the game, I have to track all this state information and reset it manually. It would be far more elegant to just create and dispose of these objects as necessary.

## Minimax ♜
Trying to be clever bit me again. Before even beginning on the minimax implementation, I had to remove 80 lines of cruft, because I used a lengthy generic "check win" algorithm. The advantage of this method was it would work for any size board square (so you could have, say, a 7x7 board).

## Secret Mode 🕵️
shhh... it's still a secret. The test of my decoupling will be how difficult it is to slot in a different ruleset.