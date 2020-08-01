import axios, { AxiosRequestConfig } from 'axios'

const baseURL = 'https://api.clickup.com/api/v2'
const axiosConfig: AxiosRequestConfig = {
  baseURL,
  headers: { Authorization: process.env.CLICKUP_TOKEN },
  responseType: 'json',
  timeout: 5000,
  validateStatus: () => {
    return true
  },
}
const clickupClient = axios.create(axiosConfig)

const teamId = process.env.TEAM_ID

interface Task {
  spaceId: string
  spaceName: string
  dueDate: Date
  taskName: string
  taskUrl: string
  assignees: string
}

export const remindDelayedTasks = async (): Promise<void> => {
  const now = Date.now()
  const params = {
    subtasks: true,
    due_date_lt: now,
  }
  const tasks: Task[] = await clickupClient
    .get(`/team/${teamId}/task`, { params })
    .then((res) => {
      if (res.status === 200) {
        return res.data.tasks.map((task) => {
          const dueDate = new Date(parseInt(task.due_date, 10))
          const taskName = task.name
          const taskUrl = task.url
          const assignees = task.assignees
            .map((assignee) => {
              return assignee.username
            })
            .join(',')
          const parsedTask: Task = {
            spaceId: task.space.id,
            spaceName: '-',
            dueDate,
            taskName,
            taskUrl,
            assignees,
          }
          return parsedTask
        })
      } else {
        console.error(res)
        return []
      }
    })
    .catch((err) => {
      throw err
    })
  const spaceIds = tasks.map((task) => task.spaceId)
  const uniqueSpaceIds = spaceIds.filter((v, i) => spaceIds.indexOf(v) === i)
  for (const spaceId of uniqueSpaceIds) {
    await clickupClient.get(`/space/${spaceId}`).then((res) => {
      if (res.status === 200) {
        tasks
          .filter((task) => task.spaceId === spaceId)
          .forEach((task) => (task.spaceName = res.data.name))
      }
    })
  }
  console.info(tasks)
}
