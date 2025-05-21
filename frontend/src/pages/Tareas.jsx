import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaCheckCircle, FaTrash, FaClock, FaExclamationTriangle, FaSpinner } from "react-icons/fa";

const Tareas = () => {
  // Estados para las tareas
  const [myTasks, setMyTasks] = useState([]);
  const [othersTasks, setOthersTasks] = useState([]);
  const [expiredTasks, setExpiredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fecha_limite: "",
    puntuacion: 10
  });
  
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Obtener IDs del localStorage
  const grupo_id = localStorage.getItem("tempGroupId");
  const creador_id = localStorage.getItem("userId");

  // Obtener tareas del grupo
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (!grupo_id) {
          throw new Error("No se encontró el ID del grupo");
        }
        const userId= localStorage.getItem("userId");

        const response = await fetch(`https://1822-200-68-188-0.ngrok-free.app/auth/tareas/${grupo_id}/${userId}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Error al obtener tareas");
        }

        // Clasificar tareas
        classifyTasks(data.data);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [grupo_id, success]); // Se ejecuta cuando cambia el grupo_id o hay un éxito en el formulario

  // Clasificar tareas en mis tareas, tareas de otros y caducadas
  const classifyTasks = (tasks) => {
    const now = new Date();
    const userId = parseInt(creador_id);
    
    const myTasksTemp = [];
    const othersTasksTemp = [];
    const expiredTasksTemp = [];

    tasks.forEach(task => {
      const dueDate = new Date(task.fecha_limite);
      const isExpired = !task.completada && dueDate < now;
      const isMine = task.creador_id === userId;

      const taskObj = {
        id: task.id,
        text: task.titulo,
        description: task.descripcion,
        completed: task.completada === 1,
        dueDate: task.fecha_limite,
        creator: task.creador_nombre,
        creatorId: task.creador_id,
        puntos: task.puntos
      };

      if (isExpired) {
        expiredTasksTemp.push(taskObj);
      } else if (isMine) {
        myTasksTemp.push(taskObj);
      } else {
        othersTasksTemp.push(taskObj);
      }
    });

    setMyTasks(myTasksTemp);
    setOthersTasks(othersTasksTemp);
    setExpiredTasks(expiredTasksTemp);
  };

  // Validar datos antes de enviar
  const validateForm = () => {
    if (!formData.titulo.trim()) {
      setFormError("El título es requerido");
      return false;
    }
    
    if (formData.puntuacion < 1 || formData.puntuacion > 100) {
      setFormError("La puntuación debe ser entre 1 y 100");
      return false;
    }
    
    if (!grupo_id || !creador_id) {
      setFormError("No se encontró información del grupo o usuario");
      return false;
    }
    
    return true;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);

    if (!validateForm()) return;

    setFormLoading(true);

    try {
      const response = await fetch("https://1822-200-68-188-0.ngrok-free.app/auth/create/tarea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          grupo_id,
          creador_id,
          fecha_limite: formData.fecha_limite,
          puntuacion: formData.puntuacion
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear tarea");
      }

      setSuccess(true);
      setFormData({ 
        titulo: "", 
        descripcion: "", 
        fecha_limite: "",
        puntuacion: 10 
      });

    } catch (err) {
      console.error("Error:", err);
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambio de puntuación
  const handlePuntuacionChange = (e) => {
    let value = parseInt(e.target.value) || 0;
    value = Math.max(1, Math.min(100, value));
    setFormData(prev => ({
      ...prev,
      puntuacion: value
    }));
  };

  // Completar tarea (para tareas de otros)
  const toggleComplete = async (id) => {
    const userId= localStorage.getItem("userId");
    try {
      const response = await fetch(`https://1822-200-68-188-0.ngrok-free.app/auth/tareas/${id}/${userId}/completar`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error("Error al actualizar tarea");
      }

      // Actualizar estado local
      setOthersTasks(prev => 
        prev.map(task => 
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
      
      setExpiredTasks(prev => 
        prev.map(task => 
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );

    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    }
  };

  // Eliminar tarea (solo mis tareas)
  const deleteTask = async (id) => {
    try {
      const response = await fetch(`https://1822-200-68-188-0.ngrok-free.app/auth/tareas/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error("Error al eliminar tarea");
      }

      // Actualizar estado local
      setMyTasks(prev => prev.filter(task => task.id !== id));

    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Calcular días restantes
  const getDaysRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <div className="bg-red-900 p-4 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <Link 
            to="/home2" 
            className="mt-4 inline-block text-yellow-400 hover:text-yellow-300"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col items-center bg-gray-900 text-white">
      <nav className="w-full bg-gray-800 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <img src="/conexxo.png" className="h-24 w-24 object-contain" alt="Logo" />
          <h1 className="text-3xl font-bold">ConneXXo</h1>
        </div>
        <Link to="/home2" className="text-yellow-400 hover:text-yellow-300">← Volver al Inicio</Link>
      </nav>

      <div className="w-full max-w-6xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sección de Crear Tareas */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-center mb-4">Crear Nueva Tarea</h2>
          
          {formError && (
            <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg">
              {formError}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-900 text-green-100 rounded-lg">
              ¡Tarea creada exitosamente!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título*</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Título de la tarea"
                className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción detallada (opcional)"
                rows={3}
                className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Fecha Límite</label>
                <input
                  type="date"
                  name="fecha_limite"
                  value={formData.fecha_limite}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Puntuación* (1-100)
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    name="puntuacion"
                    value={formData.puntuacion}
                    onChange={handlePuntuacionChange}
                    min="1"
                    max="100"
                    className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-300">pts</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-400">* Campos obligatorios</span>
              <button
                type="submit"
                disabled={formLoading}
                className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                {formLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Crear Tarea
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sección de Mis Tareas */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-center mb-4">Mis Tareas ({myTasks.length})</h2>
          {myTasks.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No has creado tareas aún</p>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {myTasks.map(task => {
                const daysRemaining = getDaysRemaining(task.dueDate);
                const isExpired = daysRemaining < 0;
                
                return (
                  <li
                    key={task.id}
                    className={`p-3 rounded-lg shadow-md ${
                      isExpired ? "bg-red-900" : "bg-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-white font-medium">{task.text}</span>
                        {task.description && (
                          <p className="text-sm text-gray-300 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center mt-2 text-xs">
                          <FaClock className="mr-1" />
                          <span className={isExpired ? "text-red-300" : "text-gray-300"}>
                            {isExpired 
                              ? `Venció el ${formatDate(task.dueDate)}` 
                              : `${daysRemaining} días restantes`}
                          </span>
                        </div>
                        <p className="text-xs text-purple-400 py-2">{task.puntos + " puntos"}</p>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Eliminar tarea"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Sección de Tareas de Otros */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-center mb-4">Tareas de Otros ({othersTasks.length})</h2>
          {othersTasks.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No hay tareas asignadas</p>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {othersTasks.map(task => {
                const daysRemaining = getDaysRemaining(task.dueDate);
                const isExpired = daysRemaining < 0;
                
                return (
                  <li
                    key={task.id}
                    className={`p-3 rounded-lg shadow-md ${
                      task.completed ? "bg-green-600" : 
                      isExpired ? "bg-red-900" : "bg-gray-700"
                    }`}
                  >
                    <div>
                      <span className={`font-medium ${
                        task.completed ? "line-through text-gray-300" : "text-white"
                      }`}>
                        {task.text}
                      </span>
                      {task.description && (
                        <p className="text-sm text-gray-300 mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center mt-2 text-xs">
                        <FaClock className="mr-1" />
                        <span className={isExpired ? "text-red-300" : "text-gray-300"}>
                          {isExpired 
                            ? `Venció el ${formatDate(task.dueDate)}` 
                            : `${daysRemaining} días restantes`}
                        </span>
                      </div>
                      <span className="block text-xs text-blue-300 mt-1">
                        De: {task.creator}
                      </span>
                      <p className="text-xs text-purple-400 py-2">{task.puntos + " puntos"}</p>
                    </div>
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => toggleComplete(task.id)}
                        className={`p-1 ${
                          task.completed ? "text-white" : 
                          isExpired ? "text-red-300 hover:text-red-100" : "text-green-400 hover:text-green-600"
                        }`}
                        title={task.completed ? "Marcar como pendiente" : "Completar tarea"}
                      >
                        <FaCheckCircle size={18} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Sección de Tareas Caducadas */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg md:col-span-2 lg:col-span-1">
          <h2 className="text-xl font-bold text-center mb-4 flex items-center justify-center gap-2">
            <FaExclamationTriangle className="text-red-400" />
            Tareas Caducadas ({expiredTasks.length})
          </h2>
          {expiredTasks.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No hay tareas caducadas</p>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {expiredTasks.map(task => (
                <li
                  key={task.id}
                  className="p-3 rounded-lg bg-red-900 shadow-md"
                >
                  <div>
                    <span className="text-white font-medium">{task.text}</span>
                    {task.description && (
                      <p className="text-sm text-gray-300 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center mt-2 text-xs text-red-300">
                      <FaExclamationTriangle className="mr-1" />
                      <span>Venció el {formatDate(task.dueDate)}</span>
                    </div>
                    <span className="block text-xs text-gray-300 mt-1">
                      {task.creatorId === parseInt(creador_id) 
                        ? "Tarea creada por ti" 
                        : `De: ${task.creator}`}
                    </span>
                    <p className="text-xs text-purple-400 py-2">{task.puntos + " puntos"}</p>
                  </div>
                  {task.creatorId !== parseInt(creador_id) && (
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => toggleComplete(task.id)}
                        className="text-red-300 hover:text-red-100 p-1"
                        title="Completar tarea"
                      >
                        <FaCheckCircle size={18} />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tareas;