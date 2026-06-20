import Image from "next/image";

const BrandLogo = () => {
  // const handleClick = () => {
  //   alert("Logo clicked");
  // };

  return (
    <div className="cursor-pointer">
      <Image
        src="/images/polycab-logo.png"
        alt="Polycab Logo"
        width={500}
        height={200}
        priority
        className="w-24 sm:w-36 h-auto object-contain"
      />
    </div>
  );
};

export default BrandLogo;