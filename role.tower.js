module.exports = {
    run: function (roomName) {

        let hostiles = roomName.find(FIND_HOSTILE_CREEPS);

        let towers = roomName.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
        for (i = 0; i < towers.length; i++) {

            let tower = towers[i];

            if (tower.energy > 500) {
                let closestDamagedStructure = tower.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: (structure) => (structure.hits < (structure.hitsMax < 50000 ? structure.hitsMax : 50000))
                });

                if (closestDamagedStructure) {
                    if (closestDamagedStructure.hits < (closestDamagedStructure.hitsMax < 50000 ? closestDamagedStructure.hitsMax : 50000)) {
                        if (tower.energy > 500) {
                            tower.repair(closestDamagedStructure);
                        }
                    }
                }
            }
            if (hostiles.length > 0) {
                let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (closestHostile) {
                    tower.attack(closestHostile);
                }
            }
        }
    }
};