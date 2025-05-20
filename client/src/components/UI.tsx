import React from 'react';

type LogoProps = {
  height?: number;
  bg?: string;
};

export const Logo = ({ height = 30, bg = '#efefef' }: LogoProps) => {
  return (
    <img
      src="/img/logo.svg"
      alt="JSGradesLogo"
      className={`absolute top-4 left-8 h-${height} w-auto bg-[${bg}]`}
    />
  );
};
