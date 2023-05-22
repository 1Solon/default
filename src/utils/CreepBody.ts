export function CreepBody(energy: number, roleName: String): BodyPartConstant[] {
  let body: BodyPartConstant[] = [];
  let partBudget;

  switch (roleName) {
    case "harvester":
      partBudget = Math.floor((energy - 150) / 100);

      // 10 work parts is optimal for a source
      if (partBudget > 5) {
        partBudget = 5;
      }

      for (let i = 0; i < partBudget; i++) {
        body.push(WORK);
      }

      // Pushes two move objects
      body.push(MOVE);
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
  }
  return [];
}
