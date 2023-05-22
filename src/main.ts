// Import utility modules
import { RoomManager } from "managers/RoomManager";

// Import room manager
import { ErrorMapper } from "utils/ErrorMapper";


export const loop = ErrorMapper.wrapLoop(() => {
  // Find all rooms owned by me
  for (const roomName in Game.rooms) {
    // Get the room object
    const room = Game.rooms[roomName];

    // If the room is owned by me
    if (room.controller?.my) {
      // Run the room manager
      new RoomManager(room);
    }
  }
});
