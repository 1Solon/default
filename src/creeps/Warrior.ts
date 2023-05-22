export class Warrior {
  constructor(creep: Creep) {
    // Define the target room based on the creep's memory
    let targetRoom = Game.rooms[creep.memory.target!];
    const hostileCreeps = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);

    switch (creep.memory.state) {
      case "Traversing":
        // If the creep is not in the targetroom, move to it
        if (!targetRoom) {
          creep.moveTo(new RoomPosition(25, 25, creep.memory.target!));
        } else if (hostileCreeps !== null) {
          creep.memory.state = "Attacking";
        }

        break;

      case "Attacking":
        // If one was found
        if (hostileCreeps !== null) {
          // Try to attack, if the target is not in range
          if (creep.attack(hostileCreeps) === ERR_NOT_IN_RANGE) {
            // Move towards the target
            creep.moveTo(hostileCreeps);
          }
        }
        break;
    }
  }
}
