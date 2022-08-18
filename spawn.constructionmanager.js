module.exports = function () {

    // Defines sources
    let sources = Game.spawns['Spawn1'].room.find(FIND_SOURCES);

    // Defines spawn
    const spawn = Game.spawns['Spawn1'];

    // Grabs roomTerrain of the build area
    let roomTerrain = spawn.room.lookForAtArea(LOOK_TERRAIN, spawn.pos.y - 5, spawn.pos.x - 5, spawn.pos.y + 5, spawn.pos.x + 5, true)

    // Draws a bounding box around the spawn
    let spawnBound = spawn.room.lookForAtArea(LOOK_TERRAIN, spawn.pos.y - 1, spawn.pos.x - 1, spawn.pos.y + 1, spawn.pos.x + 1, true)

    // Finds the number of extensions in the room
    let noOfextensions = spawn.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } }).length;

    // Finds the number of extension sites in the room
    let noOfextensionsSites = spawn.room.find(FIND_CONSTRUCTION_SITES, { filter: { structureType: STRUCTURE_EXTENSION } }).length;

    // Finds the path to all availible sources, then builds roads to them
    for (let j = 0; j < sources.length; j++) {
        let roadPath = spawn.pos.findPathTo(sources[j].pos, { maxOps: 200, ignoreCreeps: true, plainCost: 5, swampCost: 10 });
        for (let i = 0; i < roadPath.length; i++) {

            if ((spawn.room.lookForAt(LOOK_TERRAIN, roadPath[i].x, roadPath[i].y) != 'wall')) {
                spawn.room.createConstructionSite(roadPath[i].x, roadPath[i].y, STRUCTURE_ROAD);
            }
        }
    }

    // Finds a path to the room controller
    let roadPath = Game.spawns['Spawn1'].pos.findPathTo(Game.spawns['Spawn1'].room.controller.pos, { maxOps: 500, ignoreCreeps: true, plainCost: 5, swampCost: 10 });
    for (let i = 0; i < roadPath.length; i++) {

        if (i != roadPath.length) {

            if ((spawn.room.lookForAt(LOOK_TERRAIN, roadPath[i].x, roadPath[i].y) != 'wall')) {
                Game.spawns['Spawn1'].room.createConstructionSite(roadPath[i].x, roadPath[i].y, STRUCTURE_ROAD);
            }
        }
    }

    for (i in spawnBound) {

        if (spawnBound[i].terrain == 'plain' || spawnBound[i].terrain == 'swamp') {

            if (spawn.room.lookForAt(LOOK_STRUCTURES, spawnBound[i].x, spawnBound[i].y).length == 0) {

                spawn.room.createConstructionSite(spawnBound[i].x, spawnBound[i].y, STRUCTURE_ROAD);
            }
        }
    }

    // If the number of extensions is less then the total number of extensions buildable
     // TODO: Hook up the hard-coded 20 to RCL level
    if (noOfextensions + noOfextensionsSites != 20) {
        console.log(noOfextensions)
        // Iterate through a 5x5x5 cube around the spawn
        for (i in roomTerrain) {

            // This is sadly needed to be checked twice, first to save CPU. Second so it actually stops once the buildable limit is hit
            if (noOfextensions + noOfextensionsSites != 20) {

                // If the room tile is a plain or swamp
                if (roomTerrain[i].terrain == 'plain' || roomTerrain[i].terrain == 'swamp') {

                    // If the room tile does not already contain a building
                    if (spawn.room.lookForAt(LOOK_STRUCTURES, roomTerrain[i].x, roomTerrain[i].y).length == 0) {

                        // If the Y is even, check if X is even or odd. Build accordingly.
                        if (roomTerrain[i].y % 2 == 0) {
                            if (roomTerrain[i].x % 2 == 0) {
                                spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_ROAD);
                            } else if (Math.abs(roomTerrain[i].x % 2) == 1) {
                                spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_EXTENSION);
                            }

                            // If the Y is odd, check if X is even or odd. Build accordingly.
                        } else if (Math.abs(roomTerrain[i].y % 2) == 1) {
                            if (roomTerrain[i].x % 2 == 0) {
                                spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_EXTENSION);
                            } else if (Math.abs(roomTerrain[i].x % 2) == 1) {
                                spawn.room.createConstructionSite(roomTerrain[i].x, roomTerrain[i].y, STRUCTURE_ROAD);
                            }
                        }
                    }
                }
            }
        }
    }
};
