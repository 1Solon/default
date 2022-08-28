module.exports = function (energy, roleName) {
    let body = [];
    let partBudget;

    switch (roleName) {
        case "harvester":
            partBudget = Math.floor(energy-100 / 100);

            // 10 work parts is optimal for a source
            if (partBudget > 10){
                partBudget = 10;
            }

            for (let i = 0; i < partBudget; i++) {
                body.push(WORK);
            }

            // Pushes two move objects
            body.push(MOVE);
            body.push(MOVE);

            return body;

        case "hauler":
            partBudget = Math.floor((energy) / 100);

            for (let i = 0; i < partBudget; i++) {
                body.push(CARRY);
                body.push(MOVE);
            }

            return body;

        case "worker":
            partBudget = Math.floor((energy) / 200);

            for (let i = 0; i < partBudget; i++) {
                body.push(WORK);
                body.push(MOVE);
                body.push(CARRY);
            }
            
            return body;

            case "longRangeHarvester":
                partBudget = Math.floor((energy) / 200);
    
                for (let i = 0; i < partBudget; i++) {
                    body.push(WORK);
                    body.push(MOVE);
                    body.push(CARRY);
                }
                
                return body;
    }
};
