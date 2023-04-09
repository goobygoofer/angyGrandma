//debug stuffsT
function deathScreen(){
  ctx.fillStyle='black';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  //working on this
}

var master_collision = false
function toggleCollision(){
  if (master_collision===false){
    master_collision=true;
  } else {
    master_collision=false;
  }
}
var raining = false;
function toggleRain(){
  if (raining===true){
    raining=false;
    playRain();//confusing yea, but it's more like toggle rain...
  } else{
    raining=true;
    playRain();
  }
}

var showStats = true;
function toggleStats(){
  if (showStats===true){
    showStats=false;
  } else{
    showStats=true;
  }
}

var bigMap = false;
var DRAWSIZE = 16;
function toggleMap(){
  if (bigMap===true){
    BLOCKSIZE = 16;
    DRAWSIZE = 16;
    bigMap=false;
  } else{
    BLOCKSIZE = 3;
    DRAWSIZE = 3;
    bigMap=true;
  }
}

function drawStats(){
  if (!showStats){return;};
  ctx.fillStyle="white";
  ctx.fillText("health: " + player.skills['health']['health'], 0,240);
  ctx.fillText("walking xp: " + player.skills.walking.xp + "(" + Math.floor(player.skills.walking.lvl) + ")", 0,250);
  ctx.fillText("strength xp: " + player.skills.strength.xp + "(" + player.skills.strength.lvl + ")", 0, 260);
}

var game_object_ids = [];
var game_objects = [];//maybe npc and object ids all go in game_obj_ids, but npcs and game_objects still separate? idk
function mapSign(){
  this.spriteData = JSON.parse(JSON.stringify(gameObjects['mapsign']));
  this.spriteData.id=generateID();
  game_object_ids.push(this.spriteData.id);
  this.playerInteract=function(){
    toggleMap();
  }
}//the fact that any map sprite you place works is probably going to be a bug later on... heheh
game_objects.push(new mapSign());
//sound stuff//////////////////////////////////////////////////////////////////////////

const hit_sound = new Audio('hit.mp3');
const skele_die_sound = new Audio('skele_die.mp3');
const rain_sound = new Audio('rain.mp3');
rain_sound.loop=true;
rain_sound.addEventListener('timeupdate', () => {
  if (rain_sound.currentTime>=20 && rain_sound.currentTime<=21){
    //trigger lightning
    console.log("lightning!");
    ctx.fillStyle='rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0,0,canvas.width, canvas.height);
  }
});

function playRain(){
  if (raining){
    rain_sound.curentTime = 0;
    rain_sound.play();
  } else {
    rain_sound.pause();
  }
}
//end sound stuff//////////////////////////////////////////////////////////////////////

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
  tile_map=JSON.parse(myData);//otherwise tile_map is just default from file
  myData=null;//otherwise you've got 2 tile maps? 
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
let timerId;
var delay = 30; // delay time in milliseconds

document.addEventListener('keydown', (event) => {
  if (event.target.nodeName==='SELECT') {
    return;
  }
  if (timerId) {
    clearTimeout(timerId);
  }
  timerId = setTimeout(() => {
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
    }
  }, delay);
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
document.getElementById('statsButton').addEventListener('click', () => toggleStats());

function isTopLeftClicked(event, canvas){
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return x < 25 && y < 25;
}

canvas.addEventListener('click', event => {
  if (isTopLeftClicked(event, canvas)){
    if (bigMap){
      toggleMap();
    }
    console.log("clicked top left corner");
  }
});

canvas.addEventListener('touchend', event => {
  if (isTopLeftClicked(event.touches[0], canvas)){
    if (bigMap){
      toggleMap();
    }
    console.log("user touched top left corner");
  }
});

const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', (event) => {
  //saveToLocal();
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    const fileContents = event.target.result;
    localStorage.setItem('userMap', fileContents);
    tile_map=localStorage['userMap'];
    console.log(localStorage['userMap'])
    alert('file uploaded to local storage! page should refresh...');
  }
  reader.readAsText(file);
  //saveToLocal();
  location.reload();
});

function downloadArrayAsJSFile(array, filename){
  const jsonString=JSON.stringify(array, null, 2);
  const plainText = jsonString.replaceAll('\\','').slice(1,-1);
  const blob = new Blob([plainText], {type: 'application/javascript'});
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href=url;
  downloadLink.download=`${filename}.js`;
  downloadLink.click();
  URL.revokeObjectURL(url);
}

