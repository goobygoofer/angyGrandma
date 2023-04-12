baseTiles = {//redo entirely and in order
    "grass":[0,0],//plain, green grass
    "grass2":[160,608],
    "snow":[208,528],//
    "tree":[16,0],//
    "oak":[128,1104],//
    "deadtree":[48,464],//
    "snowtree":[176,544],//
    "rock":[176,0],//
    "water":[0,48],//
    "flower1":[16,48],//
    "flower2":[64,48],//
    "flower3":[112,48],//
    "mushroom":[80,256],//
    //paths
    "pathHORIZ":[0,544],//
    "pathVERT":[16,544],//
    "pathTDWN":[32,544],//
    "pathTUP":[48,544],//
    "pathTRT":[64,544],//
    "pathTLT":[80,544],//
    "pathCRS":[96,544],//
    "pathCRV1":[112,544],//
    "pathCRV2":[128,544],//
    "pathCRV3":[144,544],//
    "pathCRV4":[160,544],//
    //stuff
    "grave":[32,160],//
    "stoneblock":[288,0],//
    "woodblock":[112,0],//
    "stump1":[192,448],
    "stump2":[64,1120],
    "stump3":[80,1120],
    "campfire":[32,384],//
    "rain":[144,432],//
    "fenceV":[0,160],
    "fenceH":[16,160],
    "sand":[16,64],
    "boulder":[144,1232],
    "rockpile":[304,1072],
    "mapsign":[16,176],
    "bed":[128,112],
    "cactus":[160,48],
    "ankh":[128,96],
    "chest":[32,128],
    "woodplate":[112,80],
    "stoneplate":[128,80],
    "door":[288,96],
    "door2":[192,816],
    "door3":[32,848],
    "skull":[304,1024],
    "table":[64,352],
    "chair":[80,352],
    "sign":[80,512],
    "deskHORIZ":[112,128],
    "deskVERT":[0,144],
    "deskCRV1":[16,144],
    "deskCRV2":[32,144],
    "deskCRV3":[96,1264],
    "deskCRV4":[112,1264],
    "redX":[288,751],//this one was weird
    "redDownArrow":[96,640],
    "glasspane1":[160,560],
    "cloud":[240,736],
    "axeR":[0,192],
    "axeL":[272,192],
    "axeItem":[64,64],
    "statDisp":[80, 624],
    "log":[96, 0],
    "upArrow":[80,976],
    "downArrow":[96, 976],
    //letters here
    "F":[80,768]
    //end letters
  }

  npcTiles = {
    "skelR":[128,16],
    "skelL":[128,32],
    "ghostR":[48,80],//ghost facing right coords
    "ghostL":[64,96],//ghost facing left coords
    "ratR":[112,144],
    "ratL":[192,128],
    "spiderR":[96,240],
    "spiderL":[112, 240]
  }

