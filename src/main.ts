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

export const loop = ErrorMapper.wrapLoop(() => {
  // Find all rooms owned by me
  for (const roomName in Game.rooms) {
    // Get the room object
    const room = Game.rooms[roomName];

    // If the room is owned by me
    try {
      if (room.controller?.my) {
        // Run the room manager
        new RoomManager(room);
      }

    } catch (error) {
      console.log(error);
    }

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
  }
});
