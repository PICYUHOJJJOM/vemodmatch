const { Telegraf } = require('telegraf')

const bot = new Telegraf('8624481057:AAGMM_2w7iHju1euRE3fo26uQOaZVQe7tiA')

const sessions = {}
const users = {}

function getSession(userId) {
  if (!sessions[userId]) sessions[userId] = {}
  return sessions[userId]
}

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
  const session = getSession(ctx.from.id)
  session.step = 'name'
  ctx.reply('Как тебя зовут? Напиши своё имя или никнейм:')
})

bot.on('text', (ctx) => {
  const session = getSession(ctx.from.id)
  const step = session.step

  if (step === 'name') {
    session.name = ctx.message.text
    session.step = 'age'
    ctx.reply('Сколько тебе лет?')
  } else if (step === 'age') {
    session.age = ctx.message.text
    session.step = 'city'
    ctx.reply('Из какого ты города?')
  } else if (step === 'city') {
    session.city = ctx.message.text
    session.step = 'music'
    ctx.reply('Какую музыку слушаешь? Напиши жанры или исполнителей:')
  } else if (step === 'music') {
    session.music = ctx.message.text
    session.step = 'about'
    ctx.reply('Опиши себя в одном предложении:')
  } else if (step === 'about') {
    session.about = ctx.message.text

    users[ctx.from.id] = {
      name: session.name,
      age: session.age,
      city: session.city,
      music: session.music,
      about: session.about
    }

    sessions[ctx.from.id] = {}

    ctx.reply(`Профиль создан 🖤\n\n👤 ${users[ctx.from.id].name}, ${users[ctx.from.id].age} лет\n📍 ${users[ctx.from.id].city}\n🎵 ${users[ctx.from.id].music}\n💬 ${users[ctx.from.id].about}`, {
      reply_markup: {
        inline_keyboard: [[
          { text: '🔍 Найти людей', callback_data: 'find_people' }
        ]]
      }
    })
  }
})

bot.action('find_people', (ctx) => {
  ctx.reply('Поиск пока в разработке 🖤 Скоро!')
})

bot.launch()
console.log('Vemodmatch запущен 🖤')