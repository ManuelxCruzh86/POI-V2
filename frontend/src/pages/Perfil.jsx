import { useState } from "react";
import { Link } from "react-router-dom";

function Perfil() {
    const [isEditing, setIsEditing] = useState(false);
    const [nombre, setNombre] = useState("Chester Benington");
    const [email, setEmail] = useState("chesterPark@example.com");
    const [estaActivo, setEstaActivo] = useState(true);
    const [foto, setFoto] = useState("/chester.jpg");
    
    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFoto(URL.createObjectURL(file));
        }
    };

    const toggleEditing = () => {
        setIsEditing(!isEditing);
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

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-lg space-y-6">
                    <h2 className="text-2xl font-bold text-center">Mi Perfil</h2>
                    <div className="flex flex-col items-center space-y-4">
                        <img src={foto} alt="Foto de perfil" className="h-32 w-32 rounded-full object-cover border-2 border-black-900" />
                        {isEditing && (
                            <>
                                <input type="file" id="foto-upload" className="hidden" accept="image/*" onChange={handleFotoChange} />
                                <label htmlFor="foto-upload" className="px-4 py-2 bg-blue-300 text-gray-900 rounded font-semibold hover:bg-blue-900 transition-colors cursor-pointer">Cambiar Foto</label>
                            </>
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
                        <label className="block text-sm font-semibold mb-2">Estado</label>
                        <label className="inline-flex items-center">
                            <input type="checkbox" checked={estaActivo} onChange={(e) => setEstaActivo(e.target.checked)} disabled={!isEditing} className="form-checkbox h-5 w-5 text-yellow-400 rounded focus:ring-yellow-400" />
                            <span className="ml-2">{estaActivo ? 'Activo' : 'Inactivo'}</span>
                        </label>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <button onClick={toggleEditing} className="w-full bg-yellow-400 text-white-200 px-4 py-2 rounded font-semibold hover:bg-yellow-300 transition-colors">
                            {isEditing ? "Guardar Cambios" : "Editar Perfil"}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Perfil;
