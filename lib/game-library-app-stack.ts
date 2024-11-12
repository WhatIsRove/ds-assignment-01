import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { GameAppApi } from "./game-app-stack";
import { AuthApi } from "./auth-api-stack";

export class GameLibraryAppStack extends cdk.Stack {

  constructor(scope:Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new AuthApi(this, "AuthApi", {});
    new GameAppApi(this, "GameApi", {});
  }

}