import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine, Base
from app.gallery.models import Gallery
from app.video.models import Video
from app.inventory.models import Tower, Unit


async def seed_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if already seeded
        result = await session.execute(select(Tower))
        existing_towers = result.scalars().all()
        if existing_towers:
            print("Database already seeded.")
            return

        print("Seeding initial kiosk database data...")

        # 1. Seed Towers & Units
        tower_a = Tower(name="Tower A - Grand Heights")
        tower_b = Tower(name="Tower B - Skyline Residence")
        tower_c = Tower(name="Tower C - Pinnacle Suites")

        session.add_all([tower_a, tower_b, tower_c])
        await session.flush()  # populate tower IDs

        units = [
            # Tower A
            Unit(towerId=tower_a.id, number="A-101", status="AVAILABLE"),
            Unit(towerId=tower_a.id, number="A-102", status="AVAILABLE"),
            Unit(towerId=tower_a.id, number="A-103", status="BOOKED"),
            Unit(towerId=tower_a.id, number="A-104", status="AVAILABLE"),
            # Tower B
            Unit(towerId=tower_b.id, number="B-201", status="AVAILABLE"),
            Unit(towerId=tower_b.id, number="B-202", status="AVAILABLE"),
            Unit(towerId=tower_b.id, number="B-203", status="AVAILABLE"),
            Unit(towerId=tower_b.id, number="B-204", status="BOOKED"),
            # Tower C
            Unit(towerId=tower_c.id, number="C-301", status="AVAILABLE"),
            Unit(towerId=tower_c.id, number="C-302", status="AVAILABLE"),
            Unit(towerId=tower_c.id, number="C-303", status="AVAILABLE"),
            Unit(towerId=tower_c.id, number="C-304", status="AVAILABLE"),
        ]
        session.add_all(units)

        # 2. Seed 8 Gallery Images
        images = [
            Gallery(
                title="Master Penthouse Suite Interior",
                imageUrl="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
            ),
            Gallery(
                title="Infinity Pool & Skyline Lounge",
                imageUrl="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
            ),
            Gallery(
                title="Chef Kitchen with Marble Island",
                imageUrl="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
            ),
            Gallery(
                title="Sunset Terrace with Panoramic Views",
                imageUrl="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
            ),
            Gallery(
                title="Spa En-Suite Bathroom",
                imageUrl="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
            ),
            Gallery(
                title="Private Residential Lobby & Concierge",
                imageUrl="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80"
            ),
            Gallery(
                title="Smart Home Living Room Space",
                imageUrl="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
            ),
            Gallery(
                title="Landscaped Rooftop Garden Walkway",
                imageUrl="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
            ),
        ]
        session.add_all(images)

        # 3. Seed 4 Videos
        videos = [
            Video(
                title="Luxury Architectural Overview Tour",
                thumbnail="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
                videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
            ),
            Video(
                title="Penthouse Suite Walkthrough",
                thumbnail="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
                videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
            ),
            Video(
                title="Skyline Amenities & Pool Deck",
                thumbnail="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
                videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
            ),
            Video(
                title="Neighborhood & Lifestyle Highlight",
                thumbnail="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
                videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
            ),
        ]
        session.add_all(videos)

        await session.commit()
        print("Seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed_database())
