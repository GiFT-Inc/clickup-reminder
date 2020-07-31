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

export const remindDelayedTasks = async (): Promise<void> => {
  const now = Date.now()
  await clickupClient
    .get(`/team/${teamId}/task`, {
      params: { subtasks: true, due_date_lt: now },
    })
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.error(err)
    })
}
