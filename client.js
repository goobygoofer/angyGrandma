"use strict";
//useful global variables for stuff we don't need to type over and over


//
let tileMapSector = localStorage.getItem("tileMapSector");
switch (tileMapSector){
  case "main":
    const script1 = document.createElement("script");
    script1.src="./map_2.js";
    script1.type="text/javascript";
    script1.onload = mapLoaded;
    document.body.appendChild(script1);
    break;
  case "dungeon_1":
    const script2 = document.createElement("script");
    script2.src="./dungeon_1.js";
    script2.type="text/javascript";
    script2.onload = mapLoaded;
    document.body.appendChild(script2);
    break;
  default:
    const script3 = document.createElement("script");
    script3.src="./map_2.js";
    script3.type="text/javascript";
    script3.onload = mapLoaded;
    document.body.appendChild(script3);
    localStorage.setItem("tileMapSector", "main");
    break;
}
//debug stuffs
function mute(){
  if (muteSound===true){
    muteSound=false;
  } else {
    muteSound=true;
  }
}

let death = false;
function deathScreen(){
  death = true;
  ctx.fillStyle='rgb(255,0,0,0.1)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='rgb(0,0,0,0.5)';
  ctx.font = '24px Arial';
  ctx.fillText("GAME OVER", 75,150)
  ctx.font = '10px Arial';
  ctx.fillText("(you were ejected from the valley)", 75, 175);

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
var BLOCKSIZE = 16;
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
  if (!showStats){
    ctx.drawImage(spriteSheet, baseTiles['statDisp'][0], baseTiles['statDisp'][1], 16,16, 0,225, 25,25);
  } else {
    ctx.fillStyle="rgba(139, 69, 19, 0.5)";
    ctx.font = '10px Arial';
    ctx.fillRect(0, 225, 125, 55);
    ctx.drawImage(spriteSheet, baseTiles['redX'][0], baseTiles['redX'][1], 16,16, 0,225, 16,16);
    ctx.fillStyle="white";
    ctx.fillText("health       : " + player.skills['health']['health'] + "/" + player.skills.health.max, 25,240);
    ctx.fillText("walking xp   : " + player.skills.walking.xp + "(" + Math.floor(player.skills.walking.lvl) + ")", 25,250);
    ctx.fillText("strength xp  : " + player.skills.strength.xp + "(" + player.skills.strength.lvl + ")", 25, 260);
    ctx.fillText("woodcuting xp:" + player.skills.woodcutting.xp + "(" + player.skills.woodcutting.lvl + ")", 25, 270);
  }
  //draw hp bar:
  ctx.fillStyle="rgba(255,0,0,0.5)";
  ctx.fillRect(10,280, 115, 5);
  ctx.fillStyle="rgba(0,255,100,1)"
  let greenBar = (player.skills.health.health/player.skills.health.max) * 115;
  ctx.fillRect(10,280, greenBar, 5)
  ctx.drawImage(spriteSheet, baseTiles['hpIcon'][0], baseTiles['hpIcon'][1], 16, 16,
    0,270, 25, 25);
}

//interactable objects////////////////////////////////////////////////////////////////////////////////////////////////
//except for map, this is way too messy and broken for life rn, shelve until pruned////////////////////////HEY ASSHOLE
var game_object_ids = [];
var game_objects = [];//maybe npc and object ids all go in game_obj_ids, but npcs and game_objects still separate? idk
function dungeonStairs(x, y, switchTo=[]){
  this.spriteData = JSON.parse(JSON.stringify(gameObjects['dungeonStairs']));
  this.spriteData.id=generateID();
  game_object_ids.push(this.spriteData.id);
  tile_map[x][y].objects.push(this.spriteData);
  this.playerInteract=function(){
    //change localStorage item to a different map and reload page with that map (from repository)
    //saveToLocal before reloading

    let currentSector = localStorage.getItem("tileMapSector");
    if (currentSector==="main"){
      localStorage.setItem("tileMapSector", "dungeon_1");
    } else {
      localStorage.setItem("tileMapSector", "main");
    }
    location.reload();
  }
}
function mapSign(x, y){
  this.spriteData = JSON.parse(JSON.stringify(gameObjects['mapsign']));
  this.spriteData.id=generateID();
  game_object_ids.push(this.spriteData.id);
  tile_map[x][y].objects.push(this.spriteData);
  this.playerInteract=function(){
    toggleMap();
  }
}//the fact that any map sprite you place works is probably going to be a bug later on... heheh


