import axios, { AxiosRequestConfig } from 'axios'
import { postMessage } from './slack'

import { Dayjs } from 'dayjs'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)
const tz = 'Asia/Tokyo'

const teamId = process.env.TEAM_ID
const subtasks = process.env.INCLUDE_SUBTASKS
const remindStatus = process.env.REMIND_STATUS

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
  dueDate: Dayjs
  name: string
  url: string
  status: string
  assignees: string
}

export const remindUpcomingTasks = async (): Promise<void> => {
  const from = dayjs().tz(tz).startOf('day').valueOf()
  const upcomingDays = 3
  const to = dayjs().tz(tz).add(upcomingDays, 'day').endOf('day').valueOf()
  const params = {
    subtasks,
    due_date_gt: from,
    due_date_lt: to,
    order_by: 'due_date',
    reverse: true,
    status: remindStatus ?? '',
  }
  console.info(params)
  const tasks: Task[] = await clickupClient
    .get(`/team/${teamId}/task`, { params })
    .then((res) => {
      console.log(res.status)
      if (res.status === 200) {
        return res.data.tasks.map((task) => {
          return parseTask(task)
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
    await postMessage('no upcoming task found :smile:')
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
      return `${task.dueDate.tz(tz).format('YYYY-MM-DD')} | *${
        task.spaceName
      }*: <${task.url}|${task.name}> \`${task.status}\` (${task.assignees})`
    })
    .join('\n')
  await postMessage(
    [`*${tasks.length} upcoming task(s) found* :bomb:`, message].join('\n'),
  )
}

export const remindDelayedTasks = async (): Promise<void> => {
  const now = dayjs().tz(tz).startOf('day').valueOf()
  const params = {
    subtasks,
    due_date_lt: now,
    order_by: 'due_date',
    reverse: true,
    status: remindStatus ?? '',
  }
  console.info(params)
  const tasks: Task[] = await clickupClient
    .get(`/team/${teamId}/task`, { params })
    .then((res) => {
      console.log(res.status)
      if (res.status === 200) {
        return res.data.tasks.map((task) => {
          return parseTask(task)
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
      return `${task.dueDate.tz(tz).format('YYYY-MM-DD')} | *${
        task.spaceName
      }*: <${task.url}|${task.name}> \`${task.status}\` (${task.assignees})`
    })
    .join('\n')
  await postMessage(
    [`*${tasks.length} delayed task(s) found* :boom:`, message].join('\n'),
  )
}

const parseTask = (task: any): Task => {
  const dueDate = dayjs(parseInt(task.due_date, 10))
  const name = task.name
  const url = task.url
  const status = task.status.status
  const assignees = task.assignees
    .map((assignee) => {
      return assignee.username
    })
    .join(', ')
  return {
    spaceId: task.space.id,
    spaceName: '-',
    dueDate,
    name,
    url,
    status,
    assignees,
  }
}
