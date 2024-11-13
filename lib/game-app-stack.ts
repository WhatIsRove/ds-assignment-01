import * as cdk from 'aws-cdk-lib';
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as custom from "aws-cdk-lib/custom-resources";
import * as apig from "aws-cdk-lib/aws-apigateway";
import { Construct } from 'constructs';
import { generateBatch } from '../shared/util';
import { games } from '../seed/games';
import { AuthProps } from '../shared/types';

export class GameAppApi extends Construct {
  constructor(scope: Construct, id: string, props: AuthProps) {
    super(scope, id);

    //create dynamodb table for games
    const gamesTable = new dynamodb.Table(this, "gamesTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "id", type: dynamodb.AttributeType.NUMBER },
      sortKey: {name: "title", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "Games",
    });

    //seed function for batch of games
    new custom.AwsCustomResource(this, "gamesDatabaseInitData", {
      onCreate: {
        service: "DynamoDB",
        action: "batchWriteItem",
        parameters: {
          RequestItems: {
            [gamesTable.tableName]: generateBatch(games),
          },
        },
        physicalResourceId: custom.PhysicalResourceId.of("gamesDatabaseInitData"), //.of(Date.now().toString()),
      },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [gamesTable.tableArn],
      }),
    });

    //lambda functions
    const commonFnDetails = {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_18_X,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        handler: "handler",
        environment: {
          TABLE_NAME: gamesTable.tableName,
          USER_POOL_ID: props.userPoolId,
          CLIENT_ID: props.userPoolClientId,
          REGION: "eu-west-1"
        }
    }

    const getAllGamesFn = new lambdanode.NodejsFunction(
      this,
      "GetAllGamesFn",
      {
        ...commonFnDetails,
        entry: `${__dirname}/../lambdas/getAllGames.ts`,
      }
    );

    const getGameByIdFn = new lambdanode.NodejsFunction(
      this,
      "GetGameByIdFn",
      {
        ...commonFnDetails,
        entry: `${__dirname}/../lambdas/getGameById.ts`,
      }
    )

    const addGameFn = new lambdanode.NodejsFunction(
      this,
      "AddGameFn",
      {
        ...commonFnDetails,
        entry: `${__dirname}/../lambdas/addGame.ts`,
      }
    )

    const authorizerFn = new lambdanode.NodejsFunction(
        this,
        "AuthorizerFn",
        {
            ...commonFnDetails,
            entry: `${__dirname}/../lambdas/auth/authorizer.ts`
        }
    )

    const requestAuthorizer = new apig.RequestAuthorizer(
        this,
        "RequestAuthorizer",
        {
            identitySources: [apig.IdentitySource.header("cookie")],
            handler: authorizerFn,
            resultsCacheTtl: cdk.Duration.minutes(0)
        }
    )

    //permissions
    gamesTable.grantReadData(getAllGamesFn);
    gamesTable.grantReadData(getGameByIdFn);
    gamesTable.grantReadWriteData(addGameFn);

    //rest api
    const api = new apig.RestApi(this, "RestAPI", {
      description: "game library api",
      deployOptions: {
        stageName: "home"
      },
      defaultCorsPreflightOptions: {
        allowHeaders: ["Content-Type", "X-Amz-Date"],
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
        allowCredentials: true,
        allowOrigins: ["*"]
      }
    });

    const gamesEndpoint = api.root.addResource("games");
    gamesEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getAllGamesFn, { proxy: true })
    );

    gamesEndpoint.addMethod(
      "POST",
      new apig.LambdaIntegration(addGameFn, { proxy: true }),
      {
        authorizer: requestAuthorizer,
        authorizationType: apig.AuthorizationType.CUSTOM
      }
    );

    const gameEndpoint = gamesEndpoint.addResource("{gameId}");
    gameEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getGameByIdFn, {proxy: true})
    );
  }
}
