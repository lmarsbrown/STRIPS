# STRIPS

This is an extended implementation of the Stanford Research Institute Problem Solver (STRIPS), an automated planning algorithim. STRIPS can be used to solve a wide variety of problems ranging from navigating a room to solving a slide puzzle. 

## Overview

This is a general description of the way the STRIPS proccesses information and how to think in terms of STRIPS. If you are already familiar with this algorithm, feel free to skip this section. 

If you are writing a program to solve a problem, the first step is to convert the problem to a form that is understandable to a computer. Let's first look at how STRIPS describes problems. STRIPS describes problems in terms of states and actions. A state is a collection of all of the information relevant to a problem at a given step, and the actions are all of the things that can be done to modify said state.

As an example, think of a slide puzzle. Aslide puzzle is a puzzle consisting of a grid of labeled squares with one empty space. You can slide the pieces neighboring the space into the space. The goal is to slide pieces around on a randomly aranged board to get all of the peces in order. In this case, the state is the arangment of pieces on the board, and the actions are the ways that you can slide pieces around on the board. 

The job of STRIPS is to take an initial state, a goal state, and a list of actions, and determine an effecient sequence of actions that will transform the initial state to the goal state. For example, you could provide STRIPS with an unsolved slide puzzle as an initial state, a solved puzzle as a goal state, and the ways that you can move the pieces as actions, and STRIPS would return all of the moves that need to be made to solve the puzzle.

## Where Is STRIPS Applicable

To make the best use of STRIPS, it is important to know where it is and where it isn't applicable. As described in the [Overview](#overview), STRIPS is used to determine the best set of actions to get from one state  to another. This means that your problem has to have a clear, easy to describe, and deterministic state. For example, chess would not be a good candidate for a STRIPS problem as the state changes with player moves which cannot easily be predicted. It also needs to have a goal state. STRIPS is not designed to optimize a cost function that doesnt have a minimum cost. This means that it cant be used for problems like the game [Snake](https://en.wikipedia.org/wiki/Snake_(video_game_genre)) where you have to move around collecting food indefinitely.

Even if a problem can technically be solved with STRIPS, that doesn't mean it can be solved in a useful amount of time. There are 2 primary considerations when trying to estimate the difficulty of solving a problem for STRIPS. The first consideration is the ability to tell if an action improves or worsens a state. This is dependent on the [Heuristic Function](TODO). If the distance to the goal doesnt continuously shrink as a state gets closer, STRIPS will have a hard time getting to the goal.

This is amplified by the second consideration which is the size of the state space. The "state space" is essentially all of the possible states connected together by actions. Since STRIPS works by pathfinding through this space, large spaces can lower performace. One big consideration is the number of possible actions per state. For example, if a state has 40 possible actions, and it takes a minimum of 5 steps for the heuristic distance function to change, then STRIPS will have to explore 40 to the power of 5 states which is over 100 million states. A combonantion of a suboptimal heuristic distance function and an overly vast state space can get out of hand quickly. 

STRIPS actually solves problems in a similar way to humans. It works by trying moves and following up on moves that bring it closer to the goal. **This means that you can get a good guess as to whether STRIPS can solve a problem, by asking if a human could solve the problem in a reasonable amount of time without prior knowlegde of the problem and without developing an algorithm or stratagy.**

One example of this is a rubiks cube. Since a rubiks cube can easily be represented digitally, and has a clear goal it seems like it should be a good candidate for solving with STRIPS. However, in practice, a rubiks cube more than a couple of steps away from being solved will take an unreasonable amount of time to solve using STRIPS. If you have ever tried to solve a rubiks cube without a clear stratagy, you have probably experienced something similar. The reason that it is difficult to solve a rubiks cube with these methods is that it is difficult to estimate how close the cube is to being solved until a couple moves before completion. It is very easy to make moves that appear to be improving the state of the cube that aren't actually useful. On top of this, the number of moves that can be made per steps is quite large ranging from 6 to 18 depending on which moves you allow. This means that for a scrambled cube, a massive space has to be explored before true progress can be detected making it extremely difficult for STRIPS or a guessing human to solve.




## Overall Implementation

To run STRIPS you need to do the following:

### Create A State Template

