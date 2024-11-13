import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { GameAppApi } from "./game-app-stack";
import { AuthApi } from "./auth-api-stack";

export class GameLibraryAppStack extends cdk.Stack {

  constructor(scope:Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new UserPool(this, "UserPool", {
      signInAliases: {username:true, email:true},
      selfSignUpEnabled: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const userPoolId = userPool.userPoolId;

    const appClient = userPool.addClient("AppClient", {
      authFlows: {userPassword:true}
    });

    const userPoolClientId = appClient.userPoolClientId;

    new AuthApi(this, "AuthApi", {
      userPoolId: userPoolId,
      userPoolClientId: userPoolClientId
    });
    new GameAppApi(this, "GameApi", {
      userPoolId: userPoolId,
      userPoolClientId: userPoolClientId
    });
  }

}