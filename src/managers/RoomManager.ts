import { Tower } from "creeps/Tower";

// Import spawn modules
import { ConstructionManager as constructionManager } from "managers/ConstructionManager";

// Import utility modules
import { CreepBody as creepMaker } from "utils/CreepBody";
import { calculateTotalEnergyMinedPerTick } from "utils/TotalEnergyMinedPerTick";
import { calculateConsumedEnergyPerWorker } from "utils/calculateConsumedEnergyPerWorker";

export class RoomManager {
  constructor(room: Room) {
    // Get counts for creeps of each role
    var harvesters = _.filter(Game.creeps, creep => creep.memory.role == "harvester");
    var workers = _.filter(Game.creeps, creep => creep.memory.role == "worker");
    var haulers = _.filter(Game.creeps, creep => creep.memory.role == "hauler");

    // Define spawn
    let spawn = room.find(FIND_MY_SPAWNS)[0];

    // Stores total energy capacity of the current room
    let spawnEnergy = spawn.room.energyAvailable;

    // Gets all the spawns in the room
    let sources = spawn.room.find(FIND_SOURCES);

    // Calculate the total energy mined per tick
    let totalEnergyMinedPerTick = calculateTotalEnergyMinedPerTick();

    // Calculate the total energy consumed per tick
    let workerCost = calculateConsumedEnergyPerWorker();

    // Using totalEnergyMinedPerTick and totalEnergyConsumedPerTick, calculate the max number of workers that can be supported
    let maxWorkersForBuilding = Math.floor(totalEnergyMinedPerTick / workerCost);

    // Get exits from the spawn room
    let exits = Game.map.describeExits(spawn.room.name);

    // Get an array of room names
    let roomNames = Object.values(exits);

    // Loop through each creep's name in Memory.creeps
    for (var creepName in Memory.creeps) {
      // If the creep's name isn't in Game.creeps
      if (!Game.creeps[creepName]) {
        // Remove it from the memory and log that it did so
        delete Memory.creeps[creepName];
        console.log("Clearing non-existing creep memory:", creepName);
      }
    }

    // Create an object to hold the counts of remote harvesters for each room
    let harvesterCounts: { [key: string]: number } = {};
    for (let roomName of roomNames) {
      harvesterCounts[roomName] = _.filter(
        Game.creeps,
        creep => creep.memory.role == "remoteHarvester" && creep.memory.target == roomName
      ).length;
    }

    // Find the room with the least number of assigned remote harvesters
    let minCount = Infinity;
    let targetRoom = null;
    for (let roomName in harvesterCounts) {
      if (harvesterCounts[roomName] < minCount) {
        minCount = harvesterCounts[roomName];
        targetRoom = roomName;
      }
    }

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
          if (spawnEnergy >= 300 || spawn.room.controller?.level! < 2) {
            spawn.spawnCreep(creepMaker(spawnEnergy, "harvester"), newName, {
              memory: { role: "harvester", targetSource: sources[i].id }
            });
          }
        }
      }
    }

    // TODO: Bandaid fix, prevents workers out-building harvesters
    if (harvesters.length >= 2) {
      // Ensure that there's always a dedicated upgrader
      const dedicatedUpgrader = _.find(Game.creeps, creep => creep.memory.state == "dedicatedUpgrader");
      if (!dedicatedUpgrader) {
        let newName = "Upgrader" + Game.time;
        spawn.spawnCreep(creepMaker(spawnEnergy, "worker"), newName, {
          memory: { role: "worker", state: "dedicatedUpgrader" }
        });
      }

      // If there are less workers than the max number, spawn new ones
      if (workers.length < maxWorkersForBuilding) {
        // Spawn a new worker with as many sets of parts as we can afford
        let newName = "Worker" + Game.time;
        spawn.spawnCreep(creepMaker(spawnEnergy, "worker"), newName, {
          memory: { role: "worker" }
        });
      }
    }

    // There should always be a hauler for every harvester creep
    // We should only start making haulers when we have extensions
    if (haulers.length < harvesters.length) {
      // Spawn a new one
      let newName = "Hauler" + Game.time;
      spawn.spawnCreep(creepMaker(spawnEnergy, "hauler"), newName, { memory: { role: "hauler" } });
    }

    // Do not spawn these unless there is base eco
    if (haulers.length >= 2 && harvesters.length >= 2) {
      // If there are less than 2 remote harvesters per exit, spawn a new one for the room with the least number of remote harvesters
      if (minCount < 2) {
        // Spawn a new remote harvester with the home room and target room in its memory
        let newName = "RemoteHarvester" + Game.time;
        spawn.spawnCreep(creepMaker(spawnEnergy, "remoteHarvester"), newName, {
          memory: { role: "remoteHarvester", home: spawn.room.name, target: targetRoom!, state: "harvesting" }
        });
      }

      // If a flag called "basicAttack" exists, spawn four warriors to attack the room
      if (Game.flags["basicAttack"]) {
        // Calculate the number of warrior creeps
        const numWarriors = _.filter(Game.creeps, creep => creep.memory.role == "Warrior").length;
        const leader = _.find(Game.creeps, creep => creep.memory.role == "Warrior" && creep.memory.isLeader);

        // Check if it's time to spawn the leader
        if (!leader && numWarriors === 3) {
          // Spawn the leader
          let newName = "WarriorLeader" + Game.time;
          const warrior =
            spawnEnergy < 1300 ? creepMaker(spawnEnergy, "Warrior") : creepMaker(spawnEnergy, "WarriorBlock2");

          spawn.spawnCreep(warrior, newName, {
            memory: { role: "Warrior", state: "Traversing", isLeader: true }
          });
        }
        // If there are less than 3 non-leader warriors, spawn a new one
        else if (numWarriors < 3) {
          // Spawn a new non-leader warrior
          let newName = "Warrior" + Game.time;
          const warrior =
            spawnEnergy < 1300 ? creepMaker(spawnEnergy, "Warrior") : creepMaker(spawnEnergy, "WarriorBlock2");

          spawn.spawnCreep(warrior, newName, {
            memory: { role: "Warrior", state: "Traversing", isLeader: false }
          });
        }

        // If a leader exists, update all non-leader warriors with the leader's name
        if (leader) {
          console.log("test");
          for (let name in Game.creeps) {
            let creep = Game.creeps[name];
            if (creep.memory.role == "Warrior" && !creep.memory.leader) {
              creep.memory.leader = leader.name;
            }
          }
        }
      }

      // If a flag called "controllerKiller" exists, spawn a ControllerKiller to attack the room
      if (Game.flags["controllerKiller"]) {
        // If there is less then four ControlKillers, spawn a new one
        if (_.filter(Game.creeps, creep => creep.memory.role == "ControllerKiller").length < 1) {
          // Spawn a new claimer
          let newName = "ControllerKiller" + Game.time;
          spawn.spawnCreep(creepMaker(spawnEnergy, "ControllerKiller"), newName, {
            memory: { role: "ControllerKiller" }
          });
        }
      }
    }

    // If a flag called "claimRoom" exists, spawn a claimer to claim the room

    // If the spawn is spawning a creep
    if (spawn.spawning) {
      // Get the creep being spawned
      let spawningCreep = Game.creeps[spawn.spawning.name];

      // Visualize the role of the spawning creep above the spawn
      spawn.room.visual.text("🛠️" + spawningCreep.memory.role, spawn.pos.x + 1, spawn.pos.y, {
        align: "left",
        opacity: 0.8
      });
    }

    // Starts the tower
    new Tower(spawn.room);

    // Runs the construction manager
    new constructionManager(spawn.room);

    // Usage
    console.log(
      "Amount of energy mined a tick: ",
      totalEnergyMinedPerTick.toString(),
      "Total Energy Availible For Spawner: ",
      spawnEnergy.toString()
    );
    console.log("Total amount of supported workers: ", maxWorkersForBuilding);
  }
}
