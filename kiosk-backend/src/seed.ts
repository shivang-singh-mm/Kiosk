import { pool } from './core/database';

export async function seedDatabase(): Promise<void> {
  const client = await pool.connect();

  try {
    console.log('Initializing PostgreSQL database schema...');

    // 1. Create Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS tower (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS unit (
        id SERIAL PRIMARY KEY,
        "towerId" INTEGER NOT NULL REFERENCES tower(id) ON DELETE CASCADE,
        number VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
      );

      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        "imageUrl" VARCHAR(500) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS video (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        thumbnail VARCHAR(500) NOT NULL,
        "videoUrl" VARCHAR(500) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS booking (
        id SERIAL PRIMARY KEY,
        "unitId" INTEGER NOT NULL REFERENCES unit(id) ON DELETE CASCADE,
        "customerName" VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        "bookedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Seed Towers & Units if empty
    const towerCheck = await client.query('SELECT COUNT(*) FROM tower');
    if (parseInt(towerCheck.rows[0].count, 10) === 0) {
      console.log('Seeding initial towers and units...');
      const towerA = await client.query<{ id: number }>('INSERT INTO tower (name) VALUES ($1) RETURNING id', [
        'Tower A - Grand Heights',
      ]);
      const towerB = await client.query<{ id: number }>('INSERT INTO tower (name) VALUES ($1) RETURNING id', [
        'Tower B - Skyline Residence',
      ]);
      const towerC = await client.query<{ id: number }>('INSERT INTO tower (name) VALUES ($1) RETURNING id', [
        'Tower C - Pinnacle Suites',
      ]);

      const tAId = towerA.rows[0].id;
      const tBId = towerB.rows[0].id;
      const tCId = towerC.rows[0].id;

      const units = [
        [tAId, 'A-101', 'AVAILABLE'],
        [tAId, 'A-102', 'AVAILABLE'],
        [tAId, 'A-103', 'BOOKED'],
        [tAId, 'A-104', 'AVAILABLE'],
        [tBId, 'B-201', 'AVAILABLE'],
        [tBId, 'B-202', 'AVAILABLE'],
        [tBId, 'B-203', 'AVAILABLE'],
        [tBId, 'B-204', 'BOOKED'],
        [tCId, 'C-301', 'AVAILABLE'],
        [tCId, 'C-302', 'AVAILABLE'],
        [tCId, 'C-303', 'AVAILABLE'],
        [tCId, 'C-304', 'AVAILABLE'],
      ];

      for (const [tId, num, stat] of units) {
        await client.query('INSERT INTO unit ("towerId", number, status) VALUES ($1, $2, $3)', [
          tId,
          num,
          stat,
        ]);
      }
    }

    // 3. Seed Gallery Images if empty
    const galleryCheck = await client.query('SELECT COUNT(*) FROM gallery');
    if (parseInt(galleryCheck.rows[0].count, 10) === 0) {
      console.log('Seeding gallery images...');
      const images = [
        ['Master Penthouse Suite Interior', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'],
        ['Infinity Pool & Skyline Lounge', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'],
        ['Chef Kitchen with Marble Island', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
        ['Sunset Terrace with Panoramic Views', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'],
        ['Spa En-Suite Bathroom', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'],
        ['Private Residential Lobby & Concierge', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80'],
        ['Smart Home Living Room Space', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'],
        ['Landscaped Rooftop Garden Walkway', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'],
      ];

      for (const [title, url] of images) {
        await client.query('INSERT INTO gallery (title, "imageUrl") VALUES ($1, $2)', [title, url]);
      }
    }

    // 4. Seed or Update Videos
    const videoCheck = await client.query('SELECT COUNT(*) FROM video');
    const cloudinaryUrl = 'https://res.cloudinary.com/djicl1vya/video/upload/v1784942733/7578552-uhd_3840_2160_30fps_tpm0yd.mp4';
    const desiredVideos = [
      ['Luxury Architectural Overview Tour', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80', cloudinaryUrl],
      ['Penthouse Suite Walkthrough', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', cloudinaryUrl],
      ['Skyline Amenities & Pool Deck', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', cloudinaryUrl],
      ['Neighborhood & Lifestyle Highlight', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', cloudinaryUrl],
    ];

    if (parseInt(videoCheck.rows[0].count, 10) === 0) {
      console.log('Seeding video showcase...');
      for (const [title, thumb, url] of desiredVideos) {
        await client.query('INSERT INTO video (title, thumbnail, "videoUrl") VALUES ($1, $2, $3)', [
          title,
          thumb,
          url,
        ]);
      }
    } else {
      const existingVideos = await client.query<{ id: number }>('SELECT id FROM video ORDER BY id ASC');
      for (let i = 0; i < existingVideos.rows.length; i++) {
        if (i < desiredVideos.length) {
          const [title, thumb, url] = desiredVideos[i];
          await client.query('UPDATE video SET title = $1, thumbnail = $2, "videoUrl" = $3 WHERE id = $4', [
            title,
            thumb,
            url,
            existingVideos.rows[i].id,
          ]);
        }
      }
    }

    console.log('PostgreSQL database schema and seed completed successfully!');
  } catch (error) {
    console.error('Error seeding PostgreSQL database:', error);
  } finally {
    client.release();
  }
}
