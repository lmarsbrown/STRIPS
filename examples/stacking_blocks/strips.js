function incCount(func)
{
    if(func.count == undefined)
    {
        func.count = 0;
    }
    func.count++;
}
 

class OrderedList
{
    constructor(sortFunction)
    {
        //Internal array
        this.array = [];

        //Function that gets the value to sort by
        this.sortFunc = sortFunction;
    }
    getBestElement()
    {
        //The list is sorted from worst to best so the best element can be removed off of the top
        let ele = this.array.pop();
        return ele;
    }

    addElement(element)
    {
        //Elements are added by performing a binary search and then inserting the element at the correct location

        //If the list is empty, directly add the element to the array
        if(this.array.length==0)
        {
            this.array.push(element);
            return;
        }

        //Minimum possible index is 0 and the maximum index is length-1
        let min = 0;
        let max = this.array.length-1;

        //The value of the element
        let cost = this.sortFunc(element);

        //Loop until the element is found
        while(true)
        {
            //Makes a guess about the index directly between the 2 extremes
            let guess = Math.ceil((min+max)/2);

            //If the minimum is equal or greater than the the maximum the location to splice the element in is found
            if(max<=min)
            {
            
                let newCost = this.sortFunc(this.array[max]);
                if(cost<newCost)
                {
                    this.array.splice(guess+1,0,element);
                    return;
                }
                else if(cost>newCost)
                {
                    this.array.splice(guess,0,element);
                    return;
                }
            }

            //Gets the value of the guess
            let newCost = this.sortFunc(this.array[guess]);

            //If it is underestimating then the maximum index is updated eliminating all entries in the list smaller than the current guess 
            if(cost>newCost)
            {
                max = guess-1;
            }

            //If it is overestimating then the minimum index is updated eliminating all entries in the list larger than the current guess 
            else if(cost<newCost)
            {
                min = guess+1;
            }

            //If the value of the guess is correct the element is added at the location of the guess
            else if(cost==newCost)
            {
                this.array.splice(guess,0,element);
                return;
            }
        }
    }
}



//Unused
//Might be memory leaky but if that is patched this could be a viable alternative to semi sorted
class SortedQueue
{
    constructor(maxExpected)
    {
        this.openStatesSearch = {};
        this.openStatesList = [];
        this.spliceCount = 0;
        this.maxExpected = maxExpected;
        this.worstCost = Infinity;
    }
    getBestElement()
    {
        let ele = this.openStatesList.pop();
        delete this.openStatesSearch[ele.str];
        return ele;
    }

    addElement(element)
    {
        if(element.fCost > this.worstCost)
        {
            return;
        }
        this.openStatesSearch[element.str] = element;
        if (this.openStatesList.length == 0)
        {
            this.openStatesList.push(element);
            return;
        }
        let min = 0;
        let max = this.openStatesList.length - 1;
        let cost = element.fCost;
        while (true)
        {
            let newExtreme = Math.ceil((min + max) / 2);
            if (max - min <= 0)
            {
                let newCost = this.openStatesList[max].fCost;
                if (cost < newCost)
                {
                    this.openStatesList.splice(newExtreme + 1, 0, element);
                    this.worstCost = this.openStatesList[0];
                    while(this.openStatesList.length>this.maxExpected)
                    {
                        delete this.openStatesSearch[this.openStatesList.shift().str];
                    }
                    return;
                }
                else if (cost > newCost)
                {
                    this.openStatesList.splice(newExtreme, 0, element);
                    this.worstCost = this.openStatesList[0];
                    while(this.openStatesList.length>this.maxExpected)
                    {
                        delete this.openStatesSearch[this.openStatesList.shift().str];
                    }
                    return;
                }
            }
            let newCost = this.openStatesList[newExtreme].fCost;
            if (cost > newCost)
            {
                max = newExtreme - 1;
            }
            else if (cost < newCost)
            {
                min = newExtreme + 1;
            }
            else if (cost == newCost)
            {
                this.openStatesList.splice(newExtreme, 0, element);
                this.worstCost = this.openStatesList[0];
                this.spliceCount++;
                while(this.openStatesList.length>this.maxExpected)
                {
                    delete this.openStatesSearch[this.openStatesList.shift().str];
                }
                return;
            }
        }
    }
    
