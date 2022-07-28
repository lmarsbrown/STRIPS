let gripperAngleOffset = -4+90;
let blockWidth = 0.06;
let blockHeight = 0.02;
let gripperClosed = 200;
let gripperOpen = 270;
let baseHeight = 0.042;
let hoverHeight = 0.35;

let yPos = 0.312;
let xPos = -0.013;

let currentTower = 0;
let gripperRoteRad = (45/2)/1000;


let towerOrder = [8,5,2,9,6,3,4,1,7];
//let towerOrder = [1,5,4,6,3,7,2];


let towerHeight = towerOrder.length;

let towerHeights = [0,towerHeight,0];
let towersCount  = 3;

let table1 = new Table(0);
let initialState = {table:table1,items:[table1]};
addOrderedStack(initialState,cloneArray(towerOrder));


let table2 = new Table(0);
let goalState = {table:table2,items:[table2]};

addOrderedStack(goalState,[7,4,1]);
addOrderedStack(goalState,[8,5,2]);
addOrderedStack(goalState,[9,6,3]);

console.log(goalState);
// addStack(goalState,towerHeight-4);

// addStack(goalState,4);





let width = 1500;
let height = 700;

let st = new STRIPS(stateTemplate);
st.addAction(moveBlockAction);

let aList = st.aStarSearch(initialState,goalState,5000,true,cloneState(initialState), 5000);
console.log(aList);


let jobList = [];
moveHome(jobList);
// moveToHeight(jobList,1);
// gripBlock(jobList);
// moveToHeight(jobList,3);
// moveToTrayDeliver(jobList,0);
// moveToHeight(jobList,0.5);
// releaseBlock(jobList);


executeActList(aList,jobList);
moveHome(jobList);


// dexterMoveBlock(1,2);
// dexterMoveBlock(1,2);
// dexterMoveBlock(1,2);
// dexterMoveBlock(2,1);
// dexterMoveBlock(2,1);
// dexterMoveBlock(2,1);

// moveToHeight(jobList,4);


// moveHome(jobList,0);
// moveToTray(jobList,1);
// moveToHeight(jobList,1);

// gripBlock(jobList);

// moveToHeight(jobList,4);
// moveToTray(jobList,2);
// moveToHeight(jobList,1);

// releaseBlock(jobList);
// moveToHeight(jobList,4);



function executeActList(actList)
{
    let towers = [[],cloneArray(towerOrder),[]];
    let caps = [];

    for(let i = 0; i < 3; i++)
    {
        if(towerHeights[i] >0)
        {
            caps.push(towers[i][towerHeights[i]-1]); 
        }
        else
        {
            caps.push(0);
        }
    }

    for(let i = 0; actList[i] != undefined; i++)
    {
        let params = actList[i].params;
        
        let srcIndex = 0;
        for(let o = 0; o < 3; o++)
        {
            if(caps[o] == params[0])
            {
                srcIndex = o;
            }
        }
        if(caps[srcIndex] != params[0])
        {
            debugger
            console.error("Invalid steps src");
            break;
        }
        
        let dstIndex = 0;
        for(let o = 0; o < 3; o++)
        {
            if(caps[o] == params[1])
            {
                dstIndex = o;
            }
        }
        if(caps[dstIndex] != params[1])
        {
            debugger
            console.error("Invalid steps dst");
            break;
        }



        console.log(i);
        dexterMoveBlock(srcIndex,dstIndex);
        towers[dstIndex].push(towers[srcIndex].pop());

        
        if(towerHeights[srcIndex] >0)
        {
            caps[srcIndex] = towers[srcIndex][towerHeights[srcIndex]-1];
        }
        else
        {
            caps[srcIndex] = 0;
        }
        
        if(towerHeights[dstIndex] >0)
        {
            caps[dstIndex] = towers[dstIndex][towerHeights[dstIndex]-1];
        }
        else
        {
            caps[dstIndex] = 0;
        }

    }
}


function dexterMoveBlock(src,dst)
{
    moveToHeight(jobList,Math.max.apply(null,towerHeights)+2);
    moveToTrayPickup(jobList,src);
    moveToHeight(jobList,towerHeights[src]-1);

    gripBlock(jobList);

    moveToHeight(jobList,Math.max.apply(null,towerHeights)+2);

    moveToTrayDeliver(jobList,dst);
    moveToHeight(jobList,towerHeights[dst]+0.5);

    releaseBlock(jobList);
    towerHeights[src]--;
    towerHeights[dst]++;

}


let mvJob = new Job({
    name: "mainMove",
    show_instructions:true,
    do_list: jobList
});



