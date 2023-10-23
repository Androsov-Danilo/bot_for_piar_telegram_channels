const { Telegraf } = require('telegraf')
const sqlite3 = require('sqlite3').verbose()

const bot = new Telegraf('6774047121:AAGe15ZnlxluIWwM3ooHVt2H6KkWeyRkghk')
const db = new sqlite3.Database('db.sqlite3')
    

function createTable(){
    const query = `CREATE TABLE User(
        id INTEGER PRIMARY KEY,
        coin int,
        tgChannel varchar(255)
    );`
    db.run(query)
}
// createTable()


function addUser(id){
    const query = `INSERT INTO User(id, coin, tgChannel) VALUES(?, 100, "https://t.me/+HoOBkfSXayI1NDcy");`
    db.run(query, [id])
}

function getUser(id, callback){
    const query = `SELECT coin FROM User WHERE id = ${id}`
    db.get(query, (err, res) =>{
        callback(res);
    })

}

function getPiarChannel(id, callback){
    const query = `SELECT tgChannel FROM User WHERE id = ${id} `
    db.all(query, (err, res)=>{
        callback(res)
    })
}

function updateCoin(id,coin){
    const query = `UPDATE User SET coin = ${coin} WHERE id = ${id}`
    db.run(query)
}


bot.start((ctx)=>{
    getUser(ctx.from.id, (res) =>{
        if (res){
            ctx.reply('Добрий день!!!')
            if(ctx.getChatMember(ctx.from.id)){
                console.log('true')
            }
        }else{
            ctx.reply(`Добрий день, ${ctx.from.first_name} ви були додані у базу данних`)
            addUser(ctx.from.id)
        }
    })
})




bot.command('piar', (ctx) => {
    getUser(ctx.from.id, (res) =>{
        if (res){
            const keyboard = {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '1 follower', callback_data: '1f' },
                    { text: '5 followers', callback_data: '5f' }
                  ]
                ]
              }
            };
        
            ctx.reply('Выберите количество фолловеров:', keyboard);
        }else{
            ctx.reply(`Добрий день, ${ctx.from.first_name} ви були додані у базу данних`)
            addUser(ctx.from.id)
        }
    })
});
  
  bot.on('callback_query', (ctx) => {
    const data = ctx.callbackQuery.data;
  
    if (data === '1f') {
        ctx.answerCbQuery('Вы выбрали 1 підписника!');
        getUser(ctx.from.id,(res)=>{
            if(res){
                updateCoin(ctx.from.id, res.coin-5)
            }
        })
    } else if (data === '5f') {
      ctx.answerCbQuery('Вы выбрали 5 підписників!');
      getUser(ctx.from.id,(res)=>{
        if(res){
            updateCoin(ctx.from.id, res.coin-25)
        }
    })
    }
  });
  


bot.command('earnings' ,(ctx)=>{
    getUser(ctx.from.id, (res) =>{
        if (res){
            getPiarChannel(ctx.from.id, (res)=>{
                if (res){
                    ctx.sendMessage(res, '1234')
                }
            })
        }else{
            ctx.reply(`Добрий день, ${ctx.from.first_name} ви були додані у базу данних`)
            addUser(ctx.from.id)
        }
    })
})

bot.launch()