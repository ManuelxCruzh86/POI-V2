import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        const response = await fetch("http://localhost:5000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/perfil");
        } else {
            alert(data.message);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
    
        const response = await fetch("http://localhost:5000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: username, email, password }),
        });
    
        const data = await response.json();
    
        if (response.ok) {
            alert("Registro exitoso, inicia sesión");
            setIsLogin(true); 
        } else {
            alert(data.error);
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
        <form 
            onSubmit={isLogin ? handleLogin : handleRegister} 
            className="bg-gray-800 p-8 rounded-xl shadow-lg space-y-6"
        >
            <h2 className="text-2xl font-bold text-center">
                {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </h2>

            {isLogin ? (
                <>
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-2 bg-gray-700 rounded focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-2 bg-gray-700 rounded focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                        />
                    </div>
                </>
            ) : (
                <>
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
                </>
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