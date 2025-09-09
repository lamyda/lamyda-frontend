import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {

  return (
    <div>
      <p className="text-lamyda-gray mb-6 text-sm">
        Iremos enviar um e-mail com um código para você cadastrar uma nova senha.
      </p>

      <form className="flex flex-col gap-4" onSubmit={() => {}}>
        <div className="flex flex-col gap-1">
          <label className="text-sm mb-1 font-medium">
            Endereço de e-mail
          </label>
          <div className="flex items-center border h-12 px-3 bg-white">
            <input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              className="flex-1 bg-transparent border-none outline-none text-base placeholder-gray-400 text-sm"
              value=""
              onChange={(_e) => {}}
              disabled={false}
              required
            />
          </div>
        </div>

        <Button
          className="bg-lamyda-primary font-medium rounded-none h-10 text-sm cursor-pointer hover:brightness-110"
          disabled={false}
        >
          {false ? (
            <span className="flex items-center justify-center gap-2">
              Enviando e-mail...
            </span>
          ) : (
            <>
              <Mail className="w-5 h-5 mr-1" />
              Enviar link de redefinição
            </>
          )}
        </Button>

      </form>

      <div className="flex justify-center mt-4 w-full">
        <Link to="/sign-in" className="w-full">
            <Button
            className="bg-white hover:bg-gray-100 text-black font-medium rounded-none h-10 text-sm cursor-pointer border w-full shadow-none"
            >
            <ArrowLeft className="w-5 h-5 mr-1" />
                Voltar para Login
            </Button>
        </Link>
      </div>
    </div>
  );
}