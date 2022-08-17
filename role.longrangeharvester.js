var longRangeHarvester = {

    /** @param {Creep} creep **/
    run: function (creep, homeRoom, targetRoom ) {
        
        



  
      // Find sources in the room
      var source = Game.getObjectById(creep.memory.target);
  
      // Try to harvest the source. If it isn't in range
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
  
        // Move to it
        creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" }, }, { reusePath: 5 });
      }
    },
  };
  
  module.exports = longRangeHarvester;