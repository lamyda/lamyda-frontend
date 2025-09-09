import { Button } from "@/components/ui/button";
import { CheckCircle, User2, UsersRound } from "lucide-react";
import LamydaLogo from "@/components/app/lamyda-logo";
import LamydaTestimonial from "@/components/app/lamyda-testimonial";
import UserAccount from "@/components/app/user-account";
import { useOnboarding } from "@/contexts/OnboardingContext";

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayout({ }: OnboardingLayoutProps) {
  const {
    currentStep,
    onboardingData,
    isSubmitting,
    setCurrentStep,
    updateOnboardingData,
    completeOnboarding,
    canProceedToNext
  } = useOnboarding();

  const totalSteps = 2;

  const handleSelect = (option: 'personal' | 'company') => {
    updateOnboardingData({ selectedOption: option });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleWorkspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateOnboardingData({ workspaceName: e.target.value });
  };

  const handleWorkspaceDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateOnboardingData({ workspaceDescription: e.target.value });
  };



  const renderStep1 = () => (
    <div>
      <div className="mb-3">
        <span className="text-sm text-gray-500 font-medium">
          Etapa 1 de 2
        </span>
      </div>

      <div className="mb-8">
        <h1 className="text-lg font-semibold mb-2 text-gray-900">
          Como você planeja usar a Lamyda?
        </h1>
        <p className="text-gray-600 text-[13px] leading-relaxed">
          Escolha a opção que melhor descreve como você pretende usar nossa plataforma.
        </p>
      </div>
      
      <div className="space-y-3">
        <div 
          className={`flex items-start gap-4 p-4 rounded-none cursor-pointer transition-colors relative ${
            onboardingData.selectedOption === 'personal' 
              ? 'border border-[#2600c8] bg-[#efecff]' 
              : 'border border-gray-200 bg-white hover:bg-gray-50'
          }`}
          onClick={() => handleSelect('personal')}
        >
          <div className="flex-shrink-0 mt-1">
            <div className={`w-10 h-10 rounded-none flex items-center justify-center ${
              onboardingData.selectedOption === 'personal' 
                ? 'bg-lamyda-primary' 
                : 'bg-gray-200'
            }`}>
              <User2 className={`w-5 h-5 ${onboardingData.selectedOption === 'personal' ? 'text-white' : 'text-gray-600'}`} />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1 text-sm">
              Para uso pessoal
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Para uso pessoal, você pode usar a Lamyda para organizar rotinas, processos e documentos.
            </p>
          </div>
          {onboardingData.selectedOption === 'personal' && (
            <CheckCircle className="w-5 h-5 text-[#2600c8] absolute top-3 right-3" />
          )}
        </div>

        <div 
          className={`flex items-start gap-4 p-4 rounded-none cursor-pointer transition-colors relative ${
            onboardingData.selectedOption === 'company' 
              ? 'border border-[#2600c8] bg-[#efecff]' 
              : 'border border-gray-200 bg-white hover:bg-gray-50'
          }`}
          onClick={() => handleSelect('company')}
        >
          <div className="flex-shrink-0 mt-1">
            <div className={`w-10 h-10 rounded-none flex items-center justify-center ${
              onboardingData.selectedOption === 'company' 
                ? 'bg-lamyda-primary' 
                : 'bg-gray-200'
            }`}>
              <UsersRound className={`w-5 h-5 ${onboardingData.selectedOption === 'company' ? 'text-white' : 'text-gray-600'}`}/>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1 text-sm">
              Para uso empresarial
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Para uso empresarial, você destrava todo o poder da Lamyda para gerenciar o conhecimento da sua empresa.
            </p>
          </div>
          {onboardingData.selectedOption === 'company' && (
            <CheckCircle className="w-5 h-5 text-[#2600c8] absolute top-3 right-3" />
          )}
        </div>
      </div>
      
        <div className="mt-8">
          <Button
            onClick={handleNext}
            className="bg-lamyda-primary font-medium rounded-none h-10 text-sm cursor-pointer hover:brightness-110 w-full"
            disabled={!onboardingData.selectedOption}
          >
            Próximo
          </Button>
        </div>
    </div>
  );

  const renderStep2 = () => {
    const isPersonal = onboardingData.selectedOption === 'personal';
    
    return (
      <div>
        <div className="mb-3">
          <span className="text-sm text-gray-500 font-medium">
            Etapa 2 de 2
          </span>
        </div>

        <div className="mb-8">
          <h1 className="text-lg font-semibold mb-2 text-gray-900">
            Quase lá!
          </h1>
          <p className="text-gray-600 text-[13px] leading-relaxed">
            Agora precisamos de algumas informações sobre {isPersonal ? 'seu workspace' : 'sua empresa'}. Aqui na Lamyda você tem seu próprio workspace seguro exclusivo.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-900 mb-1 font-medium">
              {isPersonal ? 'Nome do Workspace' : 'Nome da Empresa'}
            </label>
            <div className="flex items-center border border-gray-300 h-12 px-3 bg-white">
              <input
                type="text"
                placeholder={isPersonal ? 'Meu Workspace Pessoal' : 'Minha Empresa Ltda'}
                className="flex-1 bg-white outline-none text-sm placeholder-gray-400 text-gray-900"
                value={onboardingData.workspaceName}
                onChange={handleWorkspaceNameChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-900 mb-1 font-medium">
              {isPersonal ? 'Fale um pouco como quer usar a Lamyda' : 'Dê detalhes da sua empresa'}
            </label>
            <div className="border border-gray-300 bg-white focus-within:border-lamyda-primary">
              <textarea
                placeholder={isPersonal 
                  ? "Ex: Quero organizar minha rotina pessoal, gerenciar projetos freelancer e centralizar documentos importantes..." 
                  : "Ex: Somos uma consultoria de marketing digital com 15 funcionários, precisamos centralizar processos de atendimento ao cliente..."
                }
                className="w-full bg-transparent border-none outline-none text-sm placeholder-gray-400 text-gray-900 p-3 resize-none h-24"
                value={onboardingData.workspaceDescription}
                onChange={handleWorkspaceDescriptionChange}
                maxLength={500}
              />
            </div>
            <div className="flex justify-between items-start mt-1">
              <p className="text-xs text-gray-500">
                Nossa inteligência artificial utilizará essas informações para personalizar a plataforma especialmente para você
              </p>
              <span className="text-xs text-gray-400 ml-2">
                {onboardingData.workspaceDescription.length}/500
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col gap-3">
          <Button
            onClick={currentStep < totalSteps ? handleNext : completeOnboarding}
            className="bg-lamyda-primary font-medium rounded-none h-10 text-sm cursor-pointer hover:brightness-110 w-full"
            disabled={!canProceedToNext() || isSubmitting}
          >
            {currentStep < totalSteps ? 'Próximo' : (isSubmitting ? 'Finalizando...' : 'Finalizar')}
          </Button>
          <Button
            onClick={() => setCurrentStep(currentStep - 1)}
            variant="outline"
            className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-medium rounded-none h-10 text-sm cursor-pointer w-full shadow-none"
            disabled={isSubmitting}
          >
            Anterior
          </Button>
        </div>
      </div>
    );
  };


  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      default:
        return renderStep1();
    }
  };

  const renderStep = () => (
    <div>
      {renderCurrentStep()}
    </div>
  );



  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <div className="w-full max-w-lg flex flex-col justify-between bg-white px-8 py-10 min-h-screen border-r border-gray-200">
        <div>
          <div className="flex mb-5 border-b border-gray-200 pb-7">
            <LamydaLogo />
          </div>
          {renderStep()}
        </div>
      </div>
      <div className="flex-1 min-h-screen">
        <LamydaTestimonial />
      </div>
      <UserAccount isFirstOnboarding={true} />
    </div>
  );
}
