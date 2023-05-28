// Function to calculate the total energy mined per tick
export function calculateTotalEnergyMinedPerTick(room: Room): number {
  let totalEnergyMinedPerTick = 0;

  // Get all harvester creeps
  const harvesters = _.filter(Game.creeps, creep => creep.memory.role === "harvester" && creep.room.name === room.name);

  // Get all remote harvesters
  const remoteHarvesters = _.filter(Game.creeps, creep => creep.memory.role === "remoteHarvester");

  // Loop through each harvester
  for (const harvester of harvesters) {
    // Count the number of WORK modules on the harvester
    const workModuleCount = harvester.body.filter(part => part.type === WORK).length;

    // Add the energy mined per tick by this harvester to the total
    totalEnergyMinedPerTick += workModuleCount * 2; // Each WORK module mines 2 energy per tick
  }

  // Loop through each remote harvester, assume a remote harvester is quarter as efficient as a standard harvester
  for (const remoteHarvester of remoteHarvesters) {
    // Count the number of WORK modules on the remote harvester
    const workModuleCount = remoteHarvester.body.filter(part => part.type === WORK).length;

    // Add the energy mined per tick by this remote harvester to the total
    totalEnergyMinedPerTick += workModuleCount * 0.1; // Each WORK module mines 2 energy per tick
  }

  // Determine if a storage exists in the room
  if (room.memory.roomClock == 0) {
    if (room.storage) {
      if (room.storage.store.energy > room.memory.previousStorageEnergy) {
        room.memory.harvesterEfficiency += 0.10;
      } else {
        room.memory.harvesterEfficiency -= 0.10;
      }
      // Store current energy
      room.memory.previousStorageEnergy = room.storage!.store.energy;
    }
  }
  // Print the room and the harvester effiency and the clock
  console.log(
    ((room.name + " " + room.memory.harvesterEfficiency.toFixed(2)) as unknown as number) + " " + room.memory.roomClock
  );

  // Apply effiency metric
  totalEnergyMinedPerTick *= room.memory.harvesterEfficiency;

  return totalEnergyMinedPerTick.toFixed(2) as unknown as number;
}
