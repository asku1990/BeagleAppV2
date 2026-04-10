import type { AdminDogFormValues } from "@/components/admin/dogs/types";

type NamedEntityOption = {
  id: string;
  name: string;
};

// Provides pure immutable update helpers used by dog-form modal sections.
export function appendSecondaryRegistration(
  values: AdminDogFormValues,
): AdminDogFormValues {
  return {
    ...values,
    secondaryRegistrationNos: [...values.secondaryRegistrationNos, ""],
  };
}

export function setSecondaryRegistrationAt(
  values: AdminDogFormValues,
  index: number,
  registrationNo: string,
): AdminDogFormValues {
  return {
    ...values,
    secondaryRegistrationNos: values.secondaryRegistrationNos.map(
      (value, valueIndex) =>
        valueIndex === index ? registrationNo.toUpperCase() : value,
    ),
  };
}

export function removeSecondaryRegistrationAt(
  values: AdminDogFormValues,
  index: number,
): AdminDogFormValues {
  return {
    ...values,
    secondaryRegistrationNos: values.secondaryRegistrationNos.filter(
      (_value, valueIndex) => valueIndex !== index,
    ),
  };
}

export function addOwnerFromCandidate(
  values: AdminDogFormValues,
  ownerCandidateId: string,
  ownerOptions: NamedEntityOption[],
): { values: AdminDogFormValues; ownerCandidate: string } {
  if (!ownerCandidateId) {
    return { values, ownerCandidate: ownerCandidateId };
  }

  const selectedOwner = ownerOptions.find(
    (option) => option.id === ownerCandidateId,
  );
  if (!selectedOwner) {
    return { values, ownerCandidate: ownerCandidateId };
  }

  if (values.ownershipNames.includes(selectedOwner.name)) {
    return { values, ownerCandidate: "" };
  }

  return {
    values: {
      ...values,
      ownershipNames: [...values.ownershipNames, selectedOwner.name],
    },
    ownerCandidate: "",
  };
}

export function removeOwnerByName(
  values: AdminDogFormValues,
  ownerName: string,
): AdminDogFormValues {
  return {
    ...values,
    ownershipNames: values.ownershipNames.filter((name) => name !== ownerName),
  };
}

export function appendTitle(values: AdminDogFormValues): AdminDogFormValues {
  return {
    ...values,
    titles: [
      ...values.titles,
      {
        awardedOn: "",
        titleCode: "",
        titleName: "",
      },
    ],
  };
}

export function updateTitleAt(
  values: AdminDogFormValues,
  index: number,
  patch: Partial<AdminDogFormValues["titles"][number]>,
): AdminDogFormValues {
  return {
    ...values,
    titles: values.titles.map((value, valueIndex) =>
      valueIndex === index ? { ...value, ...patch } : value,
    ),
  };
}

export function removeTitleAt(
  values: AdminDogFormValues,
  index: number,
): AdminDogFormValues {
  return {
    ...values,
    titles: values.titles.filter((_value, valueIndex) => valueIndex !== index),
  };
}

export function moveTitleUp(
  values: AdminDogFormValues,
  index: number,
): AdminDogFormValues {
  if (index <= 0 || index >= values.titles.length) {
    return values;
  }

  const reordered = [...values.titles];
  const current = reordered[index];
  reordered[index] = reordered[index - 1];
  reordered[index - 1] = current;

  return { ...values, titles: reordered };
}

export function moveTitleDown(
  values: AdminDogFormValues,
  index: number,
): AdminDogFormValues {
  if (index < 0 || index >= values.titles.length - 1) {
    return values;
  }

  const reordered = [...values.titles];
  const current = reordered[index];
  reordered[index] = reordered[index + 1];
  reordered[index + 1] = current;

  return { ...values, titles: reordered };
}
