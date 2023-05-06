//NOTES ON MAP BUILDING
//
//mapExit
//    -iterate over top/bottom left/right of map with mapExits
//     otherwise put them where they are needed
//    - any gameObject can be a mapExit, thus can be any sprite available in gameObjects
//      player portal scroll makes a temporary mapExit with portal sprite
//    -iterated exits
//        -ex) iterating over top row, incrementing i in the x position starting at 0 or 1 //figure out actual 0,0
//             y stays the same (in this case 0 or 1), new coords x is i and y is 99 or 100, the bottom of the next map
//        -this is the same for bottom and left/right
//    -door/stair/etc map exits
//        -likely standalone but can be iterated if need be
//        -keep in mind you don't *have* to change map just coords, or coords just map 
//    *places like the main map (main.js) should have invisible collision (iterate over with void sprite as tile object)
//     these can be removed if an area is added or something, but so far the world expands at the deepnorthsea map (deepnorthsea.js) 
//    
//sub_maps
//    -sub_maps will be named something else and stored in other variables
//    -mapExit now has a false bool by default as the last param
//     if sub===true, calls nextSubSector instead of nextTileMapSector
//    -main tile_map is kept, 

let reloading = false;

function nextTileMapSector(next_map, newX, newY){//need to account for playersailing
  if (localStorage.getItem("tileMapSector")===next_map){//same map just change loc (think portal)
    //could even do that thing lantto did where all the dungeon rooms are out in the sea somewhere XD
    playerX=newX;
    playerY=newY;
    return;
  }
  let new_tile_map;
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `https://goobygoofer.github.io/angyGrandma/${next_map}.js`);
  //xhr.open('GET', `./${next_map}.js`);
  xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      //this lets us rebuild the tile_map.js from a string
      const start = this.responseText.indexOf("[[");
      const end = this.responseText.lastIndexOf("]]") + 2;
      const jsonStr = this.responseText.substring(start, end);
      //and parse it back into a usable map, and replace the old map
      localStorage.setItem("tileMapSector", next_map);//HAVE TO RENAME map_2.js TO main.js, OOP
      new_tile_map = JSON.parse(jsonStr);
      tile_map=new_tile_map;
      initializeMap();
      playerX=newX;
      playerY=newY;
    }
  };
  xhr.send();
}

