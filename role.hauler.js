let hauler = {
    /** @param {Creep} creep **/
    run: function (creep) {

        // Find spawns in the room
        const spawns = creep.room.find(FIND_MY_SPAWNS);

        // Find turrets in the room
        let turrets = Game.spawns['Spawn1'].room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });

        // Find Extensions
        let extensions = Game.spawns['Spawn1'].room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } });

        // Find the closest spawn
        let closestSpawn = creep.pos.findClosestByRange(spawns);

        // Definitions
        let initialVal;

        // Find the builder creep with the lowest amount of energy
        let builders = _.filter(
            Game.creeps,
            (creep) => creep.memory.role == "builder"
        );
        let emptiestBuilder;
        initialVal = 1000;
        for (i in builders) {
            if (builders[i].store[RESOURCE_ENERGY] < initialVal) {
                initialVal = builders[i].store[RESOURCE_ENERGY];
                emptiestBuilder = builders[i].id;
            }
        }

        // Find the upgrader creep with the lowest amount of energy
        let upgraders = _.filter(
            Game.creeps,
            (creep) => creep.memory.role == "upgrader"
        );
        let emptiestUpgrader;
        initialVal = 1000;
        for (i in upgraders) {
            if (upgraders[i].store[RESOURCE_ENERGY] < initialVal) {
                initialVal = upgraders[i].store[RESOURCE_ENERGY];
                emptiestUpgrader = upgraders[i].id;
            }
        }

        // If the hauler is empty 
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) < 50) {

            // Find energy on the ground
            let droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (resource) =>
                    (resource.resourceType == RESOURCE_ENERGY)
                    && resource.amount > creep.store.getFreeCapacity()
            });

            // Find the closest energy on the ground
            const closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy);

            // Try to pickup the energy. If it's not in range
            if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
                // Move to it
                creep.moveTo(closestDroppedEnergy, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                }, { reusePath: 5 }
                );
            }

            // Fill the spawn first
        } else if (closestSpawn.store[RESOURCE_ENERGY] < 300) {
            if (creep.transfer(closestSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestSpawn, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                }, { reusePath: 5 });
            }

            // Fill any extensions next
        } else if (extensions.find(structure => structure.store[RESOURCE_ENERGY] < 50) != undefined) {

            let emptyExtensionPos = extensions.find(structure => structure.store[RESOURCE_ENERGY] < 50).id

            // Try to transfer energy to the spawn. If it's not in range
            if (
                creep.transfer(Game.getObjectById(emptyExtensionPos), RESOURCE_ENERGY) ==
                ERR_NOT_IN_RANGE
            ) {
                // Move to it
                creep.moveTo(Game.getObjectById(emptyExtensionPos), {
                    visualizePathStyle: { stroke: "#ffaa00" },
                }, { reusePath: 5 });
            }

            // Fill any towers that need filling
        } else if (turrets.find(structure => structure.store[RESOURCE_ENERGY] < 1000) != undefined) {

            let emptyTurrets = turrets.find(structure => structure.store[RESOURCE_ENERGY] < 1000).id

            // Try to transfer energy to the spawn. If it's not in range
            if (
                creep.transfer(Game.getObjectById(emptyTurrets), RESOURCE_ENERGY) ==
                ERR_NOT_IN_RANGE
            ) {
                // Move to it
                creep.moveTo(Game.getObjectById(emptyTurrets), {
                    visualizePathStyle: { stroke: "#ffaa00" },
                }, { reusePath: 5 });
            }

            // Refill any active builders
        } else if (Game.getObjectById(emptiestBuilder).store[RESOURCE_ENERGY] < 50) {
            if (
                creep.transfer(Game.getObjectById(emptiestBuilder), RESOURCE_ENERGY) ==
                ERR_NOT_IN_RANGE
            ) {
                // Move to it
                creep.moveTo(Game.getObjectById(emptiestBuilder), {
                    visualizePathStyle: { stroke: "#ffaa00" },
                }, { reusePath: 5 });
            }

            // Refill any active upgraders
        } else if (Game.getObjectById(emptiestUpgrader).store[RESOURCE_ENERGY] < 50) {
            if (
                creep.transfer(Game.getObjectById(emptiestUpgrader), RESOURCE_ENERGY) ==
                ERR_NOT_IN_RANGE
            ) {
                // Move to it
                creep.moveTo(Game.getObjectById(emptiestUpgrader), {
                    visualizePathStyle: { stroke: "#ffaa00" },
                }, { reusePath: 5 });
            }
        }
    },
};

module.exports = hauler;
