const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('public'))

app.use(bodyParser.json());

//render naar home paging
app.get('/', (req, res) => {
  renderHTML('./index.html', res);
});
//render naar telegram bot pagina
app.get('/tgBot', (req, res) => {
  renderHTML('./tgBot.html', res);
});

//render formulier
app.post('/prices-page', async (req, res) => {
  try {
    const { token } = req.body;
    //verwerkte data uit formulier in link plaatsen om een token te zoeken
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=usd`
    );
    
    let newTokenCheck = token;
    console.log(newTokenCheck);

    if (response.status === 200) {
      const tokenPrice = response.data[token]?.usd;

      //terug naam en prijs sturen 
      res.json({ token, tokenPrice });
    } else {
      console.error('Failed to fetch crypto prices. Response status:', response.status);
      res.status(response.status).json({ error: 'Failed to fetch crypto prices.' });
    }
  } catch (error) {
    console.error('Error processing data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//prijs van crypto coins 
app.get('/prices', async (req, res) => {
  try {
    console.log('Fetching crypto prices...');
    //libk met data van alle crypto coins
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,aptos,cosmos,arbitrum&vs_currencies=usd'
    );

    console.log('Response from Coingecko:', response.data);

    if (response.status === 200) {
      // de vallue van de link uitlezen en in een variable opslaan
      const bitcoinPrice = response.data.bitcoin?.usd;
      const ethPrice = response.data.ethereum?.usd;
      const aptPrice = response.data.aptos?.usd;
      const atomPrice = response.data.cosmos?.usd;
      const arbPrice = response.data.arbitrum?.usd;

      const prices = {
        bitcoin: bitcoinPrice,
        ethereum: ethPrice,
        aptos: aptPrice,
        cosmos: atomPrice,
        arbitrum: arbPrice,
      };
      

      console.log('stuur JSON:', prices);

      res.json({ prices });
    } else {
      console.error('Failed to fetch crypto prices. Response status:', response.status);
      res.status(response.status).json({ error: 'Failed to fetch crypto prices.' });
    }
  } catch (error) {
    console.error('Error fetching cryptocurrency prices:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use(bodyParser.urlencoded({ extended: true }));

//render prices page
app.get('/prices-page', (req, res) => {
  renderHTML('./prices.html', res);
});

app.post('/prices-page', (req, res) => {
  const formData = req.body;
  res.setHeader('Content-Type', 'text/plain');
  res.send(`Submitted Data: ${JSON.stringify(formData)}`);
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
app.use((req, res) => {     
  res.status(404).send('Route not defined');
});

function renderHTML(filePath, res) {
  const fullPath = path.join(__dirname, filePath);

  fs.readFile(fullPath, 'utf8', (error, data) => {
    if (error) {
      res.status(404).send('File not found!');
    } else {
      res.send(data);
    }
  });
}

