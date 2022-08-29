export class ConstructionManager {
  constructor(room: Room) {
    // Defines spawn
    let spawn = room.find(FIND_MY_SPAWNS)[0];

    // Defines sources
    let sources = room.find(FIND_SOURCES);

    // Grabs roomTerrain of the build area
    let roomTerrain = spawn.room.lookForAtArea(
      LOOK_TERRAIN,
      spawn.pos.y - 6,
      spawn.pos.x - 6,
      spawn.pos.y + 6,
      spawn.pos.x + 6,
      true
    );

    // Draws a bounding box around the spawn
    let spawnBound = spawn.room.lookForAtArea(
      LOOK_TERRAIN,
      spawn.pos.y - 1,
      spawn.pos.x - 1,
      spawn.pos.y + 1,
      spawn.pos.x + 1,
      true
    );

    // Finds the number of extensions in the room
    let noOfextensions = spawn.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } }).length;

    // Finds the number of extension sites in the room
    let noOfextensionsSites = spawn.room.find(FIND_CONSTRUCTION_SITES, {
      filter: { structureType: STRUCTURE_EXTENSION }
    }).length;

    // Finds the number of towers in the room
    let noOfTowers = spawn.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }).length;

    // Finds the number of tower sites in the room
    let noOfTowerSites = spawn.room.find(FIND_CONSTRUCTION_SITES, {
      filter: { structureType: STRUCTURE_TOWER }
    }).length;

    // Finds the number of towers in the room
    let noOfStorage = spawn.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } }).length;

    // Finds the number of tower sites in the room
    let noOfStorageSites = spawn.room.find(FIND_CONSTRUCTION_SITES, {
      filter: { structureType: STRUCTURE_STORAGE }
    }).length;

    // Finds the path to all availible sources, then builds roads to them
    for (let j = 0; j < sources.length; j++) {
      let roadPath = spawn.pos.findPathTo(sources[j].pos, {
        maxOps: 200,
        ignoreCreeps: true,
        plainCost: 5,
        swampCost: 10
      });
      for (let i = 0; i < roadPath.length; i++) {
        if (!spawn.room.lookForAt(LOOK_TERRAIN, roadPath[i].x, roadPath[i].y).includes("wall")) {
          spawn.room.createConstructionSite(roadPath[i].x, roadPath[i].y, STRUCTURE_ROAD);
        }
      }
    }

    let roomControllerPos = room.controller?.pos;
    let roadPath;
    if (roomControllerPos) {
      roadPath = Game.spawns["Spawn1"].pos.findPathTo(roomControllerPos, {
        maxOps: 500,
        ignoreCreeps: true,
        plainCost: 5,
        swampCost: 10
      });
    } else {
      console.error("A roomController does not exist at" + room.name);
    }

    if (roadPath) {
      for (let i = 0; i < roadPath.length; i++) {
        if (i != roadPath.length) {
          if (!(spawn.room.lookForAt(LOOK_TERRAIN, roadPath[i].x, roadPath[i].y).includes('wall'))) {
            Game.spawns["Spawn1"].room.createConstructionSite(roadPath[i].x, roadPath[i].y, STRUCTURE_ROAD);
          }
        }
      }
    }

    for (const i in spawnBound) {
      if (spawnBound[i].terrain == "plain" || spawnBound[i].terrain == "swamp") {
        if (spawn.room.lookForAt(LOOK_STRUCTURES, spawnBound[i].x, spawnBound[i].y).length == 0) {
          spawn.room.createConstructionSite(spawnBound[i].x, spawnBound[i].y, STRUCTURE_ROAD);
        }
      }
    }

    // If the number of extensions is less then the total number of extensions buildable
    // TODO: Hook up the hard-coded 20 to RCL level
    if (noOfextensions + noOfextensionsSites < 30) {
      // Iterate through a 5x5x5 cube around the spawn
      for (const i in roomTerrain) {
        // This is sadly needed to be checked twice, first to save CPU. Second so it actually stops once the buildable limit is hit
        if (noOfextensions + noOfextensionsSites < 30 + 1) {
          // If the room tile is a plain or swamp
          if (roomTerrain[i].terrain == "plain" || roomTerrain[i].terrain == "swamp") {
            // If the room tile does not already contain a building
            if (spawn.room.lookForAt(LOOK_STRUCTURES, roomTerrain[i].x, roomTerrain[i].y).length == 0) {
              // If the Y is even, check if X is even or odd. Build accordingly.
              if (roomTerrain[i].y % 2 == 0) {
                if (roomTerrain[i].x % 2 == 0) {
                  spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_ROAD);
                } else if (Math.abs(roomTerrain[i].x % 2) == 1) {
                  spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_EXTENSION);
                  noOfextensionsSites++;
                }

                // If the Y is odd, check if X is even or odd. Build accordingly.
              } else if (Math.abs(roomTerrain[i].y % 2) == 1) {
                if (roomTerrain[i].x % 2 == 0) {
                  spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_EXTENSION);
                  noOfextensionsSites++;
                } else if (Math.abs(roomTerrain[i].x % 2) == 1) {
                  spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_ROAD);
                }
              }
            }
          }
        }
      }
    }

    // If the number of turrets is less then the total number of turrets buildable
    // TODO: Hook up the hard-coded 1 to RCL level
    else if (noOfTowers + noOfTowerSites < 2) {
      // Iterate through a 5x5x5 cube around the spawn
      for (const i in roomTerrain) {
        // This is sadly needed to be checked twice, first to save CPU. Second so it actually stops once the buildable limit is hit
        if (noOfTowers + noOfTowerSites < 2 + 1) {
          // If the room tile is a plain or swamp
          if (roomTerrain[i].terrain == "plain" || roomTerrain[i].terrain == "swamp") {
            // If the room tile does not already contain a building
            if (spawn.room.lookForAt(LOOK_STRUCTURES, roomTerrain[i].x, roomTerrain[i].y).length == 0) {
              // If the Y is even, check if X is even or odd. Build accordingly.
              if (roomTerrain[i].y % 2 == 0) {
                if (roomTerrain[i].x % 2 == 0) {
                  spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_ROAD);
                } else if (Math.abs(roomTerrain[i].x % 2) == 1) {
                  spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_TOWER);
                  noOfTowerSites++;
                }

                // If the Y is odd, check if X is even or odd. Build accordingly.
              } else if (Math.abs(roomTerrain[i].y % 2) == 1) {
                if (roomTerrain[i].x % 2 == 0) {
                  spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_TOWER);
                  noOfTowerSites++;
                } else if (Math.abs(roomTerrain[i].x % 2) == 1) {
                  spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_ROAD);
                }
              }
            }
          }
        }
      }
    }

    // If the number of storages is less then the total number of storages buildable
    // TODO: Hook up the hard-coded 1 to RCL level
    else if (noOfStorage + noOfStorageSites < 1) {
      // Iterate through a 5x5x5 cube around the spawn
      for (const i in roomTerrain) {
        // This is sadly needed to be checked twice, first to save CPU. Second so it actually stops once the buildable limit is hit
        if (noOfStorage + noOfStorageSites < 1 + 1) {
          // If the room tile is a plain or swamp
          if (roomTerrain[i].terrain == "plain" || roomTerrain[i].terrain == "swamp") {
            // If the room tile does not already contain a building
            if (spawn.room.lookForAt(LOOK_STRUCTURES, roomTerrain[i].x, roomTerrain[i].y).length == 0) {
              // If the Y is even, check if X is even or odd. Build accordingly.
              if (roomTerrain[i].y % 2 == 0) {
                if (roomTerrain[i].x % 2 == 0) {
                  spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_ROAD);
                } else if (Math.abs(roomTerrain[i].x % 2) == 1) {
                  spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_STORAGE);
                  noOfStorageSites++;
                }

                // If the Y is odd, check if X is even or odd. Build accordingly.
              } else if (Math.abs(roomTerrain[i].y % 2) == 1) {
                if (roomTerrain[i].x % 2 == 0) {
                  spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_STORAGE);
                  noOfStorageSites++;
                } else if (Math.abs(roomTerrain[i].x % 2) == 1) {
                  spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_ROAD);
                }
              }
            }
          }
        }
      }
    }
  }
}
