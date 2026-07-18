from fastapi import APIRouter, HTTPException

from app.db import get_supabase
from app.models import Roast

router = APIRouter(prefix="/roasts", tags=["roasts"])


@router.get("/{slug}", response_model=Roast)
def get_roast(slug: str) -> Roast:
    result = get_supabase().table("roasts").select("*").eq("slug", slug).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="roast not found")
    return Roast(**result.data[0])
