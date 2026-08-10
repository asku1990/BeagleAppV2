import * as React from "react";

const RESULT_CREATE_WORKSPACE_BREAKPOINT = 1024;

export function useResultCreateWorkspaceMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia(
      `(max-width: ${RESULT_CREATE_WORKSPACE_BREAKPOINT - 1}px)`,
    );
    const update = () => setIsMobile(query.matches);

    query.addEventListener("change", update);
    update();
    return () => query.removeEventListener("change", update);
  }, []);

  return isMobile;
}
