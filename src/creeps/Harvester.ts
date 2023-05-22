export class Harvester {
  constructor(creep: Creep) {
    let targetId = creep.memory.targetSource;
    if (targetId) {
      let source = Game.getObjectById(targetId);

      if (source) {
        // Try to harvest the source. If it isn't in range?
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
          // Move to it
          creep.moveTo(source.pos.x, source.pos.y, { visualizePathStyle: { stroke: "#ffaa00" }, reusePath: 5 });
        } else {
          // Find damaged containers in proximity
          let damagedContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_CONTAINER &&
              structure.hits < structure.hitsMax
          });

          if (damagedContainer) {
            // If a damaged container is found, repair it
            creep.repair(damagedContainer);
          } else {
            // If no damaged containers, drop harvested energy
            creep.drop(RESOURCE_ENERGY);
          }
        }
      }
    }
  }
}
