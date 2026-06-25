import QRSection from "@/components/ui/QRSection";

export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl flex flex-col md:flex-row overflow-hidden">
      <QRSection />
      <div className="w-full md:w-1/2 md:min-h-[56vh] p-6 sm:p-10 flex justify-center">
        {children}
      </div>
    </div>
  );
}
