import { Game } from "../shared/types";

export const games : Game[] = [
    {
        id: 12312,
        title: "Hades",
        description: "Hades is a rogue-like dungeon crawler that combines the best aspects of Supergiant's critically acclaimed titles. As the immortal Prince of the Underworld, you'll wield the powers and mythic weapons of Olympus to break free from the god of the dead himself.",
        price: "$24.99",
        genre: ["Action", "Indie", "Rogue-like"],
        releaseDate: "2020-09-17",
        reviewCount: 210000,
        reviewPercentage: 98,
        developer: "Supergiant Games",
    },
    {
        id: 55341,
        title: "Cyberpunk 2077",
        description: "An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour, and body modification. You play as V, a mercenary outlaw going after a one-of-a-kind implant that is the key to immortality.",
        price: "$59.99",
        genre: ["Action", "RPG"],
        releaseDate: "2020-12-10",
        reviewCount: 450000,
        reviewPercentage: 77,
        developer: "CD PROJEKT RED",
    },
    {
        id: 51234,
        title: "Stardew Valley",
        description: "You've inherited your grandfather's old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to begin your new life. Can you learn to live off the land and turn these overgrown fields into a thriving home?",
        price: "$14.99",
        genre: ["Simulation", "RPG", "Indie"],
        releaseDate: "2016-02-26",
        reviewCount: 390000,
        reviewPercentage: 97,
        developer: "ConcernedApe",
    }
]