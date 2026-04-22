const PageHeader = ({ title, description, action }) => (
  <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <h1 className="page-title">{title}</h1>
      <p className="mt-3 max-w-2xl subtle-text">{description}</p>
    </div>
    {action ? <div>{action}</div> : null}
  </div>
);

export default PageHeader;

