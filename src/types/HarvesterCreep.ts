interface HarvesterMemory extends CreepMemory {

    targetSource: Source

}

interface HarvesterCreep extends Creep {

    memory: HarvesterMemory

}
