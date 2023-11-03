const { Telegraf } = require('telegraf')
const sqlite3 = require('sqlite3').verbose()

const bot = new Telegraf('6774047121:AAGe15ZnlxluIWwM3ooHVt2H6KkWeyRkghk')
const db = new sqlite3.Database('db.sqlite3')
    

function createTableUser(){
    const query = `CREATE TABLE User(
        id INTEGER PRIMARY KEY,
        coin int
    );`
    db.run(query);
}
function createTableLinks(){
    const query = `CREATE TABLE Links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        status varchar(255),
        link varchar(255),
        link_id int,
        user_id int,
        max_folow int,
        folow int,
        name_chennel varchar(255)
    );`
    db.run(query);
}

// createTableUser()
// createTableLinks()

function createLink(link,user_id, status, link_id,max_folow, folow, name_chennel){
    const query = `INSERT INTO Links(link,user_id, status, link_id) VALUES(?,?,?,?,?,?,?);`
    db.run(query,[link,user_id, status, link_id, max_folow, folow, name_chennel])
}

function addUser(id, coin){
    const query = `INSERT INTO User(id, coin) VALUES(?,?);`
    db.run(query, [id, coin])
}

function getRandomLinkId(callback) {
    const query = 'SELECT link_id FROM Links ORDER BY RANDOM() LIMIT 1';

    db.get(query, (err, res) => {
        if (!err) {
            callback(res.id);
        } else {
            console.error(err);
            callback(null);
        }
    });
}

function getUser(id, callback){
    const query = `SELECT coin FROM User WHERE id = ${id}`
    db.get(query, (err, res) =>{
        callback(res);
    })
}

function getPiarChannel(callback){
    const query = `SELECT link, link_id FROM Links WHERE status == 'piar' `
    db.all(query, (err, res)=>{
        callback(res)
    })
}

function getChannel(user_id,callback){
    const query = `SELECT link FROM Links WHERE user_id = ${user_id}`
    db.all(query, (err, res)=>{
        callback(res)
    })
}

function updateCoin(id,coin){
    const query = `UPDATE User SET coin = ${coin} WHERE id = ${id}`
    db.run(query)
}

function updateStatus(user_id, status){
    const query = `UPDATE Links SET status = '${status}' WHERE user_id = ${user_id}`
    db.run(query)
}

function updateLinkId(user_id, link_id){
    const query = `UPDATE Links SET link_id = ${link_id} WHERE user_id = ${user_id}`
    db.run(query)
}

function updateLink(user_id, link_id){

}

function getCoin(id){
    const query = `SELECT coin FROM User WHERE id = ${id}`
    db.get(query)
}

function getlink(user_id, callback){
    const query = `SELECT link FROM Links WHERE status = 'piar' AND user_id <> ${user_id} ORDER_BY RAND() LIMIT 5 `
    db.all(query, (err, res) => {
        callback(res)
    })
}

bot.hears('Додати канал', (ctx) => {
    getUser(ctx.from.id, (res) =>{
        if (res){
            const chennelKeyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'додати канал', callback_data: 'add_ch' },
                            { text: 'додати назву канала', callback_data: 'add_name' }
                        ]
                    ]
                }
            }
            ctx.reply('Выберите действие:', chennelKeyboard);
        }
    });
});

// function getChatTitle(title, )

bot.start((ctx)=>{
    getUser(ctx.from.id, (res) =>{
        if (res){
            ctx.reply('Добрий день!!! Оберіть що хочете зробити:',{
                reply_markup: {
                    keyboard: [
                        ['Додати канал'],
                        ['Піар'],
                        ['Заробити'],
                        ['Про мене']
                    ],
                    resize_keyboard: true,
                }
            })
        }else{
            ctx.reply(`Добрий день, ${ctx.from.first_name} ви були додані у базу данних`)
            addUser(ctx.from.id, 100)
        }
    });
});

bot.hears('Додати канал', (ctx) => {
    getUser(ctx.from.id, (res) =>{
        if (res){
            createLink('',ctx.from.id, 'standart', null, null, 0, '')
            const chennelKeyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Додати канал', callback_data: 'add_ch' },
                            { text: 'Додати назву канала', callback_data: 'add_name' }
                        ]
                    ]
                }
            }
        }
    });
});

