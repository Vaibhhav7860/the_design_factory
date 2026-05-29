"use client";

import { useState } from "react";
import { HiOutlineDownload } from "react-icons/hi";
import { Button } from "./Button";
import ExportDialog from "./ExportDialog";

/**
 * Thin wrapper that renders a button + the export dialog. Lives in a client
 * island so the parent page can stay a Server Component.
 */
export default function ExportButton({
  resource,
  filename,
  apiPath,
  total,
  matchedTotal,
  currentPage,
  currentPerPage,
  currentQuery,
  extraQuery,
  label = "Export",
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        iconLeft={<HiOutlineDownload />}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <ExportDialog
        open={open}
        onClose={() => setOpen(false)}
        resource={resource}
        filename={filename}
        apiPath={apiPath}
        total={total}
        matchedTotal={matchedTotal}
        currentPage={currentPage}
        currentPerPage={currentPerPage}
        currentQuery={currentQuery}
        extraQuery={extraQuery}
      />
    </>
  );
}
