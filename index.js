const fs = require('fs');
const { getUnpackedSettings } = require('http2');
const fetch = require('node-fetch');

// // Require the necessary discord.js classes
// const discord = require('discord.js');
// const config = require('./config.json');

// // Create a new client instance
// const client = new discord.Client({ intents: [discord.Intents.FLAGS.GUILDS] });

// // When the client is ready, run this code (only once)
// client.once('ready', () => {
// 	console.log('Ready!');
// });

// // Login to Discord with your client's token
// client.login(config.token);

const readFile = function(path) {
    let apiData = fs.readFileSync(path, "utf-8", (err, data) => {
        if (err) { console.log(err) }
        apiData = data;
    })
    return JSON.parse(apiData)
}

const bazzarSellOffer = function(object) {
    return apiData.products[object].buy_summary[0].pricePerUnit
    
}

const bazzarBuyOffer = function(object) {
    return apiData.products[object].sell_summary[0].pricePerUnit
}

const instaSell = function(object) {
    return bazzarBuyOffer() * 1.125
}

const instaBuy = function(object) {
    return bazzarSellOffer() * 1.125
}

const calculateFlip = async function(flipItem) {
    const itemData = readFile(`./NEU-REPO/items/${flipItem}.json`)
    const unidefinedItemList = readFile('./bazzar_Item_List.json')
    let buyPrice = 0;
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

    for (slot in slotNames) {
        
        if (itemData.recipe == null) return 'Not Craftable'

        let item = itemData.recipe[slotNames[slot]].split(':')

            
        if (itemData.recipe[slotNames[slot]] != '')          
        {
            for (wierdName in weirdNamings2) {
                if (item[0] == weirdNamings2[wierdName][1])
                    item[0] = weirdNamings2[wierdName][0]
            }
            try {
                buyPrice += bazzarBuyOffer(item[0]) * item[1]
            } catch {
                if (unidefinedItemList[item[0]] != null) 
                    buyPrice += unidefinedItemList[item[0]]
                else
                    console.log('Cannot Craft: ' + flipItem + ' ' + item[0])
            }
        }

    }
    return apiData.products[flipItem].buy_summary[0].pricePerUnit - buyPrice
}

const fetchBazzarAPI = async function() {
    const apiData = await fetch('https://api.hypixel.net/skyblock/bazaar')
        .then(data => data.json())
        .then(data => {return data});
    return apiData
}

const API_KEY = "8eaabdfe-c4ae-4566-bea2-34376adb8aa5";
const playerName = "Towster_"
const playerUUID = "20c0adea-5d08-4ce9-9cbb-5e3e88ebd7dd"

let apiData

let weirdNamings = [
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
]

let weirdNamings2 = [
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

const main = async function() {
    apiData = await fetchBazzarAPI();

    let bazzarItemList = [];
    for (value in apiData.products) {
        for (wierdName in weirdNamings) {
            if (value == weirdNamings[wierdName][0])
                value = weirdNamings[wierdName][1]
        }
        let flipValue = await calculateFlip(value)
        if (flipValue != 'Not Craftable') bazzarItemList.push([value, flipValue])
    }

    console.log(bazzarItemList)
    

    console.log('Titanic: ' + (await calculateFlip('TITANIC_EXP_BOTTLE')))
    console.log('Grand: ' + (bazzarSellOffer('GRAND_EXP_BOTTLE') - bazzarBuyOffer('ENCHANTED_LAPIS_LAZULI') * 6))
    console.log('Tara Silk: ' + (bazzarSellOffer('TARANTULA_SILK') - ((bazzarBuyOffer('TARANTULA_WEB') * 128) + (bazzarBuyOffer('ENCHANTED_FLINT') * 32))));
}

main();