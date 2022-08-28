// Import screep modules
import { harvester } from "creeps/Harvester";
import { hauler } from "creeps/Hauler";
import { worker } from "creeps/Worker";
import { tower } from "creeps/Tower";

// Import spawn modules
import { constructionManager } from "spawns/ConstructionManager";

// Import utility modules
import { ErrorMapper } from "utils/ErrorMapper";
import { creepMaker } from "utils/CreepBody";


export const loop = ErrorMapper.wrapLoop(() => {
  // Get counts for creeps of each role

  var harvesters = _.filter(Game.creeps, creep => creep.memory.role == "harvester");
  var workers = _.filter(Game.creeps, creep => creep.memory.role == "worker");
  var haulers = _.filter(Game.creeps, creep => creep.memory.role == "hauler");

  // Stores total energy capacity of the current room
  let spawnEnergy = Game.spawns["Spawn1"].room.energyAvailable;

  // Loop through each creep's name in Memory.creeps
  for (var creepName in Memory.creeps) {
    // If the creep's name isn't in Game.creeps
    if (!Game.creeps[creepName]) {
      // Remove it from the memory and log that it did so
      delete Memory.creeps[creepName];
      console.log("Clearing non-existing creep memory:", creepName);
    }
  }

  // There should always be a hauler for every excavator creep
  if (haulers.length < harvesters.length) {
    // Spawn a new one
    let newName = "Hauler" + Game.time;
    Game.spawns["Spawn1"].spawnCreep(creepMaker(spawnEnergy, "hauler"), newName, { memory: { role: "hauler" } });
  }

  // If there is not enough haulers per resource zone, build them
  else if (harvesters.length < sources.length * 2) {
    // Creates a counting array of the same size as sources
    let noOfMinersAtSources: number[] = [];
    for (const i in sources) {
      noOfMinersAtSources.push(0);
    }

    // Counts how many harvesters there are of each source
    for (const i in sources) {
      for (const j in harvesters) {
        if (sources[i].id == harvesters[j].memory[target]) {
          noOfMinersAtSources[i]++;
        }
      }
    }

    // Checks if a source has no harvesters assigned, if no, spawn one
    for (const i in noOfMinersAtSources) {
      if (noOfMinersAtSources[i] < 1) {
        let newName = "Harvester" + Game.time;
        Game.spawns["Spawn1"].spawnCreep(creepMaker(spawnEnergy, "harvester"), newName, {
          memory: { role: "harvester", target: sources[i].id }
        });
      }
    }
  }
  // There should always be four workers
  if (workers.length < 2) {
    // Spawn a new one
    let newName = "Worker" + Game.time;
    Game.spawns["Spawn1"].spawnCreep(creepMaker(spawnEnergy, "worker"), newName, { memory: { role: "worker" } });
  }

  // If the spawn is spawning a creep
  if (Game.spawns["Spawn1"].spawning) {
    // Get the creep being spawned
    let spawningCreep = Game.creeps[Game.spawns["Spawn1"].spawning.name];

    // Visualize the role of the spawning creep above the spawn
    Game.spawns["Spawn1"].room.visual.text(
      "🛠️" + spawningCreep.memory.role,
      Game.spawns["Spawn1"].pos.x + 1,
      Game.spawns["Spawn1"].pos.y,
      { align: "left", opacity: 0.8 }
    );
  }

  // Loop through creep's names in Game.creeps
  for (var creepName in Game.creeps) {
    // Get the creep based on the its name
    var creep = Game.creeps[creepName];

    // If the creep is a harvester
    if (creep.memory.role == "harvester") {
      // Run the creep as one and iterate
      harvester.run(creep);
      continue;
    }

    // If the creep is an worker
    if (creep.memory.role == "worker") {
      // Run the creep as one and iterate
      worker.run(creep);
      continue;
    }

    // If the creep is a hauler
    if (creep.memory.role == "hauler") {
      // Run the creep as one and iterate
      hauler.run(creep);
      continue;
    }
  }
  // Starts the tower
  tower.run(Game.spawns["Spawn1"].room);

  // Runs the construction manager
  constructionManager();
});
