

function getStack(base)
{
    let block = base;
    let stack = [];
    while(true)
    {
        stack.push(block.index);
        if(block.above == undefined)
        {
            break;
        }
        else
        {
            block = block.above;
        }
    }
    return stack;
}


function createRandomStack(height)
{
    let unRandom = [];
    for(let i = 0; i < height; i++)
    {
        unRandom[i] = i+1;
    }

    let randomized = [];

    for(let i = 0; i < height; i++)
    {
        let randEle;
        while(randEle == undefined)
        {
            let trialIndex = Math.floor(Math.random()*height)
            let trialElement = unRandom[trialIndex];
            if(trialElement != undefined);
            randEle = trialElement;
            unRandom[trialIndex] = undefined;
        }
        randomized.push(randEle);
    }
    return randomized;
}


function addStack(state,height)
{
    let block = state.table;
    for(let i = 0; i < height; i++)
    {
        let index = state.items.length;
        block = new Block(block,"Block"+index,index);
        state.items.push(block);
    }
}
function addOrderedStack(state,indices)
{
    let block = state.table;
    for(let i = 0; i < indices.length; i++)
    {
        let index = indices[i];
        block = new Block(block,"Block"+index,index);
        state.items[index] = block
    }
}
