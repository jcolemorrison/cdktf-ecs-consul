import { Construct } from "constructs"
import { App, TerraformStack, DataTerraformRemoteState } from "cdktf"
import { AwsProvider } from "@cdktf/provider-aws"
import { ConsulEcsMeshTask } from "./.gen/modules/consul-ecs-mesh-task"
import { Logs } from "./logs"
import { ImagesService } from "./ecs-services"

// Change these to match your Terraform Cloud Org and Workspaces
const tfc_organization = "jcolemorrison"

// parent one with main Terraform configuration
const tfc_parent_workspace = "terraform-ecs-consul"

// this workspace
const tfc_workspace = "cdktf-ecs-consul"

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsProvider(this, "AWS", {
      region: "us-east-1"
    })

    const tfcOutputs = new DataTerraformRemoteState(this, "tfc_outputs", {
      organization: tfc_organization,
      workspaces: { name: tfc_parent_workspace }
    })

    const projectTag = tfcOutputs.getString('project_tag')

    const serviceLogs = new Logs(
      this,
      "service_logs",
      `${projectTag}-images-`,
      tfcOutputs.getString('project_region')
    )

    const serviceSideCarLogs = new Logs(
      this,
      "service_sidecar_logs",
      `${projectTag}-images-sidcars-`,
      tfcOutputs.getString('project_region')
    )

    const serviceModule = new ConsulEcsMeshTask(this, "images_module", {
      family: `${projectTag}-images`,
      requiresCompatibilities: ["FARGATE"],
      cpu: 256,
      memory: 512,
      containerDefinitions: [{
        name: "images",
        image: "nicholasjackson/fake-service:v0.23.1",
        cpu: 0,
        essential: true,
        portMappings: [{
          containerPort: 9090,
          hostPort: 9090,
          protocol: "tcp"
        }],
        logConfiguration: serviceLogs.configuration,
        environment: [
          { name: "NAME", value: "Images" },
          { name: "MESSAGE", value: "Hello from the CDKTF Image Service" },
          { name: "UPSTREAM_URIS", value: `http://${tfcOutputs.getString('database_private_ip')}:27017` }
        ]
      }],
      acls: true,
      aclSecretNamePrefix: projectTag,
      consulDatacenter: tfcOutputs.getString('consul_dc_name'),
      consulServerCaCertArn: tfcOutputs.getString('consul_root_ca_cert_arn'),
      consulClientTokenSecretArn: tfcOutputs.getString('consul_client_token_secret_arn'),
      gossipKeySecretArn: tfcOutputs.getString('consul_gossip_key_arn'),
      port: 9090,
      logConfiguration: serviceSideCarLogs.configuration,
      tls: true,
      retryJoin: tfcOutputs.getList('consul_server_ips'),
      tags: {
        "team": "dev"
      }
    })

    new ImagesService(
      this,
      "images_serivce",
      `${projectTag}-images`,
      tfcOutputs.getString('cluster_arn'),
      serviceModule.taskDefinitionArnOutput,
      tfcOutputs.getList('private_subnet_ids'),
      [
        tfcOutputs.getString('client_security_group_id'),
        tfcOutputs.getString('upstream_security_group_id')
      ]
    )
  }
}

const app = new App()
const stack = new MyStack(app, tfc_workspace)
// new CloudBackend(stack, {
//   hostname: "app.terraform.io",
//   organization: tfc_organization,
//   workspaces: new NamedCloudWorkspace(tfc_workspace)
// })
app.synth()
