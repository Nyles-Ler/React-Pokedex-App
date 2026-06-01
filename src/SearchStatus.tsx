import React from "react";

type SearchStatus = {
  status: string;
};

export default function StatusMessage({ status }: SearchStatus) {
  return (
    <div id="status">
      {status === "Loading..." ? <div className="spinner"></div> : status}
    </div>
  );
}
