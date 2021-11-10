# clickup-reminder

![Actions](https://github.com/t2h5/clickup-reminder/workflows/Actions/badge.svg)

Remind ClickUp **filtered tasks** by posting messages to Slack.

- What is filtered tasks?
  - delayed: overdue tasks
  - upcoming: upcoming tasks (due date coming up in 3days)

## requirements

- Node.js 12.x
- yarn
- aws profile

## setup

Install depedencies using yarn.

```sh
$ yarn install
```

Create `config/dev.json` for your enviroment.

```json
{
  "aws_profile": "your profile name",
  "clickup_token": "your clickup personal api key",
  "team_id": "your clickup team id",
  "include_subtasks": true,
  "slack_token": "your slack token",
  "slack_channel": "channel name to post",
  "remind_status": "clickup remind status optional"
}
```

You can specify **stage**, but filename must follow it (like `config/stage.json`).

https://www.serverless.com/framework/docs/providers/aws/cli-reference/deploy/

## deploy

Deploy Lambda function using serverless.

```sh
$ yarn deploy
```
