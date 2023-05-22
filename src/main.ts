// Import screep modules
import { Harvester } from "creeps/Harvester";
import { Hauler } from "creeps/Hauler";
import { Worker } from "creeps/Worker";
import { Tower } from "creeps/Tower";
import { RemoteHarvester } from "creeps/RemoteHarvester";
import { Warrior } from "creeps/Warrior";

// Import spawn modules
import { ConstructionManager as constructionManager } from "spawns/ConstructionManager";

// Import utility modules
import { ErrorMapper } from "utils/ErrorMapper";
import { CreepBody as creepMaker } from "utils/CreepBody";
import { calculateTotalEnergyMinedPerTick } from "utils/TotalEnergyMinedPerTick";
import { calculateConsumedEnergyPerWorker } from "utils/calculateConsumedEnergyPerWorker";

export const loop = ErrorMapper.wrapLoop(() => {
  // Get counts for creeps of each role
  var harvesters = _.filter(Game.creeps, creep => creep.memory.role == "harvester");
  var workers = _.filter(Game.creeps, creep => creep.memory.role == "worker");
  var haulers = _.filter(Game.creeps, creep => creep.memory.role == "hauler");

  // Define spawn
  let spawn = Game.spawns["Spawn1"];

  // Stores total energy capacity of the current room
  let spawnEnergy = Game.spawns["Spawn1"].room.energyAvailable;

  // Gets all the spawns in the room
  let sources = Game.spawns["Spawn1"].room.find(FIND_SOURCES);

  // console.log(Game.spawns["Spawn1"].spawnCreep(creepMaker(spawnEnergy, "Warrior"), "test2", { memory: { role: "Warrior", target: "E12N7", state: "Traversing" } }))

  // Calculate the total energy mined per tick
  let totalEnergyMinedPerTick = calculateTotalEnergyMinedPerTick();

  // Calculate the total energy consumed per tick
  let workerCost = calculateConsumedEnergyPerWorker();

  // Using totalEnergyMinedPerTick and totalEnergyConsumedPerTick, calculate the max number of workers that can be supported
  let maxWorkersForBuilding = Math.floor(totalEnergyMinedPerTick / workerCost);

  // Loop through each creep's name in Memory.creeps
  for (var creepName in Memory.creeps) {
    // If the creep's name isn't in Game.creeps
    if (!Game.creeps[creepName]) {
      // Remove it from the memory and log that it did so
      delete Memory.creeps[creepName];
      console.log("Clearing non-existing creep memory:", creepName);
    }
  }

  // Wait until the spawn is full of passivly generated energy before starting a build
  if (Game.spawns["Spawn1"].store.energy >= 300 || spawn.room.controller?.level! < 2 ) {
    // If there is not enough haulers per resource zone, build them
    if (harvesters.length < sources.length * 2) {
      // Creates a counting array of the same size as sources
      let noOfMinersAtSources: number[] = [];
      for (const i in sources) {
        noOfMinersAtSources.push(0);
      }

      // Counts how many harvesters there are of each source
      for (const i in sources) {
        for (const j in harvesters) {
          let creepMem = harvesters[j].memory.targetSource;
          if (creepMem) {
            if (sources[i].id == creepMem) {
              noOfMinersAtSources[i]++;
            }
          }
        }
      }

      // Checks if a source has no harvesters assigned, if no, spawn one
      for (const i in noOfMinersAtSources) {
        if (noOfMinersAtSources[i] < 1) {
          let newName = "Harvester" + Game.time;
          if (spawnEnergy >= 300) {
            Game.spawns["Spawn1"].spawnCreep(creepMaker(spawnEnergy, "harvester"), newName, {
              memory: { role: "harvester", targetSource: sources[i].id }
            });
          }
        }
      }
    }

    // TODO: Bandaid fix, prevents workers out-building harvesters
    if (harvesters.length >= 2) {
      // If there are less workers than the max number, spawn new ones
      if (workers.length < maxWorkersForBuilding) {
        // Spawn a new worker with as many sets of parts as we can afford
        let newName = "Worker" + Game.time;
        Game.spawns["Spawn1"].spawnCreep(creepMaker(spawnEnergy, "worker"), newName, {
          memory: { role: "worker" }
        });
      }
    }
  }

  // There should always be a hauler for every harvester creep
  if (haulers.length < harvesters.length) {
    // Spawn a new one
    let newName = "Hauler" + Game.time;
    Game.spawns["Spawn1"].spawnCreep(creepMaker(spawnEnergy, "hauler"), newName, { memory: { role: "hauler" } });
  }

  // If there are less than 4 remote harvesters, spawn a new one
  if (_.filter(Game.creeps, creep => creep.memory.role == "remoteHarvester").length < 4) {
    // Get exits from the spawn room
    let exits = Game.map.describeExits(spawn.room.name);

    // Get an array of room names
    let roomNames = Object.values(exits);

    // Choose a random room
    let targetRoom = roomNames[Math.floor(Math.random() * roomNames.length)];

    // Spawn a new remote harvester with the home room and target room in its memory
    let newName = "RemoteHarvester" + Game.time;
    spawn.spawnCreep(creepMaker(spawnEnergy, "remoteHarvester"), newName, {
      memory: { role: "remoteHarvester", home: spawn.room.name, target: targetRoom, state: "harvesting" }
    });
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
      new Harvester(creep);
      continue;
    }

    // If the creep is an worker
    if (creep.memory.role == "worker") {
      // Run the creep as one and iterate
      new Worker(creep);
      continue;
    }

    // If the creep is a hauler
    if (creep.memory.role == "hauler") {
      // Run the creep as one and iterate
      new Hauler(creep);
      continue;
    }

    // If the creep is a long range harvester
    if (creep.memory.role == "remoteHarvester") {
      // Run the creep as one and iterate
      new RemoteHarvester(creep);
      continue;
    }

    // Starts the warrior
    if (creep.memory.role == "Warrior") {
      new Warrior(creep);
      continue;
    }
  }
  // Starts the tower
  new Tower(Game.spawns["Spawn1"].room);

  // Runs the construction manager
  new constructionManager(Game.spawns["Spawn1"].room);

  // Usage
  console.log("Amount of energy mined a tick: ", totalEnergyMinedPerTick);
  console.log("Total amount of supported workers: ", maxWorkersForBuilding);
});
