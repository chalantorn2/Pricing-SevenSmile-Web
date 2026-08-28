import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useI18n } from "../../i18n";
import { useNavigate } from "react-router-dom";
import { Palmtree, Globe } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Language toggle — the choice is saved before signing in */}
          <div className="flex justify-end mb-2">
            <div
              className="inline-flex rounded-lg bg-gray-100 p-0.5"
              role="group"
              aria-label={t("lang.switch")}
            >
              {["th", "en"].map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                    lang === code
                      ? "bg-white text-brand-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {code === "th" ? t("lang.thai") : t("lang.english")}
                </button>
              ))}
            </div>
          </div>

          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600 text-white mb-3">
              <Palmtree className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-brand-600 mb-1">
              Contract Rate
            </h1>
            <p className="text-gray-500">{t("login.subtitle")}</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("login.username")}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                placeholder={t("login.usernamePlaceholder")}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("login.password")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                placeholder={t("login.passwordPlaceholder")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 text-white py-3 px-4 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? t("login.signingIn") : t("login.signIn")}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-center gap-1.5 text-sm text-gray-500">
            <Globe className="w-3.5 h-3.5 text-gray-400" />
            <p>Contract Rate System</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