playerObjects = {
    //separate so user can't place items?
    //prob start with axe
    "axe":{
        "name":"axe",
        "id":null,
        "holdSprite":{"lt":baseTiles['axeL'], "rt":baseTiles['axeR']},//not all have this
        "itemSprite":baseTiles['axeItem'],//all should have this. only drawn if on ground or inv showing
       // "wear":["hand", true],//all have this, if no wear, set to [null, false]?
    }
}
  gameObjects = {
    "spider":{
        "name":"spider",
        "id":null,
        "sprite":{"left":npcTiles['spiderR'],"right":npcTiles['spiderL']},
        "facing":"left",
        "type":"npc",
        "collision":true,
        "attackable":true
    },
    "rat":{
        "name":"rat",
        "id":null,
        "sprite":{"left":npcTiles['ratR'],"right":npcTiles['ratL']},
        "facing":"left",
        "type":"npc",
        "collision":true,
        "attackable":true
    },
    "skeleton":{//character.sprite is now both sets of coords for left and right facing
        "name":"skeleton",//so player/npc sprites get drawn differently
        "id":null,//add id upon npc object creation (if player id added, it will work differently than here)
                  //this way just this object gets put on tile and actual npc object is referenced by id here
        "sprite":{"left":npcTiles['skelR'],"right":npcTiles['skelL']},
        "facing":"left",//players and npcs need this
        "type":"npc",
        "collision":true,
        "attackable":true
    },
    "log":{
        "name":"log",
        "sprite":baseTiles["log"],
        "type":"object",
        "collision":false,
        "itemSprite":baseTiles["log"]//redundant but will work? for inventory drawing ease
    },
    "cloud":{
        "name":"cloud",
        "sprite":baseTiles["cloud"],
        "type":"object",
        "collision":false
    },
    "glasspane1":{
        "name":"glasspane1",
        "sprite":baseTiles["glasspane1"],
        "type":"object",
        "collision":false
    },
    "redDownArrow":{
        "name":"redDownArrow",
        "sprite":baseTiles["redDownArrow"],
        "type":"object",
        "collision":false
    },
    "redX":{
        "name":"redX",
        "sprite":baseTiles["redX"],
        "type":"object",
        "collision":false
    },
    "deskHORIZ":{
        "name":"deskHORIZ",
        "sprite":baseTiles['deskHORIZ'],
        "type":"object",
        "collision":true
    },
    "deskVERT":{
        "name":"deskVERT",
        "sprite":baseTiles['deskVERT'],
        "type":"object",
        "collision":true
    },
    "deskCRV1":{
        "name":"deskCRV1",
        "sprite":baseTiles['deskCRV1'],
        "type":"object",
        "collision":true
    },
    "deskCRV2":{
        "name":"deskCRV2",
        "sprite":baseTiles['deskCRV2'],
        "type":"object",
        "collision":true
    },
    "deskCRV3":{
        "name":"deskCRV3",
        "sprite":baseTiles['deskCRV3'],
        "type":"object",
        "collision":true
    },
    "deskCRV4":{
        "name":"deskCRV4",
        "sprite":baseTiles['deskCRV4'],
        "type":"object",
        "collision":true
    },
    "sign":{
        "name":"sign",
        "sprite":baseTiles['sign'],
        "type":"object",
        "collision":true
    },
    "chair":{
        "name":"chair",
        "sprite":baseTiles['chair'],
        "type":"object",
        "collision":false
    },
    "table":{
        "name":"table",
        "sprite":baseTiles['table'],
        "type":"object",
        "collision":true
    },
    "skull":{
        "name":"skull",
        "sprite":baseTiles['skull'],
        "type":"object",
        "collision":false
    },
    "door":{
        "name":"door",
        "sprite":baseTiles['door'],
        "type":"object",
        "collision":true//change if user try to walk into it and has key?
    },
    "door2":{
        "name":"door2",
        "sprite":baseTiles['door2'],
        "type":"object",
        "collision":true
    },
    "door3":{
        "name":"door3",
        "sprite":baseTiles['door3'],
        "type":"object",
        "collision":true
    },
    "woodplate":{
        "name":"woodplate",
        "sprite":baseTiles['woodplate'],
        "type":"object",
        "collision":false
    },
    "stoneplate":{
        "name":"stoneplate",
        "sprite":baseTiles['stoneplate'],
        "type":"object",
        "collision":false
    },
    "chest":{
        "name":"chest",
        "sprite":baseTiles['chest'],
        "type":"object",
        "collision":true//not sure bout this one
    },
    "ankh":{
        "name":"ankh",
        "sprite":baseTiles['ankh'],
        "type":"object",
        "collision":true
    },
    "cactus":{
        "name":"cactus",
        "sprite":baseTiles['cactus'],
        "type":"object",
        "collision":true
    },
    "bed":{
        "name":"bed",
        "sprite":baseTiles['bed'],
        "type":"object",
        "collision":false
    },
    "mapsign":{
        "name":"mapsign",
        "sprite":baseTiles['mapsign'],
        "type":"object",
        "collision":true,
        "id":null
    },
    "rockpile":{
        "name":"rockpile",
        "sprite":baseTiles['rockpile'],
        "type":"object",
        "collision":true
    },
    "boulder":{
        "name":"boulder",
        "sprite":baseTiles['boulder'],
        "type":"object",
        "collision":true
    },
    "sand":{
        "name":"sand",
        "sprite":baseTiles['sand'],
        "type":"base-tile",
        "collision":false
    },
    "fenceV":{
        "name":"fenceV",
        "sprite":baseTiles['fenceV'],
        "type":"object",
        "collision":true
    },
    "fenceH":{
        "name":"fenceH",
        "sprite":baseTiles['fenceH'],
        "type":"object",
        "collision":true
    },
    "grass2":{
        "name":"grass2",
        "sprite":baseTiles['grass2'],
        "type":"object",
        "collision":false
    },
    "rain":{//this is also the speedboot trail sprite
        "name":"rain",
        "sprite":baseTiles['rain'],
        "type":"object",
        "collision":false,
    },
    "stump3":{
        "name":"stump3",
        "sprite":baseTiles['stump3'],
        "type":"object",
        "collision":true,
    },
    "stump2":{
        "name":"stump2",
        "sprite":baseTiles['stump2'],
        "type":"object",
        "collision":true,
    },
    "stump1":{
        "name":"stump1",
        "sprite":baseTiles['stump1'],
        "type":"object",
        "collision":false,
    },
    "campfire":{
        "name":"campfire",
        "sprite":baseTiles['campfire'],
        "type":"object",
        "collision":true,
    },
    "grave":{
        "name":"grave",
        "sprite":baseTiles['grave'],
        "type":"object",
        "collision":true,
    },
    "stoneblock":{
        "name":"stoneblock",
        "sprite":baseTiles['stoneblock'],
        "type":"object",
        "collision":true,
    },
    "woodblock":{
        "name":"woodblock",
        "sprite":baseTiles['woodblock'],
        "type":"object",
        "collision":true,
    },
    "rock":{
        "name":"rock",//won't be any issues with this? will probably need id and stuff eventually
        "sprite":baseTiles['rock'],//object['sprite'][0]/[1] are sprite coords
        "type":"base-tile",//as opposed to player or base-tile
        "collision":true,
    },
    "grass":{
        "name":"grass",
        "sprite":baseTiles['grass'],
        "type":"base-tile",//as opposed to object or player
        "collision":false,
    },
    "tree":{
        "name":"tree",
        "sprite":baseTiles['tree'],//need to account for a chopped up tree (same obj, change sprite?)
        "type":"object",//as opposed to object or player
        "collision":true,
    },
    "water":{
        "name":"water",
        "sprite":baseTiles['water'],
        "type":"base-tile",
        "collision":true,
    },
    "oak":{
        "name":"oak",
        "sprite":baseTiles['oak'],
        "type":"object",
        "collision":true,
    },
    "snow":{
        "name":"snow",
        "sprite":baseTiles['snow'],
        "type":"base-tile",
        "collision":false,
    },
    "mushroom":{
        "name":"mushroom",
        "sprite":baseTiles['mushroom'],
        "type":"object",
        "collision":true,
    },
    "deadtree":{
        "name":"deadtree",
        "sprite":baseTiles['deadtree'],
        "type":"object",
        "collision":true,
    },
    "snowtree":{
        "name":"snowtree",
        "sprite":baseTiles['snowtree'],
        "type":"object",
        "collision":true,
    },
    "flower1":{
        "name":"flower1",
        "sprite":baseTiles['flower1'],
        "type":"object",
        "collision":false,
    },
    "flower2":{
        "name":"flower2",
        "sprite":baseTiles['flower2'],
        "type":"object",
        "collision":false,
    },
    "flower3":{
        "name":"flower3",
        "sprite":baseTiles['flower3'],
        "type":"object",
        "collision":false,
    },
    "pathHORIZ":{
        "name":"pathHORIZ",
        "sprite":baseTiles['pathHORIZ'],
        "type":"object",
        "collision":false,
        "coll_override":true
    },
    "pathVERT":{
        "name":"pathVERT",
        "sprite":baseTiles['pathVERT'],
        "type":"object",
        "collision":false,
        "coll_override":true
    },
    "pathTDWN":{
        "name":"pathTDWN",
        "sprite":baseTiles['pathTDWN'],
        "type":"object",
        "collision":false,
        "coll_override":true
    },
    "pathTUP":{
        "name":"pathTUP",
        "sprite":baseTiles['pathTUP'],
        "type":"object",
        "collision":false,
        "coll_override":true
    },
    "pathTRT":{
        "name":"pathTRT",
        "sprite":baseTiles['pathTRT'],
        "type":"object",
        "collision":false,
        "coll_override":true
    },
    "pathTLT":{
        "name":"pathTLT",
        "sprite":baseTiles['pathTLT'],
        "type":"object",
        "collision":false,
        "coll_override":true
    },
    "pathCRS":{
        "name":"pathCRS",
        "sprite":baseTiles['pathCRS'],
        "type":"object",
        "collision":false,
        "coll_override":true
    },
    "pathCRV1":{
        "name":"pathCRV1",
        "sprite":baseTiles['pathCRV1'],
        "type":"object",
        "collision":false,
        "coll_override":true
    },
    "pathCRV2":{
        "name":"pathCRV2",
        "sprite":baseTiles['pathCRV2'],
        "type":"object",
        "collision":false,
        "coll_override":true
    },
    "pathCRV3":{
        "name":"pathCRV3",
        "sprite":baseTiles['pathCRV3'],
        "type":"object",
        "collision":false,
        "coll_override":true
    },
    "pathCRV4":{
        "name":"pathCRV4",
        "sprite":baseTiles['pathCRV4'],
        "type":"object",
        "collision":false,
        "coll_override":true
    }
}
