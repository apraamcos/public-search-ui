import { useState } from "react";
import "./App.css";

type FormData = {
  title: string;
  titleInputType: string;
  winfkey: string;
  iswc: string;
  ipi: string;
  writers: string[];
  publishers: string[];
  performers: string[];
  catalogueNo: string;
  skip: number;
  take: number;
}

const initialForm: FormData = {
  title: "",
  titleInputType: "StartWith",
  winfkey: "",
  iswc: "",
  ipi: "", 
  writers: [""],
  publishers: [""],
  performers: [""],
  catalogueNo: "",
  skip: 0,
  take: 20
};

const titleInputTypeOptions = [
  { value: "StartWith", label: "Start With" },
  { value: "Contained", label: "Contained" },
  { value: "Exact", label: "Exact" }
];

function App() {
  const [formData, setFormData] = useState(initialForm);
  const [result, setResult] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: type === "number" ? Number(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const query = `
        query WorkSearchPublic($workSearchInput: WorkSearchInput!) {
          workSearchPublic(workSearchInput: $workSearchInput) {
            total
            works { winfkey title writers }
          }
        }
      `;
      // 只保留有值的字段
      const input  = {
        ...formData,
        writers: formData.writers.filter(Boolean).map(name => ({ nameKeyword: name })),
        publishers: formData.publishers.filter(Boolean).map(name => ({ nameKeyword: name })),
        performers: formData.performers.filter(Boolean).map(name => ({ nameKeyword: name }))
      };
      // 移除值为 "" 的字段
      Object.keys(input).forEach(key => {
        if (
          input[key as keyof FormData] === "" ||
          (Array.isArray(input[key as keyof FormData]) && input[key as keyof FormData].length === 0)
        ) {
          delete input[key as keyof FormData];
        }
      });

      const res = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { workSearchInput: input } })
      });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0].message);
      setResult(json.data.workSearchPublic);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Work Public Search</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Title:
          <input type="text" name="title" value={formData.title} onChange={handleChange} />
        </label>
        <label>
          Title Input Type:
          <select name="titleInputType" value={formData.titleInputType} onChange={handleChange}>
            {titleInputTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          APRA Work ID (winfkey):
          <input type="text" name="winfkey" value={formData.winfkey} onChange={handleChange} />
        </label>
        <label>
          ISWC:
          <input type="text" name="iswc" value={formData.iswc} onChange={handleChange} />
        </label>
        <label>
          IPI:
          <input
            type="text"
            name="ipi"
            value={formData.ipi}
            onChange={handleChange}
          />
        </label>
        <div>
          <label>Writers:</label>
          {formData.writers.map((v, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={v}
                onChange={e => handleChange(e)}
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem("writers", i)}
                disabled={formData.writers.length === 1}
              >
                -
              </button>
              <button type="button" onClick={() => handleAddArrayItem("writers")}>
                +
              </button>
            </div>
          ))}
        </div>
        <div>
          <label>Publishers:</label>
          {formData.publishers.map((v, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={v}
                onChange={e => handleChange(e)}
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem("publishers", i)}
                disabled={formData.publishers.length === 1}
              >
                -
              </button>
              <button type="button" onClick={() => handleAddArrayItem("publishers")}>
                +
              </button>
            </div>
          ))}
        </div>
        <div>
          <label>Performers:</label>
          {formData.performers.map((v, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={v}
                onChange={e => handleChange(e)}
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem("performers", i)}
                disabled={formData.performers.length === 1}
              >
                -
              </button>
              <button type="button" onClick={() => handleAddArrayItem("performers")}>
                +
              </button>
            </div>
          ))}
        </div>
        <label>
          Catalogue No:
          <input
            type="text"
            name="catalogueNo"
            value={formData.catalogueNo}
            onChange={handleChange}
          />
        </label>
        <label>
          Skip:
          <input type="number" name="skip" value={formData.skip} onChange={handleChange} min={0} />
        </label>
        <label>
          Take:
          <input type="number" name="take" value={formData.take} onChange={handleChange} min={1} />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {error && <div className="error">Error: {error}</div>}
      {result && (
        <div className="result">
          <h2>Result</h2>
          <div>Total: {result.total}</div>
          <pre>{JSON.stringify(result.works, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
