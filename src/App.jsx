import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load saved tasks when app starts
  useEffect(() => {
    const loadSavedTasks = async () => {
      try {
        const savedTasks = await invoke("load_tasks");
        const parsedTasks = JSON.parse(savedTasks);

        setTasks(parsedTasks);
      } catch (error) {
        console.error("Load tasks error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSavedTasks();
  }, []);

  // Save tasks using Rust
  const saveTasks = async (updatedTasks) => {
    try {
      await invoke("save_tasks", {
        tasks: JSON.stringify(updatedTasks),
      });
    } catch (error) {
      console.error("Save tasks error:", error);
    }
  };

  // Add new task
  const addTask = async () => {
    if (task.trim() === "") return;

    const newTask = {
      id: Date.now(),
      text: task,
      completed: false,
    };

    const updatedTasks = [...tasks, newTask];

    setTasks(updatedTasks);
    setTask("");

    await saveTasks(updatedTasks);
  };

  // Complete / Uncomplete task
  const toggleTask = async (id) => {
    const updatedTasks = tasks.map((item) =>
      item.id === id
        ? { ...item, completed: !item.completed }
        : item
    );

    setTasks(updatedTasks);

    await saveTasks(updatedTasks);
  };

  // Delete task
  const deleteTask = async (id) => {
    const updatedTasks = tasks.filter(
      (item) => item.id !== id
    );

    setTasks(updatedTasks);

    await saveTasks(updatedTasks);
  };

  // Add task using Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  const completedTasks = tasks.filter(
    (item) => item.completed
  ).length;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Arial",
        }}
      >
        Loading tasks...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center" }}>
          RustyTodo
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
          }}
        >
          Simple Desktop Todo App
        </p>

        {/* Add Task */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "25px",
          }}
        >
          <input
            type="text"
            placeholder="Enter your task..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "16px",
            }}
          />

          <button
            onClick={addTask}
            style={{
              padding: "12px 20px",
              backgroundColor: "#222",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>

        {/* Task Counter */}
        <div
          style={{
            marginTop: "25px",
            marginBottom: "15px",
            color: "#555",
          }}
        >
          Total: {tasks.length} | Completed: {completedTasks}
        </div>

        {/* Task List */}
        {tasks.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#999",
              padding: "30px",
            }}
          >
            No tasks yet. Add your first task!
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {tasks.map((item) => (
              <li
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px",
                  marginBottom: "10px",
                  backgroundColor: "#f8f8f8",
                  borderRadius: "6px",
                  border: "1px solid #eee",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flex: 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleTask(item.id)}
                  />

                  <span
                    style={{
                      textDecoration: item.completed
                        ? "line-through"
                        : "none",
                      color: item.completed
                        ? "#999"
                        : "#222",
                    }}
                  >
                    {item.text}
                  </span>
                </div>

                <button
                  onClick={() => deleteTask(item.id)}
                  style={{
                    padding: "7px 12px",
                    backgroundColor: "#e74c3c",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;