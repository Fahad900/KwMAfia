let players = []; // قائمة اللاعبين
let roles = ["مافيا", "الطبيب", "المحقق", "مدني"]; // الأدوار المتاحة
let assignedRoles = {}; // تخزين الأدوار لكل لاعب
let currentPlayerIndex = 0; // تتبع اللاعب الحالي
let investigatorPlayer = null; // تحديد المحقق

// عناصر HTML
const roleName = document.getElementById("role-name");
const roleImage = document.getElementById("role-image");
const nextTurnButton = document.getElementById("next-turn");
const askPlayerSelect = document.getElementById("ask-player-select");
const askButton = document.getElementById("ask-button");
const askResult = document.getElementById("ask-result");
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const voteList = document.getElementById("vote-list");

// إضافة اللاعبين
document.getElementById("add-player").addEventListener("click", () => {
    const playerName = document.getElementById("player-name").value.trim();
    if (playerName === "") return alert("يرجى إدخال اسم اللاعب.");

    players.push(playerName);

    const listItem = document.createElement("li");
    listItem.textContent = playerName;
    document.getElementById("player-list").appendChild(listItem);

    document.getElementById("player-name").value = "";

    if (players.length >= 4) {
        document.getElementById("start-game").disabled = false;
    }
});

// بدء اللعبة
document.getElementById("start-game").addEventListener("click", startGame);

function startGame() {
    currentPlayerIndex = 0;
    assignedRoles = assignRolesToPlayers();
    investigatorPlayer = getInvestigator();
    document.getElementById("player-setup").style.display = "none";
    document.getElementById("game-play").style.display = "block";
    startTurn();
}

function assignRolesToPlayers() {
    let assigned = {};
    let rolesToAssign = [...roles];

    players.forEach(player => {
        if (rolesToAssign.length === 0) {
            assigned[player] = "مدني";
        } else {
            let randomIndex = Math.floor(Math.random() * rolesToAssign.length);
            assigned[player] = rolesToAssign[randomIndex];
            rolesToAssign.splice(randomIndex, 1);
        }
    });
    return assigned;
}

function getInvestigator() {
    return Object.keys(assignedRoles).find(player => assignedRoles[player] === "المحقق");
}

function startTurn() {
    if (currentPlayerIndex >= players.length) {
        startDayPhase();
        return;
    }

    const playerName = players[currentPlayerIndex];
    const role = assignedRoles[playerName];

    alert(`${playerName}, مرر الجهاز لكشف دورك. اضغط موافق لعرض الدور.`);

    roleName.textContent = `دور ${playerName}`;
    roleImage.src = getRoleImage(role);
    roleImage.style.display = "block";
    nextTurnButton.style.display = "block";

    currentPlayerIndex++;
}

nextTurnButton.addEventListener("click", () => {
    roleImage.style.display = "none";
    roleName.textContent = "";
    nextTurnButton.style.display = "none";

    if (players[currentPlayerIndex - 1] === investigatorPlayer) {
        enableInvestigatorMode();
    } else {
        startTurn();
    }
});

function enableInvestigatorMode() {
    askPlayerSelect.innerHTML = "";

    players.forEach((player, index) => {
        if (player !== investigatorPlayer) {
            let option = document.createElement("option");
            option.value = index;
            option.textContent = player;
            askPlayerSelect.appendChild(option);
        }
    });

    document.getElementById("investigator-mode").style.display = "block";
}

askButton.addEventListener("click", () => {
    const selectedPlayerIndex = askPlayerSelect.value;
    const selectedPlayerName = players[selectedPlayerIndex];
    const role = assignedRoles[selectedPlayerName];

    if (role === "مافيا") {
        askResult.textContent = `${selectedPlayerName} هو مافيا.`;
    } else {
        askResult.textContent = `${selectedPlayerName} هو مواطن.`;
    }

    setTimeout(() => {
        document.getElementById("investigator-mode").style.display = "none";
        askResult.textContent = "";
        startTurn();
    }, 3000);
});

function startDayPhase() {
    alert("مرحلة النهار: يمكنكم الآن النقاش والتصويت!");
    enableVotingAndChatMode();
}

function enableVotingAndChatMode() {
    voteList.innerHTML = "";

    // إضافة خيار "عدم التصويت"
    let noVoteOption = document.createElement("li");
    noVoteOption.innerHTML = `
        <input type="radio" name="vote" value="no-vote" id="no-vote">
        <label for="no-vote">عدم التصويت</label>
    `;
    voteList.appendChild(noVoteOption);

    // إضافة الخيارات للاعبين
    players.forEach((player, index) => {
        let listItem = document.createElement("li");
        listItem.innerHTML = `
            <input type="radio" name="vote" value="${index}" id="player-${index}">
            <label for="player-${index}">${player}</label>
        `;
        voteList.appendChild(listItem);
    });

    document.getElementById("chat-voting-area").style.display = "block";
}

document.getElementById("send-chat").addEventListener("click", () => {
    if (chatInput.value.trim() === "") {
        alert("يرجى كتابة رسالة قبل الإرسال.");
        return;
    }

    const message = document.createElement("li");
    message.textContent = `${players[currentPlayerIndex]}: ${chatInput.value}`;
    chatMessages.appendChild(message);

    chatInput.value = "";
});

document.getElementById("submit-vote").addEventListener("click", () => {
    const selectedVote = document.querySelector('input[name="vote"]:checked');

    if (!selectedVote) {
        alert("يرجى اختيار أحد الخيارات للتصويت.");
        return;
    }

    const voteValue = selectedVote.value;
    const message = document.createElement("li");

    if (voteValue === "no-vote") {
        message.textContent = `${players[currentPlayerIndex]} اختار: عدم التصويت.`;
    } else {
        const votedPlayer = players[voteValue];
        message.textContent = `${players[currentPlayerIndex]} قام بالتصويت ضد: ${votedPlayer}`;
    }

    chatMessages.appendChild(message);
    document.getElementById("chat-voting-area").style.display = "none";
    startTurn();
});

function getRoleImage(role) {
    if (role === "مافيا") return "images/Mafia.png";
    if (role === "الطبيب") return "images/doctor.png";
    if (role === "المحقق") return "images/Investigator.png";
    return "images/civilian.png";
}