    getElementByStr(str)
    {
        return this.openStatesSearch[str];
    }
}


//Unused
//Example of what happens if you try to manually search the list for the best element
//Large state spaces are VERY slow with this
class UnsortedQueue
{
    constructor()
    {
        this.openStatesSearch = {};
    }
    getBestElement()
    {
        let bestCost = Infinity;
        let bestIndex = 0;
        for(let i in this.openStatesSearch)
        {
            let cost = this.openStatesSearch[i].fCost;
            if(cost<bestCost)
            {
                bestCost = cost;
                bestIndex = i;
            }
        }
        let ele = this.openStatesSearch[bestIndex];
        delete this.openStatesSearch[bestIndex];
        return ele;
    }
    addElement(element)
    {
        this.openStatesSearch[element.str] = element;
    }
    getElementByStr(str)
    {
        return this.openStatesSearch[str];
    }
}



/*
This is what is used to retrieve the best element

It works by splitting up the data into 2 lists: a good list, and a bad list
The good list length is 2xsqrt of the the total length

New entries are sorted into the good or bad list based on whether they are better than the worst element in the good list

If the good list is empty or twice the length that it is supposed to be, the lists are resorted and the boundry value is reset

During a resort, if the total length is greater than the max expected length, the extra items are removed

This can be sped up by using js sort to remove excess elements rather than the OrderedList which uses splice
*/

class SemiSortedQueue
{
    constructor(maxExpectedLength)
    {
        this.openStatesSearch = {};

        this.badList = [];
        this.badVacancies = [];
        this.badLength = 0;

        this.goodList = [];
        this.goodVacancies = [];
        this.goodLength = 0;
        this.goodMaxLength = 50;

        this.goodThreshold = 20;
        this.sortedMode = false;

        this.maxExpectedLength = maxExpectedLength;

        this.boundryCost = Infinity;
        this.worstCost = Infinity;
        
    }
    getBestElement()
    {

        if(this.goodLength+this.badLength<this.goodThreshold)
        {
            this.switchSortedMode(false);
        }
        else
        {
            this.switchSortedMode(true);
        }
        
        if(this.goodLength <= 0)
        {
            this.resort();
        }

        if(this.goodLength <= 0)
        {
            console.error("Error: Cannot retrieve an element from an empty list")
        }

        let bestCost = Infinity;
        let bestCostIndex;
        for(let i = 0; i < this.goodList.length; i++)
        {
            let testEle = this.goodList[i];
            if(testEle != undefined)
            {
                if(testEle.fCost<bestCost)
                {
                    bestCost = testEle.fCost;
                    bestCostIndex = i;
                }
            }
        }
        let bestEle = this.goodList[bestCostIndex];
        delete this.goodList[bestCostIndex];
        this.goodLength--;
        this.goodVacancies.push(bestCostIndex);

        if(this.openStatesSearch[bestEle.str] == undefined)
        {
            delete this.openStatesSearch[bestEle.str];
            return this.getBestElement();
        }
        else if(this.openStatesSearch[bestEle.str].cost<bestEle.cost)
        {
            delete this.openStatesSearch[bestEle.str];
            console.log("Duplicate Element Detected")
            return this.getBestElement();
        }
        delete this.openStatesSearch[bestEle.str];

        return bestEle;
    }

    addElement(element)
    {
        if(this.goodLength+this.badLength<this.goodThreshold)
        {
            this.switchSortedMode(false);
        }
        else
        {
            this.switchSortedMode(true);
        }
        if(this.goodLength>=this.goodMaxLength*2||this.badLength>this.maxExpectedLength*2)
        {
            this.resort();
        }

        if(this.sortedMode)
        {
            if(element.fCost<this.boundryCost)
            {
                this.addToGood(element);
                this.openStatesSearch[element.str] = element;
            }
            else if(element.fCost<this.worstCost)
            {
                this.addToBad(element);
                this.openStatesSearch[element.str] = element;
            }
        }
        else
        {
            this.addToGood(element);
            this.openStatesSearch[element.str] = element;
        }
    }
    
