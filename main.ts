import { ScheduledHandler } from 'aws-lambda'
import { remindDelayedTasks, remindUpcomingTasks } from './clickup'

export const handler: ScheduledHandler = async () => {
  await remindUpcomingTasks()
  await remindDelayedTasks()
}
