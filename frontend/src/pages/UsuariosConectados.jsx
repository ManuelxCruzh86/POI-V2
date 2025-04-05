import { Link } from "react-router-dom";

function UsuariosConectados() {
  const [usuarios, setUsuarios] = useState([]);
  
  // Cargar usuarios reales desde tu API
  useEffect(() => {
    const cargarUsuarios = async () => {
      const response = await fetch("http://localhost:3001/usuarios");
      const data = await response.json();
      setUsuarios(data);
    };
    cargarUsuarios();
  }, []);

  return (
    <div className="bg-gray-800 p-4">
      <h2 className="text-xl font-bold mb-4">Usuarios Conectados</h2>
      <ul className="space-y-2">
        {usuarios.map((usuario) => (
          <li key={usuario.id}>
            <Link
              to={`/chat/${usuario.id}`}
              className="block p-2 bg-gray-700 hover:bg-blue-500 rounded transition"
            >
              {usuario.nombre}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}