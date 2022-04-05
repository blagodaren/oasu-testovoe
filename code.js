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
const deleteURL = "http://127.0.0.1:3000/items/:itemId";
const xhr = new XMLHttpRequest();

let tasks;
let copyTasks = [];

serverInit();
// const localStorage = () => {
//   let json = JSON.stringify(tasks);
//   xhr.open("POST", requestURL);
//   xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
//   xhr.send(json);
//   localStorage.setItem("tasks", JSON.stringify(tasks));
//   localStorage.setItem("copyTasks", JSON.stringify(copyTasks));
//   localStorage.setItem("priorities", JSON.stringify(priorities));
// };

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
    <div class="todo-card">
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
            <button onclick="completeTodo(${index})" class="fa fa-check fa-lg" id="done-task-button"></button>
            <button onclick="cancelTodo(${index})" class="fa fa-times fa-lg" id="cancel-task-button"></button>
            <button onclick="deleteTodo(${index})" class="fa fa-trash fa-lg" id="delete-task-button"></button>
        </div>`
            : `
            <div class="todo-buttons">
                <button onclick="deleteTodo(${index})" class="fa fa-trash fa-lg" id="delete-task-button"></button>
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
  } else {
    copyTasks.forEach((item, index) => {
      todosList.innerHTML += createTemplate(item, index);
    });
  }
};

fillTodoList();

const todoDate = document.querySelector(".todo-card-date");
let taskId;

const completeTodo = (index) => {
  taskId = copyTasks[index].id;
  copyTasks[index].dateDone = `Отменено: ${new Date().toLocaleString()}`;
  copyTasks[index].done = true;
  tasks.forEach((task, index) => {
    if (task.id == taskId) {
      task.dateDone = `Отменено: ${new Date().toLocaleString()}`;
      task.done = true;
    }
  });
  changeOnServer(taskId);
};

const cancelTodo = (index) => {
  taskId = copyTasks[index].id;
  copyTasks[index].dateDone = `Отменено: ${new Date().toLocaleString()}`;
  copyTasks[index].done = true;
  tasks.forEach((task, index) => {
    if (task.id == taskId) {
      task.dateDone = `Отменено: ${new Date().toLocaleString()}`;
      task.done = true;
    }
  });
  changeOnServer(taskId - 1);
};

const deleteTodo = (index) => {
  taskId = copyTasks[index].id;
  copyTasks.splice(index, 1);
  deleteOnServer(taskId);
  serverInit();
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
    tasks.push(curentTask);
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

function serverInit() {
  fetch(requestURL)
    .then((response) => response.json())
    .then((json) => {
      tasks = json;
      fillTodoList();
      copyTasks = tasks;
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
  serverInit();
};

const deleteOnServer = (index) => {
  fetch(deleteURL, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(tasks[index + 1]),
  });
  filterTodoList();
  serverInit();
};

const changeOnServer = (index) => {
  fetch(deleteURL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(tasks[index + 1]),
  });
  serverInit();
};
