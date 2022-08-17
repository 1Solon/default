var hauler = {
    /** @param {Creep} creep **/
    run: function (creep) {

        // Find spawns in the room
        const spawns = creep.room.find(FIND_MY_SPAWNS);

        // Find Extensions
        var extensions = Game.spawns['Spawn1'].room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } });
        
        // Find the closest spawn
        var closestSpawn = creep.pos.findClosestByRange(spawns);

        // If the hauler is empty 
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) < 50) {

            // Find energy on the ground
            var droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
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
                }, { reusePath: 15 }
                );
            }

        } else if (closestSpawn.store[RESOURCE_ENERGY] < 300) {
            // Try to transfer energy to the spawn. If it's not in range
            if (creep.transfer(closestSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                // Move to it
                creep.moveTo(closestSpawn, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                }, { reusePath: 15 });
            }

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
                    }, { reusePath: 15 });
                }
            
        } else {
            // Find the upgrade creep with the lowest amount of energy
            var upgraders = _.filter(
                Game.creeps,
                (creep) => creep.memory.role == "upgrader"
            );
            for (i in upgraders) {
                let minVal = 50;
                var minId;

                if (upgraders[0].store[RESOURCE_ENERGY] < minVal) {
                    minVal = upgraders[i].store;
                    minId = upgraders[i].id;
                }

                // Try to transfer energy to the spawn. If it's not in range
                if (
                    creep.transfer(Game.getObjectById(minId), RESOURCE_ENERGY) ==
                    ERR_NOT_IN_RANGE
                ) {
                    // Move to it
                    creep.moveTo(Game.getObjectById(minId), {
                        visualizePathStyle: { stroke: "#ffaa00" },
                    }, { reusePath: 15 });

                    // Reset minval
                    minVal = 50;
                }
            }
        }
    },
};

module.exports = hauler;
