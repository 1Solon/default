export class Worker {
  constructor(creep: Creep) {
    if (this.retrieveEnergy(creep)) {
      // Check if there is a storage with more than 1000 energy
      const storage = creep.room.storage;
      if (!storage || (storage && storage.store[RESOURCE_ENERGY] > 1000)) {
        // If the creep is full, try to find an active construction project to work on
        if (creep.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
          // Try to finish a construction site, if not in range
          const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
          if (target) {
            if (creep.build(target) == ERR_NOT_IN_RANGE) {
              // Move into range
              creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" }, reusePath: 5 });
            }
          }
        } else {
          let controller = creep.room.controller;
          if (controller) {
            // Try to upgrade the controller. If not in range
            if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
              // Move to it
              creep.moveTo(controller, { visualizePathStyle: { stroke: "#ffffff" }, reusePath: 5 });
            }
          }
        }
        // If storage exists and has less than 1000 energy then move close to the room controller and wait there
      } else if (storage && storage.store[RESOURCE_ENERGY] < 1000) {
        let controller = creep.room.controller;
        if (controller) {
          // Move to it
          creep.moveTo(controller, { visualizePathStyle: { stroke: "#ffffff" }, reusePath: 5 });
        }
      }
    }
  }

  // Handles energy refill
  retrieveEnergy(creep: Creep): boolean {
    // Determine if the Hauler is empty
    if (creep.store.energy == 0) {
      // Determine if there are any Storages with energy
      let storages: StructureStorage[] = Game.spawns["Spawn1"].room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_STORAGE }
      });
      storages = _.filter(storages, function (i) {
        return i.store[RESOURCE_ENERGY] > 0;
      });

      //  If there are any Storage's with energy
      if (storages.length > 0) {
        // Find the closest storage
        const closestStorage = creep.pos.findClosestByRange(storages);

        // Try to withdraw from the storage, if not in range
        if (closestStorage) {
          if (creep.withdraw(closestStorage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // Move to it
            creep.moveTo(closestStorage, {
              visualizePathStyle: { stroke: "#ffaa00" },
              reusePath: 5
            });
          }
        }
      }
      // If there are not, find the closest dropped energy instead, this should try not to compete with the Haulers at less then RCL 2
      else {
        // Find energy on the ground
        const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
          filter: resource => resource.resourceType == RESOURCE_ENERGY && resource.amount > 50
        });

        // Find the closest dropped energy
        const closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy);

        // Try to pickup the energy. If it's not in range
        if (closestDroppedEnergy && creep.room.controller?.level! > 1) {
          if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
            // Move to it
            creep.moveTo(closestDroppedEnergy, {
              visualizePathStyle: { stroke: "#ffaa00" },
              reusePath: 1
            });
          }
        }
      }
      return false;
    } else {
      return true;
    }
  }
}
