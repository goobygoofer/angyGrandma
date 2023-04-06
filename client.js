//debug stuffs
var master_collision = false
function toggleCollision(){
  if (master_collision===false){
    master_collision=true;
  } else {
    master_collision=false;
  }
}
var raining = true;
function toggleRain(){
  if (raining===true){
    raining=false;
  } else{
    raining=true;
  }
}

//UI setup////////////////////////////////////////////////////////////////////////////
//main canvas element
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
//ctx.globalAlpha=0.5;
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
function saveToLocal(){//now only runs if player clicks button
  for (row in tile_map){
    for (col in tile_map[row]){
      tile_map[row][col].objects=filterObjByKeyVal(tile_map[row][col].objects, "type", "npc");
    }
  }
  localStorage.setItem("userMap", JSON.stringify(tile_map))
}
//delete map from local storage
function clearUserMap (){
  delete localStorage['userMap'];
  console.log("refresh to clear, place another tile before refreshing to cancel")
}

//setup dropdown menu for base tiles
const dropdown = document.getElementById('tile-dropdown');
//console.log(dropdown)

for (const key in gameObjects){//change to key in objects
  if (gameObjects.hasOwnProperty(key)){
    const option = document.createElement("option");
    option.text=key;// + " (" + gameObjects[key]['type'] + ")";
    dropdown.append(option)
  }
}

dropdown.addEventListener("change",function(){
  const selectedTile = this.value;
  //console.log(selectedTile)
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
document.getElementById('resetButton').addEventListener('click', () => clearUserMap());
document.getElementById('saveButton').addEventListener('click', () => saveToLocal());
document.getElementById('resetTileButton').addEventListener('click', () => resetTile());
document.getElementById('collisionButton').addEventListener('click', () => toggleCollision());
document.getElementById('rainButton').addEventListener('click', () => toggleRain());
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
  check_collision=checkCollision(nextX, nextY);
  return check_collision;
}

function checkCollision(nextX, nextY){
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
  //saveToLocal();//make button for this
}

function resetTile(){
  tile_map[playerX][playerY]['objects']=[];
  tile_map[playerX][playerY]['sprite']=gameObjects['grass'];
}

//end player setup////////////////////////////////////////////////////////////////////

//passive npc setup testing
move_dir=["up","down","left","right"];

function moveNPC(curX,curY){//for passive (non-aggressive/tracking) movement
  //calculate random move, return x,y
  let potentialX=null;
  let potentialY=null;
  let facing=null;
  moveDir = move_dir[Math.floor(Math.random() * 4)];
  if (moveDir==='up'){potentialX=curX-1;potentialY=curY;};
  if (moveDir==='down'){potentialX=curX+1;potentialY=curY;};
  if (moveDir==='left'){
    potentialX=curX;potentialY=curY-1;
    facing="left";
  };
  if (moveDir==='right'){
    potentialX=curX;potentialY=curY+1;
    facing="right";
  };
  //check potential tile for collision
  let collision = checkCollision(potentialX, potentialY);
  if (collision){return [curX, curY, facing]}
  else {
    return [potentialX, potentialY, facing];
  }
}

function filterObjById(arr, id){//returns list with id del'd
  return arr.filter(obj => !obj.hasOwnProperty('id') && obj.id !==id);
}

function filterObjByKeyVal(arr, key, val){
  return arr.filter(obj => obj.hasOwnProperty(key) && obj[key] !== val);
}

var npcs=[];//npc's in game, {"[id]":npc_object}
function Skeleton(){
  //going to need id eventually?
  this.spriteData=JSON.parse(JSON.stringify(gameObjects['skeleton']));
  this.spriteData.id=null;
  this.x=null;//don't need these because in spriteData?
  this.y=null;
  this.lastTime=Date.now();//timestamp
  this.update = function(){
    let now = Date.now();
    let restTime = Math.floor(Math.random()*3000)
    if (now > this.lastTime+restTime){
      this.lastTime=now;
      let newCoords=moveNPC(this.x,this.y);//returns x,y
      //remove self from current tile
      if (newCoords[2]!==null){
        this.spriteData.facing=newCoords[2];
      }
      tile_map[this.x][this.y].objects = filterObjById(tile_map[this.x][this.y].objects, this.spriteData.id);
      this.x=newCoords[0];
      this.y=newCoords[1];
      //add self to new tile
      tile_map[this.x][this.y].objects.push(this.spriteData)
    }
  }
}

//generate npcs
for (i=0;i<100;i++){
  npcs.push(new Skeleton);
}
//id testing
game_ids=[0];//if id in list, regenerate, if id not in list add it, remove id from game_ids on object delete
for (npc in npcs){
  id_ok = false;
  let npcid=null;
  while (id_ok==false){
    npcid = Math.floor(Math.random()*1000);
    console.log(npcid);
    let indexCheck = game_ids.indexOf(npcid) !== -1;
    if (indexCheck===true){
      game_ids.push(npcid);
      id_ok=true;
    }
  }
  npcs[npc].x=Math.floor(Math.random()*80);
  npcs[npc].y=Math.floor(Math.random()*80);
  if (npcs[npc].x<=10){
    npcs[npc].x=11;
  }
  if (npcs[npc].y<=10){
    npcs[npc].y=11;
  }
  tile_map[npcs[npc].x][npcs[npc].y].objects.push(npcs[npc].spriteData);
}


//main
function drawWeather(x,y){
  //for now just draw rain on random tiles
  if (raining===true){
    let randomInt = Math.random();
    if (randomInt>=0.9){
      ctx.drawImage(spriteSheet, gameObjects['rain']['sprite'][0],gameObjects['rain']['sprite'][1], 16,16, 
        x,y, 16,16)
    }
  }
}

const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 10, canvas.width/2, canvas.height/2, canvas.width/1.5);
gradient.addColorStop(0, "transparent");
gradient.addColorStop(1, "gray");

