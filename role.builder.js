var builder = {

    /** @param {Creep} creep **/
    run: function (creep) {

        // This is to record a persistent state of what the creep should be doing
        // If the creep is building and is empty
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {

            // Set building to false and say so
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }

        // Otherwise if the creep is not building but is full
        else if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {

            // Set building to true and say so
            creep.memory.building = true;
            creep.say('🔨 build');
        }

        // This is having the creep operate based on the building state
        // If the creep is building
        if (creep.memory.building) {

            // Try to finish a construction site, if not in range? Move into range
            const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
            if (creep.build(target) == ERR_NOT_IN_RANGE) {

                // Move to it
                creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } }, { reusePath: 5 });
            }

        } else {

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
                }, { reusePath: 5 }
                );
            }
        }
    }
};

module.exports = builder;