const bcrypt = require("bcrypt");
const saltRounds = 14;

const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const confirmPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const formatWelcome = (username) => {
  return { username, text: "Welcome to Bercord!", date: Date.now() };
};

const formatJoin = (username) => {
  const joinMessages = [
    `${username} just joined the server - glhf!`,
    `${username} just joined. Everyone, look busy!`,
    `${username} just joined. Can I get a heal?`,
    `${username} joined your party.`,
    `${username} joined. You must construct additional pylons.`,
    `Ermagherd. ${username} is here.`,
    `Welcome ${username}, Stay awhile and listen.`,
    `Welcome ${username}, We were expecting you ( ͡° ͜ʖ ͡°)`,
    `Welcome ${username}, We hope you brought pizza.`,
    `Welcome ${username}! Leave your weapons by the door.`,
    `A wild ${username} appeared.`,
    `Swoooosh.${username} just landed.`,
    `Brace yourselves.${username} just joined the server.`,
    `${username} just joined. Hide your bananas.`,
    `${username} just arrived. Seems OP - please nerf.`,
    `${username} just slid into the server.`,
    `A ${username} has spawned in the server.`,
    `Big ${username} showed up!`,
    `Where’s ${username}? In the server!`,
    `${username} hopped into the server. Kangaroo!!`,
    `${username} just showed up. Hold my beer.`,
  ];
  let randomNumber = Math.floor(Math.random() * joinMessages.length);
  return { username, text: joinMessages[randomNumber], date: Date.now() };
};

const formatMessage = (username, text) => {
  return {
    username,
    text,
    date: Date.now(),
  };
};

module.exports = {
  encryptPassword,
  confirmPassword,
  formatWelcome,
  formatJoin,
  formatMessage,
};
