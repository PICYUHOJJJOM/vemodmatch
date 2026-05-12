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
console.log('Vemodmatch запущен 🖤')const { Telegraf, session } = require('telegraf')

const bot = new Telegraf('8624481057:AAGMM_2w7iHju1euRE3fo26uQOaZVQe7tiA')

bot.use(session())

const users = {}

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
  ctx.session = { step: 'name' }
  ctx.reply('Как тебя зовут? Напиши своё имя или никнейм:')
})

bot.on('text', (ctx) => {
  if (!ctx.session) return

  const step = ctx.session.step

  if (step === 'name') {
    ctx.session.name = ctx.message.text
    ctx.session.step = 'age'
    ctx.reply('Сколько тебе лет?')
  } 
  else if (step === 'age') {
    ctx.session.age = ctx.message.text
    ctx.session.step = 'city'
    ctx.reply('Из какого ты города?')
  }
  else if (step === 'city') {
    ctx.session.city = ctx.message.text
    ctx.session.step = 'music'
    ctx.reply('Какую музыку слушаешь? Напиши жанры или исполнителей:')
  }
  else if (step === 'music') {
    ctx.session.music = ctx.message.text
    ctx.session.step = 'about'
    ctx.reply('Опиши себя в одном предложении:')
  }
  else if (step === 'about') {
    ctx.session.about = ctx.message.text
    
    const profile = {
      name: ctx.session.name,
      age: ctx.session.age,
      city: ctx.session.city,
      music: ctx.session.music,
      about: ctx.session.about
    }
    
    users[ctx.from.id] = profile
    ctx.session = null

    ctx.reply(`Профиль создан 🖤\n\n👤 ${profile.name}, ${profile.age} лет\n📍 ${profile.city}\n🎵 ${profile.music}\n💬 ${profile.about}`, {
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