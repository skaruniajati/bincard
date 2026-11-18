const fs = require("fs");
const path = require("path");
const convert = require("heic-convert");

const publicDir = path.join(__dirname, "public");

async function convertAll() {
  const files = fs.readdirSync(publicDir);
  const heicFiles = files.filter((f) => f.toLowerCase().endsWith(".heic"));

  console.log(`Found ${heicFiles.length} HEIC files to convert to JPEG...`);

  for (let i = 0; i < heicFiles.length; i++) {
    const fileName = heicFiles[i];
    const baseName = path.parse(fileName).name;
    const jpgName = `${baseName}.jpg`;
    const jpgPath = path.join(publicDir, jpgName);

    // If already converted, skip
    if (fs.existsSync(jpgPath)) {
      console.log(`[${i + 1}/${heicFiles.length}] Already exists: ${jpgName}`);
      continue;
    }

    try {
      const inputBuffer = fs.readFileSync(path.join(publicDir, fileName));
      const outputBuffer = await convert({
        buffer: inputBuffer,
        format: "JPEG",
        quality: 0.85,
      });

      fs.writeFileSync(jpgPath, outputBuffer);
      console.log(`[${i + 1}/${heicFiles.length}] Converted: ${fileName} -> ${jpgName}`);
    } catch (err) {
      console.error(`Error converting ${fileName}:`, err.message);
    }
  }

  console.log("All HEIC conversions complete!");
}

convertAll().catch(console.error);
