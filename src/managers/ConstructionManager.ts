export class ConstructionManager {
  // Stores the amount of buildable buildings
  totalExtensions: number | undefined;
  totalStorage: number | undefined;
  totalTowers: number | undefined;

  constructor(room: Room) {
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

    // Build containers on harvesters
    if (room.controller?.level! >= 3) {
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

    // Creates extensions
    this.checkerboard(
      roomTerrain,
      room,
      STRUCTURE_EXTENSION,
      CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][room.controller?.level!]
    );

    // Creates towers
    this.checkerboard(
      roomTerrain,
      room,
      STRUCTURE_TOWER,
      CONTROLLER_STRUCTURES[STRUCTURE_TOWER][room.controller?.level!]
    );

    // Creates storage
    this.checkerboard(
      roomTerrain,
      room,
      STRUCTURE_STORAGE,
      CONTROLLER_STRUCTURES[STRUCTURE_STORAGE][room.controller?.level!]
    );

    // If there is not a link in the spawn cube, build one
    const roomLevel = room.controller?.level;
    if (roomLevel! > 4) {
      this.checkerboard(roomTerrain, room, STRUCTURE_LINK, 1);
    }

    // Place a link near the controller
    if (roomLevel! > 4) {
      this.placeLinkNearController(room);
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

  /**
     * Creates a checkerboard pattern of roads and buildings
     *
     * @param roomTerrain - The terrain of the area to be checkerboarded
     * @param room - The room this is being done in
     * @param building - The building type to be checkerboarded
     * @param maxOfBuilding - The maximum number of buildings of this type to be built

     */
  checkerboard(
    roomTerrain: LookForAtAreaResultArray<Terrain, "terrain">,
    room: Room,
    building: BuildableStructureConstant,
    maxOfBuilding: number
  ): void {
    // Grab the maximum number of the target building by room level
    const targetNoOfBuildins = maxOfBuilding;

    // Get the current number of buildings and building sites of that type
    let noOfBuildings = room.find(FIND_STRUCTURES, {
      filter: structure => structure.structureType === building
    }).length;
    let noOfBuildingsSites = room.find(FIND_CONSTRUCTION_SITES, {
      filter: structure => structure.structureType === building
    }).length;

    // The spawn should always be the first spawn building in the stack
    const spawn = room.find(FIND_MY_SPAWNS)[0];

    // If the number of buildings is less than the total number of buildings buildable
    if (noOfBuildings + noOfBuildingsSites < targetNoOfBuildins) {
      for (const i in roomTerrain) {
        // Get room position
        let roomPos = new RoomPosition(roomTerrain[i].x, roomTerrain[i].y, spawn.room.name);

        // We use bitwise AND operation here instead of modulo operation for efficiency.
        const xIsEven = roomPos.x & 1;
        const yIsEven = roomPos.y & 1;

        // Check terrain
        const terrain = roomPos.lookFor(LOOK_TERRAIN);

        // Check structure
        const structure = roomPos.lookFor(LOOK_STRUCTURES);

        // Check conditions
        if (terrain[0] === "plain" || terrain[0] === "swamp") {
          if (!structure.length) {
            if (yIsEven) {
              if (xIsEven) {
                spawn.room.createConstructionSite(roomPos, STRUCTURE_ROAD);
              } else {
                spawn.room.createConstructionSite(roomPos, building);
                noOfBuildingsSites++;
                if (noOfBuildings + noOfBuildingsSites >= targetNoOfBuildins) break;
              }
            } else {
              if (xIsEven) {
                spawn.room.createConstructionSite(roomPos, building);
                noOfBuildingsSites++;
                if (noOfBuildings + noOfBuildingsSites >= targetNoOfBuildins) break;
              } else {
                spawn.room.createConstructionSite(roomPos, STRUCTURE_ROAD);
              }
            }
          }
        }
      }
    }
  }

  placeLinkNearController(room: Room): boolean {
    const controller = room.controller;

    if (!controller) {
      console.log("Room controller not found!");
      return false;
    }

    // Get all links and link construction sites in the room
    const links = room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_LINK }
    });
    const constructionSites = room.find(FIND_CONSTRUCTION_SITES, {
      filter: { structureType: STRUCTURE_LINK }
    });

    // Check if there are less than two links or link construction sites
    if (links.length + constructionSites.length >= 2) {
      return false;
    }

    // Get all spots within two spaces of the controller
    const locations = room.lookForAtArea(
      LOOK_TERRAIN,
      Math.max(controller.pos.y - 2, 0),
      Math.max(controller.pos.x - 2, 0),
      Math.min(controller.pos.y + 2, 49),
      Math.min(controller.pos.x + 2, 49),
      true
    );

    // Filter out locations that aren't plain or swamp terrain
    const validLocations = locations.filter(({ terrain }) => terrain !== "wall");

    // Attempt to create a construction site for a link at each location
    for (let { x, y } of validLocations) {
      const result = room.createConstructionSite(x, y, STRUCTURE_LINK);

      if (result === OK) {
        console.log(`Link construction site placed at (${x}, ${y})`);
        return true;
      }
    }

    // If no valid location is found, return false
    console.log("No valid location for link construction found!");
    return false;
  }
}
