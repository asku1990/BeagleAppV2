import type { ReactNode } from "react";

type RegistrationNameOptions = {
  registrationNo: string | null | undefined;
  name: string | null | undefined;
  unknownLabel: string;
  emphasizeName?: boolean;
  missingRegistrationPrefix?: string;
};

export function renderRegistrationNameText({
  registrationNo,
  name,
  unknownLabel,
  emphasizeName = true,
  missingRegistrationPrefix = "-",
}: RegistrationNameOptions): ReactNode {
  const safeName = name?.trim();
  const safeRegistrationNo = registrationNo?.trim();

  if (!safeName) {
    return unknownLabel;
  }

  const nameNode = emphasizeName ? (
    <span className="font-semibold">{safeName}</span>
  ) : (
    safeName
  );

  if (!safeRegistrationNo) {
    const safeMissingPrefix = missingRegistrationPrefix.trim();

    if (!safeMissingPrefix) {
      return nameNode;
    }

    return (
      <>
        {`${safeMissingPrefix} `}
        {nameNode}
      </>
    );
  }

  return (
    <>
      {safeRegistrationNo} {nameNode}
    </>
  );
}