A state template is an object that contains 2 functions. The first function is called  "heuristicFunc" which is the heuristic distance estimation for A*. It must have 2 parameters that are both states, (state,goal) and it returns a number that gets smaller the closer the parameter "state" is to the parameter "goal". The second funciton is called "stateStringFunc". It has 1 parameter (state) and returns a string which is a unique itdentifier for the state. It must return different strings for different states and must return THE SAME string for 2 equivalent states. More information can be found on both of these functions below.  

Example:

```js
var stateTemplate = {
    heuristicFunc: getCubeDistance,
    stateStringFunc: convertCubeToString
};
```  
<br>  

### Create Actions

You must create objects describing the actions. Each action contains the following information:

 <table>
  <tr>
    <th>Attribute</th>
    <th>Type</th>
    <th>Parmeters</th>
    <th>Output</th>
    <th>Purpose</th>
  </tr>
<tr>
    <td>type</td>
    <td>String</td>
    <td>N/A</td>
    <td>N/A</td>
    <td>This is a string that acts as a label for the for action. This will be how the actions in the list of actions provided STRIPS will be labeled.</td>
</tr>
    
  <tr>
    <td>getInputsFunc</td>
    <td>Function</td>
    <td>(state:State)</td>
      <td><code>[Array, Array...]</code></td>
    <td>This implementation allows you to provide parameters for your actions to avoid the possibility of having to add countless similar actions. The parameters are given as an array. This function should return the valid parameters for a specified state.  The function should return an array of arrays. Each element of this array is an array containg all valid values for its respective parameters. For example, if your action has 2 parameters and the valid values of the first parameter are 1 and 2, and the valid values of the second parameter are 1, 4, and 5, then you would provide the array <br> <code>[ [1, 2], [1, 4, 5] ]</code>. STRIPS will cycle through all of the possible combinations of these parameters and attempt to use them as seperate actions. If you do not wish to use parameters then this function should return an empty array. <br><br> NOTE: Not all combinations of these parameters have to be valid as the validation function is still applied to all of generated actions</td>
    </tr>
    
    
  <tr>
    <td>executeFunc</td>
    <td>Function</td>
    <td>(state:State, params:Array)</td>
      <td>State</td>
    <td>This function should return A COPY of the state given in the "state" parameter with the changes of this action applied. The "params" parameter is an array containing values based on the parameters generated by "getInputsFunc". <br><br> <b>Warning:</b> Objects in javascript are passed by reference meaning that if you attempt to modify the state passed into this function directly it will modify the original state. You <i>must</i> create a copy <i>before</i> you attempt to modify the state or else the program will not run properly. If your state contains any arrays or subobjects make sure that the copy is a deep copy rather than a shallow copy</td>
  </tr>
    
    
   <tr>
    <td>validFunc</td>
    <td>Function</td>
    <td>(state:State, params:Array)</td>
      <td>Boolean</td>
    <td>This function is similar to the execution function except instead of returning a modified copy of the state it returns a boolean that is true if the action can be performed and false if it cannot be performed. This function should NOT modifiy the state.</td>
  </tr>
    
    
<tr>
    <td>costFunc</td>
    <td>Function</td>
    <td>(state:State, params:Array)</td>
      <td>Number</td>
    <td>This function should return the cost of the action given the state that it is being applied to and its parameters. The higher this cost is the worse that this action is and the less likely that it will be explored further.</td>
</tr>
    
  
</table><br>


Example:
```js
var rotateFaceAction = {
    //Action type label
    type: "rotateFace",

    //Function that actually changes the state
    executeFunc: (state, params) => {
        return rotateCubeFace(state, params[0] /*Face to be rotate*/, params[1] /*Amount to rotate the face*/);
    },

    //Function that checks if the action is valid
    validFunc: (state, params) => {
        //You are always allowed to rotate faces
        return true;
    },

    //Function that returns the cost of the action 
    costFunc: (state, params) => {
        //If it is only moved 90 degrees it has a cost of 1
        if(params[1] == -1|| params[1] == 1)
        {
            return 1;
        }
        
        //It takes slightly longer to rotate 180 degrees
        if(params[1] == 2)
        {
            return 1.2;
        }
    },
    getInputsFunc: (state)=>
    {
        //You can rotate all 6 faces
        let faces = [0,1,2,3,4,4,5];
        
        //You can rotate 90 degrees in either direction and 180 degrees in one direction because the other direction is the same
        let rotationAmount = [-1,1,2];
        
        return [faces,rotationAmount];
    }
};
```
<br>  

