import BackgroundPublic from '@/components/app/background-public';
import CopyrightFooter from '@/components/app/copyright-footer';
import { Link } from 'react-router-dom';
import LamydaLogo from '@/components/app/lamyda-logo';

interface LayoutPublicProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: LayoutPublicProps) {
  return (
    <div className="flex min-h-screen">
      <BackgroundPublic />
      <div className="w-full max-w-md flex flex-col justify-between bg-white px-8 py-10 min-h-screen">
        <div>
          <div className="flex items-center justify-between mb-5 border-b border-gray-200 pb-7">
            <div className="flex items-center gap-2">
              <Link to="/" className="cursor-pointer">
                <LamydaLogo />
              </Link>
            </div>
          </div>
          <div className="mt-5">
            {children}
          </div>
        </div>
        <CopyrightFooter />
      </div>
    </div>
  );
}