// message send part
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector("button");

// location part
const $sendLocationButton = document.querySelector("#send-location");

// message part
const $messages = document.querySelector("#messages");

// templates
const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $locationTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const $sideBarTemplate = document.querySelector("#sidebar-template").innerHTML;

// options

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

const autoScroll = () => {
  if ($messages) {
    // New message element
    console.log($messages);
    const $newMessage = $messages.lastElementChild;
    console.log($newMessage);
    // height of the new message

    if ($newMessage) {
      const newMessageStyles = getComputedStyle($newMessage);
      const newMessageMargin = parseInt(newMessageStyles.marginBottom);
      const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

      // visible height
      const visibleHeight = $messages.offsetHeight;
      // Height of messages container
      const contentHeight = $messages.scrollHeight;

      // how far have i scrolled

      const scrollOffset = $messages.scrollTop + visibleHeight;

      if (contentHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
      }
    }
  }
};

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render($messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm:s a"),
  });
  autoScroll();
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationShareMessage", (location) => {
  console.log(location);
  const html = Mustache.render($locationTemplate, {
    username: location.username,
    url: location.url,
    createdAt: moment(location.createdAt).format("h:mm:s a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("roomData", ({ room, users }) => {
  // console.log(room, users);
  const html = Mustache.render($sideBarTemplate, {
    users: users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  const messageValue = $messageFormInput.value;

  if (messageValue.length) {
    socket.emit("sendMessage", messageValue, (error) => {
      $messageFormButton.removeAttribute("disabled");
      $messageFormInput.value = "";
      $messageFormInput.focus();
      if (error) {
        return console.log(error);
      }
      console.log("message delivered!");
    });
  } else {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
  }
});

$sendLocationButton.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    const coords = {
      latitude: latitude,
      longitude: longitude,
    };
    // sending event to server
    socket.emit("sendLocation", coords, () => {
      $sendLocationButton.removeAttribute("disabled");
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  console.log(error);
  if (error) {
    alert(error);
    location.href = "/";
  }
});