bot.hears('Піар', (ctx) => {
    getUser(ctx.from.id, (res) => {
        if (res) {
            const followerKeyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '1 follower', callback_data: '1f' },
                            { text: '5 followers', callback_data: '5f' },
                            { text: '10 followers', callback_data: '10f' },
                            { text: '15 followers', callback_data: '15f' }
                        ]
                    ]
                }
            };

            ctx.reply('Выберите количество фолловеров:', followerKeyboard);
        }
    });
});

bot.on('callback_query', (ctx) => {
    const data = ctx.callbackQuery.data;
  
    if (data === '1f') {
        ctx.answerCbQuery('Вы выбрали 1 підписника!');
        getUser(ctx.from.id,(res)=>{
            if(res.coin >= 5){
                updateCoin(ctx.from.id, res.coin - 5)
            }
        })
    } else if (data === '5f') {
      ctx.answerCbQuery('Вы выбрали 5 підписників!');
      getUser(ctx.from.id,(res)=>{
        if(res.coin >= 25){
            updateCoin(ctx.from.id, res.coin-25)
        }
        })
    } else if (data === '10f') {
        ctx.answerCbQuery('Вы выбрали 10 підписників!');
        getUser(ctx.from.id, (res) => {
            if (res.coin >= 50) {  
                updateCoin(ctx.from.id, res.coin - 50); 
            }
        });
    } else if (data === '15f') {
        ctx.answerCbQuery('Вы выбрали 15 підписників!');
        getUser(ctx.from.id, (res) => {
            if (res.coin >= 75) {  
                updateCoin(ctx.from.id, res.coin - 75);  
            }
        });
    }else if (data === 'add_ch') {
        ctx.answerCbQuery('Введіть силку на канал');
        bot.on('text', (ctx) =>{
            
        })
    } else if (data === 'add_name') {
        ctx.answerCbQuery('Введіть назву каналу');
        bot.on('text', (ctx) =>{
            console.log(ctx.message.text)
        })
    }
    });
    

bot.hears('Заробити', (ctx) => {
    ctx.reply('Заробити');
});

bot.hears('Про мене', (ctx) => {
    getUser(ctx.from.id, (res) =>{
        if(res){
            ctx.reply(`Ваш баланс: ${res.coin}`)
            getChannel(ctx.from.id, (res) =>{
                for (let i of res){
                    ctx.reply(`${i.link}`)
                }
            })
        }else{
            ctx.reply(`Добрий день, ${ctx.from.first_name} ви були додані у базу данних`)
            addUser(ctx.from.id, 100)
        }
    })
});

bot.command('id', (ctx)=>{
    getUser(ctx.from.id,(res)=>{
        if(res){
            updateLink(ctx.from.id, ctx.chat.id)
            console.log(ctx.chat.id)
            console.log(ctx.chat.title)
            
        }else{
            null
        }
    })
})

bot.command('earnings' ,(ctx)=>{
    getUser(ctx.from.id, (res) =>{
        if (res){
            getRandomLinkId((randomLinkId) => {
                if (randomLinkId) {
                    console.log('Случайное link_id:', randomLinkId);
                    
                } else {
                    console.log('Не удалось получить случайное link_id');
                }
            });
        //     getlink(ctx.from.id,(res) =>{
        //         // if(res.length  == 0){
        //         //     ctx.reply('немає ссилок')
        //         // }else{
        //         //     ctx.reply(res)
        //         // }
                
        //         // out = ''
        //         // for (let i of res){
        //         // ctx.reply(`${res.link}`)
        //         // if(bot.telegram.getChatMember(res.link_id, ctx.from.id)){
        //         //     getUser(ctx.from.id, (res) =>{
        //         //         updateCoin(ctx.from.id, res.coin+5)
        //         //     })
        //         // }
        // })
                 
        }else{
            ctx.reply(`Добрий день, ${ctx.from.first_name} ви були додані у базу данних`)
            addUser(ctx.from.id, 100)
        }
    })
})

bot.launch()