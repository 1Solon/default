export class ConstructionManager {
  // Stores the amount of buildable buildings
  totalExtensions: number | undefined;
  totalStorage: number | undefined;
  totalTowers: number | undefined;

  constructor(room: Room) {
    // Populates buildable building limits
    this.getTotalBuildableBuildings(room);

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

    // Finds the number of links in the room
    let noOfLinks = spawn.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } }).length;

    // Finds the number of link sites in the room
    let noOfLinksSites = spawn.room.find(FIND_CONSTRUCTION_SITES, {
      filter: { structureType: STRUCTURE_LINK }
    }).length;

    // Build containers on harvesters
    if (room.controller?.level! >= 3){
      this.placeContainerOnHarvester(room);
    }

    // Finds the path to all availible sources and roomcontrollers, then builds roads to them
    if (room.controller?.level! >= 2) {
      for (let j = 0; j < sources.length; j++) {
        let roadPath = spawn.pos.findPathTo(sources[j].pos, {
          maxOps: 200,
          ignoreCreeps: true,
          plainCost: 1,
          swampCost: 5
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
        roadPath = spawn.pos.findPathTo(roomControllerPos, {
          maxOps: 500,
          ignoreCreeps: true,
          plainCost: 1,
          swampCost: 5
        });
      } else {
        console.error("A roomController does not exist at" + room.name);
      }

      if (roadPath) {
        for (let i = 0; i < roadPath.length; i++) {
          if (i != roadPath.length) {
            if (!spawn.room.lookForAt(LOOK_TERRAIN, roadPath[i].x, roadPath[i].y).includes("wall")) {
              spawn.room.createConstructionSite(roadPath[i].x, roadPath[i].y, STRUCTURE_ROAD);
            }
          }
        }
      }
    }

    for (const i in spawnBound) {
      if (spawnBound[i].terrain.includes("plain") || spawnBound[i].terrain.includes("swamp")) {
        if (spawn.room.lookForAt(LOOK_STRUCTURES, spawnBound[i].x, spawnBound[i].y).length == 0) {
          spawn.room.createConstructionSite(spawnBound[i].x, spawnBound[i].y, STRUCTURE_ROAD);
        }
      }
    }

    // If the number of extensions is less then the total number of extensions buildable
    // TODO: Hook up the hard-coded 20 to RCL level
    if (this.totalExtensions) {
      if (noOfextensions + noOfextensionsSites < this.totalExtensions) {
        // Iterate through a 5x5x5 cube around the spawn
        for (const i in roomTerrain) {
          // This is sadly needed to be checked twice, first to save CPU. Second so it actually stops once the buildable limit is hit
          if (noOfextensions + noOfextensionsSites < this.totalExtensions + 1) {
            // If the room tile is a plain or swamp
            if (roomTerrain[i].terrain.includes("plain") || roomTerrain[i].terrain.includes("swamp")) {
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
    }

    // If the number of turrets is less then the total number of turrets buildable
    // TODO: Hook up the hard-coded 1 to RCL level
    if (this.totalTowers) {
      if (noOfTowers + noOfTowerSites < this.totalTowers) {
        // Iterate through a 5x5x5 cube around the spawn
        for (const i in roomTerrain) {
          // This is sadly needed to be checked twice, first to save CPU. Second so it actually stops once the buildable limit is hit
          if (noOfTowers + noOfTowerSites < this.totalTowers + 1) {
            // If the room tile is a plain or swamp
            if (roomTerrain[i].terrain.includes("plain") || roomTerrain[i].terrain.includes("swamp")) {
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
    }

    // If the number of storages is less then the total number of storages buildable
    // TODO: Hook up the hard-coded 1 to RCL level
    if (noOfStorage + noOfStorageSites < 1) {
      // Iterate through a 5x5x5 cube around the spawn
      for (const i in roomTerrain) {
        // This is sadly needed to be checked twice, first to save CPU. Second so it actually stops once the buildable limit is hit
        if (noOfStorage + noOfStorageSites < 1 + 1) {
          // If the room tile is a plain or swamp
          if (roomTerrain[i].terrain.includes("plain") || roomTerrain[i].terrain.includes("swamp")) {
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

    // If there is not a link in the spawn cube, build one
    let roomLevel = room.controller?.level;
    if (roomLevel! >= 5) {
      // If the number of links is less then the total number of links buildable
      if (noOfLinks + noOfLinksSites < 1) {
        // Iterate through a 5x5x5 cube around the spawn
        for (const i in roomTerrain) {
          // This is sadly needed to be checked twice, first to save CPU. Second so it actually stops once the buildable limit is hit
          if (noOfLinks + noOfLinksSites < 1) {
            // If the room tile is a plain or swamp
            if (roomTerrain[i].terrain.includes("plain") || roomTerrain[i].terrain.includes("swamp")) {
              // If the room tile does not already contain a building
              if (spawn.room.lookForAt(LOOK_STRUCTURES, roomTerrain[i].x, roomTerrain[i].y).length == 0) {
                // If the Y is even, check if X is even or odd. Build accordingly.
                if (roomTerrain[i].y % 2 == 0) {
                  if (roomTerrain[i].x % 2 == 0) {
                    spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_ROAD);
                  } else if (Math.abs(roomTerrain[i].x % 2) == 1) {
                    spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_LINK);
                    noOfLinksSites++;
                  }

                  // If the Y is odd, check if X is even or odd. Build accordingly.
                } else if (Math.abs(roomTerrain[i].y % 2) == 1) {
                  if (roomTerrain[i].x % 2 == 0) {
                    spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_LINK);
                    noOfLinksSites++;
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

    // Place a link for the upgrader
    if (roomLevel! >= 5 && noOfLinks + noOfLinksSites < 2) {
      this.placeLinkForUpgrader(room);
    }

  }

  // Based on the Room Control Level- this will populate the variables that store the max amount of X building that can be made
  getTotalBuildableBuildings(room: Room): void {
    let roomLevel = room.controller?.level;

    if (roomLevel) {
      switch (roomLevel) {
        case 0:
          this.totalExtensions = 0;
          this.totalStorage = 0;
          this.totalTowers = 0;
          break;

        case 1:
          this.totalExtensions = 0;
          this.totalStorage = 0;
          this.totalTowers = 0;
          break;

        case 2:
          this.totalExtensions = 5;
          this.totalStorage = 0;
          this.totalTowers = 0;
          break;

        case 3:
          this.totalExtensions = 10;
          this.totalStorage = 0;
          this.totalTowers = 1;
          break;

        case 4:
          this.totalExtensions = 20;
          this.totalStorage = 1;
          this.totalTowers = 1;
          break;

        case 5:
          this.totalExtensions = 30;
          this.totalStorage = 1;
          this.totalTowers = 2;
          break;

        case 6:
          this.totalExtensions = 40;
          this.totalStorage = 1;
          this.totalTowers = 2;
          break;

        case 7:
          this.totalExtensions = 50;
          this.totalStorage = 1;
          this.totalTowers = 3;
          break;

        case 8:
          this.totalExtensions = 60;
          this.totalStorage = 1;
          this.totalTowers = 6;
          break;
      }
    }
  }

  placeContainerOnHarvester(room: Room): boolean {
    // Find all Harvesters in the room
    const harvesters = room.find(FIND_MY_CREEPS, {
      filter: creep => {
        return creep.memory.role === "harvester";
      }
    });

    for (let harvester of harvesters) {
      // Find all sources within 1 square of the Harvester
      const sourcesNearHarvester = harvester.pos.findInRange(FIND_SOURCES, 1);
      if (sourcesNearHarvester.length > 0) {
        // Get the terrain at the Harvester's position
        const terrain = room.getTerrain();
        if (terrain.get(harvester.pos.x, harvester.pos.y) !== TERRAIN_MASK_WALL) {
          // If there's no construction site here
          const constructionSites = room.lookForAt(LOOK_CONSTRUCTION_SITES, harvester.pos);
          if (constructionSites.length === 0) {
            // Create a construction site for a container
            const result = room.createConstructionSite(harvester.pos, STRUCTURE_CONTAINER);
            if (result === OK) {
              return true;
            } else {
            }
          }
        }
      }
    }

    return false;
  }

  placeLinkForUpgrader(room: Room): void {
    // Get the controller for this room
    let controller = room.controller;
    if (!controller) {
      // No controller in this room, do nothing
      return;
    }

    // Check the positions around the controller for a free spot
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        // We don't want to build on the controller's position
        if (dx === 0 && dy === 0) {
          continue;
        }

        // Calculate the position where we'd like to build
        let x = controller.pos.x + dx;
        let y = controller.pos.y + dy;

        // Check if this position is inside the room
        if (x < 0 || y < 0 || x >= 50 || y >= 50) {
          continue;
        }

        // Check for walls or other impassable terrain
        if (room.lookForAt(LOOK_TERRAIN, x, y)[0] === "wall") {
          continue;
        }

        // Check for creeps at this position
        if (room.lookForAt(LOOK_CREEPS, x, y).length > 0) {
          continue;
        }

        // Look for any structures or construction sites at this position
        let thingsAtPos = room.lookAt(new RoomPosition(x, y, room.name));
        let isPosFree = thingsAtPos.every(
          thing => thing.type !== LOOK_STRUCTURES && thing.type !== LOOK_CONSTRUCTION_SITES
        );

        // If there's nothing there, build the link
        if (isPosFree) {
          let result = room.createConstructionSite(x, y, STRUCTURE_LINK);
          if (result == OK) {
            return; // We're done, exit the function
          }
          else {
            console.log(`Failed to create construction site at ${x},${y} due to error code ${result}`);
          }
        }
      }
    }
  }


}
