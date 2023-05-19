// Function to calculate the total energy mined per tick
export function calculateTotalEnergyMinedPerTick(): number {
  let totalEnergyMinedPerTick = 0;

  // Get all harvester creeps
  const harvesters = _.filter(Game.creeps, creep => creep.memory.role === "harvester");

  // Loop through each harvester
  for (const harvester of harvesters) {
    // Count the number of WORK modules on the harvester
    const workModuleCount = harvester.body.filter(part => part.type === WORK).length;

    // Add the energy mined per tick by this harvester to the total
    totalEnergyMinedPerTick += workModuleCount * 2; // Each WORK module mines 2 energy per tick
  }

  return totalEnergyMinedPerTick;
}
