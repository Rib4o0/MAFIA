const addNameButton = document.querySelector(".add");
const addNameAddition = document.querySelector(".nameAddition")
const addNameInput = document.querySelector(".nameInput")
const addNameCancel = document.querySelector(".cancel")
const participantsList = document.querySelector(".participants")
const addMorePlayersBtn = document.querySelector(".addMorePlayers");
let nameInputText = null;

const mainStatus = document.querySelector(".mainStatus");
const descStatus = document.querySelector(".descStatus");
const startBtn = document.querySelector(".start");
const statusContainer = document.querySelector(".status");
const playersGrid = document.querySelector(".players")
let dotsAdded = 0;
let dotInterval;
let breatheInterval;

const warning = document.querySelector(".warning");
let warningTimeout;

let enoughPlayers = false;
let numOfPlayers = 0;
let roles = [];
let names = [];
let mayorIndex = null;
let validRoleIndexes = [];
let mafiaVoting = false;
let sheriffVoting = false;
let doctorVoting = false;
let playersVoting = false;
let selectedByMafia;
let selectedByDoctor;

function init() {
    updatePlayerStatus();
    window.scrollTo(0, 0);
    // addParticipant("Rosen");
    // addParticipant("Kali");
    // addParticipant("Vesko");
    // addParticipant("Chris");
    // addParticipant("Lili");
    // addParticipant("Sofia");
}

addMorePlayersBtn.addEventListener("click", () => {
    addNameButton.click();
    addNameInput.focus();
})

addNameButton.addEventListener("click", () => {
    addNameAddition.classList.add("show");
    addNameButton.classList.add("hide");
    addNameInput.focus();
})

addNameCancel.addEventListener("click", () => {
    addNameAddition.classList.remove("show");
    addNameButton.classList.remove("hide");
    if (addNameCancel.classList.contains("confirm")) {
        if (nameInputText !== null && nameInputText !== "") {
            addParticipant(nameInputText);
            addNameInput.value = "";
            nameInputText = null;
            addNameCancel.classList.remove("confirm");
            addNameCancel.textContent = "+";
        }
    }
})

addNameInput.addEventListener("input", e => {
    nameInputText = e.target.value;
    if (e.target.value !== "") {
        addNameCancel.classList.add("confirm");
        addNameCancel.textContent = "✓";
    } else {
        addNameCancel.classList.remove("confirm");
        addNameCancel.textContent = "+";
    }
})

function addParticipant(name) {
    const person = document.createElement("div");
    person.dataset.index = numOfPlayers;
    numOfPlayers++;
    updatePlayerStatus()
    names.push(name);
    roles.push("civilian");
    person.classList.add("person");
    participantsList.insertBefore(person, addNameButton);
    const personName = document.createElement("div");
    personName.classList.add("name");
    personName.textContent = name;
    person.append(personName);
    const removePerson = document.createElement("button");
    removePerson.classList.add('remove');
    removePerson.textContent = "+";
    person.append(removePerson);
    removePerson.addEventListener("click", () => {
        person.remove();
        numOfPlayers--;
        names.splice(parseInt(person.dataset.index), 1);
        roles.pop();
        updatePlayerStatus();
    })
}

init();
updatePlayerStatus()

function updatePlayerStatus() {
    enoughPlayers = numOfPlayers >= 5;
    if (enoughPlayers) {
        clearInterval(dotInterval)
        dotsAdded = 0;
        statusContainer.classList.add("ready");
        mainStatus.textContent = "THE GAME IS ABOUT TO BEGIN!"
        descStatus.textContent = "Add more players if needed and click start.";
        startBtn.classList.remove("inactive");
    } else {
        clearInterval(dotInterval)
        dotsAdded = 0;
        statusContainer.classList.remove("ready");
        mainStatus.textContent = "Waiting for enough players to be added";
        descStatus.textContent = "You need at least 5 players to start.";
        startBtn.classList.add("inactive");
        dotInterval = setInterval(() => {
            if (!enoughPlayers) {
                mainStatus.textContent += ".";
                dotsAdded++;
                if (dotsAdded >= 4) {
                    dotsAdded = 0;
                    mainStatus.textContent = mainStatus.textContent.substring(0, mainStatus.textContent.length - 4);
                }
            }
        },500)
    }
}

startBtn.addEventListener("click", () => {
    if (enoughPlayers) {
        participantsList.classList.add("hideParticipants")
        statusContainer.classList.add("fullScreen");
        transition()
        breatheInterval = setInterval(transition, 10000);
        selectMayorDialog();
    }
    else warnMessage("Not Enough Players!");
})

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};


function warnMessage(message) {
    warning.textContent = message;
    warning.classList.add("show");
    if (warningTimeout) {
        clearTimeout(warningTimeout);
    }
    warningTimeout = setTimeout(function() {
        warning.classList.remove('show');
    }, 2500);
}

function selectMayorDialog() {
    mainStatus.textContent = "Pick a mayor";
    descStatus.textContent = "He will not be playing the game and only telling it"
    generatePlayerGrid();
    playersGrid.classList.add("show");
}

