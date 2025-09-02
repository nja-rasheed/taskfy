"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// ✅ Define Task type
type Task = {
  id: number;
  title: string;
  category: string;
  completed: boolean;
};

export default function Home() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
const [user, setUser] = useState<{ email?: string; id: string } | null>(null);

  const [taskName, setTaskName] = useState("");
  const [taskCategory, setTaskCategory] = useState("Personal");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState("Personal");

  // ✅ Check authentication
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        setLoading(false);
      }
    };

    getUser();
  }, [supabase, router]);

  // ✅ Fetch tasks
  useEffect(() => {
    if (!loading) {
      fetch("/api/tasks")
        .then((res) => res.json())
        .then((data: Task[]) => setTasks(data));
    }
  }, [loading]);

  // ✅ Group tasks by category
  const groupedTasks: Record<string, Task[]> = tasks.reduce((acc: Record<string, Task[]>, task: Task) => {
    const category = task.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(task);
    return acc;
  }, {});

  // ✅ Add Task
  const handleAddTask = async () => {
    if (!taskName.trim()) return;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: taskName, category: taskCategory }),
    });

    if (res.ok) {
      const addedTask: Task = await res.json();
      setTasks([...tasks, addedTask]);
      setTaskName("");
      setTaskCategory("Personal");
    }
  };

  // ✅ Edit Task
  const handleEditTask = async (id: number) => {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title: editText, category: editCategory }),
    });

    if (res.ok) {
      const updatedTask: Task = await res.json();
      setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)));
      setEditingId(null);
      setEditText("");
      setEditCategory("Personal");
    }
  };

  // ✅ Toggle Done/Undone
  const handleToggleDone = async (id: number, title: string, category: string, completed: boolean) => {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title, category, completed }),
    });

    if (res.ok) {
      const updatedTask: Task = await res.json();
      setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)));
    }
  };

  // ✅ Delete Task
  const handleDeleteTask = async (id: number) => {
    const res = await fetch("/api/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    }
  };

  // ✅ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Checking authentication...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-bold text-blue-700 mb-6">
        Welcome to Taskfy, {user?.email}
      </h1>

      <button
        onClick={handleLogout}
        className="mb-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Logout
      </button>

      {/* Input + Add Button */}
      <div className="flex flex-col gap-3 mb-10 w-full max-w-md">
        <input
          type="text"
          placeholder="Enter your task..."
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="flex-1 px-4 py-2 bg-white border-2 border-blue-400 rounded-xl shadow-md placeholder-black text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={taskCategory}
          onChange={(e) => setTaskCategory(e.target.value)}
          className="px-4 py-2 bg-white border-2 border-blue-400 rounded-xl shadow-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Personal">Personal</option>
          <option value="Work">Work</option>
          <option value="Shopping">Shopping</option>
          <option value="Study">Study</option>
          <option value="Other">Other</option>
        </select>

        <button
          onClick={handleAddTask}
          className="px-5 py-2 bg-blue-600 text-white font-medium rounded-xl shadow-md hover:bg-blue-700 transition"
        >
          Add Task
        </button>
      </div>

      {/* Grouped Task List */}
      <div className="w-full max-w-2xl space-y-6">
        {Object.keys(groupedTasks).map((category) => (
          <div key={category} className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-bold text-blue-700 mb-3">{category}</h3>
            <ul className="space-y-3">
              {groupedTasks[category].map((task) => (
                <li key={task.id} className="p-3 bg-blue-50 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between items-center gap-3">
                    {editingId === task.id ? (
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 px-2 py-1 border border-blue-300 rounded-lg"
                      />
                    ) : (
                      <span className={`flex-1 ${task.completed ? "line-through text-gray-500" : "text-blue-900"}`}>
                        {task.title}
                      </span>
                    )}

                    <span
                      className={`text-sm px-2 py-1 rounded-lg ${
                        task.completed ? "bg-green-200 text-green-700" : "bg-yellow-200 text-yellow-700"
                      }`}
                    >
                      {task.completed ? "✅ Completed" : "⏳ Pending"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-2">
                    {editingId === task.id ? (
                      <button
                        onClick={() => handleEditTask(task.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Save
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(task.id);
                            setEditText(task.title);
                            setEditCategory(task.category);
                          }}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                        >
                          Edit
                        </button>

                        {task.completed ? (
                          <button
                            onClick={() => handleToggleDone(task.id, task.title, task.category, false)}
                            className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                          >
                            Mark Undone
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleDone(task.id, task.title, task.category, true)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Mark Done
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
