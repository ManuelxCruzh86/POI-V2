import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom"; 

export default function RewardsSystem() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const grupoId = localStorage.getItem("tempGroupId");
  const groupData = JSON.parse(localStorage.getItem('tempGroupData') || '{}');

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await fetch(`https://1822-200-68-188-0.ngrok-free.app/auth/grupos/${grupoId}/puntos`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setRewards(data.data);
      } catch (err) {
        console.error("Error fetching rewards:", err);
        setError("No se pudieron cargar las recompensas");
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [grupoId]);

  // Función para determinar la medalla basada en puntos
  const getRewardBadge = (points) => {
    if (points >= 500) return "Medalla de Platino";
    if (points >= 300) return "Medalla de Oro";
    if (points >= 150) return "Medalla de Plata";
    return "Medalla de Bronce";
  };

  // Función para determinar el color del badge
  const getRewardColor = (points) => {
    if (points >= 500) return "from-purple-400 to-purple-600";
    if (points >= 300) return "from-yellow-400 to-yellow-600";
    if (points >= 150) return "from-gray-300 to-gray-500";
    return "from-amber-600 to-amber-800";
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 text-white">
      <nav className="w-full bg-gray-800 text-white py-4 px-6 fixed top-0 left-0 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <img src="/conexxo.png" className="h-24 w-24 object-contain" alt="Logo" />
          <div>
            <h1 className="text-3xl font-bold">ConneXXo</h1>
            <p className="text-sm text-gray-400">Grupo: {groupData.nombre || 'Desconocido'}</p>
          </div>
        </div>
        <Link to="/home2" className="text-yellow-400 hover:text-yellow-300">← Volver al Inicio</Link>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 mt-24">
        <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">🏆 Sistema de Recompensas</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
          ) : error ? (
            <div className="bg-red-800 text-white p-4 rounded-lg mb-6 text-center">
              {error}
              <button 
                onClick={() => window.location.reload()}
                className="ml-4 text-yellow-300 hover:text-yellow-200 underline"
              >
                Reintentar
              </button>
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No hay datos de recompensas disponibles para este grupo
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-750">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Avatar
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Recompensa
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Puntos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {rewards
                    .sort((a, b) => b.puntos_totales - a.puntos_totales)
                    .map((reward) => (
                      <tr key={reward.usuario_id} className="hover:bg-gray-750 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{reward.nombre}</div>
                              <div className="text-sm text-gray-400">{reward.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-10 w-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
                            {reward.avatar_url ? (
                              <img 
                                src={reward.avatar_url === "default-avatar.png" 
                                  ? "/default-avatar.png" 
                                  : `https://1822-200-68-188-0.ngrok-free.app/${reward.avatar_url}`} 
                                alt={reward.nombre}
                                className="h-full w-full object-cover"
                                onError={(e) => (e.target.src = "/default-avatar.png")}
                              />
                            ) : (
                              <span className="text-lg bg-gray-600 w-full h-full flex items-center justify-center">
                                {reward.nombre?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-gradient-to-r ${getRewardColor(reward.puntos_totales)} text-white`}>
                            {getRewardBadge(reward.puntos_totales)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {reward.puntos_totales} pts
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}