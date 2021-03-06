const fs = require('fs');
const { getUnpackedSettings } = require('http2');
const fetch = require('node-fetch');

const { Client, Intents, MessageEmbed } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

let moai = false;

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isMessageComponent()) console.log('You Typed');

	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		console.log('pinged');
        const apiPingData = await fetch('https://api.mcsrvstat.us/2/dev.legitimoose.com')
            .then(data => data.json())
            .then(data => {return data});
        if (apiPingData.debug.ping) {
            const apiEmbed = new MessageEmbed()
                .setColor('#ffcceb')
                .setTitle('Ligitimoose is ONLINE:')
                .setTimestamp()
                .setFooter({ text: 'Courtesy of Towster'});
            await interaction.channel.send({ embeds: [apiEmbed] });
        } else {
            const apiEmbed = new MessageEmbed()
                .setColor('#ffcceb')
                .setTitle('Ligitimoose is NOT ONLINE:')
                .setTimestamp()
                .setFooter({ text: 'Courtesy of Towster'});
            await interaction.channel.send({ embeds: [apiEmbed] });
        }
	} else if (commandName === 'user') {
		await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
	} else if (commandName === 'bazzar') {
        await bazzar(interaction);
    } else if (commandName === 'moai') {
        interaction.channel.send('🗿🗿 Moyai Setting tured on 🗿🗿')
        if (moai) {
            moai = false;
        } else {
            moai = true;
        }
    }
});

client.on('messageCreate', message => {
    if (moai)
        message.react('🗿')
})

// Login to Discord with your client's token
client.login(token+'mWk');

const API_KEY = "8eaabdfe-c4ae-4566-bea2-34376adb8aa5";
const playerName = "Towster_"
const playerUUID = "20c0adea-5d08-4ce9-9cbb-5e3e88ebd7dd"

let apiData

const Utils = {
    readFile: function(path) {
        let apiData = fs.readFileSync(path, "utf-8", (err, data) => {
            if (err) { 
                console.log(err)
                return 0;
            }
            apiData = data;
        })
        return JSON.parse(apiData)
    },
    bazzarSellOffer: function(object) {
        return apiData.products[object].buy_summary[0].pricePerUnit
    },
    bazzarBuyOffer: function(object) {
        return apiData.products[object].sell_summary[0].pricePerUnit
    },
    bazzarBuyAnount: function(object) {
        return apiData.products[object].quick_status.buyVolume
    },
    bazzarSellAmount: function(object) {
        return apiData.products[object].quick_status.sellVolume
    },
    fetchBazzarAPI: async function() {
        const apiData = await fetch('https://api.hypixel.net/skyblock/bazaar')
            .then(data => data.json())
            .then(data => {return data});
        return apiData
    },
    setCharAt: function(str,index,chr) {
        if(index > str.length-1) return str;
        return str.substring(0,index) + chr + str.substring(index+1);
    },
    //From json to bazzar
    weirdNamings: [
        ['INK_SACK:3', 'INK_SACK'],
        ['INK_SACK:4', 'ENCHANTED_INK_SACK'],
        ['BAZAAR_COOKIE', 'BOOSTER_COOKIE'],
        ['ENCHANTED_CARROT_ON_A_STICK', 'ENCHANTED_CARROT_STICK'],
        ['RAW_FISH:1', 'RAW_FISH-1'],
        ['RAW_FISH:2', 'RAW_FISH-2'],
        ['RAW_FISH:3', 'RAW_FISH-3'],
        ['LOG:1', 'LOG-1'],
        ['LOG:2', 'LOG-2'],
        ['LOG_2:1', 'LOG_2-1'],
        ['LOG:3', 'LOG-3'],
    ],
    //From bazzar to json
    weirdNamings2: [
        ['INK_SACK', 'INK_SACK-3'],
        ['ENCHANTED_INK_SACK', 'INK_SACK-4'],
        ['BAZAAR_COOKIE', 'BOOSTER_COOKIE'],
        ['ENCHANTED_CARROT_ON_A_STICK', 'ENCHANTED_CARROT_STICK'],
        ['RAW_FISH:1', 'RAW_FISH-1'],
        ['RAW_FISH:2', 'RAW_FISH-2'],
        ['RAW_FISH:3', 'RAW_FISH-3'],
        ['LOG:1', 'LOG-1'],
        ['LOG:2', 'LOG-2'],
        ['LOG_2:1', 'LOG_2-1'],
        ['LOG:3', 'LOG-3'],
    ]
}

