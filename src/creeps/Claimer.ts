export class Claimer {
  constructor(creep: Creep) {
    // Find the flags
    const attackFlag = Game.flags["controllerKiller"];
    const claimFlag = Game.flags["claim"];

    if (!attackFlag && !claimFlag) {
      // If neither flag exists, return early
      console.log("Neither attack nor claim flags found");
      creep.suicide();
      return;
    }

    // Prioritize claim over attack
    const flag = claimFlag || attackFlag;

    const targetRoom = flag.room;
    const targetController = flag.room?.controller;

    if (!targetRoom || creep.room.name != targetRoom.name) {
      creep.moveTo(flag, {reusePath: 5});
    } else {
      if (flag === claimFlag) {
        // If the creep is not in range to claim the controller, move closer
        if (creep.claimController(targetController!) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targetController!, {reusePath: 5});
        }

        // If a spawner exists in the room, delete the claim flag
        const spawner = targetRoom.find(FIND_MY_SPAWNS)[0];
        if (spawner) {
          flag.remove();
        }
      } else {
        // Attack the controller
        // If the creep is not in range to attack, move closer
        if (creep.attackController(targetController!) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targetController!, {reusePath: 5});
        }
      }
    }
  }
}
