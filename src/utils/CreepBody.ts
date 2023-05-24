export function CreepBody(energy: number, roleName: String): BodyPartConstant[] {
  let body: BodyPartConstant[] = [];
  let partBudget;

  switch (roleName) {
    case "harvester":
      partBudget = Math.floor((energy - 200) / 100);

      // 10 work parts is optimal for a source
      if (partBudget > 4) {
        partBudget = 4;
      }

      for (let i = 0; i < partBudget; i++) {
        body.push(WORK);
      }

      // Pushes two move objects
      body.push(WORK);
      body.push(CARRY);
      body.push(MOVE);

      return body;

    case "hauler":
      partBudget = Math.floor(energy / 100);

      for (let i = 0; i < partBudget; i++) {
        body.push(CARRY);
        body.push(MOVE);
      }

      return body;

    case "worker":
      partBudget = Math.floor(energy / 200);

      for (let i = 0; i < partBudget; i++) {
        body.push(WORK);
        body.push(MOVE);
        body.push(CARRY);
      }

      return body;

    case "remoteHarvester":
      partBudget = Math.floor(energy / 200);

      for (let i = 0; i < partBudget; i++) {
        body.push(WORK);
        body.push(MOVE);
        body.push(CARRY);
      }

      return body;

    case "Warrior":
      body.push(MOVE);
      body.push(ATTACK);
      body.push(MOVE);
      body.push(ATTACK);
      body.push(MOVE);
      body.push(ATTACK);

      return body;

    case "WarriorBlock2":
      body.push(TOUGH);
      body.push(TOUGH);
      body.push(TOUGH);
      body.push(TOUGH);
      body.push(TOUGH);
      // 50 energy

      body.push(MOVE);
      body.push(MOVE);
      body.push(MOVE);
      body.push(MOVE);
      body.push(MOVE);
      body.push(MOVE);
      body.push(MOVE);
      body.push(MOVE);
      body.push(MOVE);
      body.push(MOVE);
      body.push(MOVE);

      body.push(ATTACK);
      body.push(ATTACK);
      body.push(ATTACK);
      body.push(ATTACK);
      body.push(ATTACK);
      // 400 energy

      body.push(HEAL);
      // 250 energy

      return body;

    case "Claimer":
      body.push(MOVE);
      body.push(CLAIM);

      return body;

    case "RoomDrainer":
      return body;
  }
  return [];
}
