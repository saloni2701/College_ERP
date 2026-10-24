import React from "react";

export default function PageHeader({ title, description }) {
  return (
    <header className="page-header">
      <h1 className="page-title">{title}</h1>
      {description && <p className="page-description">{description}</p>}
    </header>
  );
}
