import "../styles/list.scss";

console.log("list of card script loaded.");

// Ensure modal and overlay are hidden by default when the page loads
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("editModal");
    const overlay = document.getElementById("editModalOverlay");

    if (modal && overlay) {
        modal.classList.remove("show");
        overlay.classList.remove("show");
        modal.style.display = "none";  // Ensure modal is hidden
        overlay.style.display = "none"; // Ensure overlay is hidden
    }
});

// Function to update task status dynamically
async function updateTaskStatus(taskId, button) {
    try {
        const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`);
        if (!response.ok) throw new Error("Failed to fetch task");

        const task = await response.json();
        const updatedTask = {
            title: task.title,
            description: task.description,
            isCompleted: task.isCompleted === 1 ? 0 : 1
        };

        const updateResponse = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTask)
        });

        if (updateResponse.ok) {
            button.textContent = updatedTask.isCompleted ? "Mark as Incomplete" : "Mark as Completed";
            button.classList.toggle("completed", updatedTask.isCompleted);
        } else {
            alert("❌ Failed to update task.");
        }
    } catch (error) {
        console.error("❌ Request Error:", error);
    }
}

// Function to delete a task
async function deleteTask(taskId) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
        const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
            document.querySelector(`[data-task-id="${taskId}"]`).remove();
        } else {
            alert("❌ Failed to delete task.");
        }
    } catch (error) {
        console.error("❌ Request Error:", error);
    }
}

// Function to open the edit modal
function openEditModal(task) {
    const modal = document.getElementById("editModal");
    const overlay = document.getElementById("editModalOverlay");

    document.getElementById("taskId").value = task.id;
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDescription").value = task.description;
    document.getElementById("taskCompleted").checked = task.isCompleted === 1;

    modal.classList.add("show");
    overlay.classList.add("show");

    modal.style.display = "flex";  // Ensure modal appears
    overlay.style.display = "block"; // Ensure overlay appears
}

// Function to close the modal when clicking the overlay
document.getElementById("editModalOverlay").addEventListener("click", () => {
    const modal = document.getElementById("editModal");
    const overlay = document.getElementById("editModalOverlay");

    modal.classList.remove("show");
    overlay.classList.remove("show");

    modal.style.display = "none";  // Ensure modal hides
    overlay.style.display = "none"; // Ensure overlay hides
});

// Fetch tasks and render them
document.addEventListener("DOMContentLoaded", async () => {
    const tasksListContainer = document.getElementById("tasksList");

    try {
        const response = await fetch("http://localhost:3000/api/tasks");
        if (!response.ok) throw new Error("Failed to fetch tasks");

        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error("❌ Request Error:", error);
    }

    function renderTasks(tasks) {
        if (tasks.length === 0) {
            tasksListContainer.innerHTML = "<p>No tasks found</p>";
            return;
        }

        tasksListContainer.innerHTML = tasks.map(task => `
            <div class="card" data-task-id="${task.id}">
                <h2>${task.title}</h2>
                <p>${task.description}</p>
                <p>${new Date(task.created_at).toLocaleString()}</p>

                <button class="updateStatusButton ${task.isCompleted ? "completed" : ""}" data-task-id="${task.id}">
                    ${task.isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
                </button>
                <button class="deleteTaskButton" data-task-id="${task.id}">Delete Task</button>
            </div>
        `).join("");

        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("click", (event) => {
                if (!event.target.classList.contains("updateStatusButton") &&
                    !event.target.classList.contains("deleteTaskButton")) {
                    const taskId = card.dataset.taskId;
                    const task = tasks.find(t => t.id == taskId);
                    openEditModal(task);
                }
            });
        });

        document.querySelectorAll(".updateStatusButton").forEach(button => {
            button.addEventListener("click", async (event) => {
                event.stopPropagation();
                const taskId = button.dataset.taskId;
                await updateTaskStatus(taskId, button);
            });
        });

        document.querySelectorAll(".deleteTaskButton").forEach(button => {
            button.addEventListener("click", async (event) => {
                event.stopPropagation();
                const taskId = button.dataset.taskId;
                await deleteTask(taskId);
            });
        });

        document.getElementById("saveTask").addEventListener("click", async () => {
            const taskId = document.getElementById("taskId").value;
            const updatedTitle = document.getElementById("taskTitle").value;
            const updatedDescription = document.getElementById("taskDescription").value;
            const updatedCompleted = document.getElementById("taskCompleted").checked ? 1 : 0;

            const updateResponse = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: updatedTitle, description: updatedDescription, isCompleted: updatedCompleted })
            });

            if (updateResponse.ok) {
                window.location.reload(); // Reload list after updating
            } else {
                alert("❌ Failed to update task.");
            }
        });
    }
});
