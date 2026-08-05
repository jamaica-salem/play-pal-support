from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from backend.schemas import Game, Category
from backend.data import GAMES_DB, CATEGORIES_DB

router = APIRouter(prefix="/api/games", tags=["games"])

@router.get("", response_model=List[Game])
def get_games(
    category: Optional[str] = None,
    platform: Optional[str] = None,
    search: Optional[str] = None
):
    results = GAMES_DB
    if category and category != "All":
        results = [g for g in results if g.category.lower() == category.lower()]
    if platform and platform != "All":
        results = [g for g in results if platform.lower() in [p.lower() for p in g.platforms]]
    if search:
        s = search.lower()
        results = [g for g in results if s in g.title.lower() or s in g.description.lower() or s in g.genre.lower()]
    return results

@router.get("/categories", response_model=List[Category])
def get_categories():
    return CATEGORIES_DB

@router.get("/{game_id}", response_model=Game)
def get_game_by_id(game_id: str):
    for g in GAMES_DB:
        if g.id == game_id:
            return g
    raise HTTPException(status_code=404, detail="Game not found")
