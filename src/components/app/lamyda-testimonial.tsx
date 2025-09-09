import { Play } from "lucide-react";

export default function LamydaTestimonial() {
  return (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center p-12">
      <div className="max-w-xl text-left">
        <div className="mb-8">
          <div className="mb-6">
            <img 
              src="/src/assets/logo.png" 
              alt="Lamyda Logo" 
              className="h-6 w-auto"
            />
          </div>
          <h1 className="text-5xl font-light mb-2 leading-tight text-gray-900">
           Somos o Cerebro Digital da Sua Empresa.
          </h1>
        </div>
        
        <div className="w-20 h-0.5 bg-gray-300 mb-8"></div>
        
        <p className="text-md leading-relaxed mb-8 text-gray-600 max-w-lg">
          A Lamyda usa inteligência artificial para criar, centralizar e gerenciar processos, políticas, SOPs, integrações e treinamentos com eficiência. Tudo de forma automatizada e eficiente.
        </p>

        <p className="text-md text-gray-600 mb-8">
          Ouça o que nossos clientes têm a dizer sobre a Lamyda.
        </p>

        <div className="relative mb-12 rounded-2xl overflow-hidden shadow-lg max-w-lg">
          <div className="relative aspect-video">
            <iframe
              src="https://www.youtube.com/embed/S-jM16pFIbg?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=S-jM16pFIbg"
              title="Lamyda Demo Video"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>

            <div className="absolute inset-0 flex flex-col justify-between p-6">

              <div className="flex-1 flex items-center">
                <div className="text-white">
                  <div className="text-4xl font-light mb-4 opacity-40">
                    <img src="/src/assets/image.png" alt="w1-logo" className="h-4" />
                  </div>
                  <p className="text-lg font-light leading-relaxed">
                    Nós usamos a Lamyda para centralizar todos os processos, e melhoramos em 35% a produtividade da nossa equipe. 
                  </p>
                  <div className="text-sm mt-4 opacity-50">Matheus Bacha - CPO, W1 Inc</div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200">
                  <Play className="w-4 h-4" />
                  <span className="text-sm font-medium">Assistir Vídeo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
       
      </div>
    </div>
  );
}
