"use strict";

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
  case "northsea":
    const script3 = document.createElement("script");
    script3.src="./northsea.js";
    script3.type="text/javascript";
    script3.onload = mapLoaded;
    document.body.appendChild(script3);
    break;
  default:
    const scriptD = document.createElement("script");
    scriptD.src="./map_2.js";
    scriptD.type="text/javascript";
    scriptD.onload = mapLoaded;
    document.body.appendChild(scriptD);
    localStorage.setItem("tileMapSector", "main");
    break;
}
//debug stuffss

let masterDebug = false;
function debugMode(){
  if (masterDebug === false){
    masterDebug=true;
  } else {
    masterDebug = false;
  }
}

let muteSound = false;
function mute(){
  if (muteSound===true){
    muteSound=false;
    rain_sound.volume=1;
  } else {
    muteSound=true;
    rain_sound.volume=0;
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

var showDrops = true;
function toggleDrops(){
  if (showDrops){
    showDrops = false;
  } else {
    showDrops = true;
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

function toggleStuck(){
  //lmao just kill the player and they respawn XD
  player.skills.health.health=-1;
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

function drawIcon(name, x, y){//item name in baseTiles etc
  ctx.drawImage(spriteSheet, baseTiles[name][0], baseTiles[name][1], 16,16,
    x,y, 16,16);
}

function drawStats(){
  if (!showStats){
    /*
    ctx.drawImage(spriteSheet, baseTiles['statDisp'][0], baseTiles['statDisp'][1], 16,16, 0,225, 25,25);
    */
   drawIcon("statDisp", 4,263);
  } else {
    ctx.fillStyle="rgba(139, 69, 19, 0.5)";
    ctx.font = '10px Arial';
    ctx.fillRect(3, 50, 125, 235);
    //ctx.drawImage(spriteSheet, baseTiles['redX'][0], baseTiles['redX'][1], 16,16, 0,225, 16,16);
    ctx.fillStyle="white";
    drawIcon("heart", 4, 48);//offset 16x 12y
    ctx.fillText("health       : " + player.skills['health']['health'] + "/" + player.skills.health.max, 20,60);
    drawIcon("speedbootsI", 4, 63);
    ctx.fillText("walking xp   : " + player.skills.walking.xp + "(" + Math.floor(player.skills.walking.lvl) + ")", 20,75);
    drawIcon("ironsword", 4, 78);
    ctx.fillText("strength xp  : " + player.skills.strength.xp + "(" + player.skills.strength.lvl + ")", 20, 90);
    //draw double icon for wc
    drawIcon("tree", 4, 93);
    drawIcon("axeItem", 4, 93);
    ctx.fillText("woodcutting xp:" + player.skills.woodcutting.xp + "(" + player.skills.woodcutting.lvl + ")", 20, 105);
    drawIcon("tunafish", 4, 108);
    drawIcon("fPole", 4, 108);
    ctx.fillText("fishing xp: " + player.skills.fishing.xp + "(" + player.skills.fishing.lvl + ")", 20, 120);
    drawIcon("scroll", 4, 122);
    drawIcon("hide", 4, 122);
    ctx.fillText("crafting xp: " + player.skills.crafting.xp + "(" + player.skills.crafting.lvl + ")", 20, 135)
    drawIcon("mapsign", 4, 138);
    ctx.fillText("survival xp: " + player.skills.survival.xp + "(" + player.skills.survival.lvl + ")", 20, 150);
    drawIcon("cookedtuna", 4, 153);
    ctx.fillText("cooking xp: " + player.skills.cooking.xp + "(" + player.skills.cooking.lvl + ")", 20, 165);
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

let offset = 0;
let dropList = [];//for dropObj put in {"text": text, "amount": null, "coords":[[x1,y1], [x2,y2]],...}
              // drop list gen'd by another fxn. make all coords same if message to just display in place
              //for a drop, do {"text":skillname, "amount":skillxp, "coords":dropCoords()};

function dropCoords(drop=true){
  let y = 10 * BLOCKSIZE;
  let coords = [];
  if (!drop){
    //generate 10 coords of the same value
    for (let i=0;i<30;i++){
      coords.push([25, y+135]);//will have to see how this one works
    }
  } else {
    //generate 10 coords: let y = 10 * BLOCKSIZE; 
    for (let i=0;i<30;i++){
      coords.push([150, y]);
      y -= Math.floor(BLOCKSIZE/3);
    }
  }
  return coords;
}

function drawXpDrop(){//instead add to an xp queue in update. originally skill, xp
  if (dropList.length>0){
    let drop;
    for (drop in dropList){
      //draw dropList[drop].text & amount at dropList[drop].coords[0], then shift list
      if (dropList[drop].coords.length===0){
        dropList.splice(drop, 1);
      }
      if (dropList.length===0){
        return;
      }
      let amount;
      if (!dropList[drop].amount){
        amount = " ";
      } else {
        amount = ` : ${dropList[drop].amount}`;
      }
      ctx.fillStyle="rgb(0,0,0,0.5)";
      ctx.fillRect(dropList[drop].coords[0][0], dropList[drop].coords[0][1]-8, dropList[drop].text.length*5 + amount.length*5 ,10)
      ctx.fillStyle="gold";
      ctx.fillText(dropList[drop].text + amount, dropList[drop].coords[0][0], dropList[drop].coords[0][1]);
      dropList[drop].coords.shift();
    }
  }
}

//interactable objects////////////////////////////////////////////////////////////////////////////////////////////////
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


function drawCraft(){
  if (playerCrafting){
    ctx.fillStyle = "rgba(139, 69, 19, 0.75)";
    ctx.fillRect(75, 100, 175, 100);
    ctx.drawImage(spriteSheet, baseTiles['C'][0], baseTiles['C'][1], 16, 16,
      134,184, 16,16);//use those coords for C click/tap
    ctx.fillStyle = "white";
    ctx.fillText("Crafting Table", 125, 110);
    ctx.fillText("raft", 150, 195);
    let item;
    let startPosX = 80;
    let startPosY = 120;
    for (item in craftQueue){
      //draw each item within popup bounds between x 75 and 250, y 112 and 185
      //thats ~10 items across and ~4 deep, don't need that many but could
      //best as just 1 item in queue to represent item in general while number is just pulled from player.inventory
      if (craftQueue[item].spriteData.name in playerObjects){
        ctx.drawImage(spriteSheet, craftQueue[item].spriteData.itemSprite[0], craftQueue[item].spriteData.itemSprite[1], 16, 16,
          startPosX, startPosY, 16,16);
      } else if (craftQueue[item].spriteData.name==="scroll"){//scroll, have to draw scroll then overlay (overlay 12x12?)
        ctx.drawImage(spriteSheet, craftQueue[item].spriteData.sprite[0], craftQueue[item].spriteData.sprite[1], 16, 16,
          startPosX, startPosY, 16,16);
        //then have to see if it a player obj or other type obj //pObjList
        let overlaySprite = null;//coords
        if (craftQueue[item].spriteData.scroll in playerObjects){
          overlaySprite = playerObjects[craftQueue[item].spriteData.scroll].itemSprite;
        } else {
          overlaySprite = baseTiles[craftQueue[item].spriteData.scroll];
          console.log(overlaySprite);
        }
        ctx.drawImage(spriteSheet, overlaySprite[0], overlaySprite[1], 16, 16,
          startPosX+6, startPosY+6, 8,8);  
      } else {
        ctx.drawImage(spriteSheet, craftQueue[item].spriteData.sprite[0], craftQueue[item].spriteData.sprite[1], 16, 16,
          startPosX, startPosY, 16,16);
      }
      startPosX+=16;
      if (startPosX >= 240){
        startPosX = 80;
        startPosY += 12;
      }
    }
  }
}

//function for C listeners
//
let craftableItems = {//test this in separate file cause it could get long
  "fishingpole":{"log":1, "string":1},
  "sail":{"log":4, "string":4, "hide":2},
  "leatherarmor":{"hide":6, "string":6}
};//

function craftItem(){
  let currentItem = null;//scroll here
  //defaults on first scroll in queue
  let scroll;
  let scrollPos;//scroll position to skip in raw item loop
  for (scroll in craftQueue){
    if (craftQueue[scroll].spriteData.scroll){
      currentItem = craftQueue[scroll].spriteData.scroll;
      break;
    }
  }
  if (currentItem === null){
    return;//didn't have any crafting scrolls in there
  }
  let rawItem;
  for (rawItem in craftQueue){
    if (rawItem===scrollPos){continue;};//no need to check scroll and duh it exists cause you put it there
    if (craftQueue[rawItem].spriteData.name==="scroll"){continue;};//maybe this check will work?1
    let invPos = player.inventory.findIndex(obj => obj.name === craftQueue[rawItem].spriteData.name);//player.inventory[invPos].amt to compare
    console.log(`checking invPos: ${invPos}`);
    //player doesn't have item in inventory, go to next iter in outer for loop
    if (invPos===-1){//why would it be in queue if it's not in inventory...?
      //console.log(`player doesn't have ${craftQueue[rawItem].name}`)
      popMessage(`You don't have any ${craftQueue[rawItem].name}`);
      craftQueue = [];
      return;
    }
    if (player.inventory[invPos].amt >= craftableItems[currentItem][craftQueue[rawItem].spriteData.name]){
      //player has item and enough of it, continue
      //console.log(`has enough ${player.inventory[invPos].itemObj.spriteData.name}`)
      continue;
    } else {
      //player has item but not enough, go to next iter in outer for loop
      //console.log(`not enough ${rawItem}`
      popMessage(`You don't have enough ${rawItem}`);
      craftQueue = [];
      return;
    }
  }
  //if get here craft item -- subtract required items from player.inventory and add crafted item to 
  let item;
  let craftingExp = 0;
  for (item in craftableItems[currentItem]){
    craftingExp+=1;//1 xp per item cost to make item
    //subtract item from player.inventory[invPos]
    let invPos = player.inventory.findIndex(obj => obj.name === item);
    if (player.inventory[invPos].amt){
      player.inventory[invPos].amt -= craftableItems[currentItem][item];
    }//else it a scroll or necessary crafting object
  }
  //add crafted item to inventory and increment experience
  player.incrementSkill("crafting", craftingExp);
  craftQueue = [];
  addToInv(currentItem);
  popMessage(`You crafted a ${currentItem}.`);
}

let playerCrafting = false;
let craftQueue = [];
function craftingTable(x, y){
  this.spriteData = JSON.parse(JSON.stringify(gameObjects['craftingtable']));
  this.spriteData.id = generateID();
  this.displayInterval = null;
  this.lastX = null;
  this.lastY = null;
  game_object_ids.push(this.spriteData.id);
  tile_map[x][y].objects.push(this.spriteData);
  //this.craftQueue = [];
  this.playerInteract = function(){
    if (playerCrafting){return;};
    //console.log("player is crafting...");
    this.lastX = playerX;
    this.lastY = playerY;
    playerCrafting=true;
    this.displayInterval = setInterval(() => {
      if (playerX !== this.lastX || playerY !== this.lastY || !playerCrafting){
        //console.log("player walked away from crafting table...");
        playerCrafting = false;
        craftQueue = [];
        this.lastX=null;
        this.lastY=null;
        clearInterval(this.displayInterval);
      }
    }, 250);
  }
}

let signMessage = '';
let showSign = false;
function Sign(x, y, message){//these *could* be reconstituted, but for now just hardcode them in cause maps pita
  this.spriteData = JSON.parse(JSON.stringify(gameObjects['sign']));
  this.spriteData.id = generateID();
  this.displayInterval = null;
  this.lastX = null;
  this.lastY = null;
  game_object_ids.push(this.spriteData.id);
  tile_map[x][y].objects.push(this.spriteData);
  this.playerInteract=function(){
    if (showSign){return;};//trying to prevent sign bug
    this.lastX = playerX;
    this.lastY = playerY;
    //display a message for the player
    //transparent tan, brown letters
    //disappears if player moves
    signMessage = message;
    showSign = true;
    this.displayInterval = setInterval(() => {
      if (playerX !== this.lastX || playerY !== this.lastY){
        showSign=false;
        signMessage = '';
        this.lastX=null;
        this.lastY=null;
        clearInterval(this.displayInterval);
      }
    }, 100);
  }
}

//ex) game_objects.push(new Sign(x, y, "Bottom left is inventory, scroll through and click/press F to use/equip item"))

function mapSign(x, y){
  this.spriteData = JSON.parse(JSON.stringify(gameObjects['mapsign']));
  this.spriteData.id=generateID();
  game_object_ids.push(this.spriteData.id);
  tile_map[x][y].objects.push(this.spriteData);
  this.playerInteract=function(){
    toggleMap();
  }
}//the fact that any map sprite you place works is probably going to be a bug later on... heheh

let playerSailing = false;
if (JSON.parse(localStorage.getItem("playerSailing"))===true){
  playerSailing=true;
}
let raftID = null;//gets set when playerRaft gets added to game objects
let playerRaft = null;//did it like this for reasons. why you so weird javascript

function Raft(x, y){
  this.spriteData = JSON.parse(JSON.stringify(gameObjects['raft']));
  this.spriteData.id=generateID();
  game_object_ids.push(this.spriteData.id);
  raftID=this.spriteData.id;
  this.x=x;
  this.y=y;
  if (!playerSailing){
    tile_map[this.x][this.y].objects.push(this.spriteData);
  }
  this.playerInteract = function(){
    if (player.inventory.findIndex(obj => obj.name==="sail")===-1){
      popMessage("How are you going to propel the craft?");
      return;//no sail? no sail.
    }
    let sailPos = player.inventory.findIndex(obj => obj.name==="sail");
    if (player.inventory[sailPos].amt<=0){
      popMessage("The raft lacks a sail.");
      return;
    }
    localStorage.setItem("playerSailing", JSON.stringify(true));
    //boat always in water, next to a path (can be on land or in water)
    //bool playerSailing = true; (changing from false)
    playerSailing = true;
    playerX = this.x;
    playerY = this.y;
    //remove spriteData from tile (add back when player disembarks)
    tile_map[this.x][this.y].objects = filterObjById(tile_map[this.x][this.y].objects, this.spriteData.id);//should work 
    popMessage("You hoist the sailand shove off from the dock.");
  }
}

function Lockeddoor(x, y, popupText=null){//popupText optional, otherwise popMessage("You unlock the door...");
  this.spriteData = JSON.parse(JSON.stringify(gameObjects['door2']));
  this.spriteData.id = generateID();
  this.x=x;
  this.y=y;
  tile_map[this.x][this.y].objects.push(this.spriteData);
  this.playerInteract = function(){
    let keyPos = player.inventory.findIndex(obj => obj.name ==="brasskey");//change to bronze key
    if (keyPos===-1){return;};//ya don't got no keys
    if (player.inventory[keyPos].amt <= 0){return;};//ya got a key holder but no keys
    if (!popupText){
      popMessage(`You release the padlock with a brass key...`);
    } else {
     popMessage(popupText);//just a nice option, useful for quest?
    }
    player.inventory[keyPos].amt -= 1;//player uses key
    //put a regular door in its place
    game_objects.push(new Opendoor(this.x, this.y));
    //door removes self
    let object;//needs separate fxn that takes sprite ID, much neater
    let count=0;
    for (object in tile_map[this.x][this.y].objects){
      if (tile_map[this.x][this.y].objects[object].id === this.spriteData.id){
        tile_map[this.x][this.y].objects.splice(count,1);
        break;
      }
      count+=1;
    }
    //remove from game objects (need to make this a separate fxn)
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

function Opendoor(x, y, popupText=null){
  this.spriteData = JSON.parse(JSON.stringify(gameObjects['door']));
  this.spriteData.id = generateID();
  game_object_ids.push(this.spriteData.id);
  this.x=x;
  this.y=y;
  this.checkInterval = null;
  this.mobBrokeTheDoorInterval = setInterval(() => {
    //check if door not there and player not standing there
    if (playerX!==this.x || playerY!==this.y){
      let object;
      for (object in tile_map[this.x][this.y].objects){
        if (tile_map[this.x][this.y].objects[object].hasOwnProperty("id")){
          if (tile_map[this.x][this.y].objects[object].id===this.spriteData.id){
            return;
          }
        }
      }
      //if here put the door spriteData back
      tile_map[this.x][this.y].objects.push(this.spriteData);
    }
  }, 5000);//lol
  tile_map[this.x][this.y].objects.push(this.spriteData);
  this.playerInteract = function(){
    if (popupText){
     popMessage(popupText);//just a nice option, useful for quest?
    }
    //override collision, remove door from tile while player is one it (setInterval), put door back
    //remove door sprite (but not object)
    let object;
    let count=0;
    for (object in tile_map[this.x][this.y].objects){
      if (tile_map[this.x][this.y].objects[object].id === this.spriteData.id){
        tile_map[this.x][this.y].objects.splice(count,1);
        break;
      }
      count+=1;
    }
    if (!this.checkInterval){
      this.checkInterval = setInterval(() => {
        if (playerX !== this.x || playerY !==this.y){
          clearInterval(this.checkInterval);
          this.checkInterval=null;
          //put door back
          tile_map[this.x][this.y].objects.push(this.spriteData);
        }
      }, 250);
    }
  }
}

//Treasurechest2 used for giving player scrolls (for now)
function Treasurechest2(x, y, item, scroll=null, popupText=null){//popup text tells what player got
  this.spriteData = JSON.parse(JSON.stringify(gameObjects['chest2']));
  this.spriteData.id = generateID();
  game_object_ids.push(this.spriteData.id);
  this.x=x;
  this.y=y;
  tile_map[this.x][this.y].objects.push(this.spriteData);
  this.playerInteract = function(){
   let keyPos = player.inventory.findIndex(obj => obj.name ==="key");
   if (keyPos===-1){return;};//ya don't got no keys
   if (player.inventory[keyPos].amt <= 0){return;};//ya got a key holder but no keys
   if (!popupText){
     popMessage(`You open the chest and find a ${item}`);
   } else {
    popMessage(popupText);//just a nice option, useful for quest?
   }
   player.inventory[keyPos].amt -= 1;//player uses key
   if (item in playerObjects){
       player.inventory.push({"name":item, "itemObj":new pObjList[item]})
   } else if (scroll === null){
       player.inventory.push({"name":item, "itemObj": gameObjects[item]})
   } else if (item==="scroll" && scroll!==null){
       let recipe = {"spriteData":JSON.parse(JSON.stringify(gameObjects['scroll']))};
       recipe.spriteData.scroll=scroll;
       player.inventory.push({"name":"scroll", "itemObj":recipe});
   }
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

function Treasurechest(x, y){
  this.spriteData = JSON.parse(JSON.stringify(gameObjects['chest2']));
  this.spriteData.id = generateID();
  game_object_ids.push(this.spriteData.id);
  this.x=x;
  this.y=y;
  tile_map[this.x][this.y].objects.push(this.spriteData);
  this.playerInteract = function(){
    //if player has key (dropped by skeleton by chance)
    //just like loot bag, maybe could combine fxns?
    if (!player.inventory.some(obj => obj.hasOwnProperty("name") && obj["name"]==="sword")){
      player.inventory.push({"name":"ironsword", "itemObj":new Ironsword})
    }
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

function Lootbag(name, x, y, item){//dead spider's x,y. add this on death
  //name is from what dropped it, determines what goes in bag
  this.spriteData = JSON.parse(JSON.stringify(gameObjects['lootbag']));
  this.spriteData.id = generateID();
  game_object_ids.push(this.spriteData.id);//not necessary?
  this.x=x;
  this.y=y;
  tile_map[playerX][playerY].objects.push(this.spriteData);//how the hell is this working?
  this.playerInteract=function(){
    //put stuff in player inv and delete self
    if (player.inventory.find(obj => obj.name === item)){
      let invPos;
      invPos = player.inventory.findIndex(obj => obj.name ===item);
      player.inventory[invPos].amt += 1;
    } else {
      player.inventory.push({'name':item, 'amt':1, "itemObj":{"spriteData":gameObjects[item]}});
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
function playSound(sound){
  if (!muteSound){
    sound.play();
  }
}

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
    if (player.holding.name==='fishingpole' || playerSailing){
      popMessage("You got struck by lightning!");
      player.getAttacked(15);
    }
  }
});

function playRain(){
  if (raining){
    if (muteSound){
      rain_sound.volume = 0;
    } else {
      rain_sound.volume = 1;
    }
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

//gradients for rain and being underground/in dark place
const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 10, canvas.width/2, canvas.height/2, canvas.width/1.5);
const blackGradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 10, canvas.width/2, canvas.height/2, canvas.width/1.5);
blackGradient.addColorStop(0, "transparent");
blackGradient.addColorStop(1, "Black");
gradient.addColorStop(0,"transparent");
gradient.addColorStop(1, "DarkGray");

////////////////////////////////////////////////////////////////////////NEW UI TESTING REMOVE IF SUCKS

////////////////////////////////////////////////////////////////////////END NEW UI TESTING REMOVE IF IT SUCKS

var functionObjs={"mapsign":mapSign, "dungeonStairs":dungeonStairs, "chest2":Treasurechest};

function mapLoaded(){//builds map, reconstituting any objects that had functions in them
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
if (masterDebug && dropdown){
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
}

// add arrow key listener for desktop users
let timerId;
var delay = 30;

//let lastMove

document.addEventListener('keydown', (event) => {
  if (event.target.nodeName==='SELECT') {
    return;
  }
    switch (event.key) {
      case 'c':
      case 'C':
        if (playerCrafting){
          craftItem();
        }
        break;
      case 'f':
      case 'F':
        //need to check if playerCrafting so it adds to craftQueue instead
        player.equip();
        break;
      case ' ':
        if (masterDebug){
          placeTile(objectToPlace);
        }
        break;
      case 'ArrowUp':
      case 'w':
        movePlayer('up', true);
        break;
      case 'ArrowDown':
      case 's':
        movePlayer('down', true);
        break;
      case 'ArrowLeft':
      case 'a':
        movePlayer('left', true);
        break;
      case 'ArrowRight':
      case 'd':
        movePlayer('right', true);
        break;
      default:
        break;
    }

});

document.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
      movePlayer('up', false);
      break;
    case 'ArrowDown':
    case 's':
      movePlayer('down', false);
      break;
    case 'ArrowLeft':
    case 'a':
      movePlayer('left', false);
      break;
    case 'ArrowRight':
    case 'd':
      movePlayer('right', false);
      break;
    default:
      break;
  }
});


if (masterDebug && document.getElementById("placeButton")!==null && document.getElementById("resetButton")!==null && document.getElementById("saveButton")!==null && document.getElementById("resetTileButton")!==null && document.getElementById("collisionButton")!==null){
  document.getElementById('placeButton').addEventListener('click', () => placeTile(objectToPlace));
  document.getElementById('resetButton').addEventListener('click', () => clearUserMap());
  document.getElementById('saveButton').addEventListener('click', () => saveToLocal());
  document.getElementById('resetTileButton').addEventListener('click', () => resetTile());
  document.getElementById('collisionButton').addEventListener('click', () => toggleCollision());
}

document.getElementById('rainButton').addEventListener('click', () => toggleRain());
document.getElementById('stuckButton').addEventListener('click', () => toggleStuck());
document.getElementById('statDropButton').addEventListener('click', () => toggleDrops());

function isTopLeftClicked(event, uicanvas){
  const rect = uicanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return x < 25 && y < 25;
}

function isCraftingClicked(event, uicanvas){
  const rect = uicanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return x > 132 && x < 150 && y > 180 && y < 200; //134,184
}

function clickedStatToggle(event, uicanvas){
  const rect = uicanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return x < 25 && y < 300 && y > 260;
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
  return x > 275 && y < 235 && y > 215;
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
  console.log('click');
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
  if (isCraftingClicked(event, canvas)){
    if (playerCrafting){
      craftItem();//also need exit button maybe?
    }
  }
});

canvas.addEventListener('touchend', event => {
  if (isCraftingClicked(event.touches[0], canvas)){
    if (playerCrafting){//this way, C tap icon could be in same place as a button from another popup but doesn't run because playerCrafting !=true etc
      craftItem();
    }
  }
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


if (masterDebug && document.getElementById("file-input")!==null){
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
}



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


if (masterDebug && document.getElementById("download-button")!==null){
  const downloadButton = document.getElementById('download-button');
  downloadButton.addEventListener('click', () => {
    downloadArrayAsJSFile(localStorage['userMap'], "my_map");
  })
}
//end UI setup//////////////////////////////////////////////////////////////////////////////////////


//extra player functions (npcs might be able to use some of these too)////////////////////////////////

let cookList = {"fish":"cookedfish", "tunafish":"cookedtuna"};
function cook(name){
  //cook or eat item, coming from useItem. works for now
  let invPos = player.inventory.findIndex(obj => obj.name ===name);
  if (!cookList.hasOwnProperty(player.inventory[invPos].name)){return;};
  console.log(player.inventory[invPos].name);
  if (player.inventory[invPos].amt > 0){
    if (nextToFire()){
      //cook it, add cooked fish to player inventory
      player.inventory[invPos].amt-=1;
      addToInv(cookList[name]);
      //console.log("cooked fish!");
      popMessage(`You cook the ${name}!`);
      player.incrementSkill("cooking", 5);
      player.incrementSkill("survival", 5);
      }
    else {
        popMessage("Find a fire...");
    }
  } else {
    popMessage(`You don't have any ${name} to cook.`);
  }
}

let foodInfo = {
  //food by name
  "fish":{
    "health":0,
    "time":0
  },
  "cookedfish":{
    "health":5,//implying positive 2, maybe some food is poisonous! or food health could have chance to heal +/-, etc
    "time":0//might just be for template and not used for basic fish, but timer to detect player move or player pukes
  },
  "apple":{
    "health":3,
    "time":0,
    "poison":true,
    "factor":15
  },
  "tunafish":{
    "health":5,
    "time":0,
    "poison":true,
    "factor":12
  },
  "cookedtuna":{
    "health":10,
    "time":0,
  }
}

function eat(name){
  //get inv pos
  //if player.inventory[invPos].amt>1, add corresponding hp and subtract 1 from amt
  let invPos = player.inventory.findIndex(obj => obj.name ===name);
  let heals;
  if (player.inventory[invPos].amt > 0){
    if (foodInfo[name].poison){
      let negativePositive = [1,-1];//for either or chance
      let survivalFactor = Math.floor(Math.random()*player.skills.survival.lvl) + foodInfo[name].health;
      let poisonFactor = Math.floor(Math.random()*foodInfo[name].factor)*-1;
      heals = survivalFactor + poisonFactor;//works for now
      if (heals < 0){
        player.incrementSkill("survival", 5);
      }
    } else{
      heals = foodInfo[name].health;
    }
    let eatText = '';
    if (heals>0){
      eatText = `You eat the ${name} and you feel invigorated.`;
    } else {
      eatText = `You eat the ${name} without checking it first and you get sick!`;

    }
    popMessage(eatText);
    player.inventory[invPos].amt-=1;
    player.skills.health.health+=heals;
    if (player.skills.health.health > player.skills.health.max){
      player.skills.health.health = player.skills.health.max;
    }
  } else {
    console.log(`you don't have any ${name}`);
  }
}

//list of things that useItem checks if  you are next to - list order matters as first in list takes precedence
let useCraftList = ['craftingtable']

function nextTo(name){//this can prob replace nextToFire
  if (playerSailing){return false;}//maybe there should be water crafting? lol
  let coordList = surroundingTiles(playerX, playerY);//this func scalable?
  var coord;
  for (coord in coordList){
    //check each tile for a firepit
    if (tile_map[coordList[coord][0]][coordList[coord][1]].objects.length > 0){
      var object;
      for (object in tile_map[coordList[coord][0]][coordList[coord][1]].objects){
        //if (!tile_map[coordList[coord][0]][coordList[coord][1]].objects[object]){return false;};
        if (!tile_map[coordList[coord][0]][coordList[coord][1]].objects[object]){return false;};
        if (tile_map[coordList[coord][0]][coordList[coord][1]].objects[object].name===name){
          return true;
        }
      }
    }
  }
  return false;
}

function useItem(name){//maybe make a separate file of player related functions? (like hyggeland bulk)
  console.log(name);
  if (nextTo('campfire') && name in foodInfo){//maybe best to keep this separate?
    cook(name);
    return;
  }
  switch(name){
    case "cookedfish":
    case "fish":
    case "apple":
    case "tunafish":
    case "cookedtuna":
    //other edible cases here
      eat(name)
      return;
  }

}

function addToInv(name){
  if (name in playerObjects){
    player.inventory.push({"name":name, "itemObj":new pObjList[name]});
    return;
  }
  if (player.inventory.find(obj => obj.name === name)){
    let invPos = player.inventory.findIndex(obj => obj.name ===name);
    player.inventory[invPos].amt += 1;
  } else {
    player.inventory.push({'name':name, 'amt':1, "itemObj":{"spriteData":gameObjects[name]}})
  }
}

//end extra player functions//////////////////////////////////////////////////////////////////////////

//set up ghost player///////////////////////////////////////////////////////////////////////////////
function Player(){
  this.lastDirection = null;
  this.lastTime = Date.now();
  this.lastMove = Date.now();
  this.regenTime=5000;
  this.gotHit = false;
  this.skills = {
    "walking":{"xp":0,"lvl":1},
    "strength":{"xp":0,"lvl":1},
    "defense":{"xp":0, "lvl":1},
    "health":{"xp":0,"health":100,"max":100, "lvl":1},
    "playerLvl":1,
    "woodcutting":{"xp":0,"lvl":1},
    "fishing":{"xp":0, "lvl":1},
    "crafting":{"xp":0, "lvl":1},
    "survival":{"xp":0, "lvl":1}
  };
  this.inventory = [];
  this.lastInventory = JSON.stringify(this.inventory);
  this.invPosition = 0;//first item in inventory
  this.holding={
    "name":"nothing",//empty handed this is default, would use from spriteData, but nothing has no spriteData
    "itemObj":null//remove item object from inventory and put it here
  };
  this.body={//body armor
    "name":"nothing",
    "itemObj":null
  };
  this.update = function(){
    if (nextTo('campfire')){
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
        //localStorage['playerStats']=JSON.stringify(this.skills);
        localStorage.setItem("playerStats", JSON.stringify(this.skills));
        //localStorage['playerInv']=JSON.stringify(this.inventory)
        deathScreen();
        localStorage.setItem("playerLoc", JSON.stringify([26,19]));
        localStorage.setItem("raftLoc", JSON.stringify([34, 42]));
        localStorage.setItem("playerSailing", JSON.stringify("false"));
        //put Raft back at pier
        localStorage.setItem("tileMapSector", "main");
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
  this.usableItems = ['fish', 'cookedfish', 'apple', 'tunafish', 'cookedtuna'];
  //equip is really just player use
  this.equip = function(){//if item equipped, unequip it. if not equipped, equip it.
                              //if item equipped and equipping a different item, switch it.
                              //item 
    let itemObject = player.inventory[player.invPosition].itemObj;
    console.log(itemObject.spriteData.name);
    //crafting
    if (playerCrafting){
      //put item in craftQueue
      if (craftQueue.length>=20){return;};
      craftQueue.push(itemObject);
      return;//could be problematic, but work for now
    }
    //equip, unequip or switch current item if itemObject.equippable!==undefined
    if (nextTo('trashcan') && itemObject!==player.holding.itemObj){//next to can and don't have it equipped? chunk it into the abyss
      player.inventory.splice(player.invPosition,1);
      popMessage("You throw the item into the trashcan.");
      return;
    }
    if (nextTo('stump3') || nextTo('stump2')){//2 & 3 look the same, prob get rid of one lol
      if (player.inventory[player.invPosition].name==="log" && player.holding.name==="axe"){
        //split logs, add new or increment in player.inventory
        //split logs will have to be new item, possibly new sprite
        popMessage("You split a log");
        return;
      }
    }
    if (itemObject===player.holding.itemObj){
      //unequip
      player.holding={"name":"nothing", "itemObj":null};
    }
    else if (itemObject.equippable===true){//player.holding.name==="nothing" && itemObject.equippable===true){
      player.holding={"name":itemObject.spriteData.name, "itemObj":itemObject};
      return;
    }
    else if (itemObject.body && itemObject.body===true){
      if (itemObject===player.body.itemObj){
        player.body={"name":"nothing", "itemObj":null};
      } else {
        player.body={"name":itemObject.spriteData.name, "itemObj":itemObject};
      }
    }
    else if (this.usableItems.includes(itemObject.spriteData.name)){
      console.log(itemObject.name);
      //useItem(itemObject.name)
      //fxn that checks name player holding, amt, what player is standing next to/on, sailing etc
      //    eg) holding axe, use log, standing on
      useItem(itemObject.spriteData.name);
      return;
    }
    if (player.inventory[player.invPosition].name==="scroll"){
      let recipeText = '';
      recipeText += `${player.inventory[player.invPosition].itemObj.spriteData.scroll}: `;
      let ingredient;
      for (ingredient in craftableItems[player.inventory[player.invPosition].itemObj.spriteData.scroll]){
        recipeText += ` ${ingredient}:${craftableItems[player.inventory[player.invPosition].itemObj.spriteData.scroll][ingredient]}`
      }
      popMessage(recipeText);
      return;
    }
  }//look below!

  //need a craft function activated by clicking/pressing/tapping C. that way can have usableItems and craftableItems

  this.incrementSkill = function(skill, amount){
    this.skills[skill].xp+=amount;

    if (showDrops && skill!=="walking"){
      offset+=200;
      if (offset>1000){
        offset = 0;
      }
      setTimeout(() => {
        dropList.push({"text":skill, "amount":amount, "coords":dropCoords()});
      },offset);
    }
    
    //localStorage['playerStats']=JSON.stringify(this.skills);
    localStorage.setItem("playerStats", JSON.stringify(this.skills));
    //then check if skill leveled up
  }

  this.checkLevelUp = function (skill, hp=false){
    let xpNeeded = Math.floor(83 * (Math.pow(1.10408951367, skill.lvl - 1)));
  
    if (skill.xp >= xpNeeded){
      if (!hp){
        skill.lvl++;
        skill.xp = skill.xp - xpNeeded;
      } else {
        skill.xp=0;
        skill.lvl++;
        skill.health+=2;
        skill.max+=2;
      }
    }
  }
  this.attack = function(target){
    console.log(target);
    let bonus = 0;
    if (this.holding.name!=="nothing"){
      bonus = this.holding.itemObj.attBonus;
    }
    //maybe other worn items have att bonus also, check slot and add to bonus accordingly
    if (playerSailing){
      this.skills.health.health-=Math.floor(Math.random()*25);
      this.incrementSkill("strength", -10);
      this.incrementSkill("survival", +5);
      popMessage("You slip and bust your ass in the raft trying to be cute...");
    }
    target.getAttacked(this.skills.strength.lvl + bonus);
    playSound(hit_sound);
  }
  this.getAttacked = function(damage){
    let dodge = Math.floor(Math.random()*this.skills.defense.lvl);
    console.log("dodge:" + dodge);
    if (player.body.name!=="nothing"){
      dodge += Math.floor(Math.random()*player.body.itemObj.defBonus);
    }//and any other bonuses or handicaps
    console.log("dodge: " + dodge);
    damage-=dodge;
    if (damage > 0){
      this.skills.health['health']-=damage;
      this.gotHit = true;//checked and turned off in drawPlayer
    } else {
      //player dodges hit
      popMessage("You dodge an attack!");
    }
    
    //localStorage['playerStats']=JSON.stringify(this.skills);
    localStorage.setItem("playerStats", JSON.stringify(this.skills));
    playSound(hit_sound);
  }
  this.frozen = false;
  this.frozenTimeout = null;
  this.freeze = function(duration){
    if (!this.frozen){
      //set interval to prevent player movement?
      this.frozen = true;
      this.frozenTimeout = setTimeout(() => {
        this.frozen=false;
        clearTimeout(this.frozenTimeout);
      }, duration);
    }
  }
}

let player = new Player();

var playerX;
var playerY;//man why aint these just in Player?

player.skills.health['health']=player.skills.health.max;


var playerLoc = localStorage.getItem("playerLoc");
if (playerLoc!==null){
  playerLoc=JSON.parse(playerLoc);
  playerX=playerLoc[0];
  playerY=playerLoc[1];
} else {
  playerX=26;
  playerY=19;
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
  if (!player.skills.crafting){
    player.skills['crafting']={"xp":0, "lvl":1};
  }
  if (!player.skills.survival){
    player.skills['survival']={"xp":0, "lvl":1};
  }
  if (!player.skills.defense){
    player.skills['defense']={"xp":0, "lvl":1};
  }
  if (!player.skills.cooking){
    player.skills['cooking']={"xp":0, "lvl":1};
  }
}
//get inventory from local
var pObjList = {
  "axe":Axe,
  "fishingpole":Fishingpole,
  "ironsword":Ironsword,
  "leatherarmor":Leatherarmor
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
/*
if (!player.inventory.some(obj => obj.hasOwnProperty("name") && obj["name"]==="fishingpole")){
  //player.holding={"name":"nothing", "itemObj":null};
  player.inventory.push({"name":"fishingpole", "itemObj":new Fishingpole})
}
*/

function saveInventoryToLocal(){
  let saveList = [];
  let obj;
  for (obj in player.inventory){
    if (player.inventory[obj].itemObj.spriteData.name in playerObjects){
      //it an axe or fishing pole etc, see base_tiles.js/playerObjects
      saveList.push({"name":player.inventory[obj].itemObj.spriteData.name, "itemObj":null});//might can just put null as itemObj, not using it?
    } else {
      //it something like log or string that can be directly JSON.stringified
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


var itemInteractObjs = {'tree':'axe', 'mushroom':'axe'};//need base tile interact objs too? like in case of rock///////////////////////PICKAXE NOTE
function interactObject(nextX, nextY){
  let object;
  let interacted = false;
  //WHAT IS WRONG WITH THIS PART?//////////////////////////////////////////////////////////////////////FIX IT'
  for (object in tile_map[nextX][nextY].objects){
    if (tile_map[nextX][nextY].objects[object].id===null || tile_map[nextX][nextY].objects[object].id==='undefined'){
      continue;
    }
    if (tile_map[nextX][nextY].objects[object].type==="object"){
      let targetObj;
      let obj;
      for (obj in game_objects){
        if (JSON.stringify(tile_map[nextX][nextY].objects[object])===JSON.stringify(game_objects[obj].spriteData)){
          targetObj = game_objects[obj];
        }
      }
      if (hasFunction(targetObj, "playerInteract")){
        targetObj.playerInteract();
        interacted = true;//wait was this one necessary?
      }
    }
    
    //PAST THIS POINT SEEMS TO BE WORKING/////////////////////////////////////////////////////////////////////////FIX IT
    //object is tree, other tile object that is gettable with held item or inv item
    if (!interacted){
      if (itemInteractObjs[tile_map[nextX][nextY].objects[object].name]!==undefined){
        //it is a tree or other item interactable obj
        if (player.holding.name === itemInteractObjs[tile_map[nextX][nextY].objects[object].name]){
          //do thing with obj
          player.holding.itemObj.action(nextX, nextY);
        }
      }
    }
  }
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
  if (playerSailing){return false;}
  let coordList = surroundingTiles(playerX, playerY);
  var coord;
  for (coord in coordList){
    //check each tile for a firepit
    if (tile_map[coordList[coord][0]][coordList[coord][1]].objects.length > 0){
      var object;
      for (object in tile_map[coordList[coord][0]][coordList[coord][1]].objects){
        //if (!tile_map[coordList[coord][0]][coordList[coord][1]].objects[object]){return false;};
        if (!tile_map[coordList[coord][0]][coordList[coord][1]].objects[object]){return false;};
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

let movementInterval = null;

function movePlayer(direction, keyDown) {
  if (player.frozen === true) {
    return;
  }
  if (keyDown) {
    if (movementInterval === null) {
      movementInterval = setInterval(() => {
        if (player.lastMove+200-(player.skills.walking.lvl)>Date.now()){
          return;
        } else {
          player.lastMove=Date.now();
        }
        let potentialX = playerX;
        let potentialY = playerY;
      
        if (direction === 'up') {//check y-1
          player.lastDirection = 'up';
          if (playerY-1 > 9) {
            potentialY = playerY-1;
          }
        }
      
        if (direction === 'down') {//check y+1
          player.lastDirection = 'down';
          if (playerY+1 < 91) {
            potentialY = playerY+1;
          }
        }
      
        if (direction === 'left') {//check x-1
          player.lastDirection = 'left';
          if (playerX-1 > 9) {
            potentialX = playerX-1;
          }
          ghostFacing = 'lt';
        }
      
        if (direction === 'right') {//check x+1
          player.lastDirection = 'right';
          if (playerX+1 < 91) {
            potentialX = playerX+1;
          }
          ghostFacing = 'rt';
        }
      
        let collision = interactNext(potentialX, potentialY);//player interacts with objects on potential tile, returns true if collide
        if (collision === true) {
          return;
        }
      
        if (potentialX !== playerX || potentialY !== playerY) {
          player.incrementSkill('walking', 1);
        }
      
        playerX = potentialX;
        playerY = potentialY;
      
        if (!reloading) {
          localStorage.setItem('playerLoc', JSON.stringify([playerX, playerY]));
        }
      }, );
    }
  } else {
    clearInterval(movementInterval);
    movementInterval = null;
    return;
  }
}
/*
  if (player.frozen === true) {
    return;
  }
*/
  /*
  if (Date.now() < player.lastMove + 100) {
    return;
  }

  player.lastMove = Date.now();
  */

function drawPlayer(){
    let ghostLoc;
    let hitSprite;
    if (ghostFacing==="rt"){
      ghostLoc = ghostR
      hitSprite = baseTiles['hitOutlineRight'];
    } else {
      ghostLoc = ghostL
      hitSprite = baseTiles['hitOutlineLeft'];
    };
    let drawPointX, drawPointY;
    if (playerX>10){drawPointX=10} else{drawPointX=playerX}
    if (playerY>10){drawPointY=10} else{drawPointY=playerY}
    //if playerSailing, draw raft first
    if (playerSailing){
      ctx.drawImage(spriteSheet, baseTiles['raft'][0], baseTiles['raft'][1], 16,16,
        drawPointX*BLOCKSIZE-BLOCKSIZE, drawPointY*BLOCKSIZE-BLOCKSIZE, 16, 16);
    }
    ctx.drawImage(spriteSheet, ghostLoc[0],ghostLoc[1], 16,16,
        drawPointX*BLOCKSIZE-BLOCKSIZE, drawPointY*BLOCKSIZE-BLOCKSIZE, 16,16);
    if (player.gotHit){
      console.log("drawing player hit");
      player.gotHit = false;
      ctx.drawImage(spriteSheet, hitSprite[0], hitSprite[1], 16,16,
        drawPointX*BLOCKSIZE-BLOCKSIZE-1, drawPointY*BLOCKSIZE-BLOCKSIZE, 16, 16);
    }
    //then draw any items player is wearing/holding, probably wearing first
    if (player.holding.name!=="nothing"){
      ctx.drawImage(spriteSheet, player.holding.itemObj.spriteData.holdSprite[ghostFacing][0], player.holding.itemObj.spriteData.holdSprite[ghostFacing][1],
        16,16, drawPointX*BLOCKSIZE-BLOCKSIZE, drawPointY*BLOCKSIZE-BLOCKSIZE, 16, 16);
    }
    if (player.body.name!=="nothing"){
      ctx.drawImage(spriteSheet, player.body.itemObj.spriteData.holdSprite[ghostFacing][0], player.body.itemObj.spriteData.holdSprite[ghostFacing][1],
        16,16, drawPointX*BLOCKSIZE-BLOCKSIZE, drawPointY*BLOCKSIZE-BLOCKSIZE, 16, 16);
    }
    //if playerSailing, overlay sail
    if (playerSailing){
      ctx.drawImage(spriteSheet, baseTiles['sail'][0], baseTiles['sail'][1], 16,16,
      drawPointX*BLOCKSIZE-BLOCKSIZE-2, drawPointY*BLOCKSIZE-BLOCKSIZE, 16, 16);
    }
}

function drawInv(){
  ctx.fillStyle = "rgba(139, 69, 19, 0.75)";
  ctx.fillRect(275, 240, 20,20);
  if (player.inventory.length===0){
    //draw x for inv item
    ctx.drawImage(spriteSheet, baseTiles['redX'][0], baseTiles['redX'][1], 16,16,
      275,240, 20,20)
  } else {
    //draw inventory position
    if (!player.inventory[player.invPosition] && !player.inventory[player.invPosition]){
      player.invPosition=0;//seems to fix bug where inventory UI disappears on deleting certain items
    }
    if (player.inventory[player.invPosition].itemObj.spriteData.name==="scroll"){
      ctx.drawImage(spriteSheet, baseTiles['scroll'][0], baseTiles['scroll'][1], 16, 16,
        275, 240, 20,20);
      //then have to see if it a player obj or other type obj //pObjList
      let overlaySprite = null;//coords
      if (player.inventory[player.invPosition].itemObj.spriteData.scroll in playerObjects){
        overlaySprite = playerObjects[player.inventory[player.invPosition].itemObj.spriteData.scroll].itemSprite;
      } else {
        overlaySprite = gameObjects[player.inventory[player.invPosition].itemObj.spriteData.scroll].sprite;
      }
      ctx.drawImage(spriteSheet, overlaySprite[0], overlaySprite[1], 16, 16,
        275+6, 240+4, 10,10);  
    } else {
      ctx.drawImage(spriteSheet, player.inventory[player.invPosition].itemObj.spriteData.itemSprite[0], player.inventory[player.invPosition].itemObj.spriteData.itemSprite[1], 16,16
        ,275,240, 20,20);
    }
    ctx.fillStyle="white";
    let itemAmt = player.inventory[player.invPosition].amt;
    if (player.inventory[player.invPosition].itemObj.spriteData.name in playerObjects){
      itemAmt = 1;
    }
    else if (!itemAmt){
      itemAmt=0;
    }
    ctx.fillText(`${itemAmt}`,275,247)
  }
  //draw arrows baseTile['upArrow'/'downArrow']
  /*
  ctx.drawImage(spriteSheet, baseTiles['upArrow'][0], baseTiles['upArrow'][1], 16,16
    ,260,210, 50,40);
  ctx.drawImage(spriteSheet, baseTiles['downArrow'][0], baseTiles['downArrow'][1], 16,16
    ,262,250, 50,40);
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
  return x > 275 && y < 235 && y > 215;
}
  */

  drawIcon("UPARROW", 275, 220);
  drawIcon("DOWNARROW", 275, 265);
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

let fishList = {//another thing for another file?
  "fish":{
    "xp":5
  },
  "tunafish":{
    "xp":10
  }
}
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
      tile_map[this.bobberX][this.bobberY].objects = filterObjByKeyVal(tile_map[this.bobberX][this.bobberY].objects, "name", "bobber");
    }
    if (tile_map[x][y].sprite.name!=='water'){
      return;
    }
    if (tile_map[x][y].sprite.name==='water'){
      popMessage("You cast your line out...");
      playSound(fish_sound);
      //add bobber to next tile
      if (playerSailing){
        //+1 to direction so as not to go under boat
        switch(player.lastDirection){
          case "up":
            y-=1;
            break;
          case "down":
            y+=1;
            break;
          case "left":
            x-=1;
            break;
          case "right":
            x+=1;
            break;
        }
      }
      tile_map[x][y].objects.push(gameObjects['bobber']);
      this.bobberX=x;
      this.bobberY=y;
      this.isFishing = setTimeout(() =>{
        tile_map[this.bobberX][this.bobberY].objects = filterObjByKeyVal(tile_map[this.bobberX][this.bobberY].objects, "name", "bobber");
        //console.log("something is tugging at the line!");//change to dropList text
        popMessage("Something is tugging at the line!");
        if (Math.floor(Math.random()*player.skills.survival.lvl) + Math.floor(Math.random()*player.skills.fishing.lvl) < Math.floor(Math.random()*8)){
          popMessage("Your fishing pole snapped in half!");
          removeFirstOfItem("fishingpole");
          player.holding={"name":"nothing", "itemObj":null};
          return;
        }
        if (Math.floor(Math.random()*player.skills.fishing.lvl) >= Math.floor(Math.random()*4)){
          //draw fish on next tile
          //pick random fish, high chance for regular fish, lower chance for tuna and up
          //then "You caught a [fish]!"  in dropList 
          let caughtFish = weightedRandomSelection(fishList, player.skills.fishing.lvl);
          popMessage(`You caught a ${caughtFish}!`);
          tile_map[x][y].objects.push(gameObjects[caughtFish]);
          setTimeout(() => {
            tile_map[this.bobberX][this.bobberY].objects = filterObjByKeyVal(tile_map[this.bobberX][this.bobberY].objects, "name", caughtFish);
          }, 1000)
          player.incrementSkill('fishing', fishList[caughtFish].xp);//change to be xp of fish caught
          //next update choose random fish, regular fish  high chance, rare fish low chance (duh)
          if (player.inventory.find(obj => obj.name === caughtFish)){//going to change to random fish or randomize fish in pool
            let invPos = player.inventory.findIndex(obj => obj.name ===caughtFish);
            player.inventory[invPos].amt += 1;
          } else {
            player.inventory.push({'name':caughtFish, 'amt':1, "itemObj":{"spriteData":gameObjects[caughtFish]}})
          }
        } else {
          //console.log("it got away...");  dropList text]
          popMessage("It got away...");
        }
      }, 5000);
    }
  }
}

function Leatherarmor(){
  this.equippable=false;
  this.body=true;
  this.spriteData = JSON.parse(JSON.stringify(playerObjects['leatherarmor']));
  this.spriteData.id = generateID();
  this.attBonus=0;
  this.defBonus=4;
  this.isHeld=false;
  this.onGround=false;
  this.action = function(x, y){
    //again don't need but might need for later
  }
}

function Ironsword(){
  this.equippable=true;
  this.spriteData = JSON.parse(JSON.stringify(playerObjects['ironsword']));
  this.spriteData.id = generateID();
  this.attBonus = 5;
  this.isHeld = false;
  this.onGround = false;
  this.action = function(x, y){
    //guess it doesn't really need action *yet*
    //sword_slash.play();
  }
}

let treesChopped = 0;//testing
let whacksPerTree = 0;
let whackValues = [];//append whacksPerTree here. whack rate is total of whackValues divided by whackValues.length (or treesChopped)
let whackRate = null;
let lastWhack = Date.now();
function Axe(){//ex) player obtains axe, player.inventory.push(new Axe())
  this.equippable=true;
  this.spriteData = JSON.parse(JSON.stringify(playerObjects['axe']));
  this.spriteData.id = generateID();
  this.attBonus = 2;//add 2 to player attack if held
  this.isHeld = false;
  this.onGround = false;
  //this.action = axeAction;
  this.action = function(x, y){//, object_name){//for chopping trees, attack is just a bonus to melee. could add attack type?
    
    if (lastWhack+500>Date.now()){
      return;
    }
    
    else {
      lastWhack=Date.now()//need to absolutely make sure this separate instance of changing player.lastMove won't fuck anything up
    }
  
    let object;
    let invPos;
    for (object in tile_map[x][y].objects){
      if (tile_map[x][y].objects[object].name==='tree'){//it already checked for this no?
        playSound(chop);
        whacksPerTree+=1;
        if (Math.floor(Math.random()*player.skills.woodcutting.lvl) >= Math.floor(Math.random()*20)){//then this would be for whatever item player chopping, but still only apple chance on trees
          treesChopped+=1;
          whackValues.push(whacksPerTree);
          let value;
          let total = 0;
          for (value in whackValues){
            total+=whackValues[value];
          }
          whackRate=Math.floor(total/treesChopped);//(or whackValues.length)
          console.log(`Trees chopped: ${treesChopped}`);
          console.log(`Hwhacks per last tree: ${whacksPerTree}`);
          console.log(`Hwhack Rate: ${whackRate}`);
          whacksPerTree=0;
          player.incrementSkill('woodcutting', 1);
          if (player.inventory.find(obj => obj.name === 'log')){
            invPos = player.inventory.findIndex(obj => obj.name ==='log');
            player.inventory[invPos].amt += 1;
          } else {
            //player.inventory.push({'name':'log', 'amt':1, "itemObj":{"spriteData":gameObjects['log']}})
            addToInv("tree");
          }
          //apple chance
          if (Math.floor(Math.random()*100) > 50){
            if (player.inventory.find(obj => obj.name === 'apple')){
              invPos = player.inventory.findIndex(obj => obj.name ==='apple');
              player.inventory[invPos].amt += 1;
            } else {
              player.inventory.push({'name':'apple', 'amt':1, "itemObj":{"spriteData":gameObjects['apple']}})
            }
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
  console.log("refresh to clear, place another tile before refreshing to cancel");
}

let reloading = false;

//pretty obvious function. works for player and npcs (so far)
function checkCollision(nextX, nextY, npc=false){
  if (!tile_map || reloading){
    return;
  }
  if (nextX < 11 || nextX > 89 || nextY < 11 || nextY > 89){
    //case of main map VVV
    //prob need to make this own function to keep checkCollision clean
    if (localStorage.getItem("tileMapSector")==="main" && playerSailing && nextY < 11){
      //set playerY to 89, playerX stays same because you can only exit with raft from north of map anyway
      playerY = 89;
      playerRaft.y = 89;
      localStorage.setItem("playerLoc", JSON.stringify([playerX, 89]));
      localStorage.setItem("raftLoc", JSON.stringify([playerX, 89]));
      //new map and reload
      localStorage.setItem("tileMapSector", "northsea");
      reloading = true;
      location.reload();
      return;
    }
    else if (localStorage.getItem("tileMapSector")==="northsea"){
      //will have to handle all directions now
      //for now just north
      if (nextY > 89){
        playerY=11;//why is this not working
        playerRaft.y = 11;
        localStorage.setItem("playerLoc", JSON.stringify([playerX, 11]));
        localStorage.setItem("raftLoc", JSON.stringify([playerX, 11]));
        //new map and reload
        localStorage.setItem("tileMapSector", "main");
        reloading = true;
        location.reload();
        return;
      }
    }
  }
  var object;
  for (object in tile_map[nextX][nextY]['objects']){
    if (tile_map[nextX][nextY]['objects'][object]['collision']===true){
      return true
    }
  }
  //always run the above, so objects in water can't be collided with!
  if (playerSailing && npc===false){//only runs for player
    let paths = footPathCheck(tile_map[nextX][nextY].objects, "name", "path", 4);
    if (tile_map[nextX][nextY].sprite.name==='water' && paths===0){
      playerRaft.x = nextX;
      playerRaft.y = nextY;
      localStorage.setItem("raftLoc", JSON.stringify([playerRaft.x, playerRaft.y]));
      return false;
    } 
    else if (paths>0){
      console.log("disembark");
      //disembark
      localStorage.setItem("playerSailing", JSON.stringify(false));
      localStorage.setItem("raftLoc", JSON.stringify([playerRaft.x, playerRaft.y]));
      playerSailing = false;
      tile_map[playerX][playerY].objects.push(
        //get Raft spriteData from game_objects
        getSpriteDataById(game_objects, raftID)
      );
      localStorage.setItem("raftLoc", JSON.stringify([playerRaft.x, playerRaft.y]));
      //chance to break sail when disembarking
      //need fxn removeFirstOfItem(name);
      if (Math.floor(Math.random()*player.skills.survival.lvl) < Math.floor(Math.random()*30)){
        //sail breaks, remove one from player inventory
        popMessage("You clipped the pier and broke your sail!");
        removeFirstOfItem("sail");
      }
      return false;
    }
    else {
      return true;
    }
  }
  //sailing should skip the following:
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

function footPathCheck(list, property, value, prefixLength){//check objects list to see if it has a pathX in it
  let count=0;
  for (let i = 0; i< list.length; i++){
    if (list[i] && list[i][property].substring(0, prefixLength) === value.substring(0, prefixLength)){
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

function getSpriteDataById(arr, id){
  for (let i = 0; i < arr.length; i++){
    const obj = arr[i];
    if (obj.hasOwnProperty('spriteData') && obj.spriteData.hasOwnProperty('id') && obj.spriteData.id ===id){
      return obj.spriteData;
    }
  }
}

function removeFirstOfItem(name){
  //removes first item it comes across in player inventory
  let position = player.inventory.findIndex(obj => obj.name===name);
  if (player.inventory[position].name === "scroll" || player.inventory[position].name in playerObjects){
    player.inventory.splice(position, 1);
  } else {
    player.inventory[position].amt-=1;
  }
  
}

function weightedRandomSelection(itemList, playerLevel) {
  if (!itemList || Object.keys(itemList).length === 0) {
    throw new Error('Item list is empty or undefined.');
  }

  // Extract the keys from the object
  const keys = Object.keys(itemList);

  // Create an array to store the weights of each item
  const weights = [];

  // Calculate the weight of each item based on its position in the list and the player's level
  for (let i = 0; i < keys.length; i++) {
    const rarityFactor = Math.max(1, i - playerLevel + 1);
    const weight = Math.pow(0.6, i) * rarityFactor;
    weights.push(weight);
  }

  // Calculate total weight
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  // Generate a random number between 0 and totalWeight
  const random = Math.random() * totalWeight;

  // Select an item based on its weighted probability
  let weightSum = 0;
  for (let i = 0; i < keys.length; i++) {
    weightSum += weights[i];
    if (random < weightSum) {
      return keys[i];
    }
  }
}

function popMessage(message){
  dropList.push({
    "text":message,
    "amount":null,
    "coords":dropCoords(false)
  });
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
  let collision = checkCollision(potentialX, potentialY, true);
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
//FIRST NPC/////////////////////////////////////////////////////////////////////////////////////////////////////////FIRST NPC///
//needs an outside function that displays items amt/prices and lets player click item to buy
                                                             //-coins, addToInv(item)
//quest events. playerInteract changes depending on events
  //talk to npc to unlock quest, new Quest with parameters
  //upon quest completion npc greeting changes
  //in case of Klin shopkeep, unlocks trade and player given reward
function Shopkeep(x, y, name, greeting, selling={}){//maybe these kind of npcs don't go in npcs list?
                                        //{"item":{"amt":5, "price":5}}
  this.spriteData = JSON.parse(JSON.stringify(gameObjects['shopkeep']));
  this.spriteData.id=generateID();
  this.x=x;
  this.y=y;
  this.selling=selling;//is this actually necessary
  tile_map[this.x][this.y].objects.push(this.spriteData);
  this.playerInteract = function(){
    //npc greet
    //open shop popup
    //change to have to do quest first in case of Klin npc
    popMessage(greeting);
    shopPopup("Click an item to buy", this.selling);
  }
}


/*
    signMessage = message;
    showSign = true;
    this.displayInterval = setInterval(() => {
      if (playerX !== this.lastX || playerY !== this.lastY){
        showSign=false;
        signMessage = '';
        this.lastX=null;
        this.lastY=null;
        clearInterval(this.displayInterval);
      }
    }, 100);
*/
let showShop = false;
function shopPopup(text, items){//text either manual or comes from Shopkeep properties
  //Sign-like popup displays item icons and their amt/prices
  //player clicks to buy, subtract coins, add item
  //detects if player has walked away
  //display text at top of popup
  //items is {"item1":{"amt":5, "price":5}, "item2":{"amt":4, "price":12},...}
  //for item in items, display item
  if (!showShop){
    showShop=true;
  } else {
    showShop=false;
  }
}

function Spider(){
  this.name="spider";
  this.domain = null;//generated in generator(gee ya think?)
  this.hp = 50;
  this.strength = 5;
  this.spriteData=JSON.parse(JSON.stringify(gameObjects['spider']));
  this.spriteData.id=null;
  this.x=null;
  this.y=null;
  this.lastTime=Date.now();//timestamp
  this.delay = 1000;
  this.aggro = false;
  this.lastAggro=Date.now();
  this.aggroRange = 8;
  this.reposition = false;
  this.reposCount = 0;
  //this.drops = ["string", "brasskey"]
  
  this.update = function(){
   //check if npc dead
    if (this.hp<1){
      player.incrementSkill("strength", 2);
      player.incrementSkill("health", 10);
      let loot;
      playSound(skele_die_sound);
      if (Math.floor(Math.random()*100 > 95)){
        loot = "brasskey";
      } else {
        loot = "string"
      }
      game_objects.push(new Lootbag("spider", this.x, this.y, loot));
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
        if (checkCollision(newCoords[0], newCoords[1], true)===true){
          newCoords=[this.x, this.y, "right"];
        }
        if (newCoords[0]===playerX && newCoords[1]===playerY){
          newCoords=[this.x, this.y, "right"];
          player.getAttacked(this.strength);
          //chance to freeze player (player.freeze, add web sprite with timeout)
          //that way other mobs that freeze can have their own type of freeze
          if (Math.floor(Math.random() * 100) > 90){
            player.freeze(1500);
            //draw web whether frozen or not just cause it's cool
            //same fashion as bobber
            tile_map[playerX][playerY].objects.push(gameObjects['web']);
            let timeoutX = playerX;
            let timeoutY = playerY;
            setTimeout(() => {
              tile_map[timeoutX][timeoutY].objects = filterObjByKeyVal(tile_map[timeoutX][timeoutY].objects, "name", "web");
            },3000);
          }
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
    this.hp-=damage;
  }
}

function Rat(){
  this.name="rat";
  this.hp = 30;//lel just testing
  this.strength = 5;
  this.spriteData=JSON.parse(JSON.stringify(gameObjects['rat']));
  this.spriteData.id=null;
  this.x=null;
  this.y=null;
  this.domain = null;
  this.lastTime=Date.now();//timestamp
  this.delay = 2000;
  this.aggro = false;
  this.lastAggro=Date.now();
  this.strength = 2;
  this.update = function(){
    if (this.hp<1){
      game_objects.push(new Lootbag("rat", this.x, this.y, "hide"));
      player.incrementSkill("strength", 5);
      player.incrementSkill("health", 3);
      playSound(skele_die_sound);
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
        if (checkCollision(newCoords[0], newCoords[1], true)===true){
          newCoords=[this.x, this.y, "right"];
        }
        if (newCoords[0]===playerX && newCoords[1]===playerY){
          newCoords=[this.x, this.y, "right"];
          player.getAttacked(this.strength);
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
  }
}

function Skeleton(){
  this.name="skeleton";//its in spriteData but had to do it this way for some reason
  this.hp = 25;//lel just testing
  this.spriteData=JSON.parse(JSON.stringify(gameObjects['skeleton']));
  this.spriteData.id=null;
  this.x=null;
  this.y=null;
  this.domain = null;
  this.lastTime=Date.now();//timestamp
  this.strength = 5;
  this.delay = 2000;
  this.aggro = false;
  this.lastAggro=Date.now();
  this.strength = 5;

  this.update = function(){
    if (this.hp<1){
      if (Math.floor(Math.random()*100 > 90)){
        game_objects.push(new Lootbag("skeleton", this.x, this.y, "key"));
      } else {
        game_objects.push(new Lootbag("skeleton", this.x, this.y, "coin"));
      }
      player.incrementSkill("strength", 2);
      player.incrementSkill("health", 7);
      playSound(skele_die_sound);
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
        if (checkCollision(newCoords[0], newCoords[1], true)===true){
          newCoords=[this.x, this.y, "right"];
        }
        if (newCoords[0]===playerX && newCoords[1]===playerY){
          newCoords=[this.x, this.y, "right"];
          player.getAttacked(this.strength);
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
  }
}

//id testing
function generateID(){//this is not best practice, just for testing. max of 1000 objects
  //returns id if not in list
 return crypto.randomUUID();
}
var game_ids=[0];//if id in list, regenerate, if id not in list add it, remove id from game_ids on object delete

const generatorList = {"spider":Spider, "rat":Rat, "skeleton":Skeleton}
function getValidSpawnCoord(minX, minY, maxX, maxY){//useful ass function!
  let validCoords = [];
  for (let x = minX; x < maxX; x++){
    for (let y = minY; y < maxY; y++){
      if (!tile_map[x][y].sprite.collision){
        let object;
        let hasCollision = false;
        for (object in tile_map[x][y].objects){
          if (tile_map[x][y].objects[object].collision){
            hasCollision = true;
            break;
          }
        }
        if (!hasCollision){
          validCoords.push({x:x, y:y});
        }
      }
    }
  }
  if (validCoords.length > 0){
    return validCoords[Math.floor(Math.random() * validCoords.length)];
  } else {
    return null;
  }
}

function generateNPC(name, domain, amt, interval, xMin, xMax, yMin, yMax){
  setInterval(function(){
    if (countObjectsByPropertyValue(npcs, "domain", domain) < amt){
      let randCoords = getValidSpawnCoord(xMin, yMin, xMax, yMax);
      if (randCoords===null){return;};
      let newNPC = new generatorList[name];
      newNPC.x = randCoords.x;
      newNPC.y = randCoords.y;
      newNPC.domain = domain;
      newNPC.spriteData.id = generateID();
      game_ids.push(newNPC.spriteData.id)
      newNPC.id=newNPC.spriteData.id;
      npcs.push(newNPC);
      tile_map[newNPC.x][newNPC.y].objects.push(newNPC.spriteData);
    }
  }, interval);
}
//uncomment for npc spawning
//end npc testing/////////////////////////////////////////////////////////////////////////////////////////////////////


//main///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function drawShop(){
  if (showShop){

  }
}

function drawSign(){
  //signMessage
  //showSign
  if (showSign){
    //draw Sign
    let x = 40;
    let y = 40;
    ctx.fillStyle="rgba(139, 69, 19, 0.75)";
    ctx.fillRect(30, 30, 240,200);
    ctx.fillStyle="white";
    //ctx.fillText(signMessage, 40, 40);
    let words = signMessage.split(' ');
    let maxWidth = 200;
    let line = '';
    let lineWidth = 0;
    for (let i = 0; i < words.length; i++){
      const word = words[i];
      const wordWidth = ctx.measureText(word).width;
      if (lineWidth + wordWidth > maxWidth){
        ctx.fillText(line, x, y);
        y += 20;
        line = '';
        lineWidth = 0;
      }
      line += word + ' ';
      lineWidth += wordWidth + ctx.measureText(' ').width;
    }
    ctx.fillText(line, x, y);
  }
}

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

/*

const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 10, canvas.width/2, canvas.height/2, canvas.width/1.5);
const blackGradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 10, canvas.width/2, canvas.height/2, canvas.width/1.5);
blackGradient.addColorStop(0, "transparent");
blackGradient.addColorStop(1, "Black");
gradient.addColorStop(0,"transparent");
gradient.addColorStop(1, "DarkGray");
*/

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
      //console.log([sprtX, sprtY])
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
          
          if (tile_map[sprtX][sprtY]['objects'][object] && typeof tile_map[sprtX][sprtY]['objects'][object].id !== 'undefined' && tile_map[sprtX][sprtY]['objects'][object].type==="object"){
            //it has an id, but does it have an object in game_objects
            if (!isSpriteIdInList(game_objects, tile_map[sprtX][sprtY]['objects'][object].id)){
              delete tile_map[sprtX][sprtY]['objects'][object];
              continue;
            }
          }
          
          if (tile_map[sprtX][sprtY]['objects'][object] && tile_map[sprtX][sprtY]['objects'][object].type==='object'){
            sprtLoc=tile_map[sprtX][sprtY]['objects'][object]['sprite']
            ctx.drawImage(spriteSheet, sprtLoc[0],sprtLoc[1], 16,16,
              col*BLOCKSIZE, row*BLOCKSIZE, DRAWSIZE,DRAWSIZE);
          }
          //draw npcs
          else if (tile_map[sprtX][sprtY]['objects'][object] && tile_map[sprtX][sprtY]['objects'][object].type==='npc'){
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
  
  if (tileMapSector==="dungeon_1"){//change to in list of dark places
    ctx.fillStyle = blackGradient;
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
    //drawRainFade();
    drawStats();
    drawInv();//testing until better inv UI
    drawSign();
    drawCraft();
    drawXpDrop();
  } else {
    deathScreen();
  }
}


setTimeout(() => {
  //signs around map to help player////////////////////////////////////////////////////////////////////////////////
  //put signs here cause issues with tile_map loading
  if (localStorage.getItem("tileMapSector")==="main"){
    game_objects.push(new Sign(24, 22, "                    Welcome to Canvas II: Ghosts!                      At the bottom right is your inventory, scroll through with the arrows and press/click/tap F to use/equip the item. Walk into stuff to interact with it. Equip a weapon and go fight something!"))
    game_objects.push(new Sign(23, 62, "                    Archibald Village              PLEASE DO NOT FEED THE RATS"));
    game_objects.push(new Sign(33, 61, "                         Cellar"));
    game_objects.push(new Sign(48, 78, "                    Miia's Nail House                                  To learn how to craft an item, find recipe scrolls. Walk into the crafting table and put the scroll and appropriate items in the queue with F. You only need to queue one of each item regardless of how many the recipe calls for. Craft the item with C. You won't lose the scroll but the ingredients will be removed from your inventory."));
    game_objects.push(new Sign(76, 83, "                    Theunorg's Chapel"));
    //pier near house, boat to be added
    game_objects.push(new Sign(34, 38, "Gone fishing, charters to resume soon...                 Someone stole the sail to the raft, so you'll have to make a new one. If you've never made one before, I think I have some instructions for crafting one somewhere in my house north of here.                              -Fish Monger"));
    tile_map[48][29].objects.pop()//removing an old useless chest instead of just editing the map lol
    game_objects.push(new Treasurechest2(48, 29, "scroll", "sail"));//new chest with sail scroll
    let raftLoc = JSON.parse(localStorage.getItem("raftLoc"));
    if (!raftLoc){
      raftLoc = [34, 42];
      localStorage.setItem("raftLoc", JSON.stringify(raftLoc));
      playerRaft = new Raft(34, 42);
    } else {
      playerRaft = new Raft(raftLoc[0], raftLoc[1]);
    }
    raftID = playerRaft.spriteData.id;
    game_objects.push(playerRaft);
    game_objects.push(new craftingTable(50, 80));
    game_objects.push(new Treasurechest2(50, 82, "scroll", "fishingpole"));
    //archie village mods
    tile_map[34][56].objects.push(gameObjects['trashcan']);
    game_objects.push(new Sign(34, 57, "                        WARNING                            Stand next to the trashcan and try to use an item and it will be thrown away forever! Throw your duplicate/deprecated items in here or when you want to start from scratch. Even if you delete your axe, you always start with a new one"));
    tile_map[32][62].objects=[gameObjects['stoneplate']];
    game_objects.push(new Lockeddoor(32,62, "Opened the cellar door with a brass key."));
    game_objects.push(new Opendoor(28,59));
    game_objects.push(new Opendoor(28,60));
    game_objects.push(new Opendoor(20,61));
    game_objects.push(new Opendoor(16,61));
    game_objects.push(new Opendoor(20,65));
    //Miias house
    game_objects.push(new Opendoor(49,79));
    //chapel
    game_objects.push(new Opendoor(68,81));
    //Mongershouse
    game_objects.push(new Opendoor(48,32))
    game_objects.push(new Opendoor(22,20));
  } 
  else if (localStorage.getItem("tileMapSector")==="northsea"){
    let raftLoc = JSON.parse(localStorage.getItem("raftLoc"));
    playerRaft = new Raft(raftLoc[0], raftLoc[1]);
    raftID = playerRaft.spriteData.id;
    game_objects.push(playerRaft);
    tile_map[65][87].objects.push(gameObjects['rockpile']);
    game_objects.push(new Sign(65, 86, "South to Old Haven"));
    //tile_map[50][50].objects.push(gameObjects['pathVERT']);
    tile_map[42][12].objects.push(gameObjects['rockpile']);
    game_objects.push(new Sign(42, 11, "North to mainland"));
    //Klinthios's island hut
    game_objects.push(new Opendoor(50,35, "This door is weathered by wind and saltwater..."));
    game_objects.push(new Opendoor(51,39,"The door opens, wafting fish smell everywhere..."))
    game_objects.push(new Treasurechest2(25, 59, "scroll", "leatherarmor"));
    game_objects.push(new Shopkeep(50,37, "Klinthios", "Klinthios: Oh dear, can you kill all those nasty rats please?!"));//need better way to build npcs like this
  }
  //end signs//////////////////////////////////////////////////////////////////////////////////////////////////////
  
  //map hotfixes///////////////////////////////////////////////////////////////////////////////////////////////////
  if (localStorage.getItem("tileMapSector")==="main"){
    tile_map[47][36].sprite = gameObjects['water'];//just test, it works
  }

  //putting npcs in areas
  //name, location, number, frequency, xmin, ymin, xmax, ymax
  if (localStorage.getItem("tileMapSector")==="main"){
    generateNPC("skeleton", "graveyard", 12, 5000, 78, 89, 76, 89);//down by the graveyard
    generateNPC("spider", "dungeon", 15, 2500, 42, 68, 39, 70);//guarding dungeon entrance
    generateNPC("rat", "village", 12, 3000, 11, 26, 57, 78);//farm village on west coast
    generateNPC("spider", "mountaintop", 3, 1000, 73, 80, 27, 34);//mountain with dungeon entrance/sword chest
  } 
  else if (localStorage.getItem("tileMapSector")==="dungeon_1"){
    generateNPC("spider", "dungeon", 25, 2500, 11, 89, 11, 89);
    generateNPC("rat", "cellar", 6, 2000, 31, 33, 63, 67);
  }
  else if (localStorage.getItem("tileMapSector")==="northsea"){
    generateNPC("rat", "island1", 5, 5000, 50, 58, 20, 28);
    generateNPC("skeleton", "island2", 5, 5000, 21, 29, 58, 64);
  }
  //end hotfixes//////////////////maybe could put these in separate hotfix.js/////////////////////////////////////
  setInterval(update,100)
},4000);