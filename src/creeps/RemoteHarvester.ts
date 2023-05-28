import { timeToRenew } from "./creepFunctions/timeToRenew";

export class RemoteHarvester {
  constructor(creep: Creep) {
    const isAttackFlagEnable = creep.room.find(FIND_FLAGS, { filter: flag => flag.name == "basicAttack" }).length > 0;
    const hostileStructures = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);

    // If there are hostile structures and the attack flag is not enabled, spawn an attack flag here
    if (hostileStructures && !isAttackFlagEnable) {
      creep.room.createFlag(creep.pos, "basicAttack");
    }

    // If the attack flag is enabled, and there are no hostile sturctures, remove the flag
    if (isAttackFlagEnable && !hostileStructures) {
      creep.room.find(FIND_FLAGS, { filter: flag => flag.name == "basicAttack" })[0].remove();
    }

    // Handle renew logic
    if (timeToRenew(creep)) {
      switch (creep.memory.state) {
        case "harvesting":
          let targetRoom = Game.rooms[creep.memory.target!];
          if (!targetRoom || creep.room.name != targetRoom.name) {
            // If targetRoom is undefined, move to the target room
            creep.moveTo(new RoomPosition(25, 25, creep.memory.target!), { reusePath: 5 });
          } else {
            // Find closest source
            let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

            if (creep.store.getFreeCapacity() > 0) {
              if (creep.harvest(source!) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source!, { reusePath: 5 });
              }
            } else {
              creep.memory.state = "returning";
            }
          }
          break;
        case "returning":
          let storage = Game.rooms[creep.memory.home].storage;

          if (creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.state = "harvesting";
          } else if (creep.room.name !== creep.memory.home) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.home), { reusePath: 5 });
          } else if (creep.transfer(storage!, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(storage!, { reusePath: 5 });
          } else if (creep.room.energyAvailable < 300 && creep.room.controller!.level < 2) {
            this.refillSpawn(creep);
          } else {
            this.refillWorker(creep);
          }

          break;
      }
    }
  }

  refillWorker(creep: Creep): boolean {
    // Display the state of the hauler
    creep.say("👷", true);

    // Find empty workers
    const creeps: Creep[] = creep.room.find(FIND_MY_CREEPS);
    const workers = creeps.filter(function (i) {
      return i.memory.role == "worker";
    });
    const notFullWorkers = _.filter(workers, function (i) {
      // Ensure the worker is not full and not currently being served by another harvester
      return i.store[RESOURCE_ENERGY] < i.store.getCapacity() && !i.memory.beingServed;
    });

    // If there are any workers that are not full
    if (notFullWorkers.length > 0) {
      const closestWorker = creep.pos.findClosestByPath(notFullWorkers);

      // Make sure the creep has enough energy to achieve this task
      if (closestWorker) {
        // Mark this worker as being served
        closestWorker.memory.beingServed = true;

        // Try to transfer energy to the worker, if not in range
        if (creep.transfer(closestWorker, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          // Move to it
          creep.moveTo(closestWorker, {
            visualizePathStyle: { stroke: "#ffaa00" },
            reusePath: 5
          });
        } else {
          // If energy was transferred successfully, mark the worker as no longer being served
          closestWorker.memory.beingServed = false;
        }
      }
      return false;
    } else {
      return true;
    }
  }

  refillSpawn(creep: Creep): boolean {
    const spawns = creep.room.find(FIND_MY_SPAWNS);

    // Display the state of the hauler
    creep.say("☀️", true);

    // Grab all not-full spawns
    const notFullSpawns = _.filter(spawns, function (i) {
      return i.store[RESOURCE_ENERGY] < 300;
    });
    // If there are any spawns that are not full
    if (notFullSpawns.length > 0) {
      const closestSpawn = creep.pos.findClosestByPath(notFullSpawns);

      // Make sure the creep has enough energy to achieve this task
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
      return false;
    } else {
      return true;
    }
  }
}
