import { SignInForm } from "@/components/auth";

type SignInPageProps = {
  searchParams: Promise<{
    returnTo?: string | string[];
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  return <SignInForm returnTo={params.returnTo} />;
}
