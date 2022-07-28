class Block
{
    constructor(surface,name,index)
    {
        this.above = undefined;
        this.name=name;
        this.index=index;


        this.below = surface;
        if(!surface.placeAboveAllowed())
        {
            console.error("ERROR: Block "+name+" surface is not clear");
        }
        surface.placeAbove(this);

        this.towerHeight = surface.towerHeight+1;
    }

    moveOntoAllowed(surface)
    {
        if(this.index == surface.index)
        {
            return false;
        }
        if(this.above!=undefined)
        {
            return false;
        }
        if(!surface.placeAboveAllowed())
        {
            return false;
        }
        return true;
    }
    moveOnto(surface)
    {
        this.below.removeAbove(this);
        this.below = surface;
        this.towerHeight = this.below.towerHeight+1;
        this.below.placeAbove(this);
    }

    moveOntoCost(surface)
    {
        return surface.towerHeight+this.towerHeight;
    }

    placeAboveAllowed()
    {
        return this.above == undefined;
    }
    placeAbove(object)
    {
        this.above = object;
    }
    removeAbove()
    {
        this.above = undefined;
    }

}

class Table
{
    constructor(index,allowedItems=3)
    {
        this.index=index;
        this.towerHeight = 0;
        this.above = {};
        this.aboveCount = 0;
        this.allowedItems = allowedItems;
    }

    placeAboveAllowed()
    {
        //return true;
        return this.aboveCount<this.allowedItems;
    }
    placeAbove(object)
    {
        this.above[object.index] = object;
        this.aboveCount++;
    }
    removeAbove(object)
    {
        delete this.above[object.index];
        this.aboveCount--;
    }

}
