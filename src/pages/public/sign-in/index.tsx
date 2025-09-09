import { Button } from "@/components/ui/button";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function SignIn() {

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      setError('Falha no login. Verifique suas credenciais.');
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div>
      <p className="text-gray-500 mb-6 text-sm">
        Digite seu e-mail e senha para acessar a plataforma.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="text-sm mb-1 font-medium">
            Endereço de e-mail
          </label>
          <div className="flex items-center border border-gray-300 h-12 px-3 bg-white">
            <input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              className="flex-1 bg-transparent border-none outline-none text-base placeholder-gray-400 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">
              Senha
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-lamyda-gray transition-colors duration-200 hover:underline underline-offset-5"
            >
              Esqueci minha senha
            </Link>
          </div>
          <div className="flex items-center border border-gray-300 h-12 px-3 bg-white">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              className="flex-1 bg-transparent border-none outline-none text-base placeholder-gray-400 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="ml-2 text-gray-400 focus:outline-none transition-colors duration-200"
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
          className="bg-lamyda-primary font-medium rounded-none h-10 text-sm cursor-pointer hover:brightness-110"
          disabled={submitting}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              Acessando conta...
            </span>
          ) : (
            <>
              <LogIn className="w-5 h-5 mr-1" />
              Acessar Conta
            </>
          )}
        </Button>

        <div className="flex items-center text-sm my-2">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-4 text-gray-400 font-normal">Ou</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <div className="text-center text-sm text-lamyda-gray">
          Não tem uma conta?{" "}
          <Link
            to="/sign-up"
            className="font-medium text-lamyda-gray transition-colors duration-200 underline underline-offset-4 hover:brightness-130"
          >
            Cadastre-se
          </Link>
        </div>
      </form>
    </div>
  );
}