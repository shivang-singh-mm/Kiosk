import asyncio
import httpx

API_URL = "http://127.0.0.1:8000/api/book"

async def attempt_booking(unit_id: int, name: str, phone: str):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(API_URL, json={
                "unitId": unit_id,
                "customerName": name,
                "phone": phone,
                "sessionId": "test-concurrency"
            })
            return response.status_code, response.json()
        except Exception as e:
            return 500, str(e)

async def test_race_condition():
    print("Testing concurrent atomic booking on Unit #1...")
    
    # Fire 5 simultaneous booking attempts for Unit 1
    tasks = [
        attempt_booking(1, f"Buyer {i}", f"+1555000000{i}")
        for i in range(1, 6)
    ]
    
    results = await asyncio.gather(*tasks)
    
    successes = [r for r in results if r[0] == 201]
    conflicts = [r for r in results if r[0] == 409]
    
    print(f"Total Attempts: {len(results)}")
    print(f"Successful Bookings: {len(successes)}")
    print(f"409 Conflicts Prevented: {len(conflicts)}")
    
    assert len(successes) == 1, f"Expected exactly 1 successful booking, got {len(successes)}"
    assert len(conflicts) == 4, f"Expected 4 conflicts, got {len(conflicts)}"
    print("SUCCESS: Race condition test passed! Atomic locking guaranteed.")

if __name__ == "__main__":
    asyncio.run(test_race_condition())
