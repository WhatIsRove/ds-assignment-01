import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { CognitoIdentityProviderClient, ConfirmSignUpCommand, ConfirmSignUpCommandInput } from "@aws-sdk/client-cognito-identity-provider";
import { ConfirmSignUpTypes } from "../../shared/types";
import Ajv from "ajv";
import schema from "../../shared/types.schema.json";

const ajv = new Ajv();
const isValidBodyParams = ajv.compile(schema.definitions["ConfirmSignUpTypes"] || {});

const client = new CognitoIdentityProviderClient({region: process.env.REGION});

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    try {
        console.log("[Event]", JSON.stringify(event));
        const body = event.body ? JSON.parse(event.body) : undefined;

        if (!isValidBodyParams(body)) {
            return {
                statusCode: 500,
                headers: {
                  "content-type": "application/json",
                },
                body: JSON.stringify({
                  message: `Wrong type, must match ConfirmSignUpTypes schema`,
                  schema: schema.definitions["ConfirmSignUpTypes"],
                }),
            };
        };

        const confirmSignUpBody = body as ConfirmSignUpTypes;

        const params: ConfirmSignUpCommandInput = {
            ClientId: process.env.CLIENT_ID!,
            Username: confirmSignUpBody.username,
            ConfirmationCode: confirmSignUpBody.code
        };

        const command = await client.send(
            new ConfirmSignUpCommand(params)
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `User ${confirmSignUpBody.username} has successfully signed up`,
                confirmed: true
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