function Lootbag(name, x, y){//dead spider's x,y. add this on death
  //name is from what dropped it, determines what goes in bag
  console.log(`${name} dropped a lootbag...`)
  this.spriteData = JSON.parse(JSON.stringify(gameObjects['lootbag']));
  this.spriteData.id = generateID();
  game_object_ids.push(this.spriteData.id);//not necessary?
  this.x=x;
  this.y=y;
  tile_map[playerX][playerY].objects.push(this.spriteData);
  this.playerInteract=function(){
    //put stuff in player inv and delete self
    if (player.inventory.find(obj => obj.name === 'string')){
      let invPos;
      invPos = player.inventory.findIndex(obj => obj.name ==='string');
      player.inventory[invPos].amt += 1;
    } else {
      player.inventory.push({'name':'string', 'amt':1, "itemObj":{"spriteData":gameObjects['string']}});
    }
    //remove from tile
    let object;
    let count=0;
    for (object in tile_map[this.x][this.y].objects){
      if (tile_map[this.x][this.y].objects[object].id === this.spriteData.id){
        tile_map[this.x][this.y].objects.splice(count,1);
        break;
      }
      count+=1;
    }
    //remove from game_objects
    let game_obj;
    let obj_count=0;
    for (game_obj in game_objects){
      if (game_objects[game_obj].spriteData.id===this.spriteData.id){

        game_objects.splice(obj_count, 1);
        break;
      }
      obj_count+=1;
    }
  }
}
//
//////////////////////////////////////////////////////////////////////////////////////////////OBJECT INTERACTS BROKEN

//sound stuff//////////////////////////////////////////////////////////////////////////
const fish_sound = new Audio('fishing.mp3')
const chop = new Audio('chop.mp3');
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
//to display example tile next to dropdown menu
const sprtCanvas = document.getElementById('spriteCanvas');
const sprtCtx = sprtCanvas.getContext('2d');
//sprite sheet, 16px increments
const spriteSheet = new Image();
spriteSheet.src = 'spritesheet-0.5.18.png';
//BLOCKSIZE=16;//maybe not need this or shorten var name

////////////////////////////////////////////////////////////////////////NEW UI TESTING REMOVE IF SUCKS

////////////////////////////////////////////////////////////////////////END NEW UI TESTING REMOVE IF IT SUCKS

//get user previous map from local storage
var functionObjs={"mapsign":mapSign, "dungeonStairs":dungeonStairs}
/*
var myData = localStorage.getItem("");//originally got userMap
if (myData!==null){
*/
//tile_map=JSON.parse(myData);//otherwise tile_map is just default from file
function mapLoaded(){
  console.log("map loaded...")
  let row, col, obj;
  for (row in tile_map){
    for (col in tile_map[row]){
      for (obj in tile_map[row][col].objects){
        if (tile_map[row][col].objects[obj].name in functionObjs){
          //reconstitute le object
          game_objects.push(new functionObjs[tile_map[row][col].objects[obj].name](row, col));
        }
      }
    }
  }
}


//setup dropdown menu for base tiles
const dropdown = document.getElementById('tile-dropdown');

for (const key in gameObjects){
  if (gameObjects.hasOwnProperty(key)){
    const option = document.createElement("option");
    option.text=key;
    dropdown.append(option)
  }
}

dropdown.addEventListener("change",function(){
  const selectedTile = this.value;
  objectToPlace=gameObjects[selectedTile];
  sprtCtx.clearRect(0,0,16,16);
  sprtCtx.drawImage(spriteSheet, objectToPlace.sprite[0],objectToPlace.sprite[1], 16,16,
    0, 0, 16,16);
})

// add arrow key listener for desktop users
let timerId;
var delay = 30;

