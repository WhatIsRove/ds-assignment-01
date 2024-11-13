import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apig from "aws-cdk-lib/aws-apigateway";
import { AuthProps } from '../shared/types';

export class AuthApi extends Construct {
    private auth: apig.IResource;
    private userPoolId: string;
    private userPoolClientId: string;


    constructor(scope: Construct, id: string, props: AuthProps) {
        super(scope, id);

        const authApi = new apig.RestApi(this, "AuthApiService", {
            description: "Authentication Rest Api",
            endpointTypes: [apig.EndpointType.REGIONAL],
            defaultCorsPreflightOptions: {
                allowOrigins: apig.Cors.ALL_ORIGINS
            }
        });

        this.auth = authApi.root.addResource("auth");

        
    }

    private addAuthRoute(
        resourceName: string,
        method: string,
        fnName: string,
        fnEntry: string,
        allowCognitoAccess?: boolean
      ): void {
        const commonFnDetails = {
          architecture: lambda.Architecture.ARM_64,
          timeout: cdk.Duration.seconds(10),
          memorySize: 128,
          runtime: lambda.Runtime.NODEJS_18_X,
          handler: "handler",
          environment: {
            USER_POOL_ID: this.userPoolId,
            CLIENT_ID: this.userPoolClientId,
            REGION: cdk.Aws.REGION
          },
        };
        
        const resource = this.auth.addResource(resourceName);
        
        const fn = new lambdanode.NodejsFunction(this, fnName, {
          ...commonFnDetails,
          entry: `${__dirname}/../lambda/auth/${fnEntry}`,
        });
    
        resource.addMethod(method, new apig.LambdaIntegration(fn));
    }
}