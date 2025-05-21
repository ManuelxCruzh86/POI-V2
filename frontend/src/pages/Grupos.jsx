import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import groupImage from "../../public/group.svg";


const currentUserId = localStorage.getItem("userId") ; 


const GroupCard = ({ id, nombre, descripcion, isCreator, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false);
  const cardRef = useRef(null);

  const handleClick = () => {
    localStorage.setItem('tempGroupId', id);
    localStorage.setItem('tempGroupData', JSON.stringify({
      nombre,
      descripcion,
      isCreator
    }));
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm(`¿Estás seguro de que quieres eliminar el grupo "${nombre}"?`)) {
      try {
        const response = await fetch(`https://1822-200-68-188-0.ngrok-free.app/auth/grupos/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "true"
          },
        });
        
        const result = await response.json();
        
        if (response.ok) {
          alert('Grupo eliminado exitosamente');
          window.location.reload();
          if (onDelete) onDelete(id);
        } else {
          alert(result.message || 'Error al eliminar el grupo');
        }
      } catch (error) {
        console.error('Error al eliminar el grupo:', error);
        alert('Error al conectar con el servidor');
      }
    }
    setShowOptions(false);
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={cardRef}>
      {isCreator && (
        <button 
          className="absolute top-2 right-2 text-gray-400 hover:text-white z-10"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setShowOptions(!showOptions);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
      )}
      
      {showOptions && isCreator && (
        <div className="absolute top-8 right-2 bg-gray-700 rounded-md shadow-lg z-20">
          <button 
            className="px-4 py-2 text-red-400 hover:bg-gray-600 w-full text-left flex items-center"
            onClick={handleDelete}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar grupo
          </button>
        </div>
      )}
      
      <Link to={`/home2`} onClick={handleClick}>
        <div className={`bg-gray-800 p-4 rounded-lg cursor-pointer transition-all hover:opacity-20 active:opacity-20 ${isCreator ? "border-2 border-yellow-400" : ""}`}>
          <img className="w-20 h-20 mx-auto" src={groupImage} alt="Imagen del grupo" />
          <h2 className="text-xl font-bold text-center mb-3">{nombre}</h2>
          <p className="text-base text-center text-gray-300">{descripcion}</p>
          {isCreator && (
            <span className="block text-center text-yellow-400 text-sm mt-2">(Creador)</span>
          )}
        </div>
      </Link>
    </div>
  );
};

const CreateGroupModal = ({ onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescripcion, setDescripcionName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [userError, setUserError] = useState(null);



  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://1822-200-68-188-0.ngrok-free.app/auth/api/usuarios", {
          headers: {
            "ngrok-skip-browser-warning": "true"
          }
        });
        const data = await response.json();
  
        setUsers(data); 
        setUserError(null);
      } catch (err) {
        console.error("Error al cargar usuarios:", err);
        setUserError("No se pudieron cargar los usuarios.");
      }
    };
  
    fetchUsers();
  }, []);
  

  useEffect(() => {
    if (searchTerm) {
      const results = users.filter(user =>
        (user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
      );    
      setFilteredUsers(results);
      setShowSuggestions(true);
    } else {
      setFilteredUsers([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

 const addGroup = async () => {
  if (!groupName || !currentUserId) {
    alert("El nombre del grupo y el ID del creador son requeridos.");
    return;
  }

  const grupoData = {
    nombre: groupName,
    descripcion: groupDescripcion,
    creador_id: currentUserId,
    miembros: members.map(member => member.id)
  };

  try {
    const response = await fetch("https://1822-200-68-188-0.ngrok-free.app/auth/create/group", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify(grupoData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Error al crear grupo:", result.message || result.error);
      alert(result.message || "Error al crear el grupo");
      return;
    }  

    window.location.reload();
    alert("Grupo creado exitosamente");

    onGroupCreated(result); 
    onClose();
    
  } catch (error) {
    console.error("Error de red:", error);
    alert("Error al conectar con el servidor.");
  }
};


  const handleSelectUser = (user) => {
    if (!members.some(member => member.id === user.id)) {
      setMembers([...members, { id: user.id, nombre: user.nombre }]);
    }
    setSearchTerm("");
    setShowSuggestions(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus(); 
    }
  };

  const removeMember = (memberId) => {
    setMembers(members.filter(m => m.id !== memberId));
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "#00000091" }}>
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h3 className="font-medium text-lg text-center mb-4">Crear nuevo grupo</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre del grupo</label>
            <input
              type="text"
              placeholder="Ej: Grupo de trabajo"
              className="w-full p-2 rounded bg-gray-700"
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <input
              type="text"
              placeholder="Descripción breve"
              className="w-full p-2 rounded bg-gray-700"
              onChange={(e) => setDescripcionName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Agregar miembros</label>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar por nombre o email"
                className="w-full p-2 rounded bg-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggestions(searchTerm.length > 0 && filteredUsers.length > 0)}
              />
              {showSuggestions && filteredUsers.length > 0 && (
                <ul className="absolute left-0 right-0 bg-gray-700 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredUsers.map(user => (
                    <li
                      key={user.id}
                      className="p-2 hover:bg-gray-600 cursor-pointer"
                      onClick={() => handleSelectUser(user)}
                    >
                      {user.nombre} ({user.email})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {members.length > 0 && (
            <div className="bg-gray-700 p-3 rounded">
              <h4 className="text-sm font-medium mb-2">Miembros invitados</h4>
              <ul className="space-y-1">
                {members.map((member) => (
                  <li key={member.id} className="flex justify-between items-center">
                    <span>{member.nombre}</span>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
            >
              Cancelar
            </button>
            <button
              onClick={addGroup}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-100 rounded font-medium"
            >
              Crear grupo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="animate-pulse">
          <svg className="w-16 h-16 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
        </div>
        <p className="text-white mt-2">Cargando tus grupos...</p>
      </div>
    </div>
  );
};

const Grupos = () => {
  const [modalIsOpen, setModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const openModal = () => setModal(true);
  const closeModal = () => setModal(false);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [allGroups, setAllGroups] = useState([]);
  const [creatorGroups, setCreatorGroups] = useState([]);
  const [memberGroups, setMemberGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);      
  const [guestGroups, setGuestGroups] = useState([]);  
  const currentUserId = localStorage.getItem("userId") ; 

console.log("ID del usuario actual:", currentUserId);

const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://1822-200-68-188-0.ngrok-free.app/auth/usuario/${currentUserId}/grupos`, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });
      const result = await response.json();

      if (result.success) {
        const { como_creador, como_miembro } = result.data;
        setMyGroups(como_creador);
        setGuestGroups(como_miembro);
        setError(null);
      } else {
        setError("Error al cargar los grupos: respuesta inválida.");
      }
    } catch (err) {
      console.error("Error al cargar grupos:", err);
      setError("Error al cargar los grupos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
    if (currentUserId) {
      fetchGroups();
    }
  }, [currentUserId]);

  const handleGroupCreated = (newGroup) => {
    setGroups([...groups, newGroup]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <nav className="absolute right-3 top-3">
        <Link to="/" className="text-yellow-400 hover:text-yellow-300 ">← Volver al Inicio</Link>
      </nav>
      {loading && <LoadingSpinner />}

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
         
        <main className="py-3 relative w-full">
        <h1 className="text-center mb-6">Mis grupos</h1>
        <button
          onClick={openModal}
          className="absolute right-3 top-12 bg-gray-800 p-2 rounded-lg transition hover:bg-gray-700 active:opacity-50"
        >
          Crear grupo
        </button>
      </main>
        </div>


        {error && (
          <div className="bg-red-800 text-white p-4 rounded-lg mb-6 text-center">
            {error}
            <button 
              onClick={() => window.location.reload()}
              className="ml-4 text-yellow-300 hover:text-yellow-200 underline"
            >
              Reintentar
            </button>
          </div>
        )}

            <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-700">
            Mis Grupos ({myGroups.length})
          </h2>
          {!loading && myGroups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myGroups.map((group) => (
                <GroupCard 
                  key={group.id} 
                  {...group} 
                  isCreator={true}
                />
              ))}
            </div>
          ) : (
            !loading && (
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <p className="text-gray-400">No has creado ningún grupo todavía</p>
                <button
                  onClick={openModal}
                  className="mt-3 text-yellow-400 hover:text-yellow-300 underline"
                >
                  Crear mi primer grupo
                </button>
              </div>
            )
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-700">
            Grupos como Invitado ({guestGroups.length})
          </h2>
          {!loading && guestGroups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {guestGroups.map((group) => (
                <GroupCard 
                  key={group.id} 
                  {...group} 
                  isCreator={false}
                />
              ))}
            </div>
          ) : (
            !loading && (
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <p className="text-gray-400">No participas en otros grupos</p>
              </div>
            )
          )}
        </section>
      </div>


      {modalIsOpen && (
        <CreateGroupModal 
          onClose={() => setModal(false)} 
          onGroupCreated={handleGroupCreated}
        />
      )}
    </div>
  );
};

export default Grupos;