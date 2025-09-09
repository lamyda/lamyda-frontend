export default function CopyrightFooter() {
    return (
    <div className="items-center justify-center mt-10">
      <span className="text-xs text-lamyda-gray">© 2025 Lamyda</span>
        <div className="text-xs text-lamyda-gray mt-2">
            Ao fazer login ou criar uma conta, você reconhece e aceita nossos{" "}
            <a href="#" className="underline underline-offset-4 hover:text-gray-700 cursor-pointer">
                Termos e Condições Gerais
            </a>
            {" "}e{" "}
            <a href="#" className="underline underline-offset-4 hover:text-gray-700 cursor-pointer">
              Política de Privacidade
            </a>
          </div>
    </div>
    )
}