import { timeToRenew } from "./creepFunctions/timeToRenew";
export class Worker {
  constructor(creep: Creep) {
    const controller = creep.room.controller;

    // This is neccessary to prevent the creep from being stuck in a loop
    creep.memory.beingServed = false;

    // If it has the dedicatedUpgrader role, this is the only thing it should do
    if (creep.memory.state == "dedicatedUpgrader") {
      // Handle time-to-recycle logic
      if (this.recycleCreepIfTooManyWorkers(creep)) {
        // Handle renew logic
        if (timeToRenew(creep)) {
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

    // If this creep has a state of 'spawnMaker' then it should go to the 'claim' flag and being working on the spawn
    if (creep.memory.state == "spawnMaker") {
      // Find the claim flag
      const flag = Game.flags["claim"];

      if (!flag || creep.room.name != flag.room?.name) {
        // Move to it
        creep.moveTo(flag, { visualizePathStyle: { stroke: "#ffffff" }, reusePath: 5 });
      } else {
        // If a spawner exists in the room, delete the claim flag
        const spawner = creep.room.find(FIND_MY_SPAWNS)[0];
        if (spawner) {
          creep.suicide();
        }

        // If the creep's memory doesn't have a 'building' property, add it with a value of false
        if (!creep.memory.building) {
          creep.memory.building = false;
        }

        // If the creep's store is empty, set the building state to false
        if (creep.store.getUsedCapacity() == 0) {
          creep.memory.building = false;
        }

        // If the creep's store is full, set the building state to true
        if (creep.store.getUsedCapacity() == creep.store.getCapacity()) {
          creep.memory.building = true;
        }

        // If the creep's building state is false, mine energy
        if (!creep.memory.building) {
          // Find the closest source
          const source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
          if (source) {
            // Harvest the source
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
              // Move to it
              creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" }, reusePath: 5 });
            }
          }
        }
        // If the creep's building state is true, build the spawn
        else {
          const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
          if (target && creep.build(target) == ERR_NOT_IN_RANGE) {
            // Move into range
            creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" }, reusePath: 5 });
          }
        }
      }
    }

    // If it does not, resume normal operation
    else {
      // Handle time-to-recycle logic
      if (this.recycleCreepIfTooManyWorkers(creep)) {
        // Handle renew logic
        if (timeToRenew(creep)) {
          if (this.retrieveEnergy(creep, false)) {
            // Check if there is a storage with more than 1000 energy
            const storage = creep.room.storage;
            if (!storage || (storage && storage.store[RESOURCE_ENERGY] > 1000)) {
              // If the creep is full, try to find an active construction project to work on
              if (
                creep.room.find(FIND_CONSTRUCTION_SITES).length > 0 &&
                creep.room.controller?.ticksToDowngrade! > 1000
              ) {
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
            reusePath: 5
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
            reusePath: 5
          });
        }
        return false;
      }
    }
    return true;
  }

  recycleCreepIfTooManyWorkers(creep: Creep): boolean {
    const room = creep.room;
    const roomMemory = room.memory as any;

    if (!roomMemory.maxWorkersForBuilding) {
      console.log(`Room memory value 'maxWorkersForBuilding' not found for room ${room.name}`);
      return true;
    }

    // Get the current number of workers in the room
    const workersInRoom = _.filter(Game.creeps, c => c.memory.role === "worker" && c.memory.home === room.name);

    if (workersInRoom.length > roomMemory.maxWorkersForBuilding) {
      const spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
      if (spawn) {
        if (creep.pos.isNearTo(spawn)) {
          spawn.recycleCreep(creep);
        } else {
          creep.moveTo(spawn);
        }
      } else {
        console.log(`No spawn found to recycle creep ${creep.name}`);
      }
      return false;
    }
    return true;
  }
}
