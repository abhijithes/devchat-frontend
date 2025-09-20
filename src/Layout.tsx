import { Outlet } from "react-router-dom";
const Layout = () => {
  return (
    <main>
      <header>header</header>
      <aside>aside</aside>
      <main>
        <Outlet />
      </main>
      <footer>footer</footer>
    </main>
  );
};

export default Layout;
