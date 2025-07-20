import fs from "fs";
import path from "path";

export function Storage(stateKey) {
  const storage = {};
  const dir = path.join(process.cwd(), "./lib/data/tmp");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Directory created: ${dir}`);
  }
  const filePath = path.join(process.cwd(), `./lib/data/tmp/database.json`);
  return {
    save: (state) => {
      storage[stateKey] = state;
      fs.writeFileSync(filePath, JSON.stringify(storage, null, 2), "utf-8");
      console.log(`State saved to ${filePath}`);
      return storage[stateKey];
    },
    load: () => {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        try {
          Object.assign(storage, JSON.parse(fileContent));
        } catch (error) {
          console.error(`Error parsing JSON from ${filePath}:`, error);
        }
      }
      return (
        storage[stateKey] || {
          win: 0,
          lost: 0,
          totalWins: 0,
          totalLost: 0,
        }
      );
    },
  };
}
