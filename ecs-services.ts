import { ecs } from "@cdktf/provider-aws"
import { Construct } from "constructs"

export class ImagesService extends Construct {
  public service: ecs.EcsService

  constructor(
    scope: Construct,
    name: string,
    serviceName: string,
    clusterArn: string,
    taskDefinitionArn: string,
    subnets: string[],
    securityGroups: string[],
  ) {
    super(scope, name)

    this.service = new ecs.EcsService(this, name, {
      name: serviceName,
      cluster: clusterArn,
      taskDefinition: taskDefinitionArn,
      desiredCount: 1,
      launchType: "FARGATE",
      networkConfiguration: {
        subnets,
        securityGroups,
        assignPublicIp: false
      },
      propagateTags: "TASK_DEFINITION"
    })
  }
}