import React from "react";
import "../background.css"; // Make sure .bg-custom is set up

const Login = () => {
  return (
    <div className="bg-custom min-h-screen w-full">
      
      <div className="w-full flex justify-center">
        <img
          src="../src/assets/images/logo.jpg"
          alt="Logo"
          className="w-50 h-auto mt-0"
        />
      </div>

      <div className="flex justify-center items-center mt-30">
        <form className="w-full max-w-md bg-white bg-opacity-90 p-6 rounded-lg shadow-lg">
          <div className="flex flex-col space-y-4">
            
            <label className="text-gray-700 font-semibold">Email</label>
            <input
              type="text"
              className="w-full p-2 border rounded bg-white"
              placeholder="Email"
            />

            <label className="text-gray-700 font-semibold">Mot de passe</label>
            <input
              type="password"
              className="w-full p-2 border rounded bg-white"
              placeholder="Mot de passe"
            />

            <button
              type="submit"
              style={{ backgroundColor: "#8f1630" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#a83b52")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#8f1630")}
              className="w-full text-white font-semibold py-2 rounded transition"
            >
              Se connecter
            </button>
            <p className="text-center text-sm text-gray-700 mt-1">
                Vous n’avez pas de compte ?{" "}
                <a href="/register" className="text-[#8f1630] font-semibold hover:underline">
                 Inscrivez-vous
                </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
