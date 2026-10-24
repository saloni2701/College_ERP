import React from "react";

export default function Panel({ title, children, className = "" }) {
  return (
    <section className={`panel ${className}`.trim()}>
      {title && (
        <div className="panel-header">
          <h2 className="panel-title">{title}</h2>
        </div>
      )}
      <div className="panel-body">{children}</div>
    </section>
  );
}
