import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Home() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    console.log("ID del usuario:", userId);


    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        try {
            await fetch(`https://1822-200-68-188-0.ngrok-free.app/auth/usuarios/${user.id}/desconectar`, {
                method: "PUT",
                headers: {
                    "ngrok-skip-browser-warning": "true",
                },
            });
        } catch (error) {
            console.error("Error al desconectar usuario:", error);
        }
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
};

    const handleProfile = () => {
        navigate("/perfil");
    };

    const [showNotifications, setShowNotifications] = useState(false);
    const [showRewards, setShowRewards] = useState(false);

    return (
        <div className="h-full w-full flex flex-col text-white overflow-x-hidden">
            <nav className="p-4 bg-gray-800 flex justify-between items-center shadow-md">
                <div className="flex items-center space-x-4">
                    <img src="/conexxo.png" className="h-24 w-24 object-contain" />
                    <h1 className="text-3xl font-bold">ConneXXo</h1>
                </div>

                <div className="flex gap-4 relative items-center">
                    <button onClick={() => setShowNotifications(!showNotifications)} className="relative">
                        <span className="text-2xl">🔔</span>
                    </button>
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-64 bg-gray-700 p-4 rounded-lg shadow-lg">
                            <p className="font-semibold">Notificaciones</p>
                            <ul className="text-sm mt-2">
                                <li>📩 Nuevo mensaje de Juan</li>
                                <li>✅ Tarea completada</li>
                            </ul>
                        </div>
                    )}

                    <button onClick={() => setShowRewards(!showRewards)} className="relative">
                        <span className="text-2xl">🏆</span>
                    </button>
                    {showRewards && (
                        <div className="absolute right-0 mt-2 w-64 bg-gray-700 p-4 rounded-lg shadow-lg">
                            <p className="font-semibold">Recompensas</p>
                            <ul className="text-sm mt-2">
                                <li>🥇 Chester Benington - 1500 pts</li>
                                <li>🥈 Zambrano - 1300 pts</li>
                                <li>🥉 Nadiela - 1200 pts</li>
                            </ul>
                        </div>
                    )}

                    {user ? (
                        <>
                            <span className="text-lg cursor-pointer hover:underline" onClick={handleProfile}>
                                {user.nombre}
                            </span>
                            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                                Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                            Iniciar Sesión
                        </Link>
                    )}
                </div>
            </nav>

                <main className="flex-1 flex flex-col items-center justify-center py-10 bg-gray-900">
                {!user && (
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Bienvenido a ConneXXo
                        </h1>
                        <p className="text-xl text-gray-300 mb-8">
                            Haz llamadas, chatea con quien quieras y accede a tus archivos de forma segura
                        </p>
                        
                        <div className="text-center">
                            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
                                Conecta con tu comunidad, comparte experiencias y descubre nuevas oportunidades.
                            </p>
                            <Link
                                to="/login"
                                className="bg-yellow-400 hover:bg-yellow-600 text-gray-900 px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:scale-105 transition"
                            >
                                Únete Ahora
                            </Link>
                        </div>
                        
                        <div className="h-8"></div>
                        <div className="h-8"></div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { 
                                    title: "Reuniones seguras",
                                    icon: "📅",
                                    description: "Video llamadas encriptadas con calidad HD"
                                },
                                { 
                                    title: "Chat integrado",
                                    icon: "💬",
                                    description: "Mensajería instantánea con historial ilimitado"
                                },
                                { 
                                    title: "Archivos en la nube",
                                    icon: "☁️",
                                    description: "Almacenamiento seguro con acceso desde cualquier dispositivo"
                                }
                            ].map((feature, index) => (
                                <div key={index} className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-colors">
                                    <div className="text-4xl mb-4">{feature.icon}</div>
                                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-gray-400">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {user?.nombre && (
    <div className="w-full max-w-7xl px-4">
        <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-purple-400 to-purple-600 bg-clip-text text-transparent mb-6">
                ¡Bienvenido de vuelta, {user.nombre}! 
            </h1>
            <p className="text-xl text-gray-300 font-light">
                Es un placer tenerte aquí. Explora las nuevas funciones y mantente conectado con tu comunidad.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 hover:border-yellow-400 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-yellow-400/20 rounded-xl">
                        <span className="text-2xl">📈</span>
                    </div>
                    <h3 className="text-xl font-semibold">Actividad</h3>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Grupos</span>
                        <span className="text-yellow-400 font-bold">Nuevo</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Mensajes</span>
                        <span className="text-purple-400 font-bold">Nuevo</span>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 hover:border-purple-400 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-400/20 rounded-xl">
                        <span className="text-2xl">🔔</span>
                    </div>
                    <h3 className="text-xl font-semibold">Alertas</h3>
                </div>
                <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-gray-300">
                        <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        Mensajes Ilimitados
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-300">
                        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                        Tareas Intuitivas
                    </li>
                </ul>
            </div>

            <div className="md:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 hover:border-blue-400 transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-400/20 rounded-xl">
                        <span className="text-2xl">⚡</span>
                    </div>
                    <h3 className="text-xl font-semibold">Acciones Instantáneas</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button className="flex items-center gap-3 p-4 bg-gray-700/50 hover:bg-gray-600 rounded-xl transition-colors">
                     <span className="text-2xl">👥</span>
                        <div className="text-left">
                            <p className="font-medium">Grupos</p>
                            <Link
                                to="/grupos" >
                                Mis Grupos
                            </Link>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-gray-700/50 hover:bg-gray-600 rounded-xl transition-colors">
                        <span className="text-2xl">📤</span>
                        <div className="text-left">
                            <p className="font-medium">Perfil</p>
                            <Link
                                to="/perfil" >
                                Mi Perfil
                            </Link>
                        </div>
                    </button>
                </div>
            </div>
        </div>

<div className="w-full flex justify-center mt-12">
            <Link
                to="/grupos"
                className="bg-yellow-400 hover:bg-yellow-600 text-gray-900 px-8 py-4 rounded-full font-semibold text-xl shadow-lg hover:scale-105 transition"
            >
                Mis Grupos👨‍👩‍👧‍👦
            </Link>
        </div>
    </div>
)}
            </main>

            <footer className="p-4 text-center text-sm opacity-70 bg-gray-800">
                &copy; 2025 Plataforma de Comunicación. Todos los derechos reservados a Conexxo Company.
            </footer>
        </div>
    );
}

export default Home;
