import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import groupImage from "../../public/group.svg";

const groups = [
  { id: 1, name: "Grupo 1" },
  { id: 2, name: "Grupo 2" },
  { id: 3, name: "Grupo 3" },
  { id: 4, name: "Grupo 4" },
  { id: 5, name: "Grupo 5" },
  { id: 6, name: "Grupo 6" },
];

const GroupCard = ({ name }) => {
  return (
    <Link to={`/chatgrupal/`}>
      <div className="bg-gray-800 p-4 rounded-lg cursor-pointer transition-opacity hover:opacity-75 active:opacity-50">
        <img className="w-20 h-20 mx-auto" src={groupImage} alt="Imagen del grupo" />
        <h2 className="text-xl font-bold text-center mb-3">{name}</h2>
      </div>
    </Link>
  );
};

const CreateGroupModal = ({ onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [newMember, setNewMember] = useState("");
  const [members, setMembers] = useState([]);

  const addGroup = () => {
    if (!groupName) return;
    groups.push({ id: groups.length + 1, name: groupName });
    onClose();
  };

  const addMember = () => {
    if (!newMember) return;
    setMembers([...members, { id: members.length + 1, name: newMember }]);
    setNewMember("");
  };

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-fit rounded bg-gray-500 p-4 flex flex-col items-center justify-center gap-3">
      <h3 className="font-medium text-lg">Crear grupo</h3>
      <input
        type="text"
        placeholder="Nombre del grupo"
        className="w-full p-2 rounded"
        onChange={(event) => setGroupName(event.target.value)}
      />
      <div className="w-full flex flex-row gap-3">
        <input
          type="text"
          placeholder="Invitar a..."
          className="w-full p-2 rounded"
          value={newMember}
          onChange={(event) => setNewMember(event.target.value)}
        />
        <button onClick={addMember}>+</button>
      </div>
      <div className="w-full">
        <h4 className="text-lg text-center">Miembros</h4>
        <ul>
          {members.map((member) => (
            <li key={member.id}>{member.name}</li>
          ))}
        </ul>
      </div>
      <div className="flex flex-row gap-3">
        <button onClick={addGroup}>Guardar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
};

const Grupos = () => {
  const [modalIsOpen, setModal] = useState(false);
  const openModal = () => setModal(true);
  const closeModal = () => setModal(false);

  return (
    <div className="h-screen w-screen bg-gray-900 text-white relative overflow-x-hidden">
      <Header />
      <nav className="absolute right-3 top-3">
        <Link to="/" className="text-yellow-400 hover:text-yellow-300 ">← Volver al Inicio</Link>
      </nav>
      <main className="py-3 relative">
        <h1 className="text-center mb-6">Mis grupos</h1>
        <button
          onClick={openModal}
          className="absolute right-3 top-12 bg-gray-800 p-2 rounded-lg transition hover:bg-gray-700 active:opacity-50"
        >
          Crear grupo
        </button>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-3xl mx-auto">
          {groups.map((group) => (
            <GroupCard key={group.id} {...group} />
          ))}
        </div>
      </main>
      {modalIsOpen && <CreateGroupModal onClose={closeModal} />}
    </div>
  );
};

export default Grupos;
