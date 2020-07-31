import { ScheduledHandler } from 'aws-lambda'
import { remindDelayedTasks } from './clickup'

export const handler: ScheduledHandler = async () => {
  await remindDelayedTasks()
}
