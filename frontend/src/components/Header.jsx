import { Link } from "react-router-dom";

const Header = () => {
  return (
    <nav className="p-4 bg-gray-800 flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-4">
        <Link to="/">
          <img
            src="/conexxo.png"
            className="h-24 w-24 object-contain"
            alt="Logo"
          />
        </Link>
        <h1 className="text-3xl font-bold">ConneXXo</h1>
      </div>
    </nav>
  );
};

export default Header;