const downloadButton = document.getElementById('download-button');
downloadButton.addEventListener('click', () => {
  downloadArrayAsJSFile(localStorage['userMap'], "my_map");
})
//end UI setup//////////////////////////////////////////////////////////////////////////////////////

//set up ghost player///////////////////////////////////////////////////////////////////////////////
function Player(){
  this.skills = {
    "walking":{"xp":0,"lvl":1},
    "strength":{"xp":0,"lvl":1},
    "health":{"xp":0,"health":100,"max":100, "lvl":1},
    "playerLvl":1
  };
  this.update = function(){
    if (this.skills.health['health']<=0){
      this.skills.health['health']=this.skills.health.max;
      localStorage['playerStats']=JSON.stringify(this.skills);
      deathScreen();
      setTimeout(location.reload(),3000);
    }
    for (skill in this.skills){
      if (skill!=='health'){
        this.checkLevelUp(this.skills[skill]);
      } else {
        this.checkLevelUp(this.skills['health'], true);
        }
      }
    }
  this.inventory = [];
  this.incrementSkill = function(skill, amount){
    this.skills[skill].xp+=amount;
    localStorage['playerStats']=JSON.stringify(this.skills);
    //then check if skill leveled up
  }
  this.checkLevelUp = function (skill, hp=false){
    let xpNeeded = Math.floor(100*Math.pow(1.25, skill.lvl));

    if (skill.xp >= xpNeeded){
      if (!hp){
        skill.lvl++;
        skill.xp = skill.xp - xpNeeded;
      } else {
        skill.xp=0;//skill.xp-xpNeeded;
        skill.lvl++;
        skill.health+=10;
        skill.max+=10;
      }
    }
  }
  this.attack = function(target){
    target.getAttacked(this.skills.strength.lvl);
    hit_sound.play();
  }
  this.getAttacked = function(damage){
    this.skills.health['health']-=damage;
    localStorage['playerStats']=JSON.stringify(this.skills);
    //play player hit sound here
    hit_sound.play();
  }
}

let player = new Player();

player.skills.health['health']=player.skills.health.max;
var playerX = 15;
var playerY = 15;
var playerLoc = localStorage.getItem("playerLoc");
if (playerLoc!==null){
  playerLoc=JSON.parse(playerLoc);
  playerX=playerLoc[0];
  playerY=playerLoc[1];
} else {
  playerX=15;
  playerY=15;
}

//get user stats from local storage
var playerStats = localStorage.getItem("playerStats");
if (playerStats!==null){
  player.skills=JSON.parse(playerStats);
  playerStats=null;
}

ghostR = [48,80];//ghost facing right coords
ghostL = [64,96];//ghost facing left coords
ghostFacing='rt';

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
function interactNPC(nextX, nextY){
  for (object in tile_map[nextX][nextY].objects){
    if (tile_map[nextX][nextY].objects[object].type=="npc"){
      targetNPC=getNpcById(tile_map[nextX][nextY].objects);
      targetNPC=targetNPC[0].id;
      targetNPC=filterNpcById(npcs, targetNPC)[0];
      if (targetNPC.spriteData.attackable===true){
        player.attack(targetNPC);//hmmm?
        //return? also should probably make interactObject not run so return false
      }
    }
  }
}

function interactObject(nextX, nextY){
  for (object in tile_map[nextX][nextY].objects){
    if (tile_map[nextX][nextY].objects[object].type==="object"){
      let npcid = tile_map[nextX][nextY].objects[object].id//[0].id;
      targetNPC=filterObjById(game_objects, npcid)[0];
      if (hasFunction(targetNPC, "playerInteract")){
        targetNPC.playerInteract();
      }
    }
  }

}

function interactNext(nextX, nextY){
  if (master_collision===true){
    return false
  }
  //check for hostile npcs on next tile
  interactNPC(nextX, nextY);//maybe do this way so there is hierarchy of interaction?
  interactObject(nextX, nextY);
  check_collision=checkCollision(nextX, nextY);
  return check_collision;
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
  if (collision===true){return;};
  if (potentialX!==playerX || potentialY!==playerY){
    player.incrementSkill("walking", 1);
  }
  playerX=potentialX;
  playerY=potentialY;
  localStorage.setItem("playerLoc", JSON.stringify([playerX, playerY]))
}

