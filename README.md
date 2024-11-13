# Game Library App

## Serverless REST Assignment - Distributed Systems.

__Name:__ Grantas Valiukas

__Demo:__ ... link to your YouTube video demonstration ......

### Context.

This is a CDK development serverless project for Distributed Systems Assignment 1
It hosts a serverless application that keeps track of a users game library/collection.

It stores game data with the relevant parameters (data obtained via [Steam](https://store.steampowered.com/)):
```
{
    id: number,
    title: string,
    description: string,
    genre: string[],
    releaseDate: string,
    reviewCount: number,
    reviewPercentage: number,
    developer: string,
    clientId: string
}
```

### App API endpoints.

+ GET /games - Gets all games in the database table
+ POST /games - add a new 'game'. Requires Authorization/Login to use.
+ GET /games?queryParam=value - Get all the 'games' with a specific queryParameter satisfying the condition .....
queryParams:
- title - Filter games by title
- genre - Filter games by a specific genre
- developer - Filter games by developer

+ GET /games/{gameId} - Gets game specificic gameId
+ PUT /games/{gameId} - Edit a 'game' with the relavant {gameId}, requires Authorization/Login, and matching clientId to the current logged in user to use.
+ DELETE /games/{gameId} - Deletes a 'game' with the relavant {gameId}, requires Authorization/Login, and matching clientId to the current logged in user to use.

+ GET /games/{gameId}/translate?language=languageCode - Granslates game descriptions to the relavant language in the parameters
### Update constraint (if relevant).

[Briefly explain your design for the solution to the PUT/Update constraint 
- only the user who added an item to the main table could update it.]

### Translation persistence (if relevant).

No persistence

###  Extra (If relevant).

[ State whether you have created a multi-stack solution for this assignment or used lambda layers to speed up update deployments. Also, mention any aspect of the CDK framework __that was not covered in the lectures that you used in this assignment. ]

Followed the Auth lab example to refactor the application away from the Auth stack and use both separately.