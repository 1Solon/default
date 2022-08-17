module.exports = function (energy, roleName) {
    let body = [];
    let partBudget;

    switch (roleName) {
        case "harvester":
            partBudget = Math.floor((energy - 50) / 100);

            for (let i = 0; i < partBudget; i++) {
                body.push(WORK);
            }
            body.push(MOVE);

            return body;

        case "hauler":
            partBudget = Math.floor((energy) / 100);

            for (let i = 0; i < partBudget; i++) {
                body.push(CARRY);
                body.push(MOVE);
            }

            return body;

        case "builder":
            partBudget = Math.floor((energy) / 200);

            for (let i = 0; i < partBudget; i++) {
                body.push(WORK);
                body.push(MOVE);
                body.push(CARRY);
            }
            
            return body;

        case "upgrader":
            partBudget = Math.floor((energy) / 200);

            for (let i = 0; i < partBudget; i++) {
                body.push(WORK);
                body.push(MOVE);
                body.push(CARRY);
            }
            
            return body;
    }
};
