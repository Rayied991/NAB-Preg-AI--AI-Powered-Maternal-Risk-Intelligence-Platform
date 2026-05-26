export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold mb-6">
        NAB Preg AI Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-zinc-900 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold">
            High Risk Cases
          </h2>

          <p className="text-4xl mt-4 text-red-500">
            12
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold">
            Medium Risk
          </h2>

          <p className="text-4xl mt-4 text-yellow-400">
            28
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold">
            Low Risk
          </h2>

          <p className="text-4xl mt-4 text-green-500">
            45
          </p>
        </div>

      </div>
    </div>
  );
}