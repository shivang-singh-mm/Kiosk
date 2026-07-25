import { InventoryRepository, TowerWithUnits, UnitRow } from './repository';

export interface InventoryRead {
  towers: TowerWithUnits[];
  totalUnits: number;
  availableUnits: number;
  bookedUnits: number;
}

export class InventoryService {
  private repository: InventoryRepository;

  constructor() {
    this.repository = new InventoryRepository();
  }

  async getInventory(): Promise<InventoryRead> {
    const towers = await this.repository.getAllTowersWithUnits();

    let total = 0;
    let available = 0;
    let booked = 0;

    for (const tower of towers) {
      for (const unit of tower.units) {
        total++;
        if (unit.status === 'BOOKED') {
          booked++;
        } else {
          available++;
        }
      }
    }

    return {
      towers,
      totalUnits: total,
      availableUnits: available,
      bookedUnits: booked,
    };
  }
}