function generatePlayerGrid() {
    playersGrid.innerHTML = "";
    for (let i = 0; i < names.length; i++) {
        if (i !== mayorIndex) {
            let name = names[i];
            const player = document.createElement("div");
            player.textContent = name;
            player.classList.add("player");
            if (roles[i] === "dead") {
                player.classList.add("dead");
            }
            if (mafiaVoting) {
                if (roles[i] === "mafia") {
                    player.classList.add("special");
                }
            } else if (doctorVoting) {
                if (roles[i] === "doctor") {
                    player.classList.add("special");
                }
            } else if (sheriffVoting) {
                if (roles[i] === "sheriff") {
                    player.classList.add("special");
                }
            }
            playersGrid.append(player);
            player.addEventListener("click", () => {
                if (mayorIndex === null) {
                    mayorIndex = i;
                    roles[i] = "mayor";
                    assignRoles()
                    playersGrid.classList.remove("show");
                    transition()
                } else if (mafiaVoting) {
                    selectedByMafia = i;
                    playersGrid.classList.remove("show");
                    transition()
                    mafiaVoting = false;
                    doctorVote();
                } else if (doctorVoting) {
                    playersGrid.classList.remove("show");
                    selectedByDoctor = i;
                    playersGrid.classList.remove("show");
                    transition()
                    doctorVoting = false;
                    sheriffVote();
                } else if (sheriffVoting) {
                    playersGrid.classList.remove("show");
                    playerVote()
                } else if (playersVoting) {
                    playersGrid.classList.remove("show");
                }
            })
        }
    }
}

function transition() {
    statusContainer.classList.add("dramatic");
    setTimeout(() => {
        statusContainer.classList.remove("dramatic");
    }, 300)
}

function assignRoles() {
    for (let i = 0; i < roles.length; i++) {
        if (i !== mayorIndex) validRoleIndexes.push(i);
    }
    let numOfMafias = Math.floor((numOfPlayers - 1) / 4);
    for (let i = 0; i < numOfMafias; i++) {
        let rand = Math.floor(Math.random() * validRoleIndexes.length);
        let index = validRoleIndexes[rand];
        roles[index] = "mafia";
        validRoleIndexes.splice(rand,1);
    }
    let rand = Math.floor(Math.random() * validRoleIndexes.length);
    let index = validRoleIndexes[rand];
    roles[index] = "sheriff";
    validRoleIndexes.splice(rand,1);
    rand = Math.floor(Math.random() * validRoleIndexes.length);
    index = validRoleIndexes[rand];
    roles[index] = "doctor";
    validRoleIndexes.splice(rand,1);
    beginRoleReveal()
}

function beginRoleReveal() {
    mainStatus.textContent = "Time to reveal the roles!";
    descStatus.textContent = "Do not look at the screen unless you are told so.";
    const revealRolesBtn = document.createElement("button");
    revealRolesBtn.classList.add("revealButton");
    revealRolesBtn.textContent = "Reveal";
    statusContainer.append(revealRolesBtn)
    revealRolesBtn.addEventListener("click", () => {
        revealRolesBtn.remove();
        revealRoles(0);
        transition()
    })
}

function revealRoles(roleIndex) {
    if (roleIndex === mayorIndex) {
        revealRoles(roleIndex + 1);
    } else {
        if (roleIndex >= roles.length) preStart();
        else {
            let name = names[roleIndex];
            mainStatus.textContent = `${name} come to reveal your role`;
            descStatus.textContent = "Everyone else go away";
            const revealRolesBtn = document.createElement("button");
            revealRolesBtn.classList.add("revealButton");
            revealRolesBtn.textContent = "Reveal";
            statusContainer.append(revealRolesBtn)
            revealRolesBtn.addEventListener("click", () => {
                revealRolesBtn.remove();
                showRole(roleIndex);
                transition()
            })
        }
    }
}

function showRole(roleIndex) {
    let role = roles[roleIndex];
    let name = names[roleIndex];

    switch (role) {
        case "civilian":
            mainStatus.textContent = `${name} your role is... Civilian`;
            descStatus.textContent = "You have to vote out the mafia to win.";
            break;
        case "mafia":
            mainStatus.textContent = `${name} your role is... Mafia`;
            descStatus.textContent = "You have to kill the people to win. You have to kill all players to win.";
            break;
        case "doctor":
            mainStatus.textContent = `${name} your role is... Doctor`;
            descStatus.textContent = "You can save yourself and others from the mafia. You have to vote out the mafia to win.";
            break;
        case "sheriff":
            mainStatus.textContent = `${name} your role is... Sheriff`;
            descStatus.textContent = "You can choose another player and can check if they are the mafia or not. You have to vote out the mafia to win.";
            break;
    }
    const nextRoleBtn = document.createElement("button");
    nextRoleBtn.classList.add("revealButton");
    nextRoleBtn.textContent = "Next";
    statusContainer.append(nextRoleBtn)
    nextRoleBtn.addEventListener("click", () => {
        nextRoleBtn.remove();
        revealRoles(roleIndex + 1);
        transition()
    })
}

function preStart() {
    mainStatus.textContent = "Now that you all know your roles";
    descStatus.textContent = "Lets begin the fun part. From now on only the player can look at the screen.";
    const beginBtn = document.createElement("button");
    beginBtn.classList.add("revealButton");
    beginBtn.textContent = "Begin";
    statusContainer.append(beginBtn)
    beginBtn.addEventListener("click", () => {
        beginBtn.remove();
        mafiaVote();
    })
}
function mafiaVote() {
    mafiaVoting = true;
    mainStatus.textContent = "Wake up the mafia. And tell them to choose a target";
    descStatus.textContent = "Whoever the mafia picks click below to kill them";
    generatePlayerGrid();
    playersGrid.classList.add("show")
}

function doctorVote() {
    doctorVoting = true;
    mainStatus.textContent = "Wake up the doctor. And tell them to choose a who to save";
    descStatus.textContent = "Whoever the doctor picks click below to kill them";
    generatePlayerGrid();
    playersGrid.classList.add("show")
}

function sheriffVote() {

}

function playerVote() {

}

function summarize() {

}