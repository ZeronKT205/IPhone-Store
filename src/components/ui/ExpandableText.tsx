"use client";

import { useState } from "react";
import { DESCRIPTION_PREVIEW_CHARS } from "@/constants/config";

interface ExpandableTextProps {
  text: string;
  maxChars?: number;
}

export default function ExpandableText({
  text,
  maxChars = DESCRIPTION_PREVIEW_CHARS,
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= maxChars) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {expanded ? text : `${text.slice(0, maxChars)}...`}
      <button
        onClick={() => setExpanded(!expanded)}
        className="ml-1 text-xs font-medium underline underline-offset-2"
        style={{ color: "var(--color-brand)" }}
      >
        {expanded ? "Thu gọn" : "Xem thêm"}
      </button>
    </span>
  );
}
