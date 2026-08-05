import cyber from "@/assets/game-cyber.jpg";
import ring from "@/assets/game-ring.jpg";
import wild from "@/assets/game-wild.jpg";
import city from "@/assets/game-city.jpg";
import hero from "@/assets/game-hero.jpg";

export type Game = {
  id: string;
  title: string;
  platform: string;
  platforms: string[];
  category: string;
  price: number;
  rating: number;
  stock: "in_stock" | "low_stock" | "preorder" | "out_of_stock";
  cover: string;
  tagline: string;
  description: string;
  publisher: string;
  released: string;
  genre: string;
};

export const games: Game[] = [
  {
    id: "cyberpunk-2077",
    title: "Cyberpunk 2077",
    platform: "PC",
    platforms: ["PC", "PlayStation 5", "Xbox Series X|S"],
    category: "PC Games",
    price: 39.99,
    rating: 4.5,
    stock: "in_stock",
    cover: cyber,
    tagline: "Wake up, samurai. Night City is waiting.",
    description:
      "An open-world action RPG set in the megalopolis of Night City, where you play a cyber-enhanced mercenary chasing a one-of-a-kind implant that is the key to immortality. Includes the Phantom Liberty expansion and all free updates.",
    publisher: "CD PROJEKT RED",
    released: "Dec 10, 2020",
    genre: "Action RPG",
  },
  {
    id: "elden-ring",
    title: "Elden Ring",
    platform: "PlayStation 5",
    platforms: ["PC", "PlayStation 5", "Xbox Series X|S"],
    category: "PlayStation",
    price: 49.99,
    rating: 4.9,
    stock: "in_stock",
    cover: ring,
    tagline: "Rise, Tarnished, and be guided by grace.",
    description:
      "A vast open-world dark fantasy adventure from FromSoftware and George R. R. Martin. Explore the Lands Between, master demanding combat, and uncover the mystery of the Elden Ring at your own pace.",
    publisher: "Bandai Namco",
    released: "Feb 25, 2022",
    genre: "Souls-like RPG",
  },
  {
    id: "zelda-breath-of-the-wild",
    title: "The Legend of Zelda: Breath of the Wild",
    platform: "Nintendo Switch",
    platforms: ["Nintendo Switch"],
    category: "Nintendo Switch",
    price: 59.99,
    rating: 4.8,
    stock: "low_stock",
    cover: wild,
    tagline: "Step into a world of discovery.",
    description:
      "Explore the wilds of Hyrule any way you like in this landmark open-air adventure. Climb any surface, cook with what you find, and solve shrines scattered across a living kingdom.",
    publisher: "Nintendo",
    released: "Mar 3, 2017",
    genre: "Action Adventure",
  },
  {
    id: "grand-theft-auto-v",
    title: "Grand Theft Auto V",
    platform: "Xbox Series X|S",
    platforms: ["PC", "PlayStation 5", "Xbox Series X|S"],
    category: "Xbox",
    price: 29.99,
    rating: 4.6,
    stock: "in_stock",
    cover: city,
    tagline: "Three criminals. One city. Endless trouble.",
    description:
      "Switch between three very different criminals as you tear through the sun-soaked streets of Los Santos. Includes access to GTA Online with all seasonal content unlocked.",
    publisher: "Rockstar Games",
    released: "Sep 17, 2013",
    genre: "Open World Action",
  },
  {
    id: "marvels-spider-man-2",
    title: "Marvel's Spider-Man 2",
    platform: "PlayStation 5",
    platforms: ["PlayStation 5", "PC"],
    category: "Digital Downloads",
    price: 69.99,
    rating: 4.7,
    stock: "preorder",
    cover: hero,
    tagline: "Two heroes. One city to protect.",
    description:
      "Play as both Peter Parker and Miles Morales across a bigger, denser New York. New web wings, new symbiote powers, and a story that pushes both Spider-Men to their limits.",
    publisher: "Sony Interactive Entertainment",
    released: "Oct 20, 2023",
    genre: "Action Adventure",
  },
];

export const categories = [
  { name: "PC Games", count: 428, icon: "Monitor" },
  { name: "PlayStation", count: 316, icon: "Gamepad2" },
  { name: "Nintendo Switch", count: 204, icon: "Joystick" },
  { name: "Xbox", count: 189, icon: "Gamepad" },
  { name: "Digital Downloads", count: 940, icon: "Download" },
];

export const stockLabel: Record<Game["stock"], string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  preorder: "Pre-order",
  out_of_stock: "Out of stock",
};

export function getGame(id: string) {
  return games.find((g) => g.id === id);
}

export function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

export const mockOrder = {
  id: "GV-48219",
  placed: "Aug 1, 2026",
  items: ["Elden Ring (PlayStation 5)", "Cyberpunk 2077 (PC digital key)"],
  status: "In transit",
  carrier: "GameVault Express",
  eta: "Aug 7, 2026",
  tracking: "GVX-9931-4471",
};
