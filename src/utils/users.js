const users = [];

// add user
// remove user
// get user
// get users in room

const addUser = ({ id, username, room }) => {
  console.log(id, username, room);
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate the data
  if (!username || !room) {
    return { error: "Username and room are required" };
  }

  // check for existing user

  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // validate username
  if (existingUser) {
    return { error: "username is in use" };
  }

  const user = { id, username, room };
  console.log(user);
  users.push(user);
  return { user, user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index != -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  console.log("id to find", id);
  return users.find((user) => user.id === id);
};

const getUserInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
};
