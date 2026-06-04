import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EngineProvider } from "@statelab/state-engines";
import { Layout } from "@statelab/ui";
import { PublicRoute, ProtectedRoute, PrivateRoute } from "./components/RouteWrappers";
import { featureRegistry } from "./featureRegistry";

function App() {
  return (
    <EngineProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout links={featureRegistry.filter((r) => r.sidebar)} />}>
            {featureRegistry.map((route) => {
              const Component = route.element;
              
              let routeElement = <Component />;
              if (route.access === "public-redirect-login") {
                routeElement = <PublicRoute><Component /></PublicRoute>;
              } else if (route.access === "protected") {
                routeElement = <ProtectedRoute><Component /></ProtectedRoute>;
              } else if (route.access === "private") {
                routeElement = <PrivateRoute><Component /></PrivateRoute>;
              }

              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={routeElement}
                />
              );
            })}
          </Route>
        </Routes>
      </BrowserRouter>
    </EngineProvider>
  );
}

export default App;
