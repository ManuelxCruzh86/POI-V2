import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if(isLogin) {
            console.log("Iniciando sesión con:", { email, password });
        } else {
            console.log("Registrando con:", { username, email, password });
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-gray-900 text-white">
            <nav className="p-4 bg-gray-800 flex justify-between items-center shadow-md">
                <div className="flex items-center space-x-4">
                    <img src="/conexxo.png" className="h-24 w-24 object-contain" alt="Logo" />
                    <h1 className="text-3xl font-bold">ConneXXo</h1>
                </div>
                
                <div className="text-center text-sm">
                    <Link 
                        to="/" 
                        className="text-yellow-400 hover:text-yellow-300"
                    >
                        ← Volver al Inicio
                    </Link>
                </div>

            </nav>

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-lg space-y-6">
                        <h2 className="text-2xl font-bold text-center">
                            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                        </h2>
                        
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-semibold mb-2">Nombre de Usuario</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-700 rounded focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                                    required
                                />
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-semibold mb-2">Correo Electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 rounded focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold mb-2">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 rounded focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                                required
                            />
                        </div>
                        
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-semibold mb-2">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-700 rounded focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                                    required
                                />
                            </div>
                        )}
                        
                        <button
                            type="submit"
                            className="w-full bg-yellow-400 text-gray-100 px-4 py-2 rounded font-semibold hover:bg-yellow-300 transition-colors"
                        >
                            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                        </button>
                        
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            className="w-full bg-yellow-400 text-gray-100 px-4 py-2 rounded font-semibold hover:bg-yellow-300 transition-colors"
                        >
                            {isLogin ? 
                                '¿No tienes cuenta? Regístrate' : 
                                '¿Ya tienes cuenta? Inicia Sesión'
                            }
                        </button>


                        
                    </form>
                </div>
            </main>
        </div>
    );
}

export default Login;