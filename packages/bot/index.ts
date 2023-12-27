/* eslint-disable no-console */

import { CQ, CQWebSocket } from 'go-cqwebsocket'
import 'dotenv/config'

const client = new CQWebSocket({
  host: process.env.VALORANT_BOT_HOST || 'localhost',
  port: Number(process.env.VALORANT_BOT_PORT) || 3000,
})

client.on('message.group', (event) => {
  const message = event.context.raw_message
  console.log(event.contextType)
  if (message === '1') {
    CQ.reply(event.context.message_id)
    console.time('time')

    // await event.bot.send_group_msg(
    //   event.context.group_id,
    //   '和消息的数量有关系吗？',
    // )

    event.bot.send_msg({
      group_id: event.context.group_id,
      message: [CQ.reply(event.context.message_id), CQ.text(`2`)],
      message_type: 'group',
      auto_escape: false,
    })
    console.timeEnd('time')
  }
})

console.log('success opened')

client.connect()

// const webSocketClient = new ws('ws://localhost:8080')

// webSocketClient.on('open', () => {
//   console.log('Websocket opened!')
// })

// webSocketClient.on('message', (_data) => {
//   if (!_data.toString().startsWith('{')) return

//   const data = JSON.parse(_data.toString()) as any

//   if (data.message_type === 'group' && data.post_type === 'message') {
//     const message = data.raw_message
//     if (message === '1') {
//       console.log(data)
//       webSocketClient.send(
//         JSON.stringify({
//           message_type: 'group',
//           user_id: data.sender.user_id,
//           group_id: data.group_id,
//           message: '222',
//           auto_escape: false,
//         }),
//       )
//     }
//   }
// })
