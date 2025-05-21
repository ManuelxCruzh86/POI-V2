import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaCheckCircle, FaTrash, FaCamera } from "react-icons/fa";


function Perfil() {
    const [isEditing, setIsEditing] = useState(false);
    const [nombre, setNombre] = useState(" ");
    const [email, setEmail] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [estaActivo, setEstaActivo] = useState(true);
    const [foto, setFoto] = useState("/default-avatar.png");
    const [tareas, setTareas] = useState([]);
    const [nuevaTarea, setNuevaTarea] = useState("");
    const [fotoPrevia, setFotoPrevia] = useState(null);
    const [archivoFoto, setArchivoFoto] = useState(null);

    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        nombre: "",
        email: "",
        avatar_url: "/default-avatar.png"
    });

     useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            fetchUserData(); 
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const fetchUserData = async () => {
        try {
            const currentUserId = localStorage.getItem("userId");
            if (!currentUserId) {
                navigate("/login");
                return;
            }

            const response = await fetch(`https://1822-200-68-188-0.ngrok-free.app/auth/datosUser/${currentUserId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    "ngrok-skip-browser-warning": "true"
                }
            });

            if (!response.ok) throw new Error('Error al obtener datos');

            const data = await response.json();
            

            setUserData({
                nombre: data.nombre,
                email: data.email,
                avatar_url: data.avatar_url || "/default-avatar.png"
            });
            
            setNombre(data.nombre);
            setEmail(data.email);
            setFoto(data.avatar_url || "/default-avatar.png");

        } catch (error) {
            console.error("Error fetching user data:", error);
            alert("No se pudieron cargar los datos del perfil");
        }
    };


   const handleLogout = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        try {
            await fetch(`https://1822-200-68-188-0.ngrok-free.app/auth/usuarios/${user.id}/desconectar`, {
                method: "PUT",
                headers: {
                    "ngrok-skip-browser-warning": "true",
                }
            });
        } catch (error) {
            console.error("Error al desconectar usuario:", error);
        }
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    };
    
    const handleFotoChange = (e) => {
           const file = e.target.files[0];
        if (file) {
            setArchivoFoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPrevia(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleEditing = () => {
        setIsEditing(!isEditing);
    };

    const toggleCompletada = (id) => {
        setTareas(tareas.map(tarea => 
            tarea.id === id ? {...tarea, completada: !tarea.completada} : tarea
        ));
    };

    const eliminarTarea = (id) => {
        setTareas(tareas.filter(tarea => tarea.id !== id));
    };

    const handleSubmit = async () => {
  try {
    const formData = new FormData();

    if (nombre !== user.nombre) formData.append('nombre', nombre);
    if (email !== user.email) formData.append('email', email);
    if (contraseña) formData.append('password', contraseña);

     if (archivoFoto) {
            formData.append('avatar', archivoFoto);
        }

    const response = await fetch(`https://1822-200-68-188-0.ngrok-free.app/auth/actualizarUsuario/${user.id}`, {
      method: 'PUT',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        "ngrok-skip-browser-warning": "true",
      }
    });

    if (!response.ok) throw new Error('Error al actualizar perfil');

    const updatedUser = await response.json();
    
    setUser(updatedUser);
    setFotoPrevia(null); 
    setArchivoFoto(null);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    setIsEditing(false);
    setContraseña('');
    fetchUserData();
    alert('Perfil actualizado con éxito');
    
  } catch (error) {
    console.error('Error:', error);
    alert(error.message);
  }
};

    return (
        <div className="h-dvh w-full flex flex-col bg-gray-900 text-white">
            <nav className="p-4 bg-gray-800 flex justify-between items-center shadow-md">
                <div className="flex items-center space-x-4">
                    <img src="/conexxo.png" className="h-24 w-24 object-contain" alt="Logo" />
                    <h1 className="text-3xl font-bold">ConneXXo</h1>
                </div>
                <Link to="/" className="text-yellow-400 hover:text-yellow-300">← Volver al Inicio</Link>
            </nav>

            <main className="flex-1 flex flex-col md:flex-row items-start justify-center p-4 gap-6">
               
                <div className="w-full md:w-1/2 max-w-md bg-gray-800 p-8 rounded-xl shadow-lg space-y-6">
                    {user ? (
                        <>
                            <h2 className="text-2xl font-bold text-center">Perfil de {userData.nombre}</h2>
                    
                           <div className="flex flex-col items-center space-y-4 relative">
            <div className="relative">
              <img 
                src={
                    fotoPrevia || 
                    (userData.avatar_url === "default-avatar.png" 
                    ? "/default-avatar.png" 
                    : `https://1822-200-68-188-0.ngrok-free.app/${userData.avatar_url}`) || 
                    "/anonimo.png"
                } 
                alt="Foto de perfil" 
                className="h-32 w-32 rounded-full object-cover border-2 border-gray-700"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/anonimo.png";
                }}
                />
                <div 
                    className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-gray-800 ${
                        estaActivo ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    title={estaActivo ? "Conectado" : "Desconectado"}
                ></div>
            </div>
            
            {isEditing && (
                <div className="flex flex-col items-center space-y-2">
                    <input 
                        type="file" 
                        id="foto-upload" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFotoChange}
                    />
                    <label 
                        htmlFor="foto-upload" 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer flex items-center"
                    >
                        <FaCamera className="mr-2" />
                        {fotoPrevia ? "Cambiar otra foto" : "Cambiar Foto"}
                    </label>
                    
                    {fotoPrevia && (
                        <button
                            onClick={() => {
                                setFotoPrevia(null);
                                setArchivoFoto(null);
                            }}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            Eliminar nueva foto
                        </button>
                    )}
                </div>
            )}
        </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Nombre</label>
                                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-2 bg-gray-700 rounded focus:ring-2 focus:ring-yellow-400 focus:outline-none" disabled={!isEditing} />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold mb-2">Correo Electrónico</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-gray-700 rounded focus:ring-2 focus:ring-yellow-400 focus:outline-none" disabled={!isEditing} />
                            </div>

                           <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Contraseña
                                    {isEditing && (
                                    <span className="text-xs font-normal text-gray-400 ml-2">
                                        (Dejar en blanco si no deseas cambiarla)
                                    </span>
                                    )}
                                </label>
                                <input
                                    type="password"
                                    value={contraseña}
                                    onChange={(e) => setContraseña(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-700 rounded focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                                    disabled={!isEditing}
                                    placeholder={isEditing ? "Nueva contraseña..." : "••••••••"}
                                />
                                {isEditing && (
                                    <p className="text-xs text-gray-400 mt-1">
                                    La contraseña debe contener al menos 8 caracteres
                                    </p>
                                )}
                                </div>

                            <div className="flex flex-col space-y-4">
                                <button   onClick={isEditing ? handleSubmit : toggleEditing} className="w-full bg-yellow-400 text-white-200 px-4 py-2 rounded font-semibold hover:bg-yellow-300 transition-colors">
                                    {isEditing ? "Guardar Cambios" : "Editar Perfil"}
                                </button>
                                <button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold">
                                    Cerrar Sesión
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-center">Cargando...</p>
                    )}
                </div>

{/* <div className="w-full md:w-1/2 max-w-md bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-center mb-4">Gestión de Tareas</h2>
                
                    
                    <ul className="space-y-3 max-h-96 overflow-y-auto">
                        {tareas.length === 0 ? (
                            <li className="text-center text-gray-400 p-3">No hay tareas pendientes</li>
                        ) : (
                            tareas.map(tarea => (
                                <li 
                                    key={tarea.id} 
                                    className={`flex justify-between items-center p-3 rounded-lg shadow-md ${
                                        tarea.completada ? "bg-green-600" : "bg-gray-700"
                                    }`}
                                >
                                    <span className={`flex-1 ${
                                        tarea.completada ? "line-through text-white" : "text-white"
                                    }`}>
                                        {tarea.texto}
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => toggleCompletada(tarea.id)} 
                                            className="text-green-400 hover:text-green-600"
                                        >
                                            <FaCheckCircle size={20} />
                                        </button>
                                        
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div> */}
            </main>
        </div>
    );
}

export default Perfil;