document.addEventListener('keydown', (event) => {//this doesn't work right
                                                 //maybe make it playerLastMove=Date.now() check?
                                                 //so no matter how many times it fires it's going on time
  if (event.target.nodeName==='SELECT') {
    return;
  }
  if (timerId) {
    clearTimeout(timerId);
  }
  timerId = setTimeout(() => {
    switch (event.key) {
      case 'f':
      case 'F':
        player.equip();
        break;
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

function isTopLeftClicked(event, uicanvas){
  const rect = uicanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return x < 25 && y < 25;
}

function clickedStatToggle(event, uicanvas){
  const rect = uicanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return x < 25 && y < 240 && y > 225;
}

function clickInvDown(event, uicanvas){
  const rect = uicanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return x > 275 && y < 280 && y > 260;
}

function clickInvUp(event, uicanvas){
  const rect = uicanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return x > 275 && y < 240 && y > 220;
}

function clickEquip(event, uicanvas){
  const rect = uicanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return x >=250 && x <= 260 && y>= 245 && y <= 261;
}

///ALL OF THESE COULD BE THE SAME FXN////////////////////////////////////////////////////////////////////////////REFACTOR
//----

function invScroll(dir){//not accounting for dropped items? on item drop, reset player.invPosition to zero or?
  let tempPos=player.invPosition+dir;
  if (tempPos===-1){
    player.invPosition=player.inventory.length-1;
  }
  else if (tempPos>=player.inventory.length){
    player.invPosition=0;
  } else {
    player.invPosition=tempPos;
  }
}

canvas.addEventListener('click', event => {
  if (isTopLeftClicked(event, canvas)){
    if (bigMap){
      toggleMap();
    }
  }
  if (clickedStatToggle(event, canvas)){
    toggleStats();
  }
  //temporary inventory scroller
  if (clickInvUp(event, canvas)){
    invScroll(-1);//next inventory item (-1)
  }
  if (clickInvDown(event, canvas)){
    invScroll(1);//next inv item (+1)
  }
  if (clickEquip(event, canvas)){
    player.equip();
  }
});

canvas.addEventListener('touchend', event => {
  if (isTopLeftClicked(event.touches[0], canvas)){
    if (bigMap){
      toggleMap();
    }
  }
  if (clickedStatToggle(event.touches[0], canvas)){
    toggleStats();
  }
  //temporary inventory scroller
  if (clickInvUp(event.touches[0], canvas)){
    invScroll(-1);//next inventory item (-1)
  }
  if (clickInvDown(event.touches[0], canvas)){
    invScroll(1);//next inv item (+1)
  }
  if (clickEquip(event.touches[0], canvas)){
    player.equip();
  }
});

const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    const fileContents = event.target.result;
    localStorage.setItem('userMap', fileContents);
    tile_map=localStorage['userMap'];
    saveToLocal();
    alert('file uploaded to local storage! page should refresh...');
  }
  reader.readAsText(file);//is this necessary?
  location.reload();
  console.log("refresh the page...");
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
  this.lastTime = Date.now();
  this.lastMove = Date.now();
  this.regenTime=5000;
  this.skills = {
    "walking":{"xp":0,"lvl":1},
    "strength":{"xp":0,"lvl":1},
    "health":{"xp":0,"health":100,"max":100, "lvl":1},
    "playerLvl":1,
    "woodcutting":{"xp":0,"lvl":1},
    "fishing":{"xp":0, "lvl":1}
  };
  this.inventory = [];
  this.lastInventory = JSON.stringify(this.inventory);
  this.invPosition = 0;//first item in inventory
  this.holding={
    "name":"nothing",//empty handed this is default, would use from spriteData, but nothing has no spriteData
    "itemObj":null,//remove item object from inventory and put it here
  };
  this.update = function(){
    if (nextToFire()){
      this.regenTime = 2000;
    } else {
      this.regenTime = 5000;
    }
    
    if (this.lastInventory !== JSON.stringify(this.inventory)){
      this.lastInventory=JSON.stringify(this.inventory);
      saveInventoryToLocal();
    }
    
    if (this.skills.health['health'] < this.skills.health['max']){
      if (this.skills.health['health'] > 0){// && Date.now() > this.lastTime+5000){
        //regen health
        if (Date.now() > this.lastTime+this.regenTime){
          this.skills.health['health']+=1;
          this.lastTime=Date.now();
        }
      } else {
        this.skills.health['health']=this.skills.health.max;
        localStorage['playerStats']=JSON.stringify(this.skills);
        //localStorage['playerInv']=JSON.stringify(this.inventory)
        deathScreen();
        setTimeout(() => {location.reload();},3000);
      }
    }
    var skill;
    for (skill in this.skills){
      if (skill!=='health'){
        this.checkLevelUp(this.skills[skill]);
      } else {
        this.checkLevelUp(this.skills['health'], true);
        }
    }
  }
  this.equip = function(){//if item equipped, unequip it. if not equipped, equip it.
                              //if item equipped and equipping a different item, switch it.
                              //item 
    let itemObject = player.inventory[player.invPosition].itemObj;
    //equip, unequip or switch current item if itemObject.equippable!==undefined
    if (itemObject===player.holding.itemObj){
      //unequip
      player.holding={"name":"nothing", "itemObj":null};
    }
    else if (player.holding.name==="nothing" && itemObject.equippable===true){
      player.holding={"name":itemObject.spriteData.name, "itemObj":itemObject};
    }
  }
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
    let bonus = 0;
    if (this.holding.name!=="nothing"){
      bonus = this.holding.itemObj.attBonus;
    }
    target.getAttacked(this.skills.strength.lvl + bonus);
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
  if (player.skills.woodcutting===undefined){
    player.skills['woodcutting']={"xp":0,"lvl":1};
  }
  if (player.skills.fishing===undefined){
    player.skills['fishing']={"xp":0,"lvl":1};
  }
}
//get inventory from local
var pObjList = {
  "axe":Axe,
  "fishingpole":Fishingpole
  //next here will be fishingpole
}

var playerInv = JSON.parse(localStorage.getItem("playerInv"));
if (playerInv!=='undefined'){
  let tempInv = [];
  let obj;
  //loop and process into tempInv
  for (obj in playerInv){
    if (playerInv[obj].name in pObjList){
      tempInv.push({"name":playerInv[obj].name, "itemObj":new pObjList[playerInv[obj].name]});
    } else {
      tempInv.push(playerInv[obj]);
    }
  }
  player.inventory=tempInv;
  tempInv=null;
}

if (!player.inventory.some(obj => obj.hasOwnProperty("name") && obj["name"]==="axe")){
  player.holding={"name":"nothing", "itemObj":null};
  player.inventory.push({"name":"axe", "itemObj":new Axe})
}
if (!player.inventory.some(obj => obj.hasOwnProperty("name") && obj["name"]==="fishingpole")){
  //player.holding={"name":"nothing", "itemObj":null};
  player.inventory.push({"name":"fishingpole", "itemObj":new Fishingpole})
}


function saveInventoryToLocal(){
  let saveList = [];
  let obj;
  for (obj in player.inventory){
    if (player.inventory[obj].itemObj.spriteData.name in playerObjects){
      //it an axe or fishing pole etc, see base_tiles.js/playerObjects
      saveList.push({"name":player.inventory[obj].itemObj.spriteData.name, "itemObj":"Axe"});//might can just put null as itemObj, not using it?
    } else {
      //it something like logs or string that can be directly JSON.stringified
      saveList.push(player.inventory[obj]);//should work, they aint got functions in em
    }
  }//might have to stringify whole list instead of individual items? we'll see
  localStorage.setItem("playerInv", JSON.stringify(saveList));
}

var ghostR = [48,80];//ghost facing right coords
var ghostL = [64,96];//ghost facing left coords
var ghostFacing='rt';

//returns array of -20 to +20 from playerX,playerY
function getDispArea(){
  var minX;
  var minY;
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
  var dispList=[]
  for (let i=minY;i<minY+19;i++){
    let innerList=[]
    for (let j=minX;j<minX+19;j++){
      innerList.push([j,i]);
    }
    dispList.push(innerList);
  }
  return dispList;
}
//player interact with next tile
function interactNPC(nextX, nextY){
  var object;
  for (object in tile_map[nextX][nextY].objects){
    if (tile_map[nextX][nextY].objects[object].type=="npc"){
      var targetNPC=getNpcById(tile_map[nextX][nextY].objects);
      targetNPC=targetNPC[0].id;
      targetNPC=filterNpcById(npcs, targetNPC)[0];
      if (targetNPC.spriteData.attackable===true){
        player.attack(targetNPC);//hmmm?
        //return? also should probably make interactObject not run so return false
      }
    }
  }
}


var itemInteractObjs = {'tree':'axe'};//need base tile interact objs too? like in case of rock///////////////////////PICKAXE NOTE
function interactObject(nextX, nextY){
  console.log("inteacting with next tile...");
  let object;
  let interacted = false;
  //WHAT IS WRONG WITH THIS PART?//////////////////////////////////////////////////////////////////////FIX IT
  for (object in tile_map[nextX][nextY].objects){
    if (tile_map[nextX][nextY].objects[object].id===null || tile_map[nextX][nextY].objects[object].id==='undefined'){
      console.log("objects null or undefined")
      continue;
    }
    console.log("got past continue...");
    if (tile_map[nextX][nextY].objects[object].type==="object"){
      let targetObj;
      let obj;
      for (obj in game_objects){
        if (JSON.stringify(tile_map[nextX][nextY].objects[object])===JSON.stringify(game_objects[obj].spriteData)){
          targetObj = game_objects[obj];
        }
      }
      if (hasFunction(targetObj, "playerInteract")){
        console.log(`${targetObj} has funciton playerInteract`);
        targetObj.playerInteract();
        interacted = true;
      }
    }
    
    //PAST THIS POINT SEEMS TO BE WORKING/////////////////////////////////////////////////////////////////////////FIX IT
    //object is tree, other tile object that is gettable with held item or inv item
    if (!interacted){
      console.log("got inside !interacted like for trees")
      if (itemInteractObjs[tile_map[nextX][nextY].objects[object].name]!==undefined){
        //it is a tree or other item interactable obj
        if (player.holding.name === itemInteractObjs[tile_map[nextX][nextY].objects[object].name]){
          //do thing with obj
          player.holding.itemObj.action(nextX, nextY);
        }
      }
    }
  }
  console.log("check instead for base-tile interaction?");
  if (player.holding.name!=="nothing"){
    player.holding.itemObj.action(nextX, nextY);
  }
}




function interactNext(nextX, nextY){
  if (master_collision===true){
    return false
  }
  //check for hostile npcs on next tile
  interactNPC(nextX, nextY);//maybe do this way so there is hierarchy of interaction?
  interactObject(nextX, nextY);
  let check_collision=checkCollision(nextX, nextY);
  return check_collision;
}

function nextToFire(){
  let coordList = surroundingTiles(playerX, playerY);
  var coord;
  for (coord in coordList){
    //check each tile for a firepit
    if (tile_map[coordList[coord][0]][coordList[coord][1]].objects.length > 0){
      var object;
      for (object in tile_map[coordList[coord][0]][coordList[coord][1]].objects){
        if (tile_map[coordList[coord][0]][coordList[coord][1]].objects[object].name==="campfire"){
          return true;
        }
      }
    }
  }
  return false;
}

function surroundingTiles(x, y) {
  let coords = [];
  for (let i = x-1; i <= x+1; i++) {
    for (let j = y-1; j <= y+1; j++) {
      if (i !== x || j !== y) {
        coords.push([i, j]);
      }
    }
  }
  return coords;
}

//instead check players next potential tile in tile_map
function movePlayer(direction) {
  if (Date.now()<player.lastMove+100){
    return;
  }
  player.lastMove=Date.now();
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

function drawPlayer(){
    let ghostLoc;
    if (ghostFacing=="rt"){ghostLoc = ghostR}
    else {ghostLoc = ghostL};
    let drawPointX, drawPointY;
    if (playerX>10){drawPointX=10} else{drawPointX=playerX}
    if (playerY>10){drawPointY=10} else{drawPointY=playerY}
    ctx.drawImage(spriteSheet, ghostLoc[0],ghostLoc[1], 16,16,
        drawPointX*BLOCKSIZE-BLOCKSIZE, drawPointY*BLOCKSIZE-BLOCKSIZE, 16,16);
    //then draw any items player is wearing/holding, probably wearing first
    if (player.holding.name!=="nothing"){
      ctx.drawImage(spriteSheet, player.holding.itemObj.spriteData.holdSprite[ghostFacing][0], player.holding.itemObj.spriteData.holdSprite[ghostFacing][1],
        16,16, drawPointX*BLOCKSIZE-BLOCKSIZE, drawPointY*BLOCKSIZE-BLOCKSIZE, 16, 16);
    }
}

function drawInv(){
  ctx.fillStyle = "rgba(139, 69, 19, 0.5)";
  ctx.fillRect(275, 240, 20,20);
  if (player.inventory.length===0){
    //draw x for inv item
    ctx.drawImage(spriteSheet, baseTiles['redX'][0], baseTiles['redX'][1], 16,16,
      275,240, 20,20)
  } else {
    //draw inventory position
    ctx.drawImage(spriteSheet, player.inventory[player.invPosition].itemObj.spriteData.itemSprite[0], player.inventory[player.invPosition].itemObj.spriteData.itemSprite[1], 16,16
      ,275,240, 20,20);
  }
  //draw arrows baseTile['upArrow'/'downArrow']
  ctx.drawImage(spriteSheet, baseTiles['upArrow'][0], baseTiles['upArrow'][1], 16,16
    ,260,210, 50,40);
  ctx.drawImage(spriteSheet, baseTiles['downArrow'][0], baseTiles['downArrow'][1], 16,16
    ,262,250, 50,40);

  //draw equip button, need to change function to check .equipTo (i.e. holding, wearing, footwear, etc)
  ctx.drawImage(spriteSheet, baseTiles['F'][0], baseTiles['F'][1], 16,16,
    250,245, 16,16);
}

var objectToPlace=gameObjects['rock'];
//var functionObjs = {"mapsign":mapSign}

function placeTile (objToPlace){//now need to account for objects like mapsign, 
                                //game_objects.push(new mapSign(x,y))
  if (objToPlace.type==='object'){

    if (objToPlace.name in functionObjs){
      //place it like an object
      game_objects.push(new functionObjs[objToPlace.name](playerX, playerY));
    } else {
      //just place it as spriteData
      tile_map[playerX][playerY].objects.push(objectToPlace);
    }

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

//player objects testing///////////////////////////////////////////////////
var regenObjects = [];//{"name":"tree", "coords":[10,10]} would get turned from stump into tree, scoured earth to rock, etc
var looseObjects = [];

function Fishingpole(){
  this.equippable=true;
  this.spriteData = JSON.parse(JSON.stringify(playerObjects['fishingpole']));
  this.attBonus = -1;//dango floppy fishin pole can't hwhack for nothin'!
  this.isHeld = false;//might not need this?
  this.onGround = false;//or this? yet?
  this.bobberX = null;
  this.bobberY = null;
  this.action = function(x, y){
    let fishingTimeoutId = this.isFishing; // Store the previous timeout ID in a local variable
    if (fishingTimeoutId !== null && this.bobberX!==null){
      clearTimeout(fishingTimeoutId);
      //remove bobber from tile being fished on
      console.log(`bobberX:${this.bobberX}, bobberY:${this.bobberY}`)
      tile_map[this.bobberX][this.bobberY].objects = filterObjByKeyVal(tile_map[this.bobberX][this.bobberY].objects, "name", "bobber");
    }
    if (tile_map[x][y].sprite.name!=='water'){
      return;
    }
    console.log("fishing action");
    if (tile_map[x][y].sprite.name==='water'){
      fish_sound.play();
      console.log("you cast your lure into the water...");
      //add bobber to next tile
      tile_map[x][y].objects.push(gameObjects['bobber']);
      this.bobberX=x;
      this.bobberY=y;
      this.isFishing = setTimeout(() =>{
        tile_map[this.bobberX][this.bobberY].objects = filterObjByKeyVal(tile_map[this.bobberX][this.bobberY].objects, "name", "bobber");
        console.log("something is tugging at the line!");
        if (player.skills.fishing.lvl>=Math.floor(Math.random()*25)){
          //draw fish on next tile
          tile_map[x][y].objects.push(gameObjects['fish']);
          setTimeout(() => {
            tile_map[this.bobberX][this.bobberY].objects = filterObjByKeyVal(tile_map[this.bobberX][this.bobberY].objects, "name", "fish");
          }, 1000)
          player.incrementSkill('fishing', 1);
          if (player.inventory.find(obj => obj.name === 'fish')){//going to change to random fish or randomize fish in pool
            //player.inventory['logs'].amt +=1;
            let invPos = player.inventory.findIndex(obj => obj.name ==='fish');
            player.inventory[invPos].amt += 1;
          } else {
            player.inventory.push({'name':'fish', 'amt':1, "itemObj":{"spriteData":gameObjects['fish']}})
          }
        } else {
          console.log("it got away...");
        }
      }, 5000);
    }
  }
}

function Axe(){//ex) player obtains axe, player.inventory.push(new Axe())
  this.equippable=true;
  this.spriteData = JSON.parse(JSON.stringify(playerObjects['axe']));
  this.spriteData.id = generateID();
  this.attBonus = 2;//add 2 to player attack if held
  this.isHeld = false;
  this.onGround = false;
  //this.action = axeAction;
  this.action = function(x, y){//, object_name){//for chopping trees, attack is just a bonus to melee. could add attack type?
    let object;
    let invPos;
    for (object in tile_map[x][y].objects){
      if (tile_map[x][y].objects[object].name==='tree'){
        chop.play();
        if (player.skills.woodcutting.lvl>=Math.floor(Math.random()*25)){
          player.incrementSkill('woodcutting', 1);
          if (player.inventory.find(obj => obj.name === 'logs')){
            //player.inventory['logs'].amt +=1;
            invPos = player.inventory.findIndex(obj => obj.name ==='logs');
            player.inventory[invPos].amt += 1;
          } else {
            player.inventory.push({'name':'logs', 'amt':1, "itemObj":{"spriteData":gameObjects['log']}})
          }
          tile_map[x][y].objects.splice(object,1);
          tile_map[x][y].objects.push(gameObjects['stump1']);
          regenObjects.push({'name':'tree', 'coords':[x,y]});
          break;
        }
      }
    }
    //uh oh, just note that pickaxe will have to interact with base-tile and not tile objects!//////////////////////PICKAXE NOTE
  }
  
}
//end player objects testing///////////////////////////////////////////////

//end player setup///////////////////////////////////////////////////////////////////////////////////////////////////////

//utility functions//////////////////////////////////////////////////////////////////////////////////////////////////////

//save map to local storage
function saveToLocal(){//now only runs if player clicks button
  let row;
  let col;
  let ttile_map=JSON.parse(JSON.stringify(tile_map));
  for (row in ttile_map){
    for (col in ttile_map[row]){
      ttile_map[row][col].objects=filterObjByKeyVal(ttile_map[row][col].objects, "type", "npc");
      let obj;
      for (obj in ttile_map[row][col].objects){
        if (ttile_map[row][col].objects[obj].name in functionObjs){
          ttile_map[row][col].objects[obj]={"name":ttile_map[row][col].objects[obj].name}
        }
      }
    }
  }
  localStorage.setItem("userMap", JSON.stringify(ttile_map));
  console.log("saved to local...")
}

//delete map from local storage
function clearUserMap (){
  delete localStorage['userMap'];
  console.log("refresh to clear, place another tile before refreshing to cancel")
}

//pretty obvious function. works for player and npcs (so far)
function checkCollision(nextX, nextY){
  var object;
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

function filterNpcById(arr, id){//THIS ONE SEEMS TO WORK FOR WHAT IS *SUPPOSED* TO BE GETOBJBYID, like, return the object by id...
  return arr.filter(obj => obj.hasOwnProperty('id') && obj.id===id);
}

function filterObjByKeyVal(arr, key, val){//returns list minus all objects with key that equals val
  return arr.filter(obj => obj.hasOwnProperty(key) && obj[key] !== val);
}

function getObjByKeyVal(arr, key, val){//returns list minus all objects with key that equals val
  return arr.filter(obj => obj.hasOwnProperty(key) && obj[key] === val);
}

function removeItemById(list, id){
  return list.filter(item => item.id !== id);
}

function isSpriteIdInList(list, sprId){
  for (let i=0;i<list.length;i++){
    if (list[i].spriteData.id === sprId){
      return true
    }
  }
  return false;
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
var move_dir=["up","down","left","right"];

function moveNPC(curX,curY, definite=false){//for passive (non-aggressive/tracking) movement
  //calculate random move, return x,y
  let potentialX=null;
  let potentialY=null;
  let facing="right";
  let moveDir;
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
}

function trackPlayer(ratX, ratY) {//lol it doesn't matter, but they arent all rats...
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

function isOneUnitAway(x1, y1, x2, y2){
  return Math.abs(x2-x1) > 1 || Math.abs(y2 + y1) > 1;
}

var npcs=[];//npc's in game, {"[id]":npc_object}
function Spider(){
  this.name="spider";
  this.hp = 10;
  this.strength = 2;
  this.spriteData=JSON.parse(JSON.stringify(gameObjects['spider']));
  this.spriteData.id=null;
  this.x=null;
  this.y=null;
  this.lastTime=Date.now();//timestamp
  this.delay = 500;
  this.aggro = false;
  this.lastAggro=Date.now();
  this.aggroRange = 10;
  this.reposition = false;
  this.reposCount = 0;
  
  this.update = function(){
    if (this.x===playerX && this.y===playerY){
      player.getAttacked(this.strength);//need to change to random
    }
    if (this.hp<1){
      skele_die_sound.play();
      game_objects.push(new Lootbag("spider", this.x, this.y));
      removeNPC(this.spriteData.id, this.x, this.y);
    }
    let now = Date.now();
    let restTime = Math.floor(Math.random()*this.delay);
    if (now > this.lastTime+restTime){
      this.lastTime=now;
      //check distance to player
      let dToPlayer = distToPlayer(this.x, this.y);
      if (dToPlayer<=this.aggroRange){//distToPlayer(this.x, this.y)<=this.aggroRange){
        if (dToPlayer === this.lastDToPlayer) {
          this.dToPlayerCounter++;
          if (this.dToPlayerCounter >= 3) {
            // dToPlayer has remained the same for 10 iterations
            console.log("dToPlayer has not changed for 3 iterations");
            this.reposition=true;
            this.dToPlayerCounter = 0;
          }
        } else {
          // dToPlayer has changed, reset counter
          this.dToPlayerCounter = 0;
        }
        this.lastDToPlayer = dToPlayer;
        this.aggro=true;
        this.lastAggro=Date.now();
      } else {
        if (this.aggro===true && Date.now()>this.lastAggro+3000){
          this.aggro=false;
        }
      }
      var newCoords=null;
      if (!this.aggro){
        newCoords=moveNPC(this.x,this.y);//returns x,y
      } else {
        if (this.reposition===true){
          if (this.reposCount<=250){
            this.reposition=false;
            this.aggro=false;
            this.reposCount+=1;
          } else {
            this.reposition=false;
            this.aggro=false;
            this.reposCount=0;
          } 
          newCoords=moveNPC(this.x,this.y);//returns x,y
        } else {
          var trackCoords = trackPlayer(this.x, this.y);
          newCoords=moveNPC(trackCoords.x, trackCoords.y, true);
        }
        if (checkCollision(newCoords[0], newCoords[1])===true){
          newCoords=[this.x, this.y, "right"];
        }
      }
      
      if (!isOneUnitAway(this.x, this.y, newCoords[0], newCoords[1])){
        //don't
        newCoords=[this.x, this.y, "right"];//messy but should work
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
      var newCoords=null;
      if (!this.aggro){
        newCoords=moveNPC(this.x,this.y);//returns x,y
      } else {
        var trackCoords = trackPlayer(this.x, this.y);//this is broken lol
        newCoords=moveNPC(trackCoords.x, trackCoords.y, true);
        if (checkCollision(newCoords[0], newCoords[1])===true){
          newCoords=[this.x, this.y, "right"];
        }
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
 return crypto.randomUUID();
}
var game_ids=[0];//if id in list, regenerate, if id not in list add it, remove id from game_ids on object delete

if (localStorage.getItem("tileMapSector")==="main"){
  setInterval(function(){
    if (countObjectsByPropertyValue(npcs, "name", "spider")<20){
        let newSpide = new Spider;//should work without changing newSkeles lol
        newSpide.spriteData.id=generateID();
        //console.log(newSpide.spriteData.id);
        let coords_ok;
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
          let object;
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
  },2533 );

  //infinite skeletons for taylor. comment out for only 45 skeletons until refresh
  setInterval(function(){
    if (countObjectsByPropertyValue(npcs, "name", "skeleton")<45){
        let newSkele = new Skeleton;
        newSkele.spriteData.id=generateID();
        //console.log(newSkele.spriteData.id);
        var coords_ok;
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
          let objCollide = false;
          var object;
          for (object in tile_map[newSkele.x][newSkele.y].objects){
            if (tile_map[newSkele.x][newSkele.y].objects[object].collision===true){
              objCollide = true;
              break;
            }
          }
          if (objCollide){
            continue;
          }
          coords_ok=true;
        } while (coords_ok===false);
        game_ids.push(newSkele.spriteData.id)
        newSkele.id=newSkele.spriteData.id;
        npcs.push(newSkele);
        tile_map[newSkele.x][newSkele.y].objects.push(newSkele.spriteData);
    }
  },2120);


  setInterval(function(){
    //check npcs list, generate more skeletons
    if (countObjectsByPropertyValue(npcs, "name", "rat")<45){
        let newRat = new Rat;
        newRat.spriteData.id=generateID();
        //console.log(newRat.spriteData.id);
        var coords_ok=false;
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
          let object;
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
} 
else if (localStorage.getItem("tileMapSector")==="dungeon_1"){
  
  setInterval(function(){
    if (countObjectsByPropertyValue(npcs, "name", "spider")<10){
        let newSpide = new Spider;//should work without changing newSkeles lol
        newSpide.spriteData.id=generateID();
        //console.log(newSpide.spriteData.id);
        let coords_ok;
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
          let object;
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
  },2533 );
  
}

//uncomment for npc spawning
//end npc testing/////////////////////////////////////////////////////////////////////////////////////////////////////

//main///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function drawWeather(x,y){
  //for now just draw rain on random tiles
  if (raining===true){
    let randomInt = Math.random();
    if (randomInt>=0.9){
      for (let i=0;i<4;i++){
        ctx.drawImage(spriteSheet, gameObjects['rain']['sprite'][0],gameObjects['rain']['sprite'][1], 16,16, 
          x,y, 16,16)
      }//just to make the rain darker
    }
  }
}

const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 10, canvas.width/2, canvas.height/2, canvas.width/1.5);
gradient.addColorStop(0,"transparent");
gradient.addColorStop(1, "DarkGray");

function drawBigMap(){
  //draw all tiles except 1/16 size? will have to see how it works out
  var dispList=[]
  for (let i=0;i<100;i++){
    let innerList=[]
    for (let j=0;j<100;j++){
      innerList.push([j,i]);
    }
    dispList.push(innerList);
  }
  return dispList;
}

function drawMap(disp_area){
  var row;
  for (row in disp_area){
    //draw base sprite from that area of tile_map
    var col;
    for (col in disp_area[row]){
      let sprtX=disp_area[row][col][0];
      let sprtY=disp_area[row][col][1];
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
        var object;
        for (object in tile_map[sprtX][sprtY]['objects']){
          //draw 
          
          if (typeof tile_map[sprtX][sprtY]['objects'][object].id !== 'undefined' && tile_map[sprtX][sprtY]['objects'][object].type==="object"){
            //it has an id, but does it have an object in game_objects
            if (!isSpriteIdInList(game_objects, tile_map[sprtX][sprtY]['objects'][object].id)){
              delete tile_map[sprtX][sprtY]['objects'][object];
              continue;
            }
          }
          
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
              //then draw health? get npc by id, get health, draw at sprtLoc[0], sprtLoc[1], to sprtLoc[0]+16, sprtLoc[1]+5
              //draw red line, then green line (health/max) * 16
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
  var npc;
  for (npc in npcs){
    if (hasFunction(npcs[npc], 'update')){
      npcs[npc].update();
    }
  }
}

function update(){
  //game logic here
  if (!death){
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
    drawInv();//testing until better inv UI
  } else {
    deathScreen();
  }
}

//function mapLoaded(){
setTimeout(setInterval(update,100),4000);//or update only when user moves or places a tile, need to add modes
//}