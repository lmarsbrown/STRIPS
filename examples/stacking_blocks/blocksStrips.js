

var moveBlockAction = {
    //Action type
    type: "moveBlock",

    //Function that actually changes the state
    executeFunc: (state, params) => {
        return moveBlock(state, params[0], params[1]);
    },

    //Function that checks if the action is valid
    validFunc: (state, params) => {
        return moveBlockAllowed(state, params[0], params[1]);
    },

    //Function that returns the cost of the action 
    costFunc: (state, params) => {
        let cost = 5;
        if(params[1] == 0)
        {
            cost+=5;
        }
        if(params[0] == 0)
        {
            cost -= 2;
        }
        return cost;
        //return 3*state.items[params[0]].moveOntoCost(state.items[params[1]]);
    },

    /*
    Valid options for the parameters
    Parameters of an action are provided in the form of an array
    Each element of this array is an array containg all valid values for its respective parameters
    */
    /*inputs:
    [
        indexParams,
        indexParams
    ]*/
    getInputsFunc: getParams
};

var stateTemplate = {
    heuristicFunc: heuristicScore,
    stateStringFunc: genStateString
};



function cloneState(state) {
    incCount(cloneState);

    let tab = state.table;
    let clonedTable = new Table(tab.index,tab.allowedItems);
    let clonedItems = [];
    clonedItems[clonedTable.index] = clonedTable;
    for (let ind in tab.above) {
        let block = tab.above[ind];
        let stack = [];
        while (true) {
            stack.push(block);
            if (block.above == undefined) {
                break;
            }
            else {
                block = block.above;
            }
        }
        let pBlock = clonedTable;
        for (let i = 0; i < stack.length; i++) {
            let clonedBlock;
            let copyFromBlock = stack[i];
            clonedBlock = new Block(pBlock, copyFromBlock.name, copyFromBlock.index);
            clonedItems[clonedBlock.index] = clonedBlock;
            pBlock = clonedBlock;
        }
    }
    return { table: clonedTable, items: clonedItems }
}


function genStateString(state) {
    incCount(genStateString);
    let tab = state.table;
    let stateStr = "";
    let bases = new OrderedList((i => {
        return i.index;
    }));
    for (let ind in tab.above) {
        bases.addElement(tab.above[ind])
    }

    while (bases.array.length != 0) {
        let block = bases.getBestElement();
        let stack = [];
        while (true) {
            stack.push(block);
            if (block.above == undefined) {
                break;
            }
            else {
                block = block.above;
            }
        }
        for (let i = 0; i < stack.length; i++) {
            stateStr += stack[i].index + " ";
        }
        stateStr += "|";
    }
    return stateStr;
}

function moveBlockAllowed(state, blockIndex, dstIndex) {
    incCount(moveBlockAllowed);
    if (blockIndex == 0) {
        return false;
    }
    if (!state.items[blockIndex].moveOntoAllowed(state.items[dstIndex])) {
        return false;
    }
    return true;

}

function moveBlock(state, blockIndex, dstIndex) {
    let outputState = cloneState(state);
    outputState.items[blockIndex].moveOnto(outputState.items[dstIndex]);
    return outputState;
}

