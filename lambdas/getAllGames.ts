import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, ScanCommandInput } from "@aws-sdk/lib-dynamodb";
import Ajv from "ajv";
import schema from "../shared/types.schema.json";

const ajv = new Ajv();
const isValidBodyParams = ajv.compile(schema.definitions["GameQueryParams"] || {});

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    try {
        console.log("[Event]: ", event);

        const parameters = event?.pathParameters;
        const queryParams = event.queryStringParameters;
        const genreFilter = queryParams?.genre ? queryParams.genre : undefined;
        const developerFilter = queryParams?.developer ? queryParams.developer : undefined;
        const titleFilter = queryParams?.title ? queryParams.title : undefined;

        if (!isValidBodyParams(queryParams)) {
            return {
                statusCode: 500,
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ Message: "Incorrect type, mismatch with GameQueryParams schema." }),
            }
        }

        let commandInput: ScanCommandInput = {
            TableName: process.env.TABLE_NAME
        };

        if (genreFilter) {
            commandInput = {
                ...commandInput,
                FilterExpression: "contains(genre, :g)",
                ExpressionAttributeValues: {
                    ":g": genreFilter
                }
            }
        } else if (developerFilter) {
            commandInput = {
                ...commandInput,
                FilterExpression: "developer = :d",
                ExpressionAttributeValues: {
                    ":d": developerFilter
                }
            }
        } else if (titleFilter) {
            commandInput = {
                ...commandInput,
                FilterExpression: "title = :t",
                ExpressionAttributeValues: {
                    ":t": titleFilter
                }
            }
        }

        const commandOutput = await ddbClient.send(
            new ScanCommand(commandInput)
        );

        const body = {
            data: commandOutput.Items
        }

        if (body.data?.length == 0) {
            return {
                statusCode: 404,
                headers: {
                  "content-type": "application/json",
                },
                body: JSON.stringify({ Message: "Invalid, no games found" }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(body)
        };

    } catch (error: any) {
        console.log(JSON.stringify(error));
        
        return {
            statusCode: 500,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ error }),
        };
    };
};