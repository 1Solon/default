export class Worker {
  constructor(creep: Creep) {
    if (this.retrieveEnergy(creep)) {
      // If the creep is full, try to find an active construction project to work on
      if (creep.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
        // Try to finish a construction site, if not in range?
        const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        if (target) {
          if (creep.build(target) == ERR_NOT_IN_RANGE) {
            // Move into range
            creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" }, reusePath: 5 });
          }
        }

        // If the creep is full and there are no construction projects, upgrade the controller
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
      // If there are not, find the closest dropped energy instead
      else {
        // Find energy on the ground
        const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
          filter: resource => resource.resourceType == RESOURCE_ENERGY && resource.amount > 50
        });

        // Find the closest dropped energy
        const closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy);

        // Try to pickup the energy. If it's not in range
        if (closestDroppedEnergy) {
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
