const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const spriteSheet = new Image();
spriteSheet.src = 'spritesheet-0.5.18.png';

BLOCKSIZE=16;

baseTiles = {
  "default":[0,0],
  "tree":[16,0],
  "rock":[176,0],
  "water":[0,48],
  "flower":[16,48]
}

//set up ghost player
ghostR = [48,80];//ghost facing right coords
ghostL = [64,96];//ghost facing left coords
ghostFacing='rt';

var playerX=15;//position on map. view grid will be 20x20, 320px by 320 px, each tile drawn 16x16
var playerY=15;

function getDispArea(){
  if (playerX<=9){
    minX=9;
  } else{
    minX=playerX-9
  }
  if (playerY<=9){
    minY=9;
  } else{
    minY=playerY-9;
  }
  //iterate minX and minY coords by 20
  //list of tile_map[x][y] to be draw returned [[x,y],[x,y],[x,y]...]
  dispList=[]//to be returned
  for (i=minY;i<minY+19;i++){
    innerList=[]
    for (j=minX;j<minX+19;j++){
      innerList.push([j,i]);
    }
    dispList.push(innerList);
  }
  //console.log(dispList);
  return dispList;
}



//instead check players next potential tile in tile_map
function movePlayer(direction) {
  // move player up
  if (direction === 'up') {
    //check y-1
    if (playerY-1>10){//&& no collision on possible next square...
      playerY-=1;
    }
  }
  // move player down
  if (direction === 'down') {
    //check y+1
    if (playerY+1<40){//&& no collision...
      playerY+=1;
    }
  }
  // move player left
  if (direction === 'left') {
    //check x-1
    if (playerX-1>10){//&& no collision
      playerX-=1;
    }
    ghostFacing='lt';
  }
  // move player right
  if (direction === 'right') {
    //check x+1
    if (playerX+1<90){//&& no collision
      playerX+=1;
    }
    ghostFacing='rt';
  }
}
//


drawPlayer = function(direction){
    if (direction=="rt"){ghostLoc = ghostR}
    else {ghostLoc = ghostL};
    if (playerX>10){drawPointX=10} else{drawPointX=playerX}
    if (playerY>10){drawPointY=10} else{drawPointY=playerY}
    ctx.drawImage(spriteSheet, ghostLoc[0],ghostLoc[1], 16,16,
        drawPointX*BLOCKSIZE-BLOCKSIZE, drawPointY*BLOCKSIZE-BLOCKSIZE, 16,16);
}

objectToPlace='rock'

// add arrow key listener for desktop users
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case ' ':
      tile_map[playerX][playerY].objects.push(objectToPlace);
      break;
    case 'ArrowUp':
      movePlayer('up');
      break;
    case 'ArrowDown':
      movePlayer('down');
      break;
    case 'ArrowLeft':
      movePlayer('left');
      break;
    case 'ArrowRight':
      movePlayer('right');
      break;
    default:
      break;
  }; 
});

function update(){
  ctx.clearRect(0,0,300,300);
  let disp_area=getDispArea();
  //for coord in disp_area, draw corresponding tile from tile_map
  for (row in disp_area){
    //draw base sprite from that area of tile_map
    for (col in disp_area[row]){
      let sprtX=disp_area[row][col][0];
      let sprtY=disp_area[row][col][1];
      let sprtLoc=baseTiles[tile_map[sprtX][sprtY]['sprite']]
      ctx.drawImage(spriteSheet, sprtLoc[0],sprtLoc[1], 16,16,
        col*BLOCKSIZE, row*BLOCKSIZE, 16,16);
      //for objects on current tile, draw them in logical order
      for (object in tile_map[sprtX][sprtY]['objects']){
        sprtLoc=baseTiles[tile_map[sprtX][sprtY]['objects'][object]]
        ctx.drawImage(spriteSheet, sprtLoc[0],sprtLoc[1], 16,16,
          col*BLOCKSIZE, row*BLOCKSIZE, 16,16);
      }
    }
  }
  //then draw player
  drawPlayer(ghostFacing);
}

//change fxn in this setInterval to update() type fxn
setInterval(update,100);