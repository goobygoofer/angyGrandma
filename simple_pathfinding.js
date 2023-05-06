/*
function findPath(mobX, mobY, pX, pY){//pX, pY can be any target
  var grid = new PF.Grid(100,100);
  getCollisionTiles(grid);
  var finder = new PF.AStarFinder();
  var path = finder.findPath(mobX, mobY, pX, pY, grid);
  return path;
}
*/

//actual x = grid x + (mobX - length of axis/2)  //axis doesn't matter since square
function findPath(mobX, mobY, pX, pY, radius=10){//pX, pY can be any target. 20x20 grid by default, radius*2
  
try {
    let relX = mobX - (mobX-radius);
    let relY = mobY - (mobY-radius);
    let relPX = pX - (mobX-radius);
    let relPY = pY - (mobY-radius);
    var grid = new PF.Grid(radius*2,radius*2);
    getCollisionTiles(grid, mobX, mobY, radius);
  
    var finder = new PF.AStarFinder();
    var path = finder.findPath(relX, relY, relPX, relPY, grid);
  
    for (coord in path){
      path[coord][0] = path[coord][0] + (mobX - radius);
      path[coord][1] = path[coord][1] + (mobY - radius);
  
    }
    //console.log(path);
    return path;
} catch (error) {
  //guess mob not going anywhere
  return [[mobX, mobY]];
}
}

function getCollisionTiles(grid, mobX, mobY, radius){
  for (x in grid.nodes){
    for (y in grid.nodes[x]){
        let mapX = parseInt(x) + (mobX - radius);
        let mapY = parseInt(y) + (mobY - radius);
        if (tile_map[mapX][mapY].sprite.collision===true){
            grid.nodes[y][x].walkable=false;
            continue;
        }
        coll=false;
        for (obj in tile_map[mapX][mapY].objects){
            if (tile_map[mapX][mapY].objects[obj].collision===true){
                grid.nodes[y][x].walkable=false;
            }
        }
        if (coll) {
            continue;
        }
    }
  }
}

function drawPath(path){
  for (coord in path){
    tile_map[path[coord][0]][path[coord][1]].objects.push(gameObjects['redDownArrow']);
  }
}

function playerFollowPath(path){
    let count = 0;
    let walkInterval;
    walkInterval = setInterval(() => {
        if (count<path.length){
            playerX=path[count][0];
            playerY=path[count][1];
            count++;
        } else {
            clearInterval(walkInterval);
        }
    }, 200);
}

function getPathArea(x,y){
  var minX=9;
  var minY=9;
  var dispList=[]
  for (let i=y-minY;i<y+10;i++){
    let innerList=[]
    for (let j=x-minX;j<x+10;j++){
      innerList.push([i,j]);
    }
    dispList.push(innerList);
  }
  return dispList;
}

function dispListToByteArray(path, mobX, mobY){
  byteArray = [];
  for (i=path[0][0][0]; i<path[0][0][0]+20; i++){
    let tempList=[];
    for (j=path[0][0][1]; j<path[0][0][1]+20; j++){
        if (tile_map[j][i].sprite.collision===true){
            tempList.push(1);
            continue;
        }
        let coll = false;
        for (obj in tile_map[j][i].objects){
            if (tile_map[j][i].objects[obj].collision===true){
                console.log("position in byte array has collision because of object");
                tempList.push(1);
                coll = true;
                break;
            }
        }
        if (coll){
            continue;
        }
        //if here, no collision
        tempList.push(0);
    }
    byteArray.push(tempList);
  }
  console.log(byteArray);
  return byteArray;
}
