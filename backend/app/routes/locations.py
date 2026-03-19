from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# In-memory store (replace with Supabase in production)
_saved_locations = {}

class SaveLocationRequest(BaseModel):
    user_id: str
    name: str
    latitude: float
    longitude: float
    state: str = ""
    label: str = "home"  # home, farm, work, route
    user_type: str = "general"

@router.post("/locations")
async def save_location(req: SaveLocationRequest):
    """Save a location for a user."""
    key = f"{req.user_id}:{req.label}"
    _saved_locations[key] = req.dict()
    return {"status": "saved", "location": req.dict()}

@router.get("/locations/{user_id}")
async def get_locations(user_id: str):
    """Get all saved locations for a user."""
    user_locs = {
        k: v for k, v in _saved_locations.items()
        if k.startswith(f"{user_id}:")
    }
    return {"locations": list(user_locs.values())}
