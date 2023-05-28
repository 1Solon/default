import { calculateCreepCost } from "creeps/creepFunctions/calculateCreepCost";

export function timeToRenew(creep: Creep): boolean {
  const body: BodyPartConstant[] = creep.body.map(part => part.type);
  const renewalCost = Math.ceil(creep.body.length * 2.5);
  const energyAvailable = creep.room.energyAvailable;
  const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
  const excessEnergyThreshold = calculateCreepCost(body) * 1.2;

  console.log(energyAvailable >= calculateCreepCost(body));

  // If the creep falls into these conditions, renew it
  // 1. The energy available is greater than the initial cost of the creep
  // 2. The energy available is greater than the renewal cost
  // 3. The creep's ticks to live is less than 200
  if (
    !creep.memory.renewing &&
    energyAvailable >= calculateCreepCost(body) &&
    energyAvailable >= renewalCost &&
    energyAvailable < excessEnergyThreshold &&
    creep.ticksToLive! < 500 &&
    spawn.spawning == null
  ) {
    creep.memory.renewing = true;
  }

  if (creep.memory.renewing) {
    let renewResult = spawn.renewCreep(creep);
    if (renewResult == ERR_NOT_IN_RANGE) {
      creep.moveTo(spawn);
    } else if (renewResult == OK) {
      // If the creep has been renewed back to full life, stop renewing
      if (creep.ticksToLive! >= CREEP_LIFE_TIME) {
        creep.memory.renewing = false;
      }
    } else {
      // If renewing failed for some other reason (e.g. not enough energy), stop trying to renew this tick
      creep.memory.renewing = false;
    }
    return false;
  }
  return true;
}