//Outputs the items needded for crafting in format [Item Name], [Item Amount], [Individual Sell Price || Not bazzar Buyable], [Individual Sell Speed/Amount sold per refresh || Not bazzar Buyable]. If there is not a valid json, it will output Not Craftable.  
const calculateCraft = async function(craftItem) {
    let itemData = Utils.readFile(`./NEU-REPO/items/${craftItem}.json`)
    if (itemdata == 0) {
        return 'Not Craftable'
    }
    let slotNames = [
        'A1',
        'A2',
        'A3',
        'B1',
        'B2',
        'B3',
        'C1',
        'C2',
        'C3',
    ]
    let craft = [];

    for (slot in slotNames) {
        if (itemData.recipe == null) return
        let item = itemData.recipe[slotNames[slot]].split(':')
        for (wierdName in Utils.weirdNamings2) {
            if (item[0] == Utils.weirdNamings2[wierdName][1])
                item[0] = Utils.weirdNamings2[wierdName][0]
        }
        let alreadyInCraft = false
        for (index in craft) {
            if (craft[index][0] == item[0]) {
                craft[index][1] += parseInt(item[1])
                alreadyInCraft = true;
            }
        }
        if (!alreadyInCraft && item[0] != '') {
            try {
                craft.push([item[0], parseInt(item[1]), Utils.bazzarBuyOffer(item[0]), Utils.bazzarSellAmount(item[0])])
            } catch {
                craft.push([item[0], parseInt(item[1]), 'Not Bazzar Buyable', 'Not Bazzar Buyable'])
            }
        }
    }
    return craft
}

const calculateFlip = async function(flipItem) {
    let buyPrice = 0;
    let craft = calculateCraft(flipItem)

    for (slot in craft) {
        
        if (itemData.recipe == 'Not Craftable') return 'Not Craftable'

        if (slot[2] != 'Not Bazzar Buyable')
            buyPrice += slot[1] * slot[2]
    }
    return Utils.bazzarSellOffer(flipitem) - buyPrice
}

const bazzar = async function(interaction) {
    let bazzarItemList = []
    
    apiData = await Utils.fetchBazzarAPI();
    for (value in apiData.products) {
        for (wierdName in Utils.weirdNamings) {
            if (value == Utils.weirdNamings[wierdName][0])
                value = Utils.weirdNamings[wierdName][1]
        }
        let flipValue = await calculateFlip(value)

        let craft = await calculateCraft(value);
        console.log(craft)
        let highestTimeToBuy = 0;
        for (item in craft) {
            if (highestTimeToBuy < craft[item][2]/craft[item][1]) {
                highestTimeToBuy = craft[item][2]/craft[item][1]
            }
        }

        if (flipValue != 'Not Craftable' && flipValue > 1000 && Utils.bazzarBuyAnount(value) > 2000) {
            bazzarItemList.push([Math.floor(flipValue * highestTimeToBuy), Utils.bazzarBuyAnount(value), value, Math.floor(flipValue)])
        }
            
    }
    bazzarItemList.sort(function(a, b) {
        return a[0] - b[0];
    });
    let bazzarItemObject = []
    console.log(bazzarItemList)
    for (let index = 0; index < 25; index ++) {
        bazzarItemObject.push({name: bazzarItemList[bazzarItemList.length + index - 25][2].toString().replaceAll('_', ' '), value: 'Margin: ' + bazzarItemList[bazzarItemList.length + index - 25][3].toString()})
    }
    const bazzarEmbed = new MessageEmbed()
        .setColor('#ffcceb')
        .setTitle('What you Should buy:')
        .addFields(bazzarItemObject)
        .setTimestamp()
        .setFooter({ text: 'Courtesy of Towster'});
    await interaction.channel.send({ embeds: [bazzarEmbed] });

    return true;
}