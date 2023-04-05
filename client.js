//debug stuffs
var master_collision = false

//UI setup////////////////////////////////////////////////////////////////////////////
//main canvas element
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
//to display example tile next to dropdown menu
const sprtCanvas = document.getElementById('spriteCanvas');
const sprtCtx = sprtCanvas.getContext('2d');
//sprite sheet, 16px increments
const spriteSheet = new Image();
spriteSheet.src = 'spritesheet-0.5.18.png';
BLOCKSIZE=16;//maybe not need this or shorten var name

//get user previous map from local storage
var myData = localStorage.getItem("userMap");
if (myData!==null){
  tile_map=JSON.parse(myData);
}
//save map to local storage
function saveToLocal(){
  localStorage.setItem("userMap", JSON.stringify(tile_map))
}
//delete map from local storage
function clearUserMap (){
  delete localStorage['userMap'];
  console.log("refresh to clear, place another tile before refreshing to cancel")
}

//setup dropdown menu for base tiles
const dropdown = document.getElementById('tile-dropdown');
console.log(dropdown)

for (const key in gameObjects){//change to key in objects
  if (gameObjects.hasOwnProperty(key)){
    const option = document.createElement("option");
    option.text=key;// + " (" + gameObjects[key]['type'] + ")";
    dropdown.append(option)
  }
}

dropdown.addEventListener("change",function(){
  const selectedTile = this.value;
  console.log(selectedTile)
  objectToPlace=gameObjects[selectedTile];
  sprtCtx.clearRect(0,0,16,16);
  sprtCtx.drawImage(spriteSheet, baseTiles[selectedTile][0],baseTiles[selectedTile][1], 16,16,
    0, 0, 16,16);
})

// add arrow key listener for desktop users
document.addEventListener('keydown', (event) => {
  if (event.target.nodeName==='SELECT'){//probably unnecessary, added because of element focus issues
    return;
  }
  //event.preventDefault(); //where did we put this that it had some desired effect? lel
  switch (event.key) {
    case ' ':
      placeTile(objectToPlace);
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
//convenient buttons for mouse or mobile
document.getElementById('upButton').addEventListener('click', () => movePlayer('up'));
document.getElementById('leftButton').addEventListener('click', () => movePlayer('left'));
document.getElementById('downButton').addEventListener('click', () => movePlayer('down'));
document.getElementById('rightButton').addEventListener('click', () => movePlayer('right'));
document.getElementById('placeButton').addEventListener('click', () => placeTile(objectToPlace));
//end UI setup//////////////////////////////////////////////////////////////////////////////////////

//set up ghost player///////////////////////////////////////////////////////////////////////////////
ghostR = [48,80];//ghost facing right coords
ghostL = [64,96];//ghost facing left coords
ghostFacing='rt';

var playerX=15;//position on map
var playerY=15;

//returns array of -20 to +20 from playerX,playerY
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
  dispList=[]
  for (i=minY;i<minY+19;i++){
    innerList=[]
    for (j=minX;j<minX+19;j++){
      innerList.push([j,i]);
    }
    dispList.push(innerList);
  }
  return dispList;
}
//player interact with next tile
function interactNext(nextX, nextY){
  if (master_collision===true){
    return false
  }
  if (tile_map[nextX][nextY]['sprite']['collision']===true){
    return true
  } else {
    //check objects on tile for collision
    if (tile_map[nextX][nextY]['objects'].length===0){
      return false
    }
    for (object in tile_map[nextX][nextY]['objects']){
      if (tile_map[nextX][nextY]['objects'][object]['collision']===true){
        return true
      }
    }
  }
}
//instead check players next potential tile in tile_map
function movePlayer(direction) {
  let potentialX=playerX;
  let potentialY=playerY;
  if (direction === 'up') {//check y-1
    if (playerY-1>10){
      potentialY=playerY-1;
    }
  }
  if (direction === 'down') {//check y+1
    if (playerY+1<90){
      potentialY=playerY+1;
    }
  }
  if (direction === 'left') {//check x-1
    if (playerX-1>10){
      potentialX=playerX-1;
    }
    ghostFacing='lt';
  }
  if (direction === 'right') {//check x+1
    
    if (playerX+1<90){
      potentialX=playerX+1;
    }
    ghostFacing='rt';
  }
  let collision=interactNext(potentialX, potentialY);//player interacts with objects on potential tile, returns true if collide
  if (collision===true){return};
  playerX=potentialX;
  playerY=potentialY;
}

drawPlayer = function(){
    if (ghostFacing=="rt"){ghostLoc = ghostR}
    else {ghostLoc = ghostL};
    if (playerX>10){drawPointX=10} else{drawPointX=playerX}
    if (playerY>10){drawPointY=10} else{drawPointY=playerY}
    ctx.drawImage(spriteSheet, ghostLoc[0],ghostLoc[1], 16,16,
        drawPointX*BLOCKSIZE-BLOCKSIZE, drawPointY*BLOCKSIZE-BLOCKSIZE, 16,16);
}

objectToPlace=gameObjects['rock'];

function placeTile (objToPlace){
  if (objToPlace.type==='object'){
    tile_map[playerX][playerY].objects.push(objectToPlace);
  }
  if (objToPlace.type==='base-tile'){
    tile_map[playerX][playerY]['sprite']=objectToPlace;
  }
  saveToLocal();
}

//end player setup////////////////////////////////////////////////////////////////////

//main
function drawMap(disp_area){
  for (row in disp_area){
    //draw base sprite from that area of tile_map
    for (col in disp_area[row]){
      let sprtX=disp_area[row][col][0];
      let sprtY=disp_area[row][col][1];
      let sprtLoc=gameObjects[tile_map[sprtX][sprtY]['sprite']['name']]['sprite']
      ctx.drawImage(spriteSheet, sprtLoc[0],sprtLoc[1], 16,16,
        col*BLOCKSIZE, row*BLOCKSIZE, 16,16);
      //for objects on current tile, draw them in logical order
      if (tile_map[sprtX][sprtY]['objects'].length!=0){
        for (object in tile_map[sprtX][sprtY]['objects']){
          sprtLoc=tile_map[sprtX][sprtY]['objects'][object]['sprite']
          ctx.drawImage(spriteSheet, sprtLoc[0],sprtLoc[1], 16,16,
            col*BLOCKSIZE, row*BLOCKSIZE, 16,16);
        }
      }
    }
  }  
}

function update(){
  //game logic here
  ctx.clearRect(0,0,300,300);
  let disp_area=getDispArea();
  drawMap(disp_area);
  drawPlayer();//or draw player as object of tile they are on?
}

setInterval(update,100);//or update only when user moves or places a tile, need to add modes