//Dexter.move_all_joints([[0],[0],[0],[0],[0],[0],260])


function moveHome(list)
{
    list.push(
    Dexter.move_to(
        [xPos, yPos, hoverHeight],     //xyz
        [0, 0, -1],          //J5_direction
        Dexter.RIGHT_UP_OUT, //config
        null,                 //Workspace Pose
        gripperAngleOffset,
        [0])
    );
    list.push(Dexter.empty_instruction_queue);

}


function moveToTrayDeliver(list,tray)
{

    let excessRoteOffset = 0;
    let currentRoteOffset = 0;

    let excessYOffset = 0;

    if(tray == 0)
    {
        excessRoteOffset = 10;
        excessYOffset = 0.004;
    }
    if(currentTower == 0)
    {
        currentRoteOffset = 10;
    }

    if(tray == 1)
    {
    }
    if(currentTower == 1)
    {
    }

    if(tray == 2)
    {
        excessRoteOffset = -10;
        excessYOffset = -0.00;
    }
    if(currentTower == 2)
    {
        currentRoteOffset = -10;
    }


    excessXOffset = -(Math.sin(2*Math.PI*(excessRoteOffset)/360)-Math.sin(2*Math.PI*(currentRoteOffset)/360))*gripperRoteRad

    list.push(
    Dexter.move_to(
        [[(tray-currentTower)*blockWidth+excessXOffset], yPos+excessYOffset, [0]],     //xyz
        [0, 0, -1],          //J5_direction
        Dexter.RIGHT_UP_OUT, //config
        null,                 //Workspace Pose
        gripperAngleOffset+excessRoteOffset,
        [0])
    );
    list.push(Dexter.empty_instruction_queue);

    currentTower = tray;
}


function moveToTrayPickup(list,tray)
{
    let excessRoteOffset = 0;
    let excessYOffset = 0;
    let excessXOffset = 0;

    currentTower = tray;

    if(tray == 0)
    {
        excessRoteOffset = 10;
        excessYOffset = 0.004;
        //excessXOffset = -0.007;
    }
    if(tray == 1)
    {
        excessYOffset = 0;
        //excessXOffset = -0.007;
    }
    if(tray == 2)
    {
        excessRoteOffset = -10;
        excessYOffset = -0.00;
    }
    
    excessXOffset = -Math.sin(2*Math.PI*excessRoteOffset/360)*gripperRoteRad
    //-(1-Math.cos(2*Math.PI*excessRoteOffset/360))*gripperRoteRad;

    list.push(
    Dexter.move_to(
        [xPos+excessXOffset+blockWidth*tray, yPos+excessYOffset, [0]],     //xyz
        [0, 0, -1],          //J5_direction
        Dexter.RIGHT_UP_OUT, //config
        null,                 //Workspace Pose
        gripperAngleOffset+excessRoteOffset,
        [0])
    );
    list.push(Dexter.empty_instruction_queue);
}

function moveToHeight(list,block)
{
    list.push(
    Dexter.move_to(
        [[0],[0], baseHeight+blockHeight*Math.max(block,0.1)],     //xyz
        [0, 0, -1],          //J5_direction
        Dexter.RIGHT_UP_OUT, //config
        null,                 //Workspace Pose
        [0],
        [0])
    );
    list.push(Dexter.empty_instruction_queue);
}

function gripBlock(list)
{
    list.push(
        Dexter.move_all_joints([[0],[0],[0],[0],[0],[0],gripperClosed])
    );
    list.push(Dexter.empty_instruction_queue);
    list.push(Dexter.sleep(0.2));
    list.push(Dexter.empty_instruction_queue);
}

function releaseBlock(list)
{
    list.push(
        Dexter.move_all_joints([[0],[0],[0],[0],[0],[0],gripperOpen])
    );
    list.push(Dexter.empty_instruction_queue);
}

function delay(list,delay)
{
    list.push({start: ()=>{out("wait a sec or 3")},dur: delay/1000})
    list.push(Dexter.empty_instruction_queue);
}

/*      Job Example 2 
move_all_joints takes 5 angles in degrees, one for each 
of Dexter's joints.
move_to takes an xyz position (in meters from Dexter's base),
where you want the end effect to end up.
Beware, the 2nd and 3rd args to move_to determine the ending
J5_direction and which way the joints go. 
These are tricky to get right.
*/





//After defining this Job by clicking the EVAL button,
//click this job's button in the Output pane's header to start it.
function cloneArray(arr)
{
    let out = [];
    for(let i = 0; i < arr.length; i++)
    {
        out.push(arr[i]);
    }
    return out;
}