    switchSortedMode(mode)
    {
        if(!mode&&this.sortedMode)
        {
            this.sortedMode = false;
            
            for(let i = 0; this.badLength>0; i++)
            {
                if(this.badList[i]!=undefined)
                {
                    this.badLength--;
                    this.addToGood(this.badList[i]);
                }
            }
            this.badList = [];
            this.badVacancies = [];
        }
        
        if(mode&&!this.sortedMode)
        {
            this.resort();
            this.sortedMode = true;
        }
    }
    addToGood(element)
    {
        if(this.goodVacancies.length != 0)
        {
            let index = this.goodVacancies.pop();
            this.goodList[index] = element;
        }
        else
        {
            this.goodList.push(element);
        }
        this.goodLength++;
    }

    addToBad(element)
    {
        if(this.badVacancies.length != 0)
        {
            let index = this.badVacancies.pop();
            this.badList[index] = element;
        }
        else
        {
            this.badList.push(element);
        }
        this.badLength++;
    }

    resort()
    {

        if(this.goodLength != 0)
        {

            for(let i = 0; this.goodLength>0; i++)
            {
                if(this.goodList[i]!=undefined)
                {
                    this.goodLength--;
                    this.addToBad(this.goodList[i]);
                }
            }
            this.goodList = [];
            this.goodVacancies = [];
        }


        if(this.badLength > this.maxExpectedLength*2)
        {

            console.log("huh");
            let bestOfTheWorst = new OrderedList((e)=>{
                return e[0];
            });

            let boundry = Infinity;

            let popcount = 0;

            for(let i = 0; i < this.badList.length; i++)
            {
                if(this.badList[i] != undefined)
                {
                    let cost = this.badList[i].fCost;
                    if(bestOfTheWorst.array.length < this.maxExpectedLength)
                    {
                        bestOfTheWorst.addElement([-cost,i]);
                        if(bestOfTheWorst.array.length == this.maxExpectedLength)
                        {
                            boundry = cost;
                        }
                    }
                    else if(cost<boundry)
                    {
                        bestOfTheWorst.addElement([-cost,i]);
                        popcount++;
                        let poppedId = this.badList[bestOfTheWorst.array.pop()[1]].str;
                        if(this.openStatesSearch[poppedId] != undefined)
                        {
                            delete this.openStatesSearch[poppedId];
                        }
                        boundry = -(bestOfTheWorst.array[this.maxExpectedLength-1][0]);
                    }
                    else
                    {
                        delete this.openStatesSearch[this.badList[i].str];
                    }
                }
            }

            let transferBuffer = [];
            for(let i = 0; i < this.maxExpectedLength; i++)
            {
                let index = bestOfTheWorst.array[i][1];
                transferBuffer.push(this.badList[index]);

                if(this.openStatesSearch[this.badList[index].str] == undefined)
                {
                    this.openStatesSearch[this.badList[index].str] = this.badList[index];
                }
            }
            this.worstCost = transferBuffer[this.maxExpectedLength-1].fCost;

            this.badList = transferBuffer;
            this.badLength = this.maxExpectedLength;
        }

        this.goodMaxLength = 2*Math.ceil(Math.sqrt(this.badLength));

        
        let badDefragged = [];
        let candidates = new OrderedList((e)=>{
            return e[0];
        });

        this.boundryCost = Infinity;

        for(let i = 0; i < this.badList.length; i++)
        {
            if(this.badList[i] != undefined)
            {
                let cost = this.badList[i].fCost;
                if(candidates.array.length < this.goodMaxLength)
                {
                    candidates.addElement([-cost,i]);

                    if(candidates.array.length == this.goodMaxLength)
                    {
                        this.boundryCost = cost;
                    }
                }
                else if(cost<this.boundryCost)
                {
                    candidates.addElement([-cost,i]);
                    badDefragged.push(this.badList[candidates.array.pop()[1]]);
                    this.boundryCost = -(candidates.array[this.goodMaxLength-1][0]);
                }
                else
                {
                    badDefragged.push(this.badList[i])
                }
            }
        }
        this.goodList = [];
        for(let i = 0; i < this.goodMaxLength; i++)
        {
            this.goodList.push(this.badList[candidates.array[i][1]]);
        }
        this.goodLength = this.goodMaxLength;
        this.goodVacancies = [];

        this.badList = badDefragged;
        this.badLength = badDefragged.length;


        
    }


