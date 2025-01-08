import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, addDoc, getDocs } from '../firebase';

const LoginPage = () => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Verifica se o usuário já está logado
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      // Se o usuário já estiver logado, redireciona
      if (parsedUser.department.toLowerCase() === 'ti') {
        navigate('/TicketsPage');
      } else {
        navigate('/TicketForm');
      }
    }
  }, [navigate]);

  // Função para verificar se o usuário já existe no Firestore
  const checkUserExists = async (name: string, department: string) => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users = querySnapshot.docs.map(doc => doc.data());
    return users.find(user => user.name === name && user.department === department);
  };

  const handleLogin = async () => {
    if (!name || !department) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    // Verifica se o usuário já existe
    const existingUser = await checkUserExists(name, department);
    if (existingUser) {
      // Se já existir, armazena no localStorage
      localStorage.setItem('user', JSON.stringify(existingUser));
      // Redireciona com base no setor
      if (existingUser.department.toLowerCase() === 'ti') {
        navigate('/TicketsPage');
      } else {
        navigate('/TicketForm');
      }
    } else {
      // Caso não exista, cria um novo usuário
      try {
        const docRef = await addDoc(collection(db, 'users'), {
          name,
          department,
        });

        const newUser = {
          id: docRef.id,
          name,
          department,
        };

        // Armazena o usuário no localStorage
        localStorage.setItem('user', JSON.stringify(newUser));

        // Redireciona com base no setor
        if (department.toLowerCase() === 'ti') {
          navigate('/TicketsPage');
        } else {
          navigate('/TicketForm');
        }
      } catch (error) {
        console.error('Erro ao criar o usuário:', error);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-4 px-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Login</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              className="w-full border border-input bg-white px-3 py-2 rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 placeholder:text-muted-foreground"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Setor</label>
            <input
              type="text"
              className="w-full border border-input bg-white px-3 py-2 rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 placeholder:text-muted-foreground"
              placeholder="Seu setor (ex.: TI, Vendas)"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
          <button
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