drawPlayer = function(){
    if (ghostFacing=="rt"){ghostLoc = ghostR}
    else {ghostLoc = ghostL};
    if (playerX>10){drawPointX=10} else{drawPointX=playerX}
    if (playerY>10){drawPointY=10} else{drawPointY=playerY}
    ctx.drawImage(spriteSheet, ghostLoc[0],ghostLoc[1], 16,16,
        drawPointX*BLOCKSIZE-BLOCKSIZE, drawPointY*BLOCKSIZE-BLOCKSIZE, 16,16);
}

var objectToPlace=gameObjects['rock'];

function placeTile (objToPlace){
  if (objToPlace.type==='object'){
    tile_map[playerX][playerY].objects.push(objectToPlace);
  }
  if (objToPlace.type==='base-tile'){
    tile_map[playerX][playerY]['sprite']=objectToPlace;
  }
  //saveToLocal();//uncomment to save every time you place a tile
}

function resetTile(){
  tile_map[playerX][playerY]['objects']=[];
  tile_map[playerX][playerY]['sprite']=gameObjects['grass'];
}

//end player setup///////////////////////////////////////////////////////////////////////////////////////////////////////

//utility functions//////////////////////////////////////////////////////////////////////////////////////////////////////

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

//pretty obvious function. works for player and npcs (so far)
function checkCollision(nextX, nextY){
  for (object in tile_map[nextX][nextY]['objects']){
    if (tile_map[nextX][nextY]['objects'][object]['collision']===true){
      return true
    }
  }
  if (tile_map[nextX][nextY]['sprite']['collision']===true){
    let collide_override=false;
    for (object in tile_map[nextX][nextY]['objects']){
      if (tile_map[nextX][nextY]['objects'][object].hasOwnProperty("coll_override")===true){
        if (tile_map[nextX][nextY]['objects'][object]['coll_override']===true){
          collide_override = true;
        }
      }
    }
    if (collide_override===true){
      return false;
    } else{
      return true;
    }
  } 
}

function countObjectsByPropertyValue(list, property, value){
  let count=0;
  for (let i = 0; i< list.length; i++){
    if (list[i][property]===value){
      count++;
    }
  }
  return count;
}

//holy sweet jesus christ have to get rid of some of these...
function hasFunction(obj, functionName){
  return obj && obj.hasOwnProperty(functionName) && typeof obj[functionName] ==='function';
}

function filterObjById(arr, id){//returns list minus any object.id = id  //
  return arr.filter(obj => !obj.hasOwnProperty('id') && obj.id !==id);
}

function getNpcById(arr, id){//does opposite of filterObjById, returns only npc with id
  return arr.filter(obj => obj.hasOwnProperty('id') && obj.id!==id);
}

function filterNpcById(arr, id){
  return arr.filter(obj => obj.hasOwnProperty('id') && obj.id===id);
}

function filterObjByKeyVal(arr, key, val){//returns list minus all objects with key that equals val
  return arr.filter(obj => obj.hasOwnProperty(key) && obj[key] !== val);
}

function removeItemById(list, id){
  return list.filter(item => item.id !== id);
}

function isObjectInList(list, npcid){
  for (let i=0;i<list.length;i++){
    if (list[i].id === npcid){
      return true
    }
  }
  return false;
}
//if you're wondering why the fuck all these are here, I am too XD
//end utility functions///////////////////////////////////////////////////////////////////////////////////////////////

//passive npc setup testing///////////////////////////////////////////////////////////////////////////////////////////
move_dir=["up","down","left","right"];

function moveNPC(curX,curY, definite=false){//for passive (non-aggressive/tracking) movement
  //calculate random move, return x,y
  let potentialX=null;
  let potentialY=null;
  let facing="right";
  if (!definite){
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
  } else {
    //definite move, npc tracking to player
    potentialX=curX;
    potentialY=curY;
  }
  //check potential tile for collision
  let collision = checkCollision(potentialX, potentialY);
  if (collision){return [curX, curY, facing]}
  else {
    return [potentialX, potentialY, facing];
  }
}

function removeNPC(id, x, y){
  tile_map[x][y].objects=filterObjById(tile_map[x][y].objects, id);
  npcs=removeItemById(npcs, id)
  //console.log("npcs list now: " + npcs)
}

