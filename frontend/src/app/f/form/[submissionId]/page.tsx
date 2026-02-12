\"use client\";

import { useEffect, useState } from \"react\";
import { useParams } from \"next/navigation\";
import { publicApi } from \"@/lib/api\";

interface PublicForm {
  id: string;
  name: string;
  status: string;
  fields: { name: string; type: string; label?: string }[];
}

export default function PublicPostBookingFormPage() {
  const params = useParams();
  const submissionId = params.submissionId as string;
  const [form, setForm] = useState<PublicForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(\"\"\);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submissionId) return;
    publicApi<{ id: string; name: string; fields: PublicForm[\"fields\"]; status: string }>(
      `/public/form/${submissionId}`
    )
      .then((data) => {
        setForm({ id: data.id, name: data.name, fields: data.fields ?? [], status: data.status });
      })
      .catch(() => setForm(null))
      .finally(() => setLoading(false));
  }, [submissionId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(\"\");
    try {
      await publicApi(`/public/form/${submissionId}/submit`, {
        method: \"POST\",
        body: JSON.stringify(values),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : \"Something went wrong\");
    }
  }

  if (loading) {
    return (
      <div className=\"flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100\">
        <div className=\"h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent\" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className=\"flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4\">
        <div className=\"rounded-2xl bg-white px-8 py-6 text-center shadow-xl\">
          <p className=\"text-slate-600\">This form is not available.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className=\"flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4\">
        <div className=\"w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl\">
          <div className=\"mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100\">
            <svg className=\"h-8 w-8 text-teal-600\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" strokeWidth={2}>
              <path strokeLinecap=\"round\" strokeLinejoin=\"round\" d=\"M5 13l4 4L19 7\" />
            </svg>
          </div>
          <h1 className=\"mt-6 text-2xl font-semibold text-slate-800\">Form submitted</h1>
          <p className=\"mt-3 text-slate-600\">
            Thanks for completing this form. You can close this page now.
          </p>
        </div>
      </div>
    );
  }

  const isReadOnly = form.status === \"completed\" || form.status === \"overdue\";

  return (
    <div className=\"min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:py-16\">
      <div className=\"mx-auto max-w-lg\">
        <div className=\"rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/50 overflow-hidden\">
          <div className=\"bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-8 text-white flex items-center justify-between\">
            <div>
              <h1 className=\"text-2xl font-bold tracking-tight\">{form.name}</h1>
              <p className=\"mt-1 text-teal-100\">Post-booking form</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                form.status === \"completed\"
                  ? \"bg-emerald-100 text-emerald-800\"
                  : form.status === \"overdue\"
                    ? \"bg-amber-100 text-amber-800\"
                    : \"bg-slate-100 text-slate-700\"
              }`}
            >
              {form.status}
            </span>
          </div>
          <form onSubmit={handleSubmit} className=\"p-8\">
            {error && (
              <div className=\"mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700\">
                {error}
              </div>
            )}
            {isReadOnly && (
              <p className=\"mb-4 text-sm text-slate-500\">
                This form has already been completed. You can review your answers below.
              </p>
            )}
            <div className=\"space-y-6\">
              {form.fields.map((f) => (
                <div key={f.name}>
                  <label className=\"block text-sm font-medium text-slate-700 mb-1.5\">
                    {f.label || f.name}
                  </label>
                  {f.type === \"textarea\" ? (
                    <textarea
                      value={values[f.name] ?? \"\"}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                      className=\"w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition disabled:bg-slate-50 disabled:text-slate-500\"
                      rows={4}
                      disabled={isReadOnly}
                    />
                  ) : (
                    <input
                      type={f.type === \"email\" ? \"email\" : \"text\"}
                      value={values[f.name] ?? \"\"}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                      className=\"w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition disabled:bg-slate-50 disabled:text-slate-500\"
                      disabled={isReadOnly}
                    />
                  )}
                </div>
              ))}
            </div>
            {!isReadOnly && (
              <button
                type=\"submit\"
                className=\"mt-8 w-full rounded-xl bg-teal-600 py-3.5 font-semibold text-white shadow-lg shadow-teal-600/25 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition\"
              >
                Submit form
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

