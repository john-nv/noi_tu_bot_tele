require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TOKEN_BOT_TELEGRAM, { polling: true });
const axios = require('axios');

// const PORT = process.env.PORT || 8888;

const helpCommand = `📚***Hướng dẫn***📚

***Bước 1:*** Tạo/Thêm bot vào nhóm để chơi cùng bạn bè

***HẾT !*** 

*Gợi ý nhỏ ^^*
/start - Bot sẽ cho 1 cặp từ bất kì để bắt đầu trò chơi
/sos    - Sử dụng khi không tìm được câu trả lời. Ví dụ: ***/sos con vịt***
👍 => Kết quả đúng
🤬 => Kết quả sai
`

bot.on('message', async (msg) => {
    const { text, chat } = msg;
    console.log(text);
    // console.log(text);
    try {

        switch (true) {
            case text.startsWith('/help'):
                bot.sendMessage(msg.chat.id, helpCommand, { parse_mode: 'Markdown' })
                break;
            
            case text.startsWith('/start'):
                let dataRes = await axios.get('https://noitu.pro/init')
                dataRes = dataRes.data
                bot.sendMessage(msg.chat.id, `Bắt đầu bằng từ: ***${dataRes.text}***`, { parse_mode: 'Markdown' })
                break

            case text.startsWith('/sos'):
                let commandParts = text.trim().split(" ");
                if (commandParts.length < 3){
                    bot.sendMessage(msg.chat.id, `Nhập từ muốn trợ giúp ví dụ: ***Con Vịt***`, { replyParameters: msg.message_id, parse_mode: 'Markdown' })
                    break
                }
                commandParts = `${commandParts[1]} ${commandParts[2]}`;

                let sosRes = await axios.get('https://noitu.pro/answer', {
                    params: { word: commandParts }
                })
                sosRes = sosRes.data
                if(!sosRes.success) {
                    bot.sendMessage(msg.chat.id, `***${commandParts}*** => Không có nghĩa`, { replyParameters: msg.message_id, parse_mode: 'Markdown' })
                    break
                }
                bot.sendMessage(msg.chat.id, `SOS: ***${sosRes.nextWord.text}***`, { replyParameters: msg.message_id, parse_mode: 'Markdown' })
                break

            default:
                let answerRes = await axios.get('https://noitu.pro/answer', {
                    params: { word: text }
                })
                answerRes = answerRes.data
                if(answerRes.success){
                    bot.setMessageReaction(msg.chat.id, msg.message_id, {reaction: JSON.stringify([{ type: 'emoji', emoji: '👍' }])})
                    //bot.sendMessage(msg.chat.id, '👍', { replyParameters: msg.message_id });
                } else
                {
                    bot.setMessageReaction(msg.chat.id, msg.message_id, {reaction: JSON.stringify([{ type: 'emoji', emoji: '🤬' }])})
                }
                break
        }

        

    } catch (error) {
        console.error("Lỗi trong quá trình xử lý tin nhắn:", error);
    }
});

console.log("START");
