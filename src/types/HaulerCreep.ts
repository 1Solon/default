interface HaulerMemory extends CreepMemory {

    targetSource: Id<Source>

}

interface HaulerCreep extends Creep {

    memory: HaulerMemory

}