    getElementByStr(str)
    {
        return this.openStatesSearch[str];
    }
}
class STRIPS
{
    constructor(stateTemplate)
    {
        this.actions = [];
        this.heuristic = stateTemplate.heuristicFunc;
        this.getStateString = stateTemplate.stateStringFunc;
    }


    //Adds an action to the list of possible actions
    addAction(action)
    {
        let failed = false;
        if(action.type == undefined)
        {
            console.warn("Action Type Invalid");
        }

        if(typeof(action.executeFunc) != "function")
        {
            console.error("Action "+action.type+": Invalid or Missing Execute Fuction")
            failed= true;
        }
        else if(action.executeFunc.length <2)
        {
            console.error("Action "+action.type+": Not Enough Execute Fuction Params")
            failed= true;
        }


        if(typeof(action.validFunc) != "function")
        {
            console.error("Action "+action.type+": Invalid or Missing Validation Fuction")
            failed= true;
        }
        else if(action.validFunc.length <2)
        {
            console.error("Action "+action.type+": Not Enough Validation Fuction Params")
            failed= true;
        }


        if(typeof(action.costFunc) != "function")
        {
            console.error("Action "+action.type+": Invalid or Missing Cost Fuction")
            failed= true;
        }
        else if(action.costFunc.length <2)
        {
            console.error("Action "+action.type+": Not Enough Cost Fuction Params")
            failed= true;
        }


        /*for(let a in action.inputs)
        {
            if(action.inputs[a].length == 0)
            {
                console.error("Action "+action.type+": Input Set "+a+" Empty")
                failed= true;
            }
        }*/
        if(!failed)
        {
            this.actions.push(action);
        }
        return !failed;


    }

    //Returns the valid actions for a given state
    getValidActions(state)
    {
        //List of actions to be generated
        let actions = [];

        //Loops through all the different types of actions
        for(let actionIndex in this.actions)
        {
            //Current action
            let a = this.actions[actionIndex];

            //Array of possible actions
            let inputs = a.getInputsFunc(state);

            //Array that contains the indices of the inputs that are currently being tried
            let paramIndexArray = [];
            for(let i in inputs)
            {
                paramIndexArray.push(0);
            }

            let complete = false;
            while(!complete)
            {
                //Generates list of params from index array
                let params = [];
                for(let i in paramIndexArray)
                {
                    params[i] = inputs[i][paramIndexArray[i]];
                }

                //Checks if the params result in a valid action
                if(a.validFunc(state,params))
                {
                    //If the action is valid, add it to the list of valid actions
                    actions.push([actionIndex,params]);
                }

                //Increments indices

                //If index overflows past the total number of params it is reset to zero and the next index is incremented
                let carry = true;
                let i = 0;
                while(carry)
                {
                    //Increments the ith index
                    paramIndexArray[i]++;

                    //Check if the index has overflowed
                    if(paramIndexArray[i]>inputs[i].length-1)
                    {
                        //If the parameter has overflowed it is reset to zero and the next parameter is selected for incrementation
                        paramIndexArray[i] = 0;

                        //Check if this is this the last parameter
                        if(i<inputs.length-1)
                        {
                            //If not proceed with incrementing the next parameter
                            i++;
                        }
                        else
                        {
                            //If it is the last parameter that means that all possible parameters have been checked for this action and that the next action should be selected
                            carry = false;
                            complete = true;
                        }
                    }
                    else
                    {
                        //If it has not overflowed, incrementation is stopped
                        carry = false;
                    }
                }
            }
        }
        //Return the valid actions
        return actions;
    }

