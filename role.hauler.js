const { max } = require("lodash");

let hauler = {
    /** @param {Creep} creep **/
    run: function (creep) {

        // Find spawns in the room
        const spawns = creep.room.find(FIND_MY_SPAWNS);

        // Find storage in the room
        let allStorages = Game.spawns['Spawn1'].room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } });
        let storages = _.filter(allStorages, function (i) { return i.store[RESOURCE_ENERGY] < 1000000 })

        // Find turrets in the room
        let turrets = Game.spawns['Spawn1'].room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });

        // Find Extensions
        let extensions = Game.spawns['Spawn1'].room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } });
        extensions = _.filter(extensions, function (i) { return i.energy < 50 })

        // Find the closest spawn
        let closestSpawn = creep.pos.findClosestByRange(spawns);

        // Definitions
        let initialVal;

        // Find the worker creep with the lowest amount of energy
        let workers = _.filter(
            Game.creeps,
            (creep) => creep.memory.role == "worker"
        );
        let emptiestWorker;
        initialVal = 1000;
        for (i in workers) {
            if (workers[i].store[RESOURCE_ENERGY] < initialVal) {
                initialVal = workers[i].store[RESOURCE_ENERGY];
                emptiestWorker = workers[i].id;
            }
        }

        // If the hauler is empty 
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) < 50) {
            // Find energy on the ground
            let droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (resource) =>
                    (resource.resourceType == RESOURCE_ENERGY)
                    && resource.amount > 50
            });

            // If there is energy on the ground, grab that first
            if (droppedEnergy.length > 0) {

                // Find the closest energy on the ground
                const closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy);

                // Try to pickup the energy. If it's not in range
                if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
                    // Move to it
                    creep.moveTo(closestDroppedEnergy, {
                        visualizePathStyle: { stroke: "#ffaa00" },
                    }, { reusePath: 1 }
                    );
                }

            } else {
                // Dip into reserves
                 // Gets the distance to all storages 
                 let closestStorage = [];
                 for (i in allStorages) {
                     closestStorage.push(Math.max(Math.abs(creep.pos.x - storages[i].pos.x), Math.abs(creep.pos.y - storages[i].pos.y)))
                 }
 
                 let min = Infinity
                 let minID
                 for (i in closestStorage) {
                     if (closestStorage[i] < min) {
                         min = closestStorage[i]
                         minID = i
                     }
                 }
 
                 // Try to transfer energy to the storage. If it's not in range
                 if (
                     creep.withdraw(allStorages[minID], RESOURCE_ENERGY) ==
                     ERR_NOT_IN_RANGE
                 ) {
                     // Move to it
                     creep.moveTo(allStorages[minID], {
                         visualizePathStyle: { stroke: "#ffaa00" },
                     }, { reusePath: 5 });
                 }
            }

            // Fill the spawn first
        } else if (closestSpawn.store[RESOURCE_ENERGY] < 300) {
            if (creep.transfer(closestSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestSpawn, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                }, { reusePath: 5 });
            }

            // Fill any extensions next
        } else if (extensions.length > 0) {
            // If there are no empty extensions, catch undefined
            try {

                // Gets the distance to all availible extensions
                let closestEmptyExtension = [];
                for (i in extensions) {
                    closestEmptyExtension.push(Math.max(Math.abs(creep.pos.x - extensions[i].pos.x), Math.abs(creep.pos.y - extensions[i].pos.y)))
                }

                let min = Infinity
                let minID
                for (i in closestEmptyExtension) {
                    if (closestEmptyExtension[i] < min) {
                        min = closestEmptyExtension[i]
                        minID = i
                    }
                }

                // Try to transfer energy to the spawn. If it's not in range
                if (
                    creep.transfer(extensions[minID], RESOURCE_ENERGY) ==
                    ERR_NOT_IN_RANGE
                ) {
                    // Move to it
                    creep.moveTo(extensions[minID], {
                        visualizePathStyle: { stroke: "#ffaa00" },
                    }, { reusePath: 5 });
                }
            } catch { Error }



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

            // Fill storage
        } else if (storages.length > 0) {
            // If there are no empty storages, catch undefined
            try {

                // Gets the distance to all storages 
                let closestEmptyStorage = [];
                for (i in storages) {
                    closestEmptyStorage.push(Math.max(Math.abs(creep.pos.x - storages[i].pos.x), Math.abs(creep.pos.y - storages[i].pos.y)))
                }

                let min = Infinity
                let minID
                for (i in closestEmptyStorage) {
                    if (closestEmptyStorage[i] < min) {
                        min = closestEmptyStorage[i]
                        minID = i
                    }
                }

                // Try to transfer energy to the storage. If it's not in range
                if (
                    creep.transfer(storages[minID], RESOURCE_ENERGY) ==
                    ERR_NOT_IN_RANGE
                ) {
                    // Move to it
                    creep.moveTo(storages[minID], {
                        visualizePathStyle: { stroke: "#ffaa00" },
                    }, { reusePath: 5 });
                }
            } catch { console.log(Error) }



        }// Refill any active builders
        else if (Game.getObjectById(emptiestWorker).store[RESOURCE_ENERGY] < 50) {
            if (
                creep.transfer(Game.getObjectById(emptiestWorker), RESOURCE_ENERGY) ==
                ERR_NOT_IN_RANGE
            ) {
                // Move to it
                creep.moveTo(Game.getObjectById(emptiestWorker), {
                    visualizePathStyle: { stroke: "#ffaa00" },
                }, { reusePath: 5 });
            }
        }
    },
};

module.exports = hauler;
