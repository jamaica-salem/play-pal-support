from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import games, orders, support

app = FastAPI(
    title="GameVault PlayPal API",
    description="Python FastAPI backend serving game listings, order tracking, and rule-based AI support chat.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(games.router)
app.include_router(orders.router)
app.include_router(support.router)

@app.get("/")
def root():
    return {
        "name": "GameVault PlayPal API",
        "status": "online",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