### Create the inital and goal states

The way that you create your states is mostly up to you as long as you create functions for the state. Here is an example of creating some states:

```js
let initState = createRandomCube();
let goalState = createSolvedCube();
```
<br>  

### Create the STRIPS instance

First a STRIPS object must be created with the state template in the constructor.
```js
let stripsInstance = new STRIPS(stateTemplate);
```
<br>  

Then the actions need to be added to this strips instance. This is done using the addAction function.
```js
stripsInstance.addAction(moveBlockAction);
```
<br>  

### Run STRIPS

STRIPS is run using the aStarSearch function. The parameters of this function are listed below:

<table>
<tr>
    <th>Parameter</th>
    <th>Type</th>
    <th>Purpose</th>
</tr>

<tr>
    <td>initialState</td>
    <td>State</td>
    <td>This is the inital state</td>
</tr>

<tr>
    <td>goalState</td>
    <td>State</td>
    <td>This is the state that STRIPS is trying to reach</td>
</tr>

 <tr>
    <td>stepLimit</td>
    <td>Integer</td>
    <td>Stops the code after this number of loop cycles to avoid infinite or practically infinite loops. The number of cycles it took to find a path can be found during a search can be found in the variable instance.cycles.</td>
</tr>

 <tr>
    <td>suppressErrors</td>
    <td>Boolean</td>
    <td>If true an error will not be logged in the console if the search does not succeed within the allowed number of steps.</td>
</tr>

 <tr>
    <td>suppressErrors</td>
    <td>Boolean</td>
    <td>If true an error will not be logged in the console if the search does not succeed within the allowed number of steps</td>
</tr>

 <tr>
    <td>changableInitialState</td>
    <td>State</td>
    <td>Modifications have to be made to the initial state so a copy of the inital state made for the purpose of being changed can be put here. If this is left blank, the function will try to make a copy itself, but that is not guaranteed to work. More specifically, as it uses JSON.parse(JSON.stringify()) it won't copy functions inside of the objects.</td>
</tr>   
    
 <tr>
    <td>maxExpectedCycles</td>
    <td>Integer</td>
    <td>To improve performance, only a certain number of nodes are kept. The number of nodes kept is defined by this parameter. When left blank it will default to the step limit</td>
</tr>  
    
</table>
<br>  

The aStarSearch function returns a list of actions, which are each objects with a name attribute, which is the type attribute provided by the action object created earlier, an index attribute which is the order in which that action type was added, and a params attribute which are the parameters of that action.

Example:
```js
var actionList = stripsInstance.aStarSearch(initState,goalState,1000,false,cloneCube(initState));
```
<br>  

### Parse the computed actions

After the actions have been found, they need to be translated into actions either in the real world or in another place in your program, this varies based on the case, but it generally involves iterating through the actions and executing them.  

Example:
```js
var actionIndex = 0;
let interval = setInterval(()=>{
    let action = actionList[actionIndex];
    animateCubeRotation(action.params[0],action.params[1]);
    
    actionIndex++;
    
    if(actionIndex == actionList.length)
    {
        clearInterval(interval);
    }
},1000);
```

## Example

Here is an example of the proccess of implementing a program to solve a slide puzzle.


### The State

The first step in implementing STRIPS is to figure out how you are going to represent the state. You can do this is whatever way you want to as long as it is contained in an object. Consider that you will have to write a functions to copy this state and convert it to a string.

The information that the slide puzzle state has to contain is the arangement of the pieces. This can be described by an array with each location in the array representing a location on the board and each entry a number describing the number of the piece at its respective location. Zero can represent the empty space. A solved state would look like:


```js
var solvedPuzzle = 
{
    board:
    [
        1,2,3,
        4,5,6,
        7,8,0
    ]
};
```
<br>

It is also reccomenended although techincally not required that you write a function to make a deep copy of your state. A function to copy this state is shown below.

```js
function clonePuzzle(puzzle)
{
    let arr = [];
    for(let i = 0; i < 9; i++)
    {
        arr.push(puzzle.board[i]);
    }

    return {board:arr};
}
```
<br>

### Action Execution

Next, the action functions must be implemented. For any given state there is a maximum of 4 possible moves. The pieces from either the top, left, bottom or right of the empty space can be moved to fill the empty space, effectivly swapping the empty space with the piece that you are moving to. Since there are only 4 possible moves, the direction to move can be represented as an int from 0-3. The steps for executing a movement are listed below.

