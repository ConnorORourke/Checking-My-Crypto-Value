const fetch = require("node-fetch");
const express = require("express");
const app = express();

crypto = {
  [process.env.t]: {
    BTC: process.env.tBTC,
  },
  [process.env.c]: {
    BTC: process.env.cBTC,
    ETH: process.env.cETH,
    NANO: process.env.cNANO,
  },
  [process.env.e]: {
    BTC: process.env.eBTC,
    ETH: process.env.eETH,
    NANO: process.env.eNANO,
  },
};

const getPrice = async (amountsObj) => {
  let currentValues = {};
  try {
    let data = await fetch("https://api.coindesk.com/v1/bpi/currentprice.json");
    data = await data.json();
    let currentBtcValue = data["bpi"]["GBP"]["rate_float"];
    for (let currency of Object.keys(amountsObj)) {
      if (currency === "BTC") {
        currentValues = {
          ...currentValues,
          [currency]: currentBtcValue * amountsObj[currency],
        };
      } else {
        let res = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${currency}BTC`
        );
        let currencyToBtcObj = await res.json();
        let currencyToBtcPrice = currencyToBtcObj["price"];
        currentValues = {
          ...currentValues,
          [currency]:
            currencyToBtcPrice * currentBtcValue * amountsObj[currency],
        };
      }
    }
    currentValues["TOTAL"] = Object.keys(currentValues).reduce(
      (acc, currency) => acc + currentValues[currency],
      0
    );
    return currentValues;
  } catch (err) {
    console.log(err);
  }
};

app.get("/:name", async (req, res) => {
  let name = req.params.name;
  let amountsObj = crypto[name];
  if (amountsObj) {
    let currentValues = await getPrice(amountsObj);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(currentValues);
  }
  return res.send("Name not recognised");
});

const server = app.listen(8080, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`App listening at http://${host}:${port}`);
});
