export class Worker {
  constructor(creep: Creep) {
    // Find storage in the room
    let allStorages: StructureStorage[] = Game.spawns["Spawn1"].room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_STORAGE }
    });
    let storages = _.filter(allStorages, function (i) {
      return i.store[RESOURCE_ENERGY] < 1000000;
    });

    // If the Worker's energy is low, try to find some
    if (creep.store[RESOURCE_ENERGY] == 0) {
      // Find energy on the ground
      let droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
        filter: resource => resource.resourceType == RESOURCE_ENERGY && resource.amount > creep.store.getFreeCapacity()
      });

      // If there is energy on the ground, grab that first
      if (droppedEnergy.length > 0) {
        // Find the closest energy on the ground
        const closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy);

        if (closestDroppedEnergy != null) {
          // Try to pickup the energy. If it's not in range
          if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
            // Move to it
            creep.moveTo(closestDroppedEnergy, {
              visualizePathStyle: { stroke: "#ffaa00" },
              reusePath: 1
            });
          }
        }
      } else {
        // Dip into reserves
        // Gets the distance to all storages
        let closestStorage = [];
        for (const i in allStorages) {
          closestStorage.push(
            Math.max(Math.abs(creep.pos.x - storages[i].pos.x), Math.abs(creep.pos.y - storages[i].pos.y))
          );
        }

        let min = Infinity;
        let minID;
        for (const i of closestStorage) {
          if (closestStorage[i] < min) {
            min = closestStorage[i];
            minID = i;
          }
        }

        // Try to transfer energy to the storage. If it's not in range
        if (minID) {
          if (creep.withdraw(allStorages[minID], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // Move to it
            creep.moveTo(allStorages[minID], {
              visualizePathStyle: { stroke: "#ffaa00" }
            });
          }
        }
      }

      // If the creep is full, try to find an active construction project to work on
    } else if (creep.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
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
