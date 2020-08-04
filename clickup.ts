import axios, { AxiosRequestConfig } from 'axios'
import { postMessage } from './slack'

const teamId = process.env.TEAM_ID
const subtasks = process.env.INCLUDE_SUBTASKS
const baseURL = 'https://api.clickup.com/api/v2'
const axiosConfig: AxiosRequestConfig = {
  baseURL,
  headers: { Authorization: process.env.CLICKUP_TOKEN },
  responseType: 'json',
  timeout: 8000,
  validateStatus: () => {
    return true
  },
}
const clickupClient = axios.create(axiosConfig)

interface Task {
  spaceId: string
  spaceName: string
  dueDate: Date
  name: string
  url: string
  status: string
  assignees: string
}

export const remindDelayedTasks = async (): Promise<void> => {
  const now = Date.now()
  const params = {
    subtasks,
    due_date_lt: now,
    order_by: 'due_date',
    reverse: true,
  }
  console.info(params)
  const tasks: Task[] = await clickupClient
    .get(`/team/${teamId}/task`, { params })
    .then((res) => {
      console.log(res.status)
      if (res.status === 200) {
        return res.data.tasks.map((task) => {
          const dueDate = new Date(parseInt(task.due_date, 10))
          const name = task.name
          const url = task.url
          const status = task.status.status
          const assignees = task.assignees
            .map((assignee) => {
              return assignee.username
            })
            .join(', ')
          const parsedTask: Task = {
            spaceId: task.space.id,
            spaceName: '-',
            dueDate,
            name,
            url,
            status,
            assignees,
          }
          return parsedTask
        })
      } else {
        console.warn(res)
        return []
      }
    })
    .catch((err) => {
      throw err
    })
  if (tasks.length === 0) {
    await postMessage('no delayed task found :smile:')
    return
  }
  const spaceIds = tasks.map((task) => task.spaceId)
  const uniqueSpaceIds = spaceIds.filter((v, i) => spaceIds.indexOf(v) === i)
  for (const spaceId of uniqueSpaceIds) {
    await clickupClient
      .get(`/space/${spaceId}`)
      .then((res) => {
        if (res.status === 200) {
          tasks
            .filter((task) => task.spaceId === spaceId)
            .forEach((task) => (task.spaceName = res.data.name))
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }
  const message = tasks
    .map((task) => {
      return `${task.dueDate.toLocaleDateString('ja-JP')} | *${
        task.spaceName
      }*: <${task.url}|${task.name}> \`${task.status}\` (${task.assignees})`
    })
    .join('\n')
  await postMessage(
    [`${tasks.length} delayed task(s) found :cry:`, message].join('\n'),
  )
}
