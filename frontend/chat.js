//chat
const socket = new WebSocket("ws://localhost:3000/ws");

let usernameSet = false;
let currentChannel = "general";
let currentServerId = null;

socket.onopen = () => {
    console.log("Connected to server");
};

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
socket.onmessage = (event) => {

    // parse JSON
    try {
        const data = JSON.parse(event.data);

        // handle room list updates
        if (data.type === "RoomList") {
            updateRoomList(data.data);
            return;
        }

        if (data.type === "ServerList") {
            updateServerList(data.data);
            return;
        }

        

    } catch (e) {
        // not JSON, treat as normal chat message
    }

    // *** normal chat message logic ***
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

    socket.send(JSON.stringify({ type: "GetServers" }));
    socket.send(JSON.stringify({ type: "GetRooms" }));

    socket.send(JSON.stringify({
        type: "GetServers"
    }));

    document.getElementById("usernameSection").style.display = "none";
    document.getElementById("chatSection").style.display = "flex";
    //document.getElementById("roomSection").style.display = "flex";
}

// join room
function joinRoom() {

    if (!usernameSet) return;

    const input = document.getElementById("roomInput");
    const channel = input.value.trim();

    if (channel === "") return;

    socket.send(JSON.stringify({
        type: "JoinRoom", 
        data: channel
    }));

    currentChannel = channel;

    document.getElementById("currentRoom").textContent = channel;

    document.getElementById("messages").innerHTML = "";

    input.value = "";

    setTimeout(() => {
        socket.send(JSON.stringify({ type: "GetRooms" }));
    }, 200);
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

// update room list in sidebar
function updateRoomList(channels) {

    const list = document.getElementById("roomList");

    if (!list) return; 

    list.innerHTML = "";

    channels.forEach(channel => {
        const li = document.createElement("li");

        li.textContent = "# " + channel;

        if (channel === currentChannel) {
            li.style.backgroundColor = "#40444b";
        }

        li.onclick = () => {
            joinRoomFromSidebar(channel);
        };

        list.appendChild(li);
    });
}

// join room when clicking from sidebar
function joinRoomFromSidebar(channelName) {

    if (!usernameSet) return;

    socket.send(JSON.stringify({
        type: "JoinRoom",
        data: channelName
    }));

    currentChannel = channelName;

    document.getElementById("currentRoom").textContent = channelName;

    document.getElementById("messages").innerHTML = "";
}


// create server
window.createServer = function() {
    console.log("Create server clicked");

    const input = document.getElementById("serverNameInput");
    const name = input.value.trim();

    if (name === "") return;

    socket.send(JSON.stringify({
        type: "CreateServer",
        data: name
    }));

    input.value = "";

    // request updated server list after a short delay
    setTimeout(() => {
        socket.send(JSON.stringify({ type: "GetServers" }));
    }, 200);
}

// join server by code
window.joinServer = function() {
    console.log("Join server clicked");

    const input = document.getElementById("serverCodeInput");
    const code = input.value.trim();

    if (code === "") return;

    socket.send(JSON.stringify({
        type: "JoinServer",
        data: code
    }));

    input.value = "";

    
    setTimeout(() => {
        socket.send(JSON.stringify({ type: "GetServers" }));
    }, 200);
}



// update server list in sidebar
function updateServerList(servers) {

    const list = document.getElementById("serverList");

    if (!list) return;

    list.innerHTML = "";

    if (servers.length > 0 && currentServerId === null) {
        currentServerId = servers[0][0];

        socket.send(JSON.stringify({
            type: "SwitchServer",
            data: currentServerId
        }));
    }

    servers.forEach(([id, name]) => {
        const li = document.createElement("li");

        li.textContent = name;

        if (id === currentServerId) {
            li.style.backgroundColor = "#5865f2";
        }

        li.onclick = () => {
            switchServer(id);
        };

        list.appendChild(li);
    });
}

function switchServer(serverId) {

    if (!usernameSet) return;

    socket.send(JSON.stringify({
        type: "SwitchServer",
        data: serverId
    }));

    currentServerId = serverId;
    
    setTimeout(() => {
        socket.send(JSON.stringify({ type: "GetRooms" }));
    }, 100);

    document.getElementById("messages").innerHTML = "";

    currentChannel = "general";

    document.getElementById("currentRoom").textContent = "general";

    document.getElementById("messages").innerHTML = "";

    // request updated channel list
    socket.send(JSON.stringify({
        type: "GetRooms"
    }));
}
