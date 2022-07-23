# STRIPS

This is an extended implementation of the Stanford Research Institute Problem Solver (STRIPS), an automated planning algorithim. STRIPS can be used to solve a wide variety of problems ranging from navigating a room to solving a rubiks cube. 

## Overview

This is a general description of the way the STRIPS proccesses information and how to think in terms of STRIPS. If you are already familiar with this algorithm, feel free to skip this section.

If you are writing a program to solve a problem, the first step is to convert the problem to a form that is understandable to a computer. Let's first look at how STRIPS describes problems. STRIPS describes problems in terms of states and actions. A state is a collection of all of the information relevant to a problem at a given step. For example, in the rubiks cube case, the state of the rubiks cube is the color of all of its squares. In this implementation of STRIPS, the state is an arbitrary object that is created by the user. The actions are all of the things that can be done to change the state. In the rubiks cube example, the actions are all of ways you can rotate each face of the rubiks cube. These actions can be applied to the state, modifying it. 

For example, an action such as 'Move top face counterclockwise' could be applied to a cube, rotating all of the squares on the top section of the cube counterclockwise 90 degrees. The actions should also contain information on the cases that they are valid. This doesn't apply in the rubiks cube example as you are always allowed to do every move, but for other problems, this is not the case. For example, the puzzle [Towers of hanoi](https://en.wikipedia.org/wiki/Tower_of_Hanoi) has restriction as to when moves are allowed. The puzzle involves moving rings around between pegs, and one of the main rules is that a a ring cannot be placed above another ring smaller than itself. This is an example of a case where actions can only be taken in certain circumstances. In this implementation, each action contains a function which takes a state as a parameter and returns a copy of the state that has been modified by the action, as well as a function that takes a state as a parameter and returns whether or not the given action can be performed.

The job of STRIPS is to take an initial state, a goal state, and a list of actions, and determine an efficient sequence of actions that will transform the initial state to the goal state. In the rubiks cube example, you would provide a scrambled rubiks cube as the initial state, a solved rubiks cube as the goal state, and the moves you can do on the rubiks cube as the actions. STRIPS would then return a list of the moves that you need to do to solve the rubiks cube.





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

### The State

The first step in implementing STRIPS is to figure out how you are going to represent 


