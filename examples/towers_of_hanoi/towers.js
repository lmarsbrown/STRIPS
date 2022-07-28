let moveRingAction = {
    //Action type
    type:"moveRing",

    //Function that actually changes the state
    executeFunc:(state,params)=>{
        return moveRing(state,params[0],params[1]);
    },

    //Function that checks if the action is valid
    validFunc:(state,params)=>{
        return moveRingAllowed(state,params[0],params[1]);
    },

    //Function that returns the cost of the action 
    costFunc:(state,params)=>{
        return 1;
    },

    /*
    Function that returns valid options for the parameters
    Parameters of an action are provided in the form of an array
    Each element of this array is an array containg all valid values for its respective parameters
    */
    getInputsFunc:()=>
    {
        return [
            [0,1,2],
            [0,1,2]
        ];
    }
    
};


let stateTemplate = {
    heuristicFunc:heuristicDist,
    stateStringFunc:stateString,
}


let towerHeight = 9;

//Creates 2 towers for the initial and goal states
let fullTower1 = [];
let fullTower2 = [];
for(let i = 0; i < towerHeight; i++)
{
    fullTower1.push(i);
    fullTower2.push(i);
}

//Creating inital and goal
let initial = 
{
    towers:[fullTower1,[],[]]
};
let goal = 
{
    towers:[[],[],fullTower2]
};


//Running STRIPS
let st = new STRIPS(stateTemplate);
st.addAction(moveRingAction);
let acts = st.getValidActions(initial);


//Timing STRIPS
let tStart = performance.now();

let outActions = st.aStarSearch(initial,goal,50000);

let tEnd = performance.now();


console.log("time: " +(tEnd-tStart)+"ms");

//START OF RENDERING CODE! REMOVE FOR NODEJS

let width = 800;
let height = 400;

let can = document.createElement("canvas");
can.width=width;
can.height=height;
document.body.appendChild(can);


let ctx = can.getContext("2d");

let actionI = 0;

doTestStep();
let interval;
interval = setInterval(doTestStep,300);

function doTestStep()
{
    ctx.clearRect(0,0,width,height);
    for(let i = 0; i < 3; i++)
    {
        drawTower(initial.towers[i],i);
    }
    let act = outActions[actionI];
    if(act == undefined)
    {
        clearInterval(interval);
    }
    initial = moveRingAction.executeFunc(initial,act.params);
    actionI++;
}

function drawTower(tower,towerX)
{
    const bottomWidth = width/3;
    const topWidth = (bottomWidth)/towerHeight;
    const increment = (bottomWidth-topWidth)/(towerHeight-1);
    const xOffset = towerX*width/3;
    const ringHeight = height/towerHeight;
    
    
    for(let i = 0; i < tower.length; i++)
    {
        
        ctx.fillStyle=`rgb(${255*tower[i]/towerHeight},0,0)`;
        ctx.fillRect(tower[i]*increment/2+xOffset,height-ringHeight-i*ringHeight,bottomWidth-tower[i]*increment,ringHeight)
    }
}
//END OF RENDERING CODE



//Returns a string that identifys the state
function stateString(state)
{
    let str = "";
    for(let i = 0; i < 3; i++)
    {
        for(let r of state.towers[i])
        {
            str += r+",";
        }
        str+="|";
    }
    return str;
}


//Checks if it is allowed to move a ring from one tower to another
//The parameters are the tower you want to move the ring from and the tower you want to move the ring to
function moveRingAllowed(state,src,dst)
{
    //You can move a ring to itself
    if(src == dst)
    {
        return false;
    }
    let t1 = state.towers[src];
    let topRingIndex = t1[t1.length-1];

    //You can't move a ring from a tower with no rings
    if(topRingIndex==undefined)
    {
        //console.log("1st");
        return false;
    }
    let t2 = state.towers[dst];
    let secondRingIndex = t2[t2.length-1];

    
    if(secondRingIndex!=undefined)
    {
        //You can't put a bigger ring on top of a smaller ring
        if(secondRingIndex>topRingIndex)
        {
            return false;
        }
        //console.log("2nd");
        //return [false];
    }
    return true;
}

//Checks if it is allowed to move a ring from one tower to another
//The parameters are the tower you want to move the ring from and the tower you want to move the ring to
function moveRing(state,src,dst)
{
    let t1 = state.towers[src];
    //Copies the state to an output variable
    let output = {towers:[]};
    for(let i = 0; i < 3; i++)
    {
        output.towers.push([]);
        for(let r of state.towers[i])
        {
            output.towers[i].push(r);
        }
    }

    //Moves the ring at the top of the src pile to the top of the dst pile
    output.towers[src].pop()
    output.towers[dst].push(t1[t1.length-1]);

    return output;
}

//Counts the number of rings that are the same between the state and the goal
function heuristicDist(state,goal)
{
    let iDist = 0;
    for(let i = 0; i < 3; i++)
    {
        let complete = false;
        let i1 = 0;
        let i2 = 0;
        while(!complete)
        {
            let r1 = state.towers[i][i1];
            if(r1==undefined)
            {
                complete=true;
                break;
            }

            let r2 = goal.towers[i][i2];
            if(r2==undefined)
            {
                complete=true;
                break;
            }

            if(r1>r2)
            {
                i2++;
            }
            else if(r1<r2)
            {
                i1++;
            }
            else
            {
                i1++;
                i2++;
                iDist++;
            }
        }
    }
    //return -iDist*7;
    return 0;
}