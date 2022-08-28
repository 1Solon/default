interface HaulerMemory extends CreepMemory {

    targetSource: Source

}

interface HaulerCreep extends Creep {

    memory: HaulerMemory

}
