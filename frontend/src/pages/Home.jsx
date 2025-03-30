import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Home() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
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
                            {/* 🔹 Ahora el nombre del usuario es clickeable */}
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
                    <Link to="/chat" className="bg-gray-800 p-6 rounded-xl flex flex-col items-center shadow-lg hover:bg-gray-700 transition w-full">
                        <span className="text-5xl">💬</span>
                        <p className="font-semibold mt-2 text-xl">Chat Privado</p>
                        <p className="text-sm opacity-75">Mensajes individuales y cifrado opcional.</p>
                    </Link>

                    <Link to="/chatgrupal" className="bg-gray-800 p-6 rounded-xl flex flex-col items-center shadow-lg hover:bg-gray-700 transition w-full">
                        <span className="text-5xl">🗨️</span>
                        <p className="font-semibold mt-2 text-xl">Chat Grupal</p>
                        <p className="text-sm opacity-75">Comunicación en tiempo real con grupos.</p>
                    </Link>

                    <Link to="/videollamada" className="bg-gray-800 p-6 rounded-xl flex flex-col items-center shadow-lg hover:bg-gray-700 transition w-full">
                        <span className="text-5xl">📹</span>
                        <p className="font-semibold mt-2 text-xl">Videollamadas</p>
                        <p className="text-sm opacity-75">Comunicación 1 a 1 en video.</p>
                    </Link>

                    <Link to="/tareas" className="bg-gray-800 p-6 rounded-xl flex flex-col items-center shadow-lg hover:bg-gray-700 transition w-full">
                        <span className="text-5xl">📋</span>
                        <p className="font-semibold mt-2 text-xl">Tareas</p>
                        <p className="text-sm opacity-75">Asigna y completa tareas en equipo.</p>
                    </Link>

                    <Link to="/recompensas" className="bg-gray-800 p-6 rounded-xl flex flex-col items-center shadow-lg hover:bg-gray-700 transition w-full">
                        <span className="text-5xl">🏆</span>
                        <p className="font-semibold mt-2 text-xl">Recompensas</p>
                        <p className="text-sm opacity-75">Gana puntos y canjea premios.</p>
                    </Link>

                    <Link to="/usuarios" className="bg-gray-800 p-6 rounded-xl flex flex-col items-center shadow-lg hover:bg-gray-700 transition w-full">
                        <span className="text-5xl">🟢</span>
                        <p className="font-semibold mt-2 text-xl">Estado de Usuarios</p>
                        <p className="text-sm opacity-75">Ver quién está en línea en tiempo real.</p>
                    </Link>
                </div>

                <div className="mt-12">
                    <Link to="/grupos" className="bg-yellow-400 hover:bg-yellow-600 text-gray-900 px-8 py-4 rounded-full font-semibold text-xl shadow-lg hover:scale-105 transition">
                        Mis Grupos👨‍👩‍👧‍👦
                    </Link>
                </div>
            </main>

            <footer className="p-4 text-center text-sm opacity-70 bg-gray-800">
                &copy; 2025 Plataforma de Comunicación. Todos los derechos reservados a Conexxo Company.
            </footer>
        </div>
    );
}

export default Home;
