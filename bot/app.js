const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

//import mijn bot token
const token = '6845014034:AAGMKAIqfpXuzahNhvgNMHQrOh7u8vlBUiU';
const bot = new TelegramBot(token, { polling: true });

//maak buttons om te kiezen
const initialKeyboard = {
  reply_markup: {
    inline_keyboard: [
      // [{ text: 'Current Price', callback_data: 'current_price' }],
      [{ text: 'Auto send price 1 min', callback_data: 'start_auto_price_1min' }],
      [{ text: 'Auto send price 10 min', callback_data: 'start_auto_price_10min' }],
      [{ text: 'Auto send price 30 min', callback_data: 'start_auto_price_30min' }],
      [{ text: 'Auto send price 1 hour', callback_data: 'start_auto_price_1hour' }],
    ],
  },
};

//button voor deactivatie van auto prijs messeging
const deactivateKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: 'Deactivate auto messaging', callback_data: 'deactivate_auto_messaging' }],
    ],
  },
};

//verwijderd buttons nadat die is geklikt
const deleteInitialKeyboardMessages = async (chatId, messageId) => {
  try {
    bot.deleteMessage(chatId, messageId);
  } catch (error) {
    console.error('Error deleting initial messages:', error.message);
    bot.sendMessage(chatId, 'Error deleting initial messages. Check the logs for details.');
  }
};

let currentKeyboard = initialKeyboard;
let intervalId;

//pakt de data van crypto coins via de link 
const getBitcoinPrice = async (chatId) => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,aptos,cosmos,arbitrum&vs_currencies=usd'

    );

    //tijd wanneer de bericht met prijs is gestuurd
    const currentDateAndTime = new Date();
    const options = {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: 'numeric',
    };

    const formattedDateAndTime = currentDateAndTime.toLocaleString(undefined, options);

    if (response.status === 200) {
      //data opslaan in een variabele
      const bitcoinPrice = response.data.bitcoin?.usd;
      const ethPrice = response.data.ethereum?.usd;
      const aptPrice = response.data.aptos?.usd;
      const atomPrice = response.data.cosmos?.usd;
      const arbPrice = response.data.arbitrum?.usd;

      //data versturen
      bot.sendMessage(chatId, `${formattedDateAndTime} 
Crypto Prices: 
      👉BTC $${bitcoinPrice}
      👉ETH $${ethPrice}
      👉APT $${aptPrice}
      👉ATOM $${atomPrice}
      👉ARB $${arbPrice}`);

      console.log(chatId, `${formattedDateAndTime} 
      Crypto Prices: 
      👉BTC $${bitcoinPrice}
      👉ETH $${ethPrice}
      👉APT $${aptPrice}
      👉ATOM $${atomPrice}
      👉ARB $${arbPrice}`);
    } else {
      bot.sendMessage(chatId, 'Failed to fetch crypto price.');
    }
  } catch (error) {
    console.error('Error fetching crypto price:', error.message);
    bot.sendMessage(chatId, 'Error fetching crypto price. Check the logs for details.');
  }
};

//als de start is geklikt krijg je buttons te kiezen
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to Crypto Price Bot! Choose your option:', initialKeyboard);
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const data = query.data;

  const sendCryptoPrices = () => {
        getBitcoinPrice(chatId);
  };

  const removeKeyboard = () => {
    bot.editMessageReplyMarkup({ chat_id: chatId, message_id: messageId });
  };

  const deactivateAutoMessaging = () => {
    clearInterval(intervalId);
    currentKeyboard = initialKeyboard; 
    bot.sendMessage(chatId, 'Auto messaging deactivated. Choose your option:', currentKeyboard);
  };


  // if (data === 'current_price') {
  //   sendCryptoPrices();
  // }
   if (data === 'start_auto_price_1min') {
    sendCryptoPrices();
    intervalId = setInterval(sendCryptoPrices, 60000); // 1 min
    currentKeyboard = deactivateKeyboard;
    removeKeyboard(chatId, messageId);
    deleteInitialKeyboardMessages(chatId, messageId);
    bot.sendMessage(chatId, 'You will get crypto prices every minute!', deactivateKeyboard);

  } else if (data === 'start_auto_price_10min') {
    sendCryptoPrices();
    intervalId = setInterval(sendCryptoPrices, 600000); // 10 minutes
    currentKeyboard = deactivateKeyboard;
    removeKeyboard(chatId, messageId);
    deleteInitialKeyboardMessages(chatId, messageId);
    bot.sendMessage(chatId, 'You will get crypto prices every 10 minutes!', deactivateKeyboard);

  } else if (data === 'start_auto_price_30min') {
    sendCryptoPrices();
    intervalId = setInterval(sendCryptoPrices, 1800000); // 30 minutes
    currentKeyboard = deactivateKeyboard;
    removeKeyboard(chatId, messageId);
    deleteInitialKeyboardMessages(chatId, messageId);
    bot.sendMessage(chatId, 'You will get crypto prices every 30 minutes!', deactivateKeyboard);


  } else if (data === 'start_auto_price_1hour') {
    sendCryptoPrices();
    intervalId = setInterval(sendCryptoPrices, 3600000); // 60 minutes (1 hour)
    currentKeyboard = deactivateKeyboard;
    removeKeyboard(chatId, messageId);
    deleteInitialKeyboardMessages(chatId, messageId);
    bot.sendMessage(chatId, 'You will get crypto prices every 1 hour!', deactivateKeyboard);


  } else if (data === 'deactivate_auto_messaging') {
    deactivateAutoMessaging(); // deactivate current auto messaging option
    currentKeyboard = deactivateKeyboard;
    deleteInitialKeyboardMessages(chatId, messageId);
  }
});

console.log('bot is alive');