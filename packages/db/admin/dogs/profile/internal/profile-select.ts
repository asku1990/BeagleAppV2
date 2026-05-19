import { Prisma } from "@prisma/client";

export const adminDogProfileSelect = Prisma.validator<Prisma.DogSelect>()({
  id: true,
  name: true,
  registrations: {
    select: {
      registrationNo: true,
      createdAt: true,
    },
  },
  birthDate: true,
  sex: true,
  ekNo: true,
  siitosasteProsentti: true,
  sire: {
    select: {
      id: true,
      name: true,
      ekNo: true,
      registrations: {
        select: {
          registrationNo: true,
          createdAt: true,
        },
      },
    },
  },
  dam: {
    select: {
      id: true,
      name: true,
      ekNo: true,
      registrations: {
        select: {
          registrationNo: true,
          createdAt: true,
        },
      },
    },
  },
  whelpedPuppies: {
    include: {
      registrations: true,
      sire: { include: { registrations: true } },
      dam: { include: { registrations: true } },
      whelpedPuppies: {
        select: {
          id: true,
          birthDate: true,
          sire: {
            select: {
              id: true,
              registrations: true,
            },
          },
          dam: {
            select: {
              id: true,
              registrations: true,
            },
          },
        },
      },
      siredPuppies: {
        select: {
          id: true,
          birthDate: true,
          sire: {
            select: {
              id: true,
              registrations: true,
            },
          },
          dam: {
            select: {
              id: true,
              registrations: true,
            },
          },
        },
      },
      _count: {
        select: {
          showEntries: true,
          trialEntries: true,
        },
      },
    },
  },
  siredPuppies: {
    include: {
      registrations: true,
      sire: { include: { registrations: true } },
      dam: { include: { registrations: true } },
      whelpedPuppies: {
        select: {
          id: true,
          birthDate: true,
          sire: {
            select: {
              id: true,
              registrations: true,
            },
          },
          dam: {
            select: {
              id: true,
              registrations: true,
            },
          },
        },
      },
      siredPuppies: {
        select: {
          id: true,
          birthDate: true,
          sire: {
            select: {
              id: true,
              registrations: true,
            },
          },
          dam: {
            select: {
              id: true,
              registrations: true,
            },
          },
        },
      },
      _count: {
        select: {
          showEntries: true,
          trialEntries: true,
        },
      },
    },
  },
  breederNameText: true,
  note: true,
  breeder: {
    select: {
      name: true,
      ownerName: true,
      city: true,
      detailsSource: true,
    },
  },
  ownerships: {
    select: {
      owner: {
        select: {
          name: true,
          postalCode: true,
          city: true,
        },
      },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  },
  sairaudet: {
    select: {
      id: true,
      julkinen: true,
      tietolahde: true,
      sairaus: {
        select: {
          sairausTeksti: true,
          sairausRyhma: true,
        },
      },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  },
});
