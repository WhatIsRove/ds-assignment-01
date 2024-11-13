import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { CognitoIdentityProviderClient, SignUpCommand, SignUpCommandInput} from "@aws-sdk/client-cognito-identity-provider";
import { SignUpTypes } from "../../shared/types";
import Ajv from "ajv";
import schema from "../../shared/types.schema.json";

const ajv = new Ajv();
const isValidBodyParams = ajv.compile(schema.definitions["SignUpTypes"] || {});

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
                  message: `Wrong type, must match SignUpTypes schema`,
                  schema: schema.definitions["SignUpTypes"],
                }),
            };
        }

        const signUpBody = body as SignUpTypes;

        const params: SignUpCommandInput = {
            ClientId: process.env.CLIENT_ID!,
            Username: signUpBody.username,
            Password: signUpBody.password,
            UserAttributes: [{ Name: "email", Value:signUpBody.email }]
        };

        const response = await client.send(
            new SignUpCommand(params)
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: response,
            }),
        };


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