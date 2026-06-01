import { AdminDogProfilePageContainer } from "@/components/admin/dogs/profile";

export default async function AdminDogProfilePage({
  params,
}: {
  params: Promise<{ dogId: string }>;
}) {
  const { dogId } = await params;

  return <AdminDogProfilePageContainer dogId={dogId} />;
}
