const { Telegraf } = require('telegraf')
const express = require('express')
const path = require('path')

const bot = new Telegraf('8624481057:AAGMM_2w7iHju1euRE3fo26uQOaZVQe7tiA')
const app = express()

const sessions = {}
const users = {}

function getSession(userId) {
  if (!sessions[userId]) sessions[userId] = {}
  return sessions[userId]
}

// Отдаём Mini App как статику
app.use(express.static(path.join(__dirname, 'public')))

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(3000, () => {
  console.log('Web server запущен на порту 3000')
})

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

bot.on('photo', (ctx) => {
  const session = getSession(ctx.from.id)
  if (session.step === 'photo') {
    const photo = ctx.message.photo
    const fileId = photo[photo.length - 1].file_id
    session.photo = fileId
    session.step = 'about'
    ctx.reply('Отлично 🖤 Теперь опиши себя в одном предложении:')
  }
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
    session.step = 'photo'
    ctx.reply('Теперь отправь своё фото для анкеты 📷')
  } else if (step === 'about') {
    session.about = ctx.message.text

    users[ctx.from.id] = {
      name: session.name,
      age: session.age,
      city: session.city,
      music: session.music,
      photo: session.photo || null,
      about: session.about
    }

    sessions[ctx.from.id] = {}

    const u = users[ctx.from.id]

    ctx.reply(`Профиль создан 🖤\n\n👤 ${u.name}, ${u.age} лет\n📍 ${u.city}\n🎵 ${u.music}\n💬 ${u.about}`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔍 Найти людей', web_app: { url: 'https://vemodmatch-production.up.railway.app/app' } }],
          [{ text: '👤 Мой профиль', callback_data: 'my_profile' }]
        ]
      }
    })
  }
})

bot.action('my_profile', (ctx) => {
  const u = users[ctx.from.id]
  if (!u) {
    ctx.reply('Сначала создай профиль 💀')
    return
  }
  ctx.reply(`👤 ${u.name}, ${u.age} лет\n📍 ${u.city}\n🎵 ${u.music}\n💬 ${u.about}`)
})

bot.action('find_people', (ctx) => {
  ctx.reply('Поиск пока в разработке 🖤 Скоро!')
})

bot.launch()
console.log('Vemodmatch запущен 🖤')