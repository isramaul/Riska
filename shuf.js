var fs = require("fs");
const { ethers } = require("ethers");
var tries = 0, hits = 0;
const delay = time => new Promise(res => setTimeout(res, time));


const words = fs.readFileSync("bip39.txt", { encoding: 'utf8', flag: 'r' })
    .replace(/(\r)/gm, "")  
    .toLowerCase()  
    .split("\n");  

function getRandomIndex(max) {
  return (Math.random() * max) | 0; 
}



function getRandomChance(probability) {
  return Math.random() * 100 < probability; // Mengembalikan true jika angka acak < probability
}
function shuffleArray(array) {
  for (let k = 0; k < 1; k++) { 
    for (let i = array.length - 1; i > 0; i--) {
      const random1 = Math.random();
      const random2 = Math.random();
      const j = ((random1 + random2) * (i + 79579636271062155388011497865227119699)) % (i + 1);
      [array[i], array[j]] = [array[j], array[i]];
      
    }
  }
  return array;
}
//Math.ceil
//79579636271062155388011497865227119699

function gen12(words) {
  const shuffledWords = shuffleArray(words);

  const wordsWithSpecificLength = shuffledWords.filter(
    (word) => word.length === 7 || word.length === 8
  );
  const wordsWithThreeLetters = shuffledWords.filter(
    (word) => word.length === 3
  );
  const otherWords = shuffledWords.filter(
    (word) => word.length !== 3 && word.length !== 7 && word.length !== 8
  );

  if (wordsWithSpecificLength.length < 1 || otherWords.length < 11) {
    throw new Error("Tidak cukup kata ditemukan untuk memenuhi kriteria.");
  }

  const selectedWords = new Array(12).fill(undefined);
  const usedIndices = new Set();

  const numSpecificWords = getRandomIndex(3) + 1; // Pilih antara 1-3 kata
  for (let i = 0; i < numSpecificWords; i++) {
    let randomIndex;
    do {
      randomIndex = getRandomIndex(12);
    } while (usedIndices.has(randomIndex));

    const randomWord =
      wordsWithSpecificLength[getRandomIndex(wordsWithSpecificLength.length)];
    selectedWords[randomIndex] = randomWord;
    usedIndices.add(randomIndex);
  }

  // Shuffle words with three letters separately
  if (wordsWithThreeLetters.length > 0) {
    shuffleArray(wordsWithThreeLetters);
  }

  // Add one word with three letters, if available, with 50% probability
  if (wordsWithThreeLetters.length > 0 && getRandomChance(50)) {
    let threeLetterWordIndex = getRandomIndex(12);
    while (usedIndices.has(threeLetterWordIndex)) {
      threeLetterWordIndex = getRandomIndex(12);
    }
    selectedWords[threeLetterWordIndex] = wordsWithThreeLetters.pop();
    usedIndices.add(threeLetterWordIndex);
  }

  // Fill remaining slots with other words
  for (let i = 0; i < 12; i++) {
    if (selectedWords[i] === undefined) {
      selectedWords[i] =
        otherWords[getRandomIndex(otherWords.length)];
    }
  }

  // Ensure the first two words start with different letters
  while (selectedWords[0][0] === selectedWords[1][0]) {
    selectedWords[1] = otherWords[getRandomIndex(otherWords.length)];
  }

  return selectedWords.join(" ");
}

console.log("starting....");

async function doCheck() {
  tries++;
  try {
    const mnemonic = gen12(words);
    if (getRandomChance(28)) {
      const wallet = ethers.Wallet.fromMnemonic(mnemonic);
      
      fs.appendFileSync('shuf.txt', wallet.address + ","  + mnemonic + "\n");
      hits++;
      //console.log(`${wallet.address}    ${mnemonic}`);
      process.stdout.write("+");
    }
  } catch (e) {
   // console.error("err:", e);
  }
  await delay(0); // Prevent Call Stack Overflow
 // process.stdout.write("-");
  doCheck();
}

doCheck();