function getParams(state) {
    incCount(getParams);
    let activeIds = [0];
    let tab = state.table;
    for (let ind in tab.above) {
        let block = tab.above[ind];
        while (true) {
            if (block.above == undefined) {
                activeIds.push(block.index);
                break;
            }
            else {
                block = block.above;
            }
        }
    }
    return [activeIds, activeIds];
}
/*
function heuristicScore(state, goal)
{
    let score = 0;
    for(let i = 0; i < state.items.length; i++)
    {
        let item = state.items[i];
        if(item.towerHeight != 0)
        {
            let goalItem = goal.items[i];
            if(goalItem.towerHeight == item.towerHeight)
            {
                if(item.below.index == goalItem.below.index)
                {
                    score+=1;
                }
            }
            else if(item.above == undefined)
            {
                score += 0.5;
            }
            if(item.above == undefined&&goalItem.above == undefined)
            {
                score++;
            }
        }
    }
    //return -30*score;
    return -4*(4*state.items.length-14)*score;
    //return -(10*1.6**(state.items.length-7.4) -1)*score;
}*/
/*
function heuristicScore(state, goal) 
{
    let score = 0;
    let stacks = [];


    for (let i in state.table.above) 
    {
        let block = state.table.above[i];
        let correctStacking = true;
        while (block != undefined) 
        {
            let equivalent = goal.items[block.index];
            if (block.below.index == equivalent.below.index&&correctStacking)
            {
                score+= 5;
                if(equivalent.above != undefined)
                {
                    if(block.above == undefined)
                    {
                        score += 2;
                    }
                }
            }
            else
            {
                correctStacking = false;
                if(block.above == undefined)
                {
                    score += 1;
                }
            }
            block = block.above;
        }
    }
    //return -30*score;
    return -1 * (4 * state.items.length - 14) * score;
    //return -(10*1.6**(state.items.length-7.4) -1)*score;
}*/


function heuristicScore(state, goal) 
{
    incCount(heuristicScore);
    let score = 0;
    let itemInfo = [];
    let byOriginalIndex = {};
    for (let i in state.table.above) 
    {
        let block = state.table.above[i];
        let stack = [];
        let correct = true;
        while(true)
        {
            let equivalent = goal.items[block.index];
            if(block.below.index != equivalent.below.index&&correct)
            {
                correct = false;
                if(stack.length>0)
                {
                    stack[stack.length-1].lastCorrect = true;
                }
            }
            let item = 
            {
                block:block,
                correct:correct,
                infoIndex:itemInfo.length,
                top:false,
                burriedBy:0,
                lastCorrect:false,
                bottom:false,
                foundation:equivalent.below.index == 0,
                aboveId:undefined,
                goalIsTop:true,
                equivalent:equivalent
            };
            

            if(equivalent.above != undefined)
            {
                item.goalIsTop = false;
                item.aboveId = equivalent.above.index;
            }

            byOriginalIndex[block.index] = item;


            if(stack.length == 0)
            {
                item.bottom = true;
            }
            
            itemInfo.push(item)
            stack.push(item);
            if(block.above == undefined)
            {
                item.top = true;
                if(equivalent.above != undefined)
                {
                    this.lastCorrect = true;
                }
                break;
            }
            block = block.above;
        }
        for(let i = 0 ; i < stack.length; i++)
        {
            stack[i].burriedBy = stack.length-i-1;
            
        }
    }

    for(let i = 0; i < itemInfo.length; i++)
    {
        let info = itemInfo[i];
        if(info.correct)
        {
            score+=10;
        }
        if(info.lastCorrect)
        {
            score-=info.burriedBy/state.items.length;
            if(!info.goalIsTop)
            {
                score-=9*byOriginalIndex[info.aboveId].burriedBy/state.items.length;
            }
        }
        if(info.foundation&&info.bottom)
        {
            score += 6;
        }
        else if(info.foundation)
        {
            score-=6*info.burriedBy/state.items.length;
        }

        if(!info.correct&&!info.foundation&&!info.lastCorrect)
        {
            score-=8*((state.items.length-info.equivalent.towerHeight)*info.burriedBy)/(state.items.length**2)
        }
        if(!info.correct&&!info.foundation&&!info.lastCorrect&&info.block.above!=undefined)
        {
            if(info.block.above.index == info.equivalent.below.index)
            {
                score += 5;
            }
        }
    }
    score+=4*state.table.aboveCount/state.items.length;
    //return -30*score;
    return -2 * (4 * state.items.length - 14) * score;
    //return -(10*1.6**(state.items.length-7.4) -1)*score;
}