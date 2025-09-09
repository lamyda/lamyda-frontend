import lamydaLogo from '@/assets/logo.png'

export default function LamydaLogo() {
  return (
    <img 
        src={lamydaLogo}
        alt="Logo"
        className="w-26 object-contain"
        width={100}
        height={100}
    />
  )
}