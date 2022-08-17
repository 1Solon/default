// Import creep roles
var miner = require('./role.harvester');
var upgrader = require('./role.upgrader');
var hauler = require('./role.hauler');
var builder = require('./role.builder');
var tower = require('./role.tower');

// Import function utilities
var creepMaker = require('./util.creepbody');
var constructionManager = require('./spawn.constructionmanager')

// Grabs all sources
let sources = Game.spawns['Spawn1'].room.find(FIND_SOURCES);

// This function runs every tick
module.exports.loop = function () {

    // Get counts for creeps of each role
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var haulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

    // Stores total energy capacity of the current room
    let spawnEnergy = Game.spawns['Spawn1'].room.energyAvailable;

    // Loop through each creep's name in Memory.creeps
    for (var creepName in Memory.creeps) {

        // If the creep's name isn't in Game.creeps
        if (!Game.creeps[creepName]) {

            // Remove it from the memory and log that it did so
            delete Memory.creeps[creepName];
            console.log('Clearing non-existing creep memory:', creepName);
        }
    }

    // There should always be a hauler for every non-hauler creep
    if (haulers.length < (harvesters.length + upgraders.length)) {

        // Spawn a new one
        let newName = 'Hauler' + Game.time;
        Game.spawns['Spawn1'].spawnCreep(creepMaker(spawnEnergy, 'hauler'), newName, { memory: { role: 'hauler' } });
    }

    // If there is not enough haulers per resource zone, build them
    else if (harvesters.length < (sources.length * 2)) {

        // Creates a counting array of the same size as sources
        var noOfMinersAtSources = [];
        for (i in sources) {
            noOfMinersAtSources.push(0);
        }

        // Counts how many harvesters there are of each source
        for (i in sources) {
            for (j in harvesters) {
                if (sources[i].id == harvesters[j].memory.target) {
                    noOfMinersAtSources[i]++
                }
            }
        }

        // Checks if a source has no harvesters assigned, if no, spawn one
        for (i in noOfMinersAtSources) {
            if (noOfMinersAtSources[i] < 2) {
                let newName = 'Harvester' + Game.time;
                Game.spawns['Spawn1'].spawnCreep(creepMaker(spawnEnergy, 'harvester'), newName, { memory: { role: 'harvester', target: sources[i].id } });
            }
        }
    }

    // Otherwise if there aren't enough upgraders
    else if (upgraders.length < 2) {

        // Spawn a new one
        let newName = 'Upgrader' + Game.time;
        Game.spawns['Spawn1'].spawnCreep(creepMaker(spawnEnergy, 'upgrader'), newName, { memory: { role: 'upgrader', upgrading: false } });
    }

    // There should always be two builders
    else if (builders.length < 2) {

        // Spawn a new one
        let newName = 'Builder' + Game.time;
        Game.spawns['Spawn1'].spawnCreep(creepMaker(spawnEnergy, 'builder'), newName, { memory: { role: 'builder', building: false } });
    }

    // If the spawn is spawning a creep
    if (Game.spawns['Spawn1'].spawning) {

        // Get the creep being spawned
        let spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name]

        // Visualize the role of the spawning creep above the spawn
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y, { align: 'left', opacity: 0.8 });
    }

    // Loop through creep's names in Game.creeps
    for (var creepName in Game.creeps) {

        // Get the creep based on the its name
        var creep = Game.creeps[creepName]

        // If the creep is a harvester
        if (creep.memory.role == 'harvester') {

            // Run the creep as one and iterate
            miner.run(creep);
            continue
        }

        // If the creep is an upgrader
        if (creep.memory.role == 'upgrader') {

            // Run the creep as one and iterate
            upgrader.run(creep);
            continue
        }

        // If the creep is an upgrader
        if (creep.memory.role == 'builder') {

            // Run the creep as one and iterate
            builder.run(creep);
            continue
        }

        // If the creep is a hauler
        if (creep.memory.role == 'hauler') {

            // Run the creep as one and iterate
            hauler.run(creep);
            continue
        }

    }
    // Starts the tower
    tower.run(Game.spawns['Spawn1'].room)

    // Runs the construction manager
    constructionManager();
}