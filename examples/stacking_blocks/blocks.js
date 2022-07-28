let towerHeight = 15;
let towersCount  = 4;


let table1 = new Table(0,towersCount);
let initialState = {table:table1,items:[table1]};
addOrderedStack(initialState,createRandomStack(towerHeight));


let table2 = new Table(0,towersCount);
let goalState = {table:table2,items:[table2]};
addStack(goalState,towerHeight);    





let indexParams = [];
for(let i = 0; i < initialState.items.length; i++)
{
    indexParams.push(i);
}




let width = 800;
let height = 700;

let st = new STRIPS(stateTemplate);
st.addAction(moveBlockAction);

st.benchmark(20,()=>{
    let randTable = new Table(0,towersCount);
    let randState = {table:randTable,items:[randTable]};
    addOrderedStack(randState,createRandomStack(towerHeight));
    return randState;
},goalState,20000,true,cloneState, 20000)



let startT = performance.now();
console.log(cloneState(initialState))
let actList = st.aStarSearch(initialState,goalState,20000,true,cloneState(initialState), 20000);
let endT = performance.now();
console.log("Time:",endT-startT)
console.log("Cycles:",st.cycles)


let can = document.createElement("canvas");
can.width=width;
can.height=height;
//document.getElementById("canViewport").appendChild(can);
document.body.appendChild(can);


let ctx = can.getContext("2d");

let actionI = 0;

drawTower([9,7,8,2,1,5,6,3,4],0)


let pBases = [];

doTestStep(5);
let interval;

interval = setInterval(doTestStep,1000);

function doTestStep()
{
    ctx.clearRect(0,0,width,height);

    let towers = [];
    let miscTowers = [];
    for(let s in initialState.table.above)
    {
        let baseId = initialState.table.above[s].index;
        let same = false;
        for(let i = 0; i < towersCount; i++)
        {
            if(pBases[i] == baseId)
            {
                same = true;
                towers[i] = baseId;
            }
        }
        if(!same)
        {
            miscTowers.push(baseId);
        }
    }
    for(let i = 0; i < towersCount; i++)
    {
        if(towers[i] == undefined && miscTowers.length>0)
        {
            towers[i] = miscTowers.pop();
        }
    }
    for(let i = 0; i < towersCount; i++)
    {
        if(towers[i] != undefined)
        {
            drawTower(getStack(initialState.items[towers[i]]),i,towersCount);
        }
    }

    pBases = towers;

    let act = actList[actionI];
    if(act == undefined)
    {
        clearInterval(interval);
        return;
    }
    initialState = moveBlockAction.executeFunc(initialState,act.params);
    actionI++;
}

function drawTower(tower,towerX,towerCount)
{
    const bottomWidth = width/towerCount;
    const topWidth = (bottomWidth)/towerHeight;
    const increment = (bottomWidth-topWidth)/(towerHeight-1);
    const xOffset = towerX*width/towerCount;
    const ringHeight = height/towerHeight;
    
    
    for(let i = 0; i < tower.length; i++)
    {
        
        ctx.fillStyle=`hsl(${270*(tower[i]-1)/towerHeight},45%,50%)`;
        ctx.fillRect(xOffset+bottomWidth/(3),height-ringHeight-i*ringHeight,bottomWidth-bottomWidth/6,ringHeight)
    }
}