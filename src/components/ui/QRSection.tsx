import Image from "next/image";

export default function QRSection() {
  return (
    <div className="hidden md:flex md:w-1/2 bg-gray-100 flex-col items-center justify-center gap-6">
      {/* Polycab Logo */}
      <Image
        src="/images/polycab.png"
        alt="Polycab"
        width={150}
        height={200}
        className="h-auto w-auto"
        priority
      />

      {/* QR Code */}
      <div className="rounded-xl bg-white p-3 shadow-lg border">
        <Image
          src="/images/qr-code.png" // <-- Your QR image
          alt="Solar Logger QR Code"
          width={180}
          height={180}
          className="rounded-md"
        />
      </div>
    </div>
  );
}
