import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;

async function main() {
  // if (!process.env.DATABASE_URL) {
  //   throw new Error("DATABASE_URL environment variable is not set.");
  // }

  // Modify the URL to properly handle the password and IPv6
  const dbUrl = new URL(process.env.DATABASE_URL);
  // Remove square brackets from IPv6 host if present
  const host = dbUrl.hostname.replace(/^\[(.+)\]$/, "$1");
  // Ensure the password is properly decoded
  const password = decodeURIComponent(dbUrl.password);
  // Rebuild the URL with the encoded password
  const modifiedUrl = `${dbUrl.protocol}//${
    dbUrl.username
  }:${encodeURIComponent(password)}@${host}:${dbUrl.port}${dbUrl.pathname}${
    dbUrl.search
  }`;

  console.log("Connecting to database...");
  const pool = new Pool({
    connectionString: modifiedUrl,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  console.log("Adding new assets...");

  try {
    // Additional cryptocurrencies
    // Initial asset definitions
    const assetData = [
      // Stocks
      { name: "Apple", symbol: "AAPL", type: "stock" },
      { name: "Microsoft", symbol: "MSFT", type: "stock" },
      { name: "Amazon", symbol: "AMZN", type: "stock" },
      { name: "Nvidia", symbol: "NVDA", type: "stock" },
      { name: "Alphabet Class A", symbol: "GOOGL", type: "stock" },
      { name: "Meta Platforms", symbol: "META", type: "stock" },
      { name: "Tesla", symbol: "TSLA", type: "stock" },
      { name: "Berkshire Hathaway", symbol: "BRK.B", type: "stock" },
      { name: "JPMorgan Chase", symbol: "JPM", type: "stock" },
      { name: "Eli Lilly", symbol: "LLY", type: "stock" },

      // Cryptocurrencies
      { name: "Bitcoin", symbol: "BTC", type: "cryptocurrency" },
      { name: "Ethereum", symbol: "ETH", type: "cryptocurrency" },
      { name: "Tether", symbol: "USDT", type: "cryptocurrency" },
      { name: "Binance Coin", symbol: "BNB", type: "cryptocurrency" },
      { name: "Solana", symbol: "SOL", type: "cryptocurrency" },
      { name: "XRP", symbol: "XRP", type: "cryptocurrency" },
      { name: "USDC", symbol: "USDC", type: "cryptocurrency" },
      { name: "Cardano", symbol: "ADA", type: "cryptocurrency" },
      { name: "Dogecoin", symbol: "DOGE", type: "cryptocurrency" },
      { name: "Toncoin", symbol: "TON", type: "cryptocurrency" },

      // ETFs
      { name: "SPDR S&P 500 ETF Trust", symbol: "SPY", type: "etf" },
      { name: "Invesco QQQ Trust", symbol: "QQQ", type: "etf" },
      { name: "iShares MSCI Emerging Markets ETF", symbol: "EEM", type: "etf" },
      { name: "Vanguard Total Stock Market ETF", symbol: "VTI", type: "etf" },
      { name: "ARK Innovation ETF", symbol: "ARKK", type: "etf" },

      // Commodities
      { name: "Gold", symbol: "XAU/USD", type: "commodity" },
      { name: "Brent Crude Oil", symbol: "BRN", type: "commodity" },
      { name: "WTI Crude Oil", symbol: "CL", type: "commodity" },
      { name: "Silver", symbol: "XAG/USD", type: "commodity" },
      { name: "Natural Gas", symbol: "NG", type: "commodity" },

      // Indices
      { name: "S&P 500", symbol: "SPX", type: "index" },
      { name: "NASDAQ 100", symbol: "NDX", type: "index" },
      { name: "Dow Jones Industrial Average", symbol: "DJI", type: "index" },
      { name: "Russell 2000", symbol: "RUT", type: "index" },
      { name: "DAX", symbol: "DAX", type: "index" },
    ];

    console.log("Clearing assets table...");
    await pool.query("DELETE FROM opinions")
    await pool.query("DELETE FROM assets");

    for (const asset of assetData) {
      // Check if the asset already exists by symbol
      const checkResult = await pool.query(
        "SELECT id FROM assets WHERE symbol = $1",
        [asset.symbol]
      );

      if (checkResult.rows.length === 0) {
        // Asset doesn't exist, so insert it
        await pool.query(
          "INSERT INTO assets (name, symbol, type, sentiment, prediction) VALUES ($1, $2, $3, $4, $5)",
          [
            asset.name,
            asset.symbol,
            asset.type,
            asset.sentiment,
            asset.prediction,
          ]
        );
        console.log(`Added ${asset.type} ${asset.name} (${asset.symbol})`);
      } else {
        console.log(`Asset ${asset.symbol} already exists, skipping`);
      }
    }

    console.log("New assets added successfully!");
  } catch (error) {
    console.error("Error adding new assets:", error);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
