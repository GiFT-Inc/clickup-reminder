import { ScheduledHandler } from 'aws-lambda'

export const handler: ScheduledHandler = () => {
  console.log('clickup reminder')
}
