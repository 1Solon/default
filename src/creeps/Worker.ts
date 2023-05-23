export class Worker {
  constructor(creep: Creep) {
    let controller = creep.room.controller;

    // If it has the dedicatedUpgrader role, this is the only thing it should do
    if (creep.memory.state == "dedicatedUpgrader") {
      if (controller) {
        // Try to upgrade the controller. If not in range
        if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
          // Move to it
          creep.moveTo(controller, { visualizePathStyle: { stroke: "#ffffff" }, reusePath: 5 });
        }
      }
    }
    // If it does not, resume normal operation
    else {
      if (this.retrieveEnergy(creep, false)) {
        // Check if there is a storage with more than 1000 energy
        const storage = creep.room.storage;
        if (!storage || (storage && storage.store[RESOURCE_ENERGY] > 1000)) {
          // If the creep is full, try to find an active construction project to work on
          if (creep.room.find(FIND_CONSTRUCTION_SITES).length > 0 && creep.room.controller?.ticksToDowngrade! > 1000) {
            // Try to finish a construction site, if not in range
            // Ignore construction sites when the controler degrade timer drops below 1000

            const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
            if (target) {
              if (creep.build(target) == ERR_NOT_IN_RANGE) {
                // Move into range
                creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" }, reusePath: 5 });
              }
            }
          } else {
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
          if (controller) {
            // Move to it
            creep.moveTo(controller, { visualizePathStyle: { stroke: "#ffffff" }, reusePath: 5 });
          }
        }
      }
    }
  }

  // Handles energy refill
  retrieveEnergy(creep: Creep, skipStorage: Boolean): boolean {
    const storage = creep.room.storage;

    // Find the closest container
    const allContainers: StructureContainer[] = creep.room.find(FIND_STRUCTURES, {
      filter: { structureType: STRUCTURE_CONTAINER }
    });

    // Find containers that have enough energy to fill the creep
    const containers = _.filter(allContainers, function (i) {
      return i.store[RESOURCE_ENERGY] > creep.store.getFreeCapacity();
    });

    // Find the closest container
    const closestContainer = creep.pos.findClosestByRange(containers);

    // Determine if the Hauler is empty
    if (creep.store.energy == 0) {
      // If a storage exists, and we're not skipping it
      if (storage != undefined && storage.store.energy > creep.store.getFreeCapacity() && !skipStorage) {
        if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          // Move to it
          creep.moveTo(storage, {
            visualizePathStyle: { stroke: "#ffaa00" },
            reusePath: 0
          });
        }
        return false;
      }

      // Pickup energy from a container
      else if (closestContainer != undefined && closestContainer.store.energy > creep.store.getFreeCapacity()) {
        if (creep.withdraw(closestContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          // Move to it
          creep.moveTo(closestContainer, {
            visualizePathStyle: { stroke: "#ffaa00" },
            reusePath: 0
          });
        }
        return false;
      }
    }
    return true;
  }
}
