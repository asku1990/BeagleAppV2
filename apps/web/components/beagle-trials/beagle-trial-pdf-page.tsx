import { getTrialPdfApiHref } from "@/lib/public/beagle/trials";

type BeagleTrialPdfPageProps = {
  trialId: string;
};

export function BeagleTrialPdfPage({ trialId }: BeagleTrialPdfPageProps) {
  const pdfViewerHref = `${getTrialPdfApiHref(trialId)}#page=1&zoom=page-width`;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <iframe
        aria-label="AJOK koirakohtainen pöytäkirja"
        className="block h-full w-full border-0"
        data-trial-id={trialId}
        src={pdfViewerHref}
        title="AJOK koirakohtainen pöytäkirja"
      />
    </div>
  );
}
