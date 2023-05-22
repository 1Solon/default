export class ControllerKiller {
    constructor(creep: Creep) {
        // Find the flag
    const flag = Game.flags["controllerKiller"];
    if (!flag) {
      // If the flag does not exist, return early
      console.log("Flag not found");
      return;
    }

    const targetRoom = flag.room;
    const targetController = flag.room?.controller

    if (!targetRoom) {
        creep.moveTo(flag);
      } else {
        // Kill the controller
        // Try to attack, if the target is not in range
        if (creep.attackController(targetController!) === ERR_NOT_IN_RANGE) {
            // Move towards the target
            creep.moveTo(targetController!);
          }
      }

    }
}
