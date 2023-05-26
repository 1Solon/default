export function calculateCreepCost(body: BodyPartConstant[]): number {
    const PART_COSTS: {[part in BodyPartConstant]: number} = {
        [MOVE]: 50,
        [WORK]: 100,
        [CARRY]: 50,
        [ATTACK]: 80,
        [RANGED_ATTACK]: 150,
        [HEAL]: 250,
        [CLAIM]: 600,
        [TOUGH]: 10
    };

    return body.reduce((cost, part) => cost + PART_COSTS[part], 0);
}
