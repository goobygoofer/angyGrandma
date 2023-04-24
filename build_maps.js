let reloading = false;
function checkNextMap(nextX, nextY){//need to condense this function
    if (nextX < 11 || nextX > 89 || nextY < 11 || nextY > 89){
      //case of main map VVV
      //prob need to make this own function to keep checkCollision clean
      if (localStorage.getItem("tileMapSector")==="main" && playerSailing && nextY < 11){
        //set playerY to 89, playerX stays same because you can only exit with raft from north of map anyway
        playerY = 89;
        if (playerSailing){
          playerRaft.y = 89;
          localStorage.setItem("raftLoc", JSON.stringify([playerX, 89]));
        }
        localStorage.setItem("playerLoc", JSON.stringify([playerX, 89]));
        
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
          if (playerSailing){
             playerRaft.y = 11;
            localStorage.setItem("raftLoc", JSON.stringify([playerX, 11]));
          }
          localStorage.setItem("playerLoc", JSON.stringify([playerX, 11]));
  
          //new map and reload
          localStorage.setItem("tileMapSector", "main");
          reloading = true;
          location.reload();
          return;
        }
        else if (nextY < 11){
          playerY=89;//why is this not working
          if (playerSailing){
            playerRaft.y = 89;
            localStorage.setItem("raftLoc", JSON.stringify([playerX, 89]));
          }
          localStorage.setItem("playerLoc", JSON.stringify([playerX, 89]));
          //new map and reload
          localStorage.setItem("tileMapSector", "deepnorthsea");
          reloading = true;
          location.reload();
          return;
        }
      }
      else if (localStorage.getItem("tileMapSector")==="deepnorthsea"){
        if (nextY > 89){
          if (playerSailing){
            playerRaft.y = 11;
            localStorage.setItem("raftLoc", JSON.stringify([playerX, 11]));
          }
          localStorage.setItem("playerLoc", JSON.stringify([playerX, 11]));
          localStorage.setItem("tileMapSector", "northsea");
          reloading = true;
          location.reload();
          return;
        }
      }
    }
  }

function initializeMap(){
    //MAIN MAP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    if (localStorage.getItem("tileMapSector")==="main"){
    game_objects.push(new Sign(24, 22, "                    Welcome to Canvas II: Ghosts!                      At the bottom right is your inventory, scroll through with the arrows and press/click/tap F to use/equip the item. Walk into stuff to interact with it. Equip a weapon and go fight something!"))
    game_objects.push(new Sign(23, 62, "                    Archibald Village              PLEASE DO NOT FEED THE RATS"));
    game_objects.push(new Sign(33, 61, "                            Cellar                                            AUTHORIZED PERSONNEL ONLY.            WEAPONS STORAGE"));
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
    generateNPC("spider", "dungeon", 15, 2500, 42, 68, 39, 70);//guarding dungeon entrance
    generateNPC("rat", "village", 12, 3000, 11, 26, 57, 78);//farm village on west coast
    generateNPC("spider", "mountaintop", 3, 1000, 73, 80, 27, 34);//mountain with dungeon entrance/sword chest\\
    generateNPC("gnoll", "field", 3, 4500, 50,57, 15,31);
    generateNPC("gnoll", "swamp", 3, 4500, 77,88, 53,59);
    }


    else if (localStorage.getItem("tileMapSector")==="dungeon_1"){
    //MOBS
    generateNPC("spider", "dungeon", 25, 2500, 11, 89, 11, 89);
    generateNPC("rat", "cellar", 6, 2000, 31, 33, 63, 67);
    tile_map[33][67].objects=[];
    // Treasurechest2(x, y, item, scroll=null, popupText=null){//popup text tells what player got
    game_objects.push(new Treasurechest2(33, 67, "scroll", "longbow"));
    }


    else if (localStorage.getItem("tileMapSector")==="northsea"){
    let raftLoc = JSON.parse(localStorage.getItem("raftLoc"));
    playerRaft = new Raft(raftLoc[0], raftLoc[1]);
    raftID = playerRaft.spriteData.id;
    game_objects.push(playerRaft);
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
    let treeList = [[52,34],[53,29],[51,29],[55,27],[51,23],[53,21],[54,19],[55,20],[57,19],[56,17]];
    let tree;
    for (tree in treeList){
        tile_map[treeList[tree][0]][treeList[tree][1]].objects = [];
        tile_map[treeList[tree][0]][treeList[tree][1]].objects.push(gameObjects['palmtree']);
    }

    //MOBS
    generateNPC("rat", "island1", 5, 5000, 50, 58, 20, 28);
    generateNPC("skeleton", "island2", 5, 5000, 21, 29, 58, 64);
    }

    else if (localStorage.getItem("tileMapSector")==="deepnorthsea"){
      if (playerSailing){
        let raftLoc = JSON.parse(localStorage.getItem("raftLoc"));
        playerRaft = new Raft(raftLoc[0], raftLoc[1]);
        raftID = playerRaft.spriteData.id;
        game_objects.push(playerRaft);
      }
    }
}