1. Copy the input state
2. Find the location of the empty space
3. Find the direction in terms of x,y that the swap occurs
4. Find the index of the neighboring piece that is being moved
5. Find the value of the piece being moved
6. Set the value of the zero location to the value of the the neighboring piece that is being moved
7. Set the value of the piece that is being moved to zero
8. Return the modified state

Code executing the above list is shown below

```js
function movePiece(puzzle,direction)
{
    if(!isMoveAllowed(puzzle,direction))
    {
        console.log("Not Allowed");
        return;
    }
    //Copy the input state
    let out = clonePuzzle(puzzle);

    //Find the location of the empty space
    let zeroLoc = findZeroLoc(puzzle);

    //Find xy direction
    let dirXY = parseDirection(direction);
    

    let dstIndex = zeroLoc[2]+dirXY[0]+dirXY[1]*3;
    let dstVal = puzzle.board[dstIndex];

    out.board[zeroLoc[2]] = dstVal;
    out.board[dstIndex] = 0;

    return out;
}

function parseDirection(direction)
{
    let dirArr = [];
    if(direction == 0)dirArr = [0,-1];
    if(direction == 1)dirArr = [-1,0];
    if(direction == 2)dirArr = [0, 1];
    if(direction == 3)dirArr = [1, 0];
    return dirArr;
}

function findZeroLoc(puzzle)
{
    let loc = [];
    for(let i = 0; i < 9; i++)
    {
        if(puzzle.board[i] == 0)
        {
            return [i%3,Math.floor(i/3),i];
        }
    }
}
```
<br>

### Action Verification

A funciton also needs to be created determining if an action is valid. An action is invalid if the piece that it is trying to move into the zero position is outside of the puzzle. This occurs when the zero position is on the edge of the puzzle and the direction that the piece is being moved is the towards the edge of the puzzle. A function checking if a move is invalid is shown below

```js
function isMoveAllowed(puzzle,direction)
{
    let zeroLoc = findZeroLoc(puzzle);
    if(zeroLoc[1] == 0&&direction==0)return false;
    if(zeroLoc[0] == 0&&direction==1)return false;
    if(zeroLoc[1] == 2&&direction==2)return false;
    if(zeroLoc[0] == 2&&direction==3)return false;
    return true;
}
```
<br>

### Action Object

