interface RoomMemory {
  roomObject: any; // Don't remove this, it does nothing, but for some reason removing it breaks the code
  previousStorageEnergy: number;
  harvesterEfficiency: number;
  roomClock: any;
  maxWorkersForBuilding: number;
}
