//chat
const socket = new WebSocket("ws://localhost:3000/ws");

let usernameSet = false;
let currentRoom = "general";

document.getElementById("usernameInput")
.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        setUsername();
    }
});

document.getElementById("roomInput")
.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        joinRoom();
    }
});

document.getElementById("msg")
.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

// connect to server
socket.onopen = () => {
    console.log("Connected to server");
};

// receive messages
socket.onmessage = (event) => {

    const messages = document.getElementById("messages");
    const li = document.createElement("li");

    const text = event.data;
    const splitIndex = text.indexOf(":");

    if (splitIndex !== -1) {

        const username = text.substring(0, splitIndex + 1);
        const message = text.substring(splitIndex + 1);

        li.innerHTML =
            "<strong>" + username + "</strong>" + message;

    } else {
        li.textContent = text;
    }

    messages.appendChild(li);

    messages.scrollTop = messages.scrollHeight;
};

// set username
function setUsername() {

    const input = document.getElementById("usernameInput");
    const username = input.value.trim();

    if (username === "") return;

    socket.send(JSON.stringify({
        type: "SetUsername",
        data: username
    }));

    usernameSet = true;

    document.getElementById("usernameSection").style.display = "none";
    document.getElementById("chatSection").style.display = "flex";
    document.getElementById("roomSection").style.display = "flex";
}

// join room
function joinRoom() {

    if (!usernameSet) return;

    const input = document.getElementById("roomInput");
    const room = input.value.trim();

    if (room === "") return;

    socket.send(JSON.stringify({
        type: "JoinRoom",
        data: room
    }));

    currentRoom = room;

    document.getElementById("currentRoom").textContent = room;

    document.getElementById("messages").innerHTML = "";

    input.value = "";
}

// send chat message
function sendMessage() {

    if (!usernameSet || socket.readyState !== WebSocket.OPEN) return;

    const input = document.getElementById("msg");
    const text = input.value.trim();

    if (text === "") return;

    socket.send(JSON.stringify({
        type: "Chat",
        data: text
    }));

    input.value = "";
}