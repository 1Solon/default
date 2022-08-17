module.exports = function () {

    // Defines sources
    let sources = Game.spawns['Spawn1'].room.find(FIND_SOURCES);

    // Defines spawn
    const spawn = Game.spawns['Spawn1'];

    // Grabs roomTerrain
    let roomTerrain = spawn.room.lookForAtArea(LOOK_TERRAIN, spawn.pos.y - 6, spawn.pos.x - 6, spawn.pos.y + 6, spawn.pos.x + 6, true)

    // Tries to construct a turret to the left of the spawner
    spawn.room.createConstructionSite(spawn.pos.x+6, spawn.pos.y, STRUCTURE_TOWER)

    // Finds the path to all availible sources, then builds roads to them
    for (let j = 0; j < sources.length; j++) {
        let roadPath = spawn.pos.findPathTo(sources[j].pos, { maxOps: 200, ignoreCreeps: true, plainCost: 5, swampCost: 10});
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

    for (i in roomTerrain) {
        if (roomTerrain[i].terrain == 'plain' || roomTerrain[i].terrain == 'swamp') {
            if (spawn.room.lookForAt(LOOK_STRUCTURES, roomTerrain[i].x, roomTerrain[i].y).length == 0) {

                // First, get the distance between the target and the spawner
                let targetDistance = Math.max(Math.abs(spawn.pos.x - roomTerrain[i].x), Math.abs(spawn.pos.y - roomTerrain[i].y))

                // Build different objects depending on distance from spawn
                switch (targetDistance) {
                    case 1:
                        let placePos = new RoomPosition(roomTerrain[i].x, roomTerrain[i].y, spawn.room.name);
                        spawn.room.createConstructionSite(placePos, STRUCTURE_ROAD)
                        break
                }

                switch (targetDistance) {
                    case 2:
                        let placePos = new RoomPosition(roomTerrain[i].x, roomTerrain[i].y, spawn.room.name);
                        spawn.room.createConstructionSite(placePos, STRUCTURE_EXTENSION)
                        break
                }

                switch (targetDistance) {
                    case 3:
                        let placePos = new RoomPosition(roomTerrain[i].x, roomTerrain[i].y, spawn.room.name);
                        spawn.room.createConstructionSite(placePos, STRUCTURE_ROAD)
                        break
                }

                switch (targetDistance) {
                    case 4:
                        let placePos = new RoomPosition(roomTerrain[i].x, roomTerrain[i].y, spawn.room.name);
                        spawn.room.createConstructionSite(placePos, STRUCTURE_EXTENSION)
                        break
                }

                switch (targetDistance) {
                    case 5:
                        let placePos = new RoomPosition(roomTerrain[i].x, roomTerrain[i].y, spawn.room.name);
                        spawn.room.createConstructionSite(placePos, STRUCTURE_ROAD)
                        break
                }
            }
        }
    }
};