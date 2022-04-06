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
            <p onclick="changeDescription(${index})" class="todo-card-text">
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

// tasks.find(task => task.id === index + 1).id

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
  } else {
    copyTasks.forEach((item, index) => {
      todosList.innerHTML += createTemplate(item, index);
    });
  }
};

fillTodoList();

const todoDate = document.querySelector(".todo-card-date");
let taskId;

const completeTodo = (taskId) => {
  changeData = tasks.filter((item) => item.id === taskId);
  changeData[0].dateDone = `Выполнено: ${new Date().toLocaleString()}`;
  changeData[0].done = true;
  changeOnServer(changeData);
};

const cancelTodo = (taskId) => {
  changeData = tasks.filter((item) => item.id === taskId);
  changeData[0].dateDone = `Отменено: ${new Date().toLocaleString()}`;
  changeData[0].done = true;
  changeOnServer(changeData);
};

const deleteTodo = (taskId) => {
  console.log(taskId);
  changeData = tasks.filter((item) => item.id === taskId);
  console.log(changeData[0].id);
  deleteOnServer(changeData);
};

let todoText = [];
let changeInput = [];
let changeInputs;

const changeDescription = (index) => {
  todoText = document.querySelectorAll(".todo-card-input");
  tempIndex = index + 1;
  todoText[index].innerHTML = `<input
  type="text"
  id="task-description-change"
  class = "description-change"
  placeholder="Введите задачу..."
/>
<button onclick="saveDescription(${index})" class="fa fa-check fa-lg" id="done-task-button"></button>
`;
  changeInputs = document.querySelectorAll(".description-change");
};

const saveDescription = (index) => {
  tasks[index].description = changeInputs[index].value;
  todoText[
    index
  ].innerHTML = `<p onclick="changeDescription(${index})" class="todo-card-text">
  ${tasks[index].description}</p>`;
  updateServer();
};

addTodoBtn.addEventListener("click", () => {
  if (todoInput.value) {
    curentTask = new Task(todoInput.value, todoPriority.value);

    addToServer(curentTask);
    fillTodoList();
    filterTodoList();
    todoInput.value = "";
  }
});

const filterTodoCopy = (priority, flag) => {
  if (flag) {
    copyTasks = copyTasks.concat(
      tasks.filter((item, index) => {
        return tasks[index].priority == priority && tasks[index].done == false;
      })
    );
  }
};

const isAllCheckBoxChecked = () => {
  if (
    completedFilter.checked &&
    highFilter.checked &&
    mediumFilter.checked &&
    lowFilter.checked
  ) {
    copyTasks = tasks;
  }
};

const filterTodoList = () => {
  copyTasks = [];
  if (completedFilter.checked) {
    copyTasks = copyTasks.concat(
      tasks.filter((item, index) => {
        return tasks[index].done == true;
      })
    );
  }
  filterTodoCopy("High", highFilter.checked);
  filterTodoCopy("Medium", mediumFilter.checked);
  filterTodoCopy("Low", lowFilter.checked);
  isAllCheckBoxChecked();
  fillTodoList();
};

sortFlag = true;

const todoSort = () => {
  if (sortFlag) {
    if (copyTasks.length == 0) {
      tasks.sort(function (a, b) {
        let dateA = new Date(a.date).getTime();
        let dateB = new Date(b.date).getTime();
        return dateA < dateB ? 1 : -1;
      });
      fillTodoList();
    } else {
      copyTasks.sort(function (a, b) {
        let dateA = new Date(a.date).getTime();
        let dateB = new Date(b.date).getTime();
        return dateA < dateB ? 1 : -1;
      });
      fillTodoList();
    }
  } else {
    if (copyTasks.length == 0) {
      tasks.sort(function (a, b) {
        let dateA = new Date(a.date).getTime();
        let dateB = new Date(b.date).getTime();
        return dateA > dateB ? 1 : -1;
      });
      fillTodoList();
    } else {
      copyTasks.sort(function (a, b) {
        let dateA = new Date(a.date).getTime();
        let dateB = new Date(b.date).getTime();
        return dateA > dateB ? 1 : -1;
      });
      fillTodoList();
    }
  }
  sortFlag = !sortFlag;
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
};

const deleteOnServer = (data) => {
  console.log(data[0].id);
  fetch(deleteURL + `${data[0].id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });
  filterTodoList();
  updateServer();
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
};
