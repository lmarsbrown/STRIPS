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
var actionList





//RENDER CODE START

const boardWidth  = 800;
const boardHeight = 800;

const borderWidth = 10;

const canWidth = boardWidth+borderWidth*2;
const canHeight = boardHeight+borderWidth*2;

const can = document.createElement("canvas");
can.width  = canWidth;
can.height = canHeight;
document.body.appendChild(can);

const ctx = can.getContext("2d");

drawBackground();


let animPuzzle = clonePuzzle(scrambledPuzzle);


var animComplete = false;
var moveTime = 300;
var move;
var moveNumber = -1;
var moveStart;
// nextMove();
exectueSTRIPS();



function renderLoop()
{
    drawBackground();
    drawPuzzle(animPuzzle);
    if(!animComplete)
    {
        requestAnimationFrame(renderLoop);
    }
    else
    {
        setTimeout(()=>{
            drawBackground();
            setTimeout(()=>{
            
                exectueSTRIPS();
            },200);
        },200);
    }
}

function exectueSTRIPS()
{
    scramble(scrambledPuzzle,10000);
    animPuzzle = clonePuzzle(scrambledPuzzle);
    actionList = stripsInstance.aStarSearch(scrambledPuzzle,solvedPuzzle,50000,false,clonePuzzle(scrambledPuzzle));
    animComplete = false;
    moveNumber = -1;

    nextMove();
    renderLoop();
}

function nextMove()
{
    moveNumber++;
    if(actionList[moveNumber] == undefined)
    {
        animComplete = true;
        return false;
    }
    let direction = actionList[moveNumber].params[0];
    let xyDir = parseDirection(direction);
    
    let zeroLoc = findZeroLoc(animPuzzle);

    let movingPieceIndex = (zeroLoc[0]+xyDir[0])+(zeroLoc[1]+xyDir[1])*3;

    let movingPieceValue = animPuzzle.board[movingPieceIndex];

    move = {xyDir:xyDir,movingPieceValue:movingPieceValue,direction:direction,moveStart:performance.now()};

    return true;
}

function executeMove()
{
    animPuzzle = movePiece(animPuzzle,move.direction);
}


function drawPuzzle(puzzle)
{
    for(let y = 0; y < 3; y++)
    {
        for(let x = 0; x < 3; x++)
        {
            let piece = puzzle.board[x+3*y];
            if(piece!=0)
            {
                if(piece==move.movingPieceValue)
                {
                    let progress = (performance.now()-move.moveStart)/moveTime;
                    if(progress>1)
                    {
                        progress = 1;
                    }
                    let pos = ease(progress);
                    drawPiece(x-move.xyDir[0]*pos,y-move.xyDir[1]*pos,piece);

                    if(progress>=1)
                    {
                        executeMove();
                        nextMove();
                    }
                    
                }
                else
                {
                    drawPiece(x,y,piece);
                }
            }
        }
    }
}

function ease(x)
{
    return (1-Math.cos(Math.PI*x))/2;
}

function drawPiece(x,y,number)
{
    let outerWidth = 10;
    let gapSize = 1;

    let pieceWidth = boardWidth/3
    let pieceHeight = boardHeight/3

    ctx.fillStyle = `rgb(50,50,50)`;
    roundRect(x*pieceWidth+borderWidth  +gapSize,y*pieceHeight+borderWidth  + gapSize,  pieceWidth - gapSize*2, pieceHeight - gapSize*2 ,40);
    ctx.fill();

    ctx.strokeStyle = `rgb(100,100,100)`;
    ctx.lineWidth = outerWidth;
    roundRect(/*x*/ x*pieceWidth+borderWidth  +gapSize  + outerWidth/2, /*y*/   y*pieceHeight+borderWidth  + gapSize   + outerWidth/2, /*width*/ pieceWidth - gapSize*2 - outerWidth, /*height*/ pieceHeight - gapSize*2 -outerWidth ,40-outerWidth);
    ctx.stroke();

    ctx.fillStyle = `rgb(100,200,150)`;
    ctx.font = `bold ${boardHeight/3*2/3}px sans-serif`;
    ctx.text
    ctx.fillText(number,(x+1/3)*pieceWidth,(y+0.8)*pieceHeight);


}

function roundRect(x,y,width,height,radius)
{
    ctx.beginPath();
    ctx.moveTo(x+radius, y);

    ctx.arcTo(x,y,   x,y+radius,   radius);
    ctx.lineTo(x, y+height-radius);

    ctx.arcTo(x,y+height,   x+radius, y+height,   radius);
    ctx.lineTo(x+width-radius, y+height);

    ctx.arcTo(x+width,y+height,   x+width, y+height-radius,   radius);
    ctx.lineTo(x+width, y+radius);

    ctx.arcTo(x+width,y,   x+width-radius, y,   radius);
    ctx.lineTo(x+radius, y);
    ctx.closePath();
}

function drawBackground()
{
    ctx.fillStyle = `rgb(10,10,10)`;
    ctx.clearRect(0,0,canWidth,canHeight);
    ctx.fillRect(0,0,canWidth,canHeight);

    ctx.lineWidth = borderWidth*2;

    ctx.strokeStyle = `rgb(40,40,40)`;
    ctx.beginPath();
    ctx.rect(0,0,canWidth,canHeight);
    ctx.stroke();

}
