const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sprtCanvas = document.getElementById('spriteCanvas');
const sprtCtx = sprtCanvas.getContext('2d');
const spriteSheet = new Image();
spriteSheet.src = 'spritesheet-0.5.18.png';



BLOCKSIZE=16;

baseTiles = {
  "default":[0,0],//plain, green grass
  "snow":[208,528],
  "tree":[16,0],
  "oak":[128,1104],
  "deadtree":[48,464],
  "snowtree":[176,544],
  "rock":[176,0],
  "water":[0,48],
  "flower1":[16,48],
  "flower2":[64,48],
  "flower3":[112,48],
  "mushroom":[80,256],
  //paths
  "pathHORIZ":[176,64],
  "pathVERT":[192,64],
  "pathTDWN":[208,64],
  "pathTUP":[224,64],
  "pathTRT":[240,64],
  "pathTLT":[256,64],
  "pathCRS":[272,64],
  "pathCRV1":[288,64],
  "pathCRV2":[304,64],
  "pathCRV3":[288,80],
  "pathCRV4":[304,80],
  //stuff
  "grave":[32,160],
  "stoneblock":[288,0],
  "woodblock":[304,0],
  "stump1":[192,448],
  "stump2":[64,1120],
  "stump3":[80,1120],
  "campfire":[32,384],

}

const dropdown = document.getElementById('tile-dropdown');
console.log(dropdown)

for (const key in baseTiles){
  if (baseTiles.hasOwnProperty(key)){
    const option = document.createElement("option");
    option.text=key;
    console.log(dropdown)
    dropdown.append(option)
  }
}

dropdown.addEventListener("change",function(){
  const selectedTile = this.value;
  //console.log(selectedTile);
  objectToPlace=selectedTile;
  sprtCtx.clearRect(0,0,16,16);
  sprtCtx.drawImage(spriteSheet, baseTiles[selectedTile][0],baseTiles[selectedTile][1], 16,16,
    0, 0, 16,16);
})

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

function placeTile (){
  tile_map[playerX][playerY].objects.push(objectToPlace);
}

// add arrow key listener for desktop users
document.addEventListener('keydown', (event) => {
  if (event.target.nodeName==='SELECT'){
    return;
  }
  switch (event.key) {
    case ' ':
      placeTile();
      break;
    case 'ArrowUp':
    case 'w':
      movePlayer('up');
      break;
    case 'ArrowDown':
    case 's':
      movePlayer('down');
      break;
    case 'ArrowLeft':
    case 'a':
      movePlayer('left');
      break;
    case 'ArrowRight':
    case 'd':
      movePlayer('right');
      break;
    default:
      break;
  }; 
});

up_button=document.getElementById('upButton');
up_button.addEventListener('click', () => movePlayer('up'));
document.getElementById('leftButton').addEventListener('click', () => movePlayer('left'));
document.getElementById('downButton').addEventListener('click', () => movePlayer('down'));
document.getElementById('rightButton').addEventListener('click', () => movePlayer('right'));
document.getElementById('placeButton').addEventListener('click', () => placeTile());

//document.getElementById('upButton').addEventListener('touchstart', () => {up_button.click();});
//document.getElementById('leftButton').addEventListener('touchstart', () => movePlayer('left'));
//document.getElementById('downButton').addEventListener('touchstart', () => movePlayer('down'));
//document.getElementById('rightButton').addEventListener('touchstart', () => movePlayer('right'));
//document.getElementById('placeButton').addEventListener('touchstart', () => placeTile());

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