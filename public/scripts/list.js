import "../styles/list.scss";

console.log("list of card script loaded.");

// Function for the onclick event for update status button
async function updateTaskStatus(taskId, taskTitle, taskDescription, taskIsCompleted) {
    //const taskId = task.id;
    const currentStatus = taskIsCompleted === 1 ? 0 : 1;  // Toggle the completion status

    const updatedTask = {
        title: taskTitle,
        description: taskDescription,
        isCompleted: currentStatus
    };

    // Perform the PUT request to update the task's status
    try {
        const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedTask)  // Ensure JSON is correctly formatted
        });

        const responseData = await response.json();
        console.log("📥 Response Received:", responseData); // Debug Response

        if (response.ok) {
            alert("✅ Task updated successfully");
            window.location.href = "list.html";
        } else {
            alert(`❌ Failed to update task. Error: ${responseData.error}`);
        }

    } catch (error) {
        console.error("❌ Request Error:", error);
        alert("⚠️ Something went wrong. Check the console.");
    }
}

// Function for the onclick event for delete task button
async function deleteTask(taskId) {
    // Perform the DELETE request to delete the task
    try {
        const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const responseData = await response.json();
        console.log("📥 Response Received:", responseData); // Debug Response

        if (response.ok) {
            alert("✅ Task deleted successfully");
            window.location.href = "list.html";
        } else {
            alert(`❌ Failed to delete task. Error: ${responseData.error}`);
        }

    } catch (error) {
        console.error("❌ Request Error:", error);
        alert("⚠️ Something went wrong. Check the console.");
    }
}


//When the page loads:
document.addEventListener("DOMContentLoaded", () => {

    const tasksListContainer = document.getElementById("tasksList");

    //fetch tasks from the server
    const fetchTasks = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/tasks");
            if (!response.ok) {
                throw new Error("Failed to fetch tasks");
            }

            const tasks = await response.json();

            renderTasks(tasks);

        } catch (error) {
            console.error("❌ Request Error:", error);
            alert("⚠️ Something went wrong. Check the console.");
        }
    };

    //render tasks to the DOM
    //For Jordan, from here you can edit the id, classes of the elements for the css
    const renderTasks = (tasks) => {
        if (tasks.length === 0) {
            tasksListContainer.innerHTML = "<p>No tasks found</p>";
            return;
        }

        //Some data may not need to be displayed (task id for example), you can remove it from the HTML
        const tasksListHTML = tasks.map((task) => {
            return `
                <div class="card">
                    <h2>${task.title}</h2>
                    <p>Task ID: ${task.id}</p>
                    <p>${task.description}</p>
                    <p>${task.isCompleted}</p>
                    <p>${new Date(task.created_at).toLocaleString()}</p>
                    <button class=updateStatusButton data-task-id=${task.id}>${task.isCompleted ? "Mark as Incomplete" : "Mark as Completed"}</button>
                    <button class=deleteTaskButton data-task-id=${task.id}>Delete Task</button>
                </div>
            `;
        }).join("");

        tasksListContainer.innerHTML = tasksListHTML;

        // Adding event listeners to all the update buttons
        const updateButtons = document.querySelectorAll(".updateStatusButton");
        updateButtons.forEach((button) => {
            const taskId = button.dataset.taskId;
            const task = tasks.find(t => t.id == taskId); // Find the corresponding task
            button.addEventListener("click", () => updateTaskStatus(task.id, task.title, task.description, task.isCompleted));
        });

        // Adding event listeners to all the delete buttons
        const deleteButtons = document.querySelectorAll(".deleteTaskButton");
        deleteButtons.forEach((button) => {
            const taskId = button.dataset.taskId; // Find the corresponding task
            button.addEventListener("click", () => deleteTask(taskId));
        });
    };


    fetchTasks();

});


