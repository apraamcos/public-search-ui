
import { useState } from "react";
import "./App.css";

type FormData = {
  title: string;
  writers: string[];
  performers: string[];
  skip: number;
  take: number;
}

type PublisherWithDetails = {
  wrthkey: string;

  name: string;

  isApraMember: boolean;

  isAmcosMember: boolean;
}

type WorkSearchEntityPublic = {
  winfkey: string;

  iswc?: string;

  title: string;
  
  exclWriter: string;

  isDispute: boolean;

  isPdof: boolean;

  isNc: boolean;

  isCisnetExclude: boolean;

  writers?: string[];

  isLocal: boolean;

  workMessage?: string;

  amcosControl?: string;

  akas?: string[];

  publishersWithDetails?: PublisherWithDetails[];

  performers?: string[];
}

type WorkSearchResult = {
  total: number;
  works: Array<WorkSearchEntityPublic>;
};

const initialForm: FormData = {
  title: "",
  writers: [""],
  performers: [""],
  skip: 0,
  take: 20
};

const sha256 = async (message: any) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};


function App() {
  const [formData, setFormData] = useState(initialForm);
  const [result, setResult] = useState<WorkSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: type === "number" ? Number(value) : value });
  };

  const handleAddArrayItem = (field: 'writers' | 'performers') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
  };

  const handleRemoveArrayItem = (field: 'writers' | 'performers', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const query = `
        query WorkSearchPublic($workSearchInput: WorkSearchInputPublic!) {
          workSearchPublic(workSearchInput: $workSearchInput) {
            total
            works { 
              winfkey 
              iswc 
              title 
              writers 
              performers 
              exclWriter 
              isDispute 
              isPdof 
              isNc 
              isCisnetExclude 
              isLocal 
              workMessage 
              amcosControl 
              akas 
              publishersWithDetails { 
                wrthkey 
                name 
                isApraMember 
                isAmcosMember 
              } 
            }
          }
        }
      `;
      
      const input  = {
        ...formData,
        writers: formData.writers.filter(Boolean),
        performers: formData.performers.filter(Boolean)
      };
      
      Object.keys(input).forEach(key => {
        if (
          input[key as keyof FormData] === "" ||
          (Array.isArray(input[key as keyof FormData]) 
            && (input[key as keyof FormData] as Array<any>).length === 0)
        ) {
          delete input[key as keyof FormData];
        }
      });

      const requestBody = JSON.stringify({
        query,
        variables: { workSearchInput: input }
      });

      const res = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-amz-content-sha256": await sha256(requestBody) },
        body: requestBody
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
        <div className="form-row">
          <label>
            Title:
            <input type="text" name="title" value={formData.title} onChange={handleChange} />
          </label>
        </div>
        <div className="form-row">
          <label>
            Skip:
            <input type="number" name="skip" value={formData.skip} onChange={handleChange} min={0} />
          </label>
          <label>
            Take:
            <input type="number" name="take" value={formData.take} onChange={handleChange} min={1} />
          </label>
        </div>
        <div className="group-box">
          <div className="group-box-title">Writers</div>
          {formData.writers.map((v, i) => (
            <div key={i} className="array-item-row">
              <span className="array-item-index">{i + 1}.</span>
              <input
                type="text"
                value={v}
                onChange={e => {
                  const arr = [...formData.writers];
                  arr[i] = e.target.value;
                  setFormData({ ...formData, writers: arr });
                }}
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem("writers", i)}
                disabled={formData.writers.length === 1}
              >
                -
              </button>
              <button type="button" onClick={() => handleAddArrayItem("writers")}>+
              </button>
            </div>
          ))}
        </div>
        <div className="group-box">
          <div className="group-box-title">Performers</div>
          {formData.performers.map((v, i) => (
            <div key={i} className="array-item-row">
              <span className="array-item-index">{i + 1}.</span>
              <input
                type="text"
                value={v}
                onChange={e => {
                  const arr = [...formData.performers];
                  arr[i] = e.target.value;
                  setFormData({ ...formData, performers: arr });
                }}
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem("performers", i)}
                disabled={formData.performers.length === 1}
              >
                -
              </button>
              <button type="button" onClick={() => handleAddArrayItem("performers")}>+
              </button>
            </div>
          ))}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {error && <div className="error">Error: {error}</div>}
      {result && (
        <div className="result">
          <h2>Result</h2>
          <div>Total: {result.total}</div>
          <div className="table-scroll-x">
            <table className="result-table bordered-table">
              <thead>
                <tr>
                  <th>winfkey</th>
                  <th>title</th>
                  <th>writers</th>
                  <th>performers</th>
                  {result.works[0] && Object.keys(result.works[0])
                    .filter(key => !['winfkey', 'title', 'writers', 'performers'].includes(key))
                    .map(key => <th key={key}>{key}</th>)}
                </tr>
              </thead>
              <tbody>
                {result.works.map((work, idx) => (
                  <tr key={idx}>
                    <td>{work.winfkey}</td>
                    <td>{work.title}</td>
                    <td>{Array.isArray(work.writers) && work.writers.length > 3
                      ? `${work.writers.slice(0, 3).join(", ")} and ${work.writers.length - 3} more`
                      : work.writers?.join(", ")}
                    </td>
                    <td>{Array.isArray(work.performers) && work.performers.length > 3
                      ? `${work.performers.slice(0, 3).join(", ")} and ${work.performers.length - 3} more`
                      : work.performers?.join(", ")}
                    </td>
                    {result.works[0] && Object.keys(result.works[0])
                      .filter(key => !['winfkey', 'title', 'writers', 'performers'].includes(key))
                      .map(key => {
                        const value = work[key];
                        if (key === 'publishersWithDetails') {
                          if (Array.isArray(value) && value.length > 0) {
                            return (
                              <td key={key}>
                                {value.map((pub, i) => (
                                  <div key={i}>
                                    {pub.name || '-'}
                                    {pub.isApraMember ? ' (APRA)' : ''}
                                    {pub.isAmcosMember ? ' (AMCOS)' : ''}
                                  </div>
                                ))}
                              </td>
                            );
                          } else {
                            return <td key={key}>-</td>;
                          }
                        } else if (Array.isArray(value)) {
                          return <td key={key}>{value.join(", ")}</td>;
                        } else if (typeof value === 'object' && value !== null) {
                          return <td key={key}>{JSON.stringify(value)}</td>;
                        } else if (value === null || value === undefined || value === "") {
                          return <td key={key}>-</td>;
                        } else {
                          return <td key={key}>{String(value)}</td>;
                        }
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
