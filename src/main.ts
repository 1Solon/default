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
  // Initialize or reinitialize the room queue if necessary
  if (!Memory.rooms || Object.keys(Memory.rooms).length !== Object.keys(Game.rooms).length) {
    Memory.rooms = {};
  }

  // Populate room memory with owned room objects if they don't already exist
  for (const roomName in Game.rooms) {
    let room = Game.rooms[roomName];

    // If the room is owned by me and the room memory does not already exist
    if (room.controller?.my && !Memory.rooms[roomName]) {
      Memory.rooms[roomName] = {
        roomObject: room,
        remoteHarvesterEfficiency: room.storage ? 0.2 : 0.1,
        previousStorageEnergy: room.storage ? room.storage.store.getUsedCapacity(RESOURCE_ENERGY) : 0
      };
    }
  }

  // Get the room object and index from the queue
  let roomName = Object.keys(Memory.rooms)[Memory.roomIndex];
  let room = Memory.rooms[roomName].roomObject;

  // If the room is owned by me
  try {
    // Run the room manager
    new RoomManager(room);
    new Tower(room);
  } catch (error) {}

  // Increment the index for the next tick
  Memory.roomIndex = (Memory.roomIndex + 1) % Object.keys(Memory.rooms).length;

  // Prints current cpu usage
  console.log("Current CPU usage: " + Math.round(Game.cpu.getUsed() / Game.cpu.limit * 100) + "%");

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