    aStarSearch(initialState,goalState,cycleLimit,suppressErrors=false,changableInitialState,maxExpectedCycles)
    {
        //The node at the end of the path
        let finalNode;

        //If maxExpectedCycles isn't passed in it defaults to cycleLimit
        if(maxExpectedCycles ==undefined)
        {
            maxExpectedCycles = cycleLimit;
        }

        //States where the cost has been calculated have not been fully explored yet
        let openStates = new SemiSortedQueue(maxExpectedCycles);
        
        //States that have been fully explored and should not be be backtracked onto
        let closedStates = {};

        //String representing the goal state
        let goalStr = this.getStateString(goalState);


        //Copy of the initial state with added info relevant to aStar
        let iState;
        if(changableInitialState != undefined)
        {
            iState = changableInitialState;
        }
        else
        {
            iState = JSON.parse(JSON.stringify(initialState));
        }

        //Inital costs
        iState.gCost = 0;
        iState.hCost = this.heuristic(iState,goalState);
        iState.fCost = iState.gCost+iState.hCost;

        //String representing the initial state
        iState.str = this.getStateString(iState);

        //Checks if the state is alread solved
        if(iState.str == goalStr)
        {
            console.log("State Already Solved")
            return [];
        }

        //Action taken to get to this state. This is marked is the root node by an action index of -1
        iState.action = [-1];

        //Adds the initial state to the open states list
        openStates.addElement(iState);


        let isAtGoal = false;
        let counter = 0;

        while(!isAtGoal&&counter<cycleLimit)
        {
            //The open state with the lowest cost
            let bestState = openStates.getBestElement();

            //As it is being explored, the best state string is added to closed states to avoid backtracking
            let stateClosed = {action: bestState.action,parent:bestState.parent};
            closedStates[bestState.str]=stateClosed;


            //Gets all valid actions for this state
            let avalibleActions = this.getValidActions(bestState);

            //Loops through all avalible actions
            for(let a of avalibleActions)
            {
                //Gets the new state based on the action
                let newState = this.actions[a[0]].executeFunc(bestState,a[1]);
                newState.str = this.getStateString(newState);

                //Checks if it is backtracking
                if(closedStates[newState.str] == undefined)
                {
                    //If it is not backtracking, relevant data is updated and it is added to open states

                    //G cost is the cost of the previous state plus the cost of the action
                    let addedGCost = this.actions[a[0]].costFunc(newState,a[1]);
                    newState.gCost = bestState.gCost+addedGCost;
                    newState.hCost = this.heuristic(newState,goalState);
                    newState.fCost = newState.gCost+newState.hCost;

                    newState.action = a;
                    newState.parent = stateClosed;

                    //Adds the current node to the open nodes list if there is not already a more efficient node there
                    if(addedGCost != Infinity)
                    {
                        if(openStates.getElementByStr(newState.str) == undefined)
                        {
                            openStates.addElement(newState);
                        }
                        else
                        {
                            if(newState.fCost < openStates.getElementByStr(newState.str).fCost)
                            {
                                openStates.addElement(newState);
                            }
                        }
                    }
                }

                //Checks if the new state is at the goal
                if(newState.str==goalStr)
                {
                    //If it is at the goal, the while loop is stopped and the action list of the new state is returned
                    finalNode = newState;
                    isAtGoal = true;
                }
            }

            counter++;
        }


        if(isAtGoal)
        {
            //Generates a list of actions from the final node
    
            //As it moves backwards down the tree, the list of actions will be created backwards
            let actionsInverted = [];
            let atRoot = false;
            let node = finalNode;
            while(!atRoot)
            {
                //Checks if its at the root node
                if(node.action[0] != -1)
                {
                    //The action of the node is added to the list of actions
                    actionsInverted.push({
                        name:this.actions[node.action[0]].type,
                        index:node.action[0],
                        params:node.action[1]
                    });
                    //The node is set to its parent moving it up the tree
                    node = node.parent;
                }
                else
                {
                    atRoot = true;
                }
            }
    
            //Flips the inverted list of actions
            let actions = [];
            for(let i = actionsInverted.length-1; i >= 0; i--)
            {
                actions.push(actionsInverted[i]);
            }
            
            this.cycles = counter;
            return actions;
        }
        else
        {
            if(!suppressErrors)
            {
                console.error("Error: Path was not found within the allowed number of steps")
            }
        }
    }

