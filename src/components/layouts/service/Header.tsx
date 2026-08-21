import LanguageDropdown from "@/components/ui/LanguageDropdown";

export default function Header() {
  return (
    <header className="h-14 bg-slate-900 text-white flex items-center justify-between px-4">
      <h1 className="text-red-500 font-bold text-lg">
        POLYCAB
      </h1>

      <div className="flex items-center gap-4 text-sm">
        <span>polycab.admin</span>
        <LanguageDropdown />
      </div>
    </header>
  );
}
