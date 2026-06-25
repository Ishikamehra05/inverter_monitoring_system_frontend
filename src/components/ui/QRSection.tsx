import Image from "next/image";

export default function QRSection() {
  return (
    <div className="hidden md:flex md:w-1/2 bg-gray-100 flex-col items-center justify-center gap-4">
      
      <Image
        src="/images/polycab.png"
        alt="Polycab"
        width={150}
        height={200}
        className="h-auto w-auto"
        priority
      />

      <div className="w-36 h-36 bg-white border flex items-center justify-center">
        <span className="text-xs text-gray-400">QR CODE</span>
      </div>

    </div>
  );
}