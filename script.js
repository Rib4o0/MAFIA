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
let dotsAdded = 0;
let dotInterval;

const warning = document.querySelector(".warning");
let warningTimeout;

let enoughPlayers = false;
let numOfPlayers = 0;
let roles = [];
let names = [];

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
            numOfPlayers++;
            updatePlayerStatus()
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
        roles.pop();
        updatePlayerStatus();
    })
}

updatePlayerStatus()

function updatePlayerStatus() {
    enoughPlayers = numOfPlayers >= 2;
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
        statusContainer.classList.add("ready");
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
        for (let i = 0; i < (numOfPlayers - numOfPlayers % 4) / 4; i++) {
            let unassignedPlayer = true;
            while (unassignedPlayer) {
                let rand = Math.floor(Math.random() * numOfPlayers);
                if (roles[rand] === "civilian") {
                    roles[rand] = "mafia";
                    unassignedPlayer = false;
                }
            }
        }
        console.log(roles);
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