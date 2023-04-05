baseTiles = {//redo entirely and in order
    "grass":[0,0],//plain, green grass
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
    "woodblock":[304,0],//
    "stump1":[192,448],
    "stump2":[64,1120],
    "stump3":[80,1120],
    "campfire":[32,384],//
  }

  gameObjects = {
    "stump3":{
        "name":"stump3",
        "sprite":baseTiles['stump3'],
        "type":"object",
        "collision":true,
        "x":null,
        "y":null
    },
    "stump2":{
        "name":"stump2",
        "sprite":baseTiles['stump2'],
        "type":"object",
        "collision":true,
        "x":null,
        "y":null
    },
    "stump1":{
        "name":"stump1",
        "sprite":baseTiles['stump1'],
        "type":"object",
        "collision":true,
        "x":null,
        "y":null
    },
    "campfire":{
        "name":"campfire",
        "sprite":baseTiles['campfire'],
        "type":"object",
        "collision":true,
        "x":null,
        "y":null
    },
    "grave":{
        "name":"grave",
        "sprite":baseTiles['grave'],
        "type":"object",
        "collision":true,
        "x":null,
        "y":null
    },
    "stoneblock":{
        "name":"stoneblock",
        "sprite":baseTiles['stoneblock'],
        "type":"object",
        "collision":true,
        "x":null,
        "y":null
    },
    "woodblock":{
        "name":"woodblock",
        "sprite":baseTiles['woodblock'],
        "type":"object",
        "collision":true,
        "x":null,
        "y":null
    },
    "rock":{
        "name":"rock",//won't be any issues with this? will probably need id and stuff eventually
        "sprite":baseTiles['rock'],//object['sprite'][0]/[1] are sprite coords
        "type":"object",//as opposed to player or base-tile
        "collision":true,
        "x":null,//this might be unnecessary but we'll see
        "y":null
    },
    "grass":{
        "name":"grass",
        "sprite":baseTiles['grass'],
        "type":"base-tile",//as opposed to object or player
        "collision":false,
        "x":null,
        "y":null
    },
    "tree":{
        "name":"tree",
        "sprite":baseTiles['tree'],//need to account for a chopped up tree (same obj, change sprite?)
        "type":"object",//as opposed to object or player
        "collision":true,
        "x":null,
        "y":null
    },
    "water":{
        "name":"water",
        "sprite":baseTiles['water'],
        "type":"base-tile",
        "collision":true,
        "x":null,
        "y":null
    },
    "oak":{
        "name":"oak",
        "sprite":baseTiles['oak'],
        "type":"object",
        "collision":true,
        "x":null,
        "y":null
    },
    "snow":{
        "name":"snow",
        "sprite":baseTiles['snow'],
        "type":"base-tile",
        "collision":false,
        "x":null,
        "y":null
    },
    "mushroom":{
        "name":"mushroom",
        "sprite":baseTiles['mushroom'],
        "type":"object",
        "collision":true,
        "x":null,
        "y":null
    },
    "deadtree":{
        "name":"deadtree",
        "sprite":baseTiles['deadtree'],
        "type":"object",
        "collision":true,
        "x":null,
        "y":null
    },
    "snowtree":{
        "name":"snowtree",
        "sprite":baseTiles['snowtree'],
        "type":"object",
        "collision":true,
        "x":null,
        "y":null
    },
    "flower1":{
        "name":"flower1",
        "sprite":baseTiles['flower1'],
        "type":"object",
        "collision":false,
        "x":null,
        "y":null
    },
    "flower2":{
        "name":"flower2",
        "sprite":baseTiles['flower2'],
        "type":"object",
        "collision":false,
        "x":null,
        "y":null
    },
    "flower3":{
        "name":"flower3",
        "sprite":baseTiles['flower3'],
        "type":"object",
        "collision":false,
        "x":null,
        "y":null
    },
    "pathHORIZ":{
        "name":"pathHORIZ",
        "sprite":baseTiles['pathHORIZ'],
        "type":"object",//ok so more than one object per tile?
        "collision":false,
        "x":null,
        "y":null
    },
    "pathVERT":{
        "name":"pathVERT",
        "sprite":baseTiles['pathVERT'],
        "type":"object",
        "collision":false,
        "x":null,
        "y":null
    },
    "pathTDWN":{
        "name":"pathTDWN",
        "sprite":baseTiles['pathTDWN'],
        "type":"object",
        "collision":false,
        "x":null,
        "y":null
    },
    "pathTUP":{
        "name":"pathTUP",
        "sprite":baseTiles['pathTUP'],
        "type":"object",
        "collision":false,
        "x":null,
        "y":null
    },
    "pathTRT":{
        "name":"pathTRT",
        "sprite":baseTiles['pathTRT'],
        "type":"object",
        "collision":false,
        "x":null,
        "y":null
    },
    "pathTLT":{
        "name":"pathTLT",
        "sprite":baseTiles['pathTLT'],
        "type":"object",
        "collision":false,
        "x":null,
        "y":null
    },
    "pathCRS":{
        "name":"pathCRS",
        "sprite":baseTiles['pathCRS'],
        "type":"object",
        "collision":false,
        "x":null,
        "y":null
    },
    "pathCRV1":{
        "name":"pathCRV1",
        "sprite":baseTiles['pathCRV1'],
        "type":"object",
        "collision":false,
        "x":null,
        "y":null
    },
    "pathCRV2":{
        "name":"pathCRV2",
        "sprite":baseTiles['pathCRV2'],
        "type":"object",
        "collision":false,
        "x":null,
        "y":null
    },
    "pathCRV3":{
        "name":"pathCRV3",
        "sprite":baseTiles['pathCRV3'],
        "type":"object",
        "collision":false,
        "x":null,
        "y":null
    },
    "pathCRV4":{
        "name":"pathCRV4",
        "sprite":baseTiles['pathCRV4'],
        "type":"object",
        "collision":false,
        "x":null,
        "y":null
    }
}