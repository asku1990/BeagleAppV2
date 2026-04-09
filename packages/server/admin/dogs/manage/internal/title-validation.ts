import {
  parseAdminDogTitles,
  type AdminDogTitleInputNormalized,
} from "../normalization";

export type DogTitleValidationResult =
  | {
      ok: true;
      titles: AdminDogTitleInputNormalized[];
    }
  | {
      ok: false;
      response: {
        status: 400;
        body: {
          ok: false;
          error: string;
          code:
            | "INVALID_TITLE_CODE"
            | "INVALID_TITLE_AWARDED_ON"
            | "INVALID_TITLE_SORT_ORDER"
            | "DUPLICATE_DOG_TITLE";
        };
      };
    };

export function validateDogTitles(
  input:
    | Array<{
        awardedOn?: string | null;
        titleCode: string;
        titleName?: string | null;
        sortOrder?: number;
      }>
    | undefined,
): DogTitleValidationResult {
  const parsed = parseAdminDogTitles(input);
  if (!parsed.ok) {
    return {
      ok: false,
      response: {
        status: 400,
        body: {
          ok: false,
          error: parsed.error,
          code: parsed.code,
        },
      },
    };
  }

  return {
    ok: true,
    titles: parsed.titles,
  };
}
