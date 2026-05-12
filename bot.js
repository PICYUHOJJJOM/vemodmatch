const { Telegraf } = require('telegraf')
const express = require('express')
const path = require('path')
const { Pool } = require('pg')

const bot = new Telegraf('8624481057:AAGMM_2w7iHju1euRE3fo26uQOaZVQe7tiA')
const app = express()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT PRIMARY KEY,
      name TEXT,
      age TEXT,
      city TEXT,
      music TEXT,
      about TEXT,
      photo TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  console.log('БД готова 🖤')
}

const sessions = {}

function getSession(userId) {
  if (!sessions[userId]) sessions[userId] = {}
  return sessions[userId]
}

app.use(express.static(path.join(__dirname, 'public')))

// Прокси для фото — скачиваем с Telegram и отдаём клиенту
app.get('/api/photo/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId
    const fileRes = await fetch(
      `https://api.telegram.org/bot8624481057:AAGMM_2w7iHju1euRE3fo26uQOaZVQe7tiA/getFile?file_id=${fileId}`
    )
    const fileData = await fileRes.json()
    if (!fileData.ok) {
      res.status(404).send('not found')
      return
    }
    const photoUrl = `https://api.telegram.org/file/bot8624481057:AAGMM_2w7iHju1euRE3fo26uQOaZVQe7tiA/${fileData.result.file_path}`
    const photoRes = await fetch(photoUrl)
    const buffer = await photoRes.arrayBuffer()
    res.setHeader('Content-Type', 'image/jpeg')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.send(Buffer.from(buffer))
  } catch (e) {
    res.status(500).send('error')
  }
})

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT 50'
    )
    res.json(result.rows)
  } catch (e) {
    res.json([])
  }
})

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

bot.on('photo', async (ctx) => {
  const session = getSession(ctx.from.id)
  if (session.step === 'photo') {
    const photo = ctx.message.photo
    const fileId = photo[photo.length - 1].file_id
    session.photo = fileId
    session.step = 'about'
    ctx.reply('Отлично 🖤 Теперь опиши себя в одном предложении:')
  }
})

bot.on('text', async (ctx) => {
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

    try {
      await pool.query(
        `INSERT INTO users (id, name, age, city, music, about, photo)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           name=$2, age=$3, city=$4, music=$5, about=$6, photo=$7`,
        [ctx.from.id, session.name, session.age, session.city, session.music, session.about, session.photo || null]
      )
    } catch (e) {
      console.error('Ошибка сохранения:', e)
    }

    sessions[ctx.from.id] = {}

    ctx.reply(`Профиль создан 🖤\n\n👤 ${session.name}, ${session.age} лет\n📍 ${session.city}\n🎵 ${session.music}\n💬 ${session.about}`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔍 Найти людей', web_app: { url: 'https://vemodmatch-production.up.railway.app/app' } }],
          [{ text: '👤 Мой профиль', callback_data: 'my_profile' }]
        ]
      }
    })
  }
})

bot.action('my_profile', async (ctx) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [ctx.from.id])
    if (result.rows.length === 0) {
      ctx.reply('Сначала создай профиль 💀')
      return
    }
    const u = result.rows[0]
    ctx.reply(`👤 ${u.name}, ${u.age} лет\n📍 ${u.city}\n🎵 ${u.music}\n💬 ${u.about}`)
  } catch (e) {
    ctx.reply('Ошибка загрузки профиля 🖤')
  }
})

initDB().then(() => {
  bot.launch()
  console.log('Vemodmatch запущен 🖤')
})