function initializeMap(){
    //MAIN MAP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    game_objects=[];
    game_object_ids=[];
    npcs = [];
    waterAccess = false;
    let raftLoc = JSON.parse(localStorage.getItem("raftLoc"));
    if (localStorage.getItem("tileMapSector")==="main"){
        rainChance = 50;
        waterAccess = true;
        game_objects.push(new mapSign(26,34));
        game_objects.push(new Sign(24, 22, "                    Welcome to Canvas II: Ghosts!                      At the bottom right is your inventory, scroll through with the arrows and press/click/tap F to use/equip the item. Walk into stuff to interact with it. Equip a weapon and go fight something!"))
        game_objects.push(new Sign(23, 62, "                    Archibald Village              PLEASE DO NOT FEED THE RATS"));
        game_objects.push(new Sign(33, 61, "                            Cellar                                            AUTHORIZED PERSONNEL ONLY.            WEAPONS STORAGE"));
        game_objects.push(new Sign(48, 78, "                    Miia's Nail House                                  To learn how to craft an item, find recipe scrolls. Walk into the crafting table and put the scroll and appropriate items in the queue with F. You only need to queue one of each item regardless of how many the recipe calls for. Craft the item with C. You won't lose the scroll but the ingredients will be removed from your inventory."));
        game_objects.push(new Sign(76, 83, "                    Theunorg's Chapel"));
        //pier near house, boat to be added
        game_objects.push(new Sign(34, 38, "Gone fishing, charters to resume soon...                 Someone stole the sail to the raft, so you'll have to make a new one. If you've never made one before, I think I have some instructions for crafting one somewhere in my house north of here.                              -Fish Monger"));
        tile_map[48][29].objects.pop()//removing an old useless chest instead of just editing the map lol
        game_objects.push(new Treasurechest2(48, 29, "scroll", "sail"));//new chest with sail scroll
        game_objects.push(new craftingTable(50, 80));
        game_objects.push(new Treasurechest2(50, 82, "scroll", "fishingpole"));
        //archie village mods
        tile_map[34][56].objects.push(gameObjects['trashcan']);
        game_objects.push(new Sign(34, 57, "                        WARNING                            Stand next to the trashcan and try to use an item and it will be thrown away forever! Throw your duplicate/deprecated items in here or when you want to start from scratch. Even if you delete your axe, you always start with a new one"));
        tile_map[32][62].objects=[gameObjects['stoneplate']];
        tile_map[47][36].sprite = gameObjects['water'];
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
        //MOBS
        generateNPC("skeleton", "graveyard", 12, 5000, 78, 89, 76, 89);//down by the graveyard
        generateNPC("skeleton", "test", 2, 5000, 10, 25, 10, 25);//test skletons
        generateNPC("spider", "dungeon", 12, 2500, 42, 68, 39, 70);//guarding dungeon entrance
        generateNPC("rat", "village", 12, 3000, 11, 26, 57, 78);//farm village on west coast
        generateNPC("spider", "mountaintop", 3, 1000, 73, 80, 27, 34);//mountain with dungeon entrance/sword chest\\
        generateNPC("gnoll", "field", 3, 4500, 50,57, 15,31);
        generateNPC("rangeGoblin", "woods", 8, 5000, 17,41, 78,87);
        generateNPC("gnoll", "swamp", 3, 4500, 77,88, 53,59);
        //hazards
        //game_objects.push(new Spiketrap(26,24, 1000, 100));
        //establish border exits and any other exits (like dungeon stairs)
        //north border (currently only exit from main.js)
        for (let i=0;i<100;i++){
          game_objects.push(new mapExit(i, 0, "northsea", "void", i, 99));//might have to change
        }
        //dungeon exits
        game_objects.push(new mapExit(39, 47, "dungeon_1", "dungeonStairs", 39,47));
        game_objects.push(new mapExit(32, 65, "dungeon_1", "dungeonStairs", 32,65));
        game_objects.push(new mapExit(76, 28, "dungeon_1", "dungeonStairs", 76,28));

        //then generate void borders around west, east and south borders, they don't go nowhere (yet), also prevents an error
    }


    else if (localStorage.getItem("tileMapSector")==="dungeon_1"){
        rainChance = 0;
        //MOBS
        generateNPC("spider", "dungeon", 25, 2500, 11, 89, 11, 89);
        generateNPC("rat", "cellar", 6, 2000, 31, 33, 63, 67);
        tile_map[33][67].objects=[];
        game_objects.push(new Treasurechest2(33, 67, "scroll", "longbow"));
        //HAZARDS
          //hallway of spikes!
        for (let i=48; i<87; i+=2){
          game_objects.push(new Spiketrap(72, i, 500, 15));
        }
        game_objects.push(new mapExit(39, 47, "main", "dungeonStairs", 39,47));
        game_objects.push(new mapExit(76, 28, "main", "dungeonStairs", 76,28));
        game_objects.push(new mapExit(32, 65, "main", "dungeonStairs", 32,65));
    }


    else if (localStorage.getItem("tileMapSector")==="northsea"){
        rainChance = 75;
        waterAccess = true;
        tile_map[65][87].objects.push(gameObjects['rockpile']);
        game_objects.push(new Sign(65, 86, "South to Old Haven"));
        tile_map[42][12].objects.push(gameObjects['rockpile']);
        game_objects.push(new Sign(42, 11, "North to mainland"));
        //Klinthios's island hut
        game_objects.push(new Opendoor(50,35, "This door is weathered by wind and saltwater..."));
        game_objects.push(new Opendoor(51,39,"The door opens, wafting fish smell everywhere..."))
        game_objects.push(new Treasurechest2(25, 59, "scroll", "leatherarmor"));
        game_objects.push(new Shopkeep(50,37, "Klinthios", "Klinthios: Oh dear, can you kill all those nasty rats please?!"));//need better way to build npcs like this
            //replace dead trees wtih palm trees!
        let treeList = [[52,34],[53,29],[51,29],[55,27],[51,23],[53,21],[54,19],[55,20],[57,19],[56,17]];//don't ask
        let tree;
        for (tree in treeList){
            tile_map[treeList[tree][0]][treeList[tree][1]].objects = [];
            tile_map[treeList[tree][0]][treeList[tree][1]].objects.push(gameObjects['palmtree']);
        }

        //MOBS
        generateNPC("rat", "island1", 5, 5000, 50, 58, 20, 28);
        generateNPC("skeleton", "island2", 5, 5000, 21, 29, 58, 64);
        for (let i=0; i<100;i++){
          game_objects.push(new mapExit(i,0, "deepnorthsea", "void", i,99));
        }
        for (let i=0; i<100;i++){
          game_objects.push(new mapExit(i,99, "main", "void", i,0));
        }
    }

    else if (localStorage.getItem("tileMapSector")==="deepnorthsea"){
      rainChance = 90;
      waterAccess=true;
      //mapExits
      for (let i=0;i<100;i++){//exit south
        game_objects.push(new mapExit(i, 99, "northsea", "void", i, 0));
      }
      for (let i=0;i<100;i++){//exit north
        game_objects.push(new mapExit(i, 0, "deepnorthsea_2", "void", i, 99));
      }
      //tiny island dungeon with mageLiches
      game_objects.push(new mapExit(55, 51, "northsea_dungeon", "dungeonStairs", 50,96))//figure out x/y old and new
    }
    
    else if (localStorage.getItem("tileMapSector")==="northsea_dungeon"){
      rainChance = 0;
      //mobs
      generateNPC("mageLich", "dungeon", 8, 5000, 36,60, 61,85);
      //exits
      game_objects.push(new mapExit(50, 96, "deepnorthsea", "dungeonStairs", 55,51));
    }

    else if (localStorage.getItem("tileMapSector")==="deepnorthsea_2"){
      rainChance = 100;
      waterAccess=true;
      //exits
      for (let i=0;i<100;i++){//exit south
        game_objects.push(new mapExit(i, 99, "deepnorthsea", "void", i, 0));
      }
      for (let i=0; i<100;i++){
        game_objects.push(new mapExit(i,0, "deepnorthsea_3", "void", i,99));
      }
      game_objects.push(new mapExit(75,34, "lighthouse_1", "stairsR", 3,3));
      game_objects.push(new mapExit(73,33, "lighthouse_1", "dungeonStairs", 1,2));
    }
    
    else if (localStorage.getItem("tileMapSector")==="lighthouse_1"){
      rainChance = 0;
      game_objects.push(new mapExit(1,2, "deepnorthsea_2", "stairsR", 73,33));
      game_objects.push(new mapExit(3,3, "deepnorthsea_2", "dungeonStairs", 75,34));
    }
    
    else if (localStorage.getItem("tileMapSector")==="deepnorthsea_3"){
      rainChance = 100;
      waterAccess=true;
      //exits
      for (let i=0; i<100;i++){//south exit
        game_objects.push(new mapExit(i,99, "deepnorthsea_2", "void", i,0));
      }
      for (let i=0; i<100;i++){//north exit
        game_objects.push(new mapExit(i,0, "mainland_bay", "void", i,99));
      }
      //island trap heheh
      game_objects.push(new mapExit(11,69, "deepnorthsea_oubliette", "dungeonStairs", 2,2));
    }

    else if (localStorage.getItem("tileMapSector")==="deepnorthsea_oubliette"){
      rainChance = 0;
      game_objects=[];
      for (i=1;i<4;i++){
        for (j=1;j<4;j++){
          game_objects.push(new Spiketrap(i, j, 250, 10));
        }
      }
    }

    else if (localStorage.getItem("tileMapSector")==="mainland_bay"){
      rainChance = 50;
      waterAccess=true;
      //exits
      for (let i=0; i<100;i++){//south exit
        game_objects.push(new mapExit(i,99, "deepnorthsea_3", "void", i,0));
      }
      //doors
      let lockedDoors = [[53,17], [71,17], [76,11], [11,37]];
      let openDoors = [[52,21], [58,21], [57,17], [62,15], [64,19], [71,21],  [75,15], [77,19], [82,21], [81,23], [85,26], [87,32], [85,34], [86,40], [89,42]];
      let locked;
      for (locked in lockedDoors){
        game_objects.push(new Lockeddoor(lockedDoors[locked][0],lockedDoors[locked][1], "The townsfolk are going to be pissed!"));
      }
      let open;
      for (open in openDoors){
        game_objects.push(new Opendoor(openDoors[open][0],openDoors[open][1]));
      }
    }

  if (waterAccess){
    if (playerSailing){
      //player sailing, put boat at playerX/Y
      playerRaft = new Raft(playerX, playerY);//oh wait is this even initialized by the time this runs? we shall see
    } else {
      //player not sailing, put boat at raftLoc
      playerRaft = new Raft(raftLoc[0], raftLoc[1]);
    }
    raftID = playerRaft.spriteData.id;
    game_objects.push(playerRaft);
  } else {
    //player in dungeon, don't put boat, prob just get rid of this else statement
  }
}
