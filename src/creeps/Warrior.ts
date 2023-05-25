export class Warrior {
  constructor(creep: Creep) {
    // Find the flag
    const flag = Game.flags["basicAttack"];
    if (!flag) {
      // If the flag does not exist, return early
      console.log("Flag not found");
      creep.suicide()
      return;
    }

    // Get the target room from the flag's position
    const targetRoom = flag.room;
    const hostileCreeps = creep.room?.find(FIND_HOSTILE_CREEPS);
    const spawner = creep.pos.findClosestByPath(FIND_HOSTILE_SPAWNS);
    const turret = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
    const closestHostileStructure = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);

    // Determine if this creep is the 'leader'
    const isLeader = creep.memory.isLeader;

    // Handle squad logic
    if (isLeader) {
      if (!targetRoom || creep.room != flag.room) {
        creep.moveTo(flag, {reusePath: 5});
      }
    } else if (!isLeader && creep.room != targetRoom) {
      // If not the leader, follow the leader
      const leader = Game.creeps[creep.memory.leader];
      if (leader) {
        // If the leader is within range, follow the leader
        if (creep.pos.isNearTo(leader.pos)) {
          creep.moveTo(leader, {reusePath: 5});
        }
        // If leader is not in range, move to leader's position
        else {
          creep.moveTo(leader, {reusePath: 5});
        }
      }
    }

    // Handle attack logic
    // If we are in the target room, engage combat logic
    if (creep.room == targetRoom) {
      if (creep.hits < creep.hitsMax) {
        console.log("Creep " + creep.name + " is under attack");
      }

      // If the leader creep is not in the target room, move to the flag
      if (!targetRoom || creep.room != flag.room) {
        creep.moveTo(flag, {reusePath: 5});
      } else {
        // If a turret exists, eliminate
        if (turret) {
          // Try to attack, if the target is not in range
          if (creep.attack(turret) === ERR_NOT_IN_RANGE) {
            if (creep.hits < creep.hitsMax) {
              // if this creep is injured, heal itself
              creep.heal(creep);
            }
            // Move towards the target
            creep.moveTo(turret, {reusePath: 5});
          }
        }
        // If a spawner exists, eliminate
        else if (spawner) {
          // Try to attack, if the target is not in range
          if (creep.attack(spawner) === ERR_NOT_IN_RANGE) {
            if (creep.hits < creep.hitsMax) {
              // if this creep is injured, heal itself
              creep.heal(creep);
            }
            // Move towards the target
            creep.moveTo(spawner, {reusePath: 5});
          }
        }
        // If any creeps dare survive, obliterate
        else if (hostileCreeps.length > 0) {
          // Find the closest hostile creep
          const closestHostile = creep.pos.findClosestByPath(hostileCreeps!);
          // If one was found
          if (closestHostile) {
            // Try to attack, if the target is not in range
            if (creep.attack(closestHostile) === ERR_NOT_IN_RANGE) {
              if (creep.hits < creep.hitsMax) {
                // if this creep is injured, heal itself
                creep.heal(creep);
              }
              // Move towards the target
              creep.moveTo(closestHostile, {reusePath: 5});
            }
            // If in melee range and injured, try to repair
            if (creep.hits < creep.hitsMax) {
              // if this creep is injured, heal itself
              creep.heal(creep);
            }
          }
        }
        // If there are no hostile creeps, or key buildings. Beging destroying other buildings
        else if (hostileCreeps.length === 0 && !spawner && targetRoom) {
          // Try to attack, if the target is not in range
          if (creep.attack(closestHostileStructure!) === ERR_NOT_IN_RANGE) {
            if (creep.hits < creep.hitsMax) {
              // if this creep is injured, heal itself
              creep.heal(creep);
            }
            // Move towards the target
            creep.moveTo(closestHostileStructure!, {reusePath: 5});
          }
        }
      }
    }
  }
}
