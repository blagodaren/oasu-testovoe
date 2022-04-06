`use strict`;

const addTodoBtn = document.getElementById("add-task-button");
const todoInput = document.getElementById("task-description");
const todosList = document.querySelector(".todos-wrapper");
const todoPriority = document.getElementById("todo-priority-select");
const completedFilter = document.getElementById("checkbox-completed");
const highFilter = document.getElementById("checkbox-high");
const mediumFilter = document.getElementById("checkbox-medium");
const lowFilter = document.getElementById("checkbox-low");
const requestURL = "http://127.0.0.1:3000/items";
const deleteURL = "http://127.0.0.1:3000/items/";
const xhr = new XMLHttpRequest();

let tasks;
let copyTasks = [];
let changeData;
let taskId;

updateServer();

class Task {
  constructor(description, priority = "Low") {
    this.description = description;
    this.done = false;
    this.priority = priority;
    this.date = new Date().toLocaleString();
    this.dateDone = "";
  }
}

const createTemplate = (task, index) => {
  return `
    <div class="todo-card id=${task.id}">
        <div class="todo-info">
            <p class="todo-card-priority">${task.priority}</p>
            <div class="todo-card-input">
            <p onclick="changeDescription(${index}, ${
    task.id
  })" class="todo-card-text">
            ${task.description}</p>
            </div>
            <p class="todo-card-date">Создано:
            ${task.date}
            </p>
            ${task.done ? `<p class='todo-card-date'>${task.dateDone}</p>` : ""}
        </div>
        ${
          !task.done
            ? `<div class="todo-buttons">
            <button onclick="completeTodo(${task.id})" class="fa fa-check fa-lg" id="done-task-button"></button>
            <button onclick="cancelTodo(${task.id})" class="fa fa-times fa-lg" id="cancel-task-button"></button>
            <button onclick="deleteTodo(${task.id})" class="fa fa-trash fa-lg" id="delete-task-button"></button>
        </div>`
            : `
            <div class="todo-buttons">
                <button onclick="deleteTodo(${task.id})" class="fa fa-trash fa-lg" id="delete-task-button"></button>
            </div>`
        }
    </div>
    `;
};

const fillTodoList = () => {
  todosList.innerHTML = "";
  if (
    tasks &&
    completedFilter.checked &&
    highFilter.checked &&
    mediumFilter.checked &&
    lowFilter.checked
  ) {
    tasks.forEach((item, index) => {
      todosList.innerHTML += createTemplate(item, index);
    });
    copyTasks = tasks;
  } else {
    copyTasks.forEach((item, index) => {
      todosList.innerHTML += createTemplate(item, index);
    });
  }
};

fillTodoList();

const completeTodo = (taskId) => {
  changeData = tasks.filter((item) => item.id === taskId);
  index = copyTasks.findIndex((item) => item.id === taskId);
  copyTasks[index].dateDone = `Выполнено: ${new Date().toLocaleString()}`;
  copyTasks[index].done = true;
  changeData[0].dateDone = `Выполнено: ${new Date().toLocaleString()}`;
  changeData[0].done = true;
  changeOnServer(changeData);
};

const cancelTodo = (taskId) => {
  changeData = tasks.filter((item) => item.id === taskId);
  index = copyTasks.findIndex((item) => item.id === taskId);
  copyTasks[index].dateDone = `Отменено: ${new Date().toLocaleString()}`;
  copyTasks[index].done = true;
  changeData[0].dateDone = `Отменено: ${new Date().toLocaleString()}`;
  changeData[0].done = true;
  changeOnServer(changeData);
};

const deleteTodo = (taskId) => {
  debugger;
  index = copyTasks.findIndex((item) => item.id === taskId);
  changeData = tasks.filter((item) => item.id === taskId);
  copyTasks.splice(index, 1);
  deleteOnServer(changeData);
};

let todoText = [];
let changeInput = [];

const changeDescription = (index, taskId) => {
  todoText = document.querySelectorAll(".todo-card-input");
  todoText[index].innerHTML = `<input
  type="text"
  id="task-description-change${taskId}"
  class = "description-change"
  placeholder="Введите задачу..."
/>
<button onclick="saveDescription(${index}, ${taskId})" class="fa fa-check fa-lg" id="done-task-button"></button>
`;
  changeInput[taskId] = document.getElementById(
    `task-description-change${taskId}`
  );
};

const saveDescription = (index, taskId) => {
  changeData = tasks.filter((item) => item.id === taskId);
  if (changeInput[taskId].value) {
    changeData[0].description = changeInput[taskId].value;
    changeOnServer(changeData);
  }
};

addTodoBtn.addEventListener("click", () => {
  if (todoInput.value) {
    curentTask = new Task(todoInput.value, todoPriority.value);
    addToServer(curentTask);
    todoInput.value = "";
  }
});

const filterTodoList = () => {
  copyTasks = [];
  if (completedFilter.checked)
    copyTasks = copyTasks.concat(tasks.filter((item) => item.done == true));
  if (highFilter.checked)
    copyTasks = copyTasks.concat(
      tasks.filter((item) => item.priority == "High" && item.done == false)
    );
  if (mediumFilter.checked)
    copyTasks = copyTasks.concat(
      tasks.filter((item) => item.priority == "Medium" && item.done == false)
    );
  if (lowFilter.checked)
    copyTasks = copyTasks.concat(
      tasks.filter((item) => item.priority == "Low" && item.done == false)
    );
  fillTodoList();
};

const todoSortDown = () => {
  if (
    tasks &&
    completedFilter.checked &&
    highFilter.checked &&
    mediumFilter.checked &&
    lowFilter.checked
  ) {
    tasks.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
  } else {
    copyTasks.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
  }
  fillTodoList();
};

const todoSortUp = () => {
  if (
    tasks &&
    completedFilter.checked &&
    highFilter.checked &&
    mediumFilter.checked &&
    lowFilter.checked
  ) {
    tasks.sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
  } else {
    copyTasks.sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
  }
  fillTodoList();
};

function updateServer() {
  fetch(requestURL)
    .then((response) => response.json())
    .then((json) => {
      tasks = json;
      fillTodoList();
    })
    .catch((error) => console.error(error));
}

const addToServer = (task) => {
  fetch(requestURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(task),
  });
  updateServer();
  fillTodoList();
  filterTodoList();
};

const deleteOnServer = (data) => {
  fetch(deleteURL + `${data[0].id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });
  updateServer();
  sleep(2000);
  filterTodoList();
  fillTodoList();
};

const changeOnServer = (changeData) => {
  fetch(`${deleteURL}${changeData[0].id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(changeData[0]),
  });
  updateServer();
  sleep(2000);
  filterTodoList();
  fillTodoList();
};
