from typing import Dict, List
from backend.schemas import Game, Category, Order, Conversation, ChatMessage

GAMES_DB: List[Game] = [
    Game(
        id="cyberpunk-2077",
        title="Cyberpunk 2077",
        platform="PC",
        platforms=["PC", "PlayStation 5", "Xbox Series X|S"],
        category="PC Games",
        price=39.99,
        rating=4.5,
        stock="in_stock",
        cover="/src/assets/game-cyber.jpg",
        tagline="Wake up, samurai. Night City is waiting.",
        description="An open-world action RPG set in the megalopolis of Night City, where you play a cyber-enhanced mercenary chasing a one-of-a-kind implant that is the key to immortality. Includes the Phantom Liberty expansion and all free updates.",
        publisher="CD PROJEKT RED",
        released="Dec 10, 2020",
        genre="Action RPG"
    ),
    Game(
        id="elden-ring",
        title="Elden Ring",
        platform="PlayStation 5",
        platforms=["PC", "PlayStation 5", "Xbox Series X|S"],
        category="PlayStation",
        price=49.99,
        rating=4.9,
        stock="in_stock",
        cover="/src/assets/game-ring.jpg",
        tagline="Rise, Tarnished, and be guided by grace.",
        description="A vast open-world dark fantasy adventure from FromSoftware and George R. R. Martin. Explore the Lands Between, master demanding combat, and uncover the mystery of the Elden Ring at your own pace.",
        publisher="Bandai Namco",
        released="Feb 25, 2022",
        genre="Souls-like RPG"
    ),
    Game(
        id="zelda-breath-of-the-wild",
        title="The Legend of Zelda: Breath of the Wild",
        platform="Nintendo Switch",
        platforms=["Nintendo Switch"],
        category="Nintendo Switch",
        price=59.99,
        rating=4.8,
        stock="low_stock",
        cover="/src/assets/game-wild.jpg",
        tagline="Step into a world of discovery.",
        description="Explore the wilds of Hyrule any way you like in this landmark open-air adventure. Climb any surface, cook with what you find, and solve shrines scattered across a living kingdom.",
        publisher="Nintendo",
        released="Mar 3, 2017",
        genre="Action Adventure"
    ),
    Game(
        id="grand-theft-auto-v",
        title="Grand Theft Auto V",
        platform="Xbox Series X|S",
        platforms=["PC", "PlayStation 5", "Xbox Series X|S"],
        category="Xbox",
        price=29.99,
        rating=4.6,
        stock="in_stock",
        cover="/src/assets/game-city.jpg",
        tagline="Three criminals. One city. Endless trouble.",
        description="Switch between three very different criminals as you tear through the sun-soaked streets of Los Santos. Includes access to GTA Online with all seasonal content unlocked.",
        publisher="Rockstar Games",
        released="Sep 17, 2013",
        genre="Open World Action"
    ),
    Game(
        id="marvels-spider-man-2",
        title="Marvel's Spider-Man 2",
        platform="PlayStation 5",
        platforms=["PlayStation 5", "PC"],
        category="Digital Downloads",
        price=69.99,
        rating=4.7,
        stock="preorder",
        cover="/src/assets/game-hero.jpg",
        tagline="Two heroes. One city to protect.",
        description="Play as both Peter Parker and Miles Morales across a bigger, denser New York. New web wings, new symbiote powers, and a story that pushes both Spider-Men to their limits.",
        publisher="Sony Interactive Entertainment",
        released="Oct 20, 2023",
        genre="Action Adventure"
    )
]

CATEGORIES_DB: List[Category] = [
    Category(name="PC Games", count=428, icon="Monitor"),
    Category(name="PlayStation", count=316, icon="Gamepad2"),
    Category(name="Nintendo Switch", count=204, icon="Joystick"),
    Category(name="Xbox", count=189, icon="Gamepad"),
    Category(name="Digital Downloads", count=940, icon="Download")
]

ORDERS_DB: Dict[str, Order] = {
    "GV-48219": Order(
        id="GV-48219",
        placed="Aug 1, 2026",
        items=["Elden Ring (PlayStation 5)", "Cyberpunk 2077 (PC digital key)"],
        status="In transit",
        carrier="GameVault Express",
        eta="Aug 7, 2026",
        tracking="GVX-9931-4471"
    )
}

STOCK_LABELS = {
    "in_stock": "In stock",
    "low_stock": "Low stock",
    "preorder": "Pre-order",
    "out_of_stock": "Out of stock"
}

CONVERSATIONS_DB: Dict[str, Conversation] = {}
