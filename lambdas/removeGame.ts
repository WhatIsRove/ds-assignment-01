import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    try {
        console.log("[Event]: ", event);

        const parameters = event?.pathParameters;
        const gameId = parameters?.gameId ? parseInt(parameters.gameId) : undefined;
        
        if (!gameId) {
            return {
                statusCode: 404,
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ Message: "Missing game id."})
            }
        }

        const checkGame = await ddbDocClient.send(
            new QueryCommand({
                TableName: process.env.TABLE_NAME,
                KeyConditionExpression: "id = :g",
                ExpressionAttributeValues: {
                    ":g": gameId
                }
            })
        )

        if (!checkGame.Items) {
            return {
                statusCode: 404,
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ Message: "Invalid game id."})
            }
        }

        if (process.env.CLIENT_ID != checkGame.Items[0].clientId) {
            return {
                statusCode: 400,
                headers: {
                    "content-type": "appplication/json"
                },
                body: JSON.stringify({ Message: "Unauthorized removal, invalid owner." })
            }
        }

        const commandOutput = await ddbDocClient.send(
            new DeleteCommand({
                TableName: process.env.TABLE_NAME,
                Key: { id: gameId, clientId: process.env.CLIENT_ID }
            })
        )

        return {
            statusCode: 200,
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                message: "Game deleted."
            })
        }

    } catch (error: any) {
        return {
            statusCode: 500,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ error }),
        }
    }
}

function createDDbDocClient() {
    const ddbClient = new DynamoDBClient({ region: process.env.REGION });
    const marshallOptions = {
      convertEmptyValues: true,
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
    };
    const unmarshallOptions = {
      wrapNumbers: false,
    };
    const translateConfig = { marshallOptions, unmarshallOptions };
    return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}