    benchmark(attempts,getRandomState,goalState,cycleLimit,logResults,cloneState,maxExpectedCycles)
    {
        //Statistics vars
        let totalCycles = 0;
        let totalActions = 0;
        let totalFailures = 0;
        let trueTotalAttempts = 0;
        let doCloneState = cloneState != undefined;

        let successTime = 0;
        let failureTime = 0;

        let failedStates = [];

        for(let i = 0; i < attempts; i++)
        {
            //Actual number of total attemps (success+fail)
            trueTotalAttempts++;

            //Gets a random state
            let randState = getRandomState();

            //Gets a cloned copy of the state if the cloneState function is provided
            let clonedState = undefined;
            if(doCloneState)
            {
                if(doCloneState)
                {
                    clonedState = cloneState(randState);
                }
            }


            //Executes aStarSearch while timed
            let startTime;
            let endTime;

            startTime = performance.now();
            let acts = this.aStarSearch(randState,goalState,cycleLimit,true,clonedState,maxExpectedCycles);
            endTime = performance.now();

            //If acts is undefined then that means that aStarSearch ran out of cycles
            if(acts == undefined)
            {
                //In the case of a failure deincrement i discarding the run
                i--;

                //Add to the failure count and time
                totalFailures++;
                failureTime+=endTime-startTime;

                //Add the state to the failed states list
                if(doCloneState)
                {
                    failedStates.push(cloneState(randState));
                }
                else
                {
                    failedStates.push(randState);
                }

                //If the number of total attempts is more than twice the allowed attemps then the loop is killed to prevent a practically infinite loop
                if(trueTotalAttempts>attempts*2)
                {
                    break;
                }
            }
            else
            {
                //If the search succeeds the actions cycles and time are added
                totalActions += acts.length;
                totalCycles+=this.cycles;
                successTime+=endTime-startTime;
            }
        }

        //Calculates average failure time and sets the value to "No Failures" if there are no failures
        let avFailTime = failureTime/totalFailures;
        if(totalFailures == 0)
        {
            avFailTime = "No Failures";
        }
        //Create output object with the statistics
        let output = 
        {
            overwhelmingFailure:trueTotalAttempts>attempts*2,
            averageCycles: totalCycles/attempts,
            averageActions:totalActions/attempts,
            averageTimeTotal:(successTime+failureTime)/trueTotalAttempts,
            averageTimePerSuccess:successTime/attempts,
            averageTimePerFailure:avFailTime,
            cycleRunoutProbability:totalFailures/trueTotalAttempts,
            failureCount:totalFailures,
            failedStates:failedStates
        }

        //Log results
        if(logResults)
        {
            console.log("-------- Benchmark Results --------");
            console.log("\n");
            console.log("Overwhelming Failure: ", output.overwhelmingFailure);
            console.log("\n");
            console.log("Average Number of Cycles:  ", output.averageCycles);
            console.log("Average Number of Actions: ", output.averageActions);
            console.log("\n");
            console.log("Average Time Per Attempt (ms):            ", output.averageTimeTotal);
            console.log("Average Time Per Successful Attempt (ms): ", output.averageTimePerSuccess);
            console.log("Average Time Per Failed Attempt (ms):     ", output.averageTimePerFailure);
            console.log("\n");
            console.log("Probability of Exceeding Max Cycles: ", output.cycleRunoutProbability*100+"%");
            console.log("Number Of Failed Attempts: ", totalFailures);
            console.log("-----------------------------------");
            console.log("\n\n");
        }

        return output;
    }
    
}
