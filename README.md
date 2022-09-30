# CDK for Terraform with Amazon ECS and Consul

This repository demonstrates setting up an Amazon ECS microservices architecture with HashiCorp's Cloud Development Kit for Terraform (CDKTF) and Consul.   It also goes along with two other repositories:

1. [Terraform with Amazon ECS and Consul](https://github.com/jcolemorrison/terraform-ecs-consul)
  - deploys the core infrastructure that supports this project. It's referenced as teh "parent workspace" or "parent" project throughout this code.
  - you must deploy this FIRST before using this project...or else....
  - ...nothing will happen.
2. [Sentinel Policies for Terraform with Amazon ECS and Consul](https://github.com/jcolemorrison/sentinel-ecs-consul)
  - creates [HashiCorp Sentinel Policies](https://www.hashicorp.com/sentinel) to guard both projects in [Terraform Cloud](https://cloud.hashicorp.com/products/terraform)

## The Architecture

![Terraform with Amazon ECS and Consul](images/Terraform%20with%20Amazon%20ECS%20and%20Consul.png)

All services use [Fake Service](https://github.com/nicholasjackson/fake-service) as for demonstration purposes.  You can swap them out with your own containerized services.  You will need to change around port configurations and security groups to afford your applications' needs.

## Getting Started

For this you'll need 5 things:

- AWS Account and Credentials
- Terraform
- Terraform Cloud Account
- Node.js
- CDKTF

Instructions below:

### 1. AWS Account and Credentials

AWS is used to host the infrastructure.  Surprise.

1. Have an [AWS Account](https://aws.amazon.com/).

2. Have the [AWS CLI Installed](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

3. Create an [AWS IAM User](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html) with Admin or Power User Permissions.
  - this user will only be used locally

4. [Configure the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) with the IAM User from Step 4.
  - Terraform will read your credentials via the AWS CLI 
  - [Other Authentication Methods with AWS and Terraform](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication)

### 2. Terraform, Terraform Cloud, and the CDK for Terraform

Terraform and CDKT for Terraform are used to provision the infrastructure.  Terraform Cloud (free) is used to manage your state.

1. Install [HashiCorp Terraform](https://www.terraform.io/downloads).

2. Install [Node.js](https://nodejs.org/en/).

3. Install the [CDK for Terraform](https://learn.hashicorp.com/tutorials/terraform/cdktf-install?in=terraform/cdktf)

4. Sign up for [Terraform Cloud](https://app.terraform.io/public/signup/account?utm_content=offers_tfc&utm_source=jcolemorrison)
  - yo its free for 5 team members

5. Create a [Terraform Cloud Organization](https://learn.hashicorp.com/tutorials/terraform/cloud-sign-up?in=terraform/cloud-get-started)

6. Log in to [Terraform Cloud from the CLI](https://learn.hashicorp.com/tutorials/terraform/cloud-login?in=terraform/cloud-get-started)
  - this will set the credentials locally for the CDKTF to work with it

7. Change the TFC Variables in [`main.ts`](https://github.com/jcolemorrison/cdktf-ecs-consul/blob/main/main.ts#L8-L15) to reflect the names of your Organization and Workspaces:
  ```ts
  // Change these to match your Terraform Cloud Org and Workspaces
  const tfc_organization = "jcolemorrison"

  // parent workspace with main Terraform configuration
  const tfc_parent_workspace = "tf-ecs-consul"

  // this workspace
  const tfc_workspace = "cdktf-ecs-consul"
  ```

## Deploying the Project

**First and foremost**, you MUST deploy the associated [Terraform with Amazon ECS and Consul](https://github.com/jcolemorrison/terraform-ecs-consul) Project before deploying this one as this project depends on it.  Have you done that?  Good, now you can deploy this project:

1. [Create a Workspace in Terraform Cloud](https://learn.hashicorp.com/tutorials/terraform/cloud-workspace-create?in=terraform/cloud-get-started) for this project named the same thing as your `tfc_workspace` in `main.ts`.

2. [Connect this Repository to the newly created workspace](https://learn.hashicorp.com/tutorials/terraform/cloud-vcs-change?in=terraform/cloud-get-started).

3. [Trigger a Run to Plan and Apply Infrastructure](https://www.terraform.io/cloud-docs/run/manage).

4. Connect to the `client_endpoint` output in your [Terraform with Amazon ECS and Consul](https://github.com/jcolemorrison/terraform-ecs-consul) Project deployment to see if the service is live.

## For Local Development

1. Run `npm i` to install all dependencies.

2. Run `cdktf get` to grab all modules.