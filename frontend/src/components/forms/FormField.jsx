const FormField = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  options = [],
  required = false,
  multiline = false,
  rows = 4
}) => (
  <label className="block">
    <span className="label-text">
      {label}
      {required ? " *" : ""}
    </span>
    {multiline ? (
      <textarea
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-shell resize-none"
      />
    ) : type === "select" ? (
      <select name={name} value={value} onChange={onChange} className="input-shell">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-shell"
      />
    )}
  </label>
);

export default FormField;

