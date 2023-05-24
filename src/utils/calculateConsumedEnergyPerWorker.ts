// Function to calculate
export function calculateConsumedEnergyPerWorker(room: Room): number {
    let highestEnergyWorker = 0;

    // Get all worker creeps
    const workers = _.filter(Game.creeps, creep => creep.memory.role === "worker" && creep.room.name === room.name);

    // Loop through each worker
    for (const worker of workers) {
      // Count the number of WORK modules on the worker
      const workModuleCount = worker.body.filter(part => part.type === WORK).length;

      // If this worker consumes more energy than the highestEnergyWorker, set highestEnergyWorker to this worker's WORK module count
      if (workModuleCount > highestEnergyWorker) {
        highestEnergyWorker = workModuleCount;
      }
    }

    return highestEnergyWorker;
  }
