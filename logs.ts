import { Construct } from "constructs"
import { CloudwatchLogGroup } from "@cdktf/provider-aws/lib/cloudwatch"

export class Logs extends Construct {
  public group: CloudwatchLogGroup
  public configuration: { logDriver: string; options: { "awslogs-group": string; "awslogs-region": string; "awslogs-stream-prefix": string } }

  constructor(
    scope: Construct,
    name: string,
    logNamePrefix: string,
    logRegion: string
  ) {
    super(scope, name)

    this.group = new CloudwatchLogGroup(this, name, {
      namePrefix: logNamePrefix
    })

    this.configuration = {
      logDriver: "awslogs",
      options: {
        "awslogs-group": this.group.name,
        "awslogs-region": logRegion,
        "awslogs-stream-prefix": logNamePrefix
      }
    }
  }
}