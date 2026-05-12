const { Telegraf } = require('telegraf')

const bot = new Telegraf('8624481057:AAGMM_2w7iHju1euRE3fo26uQOaZVQe7tiA')

bot.start((ctx) => {
  ctx.reply('Добро пожаловать в Vemodmatch 🖤\n\nЗдесь ты найдёшь людей на одной волне с тобой — по музыке, эстетике и вайбу.\n\nНажми кнопку ниже чтобы начать:', {
    reply_markup: {
      inline_keyboard: [[
        { text: '💀 Создать профиль', callback_data: 'create_profile' }
      ]]
    }
  })
})

bot.action('create_profile', (ctx) => {
  ctx.reply('Как тебя зовут? Напиши своё имя или никнейм:')
})

bot.launch()
console.log('Vemodmatch запущен 🖤')