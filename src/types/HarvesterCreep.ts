interface HarvesterMemory extends CreepMemory {

    targetSource: Id<Source>

}

interface HarvesterCreep extends Creep {

    memory: HarvesterMemory

}
