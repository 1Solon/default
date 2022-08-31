export class Hauler {
  constructor(creep: Creep) {
    // 1: Fill Spawns
    if (this.refillSpawn(creep)) {
      // 2: Refill Extensions
      if (this.refillExtension(creep)) {
        // 3: Refill Towers
        if (this.refillTowers(creep)) {
          // 4: Stockpile Energy
          if (this.refillStorage(creep)) {
            // 5: Refill Workers
            this.refillWorker(creep);
          }
        }
      }
    }
  }

  // Refills the main room spawner
  refillSpawn(creep: Creep): boolean {
    const spawns = creep.room.find(FIND_MY_SPAWNS);

    // Grab all not-full spawns
    const notFullSpawns = _.filter(spawns, function (i) {
      return i.store[RESOURCE_ENERGY] < 300;
    });
    // If there are any spawns that are not full
    if (notFullSpawns.length > 0) {
      const closestSpawn = creep.pos.findClosestByRange(notFullSpawns);

      // Make sure the creep has enough energy to achieve this task
      if (this.retrieveEnergy(creep)) {
        // Try to transfer energy to the spawn, if not in range
        if (closestSpawn) {
          if (creep.transfer(closestSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // Move to it
            creep.moveTo(closestSpawn, {
              visualizePathStyle: { stroke: "#ffaa00" },
              reusePath: 5
            });
          }
        }
      }
      return false;
    } else {
      return true;
    }
  }

  // Refills any empty extensions
  refillExtension(creep: Creep): boolean {
    // Find empty extensions
    const extensions: StructureExtension[] = creep.room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_EXTENSION }
    });
    const notFullExtensions = _.filter(extensions, function (i) {
      return i.store[RESOURCE_ENERGY] < 50;
    });

    // If there are any empty extensions
    if (notFullExtensions.length > 0) {
      // Make sure the creep has enough energy to achieve this task
      if (this.retrieveEnergy(creep)) {
        // Find the closest extension
        const closestEmptyExtension = creep.pos.findClosestByRange(notFullExtensions);

        if (closestEmptyExtension) {
          // Try to transfer energy to the extension. If it's not in range
          if (creep.transfer(closestEmptyExtension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // Move to it
            creep.moveTo(closestEmptyExtension, {
              visualizePathStyle: { stroke: "#ffaa00" },
              reusePath: 5
            });
          }
        }
      }
      return false;
    } else {
      return true;
    }
  }

  // Refills any empty towers
  refillTowers(creep: Creep): boolean {
    // Find empty towers
    const towers: StructureTower[] = creep.room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_TOWER }
    });
    const notFullTowers = _.filter(towers, function (i) {
      return i.store[RESOURCE_ENERGY] < 1000;
    });

    // If there are any towers that are not full
    if (notFullTowers.length > 0) {
      const closestTower = creep.pos.findClosestByRange(notFullTowers);

      // Make sure the creep has enough energy to achieve this task
      if (this.retrieveEnergy(creep)) {
        // Try to transfer energy to the tower, if not in range
        if (closestTower) {
          if (creep.transfer(closestTower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // Move to it
            creep.moveTo(closestTower, {
              visualizePathStyle: { stroke: "#ffaa00" },
              reusePath: 5
            });
          }
        }
      }

      return false;
    } else {
      return true;
    }
  }

  // Refills Storages
  refillStorage(creep: Creep): boolean {
    // Find empty Storages
    const storages: StructureStorage[] = creep.room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_STORAGE }
    });
    const notFullStorages = _.filter(storages, function (i) {
      return i.store[RESOURCE_ENERGY] < 1000000;
    });

    // If there are any storages that are not full
    if (notFullStorages.length > 0) {
      const closestStorage = creep.pos.findClosestByRange(notFullStorages);

      // Make sure the creep has enough energy to achieve this task
      if (creep.store.energy == 0) {
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
      } else {
        // Try to transfer energy to the storage, if not in range
        if (closestStorage) {
          if (creep.transfer(closestStorage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // Move to it
            creep.moveTo(closestStorage, {
              visualizePathStyle: { stroke: "#ffaa00" },
              reusePath: 5
            });
          }
        }
      }
      return false;
    } else {
      return true;
    }
  }

  // Handles worker refill
  refillWorker(creep: Creep): boolean {
    // Find empty workers
    const workers: Creep[] = creep.room.find(FIND_MY_CREEPS, {
      filter: { Memory: "Worker" }
    });
    const notFullWorkers = _.filter(workers, function (i) {
      return i.store[RESOURCE_ENERGY] < i.store.getCapacity();
    });

    // If there are any workers that are not full
    if (notFullWorkers.length > 0) {
      const closestWorker = creep.pos.findClosestByRange(notFullWorkers);

      // Make sure the creep has enough energy to achieve this task
      if (this.retrieveEnergy(creep)) {
        // Try to transfer energy to the worker, if not in range
        if (closestWorker) {
          if (creep.transfer(closestWorker, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // Move to it
            creep.moveTo(closestWorker, {
              visualizePathStyle: { stroke: "#ffaa00" },
              reusePath: 5
            });
          }
        }
      }
      return false;
    } else {
      return true;
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
