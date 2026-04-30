const AJOK_PDF_TEMPLATE_HREF = "/templates/ajok-koirakohtainen-poytakirja.pdf";
const AJOK_PDF_VIEWER_HREF = `${AJOK_PDF_TEMPLATE_HREF}#page=1&zoom=page-width`;

type BeagleTrialPdfPageProps = {
  trialId: string;
};

export function BeagleTrialPdfPage({ trialId }: BeagleTrialPdfPageProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background">
      <iframe
        aria-label="AJOK koirakohtainen pöytäkirja"
        className="block h-full w-full border-0"
        data-trial-id={trialId}
        src={AJOK_PDF_VIEWER_HREF}
        title="AJOK koirakohtainen pöytäkirja"
      />
    </div>
  );
}
