
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

var stateTemplate = {
    heuristicFunc: heuristicCost,
    stateStringFunc: puzzleToString
};


function scramble(puzzle,moves)
{
    let out = puzzle;
    for(let i = 0; i < moves; i++)
    {
        let move = Math.floor(4*Math.random());
        if(isMoveAllowed(out,move))
        {
            out = movePiece(out,move);
        }
        else
        {
            i--;
        }
    }
    puzzle.board = out.board;
}

function puzzleToString(puzzle)
{
    let str = "";
    for(let i = 0; i < 9; i++)
    {
        str += puzzle.board[i];
    }
    return str;
}

function isMoveAllowed(puzzle,direction)
{
    let zeroLoc = findZeroLoc(puzzle);
    if(zeroLoc[1] == 0&&direction==0)return false;
    if(zeroLoc[0] == 0&&direction==1)return false;
    if(zeroLoc[1] == 2&&direction==2)return false;
    if(zeroLoc[0] == 2&&direction==3)return false;
    return true;
}
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
    

    //Find the index of the piece being moved
    let dstIndex = zeroLoc[2]+dirXY[0]+dirXY[1]*3;

    //Find the value of the piece being moved
    let dstVal = puzzle.board[dstIndex];

    //Set zero position to neighbor
    out.board[zeroLoc[2]] = dstVal;

    //Set piece being moved to 0
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

function clonePuzzle(puzzle)
{
    let arr = [];
    for(let i = 0; i < 9; i++)
    {
        arr.push(puzzle.board[i]);
    }

    return {board:arr};
}

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