function drawMap(disp_area){
  for (row in disp_area){
    //draw base sprite from that area of tile_map
    for (col in disp_area[row]){
      let sprtX=disp_area[row][col][0];
      let sprtY=disp_area[row][col][1];
      let sprtLoc=gameObjects[tile_map[sprtX][sprtY]['sprite']['name']]['sprite']
      ctx.drawImage(spriteSheet, sprtLoc[0],sprtLoc[1], 16,16,
        col*BLOCKSIZE, row*BLOCKSIZE, 16,16);
      //draw weather
      drawWeather(col*BLOCKSIZE,row*BLOCKSIZE);
      //drawNPCs(disp_area);//function to draw npcs in player view
      if (tile_map[sprtX][sprtY]['objects'].length!=0){
        //check type.object (for now is only object or npc)
        for (object in tile_map[sprtX][sprtY]['objects']){
          //draw objects
          if (tile_map[sprtX][sprtY]['objects'][object].type==='object'){
            sprtLoc=tile_map[sprtX][sprtY]['objects'][object]['sprite']
            ctx.drawImage(spriteSheet, sprtLoc[0],sprtLoc[1], 16,16,
              col*BLOCKSIZE, row*BLOCKSIZE, 16,16);
          }
          //draw npcs
          else if (tile_map[sprtX][sprtY]['objects'][object].type==='npc'){
            let npcFacing=tile_map[sprtX][sprtY]['objects'][object].facing;
            sprtLoc=tile_map[sprtX][sprtY]['objects'][object]['sprite'][npcFacing];
            ctx.drawImage(spriteSheet, sprtLoc[0],sprtLoc[1], 16,16,
              col*BLOCKSIZE, row*BLOCKSIZE, 16,16);
          }
        }
      }
    }
  }
  if (raining){//gray gradient that makes it look dark and cloudy!
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0, canvas.width, canvas.height);
  }
}

function updateNPCs(){
  //for npc in npcs, npcs[npc].update();
  for (npc in npcs){
    npcs[npc].update();
  }
}

function update(){
  //game logic here
  ctx.clearRect(0,0,300,300);
  let disp_area=getDispArea();
  //uddate player
  updateNPCs();
  drawMap(disp_area);
  drawPlayer();//or draw player as object of tile they are on?
}

setInterval(update,100);//or update only when user moves or places a tile, need to add modes