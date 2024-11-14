const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

// Função para comprimir uma imagem usando TinyPNG
async function compressImage(imagePath) {
  const apiKey = "y4XYQtZJ7nRt646Kc0bTFjXcv1JTc85M"; // Substitua pela sua chave de API
  const imageData = fs.readFileSync(imagePath);

  try {
    const response = await axios.post(
      "https://api.tinify.com/shrink",
      imageData,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString(
            "base64"
          )}`,
          "Content-Type": "application/octet-stream",
        },
        responseType: "json",
      }
    );

    const compressedUrl = response.data.output.url;
    const compressedImage = await axios.get(compressedUrl, {
      responseType: "arraybuffer",
    });

    // Sobrescreva a imagem original com a comprimida
    fs.writeFileSync(imagePath, compressedImage.data);
    console.log(`Imagem comprimida com sucesso: ${imagePath}`);
  } catch (error) {
    console.error(`Erro ao comprimir ${imagePath}:`, error.message);
  }
}

// Função para percorrer todas as imagens
async function compressAllImages(dir) {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await fs.stat(filePath);

    if (stats.isDirectory()) {
      await compressAllImages(filePath);
    } else if (
      [".jpg", ".jpeg", ".png"].includes(path.extname(file).toLowerCase())
    ) {
      await compressImage(filePath);
    }
  }
}

// Diretório da pasta Games
const gamesDir = path.join(__dirname, "Games");

compressAllImages(gamesDir)
  .then(() => console.log("Todas as imagens foram comprimidas!"))
  .catch((error) => console.error("Erro geral:", error));
