// main.js

// Run the init() function when the page has loaded
window.addEventListener("DOMContentLoaded", init);
// Starts the program, all function calls trace back here
function init() {
    // add collapsible function to list titles
    addCollapsibleControls();
    // add correspondinng event listener when user want to add task
    let savedTasks = getTasksFromStorage();
    addTasksToDocument(savedTasks);
    addTasks();
}

/**
 * count number of tasks for each day
 * add task count to each day button.
 */
function taskCount(){
    let addBtns = document.getElementsByClassName("addBtn");
    const taskCount = {
        "Monday": 0,
        "Tuesday": 0,
        "Wednesday": 0,
        "Thursday": 0,
        "Friday": 0,
        "Saturday": 0,
        "Sunday": 0
    };
    Array.from(addBtns).forEach(btn =>{
        taskCount[btn.parentNode.id] = btn.parentNode.childElementCount-1; 
    });
    let lists = document.getElementsByClassName("collapsible");
    Array.from(lists).forEach(list =>{
        list.getElementsByTagName('span')[1].textContent = ` 
        (${taskCount[list.getElementsByTagName('span')[0].textContent]} Tasks,
        0 Done)
        `;
    });
}


/**
 * load tasks from local storage
 * @returns {Array<Object>} An array of tasks found in localStorage
 */
function getTasksFromStorage() {
    return JSON.parse(localStorage.getItem('savedTasks')) || [[],[],[],[],[],[],[]];
}

/**
 * Takes in an array of tasks and for each tasks creates a
 * new <task-card> element, adds the tasks data to that card
 * then appends that new task to it's coresponding days
 * @param {Array<Object>} savedTasks An array of tasks
 */
function addTasksToDocument(savedTasks) {
    // if no saved tasks return.
    if (savedTasks.length===0) return;    
    const dayIndex = {
        "Monday": 0,
        "Tuesday": 1,
        "Wednesday": 2,
        "Thursday": 3,
        "Friday": 4,
        "Saturday": 5,
        "Sunday": 6
    };
    let addBtns = document.getElementsByClassName("addBtn");
    const daysWithTasks = new Set();
    Array.from(addBtns).forEach(addBtn => {
        Array.from(savedTasks[dayIndex[addBtn.parentNode.id]]).forEach(task =>{
            let taskBoard = addBtn.parentNode;
            if(taskBoard.id==task["day"]){
                let newTask = document.createElement("task-card");
                // get new task id, == Monday0,Tuesday0,......
                let newTaskID = task["taskID"];
                // add <task-card> id = Monday0, Monday1,......
                newTask.setAttribute("id", newTaskID);
                newTask.data = task;
                taskBoard.insertBefore(newTask, addBtn);
                // add function to icons of new task
                addtaskFunction(newTaskID);
            }
            daysWithTasks.add(task["day"]);
            taskCount[task["day"]] += 1; // get task count for each day, need to divide by 7
        });
    });

    // initially uncollapse days with tasks
    let lists = document.getElementsByClassName("collapsible");
    for(const dayBtn of lists){
        if(daysWithTasks.has(dayBtn.getElementsByTagName('span')[0].textContent)){
            dayBtn.click();
        }
    }
    taskCount();
  }


/**
 * Takes in an array of recipes, converts it to a string, and then
 * saves that string to 'recipes' in localStorage
 * @param {Array<Object>} savedTasks An array of recipes
 */
function saveTasksToStorage(savedTasks) {
    localStorage.setItem('savedTasks',JSON.stringify(savedTasks));
  }

/**
 * Add collapsible controls to the element with collapsible class.
 * When user click on element, hidden sibling text element will be shown,
 * or expanded text element will be hidden. 
 */
function addCollapsibleControls(){
    // find all collapsible control element
    let lists = document.getElementsByClassName("collapsible");
    // when the control element is clicked 
    Array.from(lists).forEach(dailyList => {
        dailyList.addEventListener("click", (event) => {
            // find corresponding sibling text element
            let taskBoard = dailyList.nextElementSibling;
            // when task board is hidden, show the text board
            if (taskBoard.classList.contains("shrink")){
                taskBoard.classList.remove("shrink");
                taskBoard.classList.add("expand");
            }
            // when text board is shown, shrink the text board
            else{
                taskBoard.classList.add("shrink");
                taskBoard.classList.remove("expand");
            }
        });
    });

}

/**
 * Add event handler to all add buttons of each day's list. When user click add btn,
 * a new task div will appear
 */
