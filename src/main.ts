// Import creeps
import { Worker } from "creeps/Worker";
import { Claimer } from "creeps/Claimer";
import { Harvester } from "creeps/Harvester";
import { Hauler } from "creeps/Hauler";
import { RemoteHarvester } from "creeps/RemoteHarvester";
import { Warrior } from "creeps/Warrior";

// Import managers
import { RoomManager } from "managers/RoomManager";

// Import utilities
import { ErrorMapper } from "utils/ErrorMapper";
import { Tower } from "creeps/Tower";

export const loop = ErrorMapper.wrapLoop(() => {
  // Ensure Memory.rooms exists
  if (!Memory.rooms) {
    Memory.rooms = {};
  }
  // Iterate over all rooms in the game
  for (let roomName in Game.rooms) {
    const room = Game.rooms[roomName];

    // Check if the room is owned by you
    if (room.controller && room.controller.my) {
      // Initialize this room in memory if it isn't present already
      if (!Memory.rooms[roomName]) {
        Memory.rooms[roomName] = {
          roomObject: room, // Don't remove this, it does nothing, but for some reason removing it breaks the code
          harvesterEfficiency: room.storage ? 1 : 1,
          previousStorageEnergy: room.storage ? room.storage.store.getUsedCapacity(RESOURCE_ENERGY) : 0,
          roomClock: 0,
          maxWorkersForBuilding: 0
        };
      }
    }
  }

  // Get the room object and index from the queue
  let roomName = Object.keys(Memory.rooms)[Memory.roomIndex];
  let room = Game.rooms[roomName];

  // If the room is owned by me
  try {
    // Run the room manager
    new RoomManager(room);
    new Tower(room);
  } catch (error) {
    console.log(error);
  }

  // Increment the index for the next tick
  Memory.roomIndex = (Memory.roomIndex + 1) % Object.keys(Memory.rooms).length;

  // Increment the index for the next tick
  Memory.roomIndex = (Memory.roomIndex + 1) % Object.keys(Memory.rooms).length;

  // Increment the clock for the next tick
  Memory.rooms[roomName].roomClock += 1;

  // If the clock exeeds 60, reset it
  if (Memory.rooms[roomName].roomClock > 60) {
    Memory.rooms[roomName].roomClock = 0;
  }

  // Prints current cpu usage
  console.log("Current CPU usage: " + Math.round((Game.cpu.getUsed() / Game.cpu.limit) * 100) + "%");

  // Loop through creep's names in Game.creeps
  for (var creepName in Game.creeps) {
    // Get the creep based on the its name
    var creep = Game.creeps[creepName];

    // If the creep is a harvester
    if (creep.memory.role == "harvester") {
      // Run the creep as one and iterate
      new Harvester(creep);
      continue;
    }

    // If the creep is an worker
    if (creep.memory.role == "worker") {
      // Run the creep as one and iterate
      new Worker(creep);
      continue;
    }

    // If the creep is a hauler
    if (creep.memory.role == "hauler") {
      // Run the creep as one and iterate
      new Hauler(creep);
      continue;
    }

    // If the creep is a long range harvester
    if (creep.memory.role == "remoteHarvester") {
      // Run the creep as one and iterate
      new RemoteHarvester(creep);
      continue;
    }

    // Starts the warrior
    if (creep.memory.role == "Warrior") {
      new Warrior(creep);
      continue;
    }

    // Starts the controller killer
    if (creep.memory.role == "Claimer") {
      new Claimer(creep);
      continue;
    }
  }
});
