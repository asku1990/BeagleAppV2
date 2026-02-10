import Image from "next/image";

type MainHeaderProps = {
  title: string;
  description: string;
};

export function MainHeader({ title, description }: MainHeaderProps) {
  return (
    <header className="beagle-panel beagle-hero px-5 py-5 md:px-6 md:py-6">
      <div className="flex items-center gap-3 md:gap-4">
        <Image
          src="/beagle-legacy-logo.png"
          alt="Suomen Beaglejärjestö logo"
          width={132}
          height={74}
          className="h-auto w-[110px] rounded-sm border border-[var(--beagle-border)] bg-white p-1 md:w-[132px]"
        />
        <h1 className="text-3xl font-semibold leading-tight text-[var(--beagle-ink)] md:text-4xl">
          {title}
        </h1>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--beagle-muted)] md:text-base">
        {description}
      </p>
    </header>
  );
}
