import { pool } from '../../core/database';

export interface UnitRow {
  id: number;
  towerId: number;
  number: string;
  status: string;
}

export interface TowerRow {
  id: number;
  name: string;
}

export interface TowerWithUnits extends TowerRow {
  units: UnitRow[];
}

export class InventoryRepository {
  async getAllTowersWithUnits(): Promise<TowerWithUnits[]> {
    const towersRes = await pool.query<TowerRow>('SELECT id, name FROM tower ORDER BY id ASC');
    const unitsRes = await pool.query<UnitRow>('SELECT id, "towerId", number, status FROM unit ORDER BY id ASC');

    const towersMap = new Map<number, TowerWithUnits>();
    for (const t of towersRes.rows) {
      towersMap.set(t.id, { ...t, units: [] });
    }

    for (const u of unitsRes.rows) {
      const t = towersMap.get(u.towerId);
      if (t) {
        t.units.push(u);
      }
    }

    return Array.from(towersMap.values());
  }

  async getUnitById(id: number): Promise<UnitRow | null> {
    const res = await pool.query<UnitRow>(
      'SELECT id, "towerId", number, status FROM unit WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  }
}
