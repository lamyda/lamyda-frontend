import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    inviteCode: '',
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        inviteCode: formData.inviteCode
      });

      if (result.error) {
        setError(result.error);
      } else {
        navigate('/sign-in', { 
          state: { 
            message: 'Conta criada com sucesso! Verifique seu email para confirmar sua conta.' 
          }
        });
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
      console.error('Erro no signup:', err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div>
      <p className="text-lamyda-gray mb-6 text-sm">
        Preencha os dados abaixo para criar sua conta. É necessário um código de convite válido.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        
        <div className="flex flex-col gap-1">
          <label className="text-sm mb-1 font-medium">
            Código de Convite *
          </label>
          <div className="flex items-center border h-12 px-3 bg-white">
            <input
              id="inviteCode"
              name="inviteCode"
              type="text"
              placeholder="Digite seu código de convite"
              className="flex-1 bg-transparent border-none outline-none text-base placeholder-gray-400 text-sm"
              required
              value={formData.inviteCode}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm mb-1 font-medium">
            Nome completo *
          </label>
          <div className="flex items-center border h-12 px-3 bg-white">
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Digite seu nome completo"
              className="flex-1 bg-transparent border-none outline-none text-base placeholder-gray-400 text-sm"
              required
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm mb-1 font-medium">
            Endereço de e-mail *
          </label>
          <div className="flex items-center border h-12 px-3 bg-white">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Digite seu e-mail"
              className="flex-1 bg-transparent border-none outline-none text-base placeholder-gray-400 text-sm"
              required
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm mb-1 font-medium">
            Senha *
          </label>
          <div className="flex items-center border h-12 px-3 bg-white">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha (mín. 6 caracteres)"
              className="flex-1 bg-transparent border-none outline-none text-base placeholder-gray-400 text-sm"
              required
              minLength={6}
              value={formData.password}
              onChange={handleInputChange}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="ml-2 text-gray-400 hover:brightness-130 focus:outline-none transition-colors duration-200"
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="bg-lamyda-primary font-medium rounded-none h-10 text-sm cursor-pointer hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !formData.inviteCode || !formData.name || !formData.email || !formData.password}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Criando conta...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5 mr-1" />
              Criar Conta
            </span>
          )}
        </Button>

        <div className="flex items-center text-sm my-2">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-4 text-gray-400 font-normal">Ou</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <div className="text-center text-sm text-lamyda-gray">
          Já tem uma conta?{" "}
          <Link
            to="/sign-in"
            className="text-lamyda-gray hover:brightness-130 font-medium transition-colors duration-200 underline underline-offset-4" 
          >
            Fazer Login
          </Link>
        </div>
      </form>
    </div>
  );
}