let solvedPuzzle = 
{
    board:
    [
        1,2,3,
        4,5,6,
        7,8,0
    ]
}

let scrambledPuzzle = clonePuzzle(solvedPuzzle);
scramble(scrambledPuzzle,10000);


let stripsInstance = new STRIPS(stateTemplate);
stripsInstance.addAction(movePieceAction);
var actionList = stripsInstance.aStarSearch(scrambledPuzzle,solvedPuzzle,50000,false,clonePuzzle(scrambledPuzzle));


console.log(actionList);

logPuzzle(scrambledPuzzle);
for(let i = 0; i < actionList.length; i++)
{
    let action = actionList[i].params[0];
    scrambledPuzzle = movePiece(scrambledPuzzle,action);
    logPuzzle(scrambledPuzzle);
}



//UNCOMMENT THIS TO DO BENCHMARK

/*
let benchmark = stripsInstance.benchmark(1000,()=>{
    let out = clonePuzzle(solvedPuzzle);
    scramble(out,1000);
    return out;
},solvedPuzzle,40000,true,clonePuzzle);
*/