With the action functions created, they must be compiled along with some other info into an object. The exact requirements for this object can be found in the overall implementation section under [Create Actions](#create-actions). The values for these attributes for this example are listed below

- Type: "movePiece"
- executeFunction: A function implementing movePiece that uses the params array
- validFunction: A function implementing isMoveAllowed that uses the params array.
- costFunction: A function that always returns 1 because the cost of an action does not change based on the state or the parameters in this case
- getInputsFunc: One parameter is needed that provides the direction to move. The valid values for this parameter are the 4 directions 0,1,2, and 3. This is true no indepentent of the state meaning that this function should always return the array ```[[0,1,2,3]]```

The code for this action is shown below

```js
var movePieceAction = {
    //Action type label
    type: "movePiece",

    //Function that actually changes the state
    executeFunc: (state, params) => {
        return movePiece(state, params[0] /*Face to be rotate*/);
    },

    //Function that checks if the action is valid
    validFunc: (state, params) => {
        //You are always allowed to rotate faces
        return isMoveAllowed(state,params[0]);
    },

    //Function that returns the cost of the action 
    costFunc: (state, params) => {
        return 1;
    },
    getInputsFunc: (state)=>
    {
        return [[0,1,2,3]];
    }
};
```

### Convert State To String 

Next, the state template functions need to be implemented. Lets first create the stateString function. This is a function that converts a state into a unique string. This string is used to check if 2 states are equal. This function must have the following characteristics:

- Each string must be UNIQUE to its state. 2 different states should never return the same string.
- A state should always return the same string. You can't just return a random number.
- 2 states that were derived from different sets of steps that have the same value should return the same string.

A function converting a slide puzzle into a string is shown below 

```js
function puzzleToString(puzzle)
{
    let str = "";
    for(let i = 0; i < 9; i++)
    {
        str += puzzle.board[i];
    }
    return str;
}
```
<br>

### Heuristic Distance Function

The second state template function is the heuristic distance function. This function has 2 inputs, a current state input and a goal state input, and it estimates how many steps it will take to get from the current state to the goal state. The main feature that this function should have is that the output goes down the easier it is to get the current state to the goal state. You can think if this as a "hot or cold" function that tell STRIPS if its getting closer. This function is extremely important to the effectiveness of the algorithim. A good heuristic can mean the difference between STRIPS taking taking a fraction of a second rather than minutes to solve a state. 

When writing a heuristic you should avoid directly comparing states. Directly comparing different aspects of the 2 states will likely result in a bad heuristic function as the distance will only go down when algorithm stumbles across a correct part of a state. That means that STRIPS will have to explore a massive amount of nodes in between successes. A heuristic like this for this problem would be a function that checks each entry of the current and goal state and subtracts 1 from the cost if the 2 values are the same. This would be a bad heuristic because as stated above it doesnt continuously tell the program whether or not its getting closer to the goal, it only gives information when it happens to put something in the correct position.

You should also avoid steep local minima. A heuristic that causes large increases in cost for moves that have minimal impact will have poor performace because it can cause perfectly good moves to be ignored while encouraging bad moves that don't dissrupt previous progress. This is part of direct comparison creates bad heuristics; the cost drops abruptly when an element falls into place and rises abrubtly when it is disturbed. 

One method for creating a heuristic is to cycle through each element in the state and estimate how many moves it would take to get only that element to the correct state and then repeat that for every element summing the distances. In this case that means summing the distances from each piece in the current state to its respective piece in the goal state. This doesn't work, or even nessisarily make sense for all problems but it is a useful concept for a lot of problems

Another method for creating a heuristic is to try and solve the problem yourself and see how you go about it. Often, you will automatically use a process similar to STRIPS of estimating how good a state is and then choosing states based on how good they are. If you can figure out how you are determining the quality of a state then you can often use that as a STRIPS heuristic. 

Keep in mind that for hard problems, you may have to tweak this function to get a heuristic to perform well.

For this puzzle a simple heuristic is to take the Manhattan distance between each element except for the empty space and its respective piece in the goal goal state. Code for this is shown below

```js
function heuristicCost(puzzle,goal)
{
    let cost = 0;
    for(let a = 0; a < 9; a++)
    {
        let x = a%3;
        let y = Math.floor(a/3);
        let val = puzzle.board[a];

        let goalIndex = 0;
        for(let b = 0; true; b++)
        {
            if(goal.board[b] == val)
            {
                goalIndex = b;
                break;
            }
        }
        let gX = goalIndex%3;
        let gY = Math.floor(goalIndex/3);
        if(val != 0)
        {
            cost+= Math.abs(x-gX)+Math.abs(y-gY);
        }
    }
    return cost;
}
```
<br>

### State Template

The state string function and the heuristic need to be added to a [State Template Object](#create-a-state-template). A state template for these functions is shown below

```js
var stateTemplate = {
    heuristicFunc: heuristicCost,
    stateStringFunc: puzzleToString
};
```
<br>

### Final STRIPS Implementation

Now that all of the relevant functions have been implemented, the final step is to pass it all to STRIPS. First a STRIPS instace must be created with the the stateTemplate object in the constructor.

```js
var stripsInstance = new STRIPS(stateTemplate);
```

Next, the action is added to the instance

```js
stripsInstance.addAction(movePieceAction);
```

Finally, the search must be executed with the [aStarSearch](#run-strips) function.

```js
var actionList = stripsInstance.aStarSearch(scrambledPuzzle,solvedPuzzle,50000,false,clonePuzzle(scrambledPuzzle));
```

The stepLimit parameter should be adjusted to ensure that it is unlikely that it will run out of steps.

With a search being complete the final step is to parse the actions and use them wherever is nessisary.

```js
logPuzzle(scrambledPuzzle);
for(let i = 0; i < actionList.length; i++)
{
    let action = actionList[i].params[0];
    scrambledPuzzle = movePiece(scrambledPuzzle,action);
    logPuzzle(scrambledPuzzle);
}
function logPuzzle(puzzle)
{
    let str = "";
    for(let y = 0; y < 3; y++)
    {
        let line = "";
        for(let x = 0; x < 3; x++)
        {
            line += puzzle.board[x+3*y]+" ";
        }
        line+="\n";
        str+=line;
    }
    console.log(str);
}
```


