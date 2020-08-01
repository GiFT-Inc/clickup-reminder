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
const locale = 'ja-JP'

export const remindDelayedTasks = async (): Promise<void> => {
  const now = Date.now()
  const params = {
    subtasks: true,
    due_date_lt: now,
  }
  await clickupClient
    .get(`/team/${teamId}/task`, { params })
    .then((res) => {
      if (res.status === 200) {
        res.data.tasks.forEach((task) => {
          // TODO: set space name
          const dueDate = new Date(
            parseInt(task.due_date, 10),
          ).toLocaleDateString(locale)
          const taskName = task.name
          const taskUrl = task.url
          const assignees = task.assignees
            .map((assignee) => {
              return assignee.username
            })
            .join(',')
          const message = `Due Date: ${dueDate} - <${taskUrl}|${taskName}> (${assignees})`
          console.info(message)
        })
      } else {
        console.error(res)
      }
    })
    .catch((err) => {
      console.error(err)
    })
}
