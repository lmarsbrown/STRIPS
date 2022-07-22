 

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

        this.goodThreshold = 10;
        this.sortedMode = false;

        this.maxExpectedLength = maxExpectedLength;;

        this.boundryCost = Infinity;
        this.worstCost = Infinity;
        
    }
    getBestElement()
    {
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

            //Array that contains the indices of the inputs that are currently being tried
            let paramIndexArray = [];

            let inputs = a.getInputsFunc(state);
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

                //And index overflows past the total number of params it is reset to zero and the next index is incremented
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

    aStarSearch(initialState,goalState,stepLimit,suppressErrors=false,changableInitialState,maxExpectedCycles)
    {
        //The node at the end of the path
        let finalNode;

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

        //Costs
        iState.gCost = 0;
        iState.hCost = this.heuristic(iState,goalState);
        iState.fCost = iState.gCost+iState.hCost;

        //String representing the initial state
        iState.str = this.getStateString(iState);

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

        while(!isAtGoal&&counter<stepLimit)
        {
            if(counter>stepLimit-10&&!suppressErrors)
            {
                debugger;
            }
            //The open state with the lowest cost
            let bestState = openStates.getBestElement();

            //As it is being explored, the best state string is added to closed states to avoid backtracking
            let stateClosed = {action: bestState.action,parent:bestState.parent}
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
                    newState.gCost = bestState.gCost+this.actions[a[0]].costFunc(newState,a[1]);
                    newState.hCost = this.heuristic(newState,goalState);
                    newState.fCost = newState.gCost+newState.hCost;

                    newState.action = a;
                    newState.parent = stateClosed;

                    // //The list of actions for this state is the list of actions for the previous state plus latest action
                    // newState.actions = JSON.parse(JSON.stringify(bestState.actions));
                    // newState.actions.push(a);

                    

                    //Adds the current node to the open nodes list if there is not already a more efficient node there
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

                //Checks if the new state is at the goal
                if(newState.str==goalStr)
                {
                    //If it is at the goal, the while loop is stopped and the action list of the new state is returned
                    finalNode = newState;
                    isAtGoal = true;
                }
            }

            counter++;
            //debugger;
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
    
            let actions = [];
            for(let i = actionsInverted.length-1; i >= 0; i--)
            {
                actions.push(actionsInverted[i]);
            }
    
    
            //console.log(counter);
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
    
}
