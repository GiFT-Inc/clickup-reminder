import { WebClient } from '@slack/web-api'

const channel = process.env.SLACK_CHANNEL || 'general'
const web = new WebClient(process.env.SLACK_TOKEN)

export const postMessage = async (text: string): Promise<void> => {
  await web.chat.postMessage({ text, channel }).catch((err) => {
    console.error(err)
  })
}
