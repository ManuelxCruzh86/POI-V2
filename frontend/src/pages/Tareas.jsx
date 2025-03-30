import React, { useState } from "react";
import { Link } from "react-router-dom"; 
import { FaPlus, FaCheckCircle, FaTrash } from "react-icons/fa";

const Tareas = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (newTask.trim() === "") return;
    setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
    setNewTask("");
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-900 text-white">
        <nav className="w-full bg-gray-800 text-white py-4 px-6 fixed top-0 left-0 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
                    <img src="/conexxo.png" className="h-24 w-24 object-contain" alt="Logo" />
                    <h1 className="text-3xl font-bold">ConneXXo</h1>
                </div>
            <Link to="/" className="text-yellow-400 hover:text-yellow-300">← Volver al Inicio</Link>
        </nav>

      <div className="max-w-xl w-full p-6 bg-gray-800 shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold text-center mb-4 text-white">Gestión de Tareas</h2>
        
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            placeholder="Nueva tarea..." 
            value={newTask} 
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 p-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={addTask} 
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300">
            <FaPlus />
          </button>
        </div>
        
        <ul className="space-y-3">
          {tasks.map(task => (
            <li 
              key={task.id} 
              className={`flex justify-between items-center p-3 rounded-lg shadow-md ${task.completed ? "bg-green-600" : "bg-gray-700"}`}>
              <span className={`flex-1 ${task.completed ? "line-through text-gray-400" : "text-white"}`}>{task.text}</span>
              <div className="flex gap-2">
                <button onClick={() => toggleComplete(task.id)} className="text-green-400 hover:text-green-600">
                  <FaCheckCircle size={20} />
                </button>
                <button onClick={() => deleteTask(task.id)} className="text-red-400 hover:text-red-600">
                  <FaTrash size={20} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Tareas;
