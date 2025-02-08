import "../scss/main.scss";

document.addEventListener("DOMContentLoaded", () => {
    const titleInput = document.getElementById("taskTitle");
    const descriptionInput = document.getElementById("taskDescription");
    const addTaskBtn = document.getElementById("addTask");

    addTaskBtn.addEventListener("click", async () => {
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();

        if (!title || !description) {
            alert("⚠️ Please fill in all fields");
            return;
        }

        // ✅ Debugging logs
        console.log("📤 Sending Request:", { title, description });

        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title, description })  // Ensure JSON is correctly formatted
            });

            const responseData = await response.json();
            console.log("📥 Response Received:", responseData); // Debug Response

            if (response.ok) {
                alert("✅ Task added successfully");
                window.location.href = "list.html";
            } else {
                alert(`❌ Failed to add task. Error: ${responseData.error}`);
            }

        } catch (error) {
            console.error("❌ Request Error:", error);
            alert("⚠️ Something went wrong. Check the console.");
        }
    });
});
