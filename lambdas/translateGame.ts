import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";

const ddbDocClient = createDDbDocClient();
const translateClient = new TranslateClient({ region: process.env.REGION });

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    try {
        console.log("[Event]: ", event);

        const parameters = event?.pathParameters;
        const gameId = parameters?.gameId ? parseInt(parameters.gameId) : undefined;
        const language = event.queryStringParameters?.language ? event.queryStringParameters.language : undefined;

        if (!gameId) {
            return {
                statusCode: 404,
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ Message: "Missing game id."})
            }
        }

        if (!language) {
            return {
                statusCode: 400,
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ Message: "Missing language parameter."})
            }
        }

        const commandOutput = await ddbDocClient.send(
            new QueryCommand({
                TableName: process.env.TABLE_NAME,
                KeyConditionExpression: "id = :g",
                ExpressionAttributeValues: {
                    ":g": gameId
                }
            })
        );

        if (!commandOutput.Items) {
            return {
                statusCode: 404,
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ Message: "Invalid, game not found."})
            }
        }

        commandOutput.Items[0].description = await translateClient.send(
            new TranslateTextCommand({
                Text: commandOutput.Items[0].description,
                SourceLanguageCode: "en",
                TargetLanguageCode: language
            })
        );

        const body = {
            data: commandOutput.Items
        }

        return {
            statusCode: 200,
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(body)
        };
    } catch (error: any) {
        return {
            statusCode: 500,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ error }),
        };
    }
};

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
};