function trackPlayer(ratX, ratY) {
  const adjacentSquares = [
    { x: ratX - 1, y: ratY },
    { x: ratX + 1, y: ratY },
    { x: ratX, y: ratY - 1 },
    { x: ratX, y: ratY + 1 }
  ];

  let closestDistance = Number.MAX_SAFE_INTEGER;
  let nextMove = null;

  for (const square of adjacentSquares) {
    const dx = Math.abs(square.x - playerX);
    const dy = Math.abs(square.y - playerY);
    const distance = dx + dy;

    if (distance < closestDistance) {
      closestDistance = distance;
      nextMove = square;
    }
  }

  return nextMove;
}



function distToPlayer(selfX, selfY){
  let dx = selfX - playerX;
  let dy = playerY - selfY;
  return Math.sqrt(dx * dx + dy * dy);
}

var npcs=[];//npc's in game, {"[id]":npc_object}
function Spider(){
  this.name="spider";
  this.hp = 5;
  this.strength = 2;
  this.spriteData=JSON.parse(JSON.stringify(gameObjects['spider']));
  this.spriteData.id=null;
  this.x=null;
  this.y=null;
  this.lastTime=Date.now();//timestamp
  this.delay = 1000;
  this.aggro = false;
  this.lastAggro=Date.now();
  this.aggroRange = 10;
  this.update = function(){
    if (this.x===playerX && this.y===playerY){
      player.getAttacked(this.strength);//need to change to random
    }
    if (this.hp<1){
      skele_die_sound.play();
      removeNPC(this.spriteData.id, this.x, this.y);
    }
    let now = Date.now();
    let restTime = Math.floor(Math.random()*this.delay);
    if (now > this.lastTime+restTime){
      this.lastTime=now;
      //check distance to player
      if (distToPlayer(this.x, this.y)<=this.aggroRange){
        this.aggro=true;
        this.lastAggro=Date.now();
      } else {
        if (this.aggro===true && Date.now()>this.lastAggro+3000){
          this.aggro=false;
        }
      }
      newCoords=null;
      if (!this.aggro){
        newCoords=moveNPC(this.x,this.y);//returns x,y
      } else {
        trackCoords = trackPlayer(this.x, this.y);
        newCoords=moveNPC(trackCoords.x, trackCoords.y, true);
      }
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
  this.getAttacked = function(damage){
    this.hp-=damage;
    player.incrementSkill("strength", 5);
    player.incrementSkill("health", 2);
  }
}

function Rat(){
  this.name="rat";
  this.hp = 3;//lel just testing
  this.strength = 3;
  this.spriteData=JSON.parse(JSON.stringify(gameObjects['rat']));
  this.spriteData.id=null;
  this.x=null;
  this.y=null;
  this.lastTime=Date.now();//timestamp
  this.delay = 2000;
  this.aggro = false;
  this.lastAggro=Date.now();
  this.strength = 2;
  this.update = function(){
    if (this.x===playerX && this.y===playerY){
      player.getAttacked(this.strength);//need to change to random
    }
    if (this.hp<1){
      skele_die_sound.play();
      removeNPC(this.spriteData.id, this.x, this.y);
    }
    let now = Date.now();
    let restTime = Math.floor(Math.random()*this.delay);
    if (now > this.lastTime+restTime){
      this.lastTime=now;
      //check distance to player
      if (distToPlayer(this.x, this.y)<=5){
        this.aggro=true;
        this.lastAggro=Date.now();
      } else {
        if (this.aggro===true && Date.now()>this.lastAggro+3000){
          this.aggro=false;
        }
      }
      newCoords=null;
      if (!this.aggro){
        newCoords=moveNPC(this.x,this.y);//returns x,y
      } else {
        trackCoords = trackPlayer(this.x, this.y);//this is broken lol
        newCoords=moveNPC(trackCoords.x, trackCoords.y, true);
      }
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
  this.getAttacked = function(damage){
    //receive attack from player
    this.hp-=damage;
    player.incrementSkill("strength", 3);
    player.incrementSkill("health", 1);
  }
}

function Skeleton(){
  this.name="skeleton";//its in spriteData but had to do it this way for some reason
  this.hp = 1;//lel just testing
  this.spriteData=JSON.parse(JSON.stringify(gameObjects['skeleton']));
  this.spriteData.id=null;
  this.x=null;
  this.y=null;
  this.lastTime=Date.now();//timestamp
  this.update = function(){
    if (this.hp<1){
      //skeleton dies
      //remove sprite from tile, remove npc from npcs
      skele_die_sound.play();
      removeNPC(this.spriteData.id, this.x, this.y);
    }
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
  this.getAttacked = function(damage){
    //receive attack from player
    this.hp-=damage;
    //player.skills.strength.xp+=1;
    player.incrementSkill("strength", 1);
    player.incrementSkill("health", 1);
  }
}

//id testing
function generateID(){//this is not best practice, just for testing. max of 1000 objects
  //returns id if not in list
  id_ok = false;
  let npcid=null;
  while (id_ok===false){//this has the potential to hang when too many objects
    npcid = Date.now()
    //console.log(npcid);
    let indexCheck = game_object_ids.indexOf(npcid) !== -1;
    if (indexCheck===false){
      return npcid;
    }
  }
}
game_ids=[0];//if id in list, regenerate, if id not in list add it, remove id from game_ids on object delete
setInterval(function(){
  if (countObjectsByPropertyValue(npcs, "name", "spider")<20){
      let newSpide = new Spider;//should work without changing newSkeles lol
      newSpide.spriteData.id=generateID();
      console.log(newSpide.spriteData.id);
      coords_ok=false;
      do {
        newSpide.x=Math.floor(Math.random()*80);
        newSpide.y=Math.floor(Math.random()*80);
        if (newSpide.x<=50){
          newSpide.x=51;
        }
        if (newSpide.y<=50){
          newSpide.y=51;
        }
        if (tile_map[newSpide.x][newSpide.y].sprite.collision===true){
          continue;
        }
        //if here just have to check for object collision now
        for (object in tile_map[newSpide.x][newSpide.y].objects){
          if (tile_map[newSpide.x][newSpide.y].objects[object].collision===true){
            continue;
          }
        }
        coords_ok=true;
      } while (coords_ok===false);
      game_ids.push(newSpide.spriteData.id)
      newSpide.id=newSpide.spriteData.id;
      npcs.push(newSpide);
      tile_map[newSpide.x][newSpide.y].objects.push(newSpide.spriteData);
  }
},2500);

//infinite skeletons for taylor. comment out for only 45 skeletons until refresh
setInterval(function(){
  if (countObjectsByPropertyValue(npcs, "name", "skeleton")<45){
      let newSkele = new Skeleton;
      newSkele.spriteData.id=generateID();
      console.log(newSkele.spriteData.id);
      coords_ok=false;
      do {
        newSkele.x=Math.floor(Math.random()*80);
        newSkele.y=Math.floor(Math.random()*80);
        if (newSkele.x<=10){
          newSkele.x=11;
        }
        if (newSkele.y<=10){
          newSkele.y=11;
        }
        if (tile_map[newSkele.x][newSkele.y].sprite.collision===true){
          continue;
        }
        //if here just have to check for object collision now
        for (object in tile_map[newSkele.x][newSkele.y].objects){
          if (tile_map[newSkele.x][newSkele.y].objects[object].collision===true){
            continue;
          }
        }
        coords_ok=true;
      } while (coords_ok===false);
      game_ids.push(newSkele.spriteData.id)
      newSkele.id=newSkele.spriteData.id;
      npcs.push(newSkele);
      tile_map[newSkele.x][newSkele.y].objects.push(newSkele.spriteData);
  }
},2000);


setInterval(function(){
  //check npcs list, generate more skeletons
  if (countObjectsByPropertyValue(npcs, "name", "rat")<45){
      let newRat = new Rat;
      newRat.spriteData.id=generateID();
      console.log(newRat.spriteData.id);
      coords_ok=false;
      do {
        newRat.x=Math.floor(Math.random()*80);
        newRat.y=Math.floor(Math.random()*80);
        if (newRat.x<=50){
          newRat.x=51;
        }
        if (newRat.y<=10){
          newRat.y=11;
        }
        if (tile_map[newRat.x][newRat.y].sprite.collision===true){
          continue;
        }
        //if here just have to check for object collision now
        for (object in tile_map[newRat.x][newRat.y].objects){
          if (tile_map[newRat.x][newRat.y].objects[object].collision===true){
            continue;
          }
        }
        coords_ok=true;
      } while (coords_ok===false);
      game_ids.push(newRat.spriteData.id)
      newRat.id=newRat.spriteData.id;
      npcs.push(newRat);
      tile_map[newRat.x][newRat.y].objects.push(newRat.spriteData);
  }
},4000);
//end npc testing/////////////////////////////////////////////////////////////////////////////////////////////////////

//main///////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
gradient.addColorStop(0,"transparent");
gradient.addColorStop(1, "DarkGray");

function drawBigMap(){
  //draw all tiles except 1/16 size? will have to see how it works out
  dispList=[]
  for (i=0;i<100;i++){
    innerList=[]
    for (j=0;j<100;j++){
      innerList.push([j,i]);
    }
    dispList.push(innerList);
  }
  return dispList;
}

function drawMap(disp_area){
  for (row in disp_area){
    //draw base sprite from that area of tile_map
    for (col in disp_area[row]){
      let sprtX=disp_area[row][col][0];
      let sprtY=disp_area[row][col][1];
      //console.log("[" + sprtX + ", " + sprtY + "]");
      let sprtLoc=gameObjects[tile_map[sprtX][sprtY]['sprite']['name']]['sprite']
      ctx.drawImage(spriteSheet, sprtLoc[0],sprtLoc[1], 16,16,
        col*BLOCKSIZE, row*BLOCKSIZE, DRAWSIZE,DRAWSIZE);
      //draw weather
      if (!bigMap){
        drawWeather(col*BLOCKSIZE,row*BLOCKSIZE);
      }
      //drawNPCs(disp_area);//function to draw npcs in player view
      if (tile_map[sprtX][sprtY]['objects'].length!=0){
        //check type.object (for now is only object or npc)
        for (object in tile_map[sprtX][sprtY]['objects']){
          //draw objects
          if (tile_map[sprtX][sprtY]['objects'][object].type==='object'){
            sprtLoc=tile_map[sprtX][sprtY]['objects'][object]['sprite']
            ctx.drawImage(spriteSheet, sprtLoc[0],sprtLoc[1], 16,16,
              col*BLOCKSIZE, row*BLOCKSIZE, DRAWSIZE,DRAWSIZE);
          }
          //draw npcs
          else if (tile_map[sprtX][sprtY]['objects'][object].type==='npc'){
            let npcid=tile_map[sprtX][sprtY]['objects'][object].id;
            if (isObjectInList(npcs, npcid)){
              let npcFacing=tile_map[sprtX][sprtY]['objects'][object].facing;
              sprtLoc=tile_map[sprtX][sprtY]['objects'][object]['sprite'][npcFacing];
              ctx.drawImage(spriteSheet, sprtLoc[0],sprtLoc[1], 16,16,
                col*BLOCKSIZE, row*BLOCKSIZE, DRAWSIZE,DRAWSIZE);
            } else {
              //remove the objectless sprite!
              delete tile_map[sprtX][sprtY]['objects'][object];
            }
            
          }
        }
      }
    }
    if (bigMap){
      //draw redX in top left corner
      ctx.drawImage(spriteSheet, gameObjects['redX'].sprite[0],gameObjects['redX'].sprite[1], 16,16, 
        0,0, 25,25)
      //draw player 'you are here' thingy
      ctx.drawImage(spriteSheet, gameObjects['redDownArrow'].sprite[0], gameObjects['redDownArrow'].sprite[1], 
        16, 16, playerX*3-3, playerY*3-3, 8,8)
    }
  }
  if (raining && !bigMap){//gray gradient that makes it look dark and cloudy!
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0, canvas.width, canvas.height);
  }
}

function updateNPCs(){
  //for npc in npcs, npcs[npc].update();
  for (npc in npcs){
    if (hasFunction(npcs[npc], 'update')){
      npcs[npc].update();
    }
  }
}

function update(){
  //game logic here
  ctx.clearRect(0,0,300,300);
  //uddate player
  updateNPCs();
  player.update();
  if (!bigMap){
    let disp_area=getDispArea();
    drawMap(disp_area);
    drawPlayer();
  } else {
    let disp_area=drawBigMap();
    drawMap(disp_area);
  }
  drawStats();
}

setInterval(update,100);//or update only when user moves or places a tile, need to add modes