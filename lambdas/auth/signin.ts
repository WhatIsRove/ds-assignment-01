import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { CognitoIdentityProviderClient, InitiateAuthCommand, InitiateAuthCommandInput } from "@aws-sdk/client-cognito-identity-provider";
import { SignInTypes } from "../../shared/types";
import Ajv from "ajv";
import schema from "../../shared/types.schema.json";

const ajv = new Ajv();
const isValidBodyParams = ajv.compile(schema.definitions["SignInTypes"] || {});

const client = new CognitoIdentityProviderClient({region: process.env.REGION});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
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
                  message: `Wrong type, must match SignInTypes schema`,
                  schema: schema.definitions["SignInTypes"],
                }),
            };
        }

        const signInBody = body as SignInTypes;

        const params: InitiateAuthCommandInput = {
            ClientId: process.env.CLIENT_ID!,
            AuthFlow: "USER_PASSWORD_AUTH",
            AuthParameters: {
                USERNAME: signInBody.username,
                PASSWORD: signInBody.password
            }
        }

        const AuthenticationResult = await client.send(
            new InitiateAuthCommand(params)
        );

        console.log("[Auth]", AuthenticationResult);

        if (!AuthenticationResult) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "User sign-in failed."
                })
            }
        }

        const token = AuthenticationResult.IdToken;

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Set-Cookie": `token=${token}; SameSite=None; Secure; HttpOnly; Path=/; Max-Age=3600;`
            },
            body: JSON.stringify({
                message: "Authentication successful",
                token: token
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