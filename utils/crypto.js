const crypto = require('crypto');

// First we get our unique key to encrypt our object
const password = process.env.CRYPTO_PASSWORD;

// We then get our unique Initialization Vector
const iv =  Buffer.from(process.env.CRYPTO_IV);

// To be used as salt in encryption and decryption
const ivstring = iv.toString('hex').slice(0, 16);

// Function to find SHA1 Hash of password key
function sha1(input) {
    return crypto.createHash('sha1').update(input).digest();
}

//Function to get secret key for encryption and decryption using the password
function passwordDeriveBytes(pass, salt, iterations, len) {
    let key = Buffer.from(password + salt);
    for (let i = 0; i < iterations; i += 1) {
        key = sha1(key);
    }
    if (key.length < len) {
        const hx = passwordDeriveBytes(password, salt, iterations - 1, 20);
        for (let counter = 1; key.length < len; counter += 1) {
            key = Buffer.concat([key, sha1(Buffer.concat([Buffer.from(counter.toString()), hx]))]);
        }
    }
    return Buffer.alloc(len, key);
}

// Function to encode the object
async function encode(string) {
    const key = passwordDeriveBytes(password, '', 100, 32);
    // Initialize Cipher Object to encrypt using AES-256 Algorithm 
    const cipher = crypto.createCipheriv('aes-256-cbc', key, ivstring);
    const part1 = cipher.update(string, 'utf8');
    const part2 = cipher.final();
    const encrypted = Buffer.concat([part1, part2]).toString('base64');
    return encrypted;
}

// Function to decode the object
async function decode(string) {
    const key = passwordDeriveBytes(password, '', 100, 32);
    // Initialize decipher Object to decrypt using AES-256 Algorithm
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivstring);
    let decrypted = decipher.update(string, 'base64', 'utf8');
    decrypted += decipher.final();
    return decrypted;
}


module.exports={encode, decode};