function addTasks(task){
    let addBtns = document.getElementsByClassName("addBtn");
    Array.from(addBtns).forEach(addBtn => {
        addBtn.addEventListener("click", (event) => {
            // find corresponding sibling text element
            let taskBoard = addBtn.parentNode;
            let newTask = document.createElement("task-card");
            // get new task id, == Monday0,Tuesday0,......
            let newTaskID = taskBoard.id+ Math.floor(Math.random() * 99999)+(Math.random() + 1).toString(36).substring(7);
            // add <task-card> id = Monday0, Monday1,......
            newTask.setAttribute("id", newTaskID);
            if(task == null){
                task = {
                    "day": taskBoard.parentNode.id,
                    "taskID": newTaskID, 
                    "input":"", 
                    "checkBox":false,
                    "confirmDisable": false,
                    "inputDisable": false
                };
            }
            newTask.data = task;
            taskBoard.insertBefore(newTask, addBtn);
            // add function to icons of new task
            addtaskFunction(newTaskID);
        });
    });
    // count number of tasks after adding new tasks
}
/**
 * add delete, edit, confirm functionality to newly added task 
 */
function addtaskFunction(taskID){
    deleteTasks(taskID);
    editTasks(taskID);
    confirmTasks(taskID);
}

/**
 * give newest delete btn functionality to remove relevant task
 */
function deleteTasks(taskID){
    let taskBlock = document.getElementById(taskID);
    let shadowRoot = taskBlock.shadowRoot;
    let deleteBtn = shadowRoot.childNodes[0].getElementsByClassName("deleteBtn")[0];
    const dayIndex = {
        "Monday": 0,
        "Tuesday": 1,
        "Wednesday": 2,
        "Thursday": 3,
        "Friday": 4,
        "Saturday": 5,
        "Sunday": 6
    };
    deleteBtn.addEventListener("click", (event) => {
        // get current localStorage
        let localTasks = getTasksFromStorage();
        // splice out the deleted task in localstorage
        for(let i = 0; i< localTasks[dayIndex[taskBlock.parentNode.id]].length; i++){
            if(taskID===localTasks[dayIndex[taskBlock.parentNode.id]][i]["taskID"]){
                localTasks[dayIndex[taskBlock.parentNode.id]].splice(i, 1);
            }
        }
        
        // saved modified tasks to localstorage
        saveTasksToStorage(localTasks);
        taskBlock.remove();
        taskCount();
    });
}

/**
 * give newest edit btn functionality to edit relevant task input
 */
function editTasks(taskID){
    let taskBlock = document.getElementById(taskID);
    let shadowRoot = taskBlock.shadowRoot;
    let editBtn = shadowRoot.childNodes[0].getElementsByClassName("editBtn")[0];
    let input = shadowRoot.childNodes[0].getElementsByTagName("input")[1];
    let confirmBtn = shadowRoot.childNodes[0].getElementsByClassName("confirmBtn")[0];
    editBtn.addEventListener("click", (event) => {
        input.disabled = false;
        confirmBtn.disabled = false;
    });
}

/**
 * give newest confirm btn functionality to confirm and block user from change input 
 */
function confirmTasks(taskID){
    let taskBlock = document.getElementById(taskID);
    let shadowRoot = taskBlock.shadowRoot;
    let confirmBtn = shadowRoot.childNodes[0].getElementsByClassName('confirmBtn')[0];
    let input = shadowRoot.childNodes[0].getElementsByTagName('input')[1];
    const dayIndex = {
        "Monday": 0,
        "Tuesday": 1,
        "Wednesday": 2,
        "Thursday": 3,
        "Friday": 4,
        "Saturday": 5,
        "Sunday": 6
    };
    confirmBtn.addEventListener("click", (event) => {
        input.disabled = true;
        confirmBtn.disabled = true;
        let taskObject = {};
        taskObject = {
            "day": taskBlock.parentNode.id,
            "taskID": taskID, 
            "input":input.value, 
            "checkBox":shadowRoot.childNodes[0].getElementsByTagName('input')[0].checked,
            "confirmDisable": true,
            "inputDisable": true
        };

        let localTasks = getTasksFromStorage();
        let found = false;
        Array.from(localTasks[dayIndex[taskBlock.parentNode.id]]).forEach(task =>{
            if(taskID===task["taskID"]){
                task["input"] = input.value;
                task["checkBox"] = shadowRoot.childNodes[0].getElementsByTagName('input')[0].checked;
                found = true;
            }
        });
        if(found===false){
            localTasks[dayIndex[taskBlock.parentNode.id]].push(taskObject);
        }
        saveTasksToStorage(localTasks);
        taskCount();
    });
}

