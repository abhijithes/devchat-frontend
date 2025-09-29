export const Start = () => {
  return (
    <div className="min-h-screen  text-gray-900 p-6">
      <div className="max-w-4xl mx-auto   rounded-lg p-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-black">DevManager</h1>
          <p className="text-lg mt-2 text-gray-600">
            Task management built specifically for developers.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <ul className="space-y-2 list-disc list-inside text-gray-700">
            <li>Create and manage development tasks with tags and priorities</li>
            <li>Organize work by projects, sprints, and milestones</li>
            <li>Track progress using Kanban board views</li>
            <li>Integrated Pomodoro timer for focused productivity</li>
            <li>Clean, developer-friendly interface with dark mode support</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Quick Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg bg-gray-50">
              <label className="block font-medium mb-2">Theme</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500">
                <option>Light</option>
                <option>Dark</option>
                <option>System Default</option>
              </select>
            </div>

            <div className="p-4 border rounded-lg bg-gray-50">
              <label className="block font-medium mb-2">Notification Sound</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500">
                <option>Default</option>
                <option>Chime</option>
                <option>Pop</option>
                <option>Silent</option>
              </select>
            </div>
          </div>
        </section>

        <div className="text-center mt-12">
          <button className="bg-black text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-blue-800 transition">
            Start Using DevManager
          </button>
        </div>

        <footer className="text-center text-sm text-gray-500 mt-12">
          © {new Date().getFullYear()} DevManager. All rights reserved.
        </footer>
      </div>
    </div>
  )
};
