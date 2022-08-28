export class harvester {
  constructor(creep: HarvesterCreep) {
    let source: Source = creep.memory.targetSource;

    // Try to harvest the source. If it isn't in range?
    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
      // Move to it
      creep.moveTo(source.pos.x, source.pos.y, { visualizePathStyle: { stroke: "#ffaa00" }, reusePath: 5 });
    }
  }
}
