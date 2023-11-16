const generateMessage = (username, text) => {
  return {
    username,

    text,
    createdAt: new Date().getTime(),
  };
};

const generateLocationMessage = (username, url) => {
  return {
    username,
    url: `https://google.com/maps?q=${url}`,
    createdAt: new Date().getTime(),
  };
};

module.exports = { generateMessage, generateLocationMessage };
